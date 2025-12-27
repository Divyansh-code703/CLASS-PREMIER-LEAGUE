// 🔥 Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
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

// 🏏 Team logos (EXACT FILE NAMES)
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

// 🔐 Signup
window.signup = () => {
  const email = email.value;
  const pass = password.value;
  if (!email || !pass) return authMsg.innerText = "Fill all fields";

  createUserWithEmailAndPassword(auth, email, pass)
    .catch(e => authMsg.innerText = e.message);
};

// 🔐 Login
window.login = () => {
  const email = email.value;
  const pass = password.value;
  if (!email || !pass) return authMsg.innerText = "Fill all fields";

  signInWithEmailAndPassword(auth, email, pass)
    .catch(() => authMsg.innerText = "Invalid email or password");
};

// 🔄 Auth state
onAuthStateChanged(auth, async user => {
  if (!user) return;

  authBox.classList.add("hidden");

  const snap = await get(ref(db, "users/" + user.uid));
  if (snap.exists()) {
    showDashboard(snap.val().team);
  } else {
    loadTeams(user.uid);
  }
});

// 🏏 Load teams
async function loadTeams(uid) {
  teamSelect.classList.remove("hidden");
  teams.innerHTML = "";

  const snap = await get(ref(db, "teams"));
  const data = snap.val();

  for (let t in logos) {
    const d = document.createElement("div");
    d.className = "team";
    if (data[t].taken) d.classList.add("taken");

    d.innerHTML = `<img src="images/${logos[t]}"><br>${t}`;
    d.onclick = () => selectTeam(uid, t);
    teams.appendChild(d);
  }
}

// ✅ Select team
async function selectTeam(uid, team) {
  await update(ref(db, "teams/" + team), { taken: true });
  await set(ref(db, "users/" + uid), { team });
  showDashboard(team);
}

// 📊 Dashboard
function showDashboard(team) {
  teamSelect.classList.add("hidden");
  dashboard.classList.remove("hidden");
  myTeam.innerText = "Your Team: " + team;
    }
