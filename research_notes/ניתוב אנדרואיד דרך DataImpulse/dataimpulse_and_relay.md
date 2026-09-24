# DataImpulse as upstream exit + chaining a mobile tunnel server (relay 157.180.27.241) to it

Research date: 2026-09-24. Primary sources: DataImpulse GitBook docs (docs.dataimpulse.com, fetched as .md), DataImpulse Reseller API Postman collection (fetched as JSON), DataImpulse ToS, sing-box / gost / outline-ss-server docs. Secondary: Proxyway review (tested April 2026), aggregator/marketing blogs (flagged where used).

## 1. DataImpulse technical details (endpoints, ports, protocols, auth, targeting, sessions, pricing, ToS, pools)

### Takeaway
One gateway (`gw.dataimpulse.com`, or IP `74.81.81.81`) with rotating HTTP(S) on port 823, rotating SOCKS5 on 824, and sticky ports 10000-20000. Auth is `login:password` or an IP whitelist. Targeting and session options go into the username after `__` (for example `login__cr.th;sessid.abc`). Country targeting is included in the base price, while city/state/ZIP/ASN cost double. UDP exists but is **off by default** and only enabled after KYC and a use-case review. Travel OTAs such as Agoda and Booking are **not** on the published block list.

### Cited Findings
**Endpoints / ports / protocols**
- Gateway `gw.dataimpulse.com`. Rotating HTTP/HTTPS is port 823, rotating SOCKS5 is port 824, and sticky connections use ports 10000-20000 — [Types of connections](https://docs.dataimpulse.com/proxies/types-of-connections); [Protocols](https://docs.dataimpulse.com/proxies/protocols)
- DNS hostname "the host closest to you will automatically execute your requests". IP hostname `74.81.81.81` is "automatically routed through the best available server based on your selected country". The docs recommend the DNS name because the IP can change — [Connection Hosts](https://docs.dataimpulse.com/proxies/connection-hosts.md)
- Supported protocols: "HTTP, HTTPS, and SOCKS5" — [Protocols](https://docs.dataimpulse.com/proxies/protocols)
- UDP: "We support UDP connections; it is disabled by default for all users." Enabling it needs a detailed use-case description, company info if applicable, and completed KYC. "Requests without completed KYC will not be considered." — [UDP](https://docs.dataimpulse.com/proxies/udp.md). Proxyway lists "SOCKS5 (including UDP)" but does not mention the opt-in gate — [Proxyway](https://proxyway.com/reviews/dataimpulse-proxies)
- SOCKS5 error behaviour: "if there is an attempt of the UDP connection, the connection will be dropped" (context: blocked/no-ray cases). The `UDP_BIND_FAILED` error exists — [Errors](https://docs.dataimpulse.com/errors.md)
- Ports open by default at the exit: 80, 443, 5228, 53, 5060, 8080, 8090, 8443, 853, 8888. SMTP/IMAP and other mail/messaging ports are restricted. You unblock a port by emailing support with the use case (KYC may be required) — [Port access](https://docs.dataimpulse.com/port-access.md)
- Each plan is limited to 2000 threads (concurrent connections). Going over returns `407 THREADS_EXHAUSTED`, and raising the limit requires KYC — [Threads](https://docs.dataimpulse.com/proxies/threads.md)

**Authentication**
- A proxy login and password are generated automatically in "Proxy Access" after you buy a plan, and the password can be reset — [User:pass](https://docs.dataimpulse.com/authentication-methods/user-pass-authentication.md)
- Whitelist IPs let you connect "without using the login and password". "The same IP address cannot be added to multiple plans at the same time." — [Whitelist IPs](https://docs.dataimpulse.com/authentication-methods/whitelist-ips.md)

**Targeting syntax (username parameters)**
- Parameters follow the login after the `__` delimiter. Format: `key1.value1,value2;key2.value1,value2`. Example: `http://login__cr.de:password@gw.dataimpulse.com:823`, and multi-country `login__cr.de,au` — [Parameters](https://docs.dataimpulse.com/proxies/parameters.md)
- Default targeting, included in the base price: `__cr` (country) plus country exclusion and `__noasn` (ASN exclusion) — [Default Targeting](https://docs.dataimpulse.com/proxies/targeting/default-targeting.md)
- Target Filters (state, city, ZIP, ASN) are "billed at double the standard rate". A country is mandatory for any of them. If no IP matches you get `NO_RAY` (400 on the targeting page, 503 on the errors page, an inconsistency inside the docs) — [Targeting](https://docs.dataimpulse.com/proxies/targeting.md); [Errors](https://docs.dataimpulse.com/errors.md)
- City: `cr.de;city.berlin`, multiple cities `cr.es;city.madrid,barcelona`, exclusion `cr.de;nocity.berlin` (also double price). ASN: `cr.pl;asn.39603` — [City](https://docs.dataimpulse.com/proxies/parameters/city.md); [ASN](https://docs.dataimpulse.com/proxies/parameters/asn.md)
- `anon.1` returns only "more anonymous proxies" from a smaller pool — [Anonymous](https://docs.dataimpulse.com/proxies/parameters/anonymous.md)

**Sessions**
- Rotating ports (823/824) give "a new IP with each new request" — [Types of connections](https://docs.dataimpulse.com/proxies/types-of-connections)
- Sticky ports bind an IP to a port for a period. Rotation interval is 1-120 minutes, with a default of 30 when the interval is unset or 0 — [Types of connections](https://docs.dataimpulse.com/proxies/types-of-connections)
- `sessttl.N` sets the sticky rotation interval in minutes. Example: `login__cr.fr;sessttl.60@gw.dataimpulse.com:10000` — [Session Interval](https://docs.dataimpulse.com/proxies/parameters/session-interval.md)
- `sessid.<any string>` on ports 823/824 pins an IP for about 30 minutes. If the residential peer goes offline, the IP is automatically replaced — [Session Id](https://docs.dataimpulse.com/proxies/parameters/session-id.md)

**Pricing and pools**
- Residential is $1/GB, premium residential $5/GB, mobile $2/GB and datacenter $0.50/GB. Pay-as-you-go with no KYC for basic use. Pool sizes: residential 90M IPs, mobile 16M. Measured success rate is about 99.7%, with response times of 0.33-0.97 s depending on location — [Proxyway](https://proxyway.com/reviews/dataimpulse-proxies)
- Mobile proxies cost "$2 / GB", 16M+ IPs, 3G/4G/5G/LTE, on the same gateway `gw.dataimpulse.com:823`. Traffic does not expire — [DataImpulse mobile proxies](https://dataimpulse.com/mobile-proxies/)
- For the premium residential pool, target filters are "included in the base price" — [Target Filters for sub-users](https://docs.dataimpulse.com/resellers/target-filters-for-sub-users.md)
- A 20% volume discount above 1,000 GB (about $0.80/GB) is claimed by DataImpulse's own blog, a self-published source — [DataImpulse blog](https://dataimpulse.com/blog/residential-proxy-pricing-comparison/)

**Restrictions / ToS**
- Blocked sites (since Dec 2023): all government sites, banking and payment sites (a spreadsheet list), Ticketswap, HealthEquity, SopranoVillas, bandwidth-monetization platforms, VFS Global, 4chan, OpenStreetMap, fool.com, happyrail.com, treinreiswinkel.nl and others. Some can be unblocked with KYC plus spend thresholds ($100 for all .gov, $1,000 for banking, business use only) — [Blocked Websites](https://docs.dataimpulse.com/blocked-websites.md)
- ToS 3.7: "You may not share, sell, transfer, lend, or otherwise grant third parties access to Your account or any account credentials". ToS 12.1 allows account removal "without advance notice for any reason without restitution". ToS 3.1-3.2: they "track all activities on our platform and store detailed logs" — [ToS](https://dataimpulse.com/terms-of-services/)
- Resellers must complete KYC through iDenfy, sign a Reseller Agreement and deposit at least $50 — [Resellers](https://docs.dataimpulse.com/resellers.md)

### Inferences
- agoda.com and booking.com do not appear on the block list. If either OTA's payment step redirects to a payment-processor domain on the "banking and payment" list, checkout through the proxy could fail with `403 SITE_PERMANENTLY_BLOCKED`. This is worth testing. The list lives in a Google Sheet that I did not fetch.
- For a price-browsing product, use sticky sessions (a `sessid` per user-session, or a sticky port with `sessttl` of about 30-60 minutes). Rotating port 823 gives a new IP on every request, which can break Agoda/Booking bot-detection and cookie consistency.
- Port 443 and 53/853 are open by default, so HTTPS and DoH/DoT through the exit work without any request to support.

### Gaps
- I found no documented bandwidth or throughput cap per connection. Real per-country speed for the target countries (for example TH, IN, ID) is unknown. Proxyway gives aggregate figures only.
- No documented host or port to select the *mobile* or *premium* pool specifically. It seems to be chosen per plan (each plan has its own credentials), but I could not confirm this from the docs.
- The exact wording of the KYC/use-case approval criteria for UDP, and whether a "consumer VPN-like relay" use case would be approved, are unknown.

## 2. Does DataImpulse offer a consumer app, VPN client, SDK, extension, or WireGuard/OpenVPN?

### Takeaway
No. DataImpulse is proxy-only (HTTP/HTTPS/SOCKS5). I found no own-brand VPN client, browser extension, Android/iOS app, or WireGuard/OpenVPN service. Its Android tutorial uses the OS Wi-Fi/APN proxy settings, which only support HTTP.

### Cited Findings
- The Android tutorial configures the proxy "directly in your device's settings, without additional extensions or managers". It covers the APN proxy ("limited to HTTP only") and the Wi-Fi proxy ("HTTP(S) only") with `gw.dataimpulse.com:823`, using either credentials or whitelisting the phone's IP — [DataImpulse Android tutorial](https://dataimpulse.com/tutorials/how-to-set-up-proxies-in-android/)
- Browser use is documented through third-party extensions (FoxyProxy, SwitchyOmega) — [FoxyProxy tutorial](https://dataimpulse.com/tutorials/how-to-set-up-proxies-in-foxy-proxy/); [SwitchyOmega tutorial](https://dataimpulse.com/tutorials/how-to-set-up-proxies-in-switchy-omega/)
- The documented products are proxies (residential/mobile/datacenter), a Reseller API with white-label custom DNS host, and the dashboard. There is no VPN product in the docs index — [docs index llms.txt](https://docs.dataimpulse.com/llms.txt); [Custom DNS host](https://docs.dataimpulse.com/resellers/custom-dns-host.md)
- SourceForge claims "DataImpulse has a mobile app for iPad, Android, and iPhone". This is unverified, directory-generated and contradicted by the absence of any app in the official docs — [SourceForge](https://sourceforge.net/software/product/DataImpulse/)
- Several GitHub repos titled "dataimpulse-…-guide" (for example hicux847, jnepozsr, wtxes459) turned up in search. They look like SEO/affiliate content, not official DataImpulse repos, so I did not rely on them — [example](https://github.com/hicux847/dataimpulse-socks5-proxy-setup)

### Inferences
- The native Android Wi-Fi/APN proxy is a system-wide *HTTP* proxy. Many native apps, possibly including the Agoda/Booking apps, may ignore it or only partly respect it, and it cannot do per-app routing. This is the same limitation the current PAC approach has. A VPNService-based client (WireGuard, sing-box, Outline, NekoBox, v2rayNG) is needed for reliable per-app capture on Android.
- The white-label "custom DNS host" feature lets HotelMozil point its own domain (for example `px.hotelmozil.com`) at DataImpulse, so a reseller setup could hide the upstream brand.

### Gaps
- I could not confirm whether DataImpulse publishes an SDK (for example a peer SDK for supply) on GitHub. None was found.

## 3. Direct Android-to-DataImpulse connection vs relay; credential security; sub-users and per-user limits

### Takeaway
Technically, an Android VPNService client (sing-box, NekoBox, v2rayNG and so on) can use DataImpulse SOCKS5 or HTTP with auth directly, with no relay. But SOCKS5/HTTP proxy auth is plaintext and not encrypted, and handing out the main credentials breaks ToS 3.7. The sanctioned path is the **reseller program**, which provides API-created sub-users with their own login/password, traffic balance, thread count, allowed IPs, protocol restriction, host blocklist and default countries. Per-user sub-user credentials limit the damage from a leak, but a relay still hides the credentials entirely and encrypts the phone-to-server leg.

### Cited Findings
- Reseller API base URL: `https://api.dataimpulse.com/reseller/`. Auth token via `POST user/token/get`, using the dashboard password — [Reseller API (Postman)](https://documenter.getpostman.com/view/6095389/2s9YC7UC2x)
- Sub-user endpoints: `sub-user/create`, `update`, `get`, `list`, `delete`, `reset-password`, `set-blocked`, `set-blocked-hosts`, `set-default-pool-parameters`, `allowed-ips/add|remove`, `balance/add|drop|get|addition-history`, `usage-stat/get|detail|errors`, `supported-protocols/get|set`, plus `common/locations` and `common/pool_stats` — [Reseller API (Postman)](https://documenter.getpostman.com/view/6095389/2s9YC7UC2x)
- `sub-user/create` accepts `label`, `sticky_range` (start/end, min 10000, max 30000), `threads` (max 2000), `allowed_ips` (max 5 items) and `default_pool_parameters` (`countries` or `exclude_countries`, `exclude_asn`, `anonymous_filter`, `rotation_interval` 1-120 min). It returns a generated `login`/`password`. `balance/add` adds traffic in GB, and a minus sign subtracts. `supported-protocols/set` restricts a sub-user to `http` and/or `socks5` — [Reseller API (Postman)](https://documenter.getpostman.com/view/6095389/2s9YC7UC2x)
- Plan-level Traffic Limit: per plan, a rolling window of 1h/24h/7d/30d, in whole GB. The action is email only, suspend, or both. When suspended, requests return `USER_RATE_LIMIT_EXCEEDED`. "The limit applies to one plan, not your whole account." — [Traffic Limit](https://docs.dataimpulse.com/traffic-limit.md)
- Error `403 HOST_BLOCKED` = "blocked by user in the current plan settings". This confirms that per-plan host blocklists exist — [Errors](https://docs.dataimpulse.com/errors.md)
- sing-box's SOCKS outbound supports `username`/`password`, `version` 5 and `network` tcp/udp — [sing-box SOCKS outbound](https://sing-box.sagernet.org/configuration/outbound/socks/)
- ToS 3.7 bans granting third parties access to account credentials — [ToS](https://dataimpulse.com/terms-of-services/)

### Inferences
- **Direct mode risks:** (a) the credentials sit in the app or config and can be extracted, and with them anyone can burn traffic at $1-5/GB, generally unrestricted; (b) HTTP proxy `Proxy-Authorization: Basic` and SOCKS5 user/pass auth cross the user's network in cleartext (the tunneled TLS inside is still encrypted); (c) the phone's ISP can see that it talks to a known proxy gateway; (d) the host control is a *blocklist* (`set-blocked-hosts`), not an allowlist, so a leaked sub-user credential cannot be limited to agoda/booking domains on DataImpulse's side. An allowlist has to be enforced at your own relay.
- **Sub-user-per-HotelMozil-user** (reseller) plus a small `balance` and a low `threads` count gives a per-user budget and revocation (`set-blocked`/`reset-password`). Combined with `default_pool_parameters.countries`, it fixes that user's exit country without username suffixes. `allowed_ips` (max 5) is impractical for mobile users on changing carrier IPs, but works well for **locking a sub-user to the relay's IP 157.180.27.241**.
- Recommended pattern: keep DataImpulse credentials only on the relay, whitelisted or locked by `allowed_ips` to 157.180.27.241. Give phones only relay credentials (WireGuard keys or Shadowsocks passwords) that you can revoke yourself. Enforce a domain allowlist (agoda/booking/their CDNs) at the relay, so the relay cannot be used as a general free proxy.

### Gaps
- Whether a sub-user can be restricted to the *premium* or *mobile* pool through the API is not documented (`common/locations?pool_type=` hints that pool types exist).
- I found no documentation on whether whitelisted-IP auth still lets you pass `__cr` parameters. With whitelist auth there is no username to suffix, so country probably has to come from the dashboard default or the sub-user defaults. This is unconfirmed.

## 4. Relay chaining designs (WireGuard / Shadowsocks-Outline / sing-box-Xray / gost to DataImpulse), per-user country, UDP/QUIC, DNS

### Takeaway
The cleanest design is a **sing-box (or Xray) server** on 157.180.27.241: inbounds for Shadowsocks-2022 multi-user, VLESS/Trojan, and/or a WireGuard endpoint; per-user route rules (`auth_user`) that send each user to a SOCKS outbound whose username carries `__cr.XX;sessid.<id>`; UDP/QUIC rejected; domain sniffing so the *hostname*, not a relay-resolved IP, is handed to DataImpulse. That makes DNS resolve at the exit side. outline-ss-server cannot forward to an upstream proxy. gost can (`-F socks5://…`). A plain kernel WireGuard server needs tun2socks or redsocks to reach the upstream.

### Cited Findings
- sing-box Shadowsocks inbound supports a multi-user structure (`users: [{name, password}]`), 2022-blake3 methods and `managed` for dynamic users via the SSM API — [sing-box Shadowsocks inbound](https://sing-box.sagernet.org/configuration/inbound/shadowsocks/)
- sing-box route rules match `auth_user` ("Username, see each inbound for details"), `inbound` tags, `network` (tcp/udp/icmp), `port` and sniffed `protocol` — [sing-box route rule](https://sing-box.sagernet.org/configuration/route/rule/)
- sing-box rule actions include `route`, `reject` (with `method` and `no_drop`), `hijack-dns`, `sniff` and `resolve` — [sing-box rule action](https://sing-box.sagernet.org/configuration/route/rule_action/)
- The sniffer detects `quic` over UDP (with SNI and client type: Chromium/Cronet, Safari/Apple Network API, quic-go and others), `tls` SNI and `http` Host over TCP, and `dns` — [sing-box protocol sniff](https://sing-box.sagernet.org/configuration/route/sniff/)
- Since 1.11, sing-box has WireGuard as an *endpoint* (`listen_port`, `peers[].public_key`, `allowed_ips`, …), usable as a server-side WireGuard peer inside sing-box's routing — [sing-box WireGuard endpoint](https://sing-box.sagernet.org/configuration/endpoint/wireguard/); [Core Tutorial summary](https://core-tutorial.argsment.com/singbox/wireguard)
- outline-ss-server supports multiple users on a single port ("trying all the different credentials until one succeeds"), UDP and Prometheus metrics. The README does not mention upstream proxy support — [outline-ss-server](https://github.com/outline-vpn/outline-ss-server). A code TODO reads "add a dialer argument to support proxy chaining" — [search result for a fork, pkg.go.dev](https://pkg.go.dev/github.com/geripper/outline-ss-server/client) (weaker evidence: it comes from a fork)
- gost chaining: `gost -L ss://:8388 -F socks5://user:pass@host:port`. A YAML `chains/hops/nodes` form exists. UDP-transport nodes (QUIC/KCP) can only be the first hop — [gost chain](https://gost.run/en/concepts/chain/)
- WireGuard-to-tun2socks-to-SOCKS5: sensepost/wiresocks runs tun2socks in a container with `PROXY=socks5://…` and routes WireGuard client traffic into the TUN device — [wiresocks](https://github.com/sensepost/wiresocks/blob/main/README.md); [SensePost blog](https://sensepost.com/blog/2022/wiresocks-for-easy-proxied-routing/)
- Blocking UDP/443 makes browsers fall back to HTTP/2 or HTTP/1.1 over TCP — [Zscaler QUIC](https://help.zscaler.com/zia/managing-quic-protocol). Cronet fallback is not always reliable: an ExoPlayer/Cronet issue reports that fallback did not happen when UDP 443 was blocked — [ExoPlayer #5160](https://github.com/google/ExoPlayer/issues/5160)
- DataImpulse UDP is off by default and gated behind KYC — [UDP](https://docs.dataimpulse.com/proxies/udp.md)

### Inferences (design recommendations; not tested)
- **Design A (recommended): sing-box on the relay.**
  - Inbounds: `shadowsocks` (2022-blake3, multi-user; works with Outline, sing-box, NekoBox and v2rayNG clients via `ss://` links) and/or `vless`/`trojan`+TLS (more resistant to blocking), plus an optional `wireguard` endpoint for users of the official WireGuard app.
  - Outbounds: one `socks` outbound per country or per user, for example `server: gw.dataimpulse.com, server_port: 824, username: "<login>__cr.th;sessid.<user>", password: …`, with `network: tcp`.
  - Route: rule `auth_user:[u123] → out-th`. Rule `network: udp, port: 443` (or `protocol: quic`) → `reject`, so apps fall back to TCP. Rule `protocol: dns` → `hijack-dns`. Domain allowlist (agoda/booking plus their CDN/API domains) → DataImpulse, everything else → `reject` or `direct`.
  - Enable `sniff` so SOCKS CONNECT requests carry the domain name. DataImpulse then resolves DNS at the exit.
  - Per-user country: either one outbound per country with the `__cr` suffix, or one reseller sub-user per HotelMozil user with `default_pool_parameters.countries` set.
- **Design B: kernel WireGuard + tun2socks/redsocks.** The official WireGuard app works on Android and iOS. But tun2socks only sees IP packets. The destination is an IP the phone resolved via whatever DNS it was given, so the exit resolution is lost unless you run a fake-IP DNS (sing-box `fakeip`) on the relay. Per-user country requires per-peer policy routing into separate tun2socks instances. It is more moving parts than Design A. The sing-box WireGuard endpoint gets the same client compatibility with sniffing and per-rule routing.
- **Design C: outline-ss-server.** Not suitable unless patched. It dials destinations directly. Wrapping it in a transparent redirect (iptables REDIRECT to redsocks) is possible but fragile. Use sing-box's Shadowsocks inbound instead: Outline clients speak standard Shadowsocks, so they can still connect.
- **Design D: gost** (`-L ss://… -L socks5://… -F socks5://user__cr.th:pass@gw.dataimpulse.com:824`). Quick to deploy, but per-user country means one gost service or port per country, and there is no built-in domain sniffing or allowlisting comparable to sing-box.
- **Existing PAC + HTTP ports 8443/8444/8445** probably map to three countries. They can stay as they are for browser use. The new tunnel inbound replaces them for native-app capture.
- **Per-app scope on the client:** sing-box/NekoBox/v2rayNG on Android support per-app VPN (include only the Agoda/Booking packages). The WireGuard Android app also supports per-app include/exclude. iOS has no per-app VPN for consumer apps without MDM, so there you would rely on server-side domain routing.
- **QUIC:** since DataImpulse UDP is off by default, QUIC to the exit fails anyway. Reject UDP/443 explicitly and fast (ICMP-unreachable or `reject`, not a silent drop) to shorten app fallback delays. Cronet-based apps may not fall back cleanly, so test the actual Agoda and Booking apps.
- **Performance:** there are three legs (phone → Hetzner Helsinki(?) → DataImpulse gateway nearest to the relay → residential peer in the target country → OTA). Expect added latency of hundreds of ms and variable throughput. Use sticky sessions to avoid mid-session IP changes. Traffic is billed per GB. You could route static image/CDN hosts `direct` from the relay instead of through DataImpulse to save cost, provided they are not geo-priced, but this needs testing so it does not break the app. Per-session data volume is unmeasured.

### Gaps
- No measured latency or throughput numbers for relay→DataImpulse chains were found.
- I could not confirm whether Agoda's or Booking's Android/iOS apps actually use QUIC/HTTP3 (Cronet) or how gracefully they fall back.
- The location of 157.180.27.241 is assumed to be Hetzner (157.180.0.0/16 is commonly Hetzner Helsinki). Not verified.

## 5. Does OTA geo-pricing depend on IP only, or also DNS / headers / account locale?

### Takeaway
There is solid primary evidence (Booking.com partner docs) that Booking's hotel "Country Rates" are shown based on the **visitor's IP country**. Agoda's partner tools support geo-targeted promotions, but I found no primary doc saying how Agoda determines the visitor's country. Other pricing inputs clearly exist: Booking's mobile-only rates, Genius/member discounts, and possibly account country, currency and language. DNS resolution location is very unlikely to affect price, since OTAs see the client IP at their edge, not the resolver. That last point is inference.

### Cited Findings
- Booking.com Country Rates: "Country rates are only visible to guests using Booking.com from an IP address that matches the country you're targeting." They "don't apply to mobile rates or the Deal of the Day promotion" (search snippet of Booking partner help; the direct page fetch returned 403) — [Setting up Country Rates](https://partner.booking.com/en-us/help/rates-availability/rates-special-offers/setting-country-rates); the overview page confirms the feature: "Country Rates are an occupancy strategy you can offer guests from your markets of choice" — [Country Rates solution page](https://partner.booking.com/en-us/solutions/country-rates)
- Agoda supports "member-only and geo-targeted" promotions for properties — [Agoda Partner Hub promotions](https://partnerhub.agoda.com/hotel-solutions/rate-channels/) (search snippet)
- Consumer-side evidence (vendor-published, treat with caution): NordVPN research found lower prices on Agoda/Booking/Hotels.com from non-US IPs — [NordVPN](https://nordvpn.com/blog/price-difference-research-us/). AnyGo (a vendor selling this exact service) tested 30 Agoda hotels and found 86.7% with a cheaper country price, averaging 13.5% — [AnyGo](https://getanygo.com/blog/hotel-savings-guide-how-to-pay-less-on-agoda-we-tested-30-hotels)
- Arbitrica (a vendor blog) claims Booking determines the pricing tier by IP — [Arbitrica](https://arbitrica.com/blog/booking-com-different-prices-vpn-explained.html)

### Inferences
- IP geolocation of the exit is the primary lever. Residential IPs geolocate correctly more often than datacenter IPs, and OTAs are less likely to flag them.
- Secondary levers the app should control or test: the logged-in account's country and Genius/VIP tier (Agoda VIP, Booking Genius), app language and currency settings, device locale/timezone (native apps may send these as headers), and cached cookies from a previous country. A clean or fresh session per country is advisable.
- "Mobile rates" on Booking are app-only discounts. They stack independently of country rates, so in-app price comparisons are not directly comparable to web ones.
- DNS: pricing logic runs on the OTA's servers using the connecting IP (behind their CDN). Resolving via the relay's DNS only affects which CDN edge you reach, not your apparent country. Still, sending hostnames to DataImpulse (remote DNS at exit) avoids odd edge mismatches and DNS leaks to the user's ISP.

### Gaps
- I found no primary Agoda documentation on how the visitor country is determined (IP vs account vs app locale).
- I found no evidence on whether Agoda/Booking apps apply GPS/device-locale signals to pricing. This needs empirical A/B testing: same account, different exit IPs, and the reverse.
- I found no evidence on whether Agoda/Booking block or penalize DataImpulse residential ranges.
