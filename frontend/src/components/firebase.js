import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from 'firebase/database';


// Firebase configuration (replace these with your actual config values)
const firebaseConfig = {
  apiKey: "AIzaSyD_78WKvT0nEigyBcku_m3ubVZGaSYisVc",
  authDomain: "collegemngmnt.firebaseapp.com",
  projectId: "collegemngmnt",
  storageBucket: "collegemngmnt.appspot.com",
  messagingSenderId: "157947712006",
  appId: "1:157947712006:web:e6e0c39b70cdb431116987",
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);
const provider = new GoogleAuthProvider();

// Set authentication persistence to LOCAL
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});


// Export services for use in other files
export { auth, db, storage, database, provider };
export default app;



