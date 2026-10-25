# Mobile and IoT contribution plan

## Scope of this pull request

- Fix mobile zoom and touch usability on the existing static pages.
- Add a local-first progressive web application (PWA) shell.
- Add explicit-consent browser Web Bluetooth reads for optional standard GATT Battery Service (0x180F) and Heart Rate Service (0x180D).
- Add an OS-routed headphone audio tone test. It does **not** pair headphones or access Bluetooth Classic control profiles.
- Provide native Android and iOS BLE examples, tests and security notes.
- Keep the original source archive unchanged in local working copies.

### Not implemented or promised

No WhatsApp bot implementation, credentials, cloud backend, universal BLE support, iPhone Safari Web Bluetooth, Meta glasses camera/microphone controls, background device scans, headset media controls, signed Android APK or iOS IPA. Real hardware test results are not claimed.

## Proposed follow-up pull requests

1. **Native Android app:** Kotlin, Android 12+ `BLUETOOTH_SCAN` and `BLUETOOTH_CONNECT` runtime prompts, lifecycle-safe `BluetoothGatt`, device ownership policy, OS audio route tests, and Gradle build/CI.
2. **Native iOS app:** SwiftUI, Core Bluetooth and `NSBluetoothAlwaysUsageDescription`, AVAudioSession audio routing, app capability/permission tests, Xcode project and signing documentation.
3. **Meta wearables adapter:** official Meta Wearables Device Access Toolkit, support checking per device, mock device tests, explicit camera/audio consent and data-minimization policy. No private/proprietary BLE command guessing.
4. **Other IoT devices:** allowlisted GATT plugins and optionally authenticated MQTT/Matter gateway; distinguish local radio control from cloud connectivity. No publicly exposed broker or arbitrary remote command execution.
5. **Security hardening:** device permission revocation paths, automated dependency checks/SBOM, Content Security Policy regression test, native release signing, data retention tests and privacy threat model.

## Security principles

User gesture before device chooser; explicit sensor consent; least-privilege reads; no telemetry; no hidden recording; no persistent biometric data; keep the phone OS as the authoritative media route; do not treat browser sensor APIs as medical instrumentation; never hard-code API tokens, service-account keys or WhatsApp sessions.

## Testing

```bash
python3 -m unittest discover -s tests -v
node --check assets/js/device-lab.js
node --check service-worker.js
node tests/test_device_lab_mock.cjs
```

Hardware integration testing must be conducted on individually owned or explicitly authorized devices. A secure HTTPS context is required for Android Chrome Web Bluetooth and service workers. iOS Safari does not implement Web Bluetooth.

## Upstream contributions

Upstream: <https://github.com/vanitosm/vanitascc>
Contributor: <https://github.com/kernelkeruv>
The repository archive did not contain a standard LICENSE file. Preserve attributions and seek clarification before distribution beyond GitHub's fork/PR workflow.
