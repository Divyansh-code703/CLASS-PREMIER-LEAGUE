import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

/* 🔥 Firebase config */
const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  databaseURL: "https://class-premier-league-default-rtdb.firebaseio.com",
  projectId: "class-premier-league",
  storageBucket: "class-premier-league.firebasestorage.app",
  messagingSenderId: "59210532535",
  appId: "1:59210532535:web:4558b69e94949b65cc6f32"
};

/* 🔥 Init */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

/* 🔥 DOM */
const authBox = document.getElementById("authBox");
const teamBox = document.getElementById("teamBox");
const dashboard = document.getElementById("dashboard");
const msg = document.getElementById("msg");
const teamMsg = document.getElementById("teamMsg");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

/* ================= SIGNUP ================= */
window.signup = () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    msg.innerText = "❌ Email & Password fill karo";
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      msg.innerText = "✅ Signup successful, now login";
    })
    .catch((e) => {
      if (e.code === "auth/email-already-in-use") {
        msg.innerText = "⚠️ Account already exists, login karo";
      } else if (e.code === "auth/weak-password") {
        msg.innerText = "⚠️ Password kam se kam 6 characters ka ho";
      } else {
        msg.innerText = "❌ Signup error";
      }
    });
};

/* ================= LOGIN ================= */
window.login = () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    msg.innerText = "❌ Email & Password fill karo";
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      msg.innerText = "✅ Login successful";
    })
    .catch((e) => {
      if (e.code === "auth/user-not-found") {
        msg.innerText = "❌ Account nahi mila, pehle signup karo";
      } else if (e.code === "auth/wrong-password") {
        msg.innerText = "❌ Password galat hai";
      } else {
        msg.innerText = "❌ Login failed";
      }
    });
};

/* ================= AUTH STATE ================= */
onAuthStateChanged(auth, (user) => {
  if (!user) return;

  get(ref(db, "users/" + user.uid)).then((snap) => {
    authBox.classList.add("hidden");
    if (snap.exists()) {
      dashboard.classList.remove("hidden");
    } else {
      teamBox.classList.remove("hidden");
    }
  });
});

/* ================= TEAM SELECT ================= */
window.selectTeam = (team) => {
  const uid = auth.currentUser.uid;

  get(ref(db, "teams/" + team)).then((snap) => {
    if (snap.exists()) {
      teamMsg.innerText = "❌ Team already taken";
    } else {
      set(ref(db, "teams/" + team), uid);
      set(ref(db, "users/" + uid), { team });
      teamBox.classList.add("hidden");
      dashboard.classList.remove("hidden");
    }
  });
};
