// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "Digitas el api Key de Firebase",
    authDomain: "Digita el dominio",
    projectId: "Digita el Id",
    storageBucket: "Digita el storageBucket",
    messagingSenderId: "2450838341",
    appId: "1:2450838341:web:42f45d34f8e4441e73a42c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
