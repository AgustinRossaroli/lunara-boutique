import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, getFirestore, onSnapshot } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import type { Product } from "./catalog-data";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigured = Object.values(firebaseConfig).every(Boolean);
const app = firebaseConfigured
  ? getApps()[0] ?? initializeApp(firebaseConfig)
  : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

export function subscribeToProducts(
  onProducts: (products: Product[]) => void,
  onError?: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    collection(db, "products"),
    (snapshot) => {
      const records = snapshot.docs
        .map((document) => ({ id: document.id, ...document.data() }) as Product)
        .filter((product) => product.stock > 0 && product.slug && product.name);
      if (records.length) onProducts(records);
    },
    (error) => onError?.(error),
  );
}
