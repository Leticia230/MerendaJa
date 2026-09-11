// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDt_bEOP4sRzAdyP995idxYhkQbExRfCEA",
  authDomain: "merendaja.firebaseapp.com",
  projectId: "merendaja",
  storageBucket: "merendaja.firebasestorage.app",
  messagingSenderId: "184963829406",
  appId: "1:184963829406:web:87db0942c0dd077e71f58f",
  measurementId: "G-G4JRSBT1L7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);