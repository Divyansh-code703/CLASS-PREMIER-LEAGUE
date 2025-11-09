import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// ✅ Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  projectId: "class-premier-league",
  storageBucket: "class-premier-league.firebasestorage.app",
  messagingSenderId: "59210532535",
  appId: "1:59210532535:web:4558b69e94949b65cc6f32"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM elements
const authSection = document.getElementById("auth");
const teamSelectSection = document.getElementById("team-select");
const dashboardSection = document.getElementById("dashboard");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const signoutBtn = document.getElementById("signoutBtn");
const chooseTeamBtn = document.getElementById("chooseTeamBtn");
const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const userEmailSpan = document.getElementById("userEmail");
const yourTeamSpan = document.getElementById("yourTeam");
const yourPurseSpan = document.getElementById("yourPurse");
const teamsGrid = document.getElementById("teamsGrid");

const TEAMS = [
  { code: "RCB", name: "Royal Challengers Bengaluru", logo: "https://upload.wikimedia.org/wikipedia/en/0/0b/Royal_Challengers_Bengaluru_Logo.svg" },
  { code: "CSK", name: "Chennai Super Kings", logo: "https://upload.wikimedia.org/wikipedia/en/9/9d/Chennai_Super_Kings_Logo.svg" },
  { code: "MI",  name: "Mumbai Indians", logo: "https://upload.wikimedia.org/wikipedia/en/3/3d/Mumbai_Indians_Logo.svg" },
  { code: "LSG", name: "Lucknow Super Giants", logo: "https://upload.wikimedia.org/wikipedia/en/8/8b/Lucknow_Super_Giants_Logo.svg" },
  { code: "PBKS", name: "Punjab Kings", logo: "https://upload.wikimedia.org/wikipedia/en/1/1b/Punjab_Kings_Logo.svg" },
  { code: "SRH", name: "Sunrisers Hyderabad", logo: "https://upload.wikimedia.org/wikipedia/en/1/19/Sunrisers_Hyderabad_Logo.svg" }
];

let selectedTeamCode = null;

function showSection(sec) {
  [authSection, teamSelectSection, dashboardSection].forEach(s => s.classList.add("hidden"));
  sec.classList.remove("hidden");
}

async function renderTeamsGrid() {
  teamsGrid.innerHTML = "";
  const taken = new Set();
  const usersCol = collection(db, "users");
  const snap = await getDocs(usersCol);
  snap.forEach(d => {
    const u = d.data();
    if (u.team) taken.add(u.team);
  });

  TEAMS.forEach(t => {
    const div = document.createElement("div");
    div.className = "team-card";
    div.innerHTML = `
      <img src="${t.logo}" width="60">
      <div>${t.name}</div>
      <small>${t.code} ${taken.has(t.code) ? "(Taken)" : ""}</small>`;
    if (taken.has(t.code)) div.style.opacity = "0.5";
    div.onclick = () => {
      if (taken.has(t.code)) return alert("Team already taken!");
      document.querySelectorAll(".team-card").forEach(c => c.classList.remove("selected"));
      div.classList.add("selected");
      selectedTeamCode = t.code;
      chooseTeamBtn.disabled = false;
    };
    teamsGrid.appendChild(div);
  });
}

// 🔹 Signup
signupBtn.onclick = async () => {
  const email = emailInput.value.trim();
  const pass = passInput.value;
  if (!email || pass.length < 6) return alert("Enter valid email & password (min 6)");
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await setDoc(doc(db, "users", cred.user.uid), { email, team: null, purse: 15000 });
    alert("✅ Signup successful! Choose your team.");
    await renderTeamsGrid();
    showSection(teamSelectSection);
  } catch (e) {
    alert("❌ " + e.message);
  }
};

// 🔹 Login
loginBtn.onclick = async () => {
  const email = emailInput.value.trim();
  const pass = passInput.value;
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    alert("✅ Login successful!");
    await loadDashboard(cred.user.uid);
  } catch (e) {
    alert("❌ " + e.message);
  }
};

// 🔹 Load Dashboard
async function loadDashboard(uid) {
  const uDoc = await getDoc(doc(db, "users", uid));
  const u = uDoc.data();
  userEmailSpan.textContent = u.email;
  yourTeamSpan.textContent = u.team ?? "No team yet";
  yourPurseSpan.textContent = "₹150.00 Cr";
  if (u.team) showSection(dashboardSection);
  else {
    await renderTeamsGrid();
    showSection(teamSelectSection);
  }
}

// 🔹 Select Team
chooseTeamBtn.onclick = async () => {
  if (!selectedTeamCode) return alert("Select a team first!");
  const user = auth.currentUser;
  await updateDoc(doc(db, "users", user.uid), { team: selectedTeamCode });
  alert("✅ Team Selected: " + selectedTeamCode);
  await loadDashboard(user.uid);
};

// 🔹 Sign Out
signoutBtn.onclick = async () => {
  await signOut(auth);
  alert("Logged Out!");
  showSection(authSection);
};

// 🔹 On Auth Change
onAuthStateChanged(auth, async (user) => {
  if (user) await loadDashboard(user.uid);
  else showSection(authSection);
});
