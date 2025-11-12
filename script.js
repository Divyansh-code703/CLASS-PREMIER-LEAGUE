// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  projectId: "class-premier-league",
  storageBucket: "class-premier-league.firebasestorage.app",
  messagingSenderId: "59210532535",
  appId: "1:59210532535:web:4558b69e94949b65cc6f32",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const loginScreen = document.getElementById("login-screen");
const teamScreen = document.getElementById("team-screen");
const dashboard = document.getElementById("dashboard");
const bottomNav = document.getElementById("bottom-nav");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loginMsg = document.getElementById("login-message");
const thanksText = document.getElementById("thanks-text");

// 🧾 SIGNUP BUTTON
signupBtn.addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    loginMsg.textContent = "⚠️ Please fill all fields!";
    return;
  }

  try {
    await setDoc(doc(db, "users", email), {
      name,
      email,
      password,
      team: null,
    });

    loginMsg.style.color = "green";
    loginMsg.textContent = "✅ Signup successful! Now login.";
  } catch (error) {
    loginMsg.style.color = "red";
    loginMsg.textContent = "Error while saving user: " + error.message;
  }
});

// 🔐 LOGIN BUTTON
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    loginMsg.textContent = "⚠️ Please fill both fields!";
    return;
  }

  try {
    const docRef = doc(db, "users", email);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const user = docSnap.data();
      if (user.password === password) {
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userName", user.name);

        loginScreen.classList.remove("active");
        teamScreen.classList.add("active");
      } else {
        loginMsg.style.color = "red";
        loginMsg.textContent = "❌ Incorrect password!";
      }
    } else {
      loginMsg.style.color = "red";
      loginMsg.textContent = "❌ No account found!";
    }
  } catch (error) {
    loginMsg.textContent = "Error: " + error.message;
  }
});

// 🏏 TEAM SELECTION
document.querySelectorAll(".team").forEach((team) => {
  team.addEventListener("click", async () => {
    const teamName = team.dataset.team;
    const email = localStorage.getItem("userEmail");
    const name = localStorage.getItem("userName");

    await setDoc(doc(db, "users", email), {
      name,
      email,
      password: "hidden",
      team: teamName,
    });

    teamScreen.classList.remove("active");
    dashboard.classList.add("active");
    bottomNav.classList.remove("hidden");

    thanksText.textContent = `Thanks for joining us, ${name}!`;
    document.getElementById(
      "selected-team-name"
    ).textContent = `Your team: ${teamName}`;
  });
});

// 🌍 NAVIGATION
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    document.getElementById(target).classList.add("active");
  });
});
