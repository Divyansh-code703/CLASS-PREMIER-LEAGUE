const loginScreen = document.getElementById("login-screen");
const teamScreen = document.getElementById("team-screen");
const dashboardScreen = document.getElementById("dashboard-screen");
const selectedTeamName = document.getElementById("selected-team-name");
const dashboardContent = document.getElementById("dashboard-content");

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loginMsg = document.getElementById("login-message");

const navButtons = document.querySelectorAll(".nav-btn");

let users = JSON.parse(localStorage.getItem("users")) || {};
let chosenTeams = JSON.parse(localStorage.getItem("chosenTeams")) || {};

function saveData() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("chosenTeams", JSON.stringify(chosenTeams));
}

// LOGIN
loginBtn.addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) return (loginMsg.textContent = "Enter all fields!");

  if (users[email]) {
    if (users[email].password === password) {
      loginMsg.textContent = "Login successful!";
      setTimeout(() => handleLogin(email), 800);
    } else {
      loginMsg.textContent = "Wrong password!";
    }
  } else {
    loginMsg.textContent = "User not found. Please Sign Up.";
  }
});

// SIGNUP
signupBtn.addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) return (loginMsg.textContent = "Enter all fields!");
  if (users[email]) return (loginMsg.textContent = "User already exists!");

  users[email] = { password, team: null };
  saveData();
  loginMsg.textContent = "Signup successful! Please Login.";
});

// AFTER LOGIN
function handleLogin(email) {
  const user = users[email];
  if (!user.team) {
    loginScreen.classList.remove("active");
    teamScreen.classList.add("active");
    setupTeamSelection(email);
  } else {
    showDashboard(user.team);
  }
}

// TEAM SELECTION
function setupTeamSelection(email) {
  document.querySelectorAll(".team").forEach((teamDiv) => {
    teamDiv.onclick = () => {
      const selectedTeam = teamDiv.dataset.team;

      if (Object.values(chosenTeams).includes(selectedTeam)) {
        alert("This team is already taken by another player!");
        return;
      }

      const confirmChoice = confirm(`You chose ${selectedTeam}. Are you sure?`);
      if (confirmChoice) {
        users[email].team = selectedTeam;
        chosenTeams[email] = selectedTeam;
        saveData();
        showDashboard(selectedTeam);
      }
    };
  });
}

// DASHBOARD
function showDashboard(team) {
  loginScreen.classList.remove("active");
  teamScreen.classList.remove("active");
  dashboardScreen.classList.add("active");
  selectedTeamName.textContent = team;
}

// Bottom Navigation Button Handling
navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    navButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const screen = btn.dataset.screen;
    switch (screen) {
      case "home":
        dashboardContent.innerHTML = "<h3>🏠 Auction Room</h3><p>Start exciting team auctions here!</p>";
        break;
      case "squad":
        dashboardContent.innerHTML = "<h3>👤 Manage Squad</h3><p>View and update your squad lineup.</p>";
        break;
      case "caps":
        dashboardContent.innerHTML = "<h3>🧢 Caps</h3><p>Top performers wear the Orange & Purple caps!</p>";
        break;
      case "schedule":
        dashboardContent.innerHTML = "<h3>📅 Schedule</h3><p>Check upcoming matches and fixtures.</p>";
        break;
      case "points":
        dashboardContent.innerHTML = "<h3>📈 Points Table</h3><p>Track your team’s progress in the leaderboard.</p>";
        break;
      case "stats":
        dashboardContent.innerHTML = "<h3>📊 Team Stats</h3><p>View batting and bowling statistics.</p>";
        break;
      case "rules":
        dashboardContent.innerHTML = "<h3>📘 Rules</h3><p>Read all official CPL rules and fair play policies.</p>";
        break;
    }
  });
});
