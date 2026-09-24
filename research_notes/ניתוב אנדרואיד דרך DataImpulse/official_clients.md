# Handing tunnel config to official VPN clients on Android (WireGuard, Outline, sing-box SFA): only Agoda/Booking routed

Method: shallow clones of the three repos were read directly (WireGuard/wireguard-android @ e7b3a3c, 2026-03-17; SagerNet/sing-box-for-android @ 3295b6b, 2026-09-24, version 1.15.0-alpha.8; OutlineFoundation/outline-apps @ 95dbc8c, 2026-09-16). Play Store metadata was scraped from play.google.com (hl=en, gl=US) on 2026-09-24. Line references are to files in those repos. Target apps: `com.agoda.mobile.consumer`, `com.booking`.

## Q1. Play availability, publisher, installs, maintenance (2025-2026)

### Takeaway
All three are on Google Play and actively maintained in 2026. WireGuard: 10M+ installs, last updated Mar 2026. Outline: 5M+, Sep 2026. sing-box SFA: 1M+, Sep 2026, published under the developer name "Metamerism".

### Cited Findings
- WireGuard (`com.wireguard.android`): publisher "WireGuard Development Team", 10M+ downloads, "Updated on Mar 15, 2026" — [Play listing](https://play.google.com/store/apps/details?id=com.wireguard.android&hl=en)
- WireGuard source version `wireguardVersionName=1.0.20260315` (gradle.properties). Last commit 2026-03-17. The app is Apache-2.0 ("SPDX-License-Identifier: Apache-2.0" in the manifest header, and COPYING is Apache 2.0) — [wireguard-android](https://github.com/WireGuard/wireguard-android)
- Outline (`org.outline.android.client`): publisher "Outline Foundation", 5M+ downloads, "Updated on Sep 2, 2026" — [Play listing](https://play.google.com/store/apps/details?id=org.outline.android.client&hl=en)
- The Outline repo moved from Jigsaw-Code to the OutlineFoundation org (old issue URLs redirect). Android work is active: "upgrade to cordova-android 15.1.0 and targetSdk 36 (#2828)" (2026-08-31), "android localStorage Migration from Cordova(file://) to Capacitor (#2834)" (2026-09-15), and a new Capacitor Android app (#2783, 2026-07-29). License is Apache 2.0 — [outline-apps](https://github.com/OutlineFoundation/outline-apps)
- sing-box SFA (`io.nekohasekai.sfa`): developer shown as "Metamerism", 1M+ downloads, "Updated on Sep 15, 2026" — [Play listing](https://play.google.com/store/apps/details?id=io.nekohasekai.sfa&hl=en)
- The SFA repo was bumped to 1.15.0-alpha.8 (VERSION_CODE 740) on 2026-09-24. It is GPLv3 with an added clause: "no derivative work may use the name or imply association" (LICENSE line 16) — [sing-box-for-android](https://github.com/SagerNet/sing-box-for-android)
- The SFA Play build flavor strips `QUERY_ALL_PACKAGES` (app/src/play/AndroidManifest.xml, comment "Remove QUERY_ALL_PACKAGES permission for Play Store build") — [sing-box-for-android](https://github.com/SagerNet/sing-box-for-android/blob/main/app/src/play/AndroidManifest.xml)

### Inferences
- "Metamerism" is the Play developer account behind SFA. It is not an obvious brand to end users, which may cost some trust at install time compared with "WireGuard Development Team".
- Without QUERY_ALL_PACKAGES, the Play build's app picker may list fewer apps. That doesn't matter if the package names are hard-coded in the config (see Q2).

### Gaps
- Exact Play install figures beyond the bucket (10M+/5M+/1M+) and ratings were not extracted.
- Whether the Play build of SFA is the stable 1.12/1.13 line or a beta/alpha track was not checked (the repo HEAD is an alpha).

## Q2. Per-app split tunneling (route only Agoda + Booking)

### Takeaway
WireGuard (via `IncludedApplications` in the .conf) and sing-box (via `include_package` on the tun inbound) both support allow-listing packages natively, and both map it to `VpnService.Builder.addAllowedApplication`. Outline has no per-app support: it tunnels the whole device and excludes only itself. With Outline, all device traffic would go through the relay and DataImpulse metered bandwidth.

### Cited Findings
- WireGuard parses `IncludedApplications` and `ExcludedApplications` in the [Interface] section (tunnel/src/main/java/com/wireguard/config/Interface.java:84-87). Setting both is rejected (Interface.java:317, `if (!includedApplications.isEmpty() && !excludedApplications.isEmpty())`) — [Interface.java](https://github.com/WireGuard/wireguard-android/blob/master/tunnel/src/main/java/com/wireguard/config/Interface.java)
- GoBackend applies them with `builder.addDisallowedApplication(...)` / `builder.addAllowedApplication(includedApplication)` (GoBackend.java:301-304) — [GoBackend.java](https://github.com/WireGuard/wireguard-android/blob/master/tunnel/src/main/java/com/wireguard/android/backend/GoBackend.java)
- sing-box tun `include_package`: "Limit android packages in route". It requires `auto_route` and is Android-only. `exclude_package` is the inverse. The docs warn that `route_address_set`/`route_exclude_address_set` don't work in Android graphical clients — [sing-box tun docs](https://sing-box.sagernet.org/configuration/inbound/tun/)
- SFA VPNService iterates `options.includePackage` and calls `builder.addAllowedApplication(nextPackage)`. It does the same for exclude with `addDisallowedApplication` (app/src/main/java/io/nekohasekai/sfa/bg/VPNService.kt:140-161) — [VPNService.kt](https://github.com/SagerNet/sing-box-for-android/blob/main/app/src/main/java/io/nekohasekai/sfa/bg/VPNService.kt)
- SFA also has a user-side "Per-app proxy" profile-override screen (compose/screen/profileoverride/PerAppProxyScreen.kt, settings keys in database/Settings.kt) — [sing-box-for-android](https://github.com/SagerNet/sing-box-for-android)
- Outline VpnTunnelService builds the interface with `.setBlocking(true).addDisallowedApplication(this.getPackageName())`, which excludes only itself. The client code contains no `addAllowedApplication` (grep across client/) — [VpnTunnelService.java](https://github.com/OutlineFoundation/outline-apps/blob/master/client/src/cordova/android/OutlineAndroidLib/outline/src/main/java/org/outline/vpn/VpnTunnelService.java)
- The Outline config reference (client/config.md) defines tunnels, transports, endpoints, dialers and Shadowsocks/websocket strategies. It has no application or package-routing key — [config.md](https://github.com/OutlineFoundation/outline-apps/blob/master/client/config.md)

### Inferences
- Example WireGuard stanza: `IncludedApplications = com.agoda.mobile.consumer, com.booking`. Every other app bypasses the VPN entirely at the OS level, so it gets no leak protection but also costs no relay bandwidth.
- Example sing-box: `"inbounds":[{"type":"tun","auto_route":true,"include_package":["com.agoda.mobile.consumer","com.booking"], ...}]`, plus an outbound to the relay (for example shadowsocks, vless, or an http/socks outbound). sing-box can also enforce per-package routing inside route rules (`package_name`) as a second layer. That route-rule field is from general sing-box knowledge and was not re-verified in this pass.
- (Unverified) If a user turns on SFA's own Per-app proxy override, it may replace the profile's include_package list. The precedence was not traced into libbox.
- Outline is disqualified for the "only Agoda/Booking" requirement unless the relay itself filters by destination. Filtering by destination (for example Agoda/Booking domains only) is possible on the relay side, but everything still traverses the tunnel.

### Gaps
- Whether Agoda/Booking use auxiliary packages (for example WebView providers or Google Play Services for some calls) whose traffic would escape an app allow-list was not researched.

## Q3. Config import methods (deep links, file intents, QR, providers)

### Takeaway
- sing-box: the richest option. It registers a `sing-box://import-remote-profile` deep link, ACTION_VIEW for content:// and file:// files, ACTION_SEND/SEND_MULTIPLE for any MIME type, and QR.
- Outline: registers `ss://`, `ssconf://` and one https invite URL.
- WireGuard: no VIEW or SEND intent filter at all. Import is only from inside the app, via file/zip picker, QR scan or manual entry, so another app cannot push a .conf into it.

### Cited Findings
- WireGuard MainActivity intent filters are only MAIN/LAUNCHER and QS_TILE_PREFERENCES. There is no `android.intent.action.VIEW` or `SEND` anywhere in ui/src/main/AndroidManifest.xml — [AndroidManifest.xml](https://github.com/WireGuard/wireguard-android/blob/master/ui/src/main/AndroidManifest.xml)
- WireGuard import paths: `TunnelImporter.importTunnel(contentResolver, uri)` from a document picker result, and `importTunnel(parentFragmentManager, result.text)` from a QR scan (TunnelListFragment.kt:63-80). It uses the zxing `CaptureActivity` for QR — [TunnelListFragment.kt](https://github.com/WireGuard/wireguard-android/blob/master/ui/src/main/java/com/wireguard/android/fragment/TunnelListFragment.kt)
- WireGuard declares managed-config (MDM) restrictions (`android.content.APP_RESTRICTIONS`). The only key is `disable_config_export` (bool), so MDM cannot push tunnels — [app_restrictions.xml](https://github.com/WireGuard/wireguard-android/blob/master/ui/src/main/res/xml/app_restrictions.xml)
- sing-box MainActivity handles VIEW with `android:scheme="sing-box" android:host="import-remote-profile"` (DEFAULT + BROWSABLE), and separately VIEW with scheme file/content and mimeType `application/octet-stream` / `text/*` (with priorities 999 and 998). ShareActivity takes `SEND`/`SEND_MULTIPLE` with `mimeType="*/*"` — [AndroidManifest.xml](https://github.com/SagerNet/sing-box-for-android/blob/main/app/src/main/AndroidManifest.xml)
- Link format: `sing-box://import-remote-profile?url=urlEncodedURL#urlEncodedName` — [sing-box clients/general](https://sing-box.sagernet.org/clients/general/)
- In code, the deep link is parsed by `Libbox.parseRemoteProfileImportLink` and then shows an AlertDialog: "Are you sure to import remote profile %1$s? You will connect to %2$s to download the configuration." (MainActivity.kt:285-294, 560-590; strings.xml:132) — [MainActivity.kt](https://github.com/SagerNet/sing-box-for-android/blob/main/app/src/main/java/io/nekohasekai/sfa/compose/MainActivity.kt)
- A local file via VIEW goes to `ProfileImportHandler.parseUri`. It accepts raw sing-box JSON (`isJsonConfiguration`) or the binary ProfileContent format, then shows a confirm dialog. The QR path accepts a sing-box:// link, a plain http(s) URL (treated as a remote profile), or ProfileContent — [ProfileImportHandler.kt](https://github.com/SagerNet/sing-box-for-android/blob/main/app/src/main/java/io/nekohasekai/sfa/compose/screen/configuration/ProfileImportHandler.kt)
- Outline intent filters (client/config.xml, injected into MainActivity): VIEW + BROWSABLE for `ss`, for `ssconf`, and for `https://s3.amazonaws.com/outline-vpn/invite.html`. The Capacitor manifest mirrors this — [config.xml](https://github.com/OutlineFoundation/outline-apps/blob/master/client/config.xml), [Capacitor manifest](https://github.com/OutlineFoundation/outline-apps/blob/master/client/capacitor/android/app/src/main/AndroidManifest.xml)
- Outline's deep-link path calls `confirmAddServer`, which opens `addServerView` (a confirm dialog) and does not add silently. Clipboard auto-detection ignores bare `https://` keys ("Non-Invite https:// keys should be pasted in explicitly.") — [app.ts](https://github.com/OutlineFoundation/outline-apps/blob/master/client/web/app/app.ts)
- Outline accepts `ssconf://` and `https://` dynamic keys, converting ssconf:// to https:// before fetching (config.ts:117-133) — [config.ts](https://github.com/OutlineFoundation/outline-apps/blob/master/client/web/app/outline_server_repository/config.ts)

### Inferences
- From HotelMozil you can launch sing-box import with `startActivity(Intent(ACTION_VIEW, Uri.parse("sing-box://import-remote-profile?url=...#HotelMozil")))`. Outline works the same way with `ssconf://...`. Both also work from a web page link (BROWSABLE).
- For WireGuard the best you can do is save the .conf to Downloads (or share it via a Files app) and instruct the user to open WireGuard, tap +, "Import from file or archive" and pick it. A QR code doesn't help on the same phone unless it is shown on a second screen.

### Gaps
- The exact WireGuard FAB menu labels were not re-verified in strings.xml. They are recalled as "Import from file or archive / Scan from QR code / Create from scratch".

## Q4. Remote / centrally updatable profiles

### Takeaway
sing-box remote profiles fetch a URL you control and auto-update. In the current SFA code auto-update defaults to ON every 60 minutes (minimum 15), and the profile is auto-selected on creation. Outline dynamic keys (ssconf) also fetch from your URL, but have a history of Android breakage and caching bugs. WireGuard has no remote config: any server change needs a re-import.

### Cited Findings
- The spec says: "the graphical client must implement automatic profile update (default interval is 60 minutes) and HTTP Basic authorization" — [sing-box clients/general](https://sing-box.sagernet.org/clients/general/)
- SFA NewProfileUiState defaults: `autoUpdate: Boolean = true`, `autoUpdateInterval: Int = 60`, with the interval coerced to at least 15. `createRemoteProfile` fetches the URL (it "MUST succeed"), runs `Libbox.checkConfig`, calls `ProfileManager.create(profile, andSelect = true)` and schedules `UpdateProfileWork` — [NewProfileViewModel.kt](https://github.com/SagerNet/sing-box-for-android/blob/main/app/src/main/java/io/nekohasekai/sfa/compose/screen/configuration/NewProfileViewModel.kt)
- Outline DynamicServiceConfig "has the location to fetch the tunnel config" (`transportConfigLocation`) — [config.ts](https://github.com/OutlineFoundation/outline-apps/blob/master/client/web/app/outline_server_repository/config.ts). Dynamic keys store connection info remotely so it can be changed — [Google/Outline dynamic access keys guide](https://developers.google.com/outline/docs/guides/service-providers/dynamic-access-keys)
- Known Outline dynamic-key bugs:
  - #2373, opened 2025-02-09: "Broken ssconf:// dynamic config on latest Android Outline beta update (1.15.0)", error "InvalidServiceConfiguration: failed to create transport". It was closed via PR #2380 — [issue #2373](https://github.com/OutlineFoundation/outline-apps/issues/2373)
  - #2266: "Previously working dynamic keys no longer accepted in Outline Client 1.14.0" — [issue #2266](https://github.com/OutlineFoundation/outline-apps/issues/2266)
  - #1591 and #1627: the client prioritizes a cached dynamic key over the online version — [issue #1591](https://github.com/OutlineFoundation/outline-apps/issues/1591), [issue #1627](https://github.com/OutlineFoundation/outline-apps/issues/1627)

### Inferences
- With sing-box, HotelMozil can change country/exit (a different DataImpulse port or credential on the relay) by editing the JSON served at its URL. Clients pick it up within about 60 minutes, or right away if the user taps update. Whether a running tunnel is restarted automatically after an update was not verified.
- Most country switching can live on the relay itself (the relay picks the DataImpulse country), which keeps the client config static for all three clients.

### Gaps
- Whether SFA hot-reloads the running service after a background profile update is unverified.
- Which Outline version fixed #2373 was not captured.

## Q5. Automation / control from a third-party app

### Takeaway
Only WireGuard exposes a documented control API: the broadcasts SET_TUNNEL_UP/DOWN/REFRESH_TUNNEL_STATES, gated by a dangerous-level permission plus a user toggle that is off by default. It can toggle only existing tunnels by name; it cannot import. sing-box and Outline expose no external start/stop API. Only their internal non-exported service actions, Quick Settings tiles and the system Always-on VPN setting are available.

### Cited Findings
- WireGuard declares `<permission android:name="${applicationId}.permission.CONTROL_TUNNELS" android:protectionLevel="dangerous">`. The exported `TunnelManager$IntentReceiver` requires that permission and handles `com.wireguard.android.action.REFRESH_TUNNEL_STATES`, `SET_TUNNEL_UP` and `SET_TUNNEL_DOWN` — [AndroidManifest.xml](https://github.com/WireGuard/wireguard-android/blob/master/ui/src/main/AndroidManifest.xml)
- The receiver returns early unless `UserKnobs.allowRemoteControlIntents` is true. The tunnel is looked up via the string extra `"tunnel"`, and nothing happens if that name is missing (TunnelManager.kt:214-240) — [TunnelManager.kt](https://github.com/WireGuard/wireguard-android/blob/master/ui/src/main/java/com/wireguard/android/model/TunnelManager.kt)
- The settings label is "Allow remote control apps" (summary off: "External apps may not toggle tunnels (recommended)", preference key `allow_remote_control_intents`) — [strings.xml](https://github.com/WireGuard/wireguard-android/blob/master/ui/src/main/res/values/strings.xml)
- SFA Action constants are `io.nekohasekai.sfa.SERVICE`, `SERVICE_CLOSE` and `SERVICE_OPEN_URL`. The VPNService and other services are `exported="false"`. The only exported components are MainActivity/ShareActivity, the QS tile service, BootReceiver, a DocumentsProvider (MANAGE_DOCUMENTS) and the Xposed provider — [AndroidManifest.xml](https://github.com/SagerNet/sing-box-for-android/blob/main/app/src/main/AndroidManifest.xml)
- SFA start flow: `VpnService.prepare` is called in MainActivity (`prepare()`, lines 361-375), and on Android 13+ `POST_NOTIFICATIONS` may be requested (line 329) — [MainActivity.kt](https://github.com/SagerNet/sing-box-for-android/blob/main/app/src/main/java/io/nekohasekai/sfa/compose/MainActivity.kt)
- Outline's only exported entry points are MainActivity (launcher plus the ss/ssconf/invite VIEW filters). VpnTunnelService and the boot receiver are `exported="false"` — [Capacitor manifest](https://github.com/OutlineFoundation/outline-apps/blob/master/client/capacitor/android/app/src/main/AndroidManifest.xml)

### Inferences
- To use WireGuard control, HotelMozil would need to:
  1. Declare `<uses-permission android:name="com.wireguard.android.permission.CONTROL_TUNNELS"/>` and request it at runtime (it is a dangerous permission, so the user sees a dialog).
  2. Declare `<queries><package android:name="com.wireguard.android"/></queries>` on Android 11+ to detect and launch the app.
  3. Send an explicit broadcast (`setPackage("com.wireguard.android")`), because a manifest receiver won't get implicit custom broadcasts on Android 8+. This point is general Android behavior, not tested here.
  4. Have the user enable "Allow remote control apps" in WireGuard settings.
  5. Rely on the user having imported a tunnel with a known name.

  That adds steps rather than removing them, so it isn't worth it for the first run.
- For sing-box/Outline, HotelMozil can only deep-link the import and then ask the user to tap Connect. To detect install and launch, declare `<queries>` for `io.nekohasekai.sfa` / `org.outline.android.client`, or for the `sing-box`/`ssconf` schemes.

### Gaps
- Tasker-style or third-party automation plugins for SFA were not investigated.

## Q6. Always-on VPN, consent dialog, one-VPN-at-a-time

### Takeaway
Every client needs the one-time system VPN consent dialog (`VpnService.prepare`). Android runs only one VpnService at a time, so starting any of these clients disconnects another VPN the user has running, and vice versa. Always-on is a system setting the user must enable manually. With a per-app allow-list, always-on plus "block connections without VPN" would affect only the allow-listed apps. That scoping is an inference, not verified.

### Cited Findings
- WireGuard GoBackend has `isAlwaysOn()` and an `AlwaysOnCallback` (Backend.java:64, GoBackend.java:45-69), so it supports system Always-on starts — [GoBackend.java](https://github.com/WireGuard/wireguard-android/blob/master/tunnel/src/main/java/com/wireguard/android/backend/GoBackend.java)
- SFA VPNService fails with "android: missing vpn permission" if `prepare(this) != null`, so consent must come from the UI first (VPNService.kt:59) — [VPNService.kt](https://github.com/SagerNet/sing-box-for-android/blob/main/app/src/main/java/io/nekohasekai/sfa/bg/VPNService.kt)
- The sing-box docs note "VPN takes precedence over tun" and provide `route.override_android_vpn` for the TUN-with-VPN case — [sing-box tun docs](https://sing-box.sagernet.org/configuration/inbound/tun/)
- Android VPN model: one active VPN per user, user consent via `VpnService.prepare()`, and always-on configured in system settings — [Android VPN developer guide](https://developer.android.com/develop/connectivity/vpn). Cited from knowledge of that page; not re-fetched in this pass.

### Inferences
- The conflict risk is real for users who already run a VPN (for example corporate or privacy VPNs). Activating HotelMozil's tunnel kills the other one. This deserves a warning in the UX.
- The consent dialog appears once per VPN app (until revoked), not once per connection.

### Gaps
- Behavior when Agoda/Booking are open while the tunnel starts (existing sockets not migrating) was not tested.

## Q7. Known bugs and licensing constraints if embedding instead

### Takeaway
Outline's ssconf handling has regressed twice (1.14.0, 1.15.0 beta) and has cache-over-remote issues. SFA on Play is GPLv3 with an extra name clause, so embedding sing-box code forces GPL on HotelMozil's app. WireGuard-android and Outline are Apache-2.0, which is embed-friendly (but embedding means using VpnService yourself, which the team wants to avoid).

### Cited Findings
- Outline #2373 (1.15.0 Android beta ssconf "InvalidServiceConfiguration: failed to create transport", 2025-02-09, closed via PR #2380) and #2266 (1.14.0 rejects previously working dynamic keys) — [#2373](https://github.com/OutlineFoundation/outline-apps/issues/2373), [#2266](https://github.com/OutlineFoundation/outline-apps/issues/2266)
- sing-box-for-android LICENSE: GPL ("This program is free software...", copyright 2022 nekohasekai), plus "no derivative work may use the name or imply association" — [LICENSE](https://github.com/SagerNet/sing-box-for-android/blob/main/LICENSE)
- wireguard-android is Apache 2.0 (COPYING), and outline-apps is Apache 2.0 (LICENSE) — [wireguard-android](https://github.com/WireGuard/wireguard-android), [outline-apps](https://github.com/OutlineFoundation/outline-apps)
- Outline Android is mid-migration from Cordova to Capacitor (#2783, #2834 "localStorage Migration from Cordova(file://) to Capacitor"), and a migration like this can cause regressions such as lost saved servers — [outline-apps commits](https://github.com/OutlineFoundation/outline-apps/commits/master)

### Inferences
- The Capacitor migration is a near-term regression risk for Outline users in late 2026. This is inferred from the commit titles, not from bug reports.

### Gaps
- An SFA-specific Android bug survey (for example remote-profile fetch failures, battery kills) was not done.

## Q8. Exact tap counts: fresh user to Agoda routed

### Takeaway
sing-box SFA is the shortest path that satisfies per-app routing plus central updates. It takes about 7-8 taps after install and the steps are fully deep-linkable. Outline is about 5-6 taps but routes the whole device (fails the requirement). WireGuard is about 9-11 taps with a file-picker step, which is the most error-prone, and it has no central updates.

### Cited Findings (basis for the step lists)
- sing-box: deep link, then "Are you sure to import remote profile" dialog (OK), then New Profile screen pre-filled (Remote type, name, URL, autoUpdate on), then "Create" (strings.xml:142 `profile_create`), then auto-selected (`andSelect = true`), then Start, then VPN consent, plus possibly the POST_NOTIFICATIONS prompt — [MainActivity.kt](https://github.com/SagerNet/sing-box-for-android/blob/main/app/src/main/java/io/nekohasekai/sfa/compose/MainActivity.kt), [NewProfileViewModel.kt](https://github.com/SagerNet/sing-box-for-android/blob/main/app/src/main/java/io/nekohasekai/sfa/compose/screen/configuration/NewProfileViewModel.kt)
- Outline: deep link, then the addServerView confirm, then Connect, then VPN consent — [app.ts](https://github.com/OutlineFoundation/outline-apps/blob/master/client/web/app/app.ts)
- WireGuard: no inbound intent, so import happens in-app via the document picker or QR — [TunnelListFragment.kt](https://github.com/WireGuard/wireguard-android/blob/master/ui/src/main/java/com/wireguard/android/fragment/TunnelListFragment.kt)

### Inferences (step counts are derived from the code paths; not tested on a device)
**sing-box SFA** (starting in HotelMozil):
1. Tap "Enable Android routing" in HotelMozil, which opens the Play page for `io.nekohasekai.sfa` if it isn't installed.
2. Tap Install.
3. Return to HotelMozil and tap "Connect", which fires `sing-box://import-remote-profile?url=https://relay.hotelmozil/.../profile.json#HotelMozil`. The first time, Android may show an app chooser if another app claims the scheme.
4. SFA dialog: OK.
5. New Profile screen: Create.
6. Dashboard: Start.
7. System VPN consent: OK.
8. (Android 13+) Notifications permission: Allow. SFA may also show its own first-run or battery-optimization prompts (unverified).

That is about 7-8 taps plus the install wait. After that, one tap on Start (or the QS tile) per session, or zero with Always-on.

**Outline** (does not meet the per-app requirement):
1. Install (about 2 taps).
2. Tap the ssconf:// link in HotelMozil.
3. Add-server confirm.
4. Connect.
5. VPN consent.

That is about 5-6 taps, and all device traffic is tunneled.

**WireGuard:**
1. Install (about 2 taps).
2. In HotelMozil, "Save config", which writes the .conf via a SAF CreateDocument or share sheet (1-2 taps).
3. Open WireGuard.
4. Tap +.
5. "Import from file or archive".
6. Navigate to Downloads and pick the file (1-3 taps).
7. Toggle the tunnel on.
8. VPN consent: OK.

That is about 9-11 taps. Any server change requires repeating the import. Adding remote control costs 3-4 more taps (open WireGuard Settings, enable "Allow remote control apps", and grant the CONTROL_TUNNELS runtime dialog in HotelMozil).

### Gaps
- None of the flows was run on a physical device. The first-run screens of each client (onboarding, privacy, battery prompts) may add taps.
- Whether SFA's New Profile screen needs a scroll before "Create" was not checked.
