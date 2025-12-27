// 🔥 FIREBASE SETUP
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  databaseURL: "https://class-premier-league-default-rtdb.firebaseio.com",
  projectId: "class-premier-league",
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

// AUTH FUNCTIONS
window.signup = () =>{
  const email = email.value;
  const pass = password.value;

  if(!email || !pass){
    authMsg.innerText = "Fill all fields";
    return;
  }

  createUserWithEmailAndPassword(auth,email,pass)
  .catch(err=>{
    if(err.code==="auth/email-already-in-use"){
      authMsg.innerText="Account exists, login";
    }else{
      authMsg.innerText="Signup error";
    }
  });
};

window.login = () =>{
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  signInWithEmailAndPassword(auth,email,pass)
  .catch(err=>{
    if(err.code==="auth/user-not-found"){
      authMsg.innerText="Signup first";
    }else if(err.code==="auth/wrong-password"){
      authMsg.innerText="Wrong password";
    }else{
      authMsg.innerText="Login error";
    }
  });
};

// SESSION CHECK
onAuthStateChanged(auth,user=>{
  if(user){
    authBox.classList.add("hidden");
    checkTeam(user.uid);
  }else{
    authBox.classList.remove("hidden");
  }
});

// TEAM LOGIC
function checkTeam(uid){
  get(ref(db,"users/"+uid)).then(snap=>{
    if(snap.exists()){
      showDashboard(snap.val().team);
    }else{
      teamBox.classList.remove("hidden");
    }
  });
}

window.selectTeam = (team)=>{
  const uid = auth.currentUser.uid;
  const teamRef = ref(db,"teams/"+team);

  get(teamRef).then(snap=>{
    if(snap.exists()){
      teamMsg.innerText="Team already taken";
    }else{
      set(teamRef,{takenBy:uid});
      set(ref(db,"users/"+uid),{team});
      showDashboard(team);
    }
  });
};

function showDashboard(team){
  teamBox.classList.add("hidden");
  dashBox.classList.remove("hidden");
  teamName.innerText="Your Team: "+team;
}

window.logout = ()=>{
  signOut(auth);
  location.reload();
};
