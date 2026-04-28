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

// Helper function to bind both touch and click for testing on desktop
function bindButton(id, action) {
    const btn = document.getElementById(id);
    if (!btn) return;

    // touchstart is crucial for zero-latency mobile response
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Stop mobile browsers from zooming/scrolling
        action();
    });
    
    // Keep mousedown for desktop testing
    btn.addEventListener('mousedown', (e) => {
        action();
    });
}

// Logic for grid navigation (Placeholders for now)
let currentRow = 0;
let currentTrack = 0;

bindButton('btn-up', () => {
    console.log("Navigating UP");
    if (currentRow > 0) currentRow--;
    // TODO: Update UI highlight
});

bindButton('btn-down', () => {
    console.log("Navigating DOWN");
    currentRow++;
    // TODO: Update UI highlight
});

bindButton('btn-left', () => {
    console.log("Navigating LEFT track");
    if (currentTrack > 0) currentTrack--;
    // TODO: Update UI highlight
});

bindButton('btn-right', () => {
    console.log("Navigating RIGHT track");
    currentTrack++;
    // TODO: Update UI highlight
});

// Action buttons
bindButton('btn-a', () => {
    console.log("ACTION A: Enter Edit Mode / Trigger Note");
});

bindButton('btn-b', () => {
    console.log("ACTION B: Delete Note / Back");
});

// Initialize the grid visually on page load
generateTrackerGrid();
