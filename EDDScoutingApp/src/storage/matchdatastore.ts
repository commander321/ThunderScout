import * as App from "../app.js";
import * as Storage from "./storage.js"
import * as MatchData from "../data/matchdata.js"

/**
 * Save a match to the matches database
 */
export const saveMatch = async (match: MatchData.MatchData): Promise<void> => {
    const db = await Storage.openDatabase();
    const transaction = db.transaction([Storage.MATCH_DATA_STORE_NAME], "readwrite");
    const store = transaction.objectStore(Storage.MATCH_DATA_STORE_NAME);
    console.log(match);
    store.put(match);
}

/**
 * Loads all saved match data into the matchdata.ts file
 */
export const loadAllMatches = async (): Promise<void> => {
  const db = await Storage.openDatabase();
  const transaction = db.transaction([Storage.MATCH_DATA_STORE_NAME], "readonly");
  const store = transaction.objectStore(Storage.MATCH_DATA_STORE_NAME);
  const request = store.getAll();

  request.onsuccess = (event) => {
    const result = (event.target as IDBRequest).result as MatchData.MatchData[];

    for (const match of result) {
        //might need to do something here
    }

    MatchData.addMatches(result);
  }

  request.onerror = (event) => {
    console.error("Could not load match data!");
  }
}