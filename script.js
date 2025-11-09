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

// Firebase Config (your own)
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

const teams = [
  { name: "Royal Challengers Bangalore", logo: "250px-Royal_Challengers_Bengaluru_Logo.svg.png" },
  { name: "Chennai Super Kings", logo: "chennai-super-kings3461.jpg" },
  { name: "Kolkata Knight Riders", logo: "778px-Kolkata_Knight_Riders_Logo.svg.png" },
  { name: "Mumbai Indians", logo: "1200px-Mumbai_Indians_Logo.svg (1).png" },
  { name: "Lucknow Super Giants", logo: "1200px-Lucknow_Super_Giants_IPL_Logo.svg (1).png" },
  { name: "Sunrisers Hyderabad", logo: "627d11598a632ca996477eb0.png" }
];

let selectedTeam = "";

// Display teams
teams.forEach(t => {
  const div = document.createElement("div");
  div.className = "team-card";
  div.innerHTML = `
    <img src="${t.logo}" alt="${t.name}">
    <div>${t.name}</div>
  `;
  div.onclick = () => {
    document.querySelectorAll(".team-card").forEach(el => el.classList.remove("selected"));
    div.classList.add("selected");
    selectedTeam = t.name;
    chooseTeamBtn.disabled = false;
  };
  teamsGrid.appendChild(div);
});

// Signup
signupBtn.onclick = async () => {
  try {
    await createUserWithEmailAndPassword(auth, emailInput.value, passInput.value);
    alert("Signup Successful!");
  } catch (err) {
    alert(err.message);
  }
};

// Login
loginBtn.onclick = async () => {
  try {
    await signInWithEmailAndPassword(auth, emailInput.value, passInput.value);
    alert("Login Successful!");
  } catch (err) {
    alert(err.message);
  }
};

// Choose team
chooseTeamBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(doc(db, "users", user.uid), { team: selectedTeam });
  alert(`Team ${selectedTeam} chosen!`);
};

// Logout
signoutBtn.onclick = () => signOut(auth);

// Auth listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    authSection.classList.add("hidden");
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      userEmailSpan.textContent = user.email;
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
