    import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// 🔥 Firebase Config
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

// Screens
const loginScreen = document.getElementById("login-screen");
const teamScreen = document.getElementById("team-screen");
const mainScreen = document.getElementById("main-screen");
const loginMsg = document.getElementById("login-message");
const selectedTeamName = document.getElementById("selected-team-name");

// ---------------- LOGIN ----------------
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginMsg.style.color = "green";
    loginMsg.textContent = "Login successful!";
  } catch {
    loginMsg.textContent = "❌ Invalid email or password.";
  }
});

// ---------------- SIGNUP ----------------
document.getElementById("signupBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    loginMsg.style.color = "green";
    loginMsg.textContent = "✅ Account created! You can now log in.";
  } catch {
    loginMsg.textContent = "❌ Error creating account.";
  }
});

// ---------------- AUTH STATE CHANGE ----------------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // Hide login screen
    loginScreen.classList.remove("active");

    if (userSnap.exists() && userSnap.data().team) {
      // Team already selected → go to main screen
      selectedTeamName.textContent = userSnap.data().team;
      mainScreen.classList.add("active");
    } else {
      // Team not selected → show team selection
      teamScreen.classList.add("active");
    }
  } else {
    // If logged out (optional future phase)
    loginScreen.classList.add("active");
  }
});

// ---------------- TEAM SELECTION ----------------
document.querySelectorAll(".team").forEach(team => {
  team.addEventListener("click", async () => {
    const teamName = team.dataset.team;

    const confirmChoice = confirm(`You selected ${teamName}! Proceed?`);
    if (!confirmChoice) return;

    // Check if team already taken
    const q = query(collection(db, "users"), where("team", "==", teamName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      alert(`❌ Team ${teamName} is already taken.`);
      return;
    }

    // Assign team to current user
    const user = auth.currentUser;
    if (!user) {
      alert("Login error. Please re-login.");
      return;
    }

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      team: teamName
    });

    alert(`✅ You have successfully joined ${teamName}!`);
    teamScreen.classList.remove("active");
    mainScreen.classList.add("active");
    selectedTeamName.textContent = teamName;
  });
});
