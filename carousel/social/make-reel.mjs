// Turn a deck folder into an Instagram Reel with music baked in (17.10).
//
// Why a video: the owner's iron rule is "no post without music", and
// Instagram adds music to a carousel only in the phone app (not on the web,
// not through the API). A Reel carries its own audio track, so it goes up
// from the website or the official API with the music already inside.
//
// Each 3:4 slide is fitted whole into 1080x1920 over a blurred, darkened copy
// of itself (nothing is cut), shown for --sec seconds, hard cuts like TikTok
// photo mode. H.264 / yuv420p / bt709 / AAC, faststart.
//
//   node social/make-reel.mjs <deck-folder> [--music <mp3>] [--sec 3.5] [--out <mp4>]
// Default out: <deck-folder>-reel/reel.mp4. Music must be licensed for social
// use: see social/music/LICENSE.md.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const folder = argv[0];
const music = opt('--music', path.join(import.meta.dirname, 'music', 'mixkit-summer-fun-13.mp3'));
const sec = Number(opt('--sec', '3.5'));
const out = opt('--out', path.join(folder.replace(/[\\/]+$/, '') + '-reel', 'reel.mp4'));
const slides = fs.readdirSync(folder).filter((f) => /^\d\d\.jpg$/.test(f)).sort().map((f) => path.join(folder, f));
if (slides.length < 2) throw new Error('need at least 2 slides in ' + folder);
if (!fs.existsSync(music)) throw new Error('music file missing: ' + music);
fs.mkdirSync(path.dirname(out), { recursive: true });

// cover and closer a little shorter: the cover is read at a glance, the closer is one line
const durs = slides.map((_, i) => (i === 0 || i === slides.length - 1 ? Math.max(2.5, sec - 0.5) : sec));
const total = durs.reduce((a, b) => a + b, 0);

const args = ['-y', '-v', 'error'];
slides.forEach((s, i) => args.push('-framerate', '30', '-loop', '1', '-t', String(durs[i]), '-i', s));
args.push('-i', music);
const parts = slides.map((_, i) =>
  `[${i}:v]split[a${i}][b${i}];` +
  `[a${i}]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=40,eq=brightness=-0.10[bg${i}];` +
  `[b${i}]scale=1080:-2:flags=lanczos[fg${i}];` +
  `[bg${i}][fg${i}]overlay=(W-w)/2:(H-h)/2,setsar=1,fps=30,format=yuv420p[v${i}]`);
const fade = Math.max(0, total - 1.5).toFixed(2);
const graph = parts.join(';') + ';' +
  slides.map((_, i) => `[v${i}]`).join('') + `concat=n=${slides.length}:v=1:a=0[v];` +
  `[${slides.length}:a]atrim=0:${total},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.3,afade=t=out:st=${fade}:d=1.5[a]`;
args.push('-filter_complex', graph, '-map', '[v]', '-map', '[a]',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-movflags', '+faststart', '-t', String(total), out);
execFileSync('ffmpeg', args, { stdio: 'inherit' });

// gate: a reel without an audio stream would break the no-music rule
const probe = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height:format=duration', '-of', 'json', out], { encoding: 'utf8' });
const info = JSON.parse(probe);
const v = info.streams.find((s) => s.codec_type === 'video');
const a = info.streams.find((s) => s.codec_type === 'audio');
if (!a) throw new Error('reel has no audio stream');
if (!v || v.width !== 1080 || v.height !== 1920) throw new Error('reel is not 1080x1920');
console.log(`${out}: ${slides.length} slides, ${Number(info.format.duration).toFixed(1)}s, ${v.width}x${v.height}, audio ok`);
