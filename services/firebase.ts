/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AAAAAAAA",
  authDomain: "AAAAAAAAAAA",
  projectId: "AAAAAAAAAAA",
  storageBucket: "AAAAAAAAA",
  messagingSenderId: "AAAAAAAAAA",
  appId: "AAAAAAAAAA",
  measurementId: "AAAAAAAAAAAA"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Auth functions
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('User signed in:', result.user);
    return result.user;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    throw new Error(`Sign in failed: ${error.message}`);
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw new Error(`Sign out failed: ${error.message}`);
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth, analytics, db };
export default app;
