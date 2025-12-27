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

const msg = document.getElementById("authMsg");

window.signup = async () => {
  const e = email.value.trim();
  const p = password.value.trim();

  if (!e && !p) return msg.innerText = "Please fill all fields";
  if (!e) return msg.innerText = "Please enter email";
  if (!p) return msg.innerText = "Please enter password";
  if (p.length < 6) return msg.innerText = "Password must be at least 6 characters";

  try {
    await createUserWithEmailAndPassword(auth, e, p);
    msg.innerText = "Signup successful, please login";
  } catch (err) {
    msg.innerText = "Account already exists, please login";
  }
};

window.login = async () => {
  const e = email.value.trim();
  const p = password.value.trim();

  if (!e && !p) return msg.innerText = "Please fill all fields";
  if (!e) return msg.innerText = "Please enter email";
  if (!p) return msg.innerText = "Please enter password";

  try {
    const user = await signInWithEmailAndPassword(auth, e, p);
    msg.innerText = "Login successful";
    loadAfterLogin(user.user.uid);
  } catch {
    msg.innerText = "Account not found or wrong password";
  }
};

async function loadAfterLogin(uid) {
  authBox.classList.add("hidden");

  const snap = await get(ref(db, "users/" + uid));
  if (snap.exists()) {
    showDashboard(snap.val().team);
  } else {
    loadTeams(uid);
  }
}

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

async function selectTeam(uid, team) {
  await update(ref(db, "teams/" + team), { taken: true });
  await set(ref(db, "users/" + uid), { team });
  showDashboard(team);
}

function showDashboard(team) {
  teamSelect.classList.add("hidden");
  dashboard.classList.remove("hidden");
  myTeam.innerText = "Your Team: " + team;
}
