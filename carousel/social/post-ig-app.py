# Post a deck to Instagram as a swipeable photo carousel WITH music, through
# the Instagram app in the local Android emulator (17.10).
#
# Why the app: music on a carousel exists only in the Instagram app (not on
# instagram.com, not in Meta's API). Music is what makes a carousel eligible to
# appear between Reels for people who don't follow us (Instagram, Oct 2024).
# Owner's iron rules: no post without music; an Instagram deck is a swipeable
# carousel, never a video. The first post through this route: DemZO05DuVp.
#
# DRY RUN by default: everything up to the share screen, then backs out.
# --post shares, only after the owner said go for that deck.
#
#   python social/post-ig-app.py <ig-folder 4:5> --caption-file <txt> --music "<search>" --artist "<name>" [--post]
#
# Needs: emulator hm34 running with Instagram logged in as hotelmozil_app
# (start: emulator -avd hm34 -gpu host -no-audio; software GPU freezes the app).
import argparse, glob, os, re, subprocess, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import emu

ap = argparse.ArgumentParser()
ap.add_argument('folder')
ap.add_argument('--caption-file', required=True)
ap.add_argument('--music', required=True, help='search text for the Instagram music library')
ap.add_argument('--artist', required=True, help='artist name the chosen track must show')
ap.add_argument('--post', action='store_true')
a = ap.parse_args()

slides = sorted(glob.glob(os.path.join(a.folder, '[0-9][0-9].jpg')))
if not 2 <= len(slides) <= 20:
    sys.exit(f'need 2-20 slides, got {len(slides)}')
caption = open(a.caption_file, encoding='utf-8').read().strip()
if re.search('[' + chr(0x0600) + '-' + chr(0x06FF) + ']', caption + a.music):
    sys.exit('Arabic in caption or music: refused')
if len(re.findall(r'#\S+', caption)) != 5:
    sys.exit('caption must carry exactly 5 hashtags')


def unstick():
    for _ in range(6):
        if emu.find('לא מגיבה'):
            w = emu.find('^להמתין$')
            if w:
                emu.tap_xy(w[0][1], w[0][2], 8)
        else:
            return


def labels():
    return [e[0] for e in emu.ui()]


# 1. the gallery holds this deck only, newest = slide 1
emu.adb('shell', 'rm', '-rf', '/sdcard/Pictures/hm_deck')
for old in ('/sdcard/Pictures/hm_traps',):
    emu.adb('shell', 'rm', '-rf', old, check=False)
emu.adb('shell', 'mkdir', '-p', '/sdcard/Pictures/hm_deck')
for i, s in enumerate(reversed(slides)):
    n = len(slides) - i
    emu.adb('push', s, f'/sdcard/Pictures/hm_deck/deck_{n:02d}.jpg')
    emu.adb('shell', 'content', 'call', '--uri', 'content://media', '--method', 'scan_volume', '--arg', 'external_primary', check=False)
    time.sleep(1.2)
time.sleep(3)

# 2. home -> new post
emu.adb('shell', 'am', 'force-stop', 'com.instagram.android')
emu.adb('shell', 'monkey', '-p', 'com.instagram.android', '-c', 'android.intent.category.LAUNCHER', '1')
time.sleep(15); unstick()
# first-run prompts (contacts, location, notifications, save login): decline or skip each
for _ in range(10):
    unstick()
    l = labels()
    if 'בית' in l and 'פרופיל' in l and not any(x in l for x in ('דילוג', 'אין אישור', 'לא עכשיו')):
        break
    for b in ('^דילוג$', '^אין אישור$', '^לא עכשיו$', '^המשך$'):
        if emu.find(b):
            emu.tap(b, pause=4)
            break
    time.sleep(2)
emu.tap_xy(1015, 202, 6); unstick()
emu.wait('^פוסט חדש$', 60)

# 3. multi-select. The accessibility labels lag behind the screen, so a
# selection is read from the screenshot: the blue number badge in a tile's
# top-left corner.
from PIL import Image
shotp = os.path.join(os.environ['TEMP'], 'emu_sel.png')
def badges(tiles):
    emu.shot(shotp)
    im = Image.open(shotp).convert('RGB')
    out = []
    for e in tiles:
        reg = im.crop((e[3] + 15, e[4] + 15, e[3] + 95, e[4] + 95))
        out.append(sum(1 for r, g, b in reg.getdata() if b > 200 and r < 120 and g < 140) > 800)
    return out

thumbs = lambda: sorted([e for e in emu.ui() if 'מדיה מסוג תמונה ממוזערת של תמונה' in e[0]], key=lambda e: (e[2] // 40, -e[1]))
t = thumbs()
if len(t) < len(slides):
    sys.exit(f'gallery shows {len(t)} photos, expected {len(slides)}')
t = t[:len(slides)]
emu.tap_xy(t[0][1], t[0][2], 3)          # slide 1 becomes the preview
multi = lambda: any(e[0] == 'ביטול' and e[2] > 1300 for e in emu.ui())
for _ in range(4):
    if multi():
        break
    bt = [e for e in emu.ui() if e[0] == 'בחירה' and e[2] > 1300]
    if bt:
        emu.tap_xy(bt[0][1], bt[0][2], 4)
if not multi():
    sys.exit('multi-select did not turn on')
time.sleep(2)
if not badges(t)[0]:
    emu.tap_xy(t[0][1], t[0][2], 3)
st = badges(t)
if st[0] is not True or any(st[1:]):
    sys.exit(f'selection is not "slide 1 only" before adding the rest: {st}')
for e in t[1:]:
    emu.tap_xy(e[1], e[2], 2.5)
time.sleep(2)
st = badges(t)
if not all(st):
    sys.exit(f'not every slide is selected: {st}: stopping before anything is posted')
print('selected', len(st), 'slides in order')

# 4. editor -> music
emu.tap('^הבא$', pause=10); unstick()
emu.wait('^שמע$', 120)
emu.tap_xy(972, 2051, 8); unstick()
emu.tap('^חיפוש', pause=3)
emu.type_text(a.music)
emu.adb('shell', 'input', 'keyevent', '66'); time.sleep(8); unstick()
pick = [e for e in emu.ui() if e[0].startswith('בחירת הרצועה') and a.artist.lower() in e[0].lower()]
if not pick:
    sys.exit(f'no track by {a.artist} for "{a.music}": refused (no post without music)')
emu.adb('shell', 'input', 'keyevent', '4'); time.sleep(1)  # close the keyboard so the tap lands
pick = [e for e in emu.ui() if e[0].startswith('בחירת הרצועה') and a.artist.lower() in e[0].lower()]
emu.tap_xy(pick[0][1], pick[0][2], 10); unstick()
print('track:', pick[0][0])

# 5. caption (Hebrew through the clipboard the emulator shares with Windows)
for _ in range(4):
    if emu.find('^שיתוף$'):
        break
    nx = emu.find('^הבא$')
    if nx:
        emu.tap_xy(nx[0][1], nx[0][2], 8)
    unstick()
    try:
        emu.wait('^שיתוף$', 40)
    except RuntimeError:
        pass
if not emu.find('^שיתוף$'):
    sys.exit('never reached the share screen')
for b in ('^אישור$',):
    if emu.find(b) and not emu.find('הוספת כיתוב'):
        emu.tap(b, pause=4)
cf = os.path.join(os.environ['TEMP'], 'ig_caption.txt')
open(cf, 'w', encoding='utf-8').write(caption)
subprocess.run(['powershell', '-NoProfile', '-Command', f"Get-Content -LiteralPath '{cf}' -Raw -Encoding UTF8 | Set-Clipboard"], check=True)
time.sleep(2)
emu.tap('^הוספת כיתוב', pause=3)
emu.adb('shell', 'input', 'keyevent', '279'); time.sleep(3)
for _ in range(4):
    if emu.find('^שיתוף$') and not emu.find('^כיתוב$'):
        break
    ok = [e for e in emu.ui() if e[0] == 'אישור' and e[2] < 400]
    if ok:
        emu.tap_xy(ok[0][1], ok[0][2], 5)
    time.sleep(2)

# 6. gates on the share screen
l = labels()
if a.artist not in ' '.join(l):
    sys.exit('music row missing on the share screen: refused')
if not any(caption.split('\n')[0][:12] in x for x in l):
    sys.exit('caption missing on the share screen: refused')
emu.shot(os.path.join(a.folder, '_ig_app_share.png'))
print('share screen ok: music + caption present')

if not a.post:
    print('DRY RUN: not shared. Backing out.')
    for _ in range(5):
        if emu.find('^להתחיל מחדש$'):          # discard the draft, never save it
            emu.tap('^להתחיל מחדש$', pause=3)
            break
        emu.adb('shell', 'input', 'keyevent', '4'); time.sleep(3)
    emu.adb('shell', 'am', 'force-stop', 'com.instagram.android')
    sys.exit(0)

emu.tap('^שיתוף$', pause=10)
end = time.time() + 600
while time.time() < end:
    unstick()
    l = labels()
    if any('פורסם' in x for x in l):
        print('POSTED'); break
    if any('נכשל' in x or 'לא ניתן' in x for x in l):
        sys.exit('Instagram reported a failure: ' + ' | '.join(x for x in l if 'נכשל' in x or 'לא ניתן' in x))
    time.sleep(10)
else:
    sys.exit('no "posted" confirmation within 10 minutes')
