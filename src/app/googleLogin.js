import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js"
import { auth } from "./firebase.js";
import { showMessage } from "./showMessage.js";

const googleButton = document.querySelector("#googleLogin");

googleButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const provider = new GoogleAuthProvider();
    try {
        const credentials = await signInWithPopup(auth, provider);

        // Close the login modal
        const modalInstance = bootstrap.Modal.getInstance(googleButton.closest('.modal'));
        modalInstance.hide();

        // show welcome message
        showMessage("Welcome " + credentials.user.displayName);
    } catch (error) {
        if (error.code === 'auth/wrong-password') {
            showMessage("Wrong password", "error")
        } else if (error.code === 'auth/user-not-found') {
            showMessage("User not found", "error")
        } else {
            showMessage("Something went wrong", "error")
        }
    }
});