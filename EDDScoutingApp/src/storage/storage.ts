import * as App from "../app.js";

//increase whenever the DB changes
const DB_VERSION: number = 5;
const DB_NAME: string = "Database";

export const MATCH_DATA_STORE_NAME: string = "matchdata";
export const IMAGES_STORE_NAME: string = "images";

export const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      //match data store
      if (!db.objectStoreNames.contains(MATCH_DATA_STORE_NAME)) {
        db.createObjectStore(MATCH_DATA_STORE_NAME, { keyPath: "id" });
      }

      //images store
      if (!db.objectStoreNames.contains(IMAGES_STORE_NAME)) {
        db.createObjectStore(IMAGES_STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}