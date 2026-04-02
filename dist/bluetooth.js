import bleno from 'bleno';
const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const CHAR_UUID = 'abcd1234-ab12-cd34-ef56-abcdef123456';
const characteristic = new bleno.Characteristic({
    uuid: CHAR_UUID,
    properties: ['write'],
    onWriteRequest: (data, offset, withoutResponse, callback) => {
        console.log("Received:", data.toString());
        callback(bleno.Characteristic.RESULT_SUCCESS);
    }
});
bleno.on('stateChange', (state) => {
    console.log("Bluetooth state:", state);
    if (state === 'poweredOn') {
        bleno.startAdvertising('ScoutingServer', [SERVICE_UUID]);
    }
    else {
        bleno.stopAdvertising();
    }
});
bleno.on('advertisingStart', (error) => {
    if (!error) {
        bleno.setServices([
            new bleno.PrimaryService({
                uuid: SERVICE_UUID,
                characteristics: [characteristic]
            })
        ]);
        console.log("Advertising started");
    }
});
//# sourceMappingURL=bluetooth.js.map