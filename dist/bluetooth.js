import * as matchdata from "./matchdata.js";
async function bluetoothSend(json) {
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
        const server = await device.gatt?.connect();
        // Step 3: Get service
        const service = await server?.getPrimaryService(SERVICE_UUID);
        // Step 4: Get characteristic
        const characteristic = await service?.getCharacteristic(CHAR_UUID);
        // Step 5: Send test data
        const chunks = chunkString(json);
        const encoder = new TextEncoder();
        await writeWithRetry(characteristic, encoder.encode("START"));
        //characteristic.writeValue(encoder.encode("START"));
        for (const chunk of chunks) {
            await writeWithRetry(characteristic, encoder.encode(chunk));
            //characteristic.writeValue(encoder.encode(chunk));
            await new Promise(r => setTimeout(r, 30)); //wait for 30 ms to prevent errors from sending data too fast
        }
        await writeWithRetry(characteristic, encoder.encode("END"));
        //await characteristic.writeValue(encoder.encode("END"));
        console.log("Sent:", json);
    }
    catch (error) {
        console.error("Bluetooth error:", error);
    }
}
function chunkString(str, size = 100) {
    const chunks = [];
    for (let i = 0; i < str.length; i += size) {
        chunks.push(str.slice(i, i + size));
    }
    return chunks;
}
async function writeWithRetry(characteristic, data, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            await characteristic.writeValue(data);
            return true;
        }
        catch (error) {
            console.log("Write failed, retrying...", i + 1);
            await new Promise(r => setTimeout(r, 50)); //wait 50 ms and retry if it doesn't work
        }
    }
    throw new Error("Failed to send data after 3 retries");
}
/**
 * Sends the current match data over bluetooth
 */
export function sendCurrentMatch() {
    const data = matchdata.getCurrentMatch();
    const json = JSON.stringify(data, null, 2);
    bluetoothSend(json);
}
/**
 * Sets up the bluetooth test button (which just sends current match data)
 */
function setupBluetoothButton() {
    let button = document.getElementById("bluetooth");
    if (!button)
        return;
    button.onclick = sendCurrentMatch;
}
setupBluetoothButton();
//# sourceMappingURL=bluetooth.js.map