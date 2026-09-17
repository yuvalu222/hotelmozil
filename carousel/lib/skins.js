// Slide markup for the "clone" skins — one per source deck in the corpus.
//
// Each layout below is a direct copy of a specific deck's visual system, not a
// house style. The comment on each names the deck it copies; the contact sheet
// for that deck is in harvest/sheets/ and the live post is linked from
// out/preview.html. When the copy drifts from the source, the source wins.
//
// Photos arrive as an array of data URIs (`photos`), one per image entry in the
// slide spec, in order.

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const img = (src) => (src ? `<img src="${src}" alt="">` : '');

/** Blurred stretch of the first photo behind a 4:5 composition. */
const backdrop = (photos) => (photos[0] ? `<img class="bg" src="${photos[0]}" alt="">` : '');

/** 2x2 grid with white gutters — travel2losangeles, switzerlandersss, mustvisitjapan item slides. */
function grid(photos, cellExtra = () => '') {
  const cells = [0, 1, 2, 3].map((i) =>
    `<div class="cell">${img(photos[i] || photos[0])}${cellExtra(i)}</div>`).join('');
  return `<div class="grid">${cells}</div>`;
}

const SKINS = {
  // mustvisitjapan cover / vnexpress.guide cover: full photo, bottom scrim, red
  // pill label, heavy condensed all-caps headline (Karantina carries that
  // weight in Hebrew), thin arrow bottom-left.
  'caps-scrim'(s, photos) {
    const face = s.font === 'rubik' ? 'head rubik' : 'head';
    return [
      `<img class="photo" src="${photos[0]}" alt="">`,
      '<div class="scrim-bottom"></div>',
      '<div class="caps">',
      s.label ? `<div class="pill">${esc(s.label)}</div>` : '',
      `<div class="${face}">${esc(s.headline)}</div>`,
      s.emoji ? `<div class="emoji">${esc(s.emoji)}</div>` : '',
      s.sub ? `<div class="sub">${esc(s.sub)}</div>` : '',
      '</div>',
      s.arrow === false ? '' : '<div class="arrow">←</div>',
    ].join('');
  },

  // travel2losangeles cover: 2x2 grid, centred stack of white rounded
  // stickers, one line per sticker, rounded heavy sans.
  'grid-stickers'(s, photos) {
    const lines = (s.lines || []).map((l, i) =>
      `<div class="sticker${i ? ' sm' : ''}">${esc(l)}</div>`).join('');
    return backdrop(photos) + `<div class="band">${grid(photos)}<div class="center-stack">${lines}</div></div>`;
  },

  // travel2losangeles item: 2x2 grid, each cell labelled at its foot with a
  // white rounded sticker. Four places per slide, no numbers.
  'grid-labels'(s, photos) {
    const labels = s.labels || [];
    return backdrop(photos) + `<div class="band">${grid(photos, (i) =>
      labels[i] ? `<div class="label"><span>${esc(labels[i])}</span></div>` : '')}</div>`;
  },

  // switzerlandersss: 2x2 grid, white display serif with a soft shadow sitting
  // on the seam. Cover carries the headline, items carry the place name only.
  'grid-serif'(s, photos) {
    const t = s.name
      ? `<div class="t name">${esc(s.name)}</div>`
      : `<div class="t">${esc(s.headline)}</div>`;
    return backdrop(photos) + `<div class="band">${grid(photos)}<div class="seam-serif">${t}</div></div>`;
  },

  // mustvisitjapan item: 2x2 collage of one place, red number pill over a red
  // name bar, then a white box with two labelled lines ("why" / "tip").
  'grid-redcard'(s, photos) {
    return backdrop(photos) + `<div class="band">${grid(photos)}
      <div class="redcard">
        <div class="num"><span dir="ltr">${esc(s.number)}.</span></div>
        <div class="name">📍 ${esc(s.name)}</div>
        <div class="box">
          <span class="row">✨ <b>למה:</b> ${esc(s.why)}</span>
          <span class="row">💡 <b>טיפ:</b> ${esc(s.tip)}</span>
        </div>
      </div></div>`;
  },

  // whatshappening365: two photos stacked, each with a sharp white box holding
  // bold black text and one hot-pink keyword. The if/then template repeats
  // unchanged on every slide.
  'split'(s, photos) {
    const [a, b] = s.parts || [];
    const box = (p) => p
      ? `<div class="box"><span>${esc(p.lead)}<span class="kw">${esc(p.kw)}</span></span></div>` : '';
    return backdrop(photos) + `<div class="band"><div class="split">
      <div class="half">${img(photos[0])}${box(a)}</div>
      <div class="half">${img(photos[1] || photos[0])}${box(b)}</div>
    </div></div>`;
  },

  // vietnamessence (sans) / madetoroamfam (serif): a full creator-style photo
  // with Stories-style white stickers. A cover is a stack of lines; an item is
  // a bold title sticker over a body sticker.
  'sticker'(s, photos) {
    const cls = `stk ${s.pos || 'top'}${s.font === 'serif' ? ' serif' : ''}`;
    let inner = '';
    if (s.lines) inner = s.lines.map((l) => `<div class="s">${esc(l)}</div>`).join('');
    else inner = `<div class="s title">${esc(s.title)}</div>` + (s.body ? `<div class="s body">${esc(s.body)}</div>` : '');
    return `<img class="photo" src="${photos[0]}" alt=""><div class="${cls}">${inner}</div>`;
  },

  // Closing placeholder, shown whole in a phone frame on a flat ground.
  'screenshot'(s, photos) {
    return `<div class="shot">${img(photos[0])}</div>`;
  },
};

export function slideMarkup2(slide, { photos, debug }) {
  const fn = SKINS[slide.layout || (slide.role === 'screenshot' ? 'screenshot' : 'sticker')];
  if (!fn) throw new Error(`unknown layout "${slide.layout}"`);
  let html = fn(slide, photos);
  if (debug) html += '<div class="guide on"><div class="ig"></div></div>';
  return html;
}
