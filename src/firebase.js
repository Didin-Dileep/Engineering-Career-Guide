import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDj9au717SrZXS11jmlAnLYXO6CxnbHLO8",
  authDomain: "career-roadmap-e7b2c.firebaseapp.com",
  projectId: "career-roadmap-e7b2c",
  storageBucket: "career-roadmap-e7b2c.firebasestorage.app",
  messagingSenderId: "1078476909848",
  appId: "1:1078476909848:web:aea270ff372812ec79426d",
  measurementId: "G-Y3KE7BK3WX"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
