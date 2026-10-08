// Slide markup for the "clone" skins — one per source deck in the corpus.
//
// Each layout below is a direct copy of a specific deck's visual system, not a
// house style. The comment on each names the deck it copies; the contact sheet
// for that deck is in harvest/sheets/ and the live post is linked from
// out/preview.html. When the copy drifts from the source, the source wins.
//
// Photos arrive as an array of data URIs (`photos`), one per image entry in the
// slide spec, in order.

import { appleEmoji } from './emoji.js';

// Escape, THEN swap emoji for Apple's artwork. Order matters: the swap injects
// <img> tags, so running it first would escape them away. Every esc() in this
// file feeds element content and never an attribute value — checked before
// this changed — so an <img> can never land inside quotes.
const esc = (s) =>
  appleEmoji(String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));

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
      <div class="scrim-mid"></div>
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

  // ---------------------------------------------------------------------
  // @izzy_travels_ "DON'T GO TO THAILAND before reading this" — 66,200 likes,
  // 68,100 saves, 18,100 shares. Measured off the source slides at 2160px wide
  // and scaled to this 1080px canvas (x0.5), so every size below is the
  // source's size, not a taste decision.
  //
  // Hook slide: one dark personal photo, a contrarian line in very heavy white
  // caps with a BLACK OUTLINE (not a shadow, not a box — paint-order puts the
  // stroke behind the fill so the letterforms stay clean), a lighter line
  // beneath it, and a two-line summary sitting low in the frame.
  'tt-hook'(s, photos) {
    const big = (s.titleLines || []).map((l) => `<div>${esc(l)}</div>`).join('');
    const foot = (s.foot || []).map((l) => `<div>${esc(l)}</div>`).join('');
    return [
      `<img class="photo" src="${photos[0]}" alt="">`,
      '<div class="tth">',
      `<div class="tth-big">${big}</div>`,
      s.sub ? `<div class="tth-sub">${esc(s.sub)}</div>` : '',
      '</div>',
      foot ? `<div class="tth-foot">${foot}</div>` : '',
    ].join('');
  },

  // @izzy_travels_ content slide ("money", "SIM / internet", "mistakes to
  // avoid"). A white rounded title chip centred at the top, an optional green
  // fact chip under it, then the body as a stack of chips whose background
  // hugs each LINE rather than the paragraph — that ragged edge is TikTok's
  // own text-background style and is most of why the deck reads as native.
  'tt-chips'(s, photos) {
    const items = (s.items || []).map((t) =>
      `<p class="tt-item"><span>${esc(t).split(String.fromCharCode(10)).join("</span><br><span>")}</span></p>`).join("");
    return [
      `<img class="photo" src="${photos[0]}" alt="">`,
      '<div class="ttc">',
      s.title ? `<div class="ttc-title">${esc(s.title)}</div>` : '',
      s.accent ? `<div class="ttc-accent">${esc(s.accent)}</div>` : '',
      items ? `<div class="ttc-body">${items}</div>` : '',
      '</div>',
    ].join('');
  },

  // @emsriley "20 THINGS TO DO IN LISBON" — 52,200 likes, 54,200 saves. The
  // opposite system: the photo carries the slide and the words get out of the
  // way. One small white line, no chip and no box, parked in whatever part of
  // the frame is empty (`pos` picks the band). Numbered 1..N.
  'tt-tiny'(s, photos) {
    const pos = ['top', 'upper', 'mid', 'low'].includes(s.pos) ? s.pos : 'upper';
    // The number must lead the line on the RIGHT. Written as plain text it is a
    // neutral run before Hebrew, so bidi pushes it to the left end. Giving it
    // its own element inside an RTL flex row fixes the order in CSS, without
    // putting a direction character anywhere near the content.
    // No number. A numbered deck cannot be trimmed after it is built: drop one
    // slide and the feed shows 1, 2, 5. The count lives on the cover instead,
    // where it is one slide to edit. Owner's standing instruction 3.10.
    const body = `<span>${esc(s.line)}</span>`;
    return [
      `<img class="photo" src="${photos[0]}" alt="">`,
      `<div class="ttt ${pos}">`,
      s.titleCaps ? `<div class="ttt-title">${esc(s.titleCaps)}</div>` : '',
      s.line ? `<div class="ttt-line">${body}</div>` : '',
      // Every slide says something. A bare place name was read as an empty
      // slide ("לא כתוב כלום ברוב התמונות בכלל"), so each item carries a
      // reason to care, not just a label.
      s.note ? `<div class="ttt-note">${esc(s.note)}</div>` : '',
      s.sub ? `<div class="ttt-sub">${esc(s.sub)}</div>` : '',
      '</div>',
    ].join('');
  },

  // ---------------------------------------------------------------------
  // @cinexplorerr "How to do Italy (Properly)" — 216,500 likes and **126,300
  // SAVES**, the highest save count anywhere in this corpus and roughly double
  // the previous best. Saves are the number that matters here: a saved travel
  // deck is the one that is open when a hotel gets booked.
  //
  // Cover: no photo at all. A cream paper card, a small "Memo" label,
  // and the title in a serif. Against a feed of saturated photos a plain page
  // is what stops the thumb.
  'tt-memo'(s) {
    return [
      '<div class="memo">',
      `<div class="memo-no">${esc(s.memoNo || 'Memo')}</div>`,
      `<div class="memo-title">${(s.titleLines || []).map((l) => `<div>${esc(l)}</div>`).join('')}</div>`,
      s.sub ? `<div class="memo-sub">${esc(s.sub)}</div>` : '',
      '</div>',
    ].join('');
  },

  // @cinexplorerr item slide: one destination per photo with a structured
  // block — place, temperature, budget, what to do, and WHERE TO STAY. That
  // last heading is the source's own, and it is why this format was chosen:
  // the hotel line belongs to the structure instead of being bolted on.
  'tt-card'(s, photos) {
    const list = (arr) => (arr || []).map((t) => `<li>${esc(t)}</li>`).join('');
    return [
      `<img class="photo" src="${photos[0]}" alt="">`,
      '<div class="card">',
      `<div class="card-head">${esc(s.place)}</div>`,
      s.meta ? `<div class="card-meta">${(s.meta || []).map((m) => `<span>${esc(m)}</span>`).join('')}</div>` : '',
      s.doLabel ? `<div class="card-label">${esc(s.doLabel)}</div>` : '',
      s.todo ? `<ul class="card-list">${list(s.todo)}</ul>` : '',
      s.stayLabel ? `<div class="card-label">${esc(s.stayLabel)}</div>` : '',
      s.stay ? `<ul class="card-list">${list(s.stay)}</ul>` : '',
      '</div>',
    ].join('');
  },

  // @patspassport "THREE HIDDEN GEMS IN ROME" — 135,500 likes and **100,800
  // saves off FOUR slides**, the best effort-to-save ratio found. Cover is a
  // serif all-caps stack over a moody night photo.
  'tt-gem-cover'(s, photos) {
    return [
      `<img class="photo" src="${photos[0]}" alt="">`,
      '<div class="gem-cover">',
      (s.titleLines || []).map((l) => `<div>${esc(l)}</div>`).join(''),
      '</div>',
      s.sub ? `<div class="gem-cover-sub">${esc(s.sub)}</div>` : '',
    ].join('');
  },

  // @patspassport item: a pin, the name in a large serif, then two or three
  // short dashed lines. The source sets it in white with no outline and it
  // disappears over bright sky — ours keeps the outline, per the standing
  // instruction, which is the one place this clone knowingly beats its source.
  'tt-gem'(s, photos) {
    const lines = (s.lines || []).map((l) => `<div>${esc(l)}</div>`).join('');
    return [
      `<img class="photo" src="${photos[0]}" alt="">`,
      '<div class="gem">',
      `<div class="gem-name">${esc(s.pin || '')}${esc(s.place)}</div>`,
      lines ? `<div class="gem-lines">${lines}</div>` : '',
      '</div>',
    ].join('');
  },

  // @aimsi.unfiltered "10 european cities perfect for a 3-day trip" — 117,600
  // likes, 66,700 saves. A 3x3 collage per city: nine photos, one label. The
  // format sells a city as a MOOD rather than a list, and nine frames do that
  // in the time one frame gets.
  //
  // The source sets its city label in tiny grey type that is unreadable at
  // feed size. Ours is large and outlined — the standing instruction wins over
  // the source wherever the two disagree about legibility.
  'tt-grid9'(s, photos) {
    const cells = Array.from({ length: 9 }, (_, i) =>
      `<div class="g9-cell">${img(photos[i] || photos[photos.length - 1] || photos[0])}</div>`).join('');
    return [
      `<div class="g9">${cells}</div>`,
      `<div class="g9-label"><span>${esc(s.place)}</span>`,
      s.note ? `<span class="g9-note">${esc(s.note)}</span>` : '',
      '</div>',
    ].join('');
  },

  // @epictodo "TOP 10 Things to do - Crete - Pt.1 Chania" — 68,000 likes,
  // 49,800 saves. Two photos of the SAME place stacked full-bleed, label on
  // the seam. Two angles answer "what is it actually like there" in the time
  // one photo takes, which is why it keeps people.
  //
  // The cover also announces a PART NUMBER. The deck is episode one of a
  // series on one island, which turns a single post into a reason to follow.
  'tt-split2'(s, photos) {
    return [
      '<div class="sp2">',
      `<div class="sp2-half">${img(photos[0])}</div>`,
      `<div class="sp2-half">${img(photos[1] || photos[0])}</div>`,
      '</div>',
      `<div class="sp2-label"><span>${esc(s.place)}</span>`,
      s.note ? `<span class="sp2-note">${esc(s.note)}</span>` : '',
      '</div>',
    ].join('');
  },

  // @nearxfar "5 things I wish I knew before going to Japan, part 5" —
  // 961,100 likes, **468,000 SAVES**, 123,200 shares. By a long way the
  // highest-saving deck in this corpus: 3.7x the next best.
  //
  // It is the opposite of every other format here. No photo behind the words:
  // a WHITE PAGE, a numbered question as the heading, and a genuinely dense
  // paragraph with the load-bearing phrases in bold, over a small supporting
  // image. It is reading, not scanning.
  //
  // What makes it save is specificity. Not "eat local food" but "lunch
  // specials at high-end restaurants are a third of the dinner price". Named
  // shops, named apps, real numbers. A deck this dense only works if every
  // line is worth the reading, which is the bar the copy has to clear.
  //
  // The outline rule does not apply here for the same reason it does not apply
  // to the memo card: there is no photograph for the text to fight.
  'tt-page'(s, photos) {
    const body = (s.paras || []).map((t) =>
      `<p>${esc(t).split('**').map((part, i) => (i % 2 ? `<b>${part}</b>` : part)).join('')}</p>`).join('');
    return [
      '<div class="pg">',
      `<div class="pg-q">${esc(s.q)}</div>`,
      `<div class="pg-body">${body}</div>`,
      photos[0] ? `<div class="pg-art">${img(photos[0])}` +
        (s.caption ? `<div class="pg-cap">${esc(s.caption)}</div>` : '') + '</div>' : '',
      '</div>',
    ].join('');
  },

  // @cuddlynest "CAN'T AFFORD / GO TO" — 94,700 likes and **111,700 saves**,
  // a ratio of 1.18. More saves than likes, the highest in this corpus, and
  // it comes from a hotel-booking brand: a commercial account doing exactly
  // the job this account has to do.
  //
  // One slide, two photos: the famous expensive place on top, the one that
  // looks the same for a fraction underneath. The whole mechanic is the swap,
  // which is why it saves — it is a list of decisions, not of sights.
  //
  // The source sets its labels in black and pink chips. Ours are outlined
  // instead, per the standing instruction, with the pink kept as the colour of
  // the place name so the pairing still reads at a glance.
  'tt-swap'(s, photos) {
    const row = (label, place, cls) =>
      `<div class="swap-tag ${cls}"><span class="swap-l">${esc(label)}</span>`
      + `<span class="swap-p">${esc(place)}</span></div>`;
    return [
      '<div class="swap">',
      `<div class="swap-half">${img(photos[0])}${row(s.avoidLabel || 'לא בתקציב:', s.avoid, 'hi')}</div>`,
      `<div class="swap-half">${img(photos[1] || photos[0])}${row(s.goLabel || 'לכו ל:', s.go, 'lo')}</div>`,
      '</div>',
    ].join('');
  },

  // The shape the top of the corpus actually uses (TIKTOK.md section 9).
  //
  // Measured over 524 decks: the slides people SAVE carry three times the text
  // of the ones they scroll, starting higher in the frame, in a block roughly
  // seven times taller. The two highest saves-per-like decks, from two
  // different accounts, are both built as a dense stack of stops rather than
  // one photograph with a caption over it.
  //
  // What is taken from them is the structure and nothing else: a blurred
  // backdrop so type never fights the picture, a thumbnail per item so the eye
  // has somewhere to land on every row, and a hard number on every row. The
  // visual language here is ours — the owner's outlined white type, and the
  // green he already uses on his own closing card for the number that matters.
  'tt-stack'(s, photos) {
    const rows = (s.items || []).slice(0, 4).map((it, i) => `
      <div class="stk-row">
        <div class="stk-thumb">${img(photos[i + 1] || photos[0])}</div>
        <div class="stk-txt">
          <div class="stk-name">${esc(it.name || '')}</div>
          ${it.fact ? `<div class="stk-fact">${esc(it.fact).split('**')
            .map((part, k) => (k % 2 ? `<b>${part}</b>` : part)).join('')}</div>` : ''}
        </div>
      </div>`).join('');
    return `${photos[0] ? `<img class="stk-bg" src="${photos[0]}" alt="">` : ''}
      <div class="stk-scrim"></div>
      <div class="stk">
        ${s.title ? `<div class="stk-head">${esc(s.title)}</div>` : ''}
        ${s.sub ? `<div class="stk-sub">${esc(s.sub)}</div>` : ''}
        <div class="stk-rows">${rows}</div>
      </div>`;
  },

  // The route layout, rebuilt against the source instead of against my own
  // drift. @trip.com (127,500 saves) and @vitortrip (1.54 saves per like, the
  // highest in the corpus) both build a slide as a numbered ROUTE, and the
  // things that make it one are the things `tt-stack` lost:
  //
  //   THREE stops to a slide, not four. Four is where the room ran out.
  //   LARGE LANDSCAPE tiles, not small squares. Mine shrank 258 → 224 → 196
  //     because every time a Hebrew line wrapped I took width from the photo.
  //   SEVERAL LINES per stop. Theirs carry price, hours and duration; mine
  //     was squeezed to one line, which is how a route became a list.
  //   A DASHED RAIL down the side with the travel time between stops — the
  //     single element that says "these are in order", and the one I dropped
  //     without noticing.
  //   COLOUR HIERARCHY: the name in the accent, one figure emphasised, the
  //     rest plain.
  //
  // Owner, 7.10: "I have no idea what those 4 little pictures are, that is not
  // what I meant." He is reacting to the drift, not to the source.
  //
  // READ OFF THE SOURCE, §13a, after the first rebuild still missed it:
  //
  //   FIVE stops on a slide, not three and not four.
  //   The NAME sits in a yellow highlighter box, dark text — no outlined type
  //     anywhere in the deck.
  //   Facts are a LABELLED SCHEMA in white boxes, identical on every stop:
  //     TIME SPENT: 30 MIN / PRICE: FREE. Not free prose.
  //   A dashed ARROW down the side with the walk time in a white pill between
  //     every pair of stops.
  //   A day badge at the top, white rounded box.
  //
  // ⚠️ The white-box treatment is what the corpus does and it contradicts the
  // owner's standing "white text, black outline" rule. Both looks are built:
  // `boxed: false` on the slide returns the outlined type. His call, not mine.
  //
  // Item shape:
  //   { name, time?: '30 דקות', price?: 'חינם', note?: string,
  //     to?: '5 דקות הליכה' }
  'tt-route'(s, photos) {
    const boxed = s.boxed !== false;
    const items = (s.items || []).slice(0, 5);
    // One heading box, as all three precedents have: the day, then the area
    // it covers. Rome "DAY 1", London "DAY 1: ROYAL ICONS". Rendering the
    // badge and the title as two boxes on opposite edges was mine.
    const head = [s.badge, s.title].filter(Boolean).join(': ');

    const rows = items.map((it, i) => {
      const last = i === items.length - 1;
      // The schema, in the source's own order: how long, then what it costs,
      // then anything else. A stop missing one simply omits that line, which
      // is what the source does too.
      const facts = [
        it.time ? `<span class="rt-k">זמן</span> ${esc(it.time)}` : '',
        it.price ? `<span class="rt-k">מחיר</span> ${esc(it.price)}` : '',
        it.note ? esc(it.note) : '',
      ].filter(Boolean).slice(0, 2);
      return `
      <div class="rt-row">
        <div class="rt-txt">
          <div class="rt-name"><span>${esc(it.name || '')}</span></div>
          ${facts.map((f) => `<div class="rt-fact"><span>${f}</span></div>`).join('')}
        </div>
        <div class="rt-thumb">${img(photos[i + 1] || photos[0])}</div>
        <div class="rt-rail"></div>
      </div>${last ? '' : `
      <div class="rt-link">
        <div class="rt-arrow"></div>
        ${it.to ? `<div class="rt-to">${esc(it.to)}</div>` : ''}
      </div>`}`;
    }).join('');

    // its own backdrop and scrim classes: the markup is mounted into #slide
    // with no layout class, so a `.tt-route .stk-scrim` rule could never match
    return `${photos[0] ? `<img class="stk-bg rt-bg" src="${photos[0]}" alt="">` : ''}
      <div class="stk-scrim rt-scrim"></div>
      <div class="rt${boxed ? ' boxed' : ''}">
        ${head ? `<div class="rt-head">${esc(head)}</div>` : ''}
        <div class="rt-rows">${rows}</div>
        <!-- no bottom line: none of the three precedents has one, and ours
             landed at y=1800, inside TikTok's caption strip -->
      </div>`;
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
