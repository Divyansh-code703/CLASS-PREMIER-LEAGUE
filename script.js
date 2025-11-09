import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// ✅ Your Firebase Config
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

// ELEMENTS
const authSection = document.getElementById("auth");
const teamSelect = document.getElementById("team-select");
const dashboard = document.getElementById("dashboard");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const signoutBtn = document.getElementById("signoutBtn");
const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const userEmailSpan = document.getElementById("userEmail");
const yourTeamSpan = document.getElementById("yourTeam");
const chooseTeamBtn = document.getElementById("chooseTeamBtn");
const teamsGrid = document.getElementById("teamsGrid");

let selectedTeam = "";

// 🟢 TEAM LIST WITH LOGOS
const teams = [
  { name: "Mumbai Indians", logo: "https://upload.wikimedia.org/wikipedia/en/2/25/Mumbai_Indians_Logo.svg" },
  { name: "Chennai Super Kings", logo: "https://upload.wikimedia.org/wikipedia/en/2/2e/Chennai_Super_Kings_Logo.svg" },
  { name: "Royal Challengers Bangalore", logo: "https://upload.wikimedia.org/wikipedia/en/3/30/Royal_Challengers_Bangalore_Logo.svg" },
  { name: "Kolkata Knight Riders", logo: "https://upload.wikimedia.org/wikipedia/en/4/4c/Kolkata_Knight_Riders_Logo.svg" },
  { name: "Gujarat Titans", logo: "https://upload.wikimedia.org/wikipedia/en/8/89/Gujarat_Titans_Logo.svg" },
  { name: "Sunrisers Hyderabad", logo: "https://upload.wikimedia.org/wikipedia/en/8/81/Sunrisers_Hyderabad_Logo.svg" }
];

// 🟢 Render Teams
teams.forEach(team => {
  const div = document.createElement("div");
  div.className = "team-card";
  div.innerHTML = `
    <img src="${team.logo}" alt="${team.name}" class="team-logo">
    <div class="team-name">${team.name}</div>
  `;
  div.onclick = () => {
    document.querySelectorAll(".team-card").forEach(el => el.classList.remove("selected"));
    div.classList.add("selected");
    selectedTeam = team.name;
    chooseTeamBtn.disabled = false;
  };
  teamsGrid.appendChild(div);
});

// 🟡 Signup
signupBtn.onclick = async () => {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, emailInput.value, passInput.value);
    alert("✅ Signup Successful!");
  } catch (err) {
    alert("❌ " + err.message);
  }
};

// 🟡 Login
loginBtn.onclick = async () => {
  try {
    await signInWithEmailAndPassword(auth, emailInput.value, passInput.value);
    alert("✅ Login Successful!");
  } catch (err) {
    alert("❌ " + err.message);
  }
};

// 🟢 Select Team
chooseTeamBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(doc(db, "users", user.uid), { email: user.email, team: selectedTeam });
  alert(`✅ Team ${selectedTeam} chosen!`);
};

// 🟡 Logout
signoutBtn.onclick = () => signOut(auth);

// 🟢 Auth State Changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    authSection.classList.add("hidden");
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      userEmailSpan.textContent = data.email;
      yourTeamSpan.textContent = data.team;
      teamSelect.classList.add("hidden");
      dashboard.classList.remove("hidden");
    } else {
      teamSelect.classList.remove("hidden");
      dashboard.classList.add("hidden");
    }
  } else {
    authSection.classList.remove("hidden");
    teamSelect.classList.add("hidden");
    dashboard.classList.add("hidden");
  }
});
