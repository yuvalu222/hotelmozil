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

  // veeceecheng (16,127 likes / 351k followers): a small lowercase label, the
  // CITY at display size, a small secondary line. Items are one photo and a
  // single centred line, low in the frame. No boxes anywhere.
  'city-huge'(s, photos) {
    if (s.line) {
      return `<img class="photo" src="${photos[0]}" alt="">
        <div class="scrim-bottom"></div>
        <div class="cityline">${esc(s.line)}</div>`;
    }
    return `<img class="photo" src="${photos[0]}" alt="">
      <div class="scrim-bottom"></div>
      <div class="cityh">
        <div class="lbl">${esc(s.label)}</div>
        <div class="city">${esc(s.city)}</div>
        ${s.secondary ? `<div class="sec">${esc(s.secondary)}</div>` : ''}
      </div>`;
  },

  // detouristahq (ER 0.093, the highest of any mid-sized account in the corpus):
  // a coloured keyword inside an otherwise plain line, the destination at
  // display size beneath, and item slides carrying a white bar across the top
  // with the mistake framed by two ✗.
  'mistakes'(s, photos) {
    if (s.item) {
      return `<img class="photo" src="${photos[0]}" alt="">
        <div class="mistbar"><span class="x">❌</span><span>${esc(s.item)}</span><span class="x">❌</span></div>`;
    }
    return `<img class="photo" src="${photos[0]}" alt="">
      <div class="scrim-bottom"></div>
      <div class="mist">
        <div class="l1"><span class="kw">${esc(s.kw)}</span> ${esc(s.rest)}</div>
        <div class="big">${esc(s.place)}</div>
      </div>`;
  },

  // moresocialclub (5,689 likes / 102k, ER 0.056): cream ground, serif
  // throughout, a large serif numeral, a headline carrying one italic word, a
  // body paragraph, artwork beneath.
  'editorial'(s, photos) {
    const head = esc(s.head).replace('{', '<em>').replace('}', '</em>');
    const body = esc(s.body || '').replace(/\*(.+?)\*/g, '<b>$1</b>');
    return `<div class="edi">
      <div class="brand">${esc(s.brand || '')}</div>
      ${s.brandsub ? `<div class="brandsub">${esc(s.brandsub)}</div>` : ''}
      <div class="num">${esc(s.num)}</div>
      <div class="head">${head}</div>
      ${body ? `<div class="body">${body}</div>` : ''}
      ${photos[0] ? `<div class="art">${img(photos[0])}</div>` : ''}
    </div>`;
  },

  // lexilaube (354,828 likes on 155k followers — by a wide margin the biggest
  // post in the corpus). Cover: an unstyled creator photo, one centred white
  // serif line. Payoff: a route card. The source screenshots Google Maps; this
  // card is deliberately our own chrome rather than a redraw of theirs.
  'maps'(s, photos) {
    if (s.stops) {
      const marks = ['◎', 'A', 'B', 'C', 'D', 'E'];
      const rows = s.stops.map((t, i) =>
        `<div class="row"><div class="mk">${marks[i] || '•'}</div><div class="fld">${esc(t)}</div></div>`).join('');
      return `<img class="photo" src="${photos[0]}" alt="">
        <div class="scrim-bottom"></div>
        <div class="routewrap"><div class="route">${rows}
          <div class="tot"><span>${esc(s.total)}</span><span class="go">${esc(s.action || 'סיום')}</span></div>
        </div></div>
        ${s.note ? `<div class="mapnote">${esc(s.note)}</div>` : ''}`;
    }
    return `<img class="photo" src="${photos[0]}" alt="">
      <div class="mapline">${esc(s.headline)}</div>`;
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
