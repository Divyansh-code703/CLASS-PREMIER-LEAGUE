// ================= FIREBASE SETUP =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  update
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  databaseURL: "https://class-premier-league-default-rtdb.firebaseio.com",
  projectId: "class-premier-league",
  storageBucket: "class-premier-league.firebasestorage.app",
  messagingSenderId: "59210532535",
  appId: "1:59210532535:web:4558b69e94949b65cc6f32"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ================= TEAM LOGOS (ROOT FILES) =================
const logos = {
  CSK: "chennai-super-kings3461.jpg",
  MI: "1200px-Mumbai_Indians_Logo.svg (1).png",
  RCB: "250px-Royal_Challengers_Bengaluru_Logo.svg.png",
  KKR: "778px-Kolkata_Knight_Riders_Logo.svg.pn",
  SRH: "627d11598a632ca996477eb0.png",
  PBKS: "Punjab_Kings_Logo.svg.png",
  LSG: "1200px-Lucknow_Super_Giants_IPL_Logo.svg (1).png",
  GT: "627d09228a632ca996477e87 (1).png"
};

// ================= ELEMENTS =================
const authBox = document.getElementById("authBox");
const teamSelect = document.getElementById("teamSelect");
const dashboard = document.getElementById("dashboard");
const teamsDiv = document.getElementById("teams");
const authMsg = document.getElementById("authMsg");
const myTeam = document.getElementById("myTeam");

// ================= SIGNUP =================
window.signup = async () => {
  const e = email.value.trim();
  const p = password.value.trim();

  if (!e && !p) return authMsg.innerText = "Please fill all fields";
  if (!e) return authMsg.innerText = "Please enter email";
  if (!p) return authMsg.innerText = "Please enter password";

  try {
    await createUserWithEmailAndPassword(auth, e, p);
    authMsg.innerText = "Signup successful, please login";
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      authMsg.innerText = "Account already exists, please login";
    } else if (err.code === "auth/invalid-email") {
      authMsg.innerText = "Invalid email format";
    } else if (err.code === "auth/weak-password") {
      authMsg.innerText = "Password must be at least 6 characters";
    } else {
      authMsg.innerText = "Signup failed";
    }
  }
};

// ================= LOGIN =================
window.login = async () => {
  const e = email.value.trim();
  const p = password.value.trim();

  if (!e && !p) return authMsg.innerText = "Please fill all fields";
  if (!e) return authMsg.innerText = "Please enter email";
  if (!p) return authMsg.innerText = "Please enter password";

  try {
    const userCred = await signInWithEmailAndPassword(auth, e, p);
    authMsg.innerText = "Login successful";
    loadAfterLogin(userCred.user.uid);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      authMsg.innerText = "Account not found, please sign up first";
    } else if (err.code === "auth/wrong-password") {
      authMsg.innerText = "Wrong password";
    } else if (err.code === "auth/invalid-email") {
      authMsg.innerText = "Invalid email format";
    } else {
      authMsg.innerText = "Login failed";
    }
  }
};

// ================= AFTER LOGIN =================
async function loadAfterLogin(uid) {
  authBox.classList.add("hidden");

  const snap = await get(ref(db, "users/" + uid));
  if (snap.exists()) {
    showDashboard(snap.val().team);
  } else {
    loadTeams(uid);
  }
}

// ================= LOAD TEAMS =================
async function loadTeams(uid) {
  teamSelect.classList.remove("hidden");
  teamsDiv.innerHTML = "";

  const snap = await get(ref(db, "teams"));
  const data = snap.val();

  for (let t in logos) {
    const div = document.createElement("div");
    div.className = "team";

    if (data[t]?.taken) div.classList.add("taken");

    div.innerHTML = `
      <img src="${logos[t]}" />
      <br>${t}
    `;

    div.onclick = () => {
      if (!data[t]?.taken) selectTeam(uid, t);
    };

    teamsDiv.appendChild(div);
  }
}

// ================= SELECT TEAM =================
async function selectTeam(uid, team) {
  await update(ref(db, "teams/" + team), { taken: true });
  await set(ref(db, "users/" + uid), { team: team });
  showDashboard(team);
}

// ================= DASHBOARD =================
function showDashboard(team) {
  teamSelect.classList.add("hidden");
  dashboard.classList.remove("hidden");
  myTeam.innerText = "Your Team: " + team;
}
