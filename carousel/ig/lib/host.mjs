// Put a carousel's slides at public URLs for the few minutes Instagram needs.
//
// The publishing API takes image_url only, so the files must sit on a public
// server while Instagram fetches them. They go to a throwaway branch,
// `ig-media`, of the public site repo, and are read back through
// raw.githubusercontent.com (measured 9.10: 200, image/jpeg).
//
// Why this shape:
// - A separate branch never touches `main`, which GitHub Pages serves and
//   which carries hm.pac and config.json for live app users.
// - A separate clone in the state folder never touches his working tree.
// - The URL is pinned to the commit SHA, so raw's 5-minute cache can never
//   serve an older file under the same name.
// - Each publish force-pushes a fresh root commit and deletes the branch
//   afterwards, so nothing accumulates.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const REPO = 'yuvalu222/hotelmozil';
export const BRANCH = 'ig-media';
const REMOTE = `https://github.com/${REPO}.git`;

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

/** files: [{ name: '01.jpg', path }]. Returns { sha, urls }. */
export async function hostFiles(folder, files, { workDir, log = console.log, fetchImpl = fetch, timeoutMs = 120000 } = {}) {
  const dir = path.join(workDir, 'media-repo');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, folder), { recursive: true });
  for (const f of files) fs.copyFileSync(f.path, path.join(dir, folder, f.name));
  fs.writeFileSync(path.join(dir, 'README.txt'),
    'Temporary: slides waiting for Instagram to fetch them. Written and deleted by carousel/ig/mirror.mjs.\n');
  git(dir, 'init', '-q', '-b', BRANCH);
  git(dir, 'add', '-A');
  git(dir, '-c', 'user.name=HotelMozil', '-c', 'user.email=hotelmozil@users.noreply.github.com', 'commit', '-q', '-m', `ig: ${folder}`);
  git(dir, 'push', '-q', '-f', REMOTE, `HEAD:refs/heads/${BRANCH}`);
  const sha = git(dir, 'rev-parse', 'HEAD');
  const urls = files.map((f) => `https://raw.githubusercontent.com/${REPO}/${sha}/${folder}/${f.name}`);
  log(`host: pushed ${files.length} slides at ${sha.slice(0, 8)}`);

  // Instagram fetches once and fails hard on a 404, so do not hand it a URL
  // before it answers with the right bytes.
  const until = Date.now() + timeoutMs;
  for (const [i, u] of urls.entries()) {
    const want = fs.statSync(files[i].path).size;
    for (;;) {
      let ok = false;
      try {
        const r = await fetchImpl(u, { method: 'HEAD' });
        ok = r.ok && /image\/jpeg/.test(r.headers.get('content-type') || '') && Number(r.headers.get('content-length')) === want;
      } catch { /* not yet */ }
      if (ok) break;
      if (Date.now() > until) throw new Error(`host: ${u} not served after ${timeoutMs / 1000}s`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  return { sha, urls };
}

/** Delete the branch. Failure is logged, never fatal: the next push replaces it anyway. */
export function unhost({ workDir, log = console.log } = {}) {
  const dir = path.join(workDir, 'media-repo');
  try {
    git(fs.existsSync(dir) ? dir : workDir, 'push', '-q', REMOTE, '--delete', BRANCH);
    log('host: branch removed');
  } catch (e) {
    log(`host: could not remove ${BRANCH}: ${String(e.stderr || e.message).trim().slice(0, 120)}`);
  }
}
