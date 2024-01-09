import { signOut } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js"
import { auth } from "./firebase.js";

const logout = document.querySelector("#logout");

logout.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
        await signOut(auth);
    } catch (error) {
        console.log(error)
    }
});