package example.vanitas.ble

import android.Manifest
import android.annotation.SuppressLint
import android.bluetooth.*
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import java.util.UUID

/** Read-only demonstration. Caller provides user-selected BluetoothDevice.
 * Runtime Bluetooth permissions and scanning/selection UI belong in the host app.
 */
class BleBatteryReader(private val context: Context) {
    private val batteryService = UUID.fromString("0000180f-0000-1000-8000-00805f9b34fb")
    private val batteryLevel = UUID.fromString("00002a19-0000-1000-8000-00805f9b34fb")
    private var gatt: BluetoothGatt? = null

    @SuppressLint("MissingPermission")
    fun connect(device: BluetoothDevice, report: (Result<Int>) -> Unit) {
        if (Build.VERSION.SDK_INT >= 31 &&
            context.checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
            report(Result.failure(SecurityException("BLUETOOTH_CONNECT permission required")))
            return
        }
        close()
        gatt = device.connectGatt(context, false, object : BluetoothGattCallback() {
            override fun onConnectionStateChange(g: BluetoothGatt, status: Int, newState: Int) {
                if (status != BluetoothGatt.GATT_SUCCESS) {
                    report(Result.failure(IllegalStateException("GATT status $status")))
                    return
                }
                if (newState == BluetoothProfile.STATE_CONNECTED) g.discoverServices()
            }
            override fun onServicesDiscovered(g: BluetoothGatt, status: Int) {
                val c = g.getService(batteryService)?.getCharacteristic(batteryLevel)
                if (status != BluetoothGatt.GATT_SUCCESS || c == null || !g.readCharacteristic(c)) {
                    report(Result.failure(IllegalStateException("Battery characteristic unavailable")))
                }
            }
            private fun readResult(characteristic: BluetoothGattCharacteristic,
                bytes: ByteArray, status: Int) {
                if (characteristic.uuid != batteryLevel) return
                val level = bytes.firstOrNull()?.toInt()?.and(0xff)
                if (status == BluetoothGatt.GATT_SUCCESS && level != null && level in 0..100) {
                    report(Result.success(level))
                } else report(Result.failure(IllegalStateException("Invalid battery reading")))
            }
            @Suppress("DEPRECATION")
            override fun onCharacteristicRead(g: BluetoothGatt,
                characteristic: BluetoothGattCharacteristic, status: Int) {
                readResult(characteristic, characteristic.value ?: byteArrayOf(), status)
            }
            override fun onCharacteristicRead(g: BluetoothGatt,
                characteristic: BluetoothGattCharacteristic, value: ByteArray, status: Int) {
                readResult(characteristic, value, status)
            }
        })
    }
    @SuppressLint("MissingPermission")
    fun close() { gatt?.disconnect(); gatt?.close(); gatt = null }
}
