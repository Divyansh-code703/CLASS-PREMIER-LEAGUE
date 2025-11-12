// 🔥 Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

// ✅ Your Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  databaseURL: "https://class-premier-league-default-rtdb.firebaseio.com",
  projectId: "class-premier-league",
  storageBucket: "class-premier-league.firebasestorage.app",
  messagingSenderId: "59210532535",
  appId: "1:59210532535:web:4558b69e94949b65cc6f32"
};

// 🔧 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ===== SCREEN SETUP =====
const loginScreen = document.getElementById("login-screen");
const teamScreen = document.getElementById("team-screen");
const dashboard = document.getElementById("dashboard");
const bottomNav = document.getElementById("bottom-nav");
const screens = document.querySelectorAll(".screen");

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loginMsg = document.getElementById("login-message");
const selectedTeamName = document.getElementById("selected-team-name");
const teamLogo = document.getElementById("team-logo");
const thanksText = document.getElementById("thanks-text");

let users = {};
let chosenTeams = {};
let currentUserEmail = null;

// ✅ Load data from Firebase (once on load)
async function loadData() {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, "users"));
    const teamSnap = await get(child(dbRef, "chosenTeams"));
    if (snapshot.exists()) users = snapshot.val();
    if (teamSnap.exists()) chosenTeams = teamSnap.val();
    console.log("Firebase data loaded ✅");
  } catch (err) {
    console.error("Error loading Firebase data:", err);
  }
}
loadData();

// ✅ Save all users & teams to Firebase
function saveData() {
  set(ref(db, "users"), users);
  set(ref(db, "chosenTeams"), chosenTeams);
}

// ===== LOGIN / SIGNUP =====
loginBtn.addEventListener("click", () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password)
    return (loginMsg.textContent = "Please fill all fields!");

  if (users[email]) {
    if (users[email].password === password) {
      loginMsg.textContent = "Login successful!";
      currentUserEmail = email;
      setTimeout(() => handleLogin(email), 800);
    } else {
      loginMsg.textContent = "Wrong password!";
    }
  } else {
    loginMsg.textContent = "User not found. Please Sign Up.";
  }
});

signupBtn.addEventListener("click", () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password)
    return (loginMsg.textContent = "Enter all fields!");

  if (users[email]) return (loginMsg.textContent = "User already exists!");

  users[email] = { name, password, team: null };
  saveData();
  loginMsg.textContent = "Signup successful! Please Login.";
});

// ===== HANDLE LOGIN =====
function handleLogin(email) {
  const user = users[email];
  if (!user.team) {
    loginScreen.classList.remove("active");
    teamScreen.classList.add("active");
    setupTeamSelection(email);
  } else {
    showScreen("dashboard");
    showDashboard(user.team, user.name);
  }
}

// ===== TEAM SELECTION =====
function setupTeamSelection(email) {
  document.querySelectorAll(".team").forEach((teamDiv) => {
    teamDiv.onclick = () => {
      const selectedTeam = teamDiv.dataset.team;
      if (Object.values(chosenTeams).includes(selectedTeam)) {
        alert("This team is already taken!");
        return;
      }
      const confirmChoice = confirm(`You chose ${selectedTeam}. Confirm?`);
      if (confirmChoice) {
        users[email].team = selectedTeam;
        chosenTeams[email] = selectedTeam;
        saveData();
        showScreen("dashboard");
        showDashboard(selectedTeam, users[email].name);
      }
    };
  });
}

// ===== DASHBOARD =====
function showDashboard(team, name) {
  const logoMap = {
    RCB: "250px-Royal_Challengers_Bengaluru_Logo.svg.png",
    CSK: "chennai-super-kings3461.jpg",
    KKR: "778px-Kolkata_Knight_Riders_Logo.svg.png",
    MI: "1200px-Mumbai_Indians_Logo.svg (1).png",
    LSG: "1200px-Lucknow_Super_Giants_IPL_Logo.svg (1).png",
    SRH: "627d11598a632ca996477eb0.png",
    GT: "627d09228a632ca996477e87 (1).png",
    PBKS: "Punjab_Kings_Logo.svg.png"
  };
  teamLogo.src = logoMap[team];
  selectedTeamName.textContent = `Team: ${team}`;
  thanksText.textContent = `Thanks for joining, ${name}!`;
}

// ===== SCREEN HANDLING =====
function showScreen(id) {
  screens.forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  bottomNav.classList.remove("hidden");
}

// ===== BOTTOM NAVIGATION =====
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    showScreen(target);
    if (target === "dashboard") {
      const user = users[currentUserEmail];
      showDashboard(user.team, user.name);
    }
  });
});
