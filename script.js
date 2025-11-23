
// Firebase v8 CDN VERSION (NO MODULES)
var firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  databaseURL: "https://class-premier-league-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "class-premier-league",
  storageBucket: "class-premier-league.appspot.com",
  messagingSenderId: "59210532535",
  appId: "1:59210532535:web:4558b69e94949b65cc6f32"
};

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

let currentUserEmail = null;

// LOGIN
document.getElementById("loginBtn").onclick = () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    loginMsg.textContent = "Enter all fields!";
    return;
  }

  db.ref("users/" + email.replace(/\./g, "_")).once("value", snap => {
    if (!snap.exists()) {
      loginMsg.textContent = "User not found!";
      return;
    }

    const data = snap.val();

    if (data.password !== password) {
      loginMsg.textContent = "Wrong password!";
      return;
    }

    loginMsg.textContent = "Login Successful!";
    currentUserEmail = email;

    if (!data.team) {
      showTeamScreen();
    } else {
      showDashboard(data.team, data.name);
    }
  });
};

// SIGN UP
document.getElementById("signupBtn").onclick = () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    loginMsg.textContent = "Fill all fields!";
    return;
  }

  const clean = email.replace(/\./g, "_");

  db.ref("users/" + clean).once("value", snap => {
    if (snap.exists()) {
      loginMsg.textContent = "User already exists!";
      return;
    }

    db.ref("users/" + clean).set({ name, email, password, team: null });

    loginMsg.textContent = "Signup Successful! Please login.";
  });
};

// TEAM SELECTION
function showTeamScreen() {
  loginScreen.classList.remove("active");
  teamScreen.classList.add("active");

  document.querySelectorAll(".team").forEach(t => {
    t.onclick = () => {
      const selectedTeam = t.dataset.team;
      const cleanEmail = currentUserEmail.replace(/\./g, "_");

      db.ref("chosenTeams/" + selectedTeam).once("value", taken => {
        if (taken.exists()) {
          alert("This team is already taken!");
          return;
        }

        db.ref("users/" + cleanEmail).update({ team: selectedTeam });
        db.ref("chosenTeams/" + selectedTeam).set(currentUserEmail);

        showDashboard(selectedTeam, document.getElementById("name").value);
      });
    };
  });
}

// DASHBOARD
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

  teamLogo.src = logoMap[team];
  selectedTeamName.textContent = "Team: " + team;
  thanksText.textContent = "Thanks for joining, " + name + "!";

  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  dashboard.classList.add("active");
  bottomNav.classList.remove("hidden");
}

// NAV BUTTONS
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.onclick = () => {
    const id = btn.dataset.target;
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
  };
});
