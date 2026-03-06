// ─── src/firebase/services/storageService.js ─────────────────────────────────
//
// Sube imágenes a Firebase Storage y devuelve la URL pública.
// Rutas usadas:
//   restaurants/{restaurantId}/cover.{ext}
//   restaurants/{restaurantId}/menu/{itemId}.{ext}

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../config";

/**
 * Upload a file with progress tracking.
 *
 * @param {string}   path         - Storage path, e.g. "restaurants/abc/cover.jpg"
 * @param {File}     file         - File object from an <input type="file">
 * @param {Function} [onProgress] - Called with progress percentage 0–100
 * @returns {Promise<string>} Public download URL
 */
export function uploadFile(path, file, onProgress) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        onProgress?.(pct);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

/**
 * Upload a restaurant cover image.
 * @param {string}   restaurantId
 * @param {File}     file
 * @param {Function} [onProgress]
 * @returns {Promise<string>} Download URL
 */
export function uploadRestaurantImage(restaurantId, file, onProgress) {
  const ext = file.name.split(".").pop();
  return uploadFile(`restaurants/${restaurantId}/cover.${ext}`, file, onProgress);
}

/**
 * Upload a menu item image.
 * @param {string}   restaurantId
 * @param {string}   itemId
 * @param {File}     file
 * @param {Function} [onProgress]
 * @returns {Promise<string>} Download URL
 */
export function uploadMenuItemImage(restaurantId, itemId, file, onProgress) {
  const ext = file.name.split(".").pop();
  return uploadFile(
    `restaurants/${restaurantId}/menu/${itemId}.${ext}`,
    file,
    onProgress
  );
}

/**
 * Delete a file from Storage.
 * @param {string} path
 */
export async function deleteFile(path) {
  try {
    await deleteObject(ref(storage, path));
  } catch (err) {
    // Ignore "object not found" errors (file may not exist)
    if (err.code !== "storage/object-not-found") throw err;
  }
}
