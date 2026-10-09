// TikTok caption -> Instagram caption.
//
// The TikTok caption is what he actually published, after his own edits, so
// it is the source. Only two things change on the way over:
//
// - Instagram caps a post at 5 hashtags (since December 2025). His captions
//   already carry exactly 5, but a sixth must never reach the API.
// - Tags that mean "TikTok's For You page" are noise on Instagram.
//
// The body text is not rewritten. Nothing on Instagram's side requires it,
// and every sentence in it is his.

const TIKTOK_ONLY = new Set([
  'fyp', 'foryou', 'foryoupage', 'fy', 'fypシ', 'viral', 'tiktok', 'tiktokisrael',
  'פוריו', 'פוריופייג', 'טיקטוק',
]);

const TAG = /#[\p{L}\p{N}_\p{M}]+/gu;

export const MAX_TAGS = 5;
export const MAX_CAPTION = 2200; // Instagram's caption limit, characters

/** @returns {{ caption: string, tags: string[], dropped: string[] }} */
export function igCaption(desc, { maxTags = MAX_TAGS } = {}) {
  const text = String(desc || '');
  const all = text.match(TAG) || [];
  const tags = [];
  const dropped = [];
  for (const t of all) {
    const key = t.slice(1).toLowerCase();
    if (TIKTOK_ONLY.has(key) || tags.some((x) => x.toLowerCase() === t.toLowerCase())) {
      dropped.push(t);
      continue;
    }
    if (tags.length >= maxTags) { dropped.push(t); continue; }
    tags.push(t);
  }
  const body = text
    .replace(TAG, ' ')
    .split(/\r?\n/)
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  let caption = tags.length ? (body ? `${body}\n\n${tags.join(' ')}` : tags.join(' ')) : body;
  if (caption.length > MAX_CAPTION) caption = caption.slice(0, MAX_CAPTION);
  return { caption, tags, dropped };
}
