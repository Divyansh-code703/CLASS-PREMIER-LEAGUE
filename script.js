import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  child 
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

// 🔥 Firebase config (your original one)
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
const db = getDatabase(app);

// UI elements
const loginScreen = document.getElementById("login-screen");
const teamScreen = document.getElementById("team-screen");
const mainScreen = document.getElementById("main-screen");
const loginMsg = document.getElementById("login-message");
const selectedTeamName = document.getElementById("selected-team-name");

// LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!email || !password) {
    loginMsg.textContent = "Please fill both fields.";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginMsg.style.color = "green";
    loginMsg.textContent = "Login successful!";
    setTimeout(() => {
      loginScreen.classList.remove("active");
      teamScreen.classList.add("active");
    }, 800);
  } catch {
    loginMsg.textContent = "Invalid email or password.";
  }
});

// SIGNUP
document.getElementById("signupBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!email || !password) {
    loginMsg.textContent = "Please fill both fields.";
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    loginMsg.style.color = "green";
    loginMsg.textContent = "Account created! You can now log in.";
  } catch {
    loginMsg.textContent = "Error creating account. Try again.";
  }
});

// TEAM SELECTION with lock system 🔒
document.querySelectorAll(".team").forEach(team => {
  team.addEventListener("click", async () => {
    document.querySelectorAll(".team").forEach(t => t.style.border = "none");
    team.style.border = "3px solid #007bff";

    const teamName = team.dataset.team;
    const confirmChoice = confirm(`You selected ${teamName}! Proceed?`);
    if (!confirmChoice) return;

    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `teams/${teamName}`));

    if (snapshot.exists()) {
      alert(`Sorry! ${teamName} is already taken by another player.`);
      team.style.border = "none";
    } else {
      const user = auth.currentUser;
      await set(ref(db, `teams/${teamName}`), {
        email: user.email,
        team: teamName,
        time: new Date().toISOString()
      });

      alert(`${teamName} locked successfully!`);
      teamScreen.classList.remove("active");
      mainScreen.classList.add("active");
      selectedTeamName.textContent = teamName;
    }
  });
});
