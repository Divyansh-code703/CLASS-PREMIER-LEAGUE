// -------------------- PHASE 1: LOGIN + TEAM SELECTION --------------------
// script.js (module)
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
  authSection.classList.add("hidden");
  teamSelectSection.classList.add("hidden");
  dashboardSection.classList.add("hidden");
  sec.classList.remove("hidden");
}

function lakhToStr(l){
  if(l >= 100) return "₹" + (l/100).toFixed(2) + " Cr";
  return "₹" + l.toFixed(2) + " L";
}

/* ========== Render Teams Grid (for selection) ========== */
let selectedTeamCode = null;
async function renderTeamsGrid(){
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
      chooseTeamBtn.disabled = false;
    });

    teamsGrid.appendChild(div);
  });
}

/* ========== Auth actions ========== */
signupBtn.addEventListener("click", async ()=>{
  const email = emailInput.value.trim();
  const pass = passInput.value;
  if(!email || pass.length < 6) return alert("Enter valid email and password (min 6 chars)");
  try{
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    // create initial user doc with purse but no team
    const uid = cred.user.uid;
    await setDoc(doc(db, "users", uid), {
      uid,
      email: cred.user.email,
      team: null,
      purse: START_PURSE_LAKHS,
      players: []
    });
    alert("Sign up successful — now choose your team.");
    // show team selection
    await renderTeamsGrid();
    showSection(teamSelectSection);
  }catch(err){
    console.error(err);
    alert(err.message);
  }
});

loginBtn.addEventListener("click", async ()=>{
  const email = emailInput.value.trim();
  const pass = passInput.value;
  if(!email || pass.length < 6) return alert("Enter valid email and password (min 6 chars)");
  try{
    await signInWithEmailAndPassword(auth, email, pass);
    // after onAuthStateChanged handler will load dashboard
  }catch(err){
    console.error(err);
    alert(err.message);
  }
});

signoutBtn?.addEventListener("click", async ()=>{
  await signOut(auth);
  selectedTeamCode = null;
  emailInput.value = "";
  passInput.value = "";
  showSection(authSection);
});

/* ========== Choose Team action (reserve team for user) ========== */
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
      return alert("Oops — someone grabbed this team just now. Refreshing list.");
    }
    // update user's doc with team and keep purse as is
    await updateDoc(userRef, { team: selectedTeamCode });
    alert("Team selected: " + selectedTeamCode);
    loadDashboardForUser(uid);
  }catch(e){
    console.error("chooseTeam error", e);
    alert("Team selection failed: " + e.message);
  }
});

/* ========== Load dashboard for user (show team info) ========== */
async function loadDashboardForUser(uid){
  try{
    const uDoc = await getDoc(doc(db, "users", uid));
    if(!uDoc.exists()){
      console.warn("User doc missing");
      return;
    }
    const u = uDoc.data();
    userEmailSpan.innerText = u.email || (auth.currentUser && auth.currentUser.email) || "You";
    yourTeamSpan.innerText = u.team || "No team yet";
    yourPurseSpan.innerText = lakhToStr(u.purse || START_PURSE_LAKHS);
    // if user has team => show dashboard; else show team selection
    if(u.team){
      showSection(dashboardSection);
    } else {
      await renderTeamsGrid();
      showSection(teamSelectSection);
    }
  }catch(e){
    console.error("loadDashboard error", e);
    alert("Could not load dashboard");
  }
}

/* ========== onAuthStateChanged: show UI accordingly ========== */
onAuthStateChanged(auth, async (user)=>{
  if(user){
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
    // not signed in
    showSection(authSection);
  }
});

/* ========== initial render for teams grid (in case sign-up leads there) ========== */
(async ()=>{
  // pre-render teams grid so it's snappy after sign-up
  try{ await renderTeamsGrid(); }catch(e){ console.warn(e); }
})(); 
// ---- Sign Up ----
document.getElementById("signup-btn").addEventListener("click", async () => {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("✅ Signup successful! You can now log in.");
  } catch (error) {
    alert("❌ Signup failed: " + error.message);
  }
});

// ---- Login ----
document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("🎉 Login successful!");
    // yahan tu chahe to redirect kar sakta hai
    // window.location.href = "auction.html";
  } catch (error) {
    alert("❌ Login failed: " + error.message);
  }
});
