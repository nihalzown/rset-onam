import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.warn(`Missing Firebase configuration keys: ${missingKeys.join(', ')}`);
}

// Initialize Firebase
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

/**
 * Batch write participants to Firestore as backup
 * @param {Array} participants - Array of participant objects
 * @returns {Promise} - Promise that resolves when batch write is complete
 */
export const batchWriteToFirestore = async (participants) => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const batch = writeBatch(db);
    const registrationsRef = collection(db, 'registrations');

    participants.forEach((participant) => {
      const docRef = doc(registrationsRef);
      batch.set(docRef, {
        ...participant,
        created_at: new Date(),
        backup_source: 'supabase_sync'
      });
    });

    await batch.commit();
    console.log('Successfully backed up participants to Firebase');
    return { success: true };
  } catch (error) {
    console.error('Firebase batch write failed:', error);
    throw new Error(`Firebase backup failed: ${error.message}`);
  }
};

// Export Firebase instances
export { app, db };
export default db;
