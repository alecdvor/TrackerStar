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

// --- 3. UI Constants & State ---
const MAX_ROWS = 64;
const MAX_TRACKS = 4;
let currentRow = 0;
let currentTrack = 0;

// --- 4. Tracker Grid Generation ---
function generateTrackerGrid() {
    const grid = document.getElementById('tracker-grid');
    if (!grid) return; // Prevent errors if the HTML is missing
    grid.innerHTML = ''; 
    
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
            trackCell.id = `cell-${i}-${j}`;
            trackCell.innerText = '--- .. .. ...'; 
            rowDiv.appendChild(trackCell);
        }
        
        grid.appendChild(rowDiv);
    }
}

// --- 5. Cursor Logic ---
function updateCursor() {
    // Remove old highlight
    const currentActive = document.querySelector('.cell.active');
    if (currentActive) {
        currentActive.classList.remove('active');
    }

    // Apply new highlight
    const targetCell = document.getElementById(`cell-${currentRow}-${currentTrack}`);
    if (targetCell) {
        targetCell.classList.add('active');
        targetCell.scrollIntoView({ block: 'center', behavior: 'auto' });
        console.log(`Cursor moved to: Row ${currentRow}, Track ${currentTrack}`);
    } else {
        console.error(`Could not find cell: cell-${currentRow}-${currentTrack}`);
    }
}

// Initialize the grid visually on page load
generateTrackerGrid();
updateCursor(); 

// --- 6. Gamepad Mobile Input Handling ---
function bindButton(id, action) {
    const btn = document.getElementById(id);
    if (!btn) {
        console.warn(`Button ${id} not found in HTML.`);
        return;
    }

    // Handle mobile touch
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault(); 
        action();
    });
    
    // Handle desktop mouse clicks
    btn.addEventListener('mousedown', (e) => {
        action();
    });
}

// Navigation Bindings
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
