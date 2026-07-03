// hm.pac — HotelMozil "savings engine" (iOS).
//
// Split proxy: ONLY Agoda/Booking traffic goes through the relay; everything
// else is DIRECT (no GB burn, no slowdown on the rest of browsing, and the
// routing stays scoped to the OTAs).
//
// The relay (see infra/edge-relay/) hides DataImpulse and injects the proxy
// credentials server-side, so this file — and the installed profile — never
// expose the real proxy provider.
//
// No custom domain needed: the relay is addressed by raw IP (a VPS's public
// IP works fine as a PAC "PROXY host:port" target — the exit IP Agoda/Booking
// actually see is DataImpulse's residential IP, not this VPS, since the VPS
// only relays the encrypted CONNECT tunnel).
//
// DEPLOY: after infra/edge-relay/setup.sh has been run on the VPS, replace
// REPLACE_WITH_VPS_IP below with that VPS's public IP, then copy this file to
// the Pages repo (hotelmozil-site) as hm.pac and push. The profile
// (convex/http.ts -> PAC_URL) points at yuvalu222.github.io/hotelmozil/hm.pac.

const RELAY_HOST = "157.180.27.241";

function FindProxyForURL(url, host) {
  // Agoda -> Hong Kong exit. The trailing "; DIRECT" is the engine gate: when the
  // savings engine is NOT active, the relay REJECTs these ports, so iOS falls
  // back to DIRECT (normal Israeli price). When the app activates a 5-min window,
  // the relay opens the port and this routes through the HK residential IP.
  if (dnsDomainIs(host, ".agoda.com") || dnsDomainIs(host, ".agoda.net") || host === "agoda.com") {
    return "PROXY " + RELAY_HOST + ":8443; DIRECT";
  }
  // Booking -> India exit (cheapest tax-INCLUSIVE price; US 1311 was a tax-display artifact)
  if (dnsDomainIs(host, ".booking.com") || dnsDomainIs(host, ".bstatic.com") || host === "booking.com") {
    return "PROXY " + RELAY_HOST + ":8444; DIRECT";
  }
  // Everything else: no proxy.
  return "DIRECT";
}
