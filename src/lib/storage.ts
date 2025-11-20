import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param file The file to upload (e.g., a File object from an input).
 * @param path The path in the storage bucket (e.g., 'profile-images/user-id/avatar.jpg').
 * @returns A promise that resolves to the public download URL.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const storageRef = ref(storage, path);

  // Upload the file
  const snapshot = await uploadBytes(storageRef, file);

  // Get the download URL
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
}

/**
 * Gets the download URL for a file at a specific path.
 * @param path The path in the storage bucket.
 * @returns A promise that resolves to the public download URL.
 */
export async function getFileUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

