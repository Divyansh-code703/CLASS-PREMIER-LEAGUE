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

// 📱 Screens
const loginScreen = document.getElementById("login-screen");
const teamScreen = document.getElementById("team-screen");
const mainScreen = document.getElementById("main-screen");
const loginMsg = document.getElementById("login-message");
const selectedTeamName = document.getElementById("selected-team-name");

// 🟢 SIGN UP
document.getElementById("signupBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    loginMsg.style.color = "green";
    loginMsg.textContent = "Account created! You can now log in.";
  } catch (err) {
    loginMsg.textContent = "Error creating account. Try again.";
  }
});

// 🟢 LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginMsg.style.color = "green";
    loginMsg.textContent = "Login successful!";
  } catch (err) {
    loginMsg.textContent = "Invalid email or password.";
  }
});

// 🟢 Auth Change → Check Team
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    loginScreen.classList.remove("active");

    if (userSnap.exists() && userSnap.data().team) {
      // ✅ User already has a team
      selectedTeamName.textContent = userSnap.data().team;
      mainScreen.classList.add("active");
    } else {
      // ❌ User needs to select team
      teamScreen.classList.add("active");
    }
  }
});

// 🟢 TEAM SELECTION (Only if team not taken)
document.querySelectorAll(".team").forEach(team => {
  team.addEventListener("click", async () => {
    const teamName = team.dataset.team;
    const confirmChoice = confirm(`You selected ${teamName}! Proceed?`);

    if (confirmChoice) {
      // Check if team already taken
      const q = query(collection(db, "users"), where("team", "==", teamName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert(`❌ Sorry! Team ${teamName} is already taken by another player.`);
        return;
      }

      // Lock team for current user
      const user = auth.currentUser;
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { team: teamName });

      alert(`✅ Team ${teamName} locked successfully!`);
      teamScreen.classList.remove("active");
      mainScreen.classList.add("active");
      selectedTeamName.textContent = teamName;
    }
  });
});
