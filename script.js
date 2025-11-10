const loginScreen = document.getElementById("login-screen");
const teamScreen = document.getElementById("team-screen");
const mainScreen = document.getElementById("main-screen");
const dashboardScreen = document.getElementById("dashboard-screen");

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loginMsg = document.getElementById("login-message");
const selectedTeamName = document.getElementById("selected-team-name");
const goDashboardBtn = document.getElementById("goDashboardBtn");
const backMainBtn = document.getElementById("backMainBtn");

// ✅ Temporary local storage
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
    showMainScreen(user.team);
  }
}

// TEAM SELECTION
function setupTeamSelection(email) {
  document.querySelectorAll(".team").forEach((teamDiv) => {
    teamDiv.onclick = () => {
      const selectedTeam = teamDiv.dataset.team;
      if (Object.values(chosenTeams).includes(selectedTeam)) {
        alert("This team is already taken!");
        return;
      }
      const confirmChoice = confirm(`You chose ${selectedTeam}. Confirm?`);
      if (confirmChoice) {
        users[email].team = selectedTeam;
        chosenTeams[email] = selectedTeam;
        saveData();
        showMainScreen(selectedTeam);
      }
    };
  });
}

// MAIN SCREEN
function showMainScreen(team) {
  teamScreen.classList.remove("active");
  loginScreen.classList.remove("active");
  dashboardScreen.classList.remove("active");
  mainScreen.classList.add("active");
  selectedTeamName.textContent = team;
}

// DASHBOARD NAVIGATION
goDashboardBtn.addEventListener("click", () => {
  mainScreen.classList.remove("active");
  dashboardScreen.classList.add("active");
});

backMainBtn.addEventListener("click", () => {
  dashboardScreen.classList.remove("active");
  mainScreen.classList.add("active");
});
