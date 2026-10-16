# Simple full-size viewer page for one deck folder: python native/view.py <folder> "<title>"
import glob, os, sys
D, title = sys.argv[1], sys.argv[2]
fs = sorted(glob.glob(os.path.join(D, '[0-9][0-9].jpg')))
u = lambda p: 'file:///' + os.path.abspath(p).replace(os.sep, '/')
h = ('<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><title>' + title + '</title>'
     '<style>body{margin:0;padding:20px 16px;background:#111;color:#eee;font:15px system-ui}h1{margin:0 0 12px;font-size:20px}'
     '.row{display:flex;gap:10px;overflow-x:auto}.row img{height:640px;border-radius:10px;flex:none}</style>'
     '<h1>' + title + '</h1><div class="row">' + ''.join(f'<img src="{u(f)}">' for f in fs) + '</div>')
open(os.path.join(D, 'view.html'), 'w', encoding='utf-8').write(h)
