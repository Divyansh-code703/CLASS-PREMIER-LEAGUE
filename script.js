import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  projectId: "class-premier-league",
  storageBucket: "class-premier-league.firebasestorage.app",
  messagingSenderId: "59210532535",
  appId: "1:59210532535:web:4558b69e94949b65cc6f32"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginScreen = document.getElementById("login-screen");
const teamScreen = document.getElementById("team-screen");
const mainScreen = document.getElementById("main-screen");
const loginMsg = document.getElementById("login-message");
const selectedTeamName = document.getElementById("selected-team-name");

// When user is logged in
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists() && userSnap.data().team) {
      // Already selected team
      loginScreen.classList.remove("active");
      teamScreen.classList.remove("active");
      mainScreen.classList.add("active");
      selectedTeamName.textContent = userSnap.data().team;
    } else {
      loginScreen.classList.remove("active");
      teamScreen.classList.add("active");
    }
  } else {
    loginScreen.classList.add("active");
    teamScreen.classList.remove("active");
    mainScreen.classList.remove("active");
  }
});

// Login
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginMsg.style.color = "green";
    loginMsg.textContent = "Login successful!";
  } catch (e) {
    loginMsg.textContent = "Invalid email or password.";
  }
});

// Signup
document.getElementById("signupBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    loginMsg.style.color = "green";
    loginMsg.textContent = "Account created! You can now log in.";
  } catch {
    loginMsg.textContent = "Error creating account.";
  }
});

// Team Selection
document.querySelectorAll(".team").forEach(team => {
  team.addEventListener("click", async () => {
    const teamName = team.dataset.team;
    const confirmChoice = confirm(`You selected ${teamName}. Proceed?`);
    if (!confirmChoice) return;

    const teamDoc = doc(db, "teams", teamName);
    const teamSnap = await getDoc(teamDoc);
    if (teamSnap.exists() && teamSnap.data().taken) {
      alert("Sorry, this team is already taken!");
      return;
    }

    const user = auth.currentUser;
    if (!user) return alert("Please login first.");

    // Mark team taken + save to user profile
    await setDoc(teamDoc, { taken: true, by: user.uid });
    await setDoc(doc(db, "users", user.uid), { team: teamName });

    teamScreen.classList.remove("active");
    mainScreen.classList.add("active");
    selectedTeamName.textContent = teamName;
  });
});
