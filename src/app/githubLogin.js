import { GithubAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js"
import { auth } from "./firebase.js";
import { showMessage } from "./showMessage.js";

const githubButton = document.querySelector("#githubLogin");

githubButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const provider = new GithubAuthProvider();
    try {
        const credentials = await signInWithPopup(auth, provider)
        console.log(credentials);
        console.log("google sign in");

        // Close the login modal
        const modalInstance = bootstrap.Modal.getInstance(githubButton.closest('.modal'));
        modalInstance.hide();

        // show welcome message
        showMessage("Welcome " + credentials.user.displayName);
    } catch (error) {
        if (error.code === 'auth/wrong-password') {
            showMessage("Wrong password", "error")
        } else if (error.code === 'auth/user-not-found') {
            showMessage("User not found", "error")
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            showMessage("Account exists with different credential", "error")
        } else {
            showMessage("Something went wrong", "error")
        }
    }
});