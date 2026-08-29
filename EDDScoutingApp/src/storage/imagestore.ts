import * as App from "../app.js";
import * as Storage from "./storage.js"

interface Image {
  id: string;
  data: Blob;
  tempURL: string;
}

let images: Map<string, Image> = new Map<string, Image>();

/**
 * Add an image to the images database
 */
export const uploadImage = async (id: string, file: File): Promise<void> => {
  const db = await Storage.openDatabase();
  const reader = new FileReader();

  reader.readAsArrayBuffer(file);
  reader.onload = async () => {
    const blob = new Blob([reader.result as ArrayBuffer], { type: file.type });

    const imageRecord: Image = {
      id,
      data: blob,
      tempURL: URL.createObjectURL(blob),
    };

    const transaction = db.transaction([Storage.IMAGES_STORE_NAME], "readwrite");
    const store = transaction.objectStore(Storage.IMAGES_STORE_NAME);
    store.put(imageRecord);

    images.set(id, imageRecord);
    App.renderPreview();
    App.renderEditor();
  };
};

/**
 * Delete an image from the database based on its id
 */
export const deleteImage = async (id: string): Promise<void> => {
  const db = await Storage.openDatabase();
  const transaction = db.transaction([Storage.IMAGES_STORE_NAME], "readwrite");
  const store = transaction.objectStore(Storage.IMAGES_STORE_NAME);

  const request = store.delete(id);

  request.onsuccess = () => {
    images.delete(id);
  }

  request.onerror = () => {
    console.error("Could not delete image " + id);
  }
}

/**
 * Get the url of an image (to put in the src of an image element). 
 * The url's change every time they are loaded.
 */
export function getImageURL(id: string): string {
  return images.get(id)?.tempURL || "";
}

/**
 * Loads all saved images and creates url's for them. 
 */
export const loadImages = async (): Promise<void> => {
  const db = await Storage.openDatabase();
  const transaction = db.transaction([Storage.IMAGES_STORE_NAME], "readonly");
  const store = transaction.objectStore(Storage.IMAGES_STORE_NAME);
  const request = store.getAll();

  request.onsuccess = (event) => {
    const result = (event.target as IDBRequest).result as Image[];

    for (const image of result) {
      const url = URL.createObjectURL(image.data);
      image.tempURL = url;
      images.set(image.id, image);
    }

    App.renderPreview();
  }

  request.onerror = (event) => {
    console.error("Could not load images!");
  }
}

/**
 * Gets all images that are loaded
 */
export function getImages(): Image[] {
  return [...images.values()];
}