import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCJ621TgfQGfncywnDCbk_WLaDqLKPtxJc",
  authDomain: "ai-cyber-threat-46658.firebaseapp.com",
  databaseURL: "https://ai-cyber-threat-46658-default-rtdb.firebaseio.com",
  projectId: "ai-cyber-threat-46658",
  storageBucket: "ai-cyber-threat-46658.firebasestorage.app",
  messagingSenderId: "677756186170",
  appId: "1:677756186170:web:b32bcfbbc449ef7d638f03",
  measurementId: "G-896WBQDS24"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()