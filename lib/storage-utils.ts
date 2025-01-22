import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    // Create a storage reference
    const storageRef = ref(storage, path);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export function generateStoragePath(folder: string, fileName: string): string {
  // Generate a unique file name to avoid collisions
  const timestamp = Date.now();
  const uniqueFileName = `${timestamp}-${fileName}`;
  return `${folder}/${uniqueFileName}`;
} 