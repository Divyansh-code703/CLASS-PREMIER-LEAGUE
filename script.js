import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Firebase Config
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

// DOM
const loginScreen = document.getElementById("login-screen");
const teamScreen = document.getElementById("team-screen");
const mainScreen = document.getElementById("main-screen");
const loginMsg = document.getElementById("login-message");
const selectedTeamName = document.getElementById("selected-team-name");
const selectedTeamLogo = document.getElementById("selected-team-logo");

// LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginMsg.textContent = "Login successful!";
  } catch (e) {
    loginMsg.textContent = "Invalid email or password.";
  }
});

// SIGNUP
document.getElementById("signupBtn").addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    loginMsg.textContent = "Account created! You can now log in.";
  } catch {
    loginMsg.textContent = "Error creating account.";
  }
});

// AUTH STATE
onAuthStateChanged(auth, async user => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      // Already has a team
      const data = snap.data();
      showMainScreen(data.team, data.logo);
    } else {
      loginScreen.classList.remove("active");
      teamScreen.classList.add("active");
    }
  }
});

// TEAM SELECTION
document.querySelectorAll(".team").forEach(team => {
  team.addEventListener("click", async () => {
    const teamName = team.dataset.team;
    const teamLogo = team.querySelector("img").src;

    const teamRef = doc(db, "teams", teamName);
    const teamSnap = await getDoc(teamRef);

    if (teamSnap.exists()) {
      alert("❌ This team is already taken!");
      return;
    }

    const confirmChoice = confirm(`You selected ${teamName}. Confirm?`);
    if (!confirmChoice) return;

    const user = auth.currentUser;
    if (!user) return;

    // Save in Firestore
    await setDoc(doc(db, "teams", teamName), { owner: user.email });
    await setDoc(doc(db, "users", user.uid), { team: teamName, logo: teamLogo });

    showMainScreen(teamName, teamLogo);
  });
});

function showMainScreen(teamName, teamLogo) {
  teamScreen.classList.remove("active");
  loginScreen.classList.remove("active");
  mainScreen.classList.add("active");
  selectedTeamName.textContent = teamName;
  selectedTeamLogo.src = teamLogo;
      }
