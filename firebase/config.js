import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey:            "AIzaSyAUQRWVXD2sdNwruQs-DmgXWMjWiAkO-dg",
  authDomain:        "the-chat-a4008.firebaseapp.com",
  databaseURL:       "https://the-chat-a4008-default-rtdb.firebaseio.com",
  projectId:         "the-chat-a4008",
  storageBucket:     "the-chat-a4008.firebasestorage.app",
  messagingSenderId: "823296488432",
  appId:             "1:823296488432:web:761812ce219b76ae7a2335"
};

const app       = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
