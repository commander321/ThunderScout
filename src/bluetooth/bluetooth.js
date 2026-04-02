/*async function bluetooth() {
  // Example for standard SPP or custom RFCOMM
  navigator.bluetooth.requestDevice({
    filters: [{ services: ['c4ac41e1-0000-1000-8000-00805f9b34fb'] }]
  })

  /*
  const port = await navigator.serial.requestPort({
   // allowedBluetoothServiceClassIds: ["c4ac41e1-0000-1000-8000-00805f9b34fb"], // Optional: for custom services
    allowedBluetoothServiceClassIds: ["00001101-0000-1000-8000-00805f9b34fb"],
    filters: [{ bluetoothServiceClassId: "00001101-0000-1000-8000-00805f9b34fb" }] // Standard SPP UUID 00001101-0000-1000-8000-00805f9b34fb
  });
  await port.open({ baudRate: 9600 }); // Baud rate is often ignored for Bluetooth but required by the API
  const writer = port.writable.getWriter();
  const data = new TextEncoder().encode("Hello Bluetooth Classic");
  await writer.write(data);
  writer.releaseLock();

}

document.getElementById("bluetooth").onclick = bluetooth;*/

/*
const bleno = require('bleno');

const CHARACTERISTIC_UUID = 'abcd1234-ab12-cd34-ef56-abcdef123456';

const characteristic = new bleno.Characteristic({
  uuid: CHARACTERISTIC_UUID,
  properties: ['write'],
  onWriteRequest: (data, offset, withoutResponse, callback) => {
    console.log("Received:", data.toString());
    callback(bleno.Characteristic.RESULT_SUCCESS);
  }
});

async function startBluetooth() {
  bleno.on('stateChange', (state) => {
    if (state === 'poweredOn') {
      bleno.startAdvertising('MyDevice', ['12345678-1234-1234-1234-123456789abc']);
    }
  });

  bleno.on('advertisingStart', () => {
    bleno.setServices([
      new bleno.PrimaryService({
        uuid: '12345678-1234-1234-1234-123456789abc',
        characteristics: [characteristic]
      })
    ]);
  });
}

document.getElementById("bluetooth").onclick = bluetooth;*/

async function testBluetoothSend() {
  try {
    const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
    const CHAR_UUID = 'abcd1234-ab12-cd34-ef56-abcdef123456';

    // Step 1: Ask user to pick the device
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [SERVICE_UUID]
    });

    console.log("Connected to:", device.name);

    // Step 2: Connect to GATT server
    const server = await device.gatt.connect();

    // Step 3: Get service
    const service = await server.getPrimaryService(SERVICE_UUID);

    // Step 4: Get characteristic
    const characteristic = await service.getCharacteristic(CHAR_UUID);

    // Step 5: Send test data
    const message = "Hello from scouting app!";
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    await characteristic.writeValue(data);

    console.log("Sent:", message);

  } catch (error) {
    console.error("Bluetooth error:", error);
  }
}

document.getElementById("bluetooth").onclick = testBluetoothSend;