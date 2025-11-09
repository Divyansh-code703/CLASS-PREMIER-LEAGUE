// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  projectId: "class-premier-league",
  storageBucket: "class-premier-league.firebasestorage.app",
  messagingSenderId: "59210532535",
  appId: "1:59210532535:web:4558b69e94949b65cc6f32"
};

// Initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM elements
const authSection = document.getElementById("auth");
const teamSelectSection = document.getElementById("team-select");
const dashboardSection = document.getElementById("dashboard");
const teamsGrid = document.getElementById("teamsGrid");
const chooseTeamBtn = document.getElementById("chooseTeamBtn");
const userEmailSpan = document.getElementById("userEmail");
const yourTeamSpan = document.getElementById("yourTeam");

// 🏏 Teams data
const teams = [
  { name: "RCB", logo: "250px-Royal_Challengers_Bengaluru_Logo.svg.png" },
  { name: "CSK", logo: "chennai-super-kings3461.jpg" },
  { name: "KKR", logo: "778px-Kolkata_Knight_Riders_Logo.svg.png" },
  { name: "MI",  logo: "1200px-Mumbai_Indians_Logo.svg (1).png" },
  { name: "LSG", logo: "1200px-Lucknow_Super_Giants_IPL_Logo.svg (1).png" },
  { name: "SRH", logo: "627d11598a632ca996477eb0.png" }
];

// 🧩 UI helpers
function show(section) {
  [authSection, teamSelectSection, dashboardSection].forEach(s => s.classList.add("hidden"));
  section.classList.remove("hidden");
}

// 🏁 Populate teams
function renderTeams() {
  teamsGrid.innerHTML = "";
  teams.forEach(team => {
    const div = document.createElement("div");
    div.className = "team-card";
    div.innerHTML = `
      <img src="${team.logo}" alt="${team.name}">
      <p>${team.name}</p>
    `;
    div.onclick = () => selectTeam(div, team.name);
    teamsGrid.appendChild(div);
  });
}

let selectedTeam = null;
function selectTeam(card, name) {
  document.querySelectorAll(".team-card").forEach(c => c.classList.remove("selected"));
  card.classList.add("selected");
  selectedTeam = name;
  chooseTeamBtn.disabled = false;
}

// ✨ Sign Up
document.getElementById("signupBtn").onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCred.user.uid), { email, team: null });
    alert("Signup successful! Now choose your team.");
    renderTeams();
    show(teamSelectSection);
  } catch (e) { alert(e.message); }
};

// ✨ Login
document.getElementById("loginBtn").onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, "users", userCred.user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      userEmailSpan.textContent = data.email;
      if (data.team) {
        yourTeamSpan.textContent = data.team;
        show(dashboardSection);
      } else {
        renderTeams();
        show(teamSelectSection);
      }
    }
  } catch (e) { alert(e.message); }
};

// ✅ Confirm Team
chooseTeamBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user || !selectedTeam) return alert("Select your team first!");
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    team: selectedTeam
  });
  yourTeamSpan.textContent = selectedTeam;
  show(dashboardSection);
};

// 🚪 Sign out
document.getElementById("signoutBtn").onclick = async () => {
  await signOut(auth);
  show(authSection);
};
