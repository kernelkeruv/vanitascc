import Foundation
import CoreBluetooth

/// Minimal read-only BLE battery adapter for an iOS app.
/// Host UI must ask the user to choose a peripheral before calling connect.
/// Add NSBluetoothAlwaysUsageDescription to the host app Info.plist.
final class BleBatteryReader: NSObject, CBCentralManagerDelegate, CBPeripheralDelegate {
    private var central: CBCentralManager!
    private var peripheral: CBPeripheral?
    private let service = CBUUID(string: "180F")
    private let level = CBUUID(string: "2A19")
    var onValue: ((Int) -> Void)?
    override init() {
        super.init()
        central = CBCentralManager(delegate: self, queue: .main)
    }
    func centralManagerDidUpdateState(_ central: CBCentralManager) { }
    func connect(_ chosen: CBPeripheral) {
        guard central.state == .poweredOn else { return }
        peripheral = chosen
        chosen.delegate = self
        central.connect(chosen)
    }
    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        peripheral.discoverServices([service])
    }
    func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        guard error == nil else { return }
        peripheral.services?.filter { $0.uuid == service }.forEach {
            peripheral.discoverCharacteristics([level], for: $0)
        }
    }
    func peripheral(_ peripheral: CBPeripheral,
                    didDiscoverCharacteristicsFor service: CBService, error: Error?) {
        guard error == nil else { return }
        service.characteristics?.filter { $0.uuid == level }.forEach {
            peripheral.readValue(for: $0)
        }
    }
    func peripheral(_ peripheral: CBPeripheral,
                    didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
        guard error == nil, characteristic.uuid == level,
              let value = characteristic.value?.first, value <= 100 else { return }
        onValue?(Int(value))
    }
    func disconnect() {
        if let peripheral { central.cancelPeripheralConnection(peripheral) }
        peripheral = nil
    }
}
