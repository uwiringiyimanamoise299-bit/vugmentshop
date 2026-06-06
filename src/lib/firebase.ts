import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAI1uheK7WbkXF-xmBMzk34iBVw1k1aASo",
  authDomain: "nadjbtra.firebaseapp.com",
  projectId: "nadjbtra",
  storageBucket: "nadjbtra.firebasestorage.app",
  messagingSenderId: "283774666306",
  appId: "1:283774666306:web:e9283de6d3067048784fdb",
  measurementId: "G-RJNLC82LJK"
};

// Initialize Firebase (prevent multiple initializations in dev mode)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics only on client side
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, analytics, auth, db };
