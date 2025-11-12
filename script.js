
// Firebase import
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  projectId: "class-premier-league",
  storageBucket: "class-premier-league.firebasestorage.app",
  messagingSenderId: "59210532535",
  appId: "1:59210532535:web:4558b69e94949b65cc6f32"
};

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

// SIGNUP
signupBtn.addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    loginMsg.textContent = "Please fill all fields!";
    return;
  }

  try {
    await setDoc(doc(db, "users", email), {
      name,
      email,
      password,
      team: null
    });

    loginMsg.textContent = "Signup successful! Please login now.";
  } catch (e) {
    loginMsg.textContent = "Error saving data.";
  }
});

// LOGIN
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const docRef = doc(db, "users", email);
  const snap = await (await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js")).getDoc(docRef);

  if (snap.exists() && snap.data().password === password) {
    loginScreen.classList.remove("active");
    teamScreen.classList.add("active");
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", snap.data().name);
  } else {
    loginMsg.textContent = "Invalid credentials!";
  }
});

// TEAM SELECTION
document.querySelectorAll(".team").forEach(team => {
  team.addEventListener("click", async () => {
    const teamName = team.dataset.team;
    const email = localStorage.getItem("userEmail");
    const name = localStorage.getItem("userName");

    await setDoc(doc(db, "users", email), {
      name,
      email,
      team: teamName
    });

    teamScreen.classList.remove("active");
    dashboard.classList.add("active");
    bottomNav.classList.remove("hidden");
    document.getElementById("thanks-text").textContent = `Thanks for joining us, ${name}!`;
    document.getElementById("selected-team-name").textContent = `Your team: ${teamName}`;
  });
});

// NAVIGATION
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(target).classList.add("active");
  });
});
