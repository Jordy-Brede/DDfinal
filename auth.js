import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { firebaseApp } from "./firebase.js";
import { renderAppForUser, renderSignedOut } from "./app.js";
import { hydrateFromRemote, startRealtime } from "./sync.js";

export const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

/* Sign In  */
const signinForm = document.getElementById("signin-form");
signinForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signin-email").value;
  const password = document.getElementById("signin-password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    M.toast({ html: "Signed in!", classes: "green" });
    signinForm.reset();
  } catch (err) {
    console.error(err);
    M.toast({ html: err.message, classes: "red" });
  }
});

/* Sign Up */
const signupForm = document.getElementById("signup-form");
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    M.toast({ html: "Account created!", classes: "green" });
    signupForm.reset();
  } catch (err) {
    console.error(err);
    M.toast({ html: err.message, classes: "red" });
  }
});

/* Google Sign In */
const googleBtn = document.getElementById("google-btn");
googleBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    M.toast({ html: "Signed in with Google!", classes: "green" });
  } catch (err) {
    console.error(err);
    M.toast({ html: err.message, classes: "red" });
  }
});

/* Sign Out */
const signoutBtn = document.getElementById("signout-btn");
signoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    M.toast({ html: "Signed out", classes: "grey" });
  } catch (err) {
    console.error(err);
    M.toast({ html: err.message, classes: "red" });
  }
});

document.getElementById("show-signup").addEventListener("click", () => {
  document.getElementById("signin-card").classList.add("hide");
  document.getElementById("signup-card").classList.remove("hide");
});
document.getElementById("show-signin").addEventListener("click", () => {
  document.getElementById("signup-card").classList.add("hide");
  document.getElementById("signin-card").classList.remove("hide");
});

/* Auth Observer */
onAuthStateChanged(auth, async (user) => {
  if (user) {

    document.getElementById("auth-section").classList.add("hide");
    document.getElementById("app-section").classList.remove("hide");
    document.getElementById("user-email").textContent = user.email;
    document.getElementById("signout-btn").classList.remove("hide");

    await hydrateFromRemote(user.uid);
    startRealtime(user.uid);
  } else {
    document.getElementById("auth-section").classList.remove("hide");
    document.getElementById("app-section").classList.add("hide");
    document.getElementById("user-email").textContent = "";
    document.getElementById("signout-btn").classList.add("hide");
    renderSignedOut();
  }
});
