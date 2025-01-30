
import { initializeApp } from "firebase/app";
import {GoogleAuthProvider, getAuth, signInWithPopup} from "firebase/auth"
const firebaseConfig = {
  apiKey: "AIzaSyB2U7oHitm4utvZpVJqF4br0d14qpnrIOM",
  authDomain: "mern-blog-74aa2.firebaseapp.com",
  projectId: "mern-blog-74aa2",
  storageBucket: "mern-blog-74aa2.firebasestorage.app",
  messagingSenderId: "1079000063170",
  appId: "1:1079000063170:web:2881c331ed4cb3d815af5b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);



//google auth
const provider = new GoogleAuthProvider();
const auth = getAuth()

export const authWithGoogle = async () =>{
  let user = null;
  await signInWithPopup(auth, provider)
  .then((result) =>{
     user = result.user
  }).catch((err) =>{
      console.log(err)
  })
  return user
}