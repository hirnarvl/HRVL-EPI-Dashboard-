import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfigJson from "../firebase-applet-config.json";

// User provided config fallback
const userProvidedConfig = {
  apiKey: "AIzaSyBxBQn1KOdx2WUXf5vjLPmj3a9vUWd7PAE",
  authDomain: "hrvl-data-analytic-dashboard.firebaseapp.com",
  projectId: "hrvl-data-analytic-dashboard",
  storageBucket: "hrvl-data-analytic-dashboard.firebasestorage.app",
  messagingSenderId: "872579413071",
  appId: "1:872579413071:web:24acdd479a655a2bdf663a"
};

// Use auto-provisioned config if apiKey exists, else fallback
const activeConfig = (firebaseConfigJson && firebaseConfigJson.apiKey) 
  ? firebaseConfigJson 
  : userProvidedConfig;

const app = !getApps().length ? initializeApp(activeConfig) : getApp();

const dbId = (firebaseConfigJson && (firebaseConfigJson as any).firestoreDatabaseId) 
  ? (firebaseConfigJson as any).firestoreDatabaseId 
  : '(default)';

export const db = (dbId && dbId !== '(default)') ? getFirestore(app, dbId) : getFirestore(app);
export const auth = getAuth(app);
export default app;
