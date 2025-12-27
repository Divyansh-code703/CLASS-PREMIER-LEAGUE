    import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  databaseURL: "https://class-premier-league-default-rtdb.firebaseio.com",
  projectId: "class-premier-league"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// UI refs
const authBox = document.getElementById("authBox");
const teamBox = document.getElementById("teamBox");
const dashBox = document.getElementById("dashBox");
const authMsg = document.getElementById("authMsg");
const teamMsg = document.getElementById("teamMsg");
const teamName = document.getElementById("teamName");

// 🔐 AUTH STATE CONTROLLER (IMPORTANT)
onAuthStateChanged(auth, user => {

  // sab hide pehle
  authBox.classList.add("hidden");
  teamBox.classList.add("hidden");
  dashBox.classList.add("hidden");

  if (!user) {
    // user logged out
    authBox.classList.remove("hidden");
    return;
  }

  // user logged in
  checkTeam(user.uid);
});

// SIGNUP
window.signup = () => {
  const emailVal = document.getElementById("email").value;
  const passVal = document.getElementById("password").value;

  if (!emailVal || !passVal) {
    authMsg.innerText = "Please fill all fields";
    return;
  }

  createUserWithEmailAndPassword(auth, emailVal, passVal)
    .catch(err => {
      if (err.code === "auth/email-already-in-use") {
        authMsg.innerText = "Account exists, login";
      } else {
        authMsg.innerText = "Signup error";
      }
    });
};

// LOGIN
window.login = () => {
  const emailVal = document.getElementById("email").value;
  const passVal = document.getElementById("password").value;

  if (!emailVal || !passVal) {
    authMsg.innerText = "Please fill all fields";
    return;
  }

  signInWithEmailAndPassword(auth, emailVal, passVal)
    .catch(err => {
      if (err.code === "auth/user-not-found") {
        authMsg.innerText = "Signup first";
      } else if (err.code === "auth/wrong-password") {
        authMsg.innerText = "Wrong password";
      } else {
        authMsg.innerText = "Login error";
      }
    });
};

// TEAM CHECK
function checkTeam(uid) {
  get(ref(db, "users/" + uid)).then(snap => {
    if (snap.exists()) {
      showDashboard(snap.val().team);
    } else {
      teamBox.classList.remove("hidden");
    }
  });
}

// TEAM SELECT
window.selectTeam = team => {
  const uid = auth.currentUser.uid;
  const teamRef = ref(db, "teams/" + team);

  get(teamRef).then(snap => {
    if (snap.exists()) {
      teamMsg.innerText = "Team already taken";
    } else {
      set(teamRef, { takenBy: uid });
      set(ref(db, "users/" + uid), { team });
      showDashboard(team);
    }
  });
};

// DASHBOARD
function showDashboard(team) {
  teamBox.classList.add("hidden");
  dashBox.classList.remove("hidden");
  teamName.innerText = "Your Team: " + team;
}

// LOGOUT
window.logout = () => {
  signOut(auth);
};
