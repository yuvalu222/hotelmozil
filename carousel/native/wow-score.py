# WOW scorer (16.10). Ranks every pool photo the way a person would, before
# any eye review. Two signals on the same CLIP ViT-L/14 embedding:
#   aes  LAION improved-aesthetic-predictor v2 (trained on AVA + SAC + logos),
#        the de-facto open model for "how beautiful does a person find this"
#   awe  CLIP zero-shot: similarity to "dream" prompts minus "ordinary" prompts,
#        written from the owner's own WOW photos (vivid sunsets over sea,
#        turquoise water ringed by limestone cliffs, infinity pools)
# wow = z(aes) + z(awe). Cached per photo id (pool/wow.json).
#   python native/wow-score.py                 score everything new in the pool
#   python native/wow-score.py --files a.jpg b.jpg   score arbitrary files
import json, os, sys, urllib.request
sys.stdout.reconfigure(encoding='utf-8')
import torch, open_clip
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, 'pool', 'wow.json')
W_URL = 'https://github.com/christophschuhmann/improved-aesthetic-predictor/raw/main/sac+logos+ava1-l14-linearMSE.pth'
W_FILE = os.path.join(HERE, 'models', 'sac+logos+ava1-l14-linearMSE.pth')

POS = ['a breathtaking dreamlike photo of a tropical beach at sunset with a pink and orange sky',
       'a stunning turquoise lagoon surrounded by dramatic limestone cliffs, travel photography',
       'an awe-inspiring aerial drone photo of a paradise island with crystal clear water',
       'a jaw-dropping sunset over the sea with silhouettes of palm trees',
       'a luxury infinity pool overlooking the ocean at golden hour',
       'a viral travel photo that makes you want to book a flight immediately']
NEG = ['an ordinary snapshot of a beach on a cloudy day',
       'a dull, flat, overcast photo',
       'a boring photo of a street or a building',
       'a blurry low quality phone photo',
       'a stock photo of a product on a white background']

class MLP(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = torch.nn.Sequential(
            torch.nn.Linear(768, 1024), torch.nn.Dropout(0.2), torch.nn.Linear(1024, 128), torch.nn.Dropout(0.2),
            torch.nn.Linear(128, 64), torch.nn.Dropout(0.1), torch.nn.Linear(64, 16), torch.nn.Linear(16, 1))
    def forward(self, x): return self.layers(x)

def load():
    os.makedirs(os.path.dirname(W_FILE), exist_ok=True)
    if not os.path.exists(W_FILE):
        urllib.request.urlretrieve(W_URL, W_FILE)
    model, _, pre = open_clip.create_model_and_transforms('ViT-L-14', pretrained='openai')
    model.eval(); tok = open_clip.get_tokenizer('ViT-L-14')
    mlp = MLP(); mlp.load_state_dict(torch.load(W_FILE, map_location='cpu')); mlp.eval()
    with torch.no_grad():
        t = model.encode_text(tok(POS + NEG)); t = t / t.norm(dim=-1, keepdim=True)
    return model, pre, mlp, t[:len(POS)], t[len(POS):]

@torch.no_grad()
def score(paths, M):
    model, pre, mlp, tp, tn = M
    out = {}
    B = 8
    for i in range(0, len(paths), B):
        batch, ok = [], []
        for p in paths[i:i + B]:
            try: batch.append(pre(Image.open(p).convert('RGB'))); ok.append(p)
            except Exception: pass
        if not batch: continue
        e = model.encode_image(torch.stack(batch)); e = e / e.norm(dim=-1, keepdim=True)
        aes = mlp(e).squeeze(1)
        awe = (e @ tp.T).mean(1) - (e @ tn.T).mean(1)
        for p, a, w in zip(ok, aes.tolist(), awe.tolist()):
            out[p] = {'aes': round(a, 3), 'awe': round(w * 100, 3)}
        print(f'{min(i + B, len(paths))}/{len(paths)}', end='\r', flush=True)
    print()
    return out

if __name__ == '__main__':
    torch.set_num_threads(os.cpu_count())
    M = load()
    if '--files' in sys.argv:
        files = sys.argv[sys.argv.index('--files') + 1:]
        for p, s in score(files, M).items(): print(s['aes'], s['awe'], p)
        sys.exit()
    pool = json.load(open(os.path.join(HERE, 'pool', 'pool.json'), encoding='utf-8'))
    cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
    todo = [i for i in pool if i not in cache and os.path.exists(os.path.join(HERE, 'pool', 'thumbs', i + '.jpg'))]
    res = score([os.path.join(HERE, 'pool', 'thumbs', i + '.jpg') for i in todo], M)
    for i in todo:
        r = res.get(os.path.join(HERE, 'pool', 'thumbs', i + '.jpg'))
        if r: cache[i] = r
    json.dump(cache, open(CACHE, 'w'))
    print('scored', len(cache))
