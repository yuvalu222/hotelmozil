// No direction marks, no stray scripts, anywhere we write.
//
// Two separate hard rules, one check:
//  * ⛔ zero bidi characters (RLM/LRM, U+2066-2069, U+202A-202E) in chat or in
//    files — they show up as gibberish on his machine. The whole repo was
//    cleaned of them on 19.9 and they must not come back.
//  * a Hebrew word typed with an Arabic-range letter in it looks right at a
//    glance and is wrong. "האנוולידים" shipped into research/paris-figures.json
//    on 8.10 with a Persian yeh and an Arabic dal in it, and reads fine.
//
// Ranges are built from code points, never typed, because typing an escape in
// a tool input writes the real invisible character.
//
//   node analyze/char-check.mjs [paths...]
import fs from 'node:fs';
import path from 'node:path';

const BIDI = [0x200e, 0x200f, 0x202a, 0x202b, 0x202c, 0x202d, 0x202e,
  0x2066, 0x2067, 0x2068, 0x2069];
const ARABIC = [0x0600, 0x06ff];
// Control characters. On 8.10 a heredoc turned the two-character escape for a
// word boundary into a real backspace byte inside a regex: it then matched
// nothing, and the gate built on it called every deck clean — a gate that
// silently always passes is worse than no gate. Tab, newline and carriage
// return are the only ones a source file should hold.
const isControl = (n) => (n < 32 && n !== 9 && n !== 10 && n !== 13) || n === 127;
// Built from its code point, not typed: writing the escape is how the bug
// this check exists for gets made.
const NL = String.fromCharCode(10);

const roots = process.argv.slice(2);
const targets = roots.length ? roots : ['specs', 'lib', 'research', 'analyze', 'TIKTOK.md'];
const files = [];
const walk = (p) => {
  if (!fs.existsSync(p)) return;
  const st = fs.statSync(p);
  if (st.isDirectory()) { for (const f of fs.readdirSync(p)) walk(path.join(p, f)); return; }
  // jsonl too: the blind-coded covers hold hand-typed Hebrew, and that file
  // type was missed until the first ten were already written
  if (/\.(json|jsonl|js|mjs|html|md|txt)$/i.test(p)) files.push(p);
};
targets.forEach(walk);

let bad = 0;
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  for (const cp of BIDI) {
    let i = t.indexOf(String.fromCodePoint(cp));
    if (i >= 0) {
      const line = t.slice(0, i).split('\n').length;
      console.error(`${f}:${line}  direction mark U+${cp.toString(16).toUpperCase().padStart(4, '0')}`);
      bad++;
    }
  }
  for (let i = 0; i < t.length; i++) {
    const n = t.codePointAt(i);
    if (isControl(n)) {
      const line = t.slice(0, i).split(NL).length;
      console.error(`${f}:${line}  control character U+${n.toString(16).toUpperCase().padStart(4, '0')}`);
      bad++;
      break;
    }
  }
  const stray = [...t].filter((c) => {
    const n = c.codePointAt(0);
    return n >= ARABIC[0] && n <= ARABIC[1];
  });
  if (stray.length) {
    console.error(`${f}  ${stray.length} Arabic-range character(s): ${[...new Set(stray)].join(' ')}`);
    bad++;
  }
}
console.log(bad ? `${bad} problem(s) across ${files.length} files` : `clean: ${files.length} files`);
process.exit(bad ? 1 : 0);
