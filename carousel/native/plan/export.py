# Export a rendered 4K deck to the owner's upload folder with caption.txt.
#   python native/plan/export.py <deck>
# Reads research/<deck>.json: out, title, tags (5), music, format_source.
import json, os, sys, glob, shutil, subprocess
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
deck = sys.argv[1]
R = json.load(open(os.path.join(HERE, 'research', f'{deck}.json'), encoding='utf-8'))
assert len(R['tags']) == 5, 'exactly 5 hashtags'
dst = os.path.join(os.path.expanduser('~'), 'Desktop', 'HotelMozil-TikTok', R['out'])
os.makedirs(dst, exist_ok=True)
for f in glob.glob(os.path.join(dst, '[0-9][0-9].jpg')): os.remove(f)
fs = sorted(glob.glob(os.path.join(HERE, 'out', f'{deck}-4k', '[0-9][0-9].jpg')))
for f in fs: shutil.copy(f, dst)
src = R['format_source'].split()[0].lstrip('@'); pid = R['format_source'].split()[1]
txt = (f"כותרת:\n{R['title']}\n\n"
       f"האשטאגים (5, נמדדו בטיקטוק):\n{' '.join('#' + t for t in R['tags'])}\n\n"
       f"מוזיקה מוצעת: {R['music']}\n\n"
       f"הפורמט שהדק הזה מעתיק: tiktok.com/@{src}/photo/{pid}\n\n"
       f"{len(fs)} שקופיות, 4K. האחרונה היא צילום המסך שלך מתיקיית האייפון, כמו שהוא.\n")
open(os.path.join(dst, 'caption.txt'), 'w', encoding='utf-8').write(txt)
subprocess.run(['python', os.path.join(HERE, 'view.py'), dst, R['title']], check=True)
print(dst, len(fs))
