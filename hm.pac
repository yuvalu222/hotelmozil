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
  if (host === "workers.dev") {
    return "PROXY " + RELAY_HOST + ":8445; DIRECT";
  }
  return "DIRECT";
}
