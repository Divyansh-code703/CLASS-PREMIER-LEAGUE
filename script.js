// ✅ Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  projectId: "class-premier-league",
  storageBucket: "class-premier-league.firebasestorage.app",
  messagingSenderId: "59210532535",
  appId: "1:59210532535:web:4558b69e94949b65cc6f32",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ DOM Elements
const loginScreen = document.getElementById("login-screen");
const teamScreen = document.getElementById("team-screen");
const dashboard = document.getElementById("dashboard");
const bottomNav = document.getElementById("bottom-nav");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loginMsg = document.getElementById("login-message");
const thanksText = document.getElementById("thanks-text");

// ✅ SIGN UP FUNCTION
signupBtn.addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    loginMsg.textContent = "⚠️ Please fill all fields!";
    return;
  }

  try {
    const userRef = doc(db, "users", email);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      loginMsg.style.color = "red";
      loginMsg.textContent = "❌ User already exists!";
    } else {
      await setDoc(userRef, {
        name,
        email,
        password,
        team: null,
      });
      loginMsg.style.color = "lightgreen";
      loginMsg.textContent = "✅ Signup successful! Please Login.";
    }
  } catch (error) {
    loginMsg.textContent = "Error: " + error.message;
  }
});

// ✅ LOGIN FUNCTION
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    loginMsg.textContent = "⚠️ Please fill all fields!";
    return;
  }

  try {
    const userRef = doc(db, "users", email);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const user = userSnap.data();

      if (user.password === password) {
        loginMsg.style.color = "lightgreen";
        loginMsg.textContent = "✅ Login successful!";
        setTimeout(() => {
          localStorage.setItem("userEmail", user.email);
          localStorage.setItem("userName", user.name);

          if (user.team) {
            showScreen("dashboard");
            showDashboard(user.team, user.name);
          } else {
            loginScreen.classList.remove("active");
            teamScreen.classList.add("active");
          }
        }, 800);
      } else {
        loginMsg.style.color = "red";
        loginMsg.textContent = "❌ Incorrect password!";
      }
    } else {
      loginMsg.style.color = "red";
      loginMsg.textContent = "❌ No account found!";
    }
  } catch (error) {
    loginMsg.textContent = "Error: " + error.message;
  }
});

// ✅ TEAM SELECTION
document.querySelectorAll(".team").forEach((team) => {
  team.addEventListener("click", async () => {
    const selectedTeam = team.dataset.team;
    const email = localStorage.getItem("userEmail");
    const name = localStorage.getItem("userName");

    if (!email || !name) {
      alert("Please login first!");
      return;
    }

    await setDoc(doc(db, "users", email), {
      name,
      email,
      password: "hidden",
      team: selectedTeam,
    });

    showScreen("dashboard");
    showDashboard(selectedTeam, name);
  });
});

// ✅ DASHBOARD VIEW
function showDashboard(team, name) {
  const logoMap = {
    RCB: "250px-Royal_Challengers_Bengaluru_Logo.svg.png",
    CSK: "chennai-super-kings3461.jpg",
    KKR: "778px-Kolkata_Knight_Riders_Logo.svg.png",
    MI: "1200px-Mumbai_Indians_Logo.svg (1).png",
    LSG: "1200px-Lucknow_Super_Giants_IPL_Logo.svg (1).png",
    SRH: "627d11598a632ca996477eb0.png",
    GT: "627d09228a632ca996477e87 (1).png",
    PBKS: "Punjab_Kings_Logo.svg.png",
  };

  document.getElementById("team-logo").src = logoMap[team];
  document.getElementById("selected-team-name").textContent = `Team: ${team}`;
  thanksText.textContent = `Thanks for joining, ${name}!`;
  bottomNav.classList.remove("hidden");
}

// ✅ SCREEN NAVIGATION
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ✅ BOTTOM NAVIGATION BUTTONS
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    showScreen(target);
  });
});
