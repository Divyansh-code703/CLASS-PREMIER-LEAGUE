// ===============================
// 🏏 CLASS PREMIER LEAGUE (CPL)
// script.js — Firebase + Core Logic
// ===============================

// 1️⃣ Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// 2️⃣ Firebase Config (same as your project)
const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  projectId: "class-premier-league",
  storageBucket: "class-premier-league.firebasestorage.app",
  messagingSenderId: "59210532535",
  appId: "1:59210532535:web:4558b69e94949b65cc6f32"
};

// 3️⃣ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 4️⃣ Elements
const authScreen = document.getElementById("auth-screen");
const mainScreen = document.getElementById("main-screen");

const signupBtn = document.getElementById("signup-btn");
const loginBtn = document.getElementById("login-btn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Menu Buttons
const buttons = document.querySelectorAll(".menu-btn");
const contentDiv = document.getElementById("content");

// Audio
const auctionSound = document.getElementById("auction-sound");
const wicketSound = document.getElementById("wicket-sound");

// 5️⃣ Auth — Sign Up
signupBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Sign up successful! 🎉");
  } catch (error) {
    alert("Error: " + error.message);
  }
});

// 6️⃣ Auth — Login
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful ✅");
  } catch (error) {
    alert("Login failed: " + error.message);
  }
});

// 7️⃣ On Auth Change → Switch Screen
onAuthStateChanged(auth, (user) => {
  if (user) {
    authScreen.classList.remove("active");
    authScreen.style.display = "none";
    mainScreen.classList.add("active");
    mainScreen.style.display = "block";
  } else {
    authScreen.classList.add("active");
    mainScreen.classList.remove("active");
  }
});

// 8️⃣ Menu Button Logic
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.id;
    if (id === "auction-btn") {
      contentDiv.innerHTML = `
        <h2>🧾 Auction Room</h2>
        <p>Bid for players using your 150 Cr purse.</p>
        <button id="play-sound">Play Auction Sound</button>
      `;
      document.getElementById("play-sound").addEventListener("click", () => auctionSound.play());
    } 
    else if (id === "manage-btn") {
      contentDiv.innerHTML = `
        <h2>⚙️ Manage Squad</h2>
        <p>Set captain, keeper, and playing XI order.</p>
      `;
    } 
    else if (id === "schedule-btn") {
      contentDiv.innerHTML = `
        <h2>📅 Schedule</h2>
        <p>Upcoming matches — tap PLAY when both teams are ready!</p>
      `;
    } 
    else if (id === "points-btn") {
      contentDiv.innerHTML = `
        <h2>🏆 Points Table</h2>
        <p>Auto-updated after each match.</p>
      `;
    } 
    else if (id === "more-btn") {
      contentDiv.innerHTML = `
        <h2>📋 More Options</h2>
        <p>Rules, Caps, and Team Stats coming soon...</p>
      `;
    }
  });
});
