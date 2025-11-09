import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

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
const mainScreen = document.getElementById("main-screen"); // 👈 next screen (ensure this div exists)
const loginMsg = document.getElementById("login-message");

let selectedTeam = null;

// ✅ Login
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginMsg.style.color = "green";
    loginMsg.textContent = "Login successful!";
    setTimeout(() => {
      loginScreen.classList.remove("active");
      teamScreen.classList.add("active");
    }, 1000);
  } catch {
    loginMsg.textContent = "Invalid email or password.";
  }
});

// ✅ Signup
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

// ✅ Team selection + confirmation + transition fix
document.querySelectorAll(".team").forEach(team => {
  team.addEventListener("click", () => {
    document.querySelectorAll(".team").forEach(t => (t.style.border = "none"));
    team.style.border = "3px solid #007bff";
    selectedTeam = team.dataset.team;

    const confirmSelect = confirm(`You selected ${selectedTeam}. Tap OK to confirm.`);
    if (confirmSelect) {
      // hide team screen, show main screen
      teamScreen.classList.remove("active");
      mainScreen.classList.add("active");

      // optional: show message or data
      document.getElementById("selected-team-name").textContent = selectedTeam;
    }
  });
});
