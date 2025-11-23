// script.js — compatible with Firebase v8 (non-module)
// Make sure index.html includes:
// <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
// <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>

const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  databaseURL: "https://class-premier-league-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "class-premier-league",
  storageBucket: "class-premier-league.appspot.com",
  messagingSenderId: "59210532535",
  appId: "1:59210532535:web:4558b69e94949b65cc6f32"
};

// Init Firebase (v8)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// UI elements
const loginScreen = document.getElementById("login-screen");
const teamScreen = document.getElementById("team-screen");
const dashboard = document.getElementById("dashboard");
const bottomNav = document.getElementById("bottom-nav");
const loginMsg = document.getElementById("login-message");
const teamLogo = document.getElementById("team-logo");
const selectedTeamName = document.getElementById("selected-team-name");
const thanksText = document.getElementById("thanks-text");

let currentUserEmail = null; // plain email
let currentUserName = null;

function emailKey(email) {
  return email.replace(/\./g, "_");
}

// HELPERS
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
  bottomNav.classList.remove("hidden");
}

function showDashboard(team, name) {
  const logoMap = {
    RCB: "250px-Royal_Challengers_Bengaluru_Logo.svg.png",
    CSK: "chennai-super-kings3461.jpg",
    KKR: "778px-Kolkata_Knight_Riders_Logo.svg.png",
    MI: "1200px-Mumbai_Indians_Logo.svg (1).png",
    LSG: "1200px-Lucknow_Super_Giants_IPL_Logo.svg (1).png",
    SRH: "627d11598a632ca996477eb0.png",
    GT: "627d09228a632ca996477e87 (1).png",
    PBKS: "Punjab_Kings_Logo.svg.png"
  };

  teamLogo.src = logoMap[team] || "";
  selectedTeamName.textContent = "Team: " + (team || "—");
  thanksText.textContent = "Thanks for joining, " + (name || "Player") + "!";
  showScreen("dashboard");
}

// NAV BUTTONS (switch screens)
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.target;
    if (!id) return;
    // If dashboard requested and we have user, refresh dashboard details
    if (id === "dashboard" && currentUserEmail) {
      const key = emailKey(currentUserEmail);
      db.ref("users/" + key).once("value").then(snap => {
        const data = snap.val() || {};
        showDashboard(data.team, data.name || currentUserName);
      }).catch(() => {
        showScreen("dashboard");
      });
    } else {
      showScreen(id);
    }
  });
});

// SIGNUP
document.getElementById("signupBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  loginMsg.style.color = "white";
  if (!name || !email || !password) {
    loginMsg.textContent = "Enter all fields!";
    return;
  }

  const key = emailKey(email);
  const userRef = db.ref("users/" + key);

  try {
    const snap = await userRef.once("value");
    if (snap.exists()) {
      loginMsg.textContent = "User already exists! Please login.";
      return;
    }
    // Save user
    await userRef.set({ name, email, password, team: null });
    loginMsg.style.color = "lightgreen";
    loginMsg.textContent = "Signup successful! Now Login.";
    // keep the name field for convenience
    currentUserEmail = null;
    currentUserName = name;
  } catch (err) {
    console.error(err);
    loginMsg.textContent = "Signup failed. Try again.";
  }
});

// LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
  const nameInput = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  loginMsg.style.color = "white";
  if (!email || !password) {
    loginMsg.textContent = "Enter email & password!";
    return;
  }

  const key = emailKey(email);
  const userRef = db.ref("users/" + key);

  try {
    const snap = await userRef.once("value");
    if (!snap.exists()) {
      loginMsg.textContent = "User not found! Please Sign Up.";
      return;
    }
    const data = snap.val();
    if (data.password !== password) {
      loginMsg.textContent = "Wrong password!";
      return;
    }

    // Success
    loginMsg.style.color = "lightgreen";
    loginMsg.textContent = "Login successful!";

    currentUserEmail = email;
    currentUserName = data.name || nameInput || "";

    // If user has no team, go to team screen
    if (!data.team) {
      showTeamScreen();
    } else {
      showDashboard(data.team, data.name || currentUserName);
    }

  } catch (err) {
    console.error(err);
    loginMsg.textContent = "Login error. Try again.";
  }
});

// Show team selection and attach handlers
function showTeamScreen() {
  showScreen("team-screen");

  // attach once (remove previous handlers to avoid duplicates)
  document.querySelectorAll(".team").forEach(teamDiv => {
    // remove previously attached onclick by cloning node
    const newNode = teamDiv.cloneNode(true);
    teamDiv.parentNode.replaceChild(newNode, teamDiv);
  });

  document.querySelectorAll(".team").forEach(t => {
    t.addEventListener("click", async () => {
      if (!currentUserEmail) {
        alert("Please login first.");
        return;
      }
      const selectedTeam = t.dataset.team;
      if (!selectedTeam) return;

      // Check if chosenTeams/selectedTeam exists
      try {
        const takenSnap = await db.ref("chosenTeams/" + selectedTeam).once("value");
        if (takenSnap.exists()) {
          alert("This team is already taken!");
          return;
        }

        const confirmChoice = confirm(`You chose ${selectedTeam}. Confirm?`);
        if (!confirmChoice) return;

        const key = emailKey(currentUserEmail);

        // update user's team and set chosenTeams
        const updates = {};
        updates["users/" + key + "/team"] = selectedTeam;
        updates["chosenTeams/" + selectedTeam] = currentUserEmail;

        await db.ref().update(updates);

        // show dashboard
        showDashboard(selectedTeam, currentUserName);
      } catch (err) {
        console.error(err);
        alert("Could not select team. Try again.");
      }
    });
  });
}

// If you reload page and user data in local session exists, you can restore
// (optional: simple session using localStorage)
if (localStorage.getItem("cpl_current_user")) {
  const stored = JSON.parse(localStorage.getItem("cpl_current_user"));
  if (stored && stored.email) {
    currentUserEmail = stored.email;
    currentUserName = stored.name || null;
    // fetch fresh user data from firebase
    db.ref("users/" + emailKey(currentUserEmail)).once("value").then(snap => {
      const data = snap.val() || {};
      if (data.team) showDashboard(data.team, data.name || currentUserName);
    }).catch(()=>{});
  }
}

// Save current user session whenever login succeeds
function saveSession() {
  if (currentUserEmail) {
    localStorage.setItem("cpl_current_user", JSON.stringify({ email: currentUserEmail, name: currentUserName }));
  }
}

// Hook into successful login path to save session
// (we call saveSession after login success or team select)
const origLoginBtn = document.getElementById("loginBtn");
origLoginBtn.addEventListener("click", () => {
  setTimeout(saveSession, 900); // after async login completes
});

// Also save after team selection (safe)
document.addEventListener("click", () => {
  setTimeout(saveSession, 500);
});
