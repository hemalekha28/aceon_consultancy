// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDb83iT49XzSyzP2I92BafxtQ7mIrrlO3A",
  authDomain: "aceon-mattress.firebaseapp.com",
  projectId: "aceon-mattress",
  storageBucket: "aceon-mattress.firebasestorage.app",
  messagingSenderId: "747012011997",
  appId: "1:747012011997:web:0e98250a5827e75869e834",
  measurementId: "G-GW7NMTGH6X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Sign in with Google function
export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

export default app;