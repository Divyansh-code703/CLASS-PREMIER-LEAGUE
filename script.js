  // Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

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

// Login functionality
const loginBtn = document.getElementById("loginBtn");
const loginScreen = document.getElementById("login-screen");
const teamScreen = document.getElementById("team-screen");
const loginMsg = document.getElementById("login-message");

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginMsg.textContent = "Login successful!";
    setTimeout(() => {
      loginScreen.classList.remove("active");
      teamScreen.classList.add("active");
    }, 1000);
  } catch (error) {
    loginMsg.textContent = "Invalid email or password!";
  }
});

// Team selection
const teams = document.querySelectorAll(".team");
teams.forEach(team => {
  team.addEventListener("click", () => {
    teams.forEach(t => t.style.border = "none");
    team.style.border = "3px solid #007bff";
    alert("Team selected: " + team.dataset.team);
  });
});
