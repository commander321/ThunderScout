//old vibecoded Bluetooth system that didn't work very well, will probably delete this

import * as matchdata from "../data/matchdata.js"

/*
async function bluetoothSend(json: string, match: matchdata.MatchData) {

  let device = null;
  let server = null;

  try {
    const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
    const CHAR_UUID = 'abcd1234-ab12-cd34-ef56-abcdef123456';

    // Step 1: Ask user to pick the device
    device = await navigator.bluetooth.requestDevice({
      filters: [{name: "ROBOTICS-07"}],
      optionalServices: [SERVICE_UUID]
    });

    console.log("Connected to: ", device.name);
    bluetoothLog("Connected to: " + device.name);

    //Connect to GATT server
    server = await device.gatt?.connect();

    //wait a bit
    await new Promise(r => setTimeout(r, 500));

    //Get service
    const service = await getServiceWithRetry(server, SERVICE_UUID);

    //Get characteristic
    const characteristic = await service?.getCharacteristic(CHAR_UUID);

    bluetoothLog("Found bluetooth service");

    //Chunk the data
    const chunks = chunkString(json);
    const encoder = new TextEncoder();

    //Send start request and wait until avalible
    bluetoothLog("Sending start request");
    let startTries = 0;
    while (true) {
      console.log("Sending Start request...")
      let recieverAvalible = await startRequest(characteristic);

      if (recieverAvalible) {
        console.log("Request successful!");
        break;
      }

      //if it can't send after 10 tries, then stop
      startTries++;
      if (startTries >= 10) {
        throw new Error("Could not send start request!");
      }

      //if it's busy, wait a little bit and then try again
      bluetoothLog("Receiver is busy. Waiting for other data transfers to finish...");
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 500));
    }
    bluetoothLog("Start request successful. Sending data...");
    console.log("Done with start, sending data");
    //await writeWithRetry(characteristic, encoder.encode("START"));

    for (const chunk of chunks) {
      await writeWithRetry(characteristic, encoder.encode(chunk));
      await new Promise(r => setTimeout(r, 30)); //wait for 30 ms to prevent errors from sending data too fast
    }

    await writeWithRetry(characteristic, encoder.encode("END"));

    console.log("Sent:", json);
    bluetoothLog("Match data successfully transfered!");

    matchdata.removeUnsavedMatch(match);

    //close log when done
    await new Promise(r => setTimeout(r, 5000));
    document.getElementById("bluetooth-status")?.classList.add("hidden");

  } catch (error) {
    console.error("Bluetooth error: ", error);
    bluetoothLog("Bluetooth error: " + error);

    //mark the match as unsaved and save it (but make sure it's only in once)
    matchdata.removeUnsavedMatch(match);
    matchdata.addUnsavedMatch(match);

    //close log if it failed
    await new Promise(r => setTimeout(r, 5000));
    document.getElementById("bluetooth-status")?.classList.add("hidden");
  } finally {
    if (server?.connected) {
      server.disconnect();
      console.log("Bluetooth disconnected");
    }
  }
}

function chunkString(str: string, size = 100) {
  const chunks = [];
  for (let i = 0; i < str.length; i+= size) {
    chunks.push(str.slice(i, i + size));
  }
  return chunks;
}

async function getServiceWithRetry(server: any, uuid: any, attempts = 5) {

  for (let i = 0; i < attempts; i++) {
    try {
      return await server.getPrimaryService(uuid);
    } catch (error) {

      console.log("Attempting to find bluetooth service...");
      bluetoothLog("Attempting to find bluetooth service...")
      await new Promise(r=>setTimeout(r,500));
      continue;

    }
  }

  throw new Error("Could not find bluetooth service after 5 retries");
}

async function writeWithRetry(characteristic: any, data: any, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      await characteristic.writeValue(data);
      return true;
    } catch (error) {
      console.log("Write failed, retrying...", i + 1);
      await new Promise(r => setTimeout(r, 30)); //wait 30 ms and retry if it doesn't work
    }
  }

  bluetoothLog("Failed to send data! It got stuck here: " + data);
  throw new Error("Failed to send data after 5 retries");
}

/**
 * Send the "START" request and returns true if it was successful 
 */
/*
async function startRequest(characteristic: any) {
  try {
    await characteristic.writeValue(new TextEncoder().encode("START"));
    //await writeWithRetry(characteristic, new TextEncoder().encode("START"));
    console.log("Data transfer start request received");
    return true;
  } catch (error) {
    console.log("Could not start data transfer (receiver either busy or broken).")
    return false;
  }

}

/**
 * Sends the current match data over bluetooth. Also tries to send over unsaved matches.
 */
/*
export function sendCurrentMatch() {
  const data: matchdata.MatchData = matchdata.getCurrentMatch();
  const json: string = JSON.stringify(data, null, 2);

  console.log(matchdata.getUnsavedMatches());
  bluetoothSend(json, matchdata.getCurrentMatch());

  //try to send over any matches that weren't saved.

  for (const match of matchdata.getUnsavedMatches()) {
    const unsavedJSON: string = JSON.stringify(match, null, 2);
    bluetoothSend(unsavedJSON, match);
  }
}

/**
 * Sends a match over bluetooth
 */
/*
export function sendMatch(match: matchdata.MatchData) {
  const json: string = JSON.stringify(match, null, 2);

  bluetoothSend(json, match);
}

/**
 * Send multiple matches over bluetooth
 */
/*
export function sendMatches(matches: matchdata.MatchData[]) {
  const json: string = JSON.stringify(matches, null, 2); //THIS PROBABLY DOESNT WORK RIGHT!!!

  bluetoothSend(json);
}
*/

/**
 * Sets up the bluetooth test button (which just sends current match data)
 */
/*
function setupBluetoothButton() {
  let button = document.getElementById("bluetooth");
  if (!button) return;
  button.onclick = sendCurrentMatch;
}

/**
 * Sets the text of the bluetooth status message box
 */
/*
function bluetoothLog(message: string) {
  const bluetoothStatus = document.getElementById("bluetooth-status");
  if (!bluetoothStatus) return;
  if (!(bluetoothStatus instanceof HTMLDivElement)) return;

  bluetoothStatus.textContent = message;
  bluetoothStatus.classList.remove("hidden");
}

setupBluetoothButton();*/