// ---------------------- FIREBASE SETUP ---------------------- //
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Firebase Config
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
const auth = getAuth();
const db = getFirestore();


// ---------------------- DOM ELEMENTS ---------------------- //
const loginScreen = document.getElementById("login-screen");
const teamScreen = document.getElementById("team-screen");
const dashboard = document.getElementById("dashboard");
const bottomNav = document.getElementById("bottom-nav");
const screens = document.querySelectorAll(".screen");

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loginMsg = document.getElementById("login-message");

const selectedTeamName = document.getElementById("selected-team-name");
const teamLogo = document.getElementById("team-logo");
const thanksText = document.getElementById("thanks-text");

let CURRENT_USER_ID = null;


// ---------------------- SIGNUP ---------------------- //
signupBtn.addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    loginMsg.textContent = "Enter all fields!";
    return;
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    CURRENT_USER_ID = result.user.uid;

    await setDoc(doc(db, "users", CURRENT_USER_ID), {
      name: name,
      email: email,
      team: null
    });

    loginMsg.textContent = "Signup successful! Please Login.";
  } catch (error) {
    loginMsg.textContent = error.message;
  }
});


// ---------------------- LOGIN ---------------------- //
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    loginMsg.textContent = "Please enter email & password!";
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    CURRENT_USER_ID = userCredential.user.uid;

    loginMsg.textContent = "Login successful!";

    const userDoc = await getDoc(doc(db, "users", CURRENT_USER_ID));

    if (userDoc.exists()) {
      const data = userDoc.data();

      if (data.team === null) {
        showScreen("team-screen");
      } else {
        showDashboard(data.team, data.name);
        showScreen("dashboard");
      }
    }

  } catch (error) {
    loginMsg.textContent = "Wrong credentials!";
  }
});


// ---------------------- TEAM SELECTION ---------------------- //
document.querySelectorAll(".team").forEach((teamDiv) => {
  teamDiv.onclick = async () => {
    const team = teamDiv.dataset.team;

    const confirmChoice = confirm(`Choose ${team}?`);
    if (!confirmChoice) return;

    await setDoc(doc(db, "users", CURRENT_USER_ID), {
      team: team
    }, { merge: true });

    const userDoc = await getDoc(doc(db, "users", CURRENT_USER_ID));
    const data = userDoc.data();

    showDashboard(team, data.name);
    showScreen("dashboard");
  };
});


// ---------------------- DASHBOARD ---------------------- //
function showDashboard(team, name) {
  const logos = {
    RCB: "250px-Royal_Challengers_Bengaluru_Logo.svg.png",
    CSK: "chennai-super-kings3461.jpg",
    KKR: "778px-Kolkata_Knight_Riders_Logo.svg.png",
    MI: "1200px-Mumbai_Indians_Logo.svg (1).png",
    LSG: "1200px-Lucknow_Super_Giants_IPL_Logo.svg (1).png",
    SRH: "627d11598a632ca996477eb0.png",
    GT: "627d09228a632ca996477e87 (1).png",
    PBKS: "Punjab_Kings_Logo.svg.png"
  };

  teamLogo.src = logos[team];
  selectedTeamName.textContent = `Team: ${team}`;
  thanksText.textContent = `Thanks for joining, ${name}!`;
}


// ---------------------- SCREEN CHANGE ---------------------- //
function showScreen(id) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  bottomNav.classList.remove("hidden");
}


// ---------------------- NAV BAR ---------------------- //
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const target = btn.dataset.target;
    showScreen(target);

    if (target === "dashboard") {
      const userDoc = await getDoc(doc(db, "users", CURRENT_USER_ID));
      const data = userDoc.data();
      showDashboard(data.team, data.name);
    }
  });
});
