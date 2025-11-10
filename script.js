import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { 
  getFirestore, doc, getDoc, setDoc 
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🧩 UI Elements
const loginScreen = document.getElementById("login-screen");
const teamScreen = document.getElementById("team-screen");
const mainScreen = document.getElementById("main-screen");
const loginMsg = document.getElementById("login-message");
const selectedTeamName = document.getElementById("selected-team-name");
const teamLogo = document.getElementById("team-logo");

// 🔹 LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginMsg.style.color = "green";
    loginMsg.textContent = "Login successful! Please wait...";
  } catch {
    loginMsg.style.color = "red";
    loginMsg.textContent = "Invalid email or password.";
  }
});

// 🔹 SIGN UP
document.getElementById("signupBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    loginMsg.style.color = "green";
    loginMsg.textContent = "Account created! You can now log in.";
  } catch {
    loginMsg.style.color = "red";
    loginMsg.textContent = "Error creating account. Try again.";
  }
});

// 🔹 AUTH STATE CHANGE
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  // 🔸 If user doc exists and team chosen → show main screen
  if (userSnap.exists() && userSnap.data().team) {
    const data = userSnap.data();
    showMainScreen(data.team, data.logo);
  } 
  // 🔸 Else show team selection screen
  else {
    loginScreen.classList.remove("active");
    teamScreen.classList.add("active");
  }
});

// 🔹 TEAM SELECTION LOGIC
document.querySelectorAll(".team").forEach(team => {
  team.addEventListener("click", async () => {
    const teamName = team.dataset.team;
    const teamLogoURL = team.dataset.logo;

    const confirmChoice = confirm(`You selected ${teamName}! Confirm?`);
    if (!confirmChoice) return;

    const user = auth.currentUser;
    if (!user) return alert("Please log in first.");

    // Check if team already taken
    const teamRef = doc(db, "teams", teamName);
    const teamSnap = await getDoc(teamRef);

    if (teamSnap.exists()) {
      alert("❌ This team is already taken! Choose another one.");
      return;
    }

    // Save team for user + mark it as taken
    await setDoc(doc(db, "users", user.uid), { team: teamName, logo: teamLogoURL });
    await setDoc(teamRef, { takenBy: user.uid });

    showMainScreen(teamName, teamLogoURL);
  });
});

// 🔹 SHOW MAIN SCREEN FUNCTION
function showMainScreen(teamName, teamLogoURL) {
  loginScreen.classList.remove("active");
  teamScreen.classList.remove("active");
  mainScreen.classList.add("active");

  selectedTeamName.textContent = teamName;
  teamLogo.src = teamLogoURL || "";
  }
