import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCZtZSvpAhjVBhnJaJWnOqXdec8UOYTI6I",
  authDomain: "participacionciudadana-7e7cf.firebaseapp.com",
  projectId: "participacionciudadana-7e7cf",
  storageBucket: "participacionciudadana-7e7cf.firebasestorage.app",
  messagingSenderId: "102459593213",
  appId: "1:102459593213:web:a86d3764c9795fa1df0994"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;