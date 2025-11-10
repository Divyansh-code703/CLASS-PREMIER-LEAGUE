import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

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

const loginScreen = document.getElementById("login-screen");
const teamScreen = document.getElementById("team-screen");
const mainScreen = document.getElementById("main-screen");
const loginMsg = document.getElementById("login-message");
const selectedTeamName = document.getElementById("selected-team-name");

let userTeam = localStorage.getItem("userTeam");

// LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  loginMsg.textContent = "Loading...";
  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginMsg.textContent = "Login successful!";
    setTimeout(() => {
      loginScreen.classList.remove("active");
      if (userTeam) {
        selectedTeamName.textContent = userTeam;
        mainScreen.classList.add("active");
      } else {
        teamScreen.classList.add("active");
      }
    }, 1000);
  } catch {
    loginMsg.textContent = "Invalid email or password.";
  }
});

// SIGNUP
document.getElementById("signupBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    loginMsg.style.color = "green";
    loginMsg.textContent = "Account created! You can now log in.";
  } catch {
    loginMsg.textContent = "Error creating account. Try again.";
  }
});

// TEAM SELECT
document.querySelectorAll(".team").forEach(team => {
  team.addEventListener("click", () => {
    const teamName = team.dataset.team;
    const confirmChoice = confirm(`You selected ${teamName}. Proceed?`);
    if (confirmChoice) {
      localStorage.setItem("userTeam", teamName);
      userTeam = teamName;
      teamScreen.classList.remove("active");
      mainScreen.classList.add("active");
      selectedTeamName.textContent = teamName;
    }
  });
});

// LOGOUT
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  localStorage.removeItem("userTeam");
  userTeam = null;
  mainScreen.classList.remove("active");
  loginScreen.classList.add("active");
});
