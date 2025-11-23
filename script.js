// script.js (UPDATED — use this exact file, replaces your previous script.js)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  databaseURL: "https://class-premier-league-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "class-premier-league",
  storageBucket: "class-premier-league.appspot.com",
  messagingSenderId: "59210532535",
  appId: "1:59210532535:web:4558b69e94949b65cc6f32"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// UI elements
const loginScreen = document.getElementById("login-screen");
const teamScreen = document.getElementById("team-screen");
const dashboard = document.getElementById("dashboard");
const bottomNav = document.getElementById("bottom-nav");
const loginMsg = document.getElementById("login-message");
const teamLogo = document.getElementById("team-logo");
const selectedTeamName = document.getElementById("selected-team-name");
const thanksText = document.getElementById("thanks-text");

let currentUserEmail = null;
let currentUserName = null;

function emailKeyFrom(email) {
  return email.replace(/\./g, "_");
}

// LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
  const emailRaw = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!emailRaw || !password) {
    loginMsg.textContent = "Enter all fields!";
    return;
  }

  const key = emailKeyFrom(emailRaw);
  const snap = await get(child(ref(db), "users/" + key));

  if (!snap.exists()) {
    loginMsg.textContent = "User not found!";
    return;
  }

  const data = snap.val();

  if (data.password !== password) {
    loginMsg.textContent = "Wrong password!";
    return;
  }

  loginMsg.textContent = "Login Successful!";
  currentUserEmail = emailRaw;
  currentUserName = data.name || "";

  if (!data.team) {
    showTeamScreen();
  } else {
    showDashboard(data.team, data.name);
  }
});

// SIGN UP (auto-login to team selection)
document.getElementById("signupBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const emailRaw = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !emailRaw || !password) {
    loginMsg.textContent = "Fill all fields!";
    return;
  }

  const key = emailKeyFrom(emailRaw);
  const userRef = ref(db, "users/" + key);
  const snap = await get(userRef);

  if (snap.exists()) {
    loginMsg.textContent = "User already exists!";
    return;
  }

  await set(userRef, { name, email: emailRaw, password, team: null });

  // auto-login after signup (go straight to team selection)
  currentUserEmail = emailRaw;
  currentUserName = name;
  loginMsg.textContent = "Signup Successful! Proceed to choose team.";
  showTeamScreen();
});

// TEAM SELECTION
function showTeamScreen() {
  loginScreen.classList.remove("active");
  teamScreen.classList.add("active");

  document.querySelectorAll(".team").forEach(t => {
    // ensure handler isn't bound multiple times
    t.onclick = null;
    t.onclick = async () => {
      const selectedTeam = t.dataset.team;

      // Check if team already taken
      const takenSnap = await get(child(ref(db), "chosenTeams/" + selectedTeam));
      if (takenSnap.exists()) {
        alert("This team is already taken!");
        return;
      }

      if (!currentUserEmail || !currentUserName) {
        // safety: if somehow missing, read name from input or require login again
        currentUserName = document.getElementById("name").value.trim() || currentUserName || "Player";
      }

      // Save team for this user
      const cleanEmail = emailKeyFrom(currentUserEmail);

      await update(ref(db, "users/" + cleanEmail), { team: selectedTeam });
      await set(ref(db, "chosenTeams/" + selectedTeam), cleanEmail);

      showDashboard(selectedTeam, currentUserName);
    };
  });
}

// DASHBOARD
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

  teamLogo.src = logoMap[team] || "";
  selectedTeamName.textContent = "Team: " + team;
  thanksText.textContent = "Thanks for joining, " + (name || currentUserName || "Player") + "!";

  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  dashboard.classList.add("active");
  bottomNav.classList.remove("hidden");
}

// NAV BUTTONS
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.onclick = () => {
    const id = btn.dataset.target;
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const targetEl = document.getElementById(id);
    if (targetEl) targetEl.classList.add("active");
  };
});
```0
