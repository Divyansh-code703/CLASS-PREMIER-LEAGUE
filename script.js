// ✅ Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

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

// 🎮 Screen switching
const authScreen = document.getElementById("auth-screen");
const mainScreen = document.getElementById("main-screen");

// 🔐 Sign up
document.getElementById("signup-btn").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth, email, pass)
    .then(() => {
      alert("Signup successful!");
      authScreen.classList.remove("active");
      mainScreen.classList.add("active");
    })
    .catch((err) => alert(err.message));
});

// 🔑 Login
document.getElementById("login-btn").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, pass)
    .then(() => {
      alert("Login successful!");
      authScreen.classList.remove("active");
      mainScreen.classList.add("active");
    })
    .catch((err) => alert(err.message));
});

// 🏏 Menu buttons
document.getElementById("auction-btn").addEventListener("click", () => {
  document.getElementById("content").innerHTML = `
    <h2>Auction Room</h2>
    <p>Players will appear automatically. Bid timer: <b>30s</b></p>
    <p>Purse Left: ₹150 Cr</p>
  `;
  document.getElementById("auction-sound").play();
});

document.getElementById("manage-btn").addEventListener("click", () => {
  document.getElementById("content").innerHTML = `
    <h2>Manage Squad</h2>
    <p>Set Captain, WK, and Batting Order here.</p>
    <button>Trade Center</button>
  `;
});

document.getElementById("schedule-btn").addEventListener("click", () => {
  document.getElementById("content").innerHTML = `
    <h2>Match Schedule</h2>
    <p>Upcoming Match: RCB vs MI — <button>PLAY</button></p>
  `;
});

document.getElementById("points-btn").addEventListener("click", () => {
  document.getElementById("content").innerHTML = `
    <h2>Points Table</h2>
    <table style="width:90%;margin:auto;color:white;">
      <tr><th>Team</th><th>P</th><th>W</th><th>L</th><th>Pts</th></tr>
      <tr><td>RCB</td><td>1</td><td>1</td><td>0</td><td>2</td></tr>
    </table>
  `;
});

document.getElementById("more-btn").addEventListener("click", () => {
  document.getElementById("content").innerHTML = `
    <h2>More Options</h2>
    <button>Caps</button>
    <button>Team Stats</button>
    <button>Rules</button>
  `;
});
