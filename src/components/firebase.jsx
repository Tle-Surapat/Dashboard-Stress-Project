import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQMCCbXNfV4-AwZiH1z40SmTfgOwuLJgU",
  authDomain: "emotibit-32581.firebaseapp.com",
  databaseURL: "https://emotibit-32581-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "emotibit-32581",
  storageBucket: "emotibit-32581.firebasestorage.app",
  messagingSenderId: "924866194985",
  appId: "1:924866194985:web:3de7abb7e8dc1a5826f638",
  measurementId: "G-T1GX7LZXEW",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);