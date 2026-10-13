# Review page: each new deck above the post of his that it copies.
import glob, json, os
DST = 'C:/Users/Yuval/Desktop/HotelMozil-TikTok'
OWN = 'C:/Users/Yuval/Desktop/hotelmozil-site/carousel/harvest/own-full'
items = {x['id']: x for x in json.load(open(OWN + '/items.json', encoding='utf-8'))}
rows = [('n1-thailand-tips-part2', '10 טיפים לתאילנד, חלק 2', '7675637726456073493'),
        ('n3-forbidden-thailand', 'דברים שאסור לעשות בתאילנד', '7676865634118110484'),
        ('n4-route-two-weeks', 'מסלול מושלם לשבועיים בתאילנד', '7680247925468957972'),
        ('n5-places-not-to-miss', '4 המקומות שאסור לפספס בתאילנד', '7677199779247508757'),
        ('n6-tourist-traps', 'מלכודות תיירים בתאילנד ולאן הולכים במקום', 'travel.destinations7-7536621547851631904'),
        ('n7-islands-underrated', 'מהכי פחות תיירותי להכי אנדרייטד', 'berigold-7536886752477285654'),
        ('n8-only-hotel', 'המלון היחיד שצריך בתאילנד', 'architinerary-7626837497342954774'),
        ('n9-not-a-tourist', 'דברים קטנים כדי לא להיראות תייר', 'italianinspo-7436610520557440287'),
        ('n10-photo-spots', 'המקומות הכי שווים לתמונות בקראבי ופיפי', 'travellingcloset1-7533911575296527638')]
SRC = 'C:/Users/Yuval/Desktop/hotelmozil-site/carousel/harvest/sources'
u = lambda p: 'file:///' + os.path.abspath(p).replace(os.sep, '/')
h = ['<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>5 קרוסלות חדשות</title><style>body{margin:0;padding:20px 16px;background:#111;color:#eee;font:15px/1.5 system-ui}h1{margin:0 0 4px}h2{margin:28px 0 6px;font-size:19px}.m{color:#aaa;margin:0 0 8px}.row{display:flex;gap:8px;overflow-x:auto;padding-bottom:8px}.row img{height:330px;border-radius:8px;flex:none}.lab{color:#8bd;font-size:13px;margin:6px 0 4px}</style><h1>8 קרוסלות, אחרי התיקונים</h1><p class="m">בכל דק: השורה העליונה היא הדק החדש, והתחתונה היא הפוסט שלך שהוא מעתיק. הקבצים להעלאה ב-HotelMozil-TikTok, בתיקיות n1 עד n10. 1-5 מעתיקים פוסטים שלך, 6-10 מעתיקים פוסטים מצליחים של יוצרים אחרים.</p>']
for d, title, src in rows:
    new = sorted(glob.glob(DST + '/' + d + '/*.jpg'))
    if not new:
        continue
    if src not in items:
        pj = json.load(open(f'{SRC}/{src}/post.json', encoding='utf-8'))
        h.append(f'<h2>{title}</h2><div class="lab">חדש ({len(new)} שקופיות)</div><div class="row">' + ''.join(f'<img src="{u(f)}">' for f in new) + '</div>')
        h.append(f'<div class="lab">המקור (יוצר אחר, @{pj["handle"]}): {pj["plays"]:,} צפיות</div><div class="row">' + ''.join(f'<img src="{u(f)}">' for f in sorted(glob.glob(f'{SRC}/{src}/[0-9][0-9].jpg'))[:12]) + '</div>')
        continue
    x = items[src]
    h.append(f'<h2>{title}</h2><div class="lab">חדש ({len(new)} שקופיות)</div><div class="row">' + ''.join(f'<img src="{u(f)}">' for f in new) + '</div>')
    h.append(f'<div class="lab">המקור שלך: {x["views"]:,} צפיות, {x["saves"]:,} שמירות</div><div class="row">' + ''.join(f'<img src="{u(f)}">' for f in sorted(glob.glob(OWN + '/' + src + '/*.jpg'))) + '</div>')
open(DST + '/review-native.html', 'w', encoding='utf-8').write(''.join(h))
