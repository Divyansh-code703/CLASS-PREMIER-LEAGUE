// -------------------- 🔥 Firebase Connection --------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  projectId: "class-premier-league",
  storageBucket: "class-premier-league.firebasestorage.app",
  messagingSenderId: "59210532535",
  appId: "1:59210532535:web:4558b69e94949b65cc6f32"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// -------------------- 🔐 Login + Signup --------------------
const signupBtn = document.getElementById("signup-btn");
const loginBtn = document.getElementById("login-btn");
const email = document.getElementById("email");
const password = document.getElementById("password");
const authScreen = document.getElementById("auth-screen");
const mainScreen = document.getElementById("main-screen");

signupBtn.addEventListener("click", async () => {
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    alert("Sign-up successful! 🎉");
    authScreen.classList.remove("active");
    mainScreen.classList.add("active");
  } catch (error) {
    alert(error.message);
  }
});

loginBtn.addEventListener("click", async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    alert("Login successful! 👑");
    authScreen.classList.remove("active");
    mainScreen.classList.add("active");
  } catch (error) {
    alert(error.message);
  }
});

// -------------------- 🏏 Main Menu Logic --------------------
const auctionBtn = document.getElementById("auction-btn");
const manageBtn = document.getElementById("manage-btn");
const scheduleBtn = document.getElementById("schedule-btn");
const pointsBtn = document.getElementById("points-btn");
const moreBtn = document.getElementById("more-btn");
const teamStatsBtn = document.getElementById("team-stats-btn");
const content = document.getElementById("content");

auctionBtn.addEventListener("click", () => {
  content.innerHTML = `
    <h2>🏏 Auction</h2>
    <p>Start the player auction and build your dream team!</p>
  `;
});

manageBtn.addEventListener("click", () => {
  content.innerHTML = `
    <h2>⚙️ Manage Squad</h2>
    <p>Add, remove, or edit your team players here.</p>
  `;
});

scheduleBtn.addEventListener("click", () => {
  content.innerHTML = `
    <h2>🗓 Match Schedule</h2>
    <p>Upcoming match fixtures will appear here soon.</p>
  `;
});

pointsBtn.addEventListener("click", () => {
  content.innerHTML = `
    <h2>🏆 Points Table</h2>
    <p>Track which team is leading in the CPL!</p>
  `;
});

moreBtn.addEventListener("click", () => {
  content.innerHTML = `
    <h2>ℹ️ More Options</h2>
    <p>Access rules, help, or about section.</p>
  `;
});

// -------------------- 📊 Team Stats --------------------
teamStatsBtn.addEventListener("click", () => {
  content.innerHTML = `
    <h2>🏏 Team Stats</h2>
    <p>Here you can view your team's performance, runs, wickets, and points!</p>
    <table>
      <tr>
        <th>Team</th>
        <th>Matches</th>
        <th>Wins</th>
        <th>Losses</th>
        <th>Points</th>
      </tr>
      <tr>
        <td>Team A</td>
        <td>5</td>
        <td>3</td>
        <td>2</td>
        <td>6</td>
      </tr>
      <tr>
        <td>Team B</td>
        <td>5</td>
        <td>4</td>
        <td>1</td>
        <td>8</td>
      </tr>
      <tr>
        <td>Team C</td>
        <td>5</td>
        <td>2</td>
        <td>3</td>
        <td>4</td>
      </tr>
    </table>
  `;
});
