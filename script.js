alert("Script connected!");
// ---------------------------------------------
// Firebase Config (v8)
// ---------------------------------------------
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
let db = firebase.database();

let currentUserEmail = null;

// UI
let loginScreen = document.getElementById("login-screen");
let teamScreen = document.getElementById("team-screen");
let dashboard = document.getElementById("dashboard");
let bottomNav = document.getElementById("bottom-nav");

let loginMsg = document.getElementById("login-message");
let teamLogo = document.getElementById("team-logo");
let selectedTeamName = document.getElementById("selected-team-name");
let thanksText = document.getElementById("thanks-text");

// ---------------------------------------------------------
// SIGNUP
// ---------------------------------------------------------
document.getElementById("signupBtn").addEventListener("click", function () {
  let name = document.getElementById("name").value.trim();
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    loginMsg.innerText = "Fill all fields!";
    return;
  }

  let cleanEmail = email.replace(/\./g, "_");

  db.ref("users/" + cleanEmail).once("value", function (snap) {
    if (snap.exists()) {
      loginMsg.innerText = "User already exists!";
      return;
    }

    db.ref("users/" + cleanEmail).set({
      name: name,
      email: email,
      password: password,
      team: null
    });

    loginMsg.innerText = "Signup Successful! Now Login.";
  });
});

// ---------------------------------------------------------
// LOGIN
// ---------------------------------------------------------
document.getElementById("loginBtn").addEventListener("click", function () {
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value.trim();

  if (!email || !password) {
    loginMsg.innerText = "Enter all fields!";
    return;
  }

  let cleanEmail = email.replace(/\./g, "_");

  db.ref("users/" + cleanEmail).once("value", function (snap) {
    if (!snap.exists()) {
      loginMsg.innerText = "User not found!";
      return;
    }

    let data = snap.val();

    if (data.password !== password) {
      loginMsg.innerText = "Wrong password!";
      return;
    }

    loginMsg.innerText = "Login Successful!";
    currentUserEmail = email;

    if (!data.team) {
      showTeamScreen();
    } else {
      showDashboard(data.team, data.name);
    }
  });
});

// ---------------------------------------------------------
// TEAM SELECTION
// ---------------------------------------------------------
function showTeamScreen() {
  loginScreen.classList.remove("active");
  teamScreen.classList.add("active");

  document.querySelectorAll(".team").forEach(teamDiv => {
    teamDiv.onclick = function () {
      let team = teamDiv.dataset.team;
      let cleanEmail = currentUserEmail.replace(/\./g, "_");

      // Check if team taken
      db.ref("chosenTeams/" + team).once("value", function (snap) {
        if (snap.exists()) {
          alert("This team is already taken!");
          return;
        }

        // Save user team
        db.ref("users/" + cleanEmail).update({ team: team });

        // Mark team taken
        db.ref("chosenTeams/" + team).set(currentUserEmail);

        showDashboard(team, document.getElementById("name").value);
      });
    };
  });
}

// ---------------------------------------------------------
// DASHBOARD
// ---------------------------------------------------------
function showDashboard(team, name) {
  let logos = {
    RCB: "250px-Royal_Challengers_Bengaluru_Logo.svg.png",
    CSK: "chennai-super-kings3461.jpg",
    KKR: "778px-Kolkata_Knight_Riders_Logo.svg.png",
    MI: "1200px-Mumbai_Indians_Logo.svg (1).png",
    LSG: "1200px-Lucknow_Super_Giants_IPL_Logo.svg (1).png",
    SRH: "627d11598a632ca996477eb0.png",
    GT: "627d09228a632ca996477e87 (1).png",
    PBKS: "Punjab_Kings_Logo.svg.png"
  };

  teamLogo.src = logos[team];
  selectedTeamName.innerText = "Team: " + team;
  thanksText.innerText = "Thanks for joining, " + name + "!";

  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  dashboard.classList.add("active");
  bottomNav.classList.remove("hidden");
}

// ---------------------------------------------------------
// NAVIGATION
// ---------------------------------------------------------
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.onclick = () => {
    let id = btn.dataset.target;
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
  };
});
