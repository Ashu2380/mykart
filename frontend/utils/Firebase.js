import {getAuth, GoogleAuthProvider} from "firebase/auth"
import { initializeApp } from "firebase/app";
const firebaseConfig = {
  apiKey: "AIzaSyCymFV9eFPbR5Tgskh-tsBs4EQUd_5xIHs",
  authDomain: "mykart-f12ca.firebaseapp.com",
  projectId: "mykart-f12ca",
  storageBucket: "mykart-f12ca.firebasestorage.app",
  messagingSenderId: "817701149525",
  appId: "1:817701149525:web:ac90b06819961bea806ddc",
  measurementId: "G-CG2KPCG697"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()


export {auth , provider}

