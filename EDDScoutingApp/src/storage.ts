import * as app from "./app.js";
//For managing local files storage (images, etc)

interface Image {
  id: string;
  data: Blob;
  tempURL: string;
}

let images: Map<string, Image> = new Map<string, Image>();

const openImageDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ImageDB", 3);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      //images store
      if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images", { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

export const uploadImage = async (id: string, file: File): Promise<void> => {
  const db = await openImageDatabase();
  const reader = new FileReader();

  reader.readAsArrayBuffer(file);
  reader.onload = async () => {
    const blob = new Blob([reader.result as ArrayBuffer], { type: file.type });

    const imageRecord: Image = {
      id,
      data: blob,
      tempURL: URL.createObjectURL(blob),
    };

    const transaction = db.transaction(["images"], "readwrite");
    const store = transaction.objectStore("images");
    store.put(imageRecord);

    images.set(id, imageRecord);
    app.renderPreview();
    app.renderEditor();
  };
};

export const deleteImage = async (id: string): Promise<void> => {
  const db = await openImageDatabase();
  const transaction = db.transaction(["images"], "readwrite");
  const store = transaction.objectStore("images");

  const request = store.delete(id);

  request.onsuccess = () => {
    images.delete(id);
  }

  request.onerror = () => {
    console.error("Could not delete image " + id);
  }
}

export function getImageURL(id: string): string {
  return images.get(id)?.tempURL || "";
}

export const loadImages = async (): Promise<void> => {
  const db = await openImageDatabase();
  const transaction = db.transaction(["images"], "readonly");
  const store = transaction.objectStore("images");
  const request = store.getAll();

  request.onsuccess = (event) => {
    const result = (event.target as IDBRequest).result as Image[];

    for (const image of result) {
      const url = URL.createObjectURL(image.data);
      image.tempURL = url;
      images.set(image.id, image);
    }

    app.renderPreview();
  }

  request.onerror = (event) => {
    console.error("Could not load images!");
  }
}

export function getImages(): Image[] {
  return [...images.values()];
}