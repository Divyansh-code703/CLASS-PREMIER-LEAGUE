import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  update
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

/* 🔥 FIREBASE CONFIG */
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
const db = getDatabase(app);

/* ELEMENTS */
const authBox = document.getElementById("authBox");
const teamSelect = document.getElementById("teamSelect");
const dashboard = document.getElementById("dashboard");
const teamsDiv = document.getElementById("teams");
const myTeam = document.getElementById("myTeam");
const authMsg = document.getElementById("authMsg");

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

/* 🔁 RESET UI (VERY IMPORTANT) */
function resetUI() {
  authBox.classList.add("hidden");
  teamSelect.classList.add("hidden");
  dashboard.classList.add("hidden");
  authMsg.innerText = "";
}

/* LOGIN */
loginBtn.onclick = () => {
  if (!email.value || !password.value) {
    authMsg.innerText = "Please fill email and password";
    return;
  }

  signInWithEmailAndPassword(auth, email.value, password.value)
    .catch(() => {
      authMsg.innerText = "Account not found, signup first";
    });
};

/* SIGNUP */
signupBtn.onclick = () => {
  if (!email.value || !password.value) {
    authMsg.innerText = "Please fill email and password";
    return;
  }

  createUserWithEmailAndPassword(auth, email.value, password.value)
    .catch(() => {
      authMsg.innerText = "Account already exists, login";
    });
};

/* AUTH STATE (🔥 MAIN FIX HERE 🔥) */
onAuthStateChanged(auth, async user => {
  resetUI();

  if (!user) {
    authBox.classList.remove("hidden");
    return;
  }

  const userSnap = await get(ref(db, "users/" + user.uid));

  if (userSnap.exists() && userSnap.val().team) {
    showDashboard(userSnap.val().team);
  } else {
    loadTeams(user.uid);
  }
});

/* TEAM LIST (8 TEAMS) */
const teamList = [
  { name: "CSK", img: "chennai-super-kings3461.jpg" },
  { name: "MI", img: "1200px-Mumbai_Indians_Logo.svg (1).png" },
  { name: "RCB", img: "250px-Royal_Challengers_Bengaluru_Logo.svg.png" },
  { name: "KKR", img: "778px-Kolkata_Knight_Riders_Logo.svg.pn" },
  { name: "SRH", img: "627d11598a632ca996477eb0.png" },
  { name: "PBKS", img: "Punjab_Kings_Logo.svg.png" },
  { name: "GT", img: "627d09228a632ca996477e87 (1).png" },
  { name: "LSG", img: "1200px-Lucknow_Super_Giants_IPL_Logo.svg (1).png" }
];

/* LOAD TEAMS */
async function loadTeams(uid) {
  teamSelect.classList.remove("hidden");
  teamsDiv.innerHTML = "";

  const takenSnap = await get(ref(db, "teams"));
  const takenTeams = takenSnap.exists() ? takenSnap.val() : {};

  teamList.forEach(team => {
    if (takenTeams[team.name]) return;

    const img = document.createElement("img");
    img.src = team.img;
    img.title = team.name;

    img.onclick = async () => {
      await set(ref(db, "users/" + uid), { team: team.name });
      await update(ref(db, "teams"), { [team.name]: true });
      showDashboard(team.name);
    };

    teamsDiv.appendChild(img);
  });
}

/* SHOW DASHBOARD */
function showDashboard(team) {
  resetUI();
  dashboard.classList.remove("hidden");
  myTeam.innerText = "Your Team : " + team;
  }
