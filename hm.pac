const RELAY_HOST = "157.180.27.241";

function FindProxyForURL(url, host) {
  if (dnsDomainIs(host, ".agoda.com") || dnsDomainIs(host, ".agoda.net") || host === "agoda.com") {
    return "PROXY " + RELAY_HOST + ":8443; DIRECT";
  }
  if (dnsDomainIs(host, ".booking.com") || dnsDomainIs(host, ".bstatic.com") || host === "booking.com") {
    return "PROXY " + RELAY_HOST + ":8444; DIRECT";
  }
  if (dnsDomainIs(host, "ipinfo.io") || host === "ipinfo.io") {
    return "PROXY " + RELAY_HOST + ":8445; DIRECT";
  }
  // Fallback exit check, used only when ipinfo.io rate-limits the shared
  // residential IP (HTTP 429). Cloudflare-fronted, so /cdn-cgi/trace reports
  // the same geo source as the baseline probe.
  // Do NOT add cloudflare.com itself here: it is the baseline host, and
  // routing it would make isRouted() compare HK against HK forever.
  if (host === "workers.dev") {
    return "PROXY " + RELAY_HOST + ":8445; DIRECT";
  }
  return "DIRECT";
}
