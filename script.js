// -------------------- PHASE 1: LOGIN + TEAM SELECTION (FIXED) --------------------
// script.js (module)
// Updated: Improved login/signup notifications, stronger error handling, debug logs

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

/* ========== Firebase config (your project) ========== */
const firebaseConfig = {
  apiKey: "AIzaSyCdpxNsLzKNeZ9MhQqU_T_oLdg-hCoXzSk",
  authDomain: "class-premier-league.firebaseapp.com",
  projectId: "class-premier-league",
  storageBucket: "class-premier-league.firebasestorage.app",
  messagingSenderId: "59210532535",
  appId: "1:59210532535:web:4558b69e94949b65cc6f32"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ========== DOM ========== */
const authSection = document.getElementById("auth");
const teamSelectSection = document.getElementById("team-select");
const dashboardSection = document.getElementById("dashboard");

const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const signoutBtn = document.getElementById("signoutBtn");

const teamsGrid = document.getElementById("teamsGrid");
const chooseTeamBtn = document.getElementById("chooseTeamBtn");

const userEmailSpan = document.getElementById("userEmail");
const yourTeamSpan = document.getElementById("yourTeam");
const yourPurseSpan = document.getElementById("yourPurse");
const goAuctionBtn = document.getElementById("goAuction");

/* ========== Static Teams (codes + logos) ========== */
const TEAMS = [
  { code: "RCB", name: "Royal Challengers Bengaluru", logo: "https://upload.wikimedia.org/wikipedia/en/0/0b/Royal_Challengers_Bengaluru_Logo.svg" },
  { code: "CSK", name: "Chennai Super Kings", logo: "https://upload.wikimedia.org/wikipedia/en/9/9d/Chennai_Super_Kings_Logo.svg" },
  { code: "MI",  name: "Mumbai Indians", logo: "https://upload.wikimedia.org/wikipedia/en/3/3d/Mumbai_Indians_Logo.svg" },
  { code: "LSG", name: "Lucknow Super Giants", logo: "https://upload.wikimedia.org/wikipedia/en/8/8b/Lucknow_Super_Giants_Logo.svg" },
  { code: "PBKS",name: "Punjab Kings", logo: "https://upload.wikimedia.org/wikipedia/en/1/1b/Punjab_Kings_Logo.svg" },
  { code: "SRH", name: "Sunrisers Hyderabad", logo: "https://upload.wikimedia.org/wikipedia/en/1/19/Sunrisers_Hyderabad_Logo.svg" }
];

/* purse stored in lakhs (so 150 Cr = 15000 lakhs) */
const START_PURSE_LAKHS = 15000;

/* ========== Helpers ========== */
function showSection(sec){
  // hide all
  if(authSection) authSection.classList.add("hidden");
  if(teamSelectSection) teamSelectSection.classList.add("hidden");
  if(dashboardSection) dashboardSection.classList.add("hidden");
  if(sec) sec.classList.remove("hidden");
}

function lakhToStr(l){
  if(l === undefined || l === null) return "₹0.00 L";
  if(l >= 100) return "₹" + (l/100).toFixed(2) + " Cr";
  return "₹" + l.toFixed(2) + " L";
}

/* ========== Render Teams Grid (for selection) ========== */
let selectedTeamCode = null;
async function renderTeamsGrid(){
  if(!teamsGrid) return;
  teamsGrid.innerHTML = "";
  // fetch taken teams from Firestore (users collection)
  const taken = new Set();
  try{
    const usersCol = collection(db, "users");
    const snap = await getDocs(usersCol);
    snap.forEach(d=> {
      const u = d.data();
      if(u.team) taken.add(u.team);
    });
  }catch(e){
    console.warn("Could not fetch users for taken teams", e);
  }

  TEAMS.forEach(t=>{
    const div = document.createElement("div");
    div.className = "team-card";
    if(t.code === selectedTeamCode) div.classList.add("selected");

    // disabled if already taken by other user
    const isTaken = taken.has(t.code);

    div.innerHTML = `
      <img src="${t.logo}" alt="${t.code}">
      <div class="meta">
        <div class="name">${t.name}</div>
        <div class="code">${t.code} ${isTaken? " — (Taken)": ""}</div>
      </div>
    `;
    if(isTaken) div.style.opacity = "0.55";

    div.addEventListener("click", ()=>{
      if(isTaken){
        alert("Sorry — this team is already taken by another user.");
        return;
      }
      // toggle selection
      document.querySelectorAll(".team-card").forEach(c=>c.classList.remove("selected"));
      div.classList.add("selected");
      selectedTeamCode = t.code;
      if(chooseTeamBtn) chooseTeamBtn.disabled = false;
    });

    teamsGrid.appendChild(div);
  });
}

/* ========== Auth actions ========== */
// Defensive checks for DOM
if(signupBtn){
  signupBtn.addEventListener("click", async ()=>{
    const email = (emailInput && emailInput.value || "").trim();
    const pass = (passInput && passInput.value) || "";
    if(!email || pass.length < 6) return alert("Enter valid email and password (min 6 chars)");
    try{
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      console.log("Signup success:", cred.user.uid);
      // create initial user doc with purse but no team
      const uid = cred.user.uid;
      await setDoc(doc(db, "users", uid), {
        uid,
        email: cred.user.email,
        team: null,
        purse: START_PURSE_LAKHS,
        players: []
      });
      // friendly UI notification
      alert("✅ Sign up successful — now choose your team.");
      // show team selection
      await renderTeamsGrid();
      showSection(teamSelectSection);
    }catch(err){
      console.error("signup error:", err);
      // show friendly message
      alert("❌ Sign up failed: " + (err.message || err));
    }
  });
} else {
  console.warn("signupBtn not found in DOM");
}

if(loginBtn){
  loginBtn.addEventListener("click", async ()=>{
    const email = (emailInput && emailInput.value || "").trim();
    const pass = (passInput && passInput.value) || "";
    if(!email || pass.length < 6) return alert("Enter valid email and password (min 6 chars)");
    try{
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      console.log("Login success:", cred.user.uid);
      alert("🎉 Login successful!");
      // After login, onAuthStateChanged will run and load dashboard.
      // But to be immediate, call loadDashboardForUser now as well:
      await loadDashboardForUser(cred.user.uid);
    }catch(err){
      console.error("login error:", err);
      alert("❌ Login failed: " + (err.message || err));
    }
  });
} else {
  console.warn("loginBtn not found in DOM");
}

if(signoutBtn){
  signoutBtn.addEventListener("click", async ()=>{
    try{
      await signOut(auth);
      selectedTeamCode = null;
      if(emailInput) emailInput.value = "";
      if(passInput) passInput.value = "";
      alert("Signed out");
      showSection(authSection);
    }catch(e){
      console.error("Signout error", e);
      alert("Sign out failed: " + (e.message || e));
    }
  });
}

/* ========== Choose Team action (reserve team for user) ========== */
if(chooseTeamBtn){
  chooseTeamBtn.addEventListener("click", async ()=>{
    if(!selectedTeamCode) return alert("Select a team first");
    const user = auth.currentUser;
    if(!user) return alert("Login first");
    const uid = user.uid;
    const userRef = doc(db, "users", uid);
    // ensure team still available at time of click (atomic-ish check)
    try{
      // check any other user has this team
      const usersCol = collection(db, "users");
      const q = query(usersCol, where("team", "==", selectedTeamCode));
      const qSnap = await getDocs(q);
      if(!qSnap.empty){
        alert("Oops — someone grabbed this team just now. Refreshing list.");
        await renderTeamsGrid();
        return;
      }
      // update user's doc with team and keep purse as is
      await updateDoc(userRef, { team: selectedTeamCode });
      alert("✅ Team selected: " + selectedTeamCode);
      await loadDashboardForUser(uid);
    }catch(e){
      console.error("chooseTeam error", e);
      alert("Team selection failed: " + (e.message || e));
    }
  });
} else {
  console.warn("chooseTeamBtn not found in DOM");
}

/* ========== Load dashboard for user (show team info) ========== */
async function loadDashboardForUser(uid){
  try{
    if(!uid) {
      console.warn("loadDashboardForUser called with no uid");
      return;
    }
    const uDoc = await getDoc(doc(db, "users", uid));
    if(!uDoc.exists()){
      console.warn("User doc missing for", uid);
      return;
    }
    const u = uDoc.data();
    if(userEmailSpan) userEmailSpan.innerText = u.email || (auth.currentUser && auth.currentUser.email) || "You";
    if(yourTeamSpan) yourTeamSpan.innerText = u.team || "No team yet";
    if(yourPurseSpan) yourPurseSpan.innerText = lakhToStr(u.purse || START_PURSE_LAKHS);
    // if user has team => show dashboard; else show team selection
    if(u.team){
      showSection(dashboardSection);
    } else {
      await renderTeamsGrid();
      showSection(teamSelectSection);
    }
  }catch(e){
    console.error("loadDashboard error", e);
    alert("Could not load dashboard: " + (e.message || e));
  }
}

/* ========== onAuthStateChanged: show UI accordingly ========== */
onAuthStateChanged(auth, async (user)=>{
  try{
    if(user){
      console.log("Auth state changed: user signed in:", user.uid);
      // ensure user doc exists (if they logged in earlier)
      const uid = user.uid;
      const uRef = doc(db, "users", uid);
      const snap = await getDoc(uRef);
      if(!snap.exists()){
        // create user doc (fresh sign-in via provider maybe)
        await setDoc(uRef, {
          uid,
          email: user.email || "",
          team: null,
          purse: START_PURSE_LAKHS,
          players: []
        });
      }
      await loadDashboardForUser(uid);
    } else {
      console.log("Auth state: no user signed in");
      showSection(authSection);
    }
  }catch(e){
    console.error("onAuthStateChanged handler error", e);
  }
});

/* ========== initial render for teams grid (in case sign-up leads there) ========== */
(async ()=>{
  try{ await renderTeamsGrid(); }catch(e){ console.warn("initial renderTeamsGrid failed", e); }
})();
