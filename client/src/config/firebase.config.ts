import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

 const firebaseConfig = {
  apiKey: "AIzaSyAS6n3jj80-HsmjaRrLdxocWKaXkdvbTTc",
  authDomain: "lakecity-cb44b.firebaseapp.com",
  projectId: "lakecity-cb44b",
  storageBucket: "lakecity-cb44b.firebasestorage.app",
  messagingSenderId: "224248990075",
  appId: "1:224248990075:web:5eda799ba6a65ecb9f95de",
  measurementId: "G-R6VPX87F3G"
};

 const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };
