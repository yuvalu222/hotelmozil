// Fit one TikTok slide to Instagram's 4:5 (1080x1350).
//
// The publishing API refuses anything taller than 4:5 (aspect floor 0.8),
// and his slides come in three shapes: our decks at 9:16, his own designs at
// 3:4, and the occasional taller closer. A blind centre crop of a 9:16 slide
// cuts 570px, which is where his titles sit. So:
//
//   3:4 and anything up to 1.40  -> contain over a blurred copy of itself.
//                                   On 3:4 the side bands are 34px each,
//                                   invisible, and nothing is ever cut.
//   taller (9:16 and up)         -> find the rows that hold his iPhone-style
//                                   text (white fill, black outline) and crop
//                                   a 4:5 window that keeps all of them. If
//                                   the text spans more than one window,
//                                   contain instead. Never cut a line.
//
// The text finder counts, per row, places where a near-white pixel sits
// within 3px of a near-black one. That edge is what an outlined letter is
// made of, and photos rarely produce it in long runs. TEXT_ROW was set by
// measuring his real slides (ig/calibrate.mjs), not guessed.
//
// Runs inside Chrome (canvas), so the pipeline needs no image library.

export const W = 1080;
export const H = 1350;
export const TEXT_ROW = 14;   // transitions per row that make a row "text"
export const WEAK_ROW = 2;    // ...or this many, sustained over
export const WEAK_RUN = 24;   // ...this many consecutive rows (a big lone glyph)
export const MARGIN = 36;     // px kept above the first and below the last text row
export const CONTAIN_UP_TO = 1.40;

/** Runs in the page. Kept free of closures so Playwright can serialise it. */
function fitInPage({ b64, W, H, TEXT_ROW, WEAK_ROW, WEAK_RUN, MARGIN, CONTAIN_UP_TO }) {
  return (async () => {
    const img = new Image();
    img.src = 'data:image/jpeg;base64,' + b64;
    await img.decode();
    const iw = img.naturalWidth, ih = img.naturalHeight, r = ih / iw;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';

    const contain = () => {
      const cover = Math.max(W / iw, H / ih);
      g.filter = 'blur(40px) brightness(0.78)';
      g.drawImage(img, (W - iw * cover) / 2, (H - ih * cover) / 2, iw * cover, ih * cover);
      g.filter = 'none';
      const fit = Math.min(W / iw, H / ih);
      g.drawImage(img, (W - iw * fit) / 2, (H - ih * fit) / 2, iw * fit, ih * fit);
    };

    let mode, span = null, y0 = null;
    if (Math.abs(r - H / W) < 0.01) {
      g.drawImage(img, 0, 0, W, H);
      mode = 'resize';
    } else if (r <= CONTAIN_UP_TO) {
      contain();
      mode = 'contain';
    } else {
      const sh = Math.round(W * r);
      const s = document.createElement('canvas');
      s.width = W; s.height = sh;
      const sg = s.getContext('2d');
      sg.imageSmoothingQuality = 'high';
      sg.drawImage(img, 0, 0, W, sh);
      const d = sg.getImageData(0, 0, W, sh).data;
      const rows = [];
      const counts = new Array(sh).fill(0);
      for (let y = 0; y < sh; y++) {
        let n = 0;
        const base = y * W * 4;
        for (let x = 0; x < W - 3; x++) {
          const i = base + x * 4;
          const lo = Math.min(d[i], d[i + 1], d[i + 2]);
          const hi = Math.max(d[i], d[i + 1], d[i + 2]);
          const white = lo > 225, black = hi < 45;
          if (!white && !black) continue;
          for (let k = 1; k <= 3; k++) {
            const j = i + k * 4;
            const lo2 = Math.min(d[j], d[j + 1], d[j + 2]);
            const hi2 = Math.max(d[j], d[j + 1], d[j + 2]);
            if ((white && hi2 < 45) || (black && lo2 > 225)) { n++; break; }
          }
        }
        counts[y] = n;
        if (n >= TEXT_ROW) rows.push(y);
      }
      // A lone row is noise (a window, a railing). Text is a run of rows.
      const solid = rows.filter((y, i) => (rows[i + 3] !== undefined && rows[i + 3] - y <= 6) || (i >= 3 && y - rows[i - 3] <= 6));
      // A big lone glyph (the "8" or "10" heading a slide) crosses its
      // outline only 2-4 times per row, far under TEXT_ROW, but it does so
      // for dozens of rows in a row. Count those runs as text too. A photo
      // that trips this only pushes the slide to "contain", which is the
      // safe direction.
      let run = 0, gap = 0, start = -1;
      for (let y = 0; y <= sh; y++) {
        if (y < sh && counts[y] >= WEAK_ROW) {
          if (run === 0) start = y;
          run++; gap = 0;
        } else if (run && gap < 3 && y < sh) {
          gap++;
        } else {
          if (run >= WEAK_RUN) for (let k = start; k < start + run + gap; k++) solid.push(k);
          run = 0; gap = 0;
        }
      }
      solid.sort((a, b) => a - b);
      if (!solid.length) {
        y0 = Math.round((sh - H) / 2);
        mode = 'crop-centre';
      } else {
        const top = solid[0], bottom = solid[solid.length - 1];
        span = [top, bottom, sh];
        if (bottom - top + 2 * MARGIN <= H) {
          y0 = Math.round((sh - H) / 2);
          if (top - MARGIN < y0) y0 = Math.max(0, top - MARGIN);
          if (bottom + MARGIN > y0 + H) y0 = Math.min(sh - H, bottom + MARGIN - H);
          mode = 'crop';
        }
      }
      if (y0 !== null) g.drawImage(s, 0, y0, W, H, 0, 0, W, H);
      else { contain(); mode = 'contain-tall'; }
    }
    const out = c.toDataURL('image/jpeg', 0.92);
    return { b64: out.slice(out.indexOf(',') + 1), mode, ratio: +r.toFixed(3), span, y0, size: [iw, ih] };
  })();
}

/** page: any open Playwright page. Returns { buffer, mode, ratio, span, y0, src }. */
export async function fitSlide(page, jpeg, opts = {}) {
  const res = await page.evaluate(fitInPage, {
    b64: Buffer.from(jpeg).toString('base64'),
    W, H, TEXT_ROW, WEAK_ROW, WEAK_RUN, MARGIN, CONTAIN_UP_TO, ...opts,
  });
  return { ...res, buffer: Buffer.from(res.b64, 'base64'), b64: undefined };
}
