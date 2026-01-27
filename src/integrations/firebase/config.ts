// src/integrations/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDGHeyZTmpRjvzUd_ZtksTVsq1kKpQD6VU",
  authDomain: "ta-agrivis.firebaseapp.com",
  databaseURL:
    "https://ta-agrivis-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ta-agrivis",
  storageBucket: "ta-agrivis.firebasestorage.app",
  messagingSenderId: "323558679424",
  appId: "1:323558679424:web:1eee2a98cf32ac36001765",
  measurementId: "G-SP7KB7MSW9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;
