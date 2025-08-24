import { initializeApp } from 'firebase/app';
import { getFirestore, writeBatch, doc, collection } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Batch write participants to Firestore
 * @param {Array} participants - Array of participant objects
 * @returns {Promise} - Promise that resolves when batch write is complete
 */
export const batchWriteToFirestore = async (participants) => {
  const batch = writeBatch(db);
  const registrationsRef = collection(db, 'registrations');

  participants.forEach((participant) => {
    const docRef = doc(registrationsRef);
    batch.set(docRef, {
      ...participant,
      created_at: new Date()
    });
  });

  return batch.commit();
};
