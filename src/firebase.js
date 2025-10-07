// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB8f9T07Flf2hIfMyp66YjreQI4SC1mZlA",
  authDomain: "complaint-management-sys-38c8e.firebaseapp.com",
  projectId: "complaint-management-sys-38c8e",
  storageBucket: "complaint-management-sys-38c8e.firebasestorage.app",
  messagingSenderId: "57959965783",
  appId: "1:57959965783:web:49141e4e5ebb11ccce2f12",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
