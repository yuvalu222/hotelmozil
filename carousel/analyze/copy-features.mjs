// Wording features of a cover, derived from its transcribed text by fixed
// rules — the same rule for every cover, so no feature is a judgement.
//
// Each rule exists in English and Hebrew because the covers are both. The
// rules are deliberately the hypotheses fixed in PLAN.md before any cover was
// coded; nothing here was added after looking at results.

const EN_PLACES = /\b(japan|tokyo|kyoto|osaka|nara|thailand|bangkok|phuket|krabi|bali|vietnam|korea|seoul|china|india|europe|london|paris|rome|italy|greece|spain|portugal|lisbon|dubai|cyprus|london|nyc|new york|usa|mexico|brazil|amsterdam|berlin|prague|budapest|istanbul|turkey|egypt|morocco|iceland|norway|switzerland|croatia|maldives|singapore|hong kong|philippines|sri lanka|nepal|peru|argentina|colombia|australia|new zealand|canada|hawaii)\b/i;
const HE_PLACES = /(יפן|טוקיו|קיוטו|תאילנד|בנגקוק|פוקט|קרבי|באלי|וייטנאם|קוריאה|סין|הודו|אירופה|לונדון|פריז|רומא|איטליה|יוון|ספרד|פורטוגל|ליסבון|דובאי|קפריסין|לרנקה|אמריקה|ניו יורק|מקסיקו|ברזיל|אמסטרדם|ברלין|פראג|בודפשט|איסטנבול|טורקיה|מצרים|מרוקו|איסלנד|קרואטיה|מלדיביים|סינגפור|הפיליפינים|סרי לנקה|נפאל|פרו|ארגנטינה|קולומביה|אוסטרליה|קנדה|המזרח|דרום אמריקה)/;

export const FEATURES = {
  question:   (t) => /\?/.test(t),
  number:     (t) => /\d/.test(t),
  place:      (t) => EN_PLACES.test(t) || HE_PLACES.test(t),
  warning:    (t) => /\b(don'?t|do not|not|never|mistakes?|avoid|regret|traps?|stop|wrong|worst)\b/i.test(t)
                  || /(^|\s|\/)(אל|אסור|שאסור|לא)(\s|$)|טעות|טעויות|תימנעו|תיזהרו/.test(t),
  superlative:(t) => /\b(best|top|ultimate|perfect|most|must|essential|essentials)\b/i.test(t)
                  || /(הכי|הטוב|המושלם|טופ|חובה|חד משמעית|הכי שוות)/.test(t),
  money:      (t) => /[$£€₪]|\b(budget|cheap|free|save|saving|cost|costs?|money|under|price|prices)\b/i.test(t)
                  || /(כסף|זול|חינם|חסכ|חיסכון|עלה|עלו|עולה|שקל|מחיר|מחירים)/.test(t),
  firstPerson:(t) => /\b(i|i'm|i've|i'd|my|me|we|our|us|mine)\b/i.test(t)
                  || /(^|\s)(לי|שלי|אני|לנו|שלנו|היינו|טסנו|חסכתי|חסכנו|דירגתי|ידענו)(\s|$|\?|!)/.test(t),
  you:        (t) => /\b(you|your|you're|yourself)\b/i.test(t)
                  || /(אתם|לכם|שלכם|תטוסו|תשמרו|תסגרו|תבזבזו|תסתבכו|שתקראו|תשמרי)/.test(t),
  listCount:  (t) => /\b\d+\s+(things|ways|places|apps|brands|stores|tips|mistakes|areas|destinations|snacks|swaps|trips|websites|bathhouses|day)\b/i.test(t)
                  || /\d+\s*(דברים|מקומות|היעדים|יעדים|טיפים|המקומות)|טופ\s*\d/.test(t),
  quote:      (t) => /^["'“‘]/.test(t.trim()),
  part:       (t) => /\bpart\s*\d|חלק\s*[א-ת\d]/i.test(t),
  exclaim:    (t) => /!/.test(t),
  saveCTA:    (t) => /\b(save|like and save)\b/i.test(t) || /(תשמרו|שמרו|תשמרי)/.test(t),
};

export function wordCount(t) {
  return (String(t).replace(/\//g, ' ').match(/[A-Za-zא-ת0-9']+/g) || []).length;
}

export function copyFeatures(text) {
  const t = String(text || '');
  const out = {};
  for (const [k, fn] of Object.entries(FEATURES)) out[k] = t ? (fn(t) ? 1 : 0) : 0;
  out.words = wordCount(t);
  out.short = out.words > 0 && out.words <= 8 ? 1 : 0;
  out.hasText = t.trim() ? 1 : 0;
  return out;
}
