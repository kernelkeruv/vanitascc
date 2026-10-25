# Native adapter examples (not full apps)

These source files are uncompiled demonstrations. They must be integrated into
an Android Studio/Xcode project and verified against device firmware before use.

Android: Add `AndroidManifest.permissions.xml` entries to a real app. Request
`BLUETOOTH_SCAN` and `BLUETOOTH_CONNECT` at runtime on Android 12+. The Kotlin
adapter accepts an already user-selected BluetoothDevice. `neverForLocation`
is only appropriate when scan data does not infer location, and it may filter
some BLE advertisements.

iPhone: `BleBatteryReader.swift` relies on a user-selected CoreBluetooth
CBPeripheral. Add `NSBluetoothAlwaysUsageDescription` and the native scan and
selection UI separately. Build and test in Xcode. Incomplete background,
reconnection, and error-handling support must be added for production.

Both samples read ONLY the standard 0x180F/0x2A19 battery characteristic.
Neither controls headphones, accesses Meta glasses data, nor implements a
WhatsApp bot. Use Meta Wearables Device Access Toolkit in a native app for
supported Meta glasses integrations.
