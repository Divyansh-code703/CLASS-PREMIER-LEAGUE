
  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
    import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

    const firebaseConfig = {
      apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
      authDomain: "class-premier-league.firebaseapp.com",
      databaseURL: "https://class-premier-league-default-rtdb.firebaseio.com/",
      projectId: "class-premier-league",
      storageBucket: "class-premier-league.firebasestorage.app",
      messagingSenderId: "59210532535",
      appId: "1:59210532535:web:4558b69e94949b65cc6f32"
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    const loginScreen = document.getElementById("login-screen");
    const teamScreen = document.getElementById("team-screen");
    const dashboard = document.getElementById("dashboard");
    const bottomNav = document.getElementById("bottom-nav");
    const screens = document.querySelectorAll(".screen");

    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const loginMsg = document.getElementById("login-message");
    const selectedTeamName = document.getElementById("selected-team-name");
    const teamLogo = document.getElementById("team-logo");
    const thanksText = document.getElementById("thanks-text");

    let currentUserEmail = null;
    let currentUserName = null;

    function showScreen(id) {
      screens.forEach(s => s.classList.remove("active"));
      document.getElementById(id).classList.add("active");
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
      teamLogo.src = logoMap[team];
      selectedTeamName.textContent = `Team: ${team}`;
      thanksText.textContent = `Thanks for joining, ${name}!`;
    }

    signupBtn.addEventListener("click", async () => {
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim().replace(/\./g, "_");
      const password = document.getElementById("password").value.trim();

      if (!name || !email || !password) return (loginMsg.textContent = "Please fill all fields!");

      const userRef = ref(db, "users/" + email);
      const snapshot = await get(userRef);
      if (snapshot.exists()) return (loginMsg.textContent = "User already exists!");

      await set(userRef, { name, password, team: null });
      loginMsg.textContent = "Signup successful! Please Login.";
    });

    loginBtn.addEventListener("click", async () => {
      const email = document.getElementById("email").value.trim().replace(/\./g, "_");
      const password = document.getElementById("password").value.trim();

      const userRef = ref(db, "users/" + email);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) return (loginMsg.textContent = "User not found!");
      const user = snapshot.val();

      if (user.password !== password) return (loginMsg.textContent = "Wrong password!");

      currentUserEmail = email;
      currentUserName = user.name;

      if (!user.team) {
        loginScreen.classList.remove("active");
        teamScreen.classList.add("active");
      } else {
        showScreen("dashboard");
        showDashboard(user.team, user.name);
      }
    });

    document.querySelectorAll(".team").forEach((teamDiv) => {
      teamDiv.onclick = async () => {
        const selectedTeam = teamDiv.dataset.team;
        const confirmChoice = confirm(`You chose ${selectedTeam}. Confirm?`);
        if (confirmChoice) {
          await update(ref(db, "users/" + currentUserEmail), { team: selectedTeam });
          showScreen("dashboard");
          showDashboard(selectedTeam, currentUserName);
        }
      };
    });

    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.target;
        showScreen(target);
      });
    });
  </script>
</body>
</html>
