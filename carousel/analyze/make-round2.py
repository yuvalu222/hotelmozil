# Build the round-two specs.
#
# Ten decks, ten mechanics, written as data so the shared rules are applied in
# one place rather than retyped ten times: no slide numbers, the hotel line
# closing every deck, and image queries that ask for light and life instead of
# a bare place name.
#
#   python analyze/make-round2.py

import json, pathlib, io, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = pathlib.Path(__file__).resolve().parent.parent
C = chr
CHECK = C(0x2705)
PIN = C(0x1F4CD)

TIP_LINES = ["לבדוק מלונות בבוקינג ובאגודה",
             "וחובה: לבדוק אם אפשר להוזיל אותם",
             "באפליקציית HotelMozil"]


def gem_cover(title_lines, sub, query):
    return {"layout": "tt-gem-cover", "titleLines": title_lines, "sub": sub,
            "alt": " ".join(title_lines), "image": {"query": query}}


def gem(place, lines, query, pin=PIN + " "):
    return {"layout": "tt-gem", "pin": pin, "place": place, "lines": lines,
            "alt": place, "image": {"query": query}}


def tip_slide(query):
    return gem("ולפני שמזמינים", TIP_LINES, query, pin=CHECK + " ")


def spec(sid, cloned, title, caption, tags, why, slides, sound=None):
    d = dict(cloned)
    d.update({
        "id": sid, "skin": "clone", "platform": "tiktok",
        "demonstrates": why, "caption": caption, "hashtags": tags,
        "sound": sound or "בחר סאונד טרנדי ביום ההעלאה.",
        "slides": slides,
    })
    (ROOT / "specs" / f"{sid}.json").write_text(
        json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return sid, len(slides)


WABI = {"clonedFrom": "tt-7608957319065488661",
        "clonedUrl": "https://www.tiktok.com/@wabisabi.trips.japan/photo/7608957319065488661",
        "clonedAccount": "wabisabi.trips.japan",
        "sourceLikes": 259900, "sourceSaves": 113400, "sourceSlides": 6,
        "sourceCaption": "These real places inspired some of the most unforgettable moments in anime"}
MENDEZ = {"clonedFrom": "tt-7652482196313328928",
          "clonedUrl": "https://www.tiktok.com/@mendezsan_/photo/7652482196313328928",
          "clonedAccount": "mendezsan_",
          "sourceLikes": 201600, "sourceSaves": 106000, "sourceSlides": 13,
          "sourceCaption": "Part 2 - Some of the best things you can buy in Japan before heading home"}
THALEA = {"clonedFrom": "tt-7594993883558186262",
          "clonedUrl": "https://www.tiktok.com/@thaleadesign/photo/7594993883558186262",
          "clonedAccount": "thaleadesign",
          "sourceLikes": 678100, "sourceSaves": 244000, "sourceSlides": 8,
          "sourceCaption": "For my girls, save this for the best restaurant bathrooms"}
MARY = {"clonedFrom": "tt-7457297838117080352",
        "clonedUrl": "https://www.tiktok.com/@maryamontour/photo/7457297838117080352",
        "clonedAccount": "maryamontour",
        "sourceLikes": 213600, "sourceSaves": 76000, "sourceSlides": 8,
        "sourceCaption": "These are the mistakes you should avoid when travelling to Dubai"}
NEAR = {"clonedFrom": "tt-7217640502072446251",
        "clonedUrl": "https://www.tiktok.com/@nearxfar/photo/7217640502072446251",
        "clonedAccount": "nearxfar",
        "sourceLikes": 961100, "sourceSaves": 468000, "sourceSlides": 7,
        "sourceCaption": "5 things I wish I knew before going to Japan"}
BERI = {"clonedFrom": "tt-7533736563604311318",
        "clonedUrl": "https://www.tiktok.com/@berigold/photo/7533736563604311318",
        "clonedAccount": "berigold",
        "sourceLikes": 382700, "sourceSaves": 185100, "sourceSlides": 8,
        "sourceCaption": "Over 200+ Greek islands - here's how to pick the right one for you"}

made = []

# ---- 15. the real place behind the screen ---------------------------------
made.append(spec(
    "tt-15-screen-locations", WABI,
    None,
    "המקומות האמיתיים מהסדרות שכולם ראו. כולם במרחק טיסה. באיזה הייתם?",
    ["יעדים", "טיפיםלטיול", "טיולים", "סדרות", "אירופה"],
    "מנגנון חדש, ממקור עם 113,400 שמירות: המקום האמיתי שמאחורי משהו שכבר אוהבים. "
    "המקור עושה את זה עם סצנות אנימה ביפן; הגרסה כאן היא סרטים וסדרות שכל ישראלי "
    "מכיר, וכל אחד מהיעדים הוא כזה שטסים אליו ממילא. ההוק הוא ההכרה — רואים את "
    "התמונה, מזהים את הסצנה, ואז מגלים שאפשר פשוט להיות שם.",
    [gem_cover(["ראיתם את הסצנה", "עכשיו תראו", "את המקום"],
               "כל אחד מהם במרחק טיסה מכאן",
               "greek island cliff village sunset dramatic sea"),
     gem("סקופלוס, יוון", ["הכנסייה מהסצנה האחרונה במאמה מיה", "עולים 200 מדרגות, והנוף מצדיק"],
         "agios ioannis chapel rock skopelos sea dramatic"),
     gem("דוברובניק, קרואטיה", ["קינגס לנדינג של משחקי הכס", "החומות פתוחות להליכה מלאה"],
         "dubrovnik city walls old town sunset aerial"),
     gem("טאורמינה, סיציליה", ["המלון מ-The White Lotus", "והתיאטרון היווני מעליו"],
         "taormina sicily greek theatre etna sunset"),
     gem("האלפים הסלובניים", ["אגם בלד, מהסצנות של נרניה", "סירה לאי שבאמצע"],
         "lake bled island church boat mist sunrise"),
     gem("מטאורה, יוון", ["המנזרים התלויים מג'יימס בונד", "שש פתוחים למבקרים"],
         "meteora monasteries cliffs mist dramatic sunrise"),
     tip_slide("hotel room balcony sea view sunrise mediterranean")],
))

# ---- 16. what to bring home -----------------------------------------------
made.append(spec(
    "tt-16-what-to-bring-home", MENDEZ,
    None,
    "מה כדאי להביא הביתה מיוון, ומה לא. השלישי שווה את המקום במזוודה.",
    ["יוון", "טיפיםלטיול", "קניות", "טיולים", "יוון2026"],
    "מנגנון חדש, ממקור עם 106,000 שמירות: לא איפה לבקר אלא מה להביא. זה הפורמט "
    "היחיד באוסף שתופס את **סוף** הטיול — כל השאר עוסקים בתכנון שלפניו — ולכן הוא "
    "נשמר ונפתח שוב ביום האחרון, לא בשבוע הראשון. המקור גם ממספר את הפוסט כחלק, "
    "וזה הועתק.",
    [gem_cover(["מה להביא", "הביתה מיוון"], "ומה להשאיר על המדף",
               "greek market stall olive oil honey colourful"),
     gem("שמן זית מהאי עצמו", ["לא מהסופר בנמל", "מהיצרן, בפח ולא בבקבוק"],
         "olive oil tin greek producer hands close up"),
     gem("מסטיק מחיוס", ["ריח שאין לו תחליף", "גם כממתק וגם כתבלין"],
         "mastiha chios greek sweet shop jars"),
     gem("דבש תימין", ["הכי טוב מהאיים הקטנים", "נבדל בטעם, לא רק במחיר"],
         "greek thyme honey jar golden light close up"),
     gem("עור מכרתים", ["סנדלים שנתפרים מולכם", "בחאניה ובעיר העתיקה"],
         "leather sandals workshop handmade greece shop"),
     gem("אוזו או ציפורו", ["הציפורו מהצפון, האוזו מהאיים", "מותר בכבודה, לא בתא"],
         "ouzo glass taverna table mezze sunset"),
     gem("קרמיקה מסיפנוס", ["האי של הקדרים", "קונים ישירות מהסדנה"],
         "greek ceramic pottery workshop colourful bowls"),
     tip_slide("greek island terrace sea view morning coffee")],
))

# ---- 17. the narrow category, shot beautifully -----------------------------
made.append(spec(
    "tt-17-hotel-pools", THALEA,
    None,
    "הבריכות הכי יפות באירופה, כולן במלונות שאפשר להזמין. איזו הייתם בוחרים?",
    ["מלונות", "בריכות", "טיפיםלטיול", "אירופה", "טיולים"],
    "המקור הוא 678,100 לייקים ו-244,000 שמירות על קטגוריה צרה עד אבסורד — "
    "'חדרי השירותים הכי יפים במסעדות'. לא מסעדות, לא עיצוב; שירותים. זה עובד כי "
    "הצמצום עצמו מפתיע, והתמונות נושאות הכל. הגרסה כאן היא הקטגוריה הצרה שהכי "
    "קרובה למה שאנחנו מוכרים: בריכות של מלונות. כל שקופית היא מקום אחד, בשם, "
    "והתמונה חייבת להפיל — בפורמט הזה תמונה בסדר היא כישלון.",
    [gem_cover(["הבריכות הכי יפות", "באירופה"], "וכולן במלונות שאפשר להזמין",
               "infinity pool sea view sunset luxury hotel"),
     gem("בריכת אינסוף בסנטוריני", ["קאלדרה מתחת, שקיעה מול הפנים"],
         "santorini infinity pool caldera sunset white"),
     gem("גג בלב אתונה", ["האקרופוליס מואר מעל המים"],
         "rooftop pool athens acropolis night illuminated"),
     gem("בריכה חצובה בסלע, אמלפי", ["הים נכנס פנימה"],
         "cliffside pool amalfi coast rocks turquoise"),
     gem("חממה טרופית בבודפשט", ["מרחצאות מתחת לכיפת זכוכית"],
         "budapest thermal bath glass dome steam light"),
     gem("בריכה במדבר, דובאי", ["קו הרקיע מהמים"],
         "dubai rooftop infinity pool skyline sunset"),
     gem("חצר אבן בפוליה", ["בריכה לבנה בין קירות סיד"],
         "whitewashed courtyard pool puglia stone sunny"),
     tip_slide("luxury hotel pool evening lights reflection")],
))


# ---- 18. when, not where ---------------------------------------------------
MONTHS = [
 ("ינואר", "לפלנד או דובאי", "אור צפוני או שלושים מעלות. אין אמצע", "northern lights snow cabin aurora night"),
 ("מרץ", "רומא ולשבון", "לפני ההמון, ואחרי הגשם", "rome spring blossom street people sunny"),
 ("מאי", "כרתים ורודוס", "הים כבר נעים והאיים עוד ריקים", "crete beach turquoise empty sunny cliffs"),
 ("יוני", "האלפים והדולומיטים", "שיא הפריחה בהרים", "dolomites wildflowers meadow peaks summer"),
 ("אוגוסט", "הצפון, לא הדרום", "סקנדינביה ובלטיות, בלי החום", "scandinavia coastal village summer colourful"),
 ("ספטמבר", "האיים היווניים", "החודש הכי טוב בשנה שם", "greek island beach september golden light"),
 ("נובמבר", "תאילנד ווייטנאם", "אחרי הגשמים, לפני העונה", "thailand beach longtail boat clear sky"),
 ("דצמבר", "בודפשט ופראג", "שווקי חג ומרחצאות", "christmas market lights snow europe crowd"),
]
made.append(spec(
    "tt-18-month-by-month", BERI,
    None,
    "לא לאן לטוס, אלא מתי. היעד הנכון לכל חודש בשנה. מתי אתם טסים?",
    ["טיפיםלטיול", "יעדים", "טיולים", "חופשה", "אירופה"],
    "אותו מנגנון החלטה שהביא ל-@berigold 185,100 שמירות, על ציר אחר: במקום למיין "
    "לפי מי שקורא, ממיין לפי **מתי** הוא טס. רוב התוכן בנישה עונה על 'לאן'; "
    "'מתי' היא השאלה שבאמת חוסמת הזמנה, כי לכל חודש יש תשובה אחרת וכמעט אף אחד "
    "לא יודע אותה. הדק נשמר כי חוזרים אליו כשמתפנה חופשה.",
    [gem_cover(["מתי לטוס", "לאן"], "התשובה משתנה בכל חודש",
               "airport window airplane wing sunrise clouds")]
    + [gem(m, [d, why], q) for m, d, why, q in MONTHS]
    + [tip_slide("hotel window view city lights evening")],
))

# ---- 19. under four hours --------------------------------------------------
NEAR4 = [
 ("לרנקה", "50 דקות", "הכי קרוב שיש לים אחר", "cyprus beach turquoise cliffs sunny people"),
 ("אתונה", "שעתיים", "עיר שלמה בסופ״ש", "athens acropolis street golden hour crowd"),
 ("רודוס", "שעתיים", "עיר עתיקה וחופים באותו יום", "rhodes old town street people sunny"),
 ("דובאי", "שלוש שעות", "חורף מושלם, קיץ בלתי אפשרי", "dubai skyline sunset burj water"),
 ("רומא", "שלוש וחצי", "אפשר ללכת לכל מקום", "rome fountain piazza evening people"),
 ("בטומי", "שלוש וחצי", "ים שחור, מחירים של פעם", "batumi black sea promenade sunset"),
 ("בודפשט", "שלוש וחצי", "מרחצאות ולילה", "budapest parliament danube night lights"),
 ("ברצלונה", "ארבע שעות", "ים ועיר בלי להתפשר", "barcelona beach city gaudi sunset"),
]
made.append(spec(
    "tt-19-under-four-hours", BERI,
    None,
    "כל מה שאפשר להגיע אליו מכאן בפחות מארבע שעות. השלישי מפתיע כל פעם מחדש.",
    ["טיפיםלטיול", "טיסותקצרות", "יעדים", "טיולים", "סופש"],
    "מנגנון ההחלטה, על הציר הכי ישראלי שיש: זמן טיסה. זו המגבלה האמיתית לסופ״ש "
    "ארוך, ואף מקור זר לא יכול לכתוב אותה — היא נמדדת מנתב״ג. דק שנשמר כי הוא "
    "עונה על השאלה 'מה בכלל אפשרי' לפני השאלה 'לאן'.",
    [gem_cover(["הכל", "בפחות", "מארבע שעות"], "מרחק טיסה מכאן, בלי קונקשן",
               "airplane wing above clouds sunset golden")]
    + [gem(p, [t, why], q) for p, t, why, q in NEAR4]
    + [tip_slide("hotel balcony morning sea view coffee")],
))


# ---- 20. what a day actually costs ----------------------------------------
def page(q, paras, caption, query):
    return {"layout": "tt-page", "q": q, "paras": paras, "caption": caption,
            "alt": q, "image": {"query": query}}

made.append(spec(
    "tt-20-what-a-day-costs", NEAR,
    None,
    "כמה באמת עולה יום בכל יעד. השלישי זול ממה שכולם חושבים. שמרו לתכנון.",
    ["טיפיםלטיול", "תקציב", "יעדים", "טיולים", "חופשה"],
    "הפורמט של @nearxfar — 468,000 שמירות, הגבוה באוסף — על השאלה שהוא הכי מתאים "
    "לה. עמוד לבן, שאלה, פסקה צפופה עם המספרים מודגשים. מה שגורם לפורמט הזה "
    "להישמר הוא ספציפיות, וכסף הוא הנושא הכי ספציפי שיש. המספרים הם טווחים "
    "ליום אחד לאדם, בלי טיסה ובלי לינה, כדי שיישארו נכונים גם כשהמחירים זזים.",
    [{"layout": "tt-tiny", "pos": "mid", "titleCaps": "כמה עולה יום",
      "line": "בכל יעד שישראלים טסים אליו", "note": "בלי טיסה ובלי לינה",
      "alt": "ארנק ומפה", "image": {"query": "cafe table coffee map notebook sunny"}},
     page("כמה עולה יום ביוון?",
          ["אוכל: **גירוס ברחוב 4-5 אירו**, ארוחה בטברנה 15-20.",
           "תחבורה: מעבורת בין איים **20-40 אירו** לכיוון, אוטובוס עירוני אירו וחצי.",
           "כניסות: האקרופוליס **20 אירו** בקיץ, רוב המצפים והכפרים בחינם."],
          "יום סביר ביוון: 50-70 אירו לאדם",
          "greek taverna table food people sunny terrace"),
     page("וכמה בתאילנד?",
          ["אוכל: **אוכל רחוב 50-80 באט**, מסעדה טובה 300-500.",
           "תחבורה: מונית באפליקציה בבנגקוק **80-150 באט**, רכבת לילה 600-1000.",
           "זה היעד שבו הפער בין תקציב לפינוק הוא הקטן ביותר — **גם הזול נהדר**."],
          "יום בתאילנד: 30-50 דולר לאדם",
          "thai street food market colourful wok night"),
     page("ודובאי, שכולם חושבים שהיא יקרה?",
          ["אוכל: **שווארמה 10-15 דירהם**, מסעדה בקניון 120-200.",
           "תחבורה: **המטרו 3-8 דירהם** לנסיעה, ומגיע כמעט לכל מקום תיירותי.",
           "החופים הציבוריים, המזרקות והטיילות **בחינם**. היקר הוא מה שבוחרים."],
          "יום בדובאי: 40-80 דולר, תלוי לגמרי בבחירות",
          "dubai metro station modern interior people"),
     page("ואיפה באמת חוסכים הכי הרבה?",
          ["בכל אחד מהיעדים האלה הלינה היא ההוצאה הגדולה, והיא גם המשתנה ביותר.",
           "**לבדוק מלונות גם בבוקינג וגם באגודה** — אותו מלון מופיע בשניהם ולא תמיד באותו מחיר.",
           "**וחובה: לבדוק אם אפשר להוזיל אותם באפליקציית HotelMozil** לפני שמאשרים."],
          "אותו מלון, לא תמיד אותו מחיר",
          "hotel room sea view balcony morning light")],
))

# ---- 21. first visit versus fifth -----------------------------------------
FIRST_FIFTH = [
 ("אתונה", "האקרופוליס ופלאקה", "אגיה אירידנוס ואקסרכיה",
  "acropolis athens crowd tourists day", "athens street art neighbourhood cafe locals"),
 ("רומא", "הקולוסיאום ומזרקת טרווי", "קוואדרארו ואוסטיה אנטיקה",
  "trevi fountain rome crowd day", "rome quiet neighbourhood street locals evening"),
 ("בנגקוק", "הארמון וקאו סאן", "טלאד נוי ובנג קרצ'או",
  "bangkok grand palace golden crowd", "bangkok hidden canal green jungle bicycle"),
 ("דובאי", "בורג' חליפה והקניון", "אל סיף וחתא",
  "burj khalifa dubai mall fountain crowd", "al seef dubai old creek abra lanterns"),
 ("ברצלונה", "סגרדה פמיליה ולאס ראמבלאס", "גרסיה ובונקרס דל כרמל",
  "sagrada familia barcelona crowd day", "barcelona viewpoint sunset locals city"),
]
made.append(spec(
    "tt-21-first-vs-fifth", THALEA,
    None,
    "מה רואים בפעם הראשונה, ומה רק בחמישית. שמרו למי שכבר היה.",
    ["טיפיםלטיול", "יעדים", "טיולים", "אירופה", "מקומותנסתרים"],
    "מנגנון החלטה חדש: לא 'לאן' אלא **באיזו פעם**. הדק מדבר אל שני קהלים "
    "בבת אחת — מי שעוד לא היה מקבל את הרשימה הראשונה, ומי שכבר היה מקבל סיבה "
    "לחזור. הזוג על שקופית אחת הוא מה שהופך את זה להשוואה ולא לרשימה.",
    [{"layout": "tt-gem-cover", "titleLines": ["פעם ראשונה", "מול", "פעם חמישית"],
      "sub": "אותה עיר, שני טיולים אחרים לגמרי",
      "alt": "רחוב עירוני", "image": {"query": "european city street crowd evening golden"}}]
    + [{"layout": "tt-swap", "avoid": first, "go": fifth,
        "avoidLabel": "בפעם הראשונה:", "goLabel": "בפעם החמישית:",
        "alt": city, "images": [{"query": qa, "count": 1}, {"query": qb, "count": 1}]}
       for city, first, fifth, qa, qb in FIRST_FIFTH]
    + [tip_slide("boutique hotel room window city view morning")],
))


# ---- 22. the mistakes Israelis specifically make ---------------------------
IL_MISTAKES = [
 ("להמיר שקלים בשדה", ["השער בנתב״ג הוא הגרוע ביותר", "כרטיס בלי עמלת המרה עדיף על כל דוכן"],
  "currency exchange counter airport people"),
 ("להזמין רכב בלי רישיון בינלאומי", ["ביוון, איטליה וקפריסין בודקים", "בלעדיו הביטוח לא תקף"],
  "car rental counter keys airport"),
 ("לטוס באוגוסט כי אז החופש", ["זה גם החודש של כל אירופה", "ספטמבר נעים יותר וזול בהרבה"],
  "crowded european beach umbrellas aerial summer"),
 ("להניח שהכל פתוח בראשון", ["באיטליה וביוון הרבה סגור", "ובדרום גם בצהריים"],
  "closed shop shutters european street empty"),
 ("לשלם במטבע המקומי כשמציעים שקלים", ["ההצעה בשקלים נשמעת נוחה", "והיא תמיד בשער גרוע יותר"],
  "credit card payment terminal restaurant hands"),
 ("לא לבדוק אם צריך ויזה", ["הכללים השתנו ביותר ממדינה אחת", "ובדיקה לוקחת שתי דקות"],
  "passport documents table travel planning"),
 ("לקנות סים בשדה", ["תמיד יקר יותר", "eSIM מראש זול בהרבה"],
  "smartphone esim travel hands airport"),
]
made.append(spec(
    "tt-22-israeli-mistakes", MARY,
    None,
    "הטעויות שישראלים עושים בחו״ל. הראשונה עולה הכי הרבה כסף. איזו עשיתם?",
    ["טיפיםלטיול", "טעויותבטיול", "טיולים", "חופשה", "ישראלים"],
    "אותו מנגנון של @maryamontour — טעות אחת לשקופית, עם תמונה משלה — על זווית "
    "שאף מקור זר לא יכול לכתוב: הטעויות שישראלים ספציפית עושים. המרה בנתב״ג, "
    "רישיון בינלאומי, אוגוסט כי אז החופש הגדול. זה הדק היחיד בסדרה שאי אפשר "
    "לתרגם מאנגלית, ולכן גם הכי קשה להעתקה.",
    [{"layout": "tt-gem-cover", "titleLines": ["הטעויות", "שישראלים", "עושים בחו״ל"],
      "sub": "הראשונה עולה הכי הרבה כסף",
      "alt": "שדה תעופה", "image": {"query": "airport departures board travellers motion"}}]
    + [gem(m, lines, q, pin="❌ ") for m, lines, q in IL_MISTAKES]
    + [tip_slide("hotel reception lobby modern warm light")],
))

# ---- 23. second narrow category: water you sit in -------------------------
BATHS = [
 ("סצ׳ני, בודפשט", ["שחמט במים בארבעים מעלות"], "budapest szechenyi thermal bath steam people"),
 ("בלוע לגון, איסלנד", ["חלבי, גיאותרמי, באמצע שדה לבה"], "blue lagoon iceland geothermal steam turquoise"),
 ("סטורניקי, סלובניה", ["מרחצאות בין פסגות מושלגות"], "alpine thermal pool snow mountains steam"),
 ("פמוקקלה, טורקיה", ["מדרגות סיד לבנות מלאות מים"], "pamukkale white terraces turquoise pools"),
 ("לוקה, איטליה", ["מעיינות חמים בין גבעות טוסקניות"], "tuscany hot spring terraces steam hills"),
 ("ואולאגמני, יוון", ["אגם שהמים בו 24 מעלות כל השנה"], "vouliagmeni lake greece turquoise cliffs swimmers"),
]
made.append(spec(
    "tt-23-thermal-baths", THALEA,
    None,
    "המים החמים הכי יפים באירופה. כולם לטיסה קצרה. איפה הייתם נכנסים?",
    ["טיפיםלטיול", "יעדים", "אירופה", "טיולים", "חורף"],
    "קטגוריה צרה שנייה, באותו מנגנון של @thaleadesign (244,000 שמירות): לא "
    "'יעדי חורף' אלא **מים חמים שיושבים בהם**. הצמצום הוא מה שעוצר, והתמונות — "
    "אדים, אור, מים טורקיז — נושאות את כל הדק. בחירה מכוונת לעונה: זה הדק שרץ "
    "בדיוק כשהקהל מחפש לאן לטוס בחורף.",
    [gem_cover(["המים החמים", "הכי יפים", "באירופה"], "וכולם בטיסה קצרה מכאן",
               "thermal bath steam winter snow people")]
    + [gem(p, lines, q) for p, lines, q in BATHS]
    + [tip_slide("spa hotel pool steam evening warm light")],
))

# ---- 24. the three-day cut of a week-long trip ----------------------------
made.append(spec(
    "tt-24-three-day-version", BERI,
    None,
    "אין לכם שבוע? ככה עושים את אותו טיול בשלושה ימים. מה הייתם מוותרים?",
    ["טיפיםלטיול", "סופש_ארוך", "יעדים", "טיולים", "אירופה"],
    "מנגנון החלטה אחרון וחדש: לא לאן ולא מתי, אלא **בכמה זמן**. רוב התוכן מניח "
    "שבוע; רוב החופשות הן שלושה ימים. הדק לוקח מסלול קלאסי ואומר מה נשאר ומה "
    "יורד — וזה בדיוק סוג ההחלטה שאנשים שומרים כדי לחזור אליה כשהם מזמינים.",
    [{"layout": "tt-gem-cover", "titleLines": ["אין שבוע?", "ככה עושים", "את זה בשלושה"],
      "sub": "מה נשאר ומה יורד, בארבעה יעדים",
      "alt": "מזוודה ומפה", "image": {"query": "small suitcase airport window sunrise travel"}},
     {"layout": "tt-swap", "avoid": "יוון בשבוע", "go": "יוון בשלושה",
      "avoidLabel": "הגרסה המלאה:", "goLabel": "הגרסה הקצרה:",
      "alt": "יוון", "images": [{"query": "greek islands ferry hopping sea sunny", "count": 1},
                                 {"query": "naxos greece village beach golden hour", "count": 1}]},
     {"layout": "tt-swap", "avoid": "איטליה בשבוע", "go": "איטליה בשלושה",
      "avoidLabel": "הגרסה המלאה:", "goLabel": "הגרסה הקצרה:",
      "alt": "איטליה", "images": [{"query": "italy train countryside vineyards travel", "count": 1},
                                   {"query": "rome evening piazza people lights", "count": 1}]},
     {"layout": "tt-swap", "avoid": "תאילנד בשבועיים", "go": "תאילנד בשבוע",
      "avoidLabel": "הגרסה המלאה:", "goLabel": "הגרסה הקצרה:",
      "alt": "תאילנד", "images": [{"query": "thailand islands aerial longtail boats", "count": 1},
                                   {"query": "bangkok street food night market crowd", "count": 1}]},
     {"layout": "tt-swap", "avoid": "קפריסין בשבוע", "go": "קפריסין בסופ״ש",
      "avoidLabel": "הגרסה המלאה:", "goLabel": "הגרסה הקצרה:",
      "alt": "קפריסין", "images": [{"query": "cyprus coastal road mountains sea", "count": 1},
                                    {"query": "larnaca promenade palm sunset people", "count": 1}]},
     tip_slide("hotel room balcony morning sea light")],
))

for sid, n in made:
    print(f"{sid}: {n} slides")
print(f"\n{len(made)} specs written")
