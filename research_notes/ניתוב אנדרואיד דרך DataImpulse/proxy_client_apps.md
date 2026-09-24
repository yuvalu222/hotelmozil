# Android proxy-client apps for per-app routing (Agoda/Booking) via DataImpulse or own relay

Scope: third-party clients other than official WireGuard/Outline/sing-box. Research date 2026-09-24. Budget-limited (~18 tool calls); Google Play and AppBrain pages could not be fetched directly (returned empty/403), so install counts and ratings are mostly **unverified**. Items marked (UNVERIFIED) are from prior knowledge, not from a source fetched here.

## Q1. Availability on Google Play in 2026, publisher, maintenance, open source

### Takeaway
Of the powerful open-source "censorship-circumvention" clients, only Hiddify (and v2RayTun / Happ, which are closed-source commercial-style clients) still have Play listings; v2rayNG left Play in July 2025 and the NekoBox Play listing is disowned by its developer. Simple authenticated-proxy tunnelers (Super Proxy, Drony) are on Play but with thin maintenance signals.

### Cited Findings
- **v2rayNG** (2dust, open source, package com.v2ray.ang): users reported "The Android client is no longer available on Google Play" in an issue opened 7 July 2025; other issues ask why it was removed and request its return — [Issue #4726](https://github.com/2dust/v2rayNG/issues/4726); [Issue #4919](https://github.com/2dust/v2rayNG/issues/4919); [Issue #4653](https://github.com/2dust/v2rayNG/issues/4653). No maintainer explanation was found in the fetched page — [Issue #4726](https://github.com/2dust/v2rayNG/issues/4726). Distributed via GitHub releases — [Releases](https://github.com/2dust/v2rayng/releases).
- **NekoBox for Android** (MatsuriDayo, open source, moe.nb4a): a Play listing exists — [Play data safety](https://play.google.com/store/apps/datasafety?id=moe.nb4a&hl=en_US) — but per search summaries of the developer's GitHub, the Play version is described as fake / a fork distributed by a former partner and users are advised to install only from GitHub; also on IzzyOnDroid — [IzzyOnDroid](https://android.izzysoft.de/repo/apk/moe.nb4a); [GitHub releases](https://github.com/Matsuridayo/NekoBoxForAndroid/releases). (The "fake" claim is from a search-engine summary; the README wording was not fetched directly.)
- **Hiddify** (open source, sing-box core): active Play listing app.hiddify.com; older "HiddifyNG" listing ang.hiddify.com also exists; described as free, no ads, able to route "all traffic or selected app traffic" — [Play: Hiddify](https://play.google.com/store/apps/details?id=app.hiddify.com); [Play: HiddifyNG](https://play.google.com/store/apps/details?id=ang.hiddify.com); [Developer page](https://play.google.com/store/apps/developer?id=Hiddify&hl=en).
- **Happ – Proxy Utility** (HappDev, com.happproxy): on Google Play; Xray-core based; supports VLESS(Reality), VMess, Trojan, Shadowsocks, Socks, Hysteria2; per-app proxy, subscription auto-update; says it collects no data and sells no VPN service — [Play](https://play.google.com/store/apps/details?id=com.happproxy); [happ.su](https://www.happ.su/main). A GitHub org exists ([Happ-proxy/happ-android](https://github.com/Happ-proxy/happ-android)) but whether the app source is published was not verified.
- **v2RayTun** (com.v2raytun.android; APKMirror lists publisher "DataBridges Technologies Ltd"): on Google Play since ~April 2024; supports import via deep link, QR, clipboard; per-app routing; the Play build lacks the "ignore SSL verification" setting that the off-Play build has — [Play](https://play.google.com/store/apps/details?id=com.v2raytun.android&hl=en_US); [APKMirror](https://www.apkmirror.com/apk/databridges-technologies-ltd/v2raytun-2/); [DigneZzZ/v2raytun notes](https://github.com/DigneZzZ/v2raytun).
- **Super Proxy** (com.scheler.superproxy): on Google Play (also an iOS version "Super Proxy – Tunnel your apps"); local VPN that tunnels traffic through an HTTP (CONNECT) or SOCKS5 proxy, supports login/password, per-app controls — [Play](https://play.google.com/store/apps/details?id=com.scheler.superproxy&hl=en_US); [proxys.io 2026 guide](https://proxys.io/en/blog/proxy-settings/setting-up-a-proxy-on-android-with-super-proxy); [App Store](https://apps.apple.com/app/id6478274781).
- **Drony** (subset of SandroProxy): HTTP/HTTPS/SOCKS with basic/digest/NTLM auth, no root, catches apps that ignore system proxy; main XDA thread activity dates 2013–2016 — [XDA thread](https://xdaforums.com/t/app-3-x-proxy-no-root-drony-proxy-with-authentication-support.2320008/); [RapidSeedbox](https://www.rapidseedbox.com/drony-proxy); [Uptodown](https://drony.en.uptodown.com/android).
- **Every Proxy** / "Android Proxy Server" (cn.adonet.proxyevery) is a proxy *server* on the phone, not a client/tunneler — [Play](https://play.google.com/store/apps/details?id=cn.adonet.proxyevery&hl=en&gl=US).
- **NetGuard** (M66B): has SOCKS5 forwarding settings including "SOCKS5 username" and "SOCKS5 password" (a guide pairs it with Every Proxy) — [itsignacioportal guide](https://itsignacioportal.github.io/netguard-pdnsf-any-vpn-combo/).
- **SocksDroid**: SOCKS5 client guides exist (RapidSeedbox) — [RapidSeedbox SocksDroid guide](https://www.rapidseedbox.com/blog/socksdroid-guide).

### Inferences
- For a Play-only, non-technical user in 2026, realistic candidates are Hiddify, Happ, v2RayTun (full-featured) and Super Proxy (simple). v2rayNG, NekoBox, Clash Meta for Android need APK sideloading, which adds friction and trust concerns.
- (UNVERIFIED) Clash Meta for Android, FlClash, SagerNet, Shadowsocks-android, Postern: I believe CMFA and FlClash are GitHub-only; SagerNet is abandoned; Postern was removed from Play years ago; Shadowsocks-android (com.github.shadowsocks) is on Play but only speaks Shadowsocks (plus plugins) outbound — so it cannot talk directly to DataImpulse's HTTP/SOCKS5.

### Gaps
- Install counts, ratings and last-update dates for all Play apps: Play and AppBrain pages could not be fetched.
- Country-level availability (Russia/China/Iran removals): not found in this pass. Chinese Play is not available at all; Russia removals of VPN apps are frequent but no app-specific source found.
- Karing, Streisand, Clash Mi, FlClash, Postern, SocksDroid current Play status: not checked.

## Q2. Direct HTTP/SOCKS5 outbound with username/password (can it go straight to gw.dataimpulse.com?)

### Takeaway
Yes for Super Proxy, Drony, NetGuard (SOCKS5 only), Happ (socks://user:pass@), and the Xray/sing-box/mihomo-based clients (v2rayNG, v2RayTun, Hiddify, NekoBox, Clash Meta) which support socks/http outbounds with auth. Shadowsocks-android cannot.

### Cited Findings
- Super Proxy: HTTP CONNECT and SOCKS5, with login/password — [Play](https://play.google.com/store/apps/details?id=com.scheler.superproxy&hl=en_US); [proxys.io](https://proxys.io/en/blog/proxy-settings/setting-up-a-proxy-on-android-with-super-proxy).
- Happ: Socks5 link formats `socks://user:pass@1.2.3.4:443`, partial Base64 or full Base64 — [Happ link examples](https://www.happ.su/main/dev-docs/examples-of-links-and-parameters).
- Drony: basic, digest and NTLM proxy auth — [XDA](https://xdaforums.com/t/app-3-x-proxy-no-root-drony-proxy-with-authentication-support.2320008/).
- NetGuard: SOCKS5 address plus username/password fields — [guide](https://itsignacioportal.github.io/netguard-pdnsf-any-vpn-combo/).
- tun2socks (xjasonlyu) discussion on sending to SOCKS5 with username/password — [Discussion #131](https://github.com/xjasonlyu/tun2socks/discussions/131).

### Inferences
- (UNVERIFIED, prior knowledge) v2rayNG can import `socks://base64(user:pass)@host:port` and has HTTP outbound in manual config; Clash/mihomo YAML supports `type: socks5`/`type: http` proxies with `username`/`password`; sing-box (Hiddify, NekoBox) supports `socks` and `http` outbounds with credentials. So all could point at gw.dataimpulse.com directly, though HTTP-proxy link import (`http://user:pass@host:port`) is less universally supported than socks://.
- Plain SOCKS5 sends credentials and traffic unencrypted to the proxy (TLS app traffic stays encrypted end-to-end). An own relay using VLESS/Shadowsocks and chaining to DataImpulse on the server would hide the DataImpulse credentials from the device.

### Gaps
- Whether DataImpulse's SOCKS5 endpoint handles UDP/QUIC (Agoda/Booking may try QUIC) — not researched.

## Q3. Per-app routing, and whether the allow-list can be shipped inside the imported config

### Takeaway
Every candidate has per-app allow/deny in the UI, but only Happ documents a way to push the per-app package list from the provider (subscription headers). For the others, the user must pick Agoda/Booking manually.

### Cited Findings
- Happ subscription parameters (HTTP header or `#`-prefixed line in subscription body): `per-app-proxy-mode: [off/on/bypass]`, `per-app-proxy-list: [com.google.chrome,...]`, `per-app-proxy-list-invert`, and `per-app-proxy-list-set` ("Clears all currently selected apps, and only then selects the apps from the specified list") — [Happ app management docs](https://www.happ.su/main/dev-docs/app-management).
- Happ note: JSON configs are passed straight to Xray and "standard HAPP routing rules and interface settings are not applied to the JSON file" — [Happ link docs](https://www.happ.su/main/dev-docs/examples-of-links-and-parameters).
- v2RayTun: per-app rules in app — [search summary / Play](https://play.google.com/store/apps/details?id=com.v2raytun.android&hl=en_US).
- Super Proxy: per-app include/exempt controls in UI — [proxys.io](https://proxys.io/en/blog/proxy-settings/setting-up-a-proxy-on-android-with-super-proxy).
- Hiddify: can route "selected app traffic" — [Play](https://play.google.com/store/apps/details?id=app.hiddify.com).

### Inferences
- Happ is the only app found where HotelMozil could, via a subscription it hosts, set `per-app-proxy-mode: on` and `per-app-proxy-list-set: com.agoda.mobile.consumer,com.booking` so the user never opens the app picker.
- (UNVERIFIED) mihomo TUN config supports `include-package`/`exclude-package`, but Clash Meta for Android uses its own VpnService with an "Access control" UI; whether YAML package lists apply in CMFA is not confirmed. sing-box TUN inbound supports `include_package`, but Hiddify generates its own config, so a profile's package list probably doesn't apply there.

### Gaps
- Whether v2RayTun subscriptions can carry per-app lists (it copies many Happ/Remnawave conventions, but no doc found).

## Q4. Import via deep link / subscription / QR, and automation intents

### Takeaway
v2rayNG (`v2rayng://install-config|install-sub`), Clash Meta (`clash://` / `clashmeta://install-config`), Hiddify (hiddify/v2ray/clash/sing-box schemes), Happ (`happ://...`, incl. encrypted `happ://crypto`), v2RayTun (deep link) all support one-tap import. Only v2rayNG (Tasker plugin) and Clash Meta (START/STOP/TOGGLE intents) have documented connect/disconnect automation; Happ has `happ://toggle_without_ui`.

### Cited Findings
- v2rayNG manifest: UrlSchemeActivity handles VIEW `v2rayng://install-config` and `v2rayng://install-sub`, plus SEND text/plain; TaskerActivity/TaskerReceiver (Locale plugin EDIT_SETTING/FIRE_SETTING); QS tile; widget; BootReceiver — [AndroidManifest.xml](https://raw.githubusercontent.com/2dust/v2rayNG/master/V2rayNG/app/src/main/AndroidManifest.xml).
- Clash Meta for Android manifest: exported ExternalControlActivity with schemes `clash://`, `clashmeta://`, host `install-config`, and actions `com.github.metacubex.clash.meta.action.START_CLASH`, `STOP_CLASH`, `TOGGLE_CLASH` — [AndroidManifest.xml](https://raw.githubusercontent.com/MetaCubeX/ClashMetaForAndroid/main/app/src/main/AndroidManifest.xml).
- Hiddify manifest: MainActivity VIEW/BROWSABLE for schemes `hiddify`, `v2ray`, `v2rayn`, `v2rayng`, `clash`, `clashmeta`, `sing-box`; QS tile; no connect/disconnect intents found — [AndroidManifest.xml](https://raw.githubusercontent.com/hiddify/hiddify-app/main/android/app/src/main/AndroidManifest.xml). (Hiddify also claims `v2rayng://` — conflicts with v2rayNG if both installed.)
- Happ: encrypted subscription links `happ://crypto...`; routing profile links from routing.happ.su; release notes mention fixes for `happ://onadd` and `happ://toggle_without_ui` — [Happ adding config FAQ](https://www.happ.su/main/faq/adding-configuration-subscription); [Happ routing docs](https://www.happ.su/main/dev-docs/routing); [SourceForge mirror of release notes](https://sourceforge.net/app/happ-proxy-utility/android/).
- v2RayTun: deep link, QR, clipboard import — [DigneZzZ/v2raytun](https://github.com/DigneZzZ/v2raytun).

### Inferences
- Happ's encrypted link (`happ://crypto…`) would let HotelMozil deliver the DataImpulse credentials without exposing them in plain text in the URL (obfuscation only; the app must decrypt it on device).
- Exact v2RayTun scheme (`v2raytun://import/<url>`) is (UNVERIFIED).

### Gaps
- Super Proxy, Drony, NetGuard: no deep-link or config-import mechanism found; setup is manual UI (host, port, user, password, app picker).
- Happ full deep-link list (add, on/off) — docs page fetched did not list them verbatim.

## Q5. Reputation/perception risk and tap counts (fresh user to Agoda routed)

### Takeaway
Happ via a HotelMozil-hosted subscription is the lowest-tap Play path (about 6–8 taps, no app picking); Super Proxy is the most "neutral-looking" but needs manual entry of 4 fields and an app picker (about 15+ taps plus typing). The v2ray/Clash family carries "circumvention tool" perception and, for v2rayNG/NekoBox/CMFA, sideloading.

### Cited Findings
- v2rayNG users say Play install/updates "engender more trust" than GitHub APKs — [Issue #4653](https://github.com/2dust/v2rayNG/issues/4653).
- NekoBox Play listing flagged as unofficial by developer (per search summary) — [IzzyOnDroid](https://android.izzysoft.de/repo/apk/moe.nb4a).
- Hiddify: free, no ads — [Play](https://play.google.com/store/apps/details?id=app.hiddify.com).

### Inferences (tap counts are estimates, not measured on device)
- **Happ (Play)**: open Play link (1) → Install (2) → Open (3) → back in HotelMozil tap "Connect" which fires `happ://add/<subscription-url>` (4) → confirm add (5) → tap connect (6) → Android VPN consent "OK" (7). Per-app list comes from subscription header. ≈7 taps.
- **Hiddify / v2RayTun / v2rayNG**: same as above plus per-app screen: open settings → per-app proxy → enable → search Agoda → tick → search Booking → tick → back ≈ 7 extra taps, total ≈ 14; v2rayNG adds sideload steps (browser download, "allow unknown sources", install) ≈ +5.
- **Super Proxy**: install (3) + add proxy, choose protocol, type host, port, username, password (≈ 7 taps plus typing a long DataImpulse username) + app filter (≈ 5) + start + VPN consent ≈ 17 taps plus typing. No import found.
- **Clash Meta**: sideload (+5) + `clash://install-config?url=` (2) + access control per-app (≈ 7) + start + consent. HotelMozil could fire START_CLASH itself afterwards.
- Perception: Happ/v2RayTun are Russian-market-oriented clients (Happ docs site .su; heavy use with Remnawave panels — inferred from docs) which may look odd to Western users; v2rayNG/Clash/NekoBox are identified with Chinese GFW circumvention. Super Proxy looks like a generic proxy utility.
- Any of these apps' VpnService is the single active VPN; the user can't also run another VPN.

### Gaps
- Battery/stability data per app: no sources found.
- Ads/IAP in Super Proxy, Happ, v2RayTun: not verified (Play pages not readable).
- On-device verification of tap counts and of Happ per-app header actually applying on Android.
