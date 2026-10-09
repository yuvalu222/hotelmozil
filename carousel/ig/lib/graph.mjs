// Instagram API with Instagram Login: just the calls a carousel needs.
//
// Source: developers.facebook.com/docs/instagram-platform/content-publishing
// (read 9.10.2026):
//   - host graph.instagram.com, scopes instagram_business_basic +
//     instagram_business_content_publish
//   - "Carousels are limited to 10 images, videos, or a mix of the two."
//   - JPEG only; images must be on a publicly reachable server at the time
//     of the call
//   - 100 API-published posts per 24h, a carousel counts as one
//   - containers expire after 24h; status_code is EXPIRED, ERROR, FINISHED,
//     IN_PROGRESS or PUBLISHED
// Long-lived tokens last 60 days and are refreshed with ig_refresh_token
// once at least 24h old (business-login doc, same day).

export const VERSION = 'v26.0';
export const MAX_ITEMS = 10;

export class GraphError extends Error {
  constructor(message, { status, code, subcode, body } = {}) {
    super(message);
    Object.assign(this, { status, code, subcode, body });
  }
  /** Token revoked or expired: nothing a retry can fix. */
  get isAuth() { return this.code === 190 || this.status === 401; }
}

// HM_IG_GRAPH points the client at a fake server for end-to-end tests.
const HOST = process.env.HM_IG_GRAPH || 'https://graph.instagram.com';

export function client(token, { base = `${HOST}/${VERSION}`, root = HOST, fetchImpl = fetch } = {}) {
  async function call(method, url, params = {}) {
    const u = new URL(url);
    const body = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...params, access_token: token })) {
      if (v === undefined || v === null) continue;
      (method === 'GET' ? u.searchParams : body).set(k, String(v));
    }
    const res = await fetchImpl(u, method === 'GET' ? { method } : { method, body });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }
    if (!res.ok || json.error) {
      const e = json.error || {};
      throw new GraphError(`${method} ${u.pathname}: ${e.message || res.status}`, {
        status: res.status, code: e.code, subcode: e.error_subcode, body: json,
      });
    }
    return json;
  }
  return {
    get: (path, params) => call('GET', `${base}/${path}`, params),
    post: (path, params) => call('POST', `${base}/${path}`, params),
    refresh: () => call('GET', `${root}/refresh_access_token`, { grant_type: 'ig_refresh_token' }),
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Wait until a container is FINISHED. Throws on ERROR / EXPIRED / timeout. */
export async function waitFinished(api, id, { pollMs = 3000, timeoutMs = 300000, wait = sleep } = {}) {
  const until = Date.now() + timeoutMs;
  for (;;) {
    const s = await api.get(id, { fields: 'status_code,status' });
    if (s.status_code === 'FINISHED' || s.status_code === 'PUBLISHED') return s.status_code;
    if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') {
      throw new GraphError(`container ${id} ${s.status_code}: ${s.status || ''}`, { body: s });
    }
    if (Date.now() > until) throw new GraphError(`container ${id} still ${s.status_code} after ${timeoutMs / 1000}s`);
    await wait(pollMs);
  }
}

/**
 * Step 1 of 2: build the carousel container. Kept apart from publishing so
 * the caller can record the creation id first; a crash between "publish
 * sent" and "state saved" must never end in a second identical post.
 */
export async function buildCarousel(api, igId, urls, caption, opts = {}) {
  if (urls.length < 2 || urls.length > MAX_ITEMS) {
    throw new GraphError(`a carousel takes 2-${MAX_ITEMS} images, got ${urls.length}`);
  }
  const children = [];
  for (const image_url of urls) {
    const c = await api.post(`${igId}/media`, { image_url, is_carousel_item: 'true' });
    children.push(c.id);
  }
  for (const id of children) await waitFinished(api, id, opts);
  const parent = await api.post(`${igId}/media`, { media_type: 'CAROUSEL', children: children.join(','), caption });
  await waitFinished(api, parent.id, opts);
  return { creationId: parent.id, children };
}

/** Step 2 of 2. Returns { mediaId, permalink }. */
export async function publish(api, igId, creationId) {
  const r = await api.post(`${igId}/media_publish`, { creation_id: creationId });
  let permalink = null;
  try { permalink = (await api.get(r.id, { fields: 'permalink' })).permalink || null; } catch { /* cosmetic */ }
  return { mediaId: r.id, permalink };
}
