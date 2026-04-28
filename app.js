let audioContext;
let device;

// --- 1. RNBO & Web Audio API Setup ---
async function setupRNBO() {
    // Standardize the AudioContext across browsers
    const WAContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new WAContext();

    try {
        // Fetch the JSON file that describes the Max patch and points to the Wasm
        const response = await fetch("export/patch.export.json");
        const patcher = await response.json();

        // Create the RNBO device using the context and the fetched patcher
        device = await RNBO.createDevice({ context: audioContext, patcher });

        // Connect the RNBO device's audio output to the browser's speakers
        device.node.connect(audioContext.destination);
        console.log("RNBO Wasm Module loaded and patched successfully.");
        
    } catch (err) {
        console.error("Failed to load the RNBO export. Check your file paths.", err);
    }
}

// --- 2. UI Event Listeners ---
document.getElementById('start-audio').addEventListener('click', async (e) => {
    // If the context hasn't been created yet, build the RNBO device
    if (!audioContext) {
        await setupRNBO();
    }
    
    // Web Audio requires resuming the context after a user interaction
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }

    // Visual feedback that the engine is hot
    e.target.innerText = "AUDIO ENGINE RUNNING";
    e.target.style.background = "#00ff00";
    e.target.style.color = "#121212";
});

// --- 3. Tracker Grid Generation ---
// Add global constants for our grid size so our D-pad knows the boundaries
const MAX_ROWS = 64;
const MAX_TRACKS = 4;

function generateTrackerGrid() {
    const grid = document.getElementById('tracker-grid');
    grid.innerHTML = ''; // Clear grid if regenerating
    
    for (let i = 0; i < MAX_ROWS; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';

        const rowNum = document.createElement('div');
        rowNum.className = 'cell row-num';
        rowNum.innerText = i.toString(16).padStart(2, '0').toUpperCase();
        rowDiv.appendChild(rowNum);

        for (let j = 0; j < MAX_TRACKS; j++) {
            const trackCell = document.createElement('div');
            trackCell.className = 'cell';
            // Assign a unique ID using the row and track indices (e.g., "cell-0-2")
            trackCell.id = `cell-${i}-${j}`;
            trackCell.innerText = '--- .. .. ...'; 
            rowDiv.appendChild(trackCell);
        }
        
        grid.appendChild(rowDiv);
    }
}

// --- 4. Gamepad Mobile Input Handling ---

// --- Cursor Logic ---
let currentRow = 0;
let currentTrack = 0;

function updateCursor() {
    // 1. Find the currently active cell and remove the highlight
    const currentActive = document.querySelector('.cell.active');
    if (currentActive) {
        currentActive.classList.remove('active');
    }

    // 2. Find the new target cell using our coordinates
    const targetCell = document.getElementById(`cell-${currentRow}-${currentTrack}`);
    
    // 3. Apply the highlight and scroll it into view
    if (targetCell) {
        targetCell.classList.add('active');
        
        // Ensure the cursor doesn't get hidden behind the gamepad
        targetCell.scrollIntoView({ 
            block: 'center', 
            behavior: 'auto' 
        });
    }
}

// Initialize the grid and set the starting cursor position
generateTrackerGrid();
updateCursor(); 

// --- Updated Gamepad Mobile Input Handling ---

bindButton('btn-up', () => {
    if (currentRow > 0) {
        currentRow--;
        updateCursor();
    }
});

bindButton('btn-down', () => {
    if (currentRow < MAX_ROWS - 1) {
        currentRow++;
        updateCursor();
    }
});

bindButton('btn-left', () => {
    if (currentTrack > 0) {
        currentTrack--;
        updateCursor();
    }
});

bindButton('btn-right', () => {
    if (currentTrack < MAX_TRACKS - 1) {
        currentTrack++;
        updateCursor();
    }
});


// Initialize the grid visually on page load
generateTrackerGrid();
