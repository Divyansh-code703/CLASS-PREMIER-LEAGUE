import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  databaseURL: "https://class-premier-league-default-rtdb.firebaseio.com",
  projectId: "class-premier-league",
  storageBucket: "class-premier-league.firebasestorage.app",
  messagingSenderId: "59210532535",
  appId: "1:59210532535:web:4558b69e94949b65cc6f32"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const authBox = document.getElementById("authBox");
const teamBox = document.getElementById("teamBox");
const dashboard = document.getElementById("dashboard");
const msg = document.getElementById("msg");
const teamMsg = document.getElementById("teamMsg");

window.signup = () =>{
  createUserWithEmailAndPassword(auth,email.value,password.value)
  .catch(e=>msg.innerText=e.message);
}

window.login = () =>{
  signInWithEmailAndPassword(auth,email.value,password.value)
  .catch(()=>msg.innerText="Account not found / wrong password");
}

onAuthStateChanged(auth,(user)=>{
  if(!user) return;
  get(ref(db,"users/"+user.uid)).then(snap=>{
    authBox.classList.add("hidden");
    snap.exists() ? dashboard.classList.remove("hidden") : teamBox.classList.remove("hidden");
  });
});

window.selectTeam = (team)=>{
  const uid = auth.currentUser.uid;
  get(ref(db,"teams/"+team)).then(snap=>{
    if(snap.exists()){
      teamMsg.innerText="❌ Team already taken";
    }else{
      set(ref(db,"teams/"+team),uid);
      set(ref(db,"users/"+uid),{team});
      teamBox.classList.add("hidden");
      dashboard.classList.remove("hidden");
    }
  });
  }
