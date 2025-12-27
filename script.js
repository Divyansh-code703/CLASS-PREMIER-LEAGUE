import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getDatabase, ref, onValue, update } 
from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  databaseURL: "https://class-premier-league-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "class-premier-league",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// AUTH
window.signup = () => {
  createUserWithEmailAndPassword(auth, email.value, password.value);
};

window.login = () => {
  signInWithEmailAndPassword(auth, email.value, password.value);
};

// LOGIN STATE
onAuthStateChanged(auth, user => {
  if (user) {
    authDiv.style.display = "none";
    dashboard.style.display = "block";
    loadTeams(user.uid);
  }
});

function loadTeams(uid) {
  const teamsRef = ref(db, "teams");

  onValue(teamsRef, snap => {
    teams.innerHTML = "";
    const data = snap.val();

    for (let team in data) {
      const div = document.createElement("div");
      div.className = "team";
      div.innerText = team;

      if (data[team].taken) {
        div.classList.add("taken");
      } else {
        div.onclick = () => selectTeam(team, uid);
      }

      teams.appendChild(div);
    }
  });
}

function selectTeam(team, uid) {
  update(ref(db, "teams/" + team), {
    taken: true,
    owner: uid
  });
                   }
