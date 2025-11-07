// -------------------- script.js (REPLACE your file with this) --------------------
// Full Auction + Firebase sync for CPL
// KEEP your index.html as-is (it already imports script.js type="module" defer)

// ----- FIREBASE IMPORTS & INIT -----
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

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

// ----- ASSETS / SOUNDS -----
const BID_STEP_PAISA = 2500000; // 25 Lakh = 2.5e6 paise? We'll treat units as rupees *100 (but UI uses crores/lakhs) — keep consistent in UI as rupee numbers in lakhs/crores text.
const TIMER_SECONDS = 30;

const SOUND_BID = new Audio("https://assets.mixkit.co/sfx/download/mixkit-software-ui-click-2574.wav");
const SOUND_SOLD = new Audio("https://assets.mixkit.co/sfx/download/mixkit-crowd-cheering-687.wav");
const SOUND_UNSOLD = new Audio("https://assets.mixkit.co/sfx/download/mixkit-sad-trombone-2340.wav");

// ----- TEAM + PLAYER DATA (seed if DB empty) -----
const TEAM_LIST = [
  { code: "RCB", name: "Royal Challengers Bengaluru", logo: "https://upload.wikimedia.org/wikipedia/en/0/0b/Royal_Challengers_Bengaluru_Logo.svg" },
  { code: "CSK", name: "Chennai Super Kings", logo: "https://upload.wikimedia.org/wikipedia/en/9/9d/Chennai_Super_Kings_Logo.svg" },
  { code: "LSG", name: "Lucknow Super Giants", logo: "https://upload.wikimedia.org/wikipedia/en/8/8b/Lucknow_Super_Giants_Logo.svg" },
  { code: "MI",  name: "Mumbai Indians", logo: "https://upload.wikimedia.org/wikipedia/en/3/3d/Mumbai_Indians_Logo.svg" },
  { code: "PBKS",name: "Punjab Kings", logo: "https://upload.wikimedia.org/wikipedia/en/1/1b/Punjab_Kings_Logo.svg" },
  { code: "SRH", name: "Sunrisers Hyderabad", logo: "https://upload.wikimedia.org/wikipedia/en/1/19/Sunrisers_Hyderabad_Logo.svg" }
];

// A practical pool of famous players (role, basePrice in lakhs)
const RAW_PLAYERS = [
  ["Virat Kohli","Batsman", 200],
  ["Rohit Sharma","Batsman", 180],
  ["KL Rahul","Wicketkeeper", 150],
  ["Jos Buttler","Wicketkeeper", 160],
  ["MS Dhoni","Wicketkeeper", 150],
  ["Rishabh Pant","Wicketkeeper", 140],
  ["Faf du Plessis","Batsman", 130],
  ["David Warner","Batsman", 120],
  ["Suryakumar Yadav","Batsman", 160],
  ["Shubman Gill","Batsman", 140],
  ["Ruturaj Gaikwad","Batsman", 120],
  ["Devdutt Padikkal","Batsman", 110],
  ["AB de Villiers","Batsman", 200],
  ["Glenn Maxwell","Allrounder", 150],
  ["Andre Russell","Allrounder", 160],
  ["Hardik Pandya","Allrounder", 140],
  ["Marcus Stoinis","Allrounder", 120],
  ["Ben Stokes","Allrounder", 170],
  ["Ravindra Jadeja","Allrounder", 150],
  ["Shakib Al Hasan","Allrounder", 120],
  ["Kieron Pollard","Allrounder", 110],
  ["Mitchell Starc","Bowler", 180],
  ["Jasprit Bumrah","Bowler", 170],
  ["Mohammed Siraj","Bowler", 120],
  ["Trent Boult","Bowler", 150],
  ["Anrich Nortje","Bowler", 130],
  ["Pat Cummins","Bowler", 170],
  ["Kagiso Rabada","Bowler", 160],
  ["Rashid Khan","Bowler", 150],
  ["Yuzvendra Chahal","Bowler", 120],
  ["Kuldeep Yadav","Bowler", 120],
  ["Bhuvneshwar Kumar","Bowler", 120],
  ["Harshal Patel","Bowler", 110],
  ["Umran Malik","Bowler", 100],
  ["T Natarajan","Bowler", 100],
  ["Shardul Thakur","Bowler", 110],
  ["Mohammed Shami","Bowler", 140],
  ["Jason Holder","Allrounder", 100],
  ["Sunil Narine","Allrounder", 130],
  ["Nicholas Pooran","Wicketkeeper", 120],
  ["Quinton de Kock","Wicketkeeper", 130],
  ["Ishan Kishan","Wicketkeeper", 120],
  ["Sanju Samson","Wicketkeeper", 110],
  ["Tilak Varma","Batsman", 100],
  ["Yashasvi Jaiswal","Batsman", 120],
  ["Shikhar Dhawan","Batsman", 110],
  ["Mayank Agarwal","Batsman", 110],
  ["Nitish Rana","Allrounder", 100],
  ["Krunal Pandya","Allrounder", 100],
  ["Ravichandran Ashwin","Bowler", 140],
  ["Irfan Pathan","Allrounder", 80],
  ["Gautam Gambhir","Batsman", 80],
  ["Sachin Tendulkar","Batsman", 200],
  ["Chris Gayle","Batsman", 160],
  ["Dale Steyn","Bowler", 120],
  ["Jason Roy","Batsman", 110],
  ["Kane Williamson","Batsman", 150],
  ["Joe Root","Batsman", 140],
  ["PlayerX1","Allrounder",90],
  ["PlayerX2","Bowler",85],
  ["PlayerX3","Batsman",80],
  ["PlayerX4","Wicketkeeper",75],
  ["PlayerX5","Bowler",70],
  ["PlayerX6","Allrounder",70],
  ["PlayerX7","Batsman",60],
  ["PlayerX8","Bowler",60],
  // add a few more so total >=70
  ["LocalPlayer1","Batsman",55],
  ["LocalPlayer2","Bowler",50],
  ["LocalPlayer3","Allrounder",50],
  ["LocalPlayer4","Wicketkeeper",45],
  ["LocalPlayer5","Batsman",40],
  ["LocalPlayer6","Bowler",40],
  ["LocalPlayer7","Batsman",35],
  ["LocalPlayer8","Bowler",35]
];

// convert to objects and give ids
const PLAYERS = RAW_PLAYERS.map((p,i)=>({
  id: "p"+(1000+i),
  name: p[0],
  role: p[1],
  base: p[2], // in lakhs
  owner: null,
  soldPrice: 0
}));

// ----- HELPERS: money formatting (lakhs -> display)
function lakhToStr(lakh){
  if(lakh >= 100) return "₹" + (lakh/100).toFixed(2) + " Cr";
  return "₹" + lakh.toFixed(2) + " L";
}

// ----- UI roots
const contentDiv = document.getElementById("content");

// simple status log area element (create once)
let statusEl = document.getElementById("auctionStatus");
if(!statusEl){
  statusEl = document.createElement("div");
  statusEl.id = "auctionStatus";
  statusEl.style.margin = "10px auto";
  statusEl.style.maxWidth = "800px";
  contentDiv.parentNode.insertBefore(statusEl, contentDiv);
}

// ----- Auction state (local mirror)
let auctionState = {
  players: [],       // loaded from Firestore or seeded
  teams: {},         // teams data loaded
  currentIndex: 0,   // which player in list
  currentBid: 0,     // current bid amount (in lakhs)
  currentBest: null, // team code who bid
  timer: null,
  timerExpiresAt: 0,
  running: false
};

// ----- Seed DB if empty
async function seedIfEmpty(){
  // check teams collection
  const teamsCol = collection(db, "teams");
  const tSnap = await getDocs(teamsCol);
  if(tSnap.empty){
    // create team docs
    for(const t of TEAM_LIST){
      await setDoc(doc(db, "teams", t.code), {
        code: t.code,
        name: t.name,
        logo: t.logo,
        purse: 15000, // store in lakhs (15000 L = 150 Cr)
        players: []
      });
    }
    console.log("Seeded teams");
  } else {
    console.log("Teams exist in DB");
  }

  // check players collection
  const playersCol = collection(db, "players");
  const pSnap = await getDocs(playersCol);
  if(pSnap.empty){
    for(const p of PLAYERS){
      await setDoc(doc(db, "players", p.id), {
        id: p.id,
        name: p.name,
        role: p.role,
        base: p.base, // in lakhs
        owner: null,
        soldPrice: 0
      });
    }
    console.log("Seeded players");
  } else {
    console.log("Players exist in DB");
  }

  // auction state doc
  const auctionDocRef = doc(db, "meta", "auctionState");
  const auctionSnap = await getDoc(auctionDocRef);
  if(!auctionSnap.exists()){
    await setDoc(auctionDocRef, {
      currentIndex: 0,
      currentBid: 0,
      currentBest: null,
      running: false
    });
    console.log("Created auctionState doc");
  }
}

// ----- Load current DB state into local auctionState
async function loadStateFromDB(){
  // load players into ordered array (order by base descending helps)
  const pSnap = await getDocs(collection(db, "players"));
  const players = [];
  pSnap.forEach(d=> players.push(d.data()));
  // sort by base descending (or keep DB order)
  players.sort((a,b)=> b.base - a.base);
  auctionState.players = players;

  // load teams
  const tSnap = await getDocs(collection(db, "teams"));
  tSnap.forEach(d=>{
    auctionState.teams[d.id] = d.data();
  });

  // load auction meta
  const metaDoc = doc(db, "meta", "auctionState");
  const metaSnap = await getDoc(metaDoc);
  if(metaSnap.exists()){
    const meta = metaSnap.data();
    auctionState.currentIndex = meta.currentIndex || 0;
    auctionState.currentBid = meta.currentBid || 0;
    auctionState.currentBest = meta.currentBest || null;
    auctionState.running = meta.running || false;
  } else {
    auctionState.currentIndex = 0;
    auctionState.currentBid = 0;
    auctionState.currentBest = null;
    auctionState.running = false;
  }
}

// ----- Render Auction UI
function renderAuctionUI(){
  // current player
  const cur = auctionState.players[auctionState.currentIndex];
  const playerHtml = cur ? `
    <div style="display:flex;gap:20px;align-items:center;justify-content:center;flex-wrap:wrap">
      <div style="width:320px;padding:12px;border-radius:12px;background:#fff;color:#000;text-align:left">
        <h3>${cur.name}</h3>
        <div>Role: ${cur.role}</div>
        <div>Base: ${lakhToStr(cur.base)}</div>
        <div style="margin-top:8px">Current Bid: <strong id="curBid">${auctionState.currentBid? lakhToStr(auctionState.currentBid): "—"}</strong></div>
        <div>Highest: <strong id="curBest">${auctionState.currentBest || "—"}</strong></div>
        <div style="margin-top:8px">Timer: <span id="curTimer">${auctionState.timerExpiresAt? formatTimer(Math.max(0, Math.floor((auctionState.timerExpiresAt - Date.now())/1000))): TIMER_SECONDS}</span>s</div>
      </div>
    </div>
  ` : `<div><h3>No more players</h3></div>`;

  // teams cards
  let teamsHtml = `<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:16px">`;
  for(const code of Object.keys(auctionState.teams)){
    const t = auctionState.teams[code];
    teamsHtml += `
      <div style="width:220px;background:#04254c;padding:12px;border-radius:10px;color:#fff">
        <div style="display:flex;align-items:center;gap:8px">
          <img src="${t.logo}" alt="${t.code}" style="width:36px;height:36px;border-radius:6px"/>
          <strong>${t.code}</strong>
        </div>
        <div style="margin-top:8px">Purse Left: <span id="purse-${t.code}">${lakhToStr(t.purse)}</span></div>
        <div style="margin-top:8px">
          <button onclick="placeBid('${t.code}')" style="padding:8px 10px;border-radius:8px;background:#ff8c00;border:none;color:#000;font-weight:700">BID +${lakhToStr( (BID_STEP_PAISA/100000) )}</button>
        </div>
        <div style="margin-top:8px;font-size:12px;color:#ddd">Players: ${t.players?.length || 0}</div>
      </div>
    `;
  }
  teamsHtml += `</div>`;

  contentDiv.innerHTML = `
    <h2>🏏 Auction Room</h2>
    <p>Timer resets to ${TIMER_SECONDS}s on each bid. Top bidder wins when timer ends. Auto next player.</p>
    ${playerHtml}
    <div style="margin-top:12px;text-align:center">${teamsHtml}</div>
  `;

  // attach timer updater
  startUITimerLoop();
}

// helper to format timer display
function formatTimer(s){
  if(s<0) s=0;
  const mm = Math.floor(s/60);
  const ss = s%60;
  return (mm>0? mm+":" : "") + (ss<10? "0"+ss:ss);
}

// ----- Timer loop to update UI and finalize when expired
let uiInterval = null;
function startUITimerLoop(){
  if(uiInterval) clearInterval(uiInterval);
  uiInterval = setInterval(()=>{
    const tEl = document.getElementById("curTimer");
    if(!tEl) return;
    const remaining = Math.max(0, Math.floor((auctionState.timerExpiresAt - Date.now())/1000));
    tEl.innerText = remaining;
    if(remaining <= 0){
      clearInterval(uiInterval);
      finalizeCurrentPlayer();
    }
  }, 300);
}

// ----- placeBid (called from UI)
window.placeBid = async function(teamCode){
  const cur = auctionState.players[auctionState.currentIndex];
  if(!cur) { alert("No player"); return; }

  // check purse
  const team = auctionState.teams[teamCode];
  const nextBid = Math.max( cur.base, auctionState.currentBid ) + (BID_STEP_PAISA/100000); // since base in lakhs, BID_STEP_PAISA/100000 => 25? we simplify: use 25 L = 25
  // Real calculation: our base & purses are in lakhs already; BID_STEP set as 25 (lakhs)
  const BID_STEP_LAKH = 25;
  const newBid = Math.max(cur.base, auctionState.currentBid) + BID_STEP_LAKH;

  if(team.purse < newBid){
    alert(`${teamCode} doesn't have enough purse!`);
    return;
  }

  // update local and DB auction meta
  auctionState.currentBid = newBid;
  auctionState.currentBest = teamCode;
  auctionState.timerExpiresAt = Date.now() + TIMER_SECONDS*1000;

  // play bid sound
  try{ SOUND_BID.currentTime = 0; SOUND_BID.play(); }catch(e){}

  // write auction meta to Firestore
  await setDoc(doc(db, "meta", "auctionState"), {
    currentIndex: auctionState.currentIndex,
    currentBid: auctionState.currentBid,
    currentBest: auctionState.currentBest,
    timerExpiresAt: auctionState.timerExpiresAt,
    running: true
  });

  renderAuctionUI();
}

// ----- finalize current player (when timer expired)
async function finalizeCurrentPlayer(){
  const cur = auctionState.players[auctionState.currentIndex];
  if(!cur) { statusEl.innerText = "Auction complete"; return; }

  // if no bids -> unsold; else sold
  if(!auctionState.currentBest){
    // mark unsold
    statusEl.innerText = `${cur.name} is UNSOLD`;
    try{ SOUND_UNSOLD.play(); }catch(e){}
    // update player doc
    await updateDoc(doc(db, "players", cur.id), { owner: null, soldPrice: 0 });
  } else {
    // sold to currentBest at currentBid
    const buyer = auctionState.currentBest;
    const finalPrice = auctionState.currentBid; // in lakhs
    statusEl.innerText = `${cur.name} SOLD to ${buyer} for ${lakhToStr(finalPrice)}`;
    try{ SOUND_SOLD.play(); }catch(e){}
    // update player doc
    await updateDoc(doc(db, "players", cur.id), { owner: buyer, soldPrice: finalPrice });

    // deduct purse from team and push player id
    const teamRef = doc(db, "teams", buyer);
    const teamSnap = await getDoc(teamRef);
    if(teamSnap.exists()){
      const teamData = teamSnap.data();
      const newPurse = Math.max(0, (teamData.purse || 0) - finalPrice);
      const newPlayers = (teamData.players || []);
      newPlayers.push(cur.id);
      await updateDoc(teamRef, { purse: newPurse, players: newPlayers });
    }
  }

  // increment index, reset meta
  auctionState.currentIndex++;
  auctionState.currentBid = 0;
  auctionState.currentBest = null;
  auctionState.timerExpiresAt = 0;
  await setDoc(doc(db, "meta", "auctionState"), {
    currentIndex: auctionState.currentIndex,
    currentBid: 0,
    currentBest: null,
    timerExpiresAt: 0,
    running: false
  });

  // refresh local state from DB
  await loadStateFromDB();
  // small pause then auto render next
  setTimeout(()=>{
    renderAuctionUI();
  }, 2000);
}

// ----- Real-time listener for teams & auction meta so multiple users sync
function startRealtimeListeners(){
  // teams listener
  onSnapshot(collection(db, "teams"), snap => {
    snap.forEach(d=>{
      auctionState.teams[d.id] = d.data();
    });
    // update purse text if auction UI present
    for(const code of Object.keys(auctionState.teams)){
      const el = document.getElementById(`purse-${code}`);
      if(el) el.innerText = lakhToStr(auctionState.teams[code].purse);
    }
  });

  // auction meta listener
  onSnapshot(doc(db, "meta", "auctionState"), async (snap)=>{
    if(!snap.exists()) return;
    const meta = snap.data();
    auctionState.currentIndex = meta.currentIndex || auctionState.currentIndex;
    auctionState.currentBid = meta.currentBid || 0;
    auctionState.currentBest = meta.currentBest || null;
    auctionState.timerExpiresAt = meta.timerExpiresAt || 0;
    auctionState.running = meta.running || false;
    // if players not loaded yet, load
    if(auctionState.players.length === 0) await loadStateFromDB();
    renderAuctionUI();
    // if running and timer set, start UI timer
    if(auctionState.timerExpiresAt && auctionState.timerExpiresAt > Date.now()) startUITimerLoop();
    // if timer expired and meta.running still true, finalize (safety)
    if(auctionState.timerExpiresAt && auctionState.timerExpiresAt <= Date.now() && auctionState.running) {
      finalizeCurrentPlayer();
    }
  });
}

// ----- Start Auction mode (seed DB if needed, load state, start listeners & UI)
export async function openAuctionRoom(){
  statusEl.innerText = "Preparing auction...";
  await seedIfEmpty();
  await loadStateFromDB();
  renderAuctionUI();
  startRealtimeListeners();
  statusEl.innerText = "Auction ready. Place bids!";
}

// expose to global for button to call
window.openAuctionRoom = openAuctionRoom;

// If the page already loaded and user presses Auction button, call openAuctionRoom
// (index.html attaches auction-btn click which we used earlier in other script — ensure it calls window.openAuctionRoom())
document.addEventListener("DOMContentLoaded", ()=>{
  const auctionBtn = document.getElementById("auction-btn");
  if(auctionBtn){
    auctionBtn.addEventListener("click", async ()=>{
      await openAuctionRoom();
    });
  }
});
