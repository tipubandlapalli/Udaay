import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDtRcQ2_g_euHarOujeVSMESJTBWZVXQhw",
  authDomain: "lakecity-hackathon.firebaseapp.com",
  projectId: "lakecity-hackathon",
  storageBucket: "lakecity-hackathon.firebasestorage.app",
  messagingSenderId: "298997633815",
  appId: "1:298997633815:web:a6fa96d705a5557e989d52",
  measurementId: "G-ZEX7WVNPBZ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };
