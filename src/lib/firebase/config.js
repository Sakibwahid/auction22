// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD2T2UMyibMSkxYFU_FR0K9np-z81XLu0M",
  authDomain: "auction22-2fe57.firebaseapp.com",
  projectId: "auction22-2fe57",
  storageBucket: "auction22-2fe57.firebasestorage.app",
  messagingSenderId: "567291277623",
  appId: "1:567291277623:web:47f21b7991576de206aab2",
  measurementId: "G-V7CBDT7G9S"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
