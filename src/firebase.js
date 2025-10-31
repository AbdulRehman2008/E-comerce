import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
   apiKey: "AIzaSyCa5KdWCJD6_Hck41Yz3GFVrPAlxeHzrfs",
  authDomain: "e-comerce-e34ca.firebaseapp.com",
  projectId: "e-comerce-e34ca",
  storageBucket: "e-comerce-e34ca.appspot.com",
  messagingSenderId: "498685235711",
  appId: "1:498685235711:web:8931362e4e4a9e8396d7ca",
  measurementId: "G-WR11PZPCXB"
};

// Default app for customer site
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true, useFetchStreams: false });

// Secondary app for admin-only auth (isolated session)
const adminApp = initializeApp(firebaseConfig, 'admin');
export const adminAuth = getAuth(adminApp);
