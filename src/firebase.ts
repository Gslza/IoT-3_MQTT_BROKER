import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCwZD1gCPdEBgt6lzZqm89RsHV2I34jTms",
  authDomain: "gzaaa-4cd71.firebaseapp.com",
  databaseURL: "https://gzaaa-4cd71-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gzaaa-4cd71",
  storageBucket: "gzaaa-4cd71.firebasestorage.app",
  messagingSenderId: "745595086417",
  appId: "1:745595086417:web:f51f0f902ec83aa65c3a70",
  measurementId: "G-D2QXY8468J"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export default app;
