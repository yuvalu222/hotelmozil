# Drive the Instagram app inside the local Android emulator (17.10).
# The only place Instagram lets a photo carousel carry music, and music is
# what makes a carousel eligible for the Reels tab (owner's iron rule: no post
# without music, and an Instagram deck is a swipeable carousel, never a video).
#
#   python social/emu.py ui                 list on-screen elements
#   python social/emu.py shot <out.png>     screenshot
#   python social/emu.py tap "<text>"       tap the element whose text/desc matches
#   python social/emu.py wait "<text>" [s]  wait until the text appears
import os, re, subprocess, sys, time
sys.stdout.reconfigure(encoding='utf-8')

ADB = r'C:\hmand\sdk\platform-tools\adb.exe'
ENV = dict(os.environ, MSYS_NO_PATHCONV='1')
# direction marks Android puts around app names; built from code points, never typed
BIDI = '[' + chr(0x200E) + chr(0x200F) + chr(0x202A) + '-' + chr(0x202E) + chr(0x2066) + '-' + chr(0x2069) + ']'


def adb(*args, check=True, capture=True):
    r = subprocess.run([ADB, *args], capture_output=capture, env=ENV)
    if check and r.returncode:
        raise RuntimeError(f'adb {" ".join(args)}: {r.stderr.decode(errors="replace")[:300]}')
    return r.stdout


def ui():
    """Every element with text or content-desc: [(label, x, y, x0, y0, x1, y1, clickable)]."""
    for _ in range(3):
        adb('shell', 'uiautomator', 'dump', '/sdcard/ui.xml', check=False)
        xml = adb('shell', 'cat', '/sdcard/ui.xml', check=False).decode('utf-8', errors='replace')
        if '<hierarchy' in xml:
            break
        time.sleep(1.5)
    out = []
    for m in re.finditer(r'<node [^>]*>', xml):
        n = m.group(0)
        t = re.search(r' text="([^"]*)"', n).group(1)
        d = re.search(r'content-desc="([^"]*)"', n).group(1)
        b = re.search(r'bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"', n)
        if not b or not (t or d):
            continue
        x0, y0, x1, y1 = map(int, b.groups())
        label = re.sub(BIDI, '', t or d)
        out.append((label, (x0 + x1) // 2, (y0 + y1) // 2, x0, y0, x1, y1, 'clickable="true"' in n))
    return out


def find(pattern, exact=False):
    rx = re.compile(pattern if not exact else '^' + re.escape(pattern) + '$')
    return [e for e in ui() if rx.search(e[0])]


def tap_xy(x, y, pause=1.5):
    adb('shell', 'input', 'tap', str(x), str(y))
    time.sleep(pause)


def tap(pattern, exact=False, pause=2.0, index=0):
    hits = find(pattern, exact)
    if not hits:
        raise RuntimeError(f'not on screen: {pattern}')
    e = hits[index]
    tap_xy(e[1], e[2], pause)
    return e


def wait(pattern, timeout=60, exact=False):
    end = time.time() + timeout
    while time.time() < end:
        anr = find('לא מגיבה|isn.t responding')
        if anr:
            w = find('^(להמתין|Wait)$')
            if w:
                tap_xy(w[0][1], w[0][2], 3)
        hits = find(pattern, exact)
        if hits:
            return hits[0]
        time.sleep(2)
    raise RuntimeError(f'timeout waiting for: {pattern}')


def shot(path):
    png = adb('shell', 'screencap', '-p')
    png = png.replace(b'\r\n', b'\n') if png[:8] != b'\x89PNG\r\n\x1a\n' else png
    with open(path, 'wb') as f:
        f.write(png)


def type_text(s):
    special = set('\\ ()<>|;&*~"\'`$?#!{}[]%^')
    esc = ''.join(('\\' + ch) if ch in special else ch for ch in s)
    adb('shell', 'input', 'text', esc)


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'ui':
        for e in ui():
            print(e[0][:60], e[1], e[2], 'C' if e[7] else '')
    elif cmd == 'shot':
        shot(sys.argv[2])
    elif cmd == 'tap':
        print(tap(sys.argv[2]))
    elif cmd == 'wait':
        print(wait(sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 60))
