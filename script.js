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

// 🔥 Firebase configuration (already yours)
const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  projectId: "class-premier-league",
  storageBucket: "class-premier-league.firebasestorage.app",
  messagingSenderId: "59210532535",
  appId: "1:59210532535:web:4558b69e94949b65cc6f32"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elements
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

const teams = ["Mumbai Indians","Chennai Super Kings","Royal Challengers Bangalore","Kolkata Knight Riders","Gujarat Titans","Sunrisers Hyderabad"];
let selectedTeam = "";

// Display teams
teams.forEach(t => {
  const div = document.createElement("div");
  div.className = "team-card";
  div.innerText = t;
  div.onclick = () => {
    document.querySelectorAll(".team-card").forEach(el => el.classList.remove("selected"));
    div.classList.add("selected");
    selectedTeam = t;
    chooseTeamBtn.disabled = false;
  };
  teamsGrid.appendChild(div);
});

// Signup
signupBtn.onclick = async () => {
  try {
    const userCred = await createUserWithEmailAndPassword(
      auth,
      emailInput.value,
      passInput.value
    );
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

// Select team
chooseTeamBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(doc(db, "users", user.uid), { team: selectedTeam });
  alert(`Team ${selectedTeam} chosen!`);
};

// Logout
signoutBtn.onclick = () => signOut(auth);

// Auth state listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    authSection.classList.add("hidden");
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      // team already selected
      const data = snap.data();
      userEmailSpan.textContent = user.email;
      yourTeamSpan.textContent = data.team;
      teamSelect.classList.add("hidden");
      dashboard.classList.remove("hidden");
    } else {
      // select team
      teamSelect.classList.remove("hidden");
      dashboard.classList.add("hidden");
    }
  } else {
    authSection.classList.remove("hidden");
    teamSelect.classList.add("hidden");
    dashboard.classList.add("hidden");
  }
});
