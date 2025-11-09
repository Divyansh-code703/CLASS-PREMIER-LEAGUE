import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔥 Firebase config
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
const db = getFirestore(app);

// DOM
const authSec = document.getElementById("authSection");
const teamSec = document.getElementById("teamSection");
const dashSec = document.getElementById("dashboardSection");
const confirmBtn = document.getElementById("confirmBtn");
const userEmailSpan = document.getElementById("userEmail");
const yourTeamSpan = document.getElementById("yourTeam");
const teamsGrid = document.getElementById("teamsGrid");

// 🏏 Teams list (use your image names)
const teams = [
  { name: "RCB", logo: "250px-Royal_Challengers_Bengaluru_Logo.svg.png" },
  { name: "CSK", logo: "chennai-super-kings3461.jpg" },
  { name: "KKR", logo: "778px-Kolkata_Knight_Riders_Logo.svg.png" },
  { name: "MI",  logo: "1200px-Mumbai_Indians_Logo.svg (1).png" },
  { name: "LSG", logo: "1200px-Lucknow_Super_Giants_IPL_Logo.svg (1).png" },
  { name: "SRH", logo: "627d11598a632ca996477eb0.png" }
];

function show(section) {
  [authSec, teamSec, dashSec].forEach(s => s.classList.add("hidden"));
  section.classList.remove("hidden");
}

// render team cards
function loadTeams() {
  teamsGrid.innerHTML = "";
  teams.forEach(t => {
    const div = document.createElement("div");
    div.className = "team-card";
    div.innerHTML = `<img src="${t.logo}" alt="${t.name}"><p>${t.name}</p>`;
    div.onclick = () => selectTeam(div, t.name);
    teamsGrid.appendChild(div);
  });
}
let selectedTeam = null;
function selectTeam(div, name) {
  document.querySelectorAll(".team-card").forEach(c => c.classList.remove("selected"));
  div.classList.add("selected");
  selectedTeam = name;
  confirmBtn.disabled = false;
}

// sign up
document.getElementById("signupBtn").onclick = async () => {
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value.trim();
  if (!email || !pass) return alert("Enter both fields");
  try {
    const user = await createUserWithEmailAndPassword(auth, email, pass);
    await setDoc(doc(db, "users", user.user.uid), { email, team: null });
    alert("Signup success! Now choose team.");
    loadTeams();
    show(teamSec);
  } catch (e) { alert(e.message); }
};

// login
document.getElementById("loginBtn").onclick = async () => {
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value.trim();
  try {
    const user = await signInWithEmailAndPassword(auth, email, pass);
    const snap = await getDoc(doc(db, "users", user.user.uid));
    const data = snap.data();
    userEmailSpan.textContent = data.email;
    if (data.team) {
      yourTeamSpan.textContent = data.team;
      show(dashSec);
    } else {
      loadTeams();
      show(teamSec);
    }
  } catch (e) { alert(e.message); }
};

// confirm team
confirmBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!selectedTeam) return alert("Select a team first");
  await setDoc(doc(db, "users", user.uid), { email: user.email, team: selectedTeam });
  yourTeamSpan.textContent = selectedTeam;
  alert(`${selectedTeam} confirmed!`);
  show(dashSec);
};

// sign out
document.getElementById("signoutBtn").onclick = async () => {
  await signOut(auth);
  show(authSec);
};
