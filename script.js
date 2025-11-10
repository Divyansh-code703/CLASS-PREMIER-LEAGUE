import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

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

const loginScreen = document.getElementById("login-screen");
const teamScreen = document.getElementById("team-screen");
const mainScreen = document.getElementById("main-screen");
const loginMsg = document.getElementById("login-message");
const selectedTeamName = document.getElementById("selected-team-name");
const teamLogo = document.getElementById("team-logo");

// 🔹 Login
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginMsg.style.color = "green";
    loginMsg.textContent = "Login successful! Loading...";
  } catch {
    loginMsg.style.color = "red";
    loginMsg.textContent = "Invalid email or password.";
  }
});

// 🔹 Sign Up
document.getElementById("signupBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    loginMsg.style.color = "green";
    loginMsg.textContent = "Account created! Please login.";
  } catch {
    loginMsg.style.color = "red";
    loginMsg.textContent = "Error creating account.";
  }
});

// 🔹 Auth State Change
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data.team) {
        showMainScreen(data.team, data.logo);
      } else {
        loginScreen.classList.remove("active");
        teamScreen.classList.add("active");
      }
    } else {
      await setDoc(userRef, {}); // empty user doc
      loginScreen.classList.remove("active");
      teamScreen.classList.add("active");
    }
  }
});

// 🔹 Team Selection
document.querySelectorAll(".team").forEach(team => {
  team.addEventListener("click", async () => {
    const teamName = team.dataset.team;
    const teamLogoURL = team.dataset.logo;
    const confirmChoice = confirm(`You selected ${teamName}! Confirm?`);
    if (!confirmChoice) return;

    const user = auth.currentUser;
    if (!user) return;

    const teamRef = doc(db, "teams", teamName);
    const teamSnap = await getDoc(teamRef);

    if (teamSnap.exists()) {
      alert("This team is already taken! Choose another.");
      return;
    }

    await setDoc(teamRef, { takenBy: user.uid });
    await setDoc(doc(db, "users", user.uid), { team: teamName, logo: teamLogoURL });

    showMainScreen(teamName, teamLogoURL);
  });
});

function showMainScreen(teamName, teamLogoURL) {
  teamScreen.classList.remove("active");
  loginScreen.classList.remove("active");
  mainScreen.classList.add("active");

  selectedTeamName.textContent = teamName;
  teamLogo.src = teamLogoURL;
        }
