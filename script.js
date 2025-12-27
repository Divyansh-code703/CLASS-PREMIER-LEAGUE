import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  projectId: "class-premier-league",
  storageBucket: "class-premier-league.firebasestorage.app",
  messagingSenderId: "59210532535",
  appId: "1:59210532535:web:4558b69e94949b65cc6f32"
};

initializeApp(firebaseConfig);
const auth = getAuth();

/* ELEMENTS */
const authBox = document.getElementById("authBox");
const teamSelect = document.getElementById("teamSelect");
const dashboard = document.getElementById("dashboard");
const authMsg = document.getElementById("authMsg");

const email = document.getElementById("email");
const password = document.getElementById("password");

document.getElementById("loginBtn").onclick = () => {
  if (!email.value || !password.value) {
    authMsg.innerText = "Fill email & password";
    return;
  }

  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(() => {
      authBox.classList.add("hidden");
      teamSelect.classList.remove("hidden");
    })
    .catch(() => {
      authMsg.innerText = "Account not found";
    });
};

document.getElementById("signupBtn").onclick = () => {
  if (!email.value || !password.value) {
    authMsg.innerText = "Fill email & password";
    return;
  }

  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(() => {
      authBox.classList.add("hidden");
      teamSelect.classList.remove("hidden");
    })
    .catch(() => {
      authMsg.innerText = "Account already exists";
    });
};

/* TEAM SELECT */
const teamsDiv = document.getElementById("teams");
const teamImgs = [
  "chennai-super-kings3461.jpg",
  "1200px-Mumbai_Indians_Logo.svg (1).png",
  "250px-Royal_Challengers_Bengaluru_Logo.svg.png",
  "778px-Kolkata_Knight_Riders_Logo.svg.pn",
  "627d11598a632ca996477eb0.png",
  "Punjab_Kings_Logo.svg.png",
  "627d09228a632ca996477e87 (1).png",
  "1200px-Lucknow_Super_Giants_IPL_Logo.svg (1).png"
];

teamImgs.forEach(imgName => {
  const img = document.createElement("img");
  img.src = imgName;
  img.onclick = () => {
    teamSelect.classList.add("hidden");
    dashboard.classList.remove("hidden");
    document.getElementById("myTeam").innerText = "Team Selected";
  };
  teamsDiv.appendChild(img);
});
