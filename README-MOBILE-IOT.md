# VANITAS: mobile and IoT integration assessment

## Confirmed state of supplied ZIP

Two static HTML pages, local CSS/SASS/fonts/images, and two inline browser scripts. No WhatsApp bot engine, API, backend, auth, device drivers, build system, native Android/iOS application, tests, or deployment config were present. This enhancement does not invent or emulate those missing pieces. The original archive is not modified. This derived version retains the original media/fonts and adds optimized image copies, a PWA shell, and a read-only BLE proof of concept.

## Implemented and limitations

| Capability | Android Chrome HTTPS | iPhone Safari HTTPS | Notes |
|---|---|---|---|
| Mobile-responsive landing/about | Yes | Yes | Responsive and zoom enabled |
| Installable PWA/offline shell | Usually | Add to Home Screen | Offline cache includes only static assets; BLE requires radio and browser support |
| BLE chooser (consent) | Yes, compatible BLE devices | No | No background scan; no auto connect |
| Standard GATT battery read | Some peripherals | No | 0x180F/0x2A19; device must expose service |
| Standard GATT heart-rate notifications | Some wearables | No | 0x180D/0x2A37, explicit start/stop |
| Audio test through OS audio route | Yes | Yes | Not headset pairing or controls |
| Ray-Ban Meta sensors/camera | No | No | Separate Meta Wearables Device Access Toolkit in native app |
| WhatsApp messaging | No | No | Bot and WhatsApp platform integration absent |

Data handling: no telemetry, external APIs, localStorage, BLE device persistence, device IDs in event logs, firmware updates, writes, or unauthorized scans. Heart-rate values are volatile and not recorded; do not use for diagnosis.

## Development and testing on Fedora

Files should be copied or saved under `/mnt/vault/SILICON-SERAPHIM/ARCHER/downloads/` on your computer. From that directory, with the extracted directory present, run:

```bash
cd /mnt/vault/SILICON-SERAPHIM/ARCHER/downloads/vanitascc-main
python3 -m http.server --bind 127.0.0.1 8765
```

Then open `http://127.0.0.1:8765/device-lab.html` on the **same computer**. Localhost is a secure context for testing in compatible browsers. For a physical Android phone, `http://<PC-LAN-IP>` is **not** a secure context and Web Bluetooth will be unavailable. Deploy to your own properly configured HTTPS origin for phone testing. A locally bound development server is not reachable from the phone and should not be exposed to the LAN without access controls. On iPhone Safari the demo can display and play the tone, but cannot connect to BLE through Web Bluetooth.

Run offline smoke tests (does not require external dependencies):

```bash
python3 -m unittest discover -s tests -v
node tests/test_device_lab_mock.cjs
```

Do not use `file://` as a substitute for a hosted secure context. No device was physically tested in the preparation of this package.

## Production-ready evolution

Architecture: `PWA frontend -> local/native mobile connector -> explicit per-device adapters -> optional authenticated backend`.

1. Keep BLE operations local by default. Implement per-device capability detection and permission scopes (connect/read/notifies separately). No blanket scanning or broad write access. Use HTTPS/WSS, authN/authZ, and device ownership verification for any remote gateway.
2. Android Kotlin: BluetoothLeScanner + BluetoothGatt, runtime Nearby Devices permission (Android 12+ `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`), explicit cancellation/timeouts, state machine, reconnection policy, battery and characteristics access when exposed. Use CompanionDeviceManager where appropriate. Bluetooth Classic media stays with Android routing/media APIs.
3. iPhone Swift: CoreBluetooth for supported BLE GATT; Info.plist `NSBluetoothAlwaysUsageDescription` with purpose; background BLE only where necessary and permitted. AVAudioSession handles headset media routing, not CoreBluetooth.
4. Ray-Ban Meta Gen 1/2 and other supported glasses: integrate the official Meta Wearables Device Access Toolkit into the native Android/iOS app for permitted camera/audio/sensor capabilities; Meta AI app handles pairing, capabilities depend on model, OS, developer mode and regional support. Use vendor Mock Device Kit to prototype. For Meta Ray-Ban Display, standalone display web apps also exist but are a separate target.
5. Other wearables: standards-based GATT services where advertised, or official vendor APIs for watch data. Many consumer earbuds/glasses expose only proprietary services and no public control interface. Do not assume they expose battery or HR.
6. WhatsApp: if bot features are the goal, provide the actual bot backend repository. Implement messaging via legitimate WhatsApp Business Platform where eligible; separate it entirely from BLE/Meta SDK device permissions. Do not build WhatsApp interception or access to third-party devices.

## Suggested product features after native bridge

* Spoken messages from Android/iOS to an already paired BT headset or approved Meta glass audio session, with explicit activation and clear user controls.
* Device state dashboard: battery, connection quality if officially exposed, supported firmware version, and consented sensor metrics.
* Optional local ML model inference on user-triggered camera streams, with on-device retention defaults, visible capture indication, recording indicator and consent.
* Accessibility: large tap targets, screen reader status, offline capability checks, and power-efficient throttled updates.
* Audit of privileges and lifecycle: permission-denial handling, cleanup on disconnect/background, signed releases, secret-free client, regression matrix and SBOM.

## Deployment headers

Recommended at the HTTPS host/reverse proxy for this static site, test against host requirements:

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
Permissions-Policy: bluetooth=(self), camera=(), microphone=(), geolocation=()
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
```

Notes: old local icon font CSS remains from original site. No remote Google font stylesheet is used in the enhanced version. Prefer byte-identical release artifacts, SHA-256/SHA-512 checksums, and provenance tracking for any evidence-oriented build. There is no server-side component to put secrets into.

## Official references (verified October 2026)

* https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API
* https://caniuse.com/web-bluetooth
* https://developer.android.com/develop/connectivity/bluetooth/bt-permissions
* https://developer.apple.com/documentation/corebluetooth
* https://developer.apple.com/documentation/avfaudio/avaudiosession/categoryoptions-swift.struct/allowbluetootha2dp
* https://developers.meta.com/wearables/faq/
* https://developers.meta.com/wearables/device-access-toolkit/
* https://github.com/facebook/meta-wearables-dat-android
* https://github.com/facebook/meta-wearables-dat-ios

## Copyright and provenance

Original HTML/CSS/assets include author claims and template attribution. Retain original copyright, author notices and licenses when distributing derivatives. This archive includes a technical prototype, not an audited production or certified software product. Confirm license conditions before publishing or commercial reuse.
