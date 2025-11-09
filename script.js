// script.js - Class Premier League (CPL) Game Logic

// Global Game State
const GAME_STATE = {
    user: null, // Current logged-in user object
    team: null, // Current user's team ID (e.g., 'RCB')
    teamData: {}, // All teams' data
    players: [], // All 70+ players data
    auctionLive: true,
    currentPlayerIndex: 0,
    auctionTimer: null,
    currentBid: 0,
    currentBidder: null,
};

// --- CONFIGURATION ---
const CPL_TEAMS = {
    'RCB': { name: 'Royal Challengers Bengaluru', logo: 'Rcb.svg.png', color: '#ffaa00' },
    'CSK': { name: 'Chennai Super Kings', logo: 'chennai-super-kings.jpg', color: '#ffd700' },
    'KKR': { name: 'Kolkata Knight Riders', logo: 'Kolkata_Knight_Riders_Logo.svg.png', color: '#552583' },
    'MI': { name: 'Mumbai Indians', logo: 'Mumbai_Indians_Logo.svg.png', color: '#004da8' },
    'LSG': { name: 'Lucknow Super Giants', logo: 'Lucknow_Super_Giants_IPL_Logo.svg.png', color: '#a2aaad' },
    'SRH': { name: 'Sunrisers Hyderabad', logo: 'Sunrisers_Hyderabad_Logo.png', color: '#fb8d4e' },
};
const AUCTION_BUDGET = 150; // 150 Crore
const PLAYER_ROLES = ['BAT', 'BOWL', 'AR', 'WK'];
const NAV_BUTTONS = [
    { id: 'btn-auction', label: 'Auction', icon: '🔨' },
    { id: 'btn-manage', label: 'Manage Squad', icon: '🧍' },
    { id: 'btn-schedule', label: 'Schedule', icon: '📅' },
    { id: 'btn-points', label: 'Points Table', icon: '🏆' },
    { id: 'btn-caps', label: 'Caps', icon: '🧢' },
    { id: 'btn-stats', label: 'Team Stats', icon: '📊' },
    { id: 'btn-rules', label: 'Rules', icon: '📜' },
];

// --- PLAYER DATA (70+ Famous Players - Just a sample, you can expand this) ---
// Base Price in Crores (Min 0.5 Cr)
const INITIAL_PLAYERS_DATA = [
    // Batsman
    { name: 'Virat K.', role: 'BAT', basePrice: 5.0, stats: { bat: 5, bowl: 1, all: 3, wk: 0 } },
    { name: 'Rohit S.', role: 'BAT', basePrice: 5.0, stats: { bat: 5, bowl: 0, all: 3, wk: 0 } },
    { name: 'Surya K.Y.', role: 'BAT', basePrice: 4.5, stats: { bat: 4, bowl: 0, all: 3, wk: 0 } },
    { name: 'Shubman G.', role: 'BAT', basePrice: 4.0, stats: { bat: 4, bowl: 0, all: 3, wk: 0 } },
    { name: 'Jos B.', role: 'BAT', basePrice: 3.5, stats: { bat: 4, bowl: 0, all: 3, wk: 0 } },
    // Wicket-Keepers (must have WK role)
    { name: 'MS D.', role: 'WK', basePrice: 4.5, stats: { bat: 4, bowl: 0, all: 3, wk: 5 } },
    { name: 'KL R.', role: 'WK', basePrice: 4.0, stats: { bat: 4, bowl: 0, all: 3, wk: 4 } },
    { name: 'Ishan K.', role: 'WK', basePrice: 3.0, stats: { bat: 3, bowl: 0, all: 3, wk: 4 } },
    // All-Rounders
    { name: 'Hardik P.', role: 'AR', basePrice: 5.5, stats: { bat: 4, bowl: 4, all: 5, wk: 0 } },
    { name: 'Ravindra J.', role: 'AR', basePrice: 5.0, stats: { bat: 3, bowl: 4, all: 5, wk: 0 } },
    { name: 'Glenn M.', role: 'AR', basePrice: 4.0, stats: { bat: 4, bowl: 3, all: 4, wk: 0 } },
    // Bowlers
    { name: 'Jasprit B.', role: 'BOWL', basePrice: 5.0, stats: { bat: 0, bowl: 5, all: 2, wk: 0 } },
    { name: 'Rashid K.', role: 'BOWL', basePrice: 4.5, stats: { bat: 2, bowl: 5, all: 4, wk: 0 } },
    { name: 'Mohammed S.', role: 'BOWL', basePrice: 4.0, stats: { bat: 0, bowl: 4, all: 2, wk: 0 } },
    { name: 'Yuzvendra C.', role: 'BOWL', basePrice: 3.5, stats: { bat: 0, bowl: 4, all: 2, wk: 0 } },
    // More players to reach 70+ (Expand this list)
    // ... (Add 55 more unique famous national/international players here) ...
    // Example Filler Players (Just for 70+ count)
    { name: 'A. Filler', role: 'BAT', basePrice: 0.5, stats: { bat: 2, bowl: 0, all: 1, wk: 0 } },
    { name: 'B. Filler', role: 'BOWL', basePrice: 0.5, stats: { bat: 0, bowl: 2, all: 1, wk: 0 } },
    // ... (53 more unique filler/real players) ...
];

// --- FIREBASE INITIALIZATION AND AUTHENTICATION ---

/**
 * Checks for user authentication state.
 * Loads the appropriate screen (Login/Signup or Main Game).
 */
function initializeApp() {
    const { firebaseOnAuthStateChanged, firebaseAuth } = window;
    
    // Check if Firebase is loaded
    if (!firebaseAuth) {
        document.getElementById('screen-container').innerHTML = '<p class="error-message">Error: Firebase not loaded. Check index.html imports.</p>';
        return;
    }

    firebaseOnAuthStateChanged(firebaseAuth, (user) => {
        if (user) {
            GAME_STATE.user = user;
            loadUserData(user.uid);
        } else {
            GAME_STATE.user = null;
            showLoginSignupScreen();
        }
    });
}

/**
 * Loads user-specific data (team ID) from Firebase Realtime DB.
 */
function loadUserData(uid) {
    const { firebaseDB, firebaseRef, firebaseOnValue } = window;
    const userRef = firebaseRef(firebaseDB, `users/${uid}`);

    // Listen for changes to user data
    firebaseOnValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.teamId) {
            GAME_STATE.team = userData.teamId;
            loadGameData(); // Proceed to load game data (teams, players)
        } else {
            // New user or team not selected yet
            showTeamSelectionScreen(uid);
        }
    }, {
        onlyOnce: false // Keep listening for changes
    });
}

/**
 * Loads common game data (All Teams, All Players) from Firebase.
 */
function loadGameData() {
    const { firebaseDB, firebaseRef, firebaseOnValue } = window;

    // Load All Teams' Data
    firebaseOnValue(firebaseRef(firebaseDB, 'teams'), (snapshot) => {
        GAME_STATE.teamData = snapshot.val() || {};
        // Re-render the current screen to update Purse Left, etc.
        renderScreen(GAME_STATE.currentScreen); 
    });

    // Load All Players' Data (or initialize if not present)
    firebaseGet(firebaseRef(firebaseDB, 'players')).then((snapshot) => {
        if (snapshot.exists()) {
            GAME_STATE.players = snapshot.val();
        } else {
            // First time load: Initialize players data on Firebase
            GAME_STATE.players = INITIAL_PLAYERS_DATA.map((p, index) => ({
                id: index,
                ...p,
                owner: null,
                isRetained: false,
                isCaptain: false,
                isWK: false,
                position: index + 1 // Default position
            }));
            window.firebaseSet(window.firebaseRef(window.firebaseDB, 'players'), GAME_STATE.players);
        }
        setupNavBar(); // Now that team is selected, show navigation
        renderScreen('auction'); // Default to Auction screen after setup
    });

    // Load Auction State
    firebaseOnValue(firebaseRef(firebaseDB, 'auction'), (snapshot) => {
        const auctionState = snapshot.val() || { live: true, currentPlayer: 0, currentBid: 0, currentBidder: null };
        GAME_STATE.auctionLive = auctionState.live;
        GAME_STATE.currentPlayerIndex = auctionState.currentPlayer;
        GAME_STATE.currentBid = auctionState.currentBid;
        GAME_STATE.currentBidder = auctionState.currentBidder;
        // If on auction screen, re-render
        if (GAME_STATE.currentScreen === 'auction') {
            renderScreen('auction');
        }
    });
}


// --- UI RENDERING & SCREEN MANAGEMENT ---

/**
 * Renders the navigation bar with fixed buttons at the bottom.
 */
function setupNavBar() {
    const navBar = document.getElementById('nav-bar');
    if (!navBar.innerHTML) { // Avoid re-rendering if already present
        NAV_BUTTONS.forEach(btn => {
            const button = document.createElement('button');
            button.className = 'nav-button';
            button.id = btn.id;
            button.innerHTML = `<span class="nav-button-icon">${btn.icon}</span>${btn.label}`;
            button.onclick = () => {
                // Remove active class from all
                document.querySelectorAll('.nav-button').forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                // Render the corresponding screen
                renderScreen(btn.label.toLowerCase().replace(/\s/g, ''));
            };
            navBar.appendChild(button);
        });
    }
}

/**
 * Renders the main content screen based on the screenId.
 * @param {string} screenId - ID of the screen to render.
 */
function renderScreen(screenId) {
    GAME_STATE.currentScreen = screenId;
    const container = document.getElementById('screen-container');
    container.innerHTML = ''; // Clear previous content

    // Ensure the correct button is highlighted
    document.querySelectorAll('.nav-button').forEach(b => b.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-${screenId}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    switch (screenId) {
        case 'auction':
            showAuctionScreen(container);
            break;
        case 'managesquad':
            showManageSquadScreen(container);
            break;
        case 'schedule':
            showScheduleScreen(container);
            break;
        case 'pointstable':
            showPointsTableScreen(container);
            break;
        case 'caps':
            showCapsScreen(container);
            break;
        case 'teamstats':
            showTeamStatsScreen(container);
            break;
        case 'rules':
            showRulesScreen(container);
            break;
        default:
            container.innerHTML = `<h2>Welcome to CPL!</h2><p>Please select an option from the navigation bar.</p>`;
    }
}

// --- CORE SCREENS IMPLEMENTATION ---

// 1. LOGIN / SIGNUP

function showLoginSignupScreen() {
    const container = document.getElementById('screen-container');
    container.innerHTML = `
        <div style="text-align: center; margin-top: 50px;">
            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/8/87/IPL_Logo.svg/1200px-IPL_Logo.svg.png" alt="IPL Logo" style="width: 150px; margin-bottom: 20px;">
            <h2>Class Premier League</h2>
            <div id="auth-error" class="error-message"></div>
            <form id="login-form" class="auth-form">
                <input type="email" id="auth-email" placeholder="Email" required>
                <input type="password" id="auth-password" placeholder="Password" required>
                <button type="submit" class="btn-primary" id="auth-btn">Log In</button>
                <button type="button" class="btn-primary" id="switch-auth">New User? Sign Up</button>
            </form>
        </div>
    `;

    const form = document.getElementById('login-form');
    const authBtn = document.getElementById('auth-btn');
    const switchBtn = document.getElementById('switch-auth');
    const errorDiv = document.getElementById('auth-error');
    let isLogin = true;

    switchBtn.onclick = () => {
        isLogin = !isLogin;
        authBtn.textContent = isLogin ? 'Log In' : 'Sign Up';
        switchBtn.textContent = isLogin ? 'New User? Sign Up' : 'Already have an account? Log In';
        errorDiv.textContent = '';
    };

    form.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const { firebaseSignIn, firebaseSignUp, firebaseAuth } = window;
        
        errorDiv.textContent = 'Loading...';

        const authPromise = isLogin 
            ? firebaseSignIn(firebaseAuth, email, password)
            : firebaseSignUp(firebaseAuth, email, password);

        authPromise.then((userCredential) => {
            // Success handled by onAuthStateChanged in initializeApp
        }).catch((error) => {
            errorDiv.textContent = `Error: ${error.message.replace('Firebase: ', '')}`;
        });
    };
}

// 2. TEAM SELECTION (for new users)

function showTeamSelectionScreen(uid) {
    const container = document.getElementById('screen-container');
    const availableTeams = Object.keys(CPL_TEAMS).filter(teamId => 
        !Object.values(GAME_STATE.teamData).some(team => team.ownerUid === uid)
    );
    
    // Check which teams are already taken
    const takenTeams = Object.values(GAME_STATE.teamData).map(t => t.teamId);

    let teamOptionsHTML = '';
    Object.keys(CPL_TEAMS).forEach(teamId => {
        const team = CPL_TEAMS[teamId];
        const isTaken = takenTeams.includes(teamId);
        teamOptionsHTML += `
            <div class="card" style="opacity: ${isTaken ? 0.5 : 1}; cursor: ${isTaken ? 'not-allowed' : 'pointer'}; background-color: ${isTaken ? '#333' : team.color};" onclick="${isTaken ? '' : `selectTeam('${uid}', '${teamId}')`}">
                <img src="${team.logo}" alt="${team.name} Logo" style="width: 50px; float: left; margin-right: 15px;">
                <h3>${team.name} (${teamId})</h3>
                <p>${isTaken ? 'TAKEN' : 'Click to Select'}</p>
            </div>
        `;
    });

    container.innerHTML = `
        <h2>Select Your CPL Team</h2>
        <p>Welcome, ${GAME_STATE.user.email}! Choose your team (only once):</p>
        <div id="team-selection-grid">
            ${teamOptionsHTML}
        </div>
    `;
}

/**
 * Assigns the selected team to the user and initializes the team data in DB.
 */
function selectTeam(uid, teamId) {
    const { firebaseDB, firebaseRef, firebaseSet, firebaseUpdate } = window;
    
    // 1. Update user data
    firebaseUpdate(firebaseRef(firebaseDB, `users/${uid}`), { teamId: teamId });

    // 2. Initialize team data (only if it doesn't exist)
    firebaseGet(firebaseRef(firebaseDB, `teams/${teamId}`)).then((snapshot) => {
        if (!snapshot.exists()) {
            const teamData = {
                teamId: teamId,
                ownerUid: uid,
                purseLeft: AUCTION_BUDGET,
                players: [],
                stats: { W: 0, L: 0, NR: 0, PTS: 0, NRR: 0, matchesPlayed: 0 },
            };
            firebaseSet(firebaseRef(firebaseDB, `teams/${teamId}`), teamData);
        }
    });

    // loadUserData will handle the rest via onValue listener
}

// 3. AUCTION SCREEN

function showAuctionScreen(container) {
    const myTeam = GAME_STATE.teamData[GAME_STATE.team];
    const totalPlayersBought = myTeam?.players.length || 0;
    const isAuctioneer = GAME_STATE.user.uid === 'HOST_UID_HERE'; // TODO: Set a host UID
    
    let auctionStatusHTML = '';

    if (!GAME_STATE.auctionLive) {
        auctionStatusHTML = `
            <div id="auction-status" class="auction-closed">
                AUCTION IS CLOSED<br>
                CHECK YOUR PLAYING 11
            </div>
        `;
        // Show Manage Squad button here as per requirement
        container.innerHTML = auctionStatusHTML;
        return;
    }

    const currentPlayer = GAME_STATE.players[GAME_STATE.currentPlayerIndex];
    
    if (!currentPlayer) {
        // All players sold or unsold
        auctionStatusHTML = `<div id="auction-status" class="auction-closed">ALL PLAYERS AUCTIONED!</div>`;
        container.innerHTML = auctionStatusHTML;
        // Optionally, close auction officially here
        window.firebaseUpdate(window.firebaseRef(window.firebaseDB, 'auction'), { live: false });
        return;
    }

    // --- Helper/Advice Feature ---
    const helperAdvice = generateAuctionAdvice(myTeam);

    // --- Current Bidder Info ---
    const currentBidderName = GAME_STATE.currentBidder ? CPL_TEAMS[GAME_STATE.currentBidder].name : 'No Bidder';

    auctionStatusHTML = `
        <div id="auction-status" class="auction-live">
            AUCTION LIVE! | Purse Left: ${myTeam.purseLeft.toFixed(2)} Cr
        </div>
        
        <h2>Current Player</h2>
        <div class="player-card-auction">
            <h3>${currentPlayer.name} (${currentPlayer.role})</h3>
            <p>Base Price: <strong>${currentPlayer.basePrice.toFixed(1)} Cr</strong></p>
            <div class="bid-info">
                Current Bid: <strong style="color: #4db8ff;">${GAME_STATE.currentBid.toFixed(1)} Cr</strong>
                <br>
                Bidding Team: <span style="color: ${GAME_STATE.currentBidder ? CPL_TEAMS[GAME_STATE.currentBidder].color : 'white'}; font-weight: bold;">${currentBidderName}</span>
            </div>
            <div class="timer" id="auction-timer-display">30</div>
            
            <div class="bid-options">
                ${GAME_STATE.team !== GAME_STATE.currentBidder ? 
                    `<button id="bid-button" class="btn-primary">BID (${(GAME_STATE.currentBid + 0.5).toFixed(1)} Cr)</button>` :
                    `<button disabled style="background-color: gray;">LEADING BID</button>`
                }
                <button id="next-player-button" class="btn-primary" ${!isAuctioneer ? 'disabled' : ''} style="background-color: #ff4d4d;">Next Player / Sold / Unsold</button>
            </div>
        </div>

        <div class="card" style="border-left: 5px solid ${myTeam.color};">
            <h3>Helper: Your Squad Status</h3>
            <p>${helperAdvice}</p>
            <p><strong>Players: ${totalPlayersBought}/11 | WK: ${myTeam.players.filter(p => p.role === 'WK').length}/1 | BOWL: ${myTeam.players.filter(p => p.role === 'BOWL' || p.role === 'AR').length}/4-8</strong></p>
        </div>
    `;
    
    container.innerHTML = auctionStatusHTML;
    
    // --- Auction Timer Logic ---
    clearInterval(GAME_STATE.auctionTimer);
    let timeLeft = 30; // Use 30 seconds for initial/reset time
    const timerDisplay = document.getElementById('auction-timer-display');
    
    function startTimer() {
        if (GAME_STATE.auctionTimer) clearInterval(GAME_STATE.auctionTimer);
        timeLeft = 30;
        timerDisplay.textContent = timeLeft;

        GAME_STATE.auctionTimer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(GAME_STATE.auctionTimer);
                handleAuctionEnd(currentPlayer, myTeam);
            }
        }, 1000);
    }

    startTimer(); // Start the timer when the screen loads

    // --- Auction Actions ---
    document.getElementById('bid-button').onclick = () => {
        handleBid(currentPlayer, myTeam);
    };

    document.getElementById('next-player-button').onclick = () => {
        // Only host can click this
        if (isAuctioneer) {
            clearInterval(GAME_STATE.auctionTimer);
            nextPlayer();
        }
    };
}

/**
 * Handles the bidding logic.
 */
function handleBid(player, teamData) {
    const { firebaseDB, firebaseRef, firebaseUpdate } = window;
    
    let newBid = GAME_STATE.currentBid === 0 ? player.basePrice : GAME_STATE.currentBid + 0.5;
    
    // Check purse and player limit
    if (newBid > teamData.purseLeft || teamData.players.length >= 11) {
        alert('Cannot bid: Insufficient funds or Squad is full (max 11 players)!');
        return;
    }
    
    // Update Firebase with new bid and reset timer
    firebaseUpdate(firebaseRef(firebaseDB, 'auction'), {
        currentBid: newBid,
        currentBidder: GAME_STATE.team
    });
    
    // Timer will reset on value change (startTimer is called inside showAuctionScreen which is re-rendered on update)
}

/**
 * Handles the end of the bidding period (timer runs out).
 */
function handleAuctionEnd(player, myTeam) {
    const { firebaseDB, firebaseRef, firebaseUpdate, firebaseGet } = window;
    
    if (GAME_STATE.currentBidder) {
        // Player is Sold!
        const winningBid = GAME_STATE.currentBid;
        const winningTeamId = GAME_STATE.currentBidder;
        const winningTeamRef = firebaseRef(firebaseDB, `teams/${winningTeamId}`);
        const playerRef = firebaseRef(firebaseDB, `players/${player.id}`);

        // 1. Update Winning Team's Data
        firebaseGet(winningTeamRef).then((snapshot) => {
            const team = snapshot.val();
            const newPlayers = [...(team.players || []), { ...player, cost: winningBid }];
            const newPurse = team.purseLeft - winningBid;

            firebaseUpdate(winningTeamRef, {
                purseLeft: newPurse,
                players: newPlayers
            });
        });

        // 2. Update Player Data (Mark as sold)
        firebaseUpdate(playerRef, { owner: winningTeamId, cost: winningBid });

        alert(`${player.name} SOLD to ${CPL_TEAMS[winningTeamId].name} for ${winningBid.toFixed(1)} Cr!`);
    } else {
        // Player is Unsold
        alert(`${player.name} UNSOLD!`);
    }

    // Move to next player and reset auction state
    nextPlayer();
}

/**
 * Moves the auction to the next player and resets the bidding.
 */
function nextPlayer() {
    const { firebaseDB, firebaseRef, firebaseUpdate } = window;
    // Increment player index and reset bid state
    firebaseUpdate(firebaseRef(firebaseDB, 'auction'), {
        currentPlayer: GAME_STATE.currentPlayerIndex + 1,
        currentBid: 0,
        currentBidder: null
    });
    // This update will trigger the onValue listener and re-render the screen.
}

/**
 * Generates helper advice for the team.
 */
function generateAuctionAdvice(myTeam) {
    const wkCount = myTeam.players.filter(p => p.role === 'WK').length;
    const bowlCount = myTeam.players.filter(p => p.role === 'BOWL' || p => p.role === 'AR').length;
    const batCount = myTeam.players.filter(p => p.role === 'BAT' || p => p.role === 'AR').length;
    const playersLeft = 11 - myTeam.players.length;

    if (playersLeft === 0) return 'Your squad is full! Great job.';
    if (myTeam.purseLeft < 5.0) return 'LOW BUDGET: Focus on minimum requirements (WK/Bowlers) with low base price players.';
    if (wkCount === 0) return 'CRITICAL: You need a Wicket-Keeper (WK)! Prioritize the current player if they are a WK.';
    if (bowlCount < 4 && playersLeft <= 3) return 'WARNING: You need at least 4 bowlers. Focus on Bowlers and All-Rounders now.';
    if (batCount < 5 && playersLeft <= 3) return 'WARNING: You need more specialist Batsmen for a strong lineup.';

    return 'Your squad balance looks decent. Target high-rated players in your weak areas or save money.';
}

// 4. MANAGE SQUAD SCREEN

function showManageSquadScreen(container) {
    const myTeam = GAME_STATE.teamData[GAME_STATE.team];
    const myPlayers = myTeam?.players || [];
    
    // Check player limits
    const wkCount = myPlayers.filter(p => p.isWK).length;
    const bowlCount = myPlayers.filter(p => p.role === 'BOWL' || (p.role === 'AR' && p.isWK === false)).length; // Simplified bowler count
    
    // Sort players by their set position
    myPlayers.sort((a, b) => a.position - b.position);

    const squadListHTML = myPlayers.map(p => `
        <li data-player-id="${p.id}" draggable="true">
            <span>${p.position}. <strong>${p.name}</strong> (${p.role}) - ${p.cost.toFixed(1)} Cr</span>
            <div class="player-options">
                <button onclick="toggleCaptain(${p.id})">${p.isCaptain ? '👑' : 'Set C'}</button>
                ${p.role === 'WK' ? `<button onclick="toggleWK(${p.id})">${p.isWK ? '🧤' : 'Set WK'}</button>` : ''}
            </div>
        </li>
    `).join('');

    container.innerHTML = `
        <h2>Manage Squad - ${CPL_TEAMS[GAME_STATE.team].name}</h2>
        <div class="card" style="background-color: #333; border-left: 5px solid ${CPL_TEAMS[GAME_STATE.team].color};">
            <h3>Squad Status</h3>
            <p>Players: <strong>${myPlayers.length}/11</strong> | Purse Left: <strong>${myTeam.purseLeft.toFixed(2)} Cr</strong></p>
            <p>WK: <strong>${wkCount}/1+</strong> | Bowlers: <strong>${bowlCount}/4-8</strong></p>
            <button class="btn-primary" style="background-color: #4db8ff;" onclick="showTradeWindow()">🔄 Trade Players (WIP)</button>
        </div>
        
        <h3>Playing 11 (Drag to re-order)</h3>
        <ul id="squad-list">
            ${squadListHTML}
        </ul>
        
        <h3>Retention (Coming Soon)</h3>
        <p>After the season ends, you will be able to retain 6 players.</p>
    `;
    
    // TODO: Implement Drag and Drop to change player position and update Firebase.
}

// 5. SCHEDULE SCREEN

function showScheduleScreen(container) {
    container.innerHTML = `<h2>IPL Schedule</h2><p>Coming Soon: Dynamic match scheduling and result updates.</p>`;
    // TODO: Implement Schedule logic (e.g., RCB vs LSG, Play button, See Match button for spectators)
}

// 6. POINTS TABLE SCREEN

function showPointsTableScreen(container) {
    // Dummy Data for demo
    const dummyStats = [
        { team: 'RCB', W: 8, L: 2, NRR: 0.95, PTS: 16 },
        { team: 'CSK', W: 7, L: 3, NRR: 0.50, PTS: 14 },
        { team: 'LSG', W: 6, L: 4, NRR: -0.10, PTS: 12 },
        { team: 'MI', W: 5, L: 5, NRR: 0.20, PTS: 10 },
        { team: 'SRH', W: 4, L: 6, NRR: -0.80, PTS: 8 },
        { team: 'KKR', W: 2, L: 8, NRR: -1.05, PTS: 4 },
    ];
    
    // Sort by Points, then NRR
    dummyStats.sort((a, b) => {
        if (b.PTS !== a.PTS) return b.PTS - a.PTS;
        return b.NRR - a.NRR;
    });

    const tableRows = dummyStats.map((stat, index) => `
        <tr style="background-color: ${index < 4 ? '#38761d' : '#21262d'};">
            <td>${index + 1}</td>
            <td style="color: ${CPL_TEAMS[stat.team].color}; font-weight: bold;">${stat.team}</td>
            <td>${stat.W}</td>
            <td>${stat.L}</td>
            <td>${stat.NRR.toFixed(2)}</td>
            <td><strong>${stat.PTS}</strong></td>
        </tr>
    `).join('');

    container.innerHTML = `
        <h2>Points Table</h2>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Team</th>
                    <th>W</th>
                    <th>L</th>
                    <th>NRR</th>
                    <th>PTS</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
        
        <h3>Playoff Structure</h3>
        <p><strong>Qualifier 1:</strong> Top 1 vs Top 2 (Winner to Final)</p>
        <p><strong>Eliminator:</strong> Top 3 vs Top 4 (Winner plays Loser of Q1)</p>
        <p><strong>Qualifier 2:</strong> Loser Q1 vs Winner Eliminator (Winner to Final)</p>
    `;

    // Add basic table CSS
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
        table { width: 100%; border-collapse: collapse; text-align: center; }
        th, td { padding: 10px; border: 1px solid #333; }
        th { background-color: #ffaa00; color: #0d1117; }
    `;
    container.appendChild(styleTag);
}

// 7. CAPS SCREEN

function showCapsScreen(container) {
    // Dummy Data for demo
    const orangeCap = [
        { name: 'Virat K.', team: 'RCB', runs: 650 },
        { name: 'Shubman G.', team: 'SRH', runs: 580 },
        { name: 'Jos B.', team: 'LSG', runs: 550 },
        // ... (Top 5 players)
    ];
    const purpleCap = [
        { name: 'Jasprit B.', team: 'MI', wickets: 25 },
        { name: 'Rashid K.', team: 'CSK', wickets: 22 },
        { name: 'Yuzvendra C.', team: 'KKR', wickets: 19 },
        // ... (Top 5 players)
    ];
    
    const renderCapList = (capArray, capClass, unit) => capArray.map(p => `
        <div class="cap-stat-item">
            <span><strong style="color: ${CPL_TEAMS[p.team].color};">${p.name}</strong> (${p.team})</span>
            <span class="${capClass}"><strong>${p[unit]}</strong> ${unit.toUpperCase()}</span>
        </div>
    `).join('');

    container.innerHTML = `
        <h2>Orange Cap (Most Runs)</h2>
        <div class="card">${renderCapList(orangeCap, 'orange-cap', 'runs')}</div>
        
        <h2>Purple Cap (Most Wickets)</h2>
        <div class="card">${renderCapList(purpleCap, 'purple-cap', 'wickets')}</div>
    `;
}

// 8. TEAM STATS SCREEN

function showTeamStatsScreen(container) {
    container.innerHTML = `
        <h2>Team Stats</h2>
        <div class="card">
            <h3>Previous Champions</h3>
            <p><strong>CPL 2024 Winner:</strong> Sunrisers Hyderabad (SRH)</p>
            <p><strong>Most Titles:</strong> Mumbai Indians (MI) - 3 times</p>
        </div>
        <p>Coming Soon: Detailed performance stats for all teams and auto-generated team ratings.</p>
    `;
}

// 9. RULES SCREEN

function showRulesScreen(container) {
    container.innerHTML = `
        <h2>CPL Rules</h2>
        <div class="card">
            <h3>Auction Rules</h3>
            <ul>
                <li>Budget: <strong>${AUCTION_BUDGET} Cr</strong>.</li>
                <li>Squad Size: <strong>11 Players</strong>.</li>
                <li>Minimum: <strong>1 WK, 4 Bowlers</strong>.</li>
                <li>Maximum: <strong>8 Bowlers</strong>.</li>
                <li>Bidding Timer: <strong>30 seconds</strong>. Bid resets timer.</li>
            </ul>
        </div>
        <div class="card">
            <h3>Match Rules (5 Overs)</h3>
            <ul>
                <li><strong>Toss:</strong> Random winner.</li>
                <li><strong>Strategy Select:</strong> Bowler assigns outcome (Wicket, 6, 4, 3, 2, 1, Wide) to 7 virtual Parchis (30s time limit).</li>
                <li><strong>Delivery:</strong> Batsman selects one of the 7 Parchis (15s time limit).</li>
                <li><strong>Timeout Penalty:</strong> Bowler fails to assign (30s) = 5 Runs + Extra Ball. Batsman fails to select (15s) = Dot Ball.</li>
                <li><strong>DRS:</strong> Available only to Batting Team on a Wicket (2 reviews/match).</li>
            </ul>
        </div>
        <div class="card">
            <h3>General Rules</h3>
            <ul>
                <li><strong>Retention:</strong> Max 6 players can be retained for the next season.</li>
                <li><strong>Trade:</strong> Player trading is allowed between teams via the Manage Squad screen.</li>
            </ul>
        </div>
    `;
}


// --- START APPLICATION ---
window.onload = initializeApp;
