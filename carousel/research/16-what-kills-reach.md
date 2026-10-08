# 16 — What actually suppresses reach

Separating the real causes from the shadowban folklore.

## Real, and documented
`[LIT]` **Watermarks are the single biggest duplicate-content suppressor.** A
watermarked TikTok export posted to Instagram Reels gets roughly **10% of the
reach** a clean version gets. Platforms keep hash databases of compression
fingerprints, so removing the visible logo is not enough — the artifacts
remain.

`[LIT]` **Re-uploaded content underperforms on early signals**, which are the
signals the For You ranking weights most. Native viewers recognise a re-upload
and scroll, and that early scroll is what the ranker reads.

`[LIT]` **Re-encoded, low-bitrate material** reads as crunchy, blurry text
hurts retention, and retention is reach.

`[LIT]` **The same caption pasted across platforms tanks engagement** — each
audience expects a different register.

`[LIT]` Also named: non-native audio, weak cover packaging, identical posting
times across platforms.

## What this means for us specifically

We are in good shape on the biggest item: our slides are **rendered from
source, never exported from TikTok**, so there is no watermark and no second
compression pass. That advantage is lost the moment anyone downloads a posted
carousel and re-uploads it.

Two live risks:
1. **Cross-posting to Instagram.** Use the `-ig.jpg` renders from `out/`, never
   a download of the TikTok post.
2. **One caption for both platforms.** The research says that specifically
   costs engagement. If he cross-posts, the caption has to be rewritten, not
   copied.

**No solid evidence found** for: a formal "originality score", or for any of
the common shadowban claims about posting too often, using too many hashtags,
or editing a post after publishing. Sources either do not mention them or
describe them as folklore.

Sources: cut.pro/en/blog/instagram-buries-watermarked-reposts-2026 ·
syncstudio.ai/blog/cross-post-business-videos-2026 ·
socialync.io/blog/avoid-content-duplication-penalties-cross-posting-2026 ·
aicut.pro/blog/posting-the-same-video-on-tiktok-and-instagram-reels-suppressed
