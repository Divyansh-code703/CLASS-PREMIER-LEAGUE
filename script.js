    import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  projectId: "class-premier-league",
  storageBucket: "class-premier-league.firebasestorage.app",
  messagingSenderId: "59210532535",
  appId: "1:59210532535:web:4558b69e94949b65cc6f32"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const authBox = document.getElementById("authBox");
const teamBox = document.getElementById("teamBox");

const email = document.getElementById("email");
const password = document.getElementById("password");
const msg = document.getElementById("msg");

document.getElementById("loginBtn").addEventListener("click", login);
document.getElementById("signupBtn").addEventListener("click", signup);
document.getElementById("logoutBtn").addEventListener("click", logout);

function signup() {
  msg.innerText = "";
  if (!email.value || !password.value) {
    msg.innerText = "Fill email & password";
    return;
  }

  createUserWithEmailAndPassword(auth, email.value, password.value)
    .catch(err => {
      if (err.code === "auth/email-already-in-use") {
        msg.innerText = "Account exists, login karo";
      } else {
        msg.innerText = err.message;
      }
    });
}

function login() {
  msg.innerText = "";
  if (!email.value || !password.value) {
    msg.innerText = "Fill email & password";
    return;
  }

  signInWithEmailAndPassword(auth, email.value, password.value)
    .catch(err => {
      if (err.code === "auth/user-not-found") {
        msg.innerText = "Account nahi mila, signup karo";
      } else if (err.code === "auth/wrong-password") {
        msg.innerText = "Galat password";
      } else {
        msg.innerText = err.message;
      }
    });
}

function logout() {
  signOut(auth);
}

onAuthStateChanged(auth, user => {
  if (user) {
    authBox.classList.add("hidden");
    teamBox.classList.remove("hidden");
  } else {
    teamBox.classList.add("hidden");
    authBox.classList.remove("hidden");
  }
});
