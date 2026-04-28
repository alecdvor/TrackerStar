// ==========================================
// 1. GLOBAL VARIABLES & STATE
// ==========================================
let audioContext; // Declared exactly once here!
let device;

const MAX_ROWS = 64;
const MAX_TRACKS = 4;
let currentRow = 0;
let currentTrack = 0;

// ==========================================
// 2. AUDIO ENGINE (RNBO & WEB AUDIO)
// ==========================================
async function setupRNBO() {
    const WAContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new WAContext();

    try {
        const response = await fetch("export/patch.export.json");
        const patcher = await response.json();

        device = await RNBO.createDevice({ context: audioContext, patcher });
        device.node.connect(audioContext.destination);
        console.log("RNBO Wasm Module loaded and patched successfully.");
        
    } catch (err) {
        console.error("Failed to load the RNBO export. Check your file paths.", err);
    }
}

// Audio initialization listener
document.getElementById('start-audio').addEventListener('click', async (e) => {
    if (!audioContext) {
        await setupRNBO();
    }
    
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }

    e.target.innerText = "AUDIO ENGINE RUNNING";
    e.target.style.background = "#00ff00";
    e.target.style.color = "#121212";
});

// ==========================================
// 3. UI GENERATION & CURSOR LOGIC
// ==========================================
function generateTrackerGrid() {
    const grid = document.getElementById('tracker-grid');
    if (!grid) return; 
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

function updateCursor() {
    const currentActive = document.querySelector('.cell.active');
    if (currentActive) {
        currentActive.classList.remove('active');
    }

    const targetCell = document.getElementById(`cell-${currentRow}-${currentTrack}`);
    if (targetCell) {
        targetCell.classList.add('active');
        targetCell.scrollIntoView({ block: 'center', behavior: 'auto' });
    }
}

// ==========================================
// 4. MOBILE GAMEPAD INPUT BINDINGS
// ==========================================
function bindButton(id, action) {
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.addEventListener('touchstart', (e) => {
        e.preventDefault(); 
        action();
    });
    
    btn.addEventListener('mousedown', (e) => {
        action();
    });
}

// Ensure HTML is fully loaded before binding inputs
document.addEventListener('DOMContentLoaded', () => {
    
    // Build the grid and place cursor
    generateTrackerGrid();
    updateCursor(); 

    // D-Pad Bindings
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

    // Action Button Bindings
    bindButton('btn-a', () => {
        const activeCell = document.querySelector('.cell.active');
        if (activeCell) {
            activeCell.innerText = 'C-4 01 F ...';
            
            if (currentRow < MAX_ROWS - 1) {
                currentRow++;
                updateCursor();
            }
        }
    });

    bindButton('btn-b', () => {
        const activeCell = document.querySelector('.cell.active');
        if (activeCell) {
            activeCell.innerText = '--- .. .. ...';
        }
    });

    console.log("Tracker Engine Initialized Successfully.");
});
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


// --- 6. Gamepad Mobile Input Handling ---
function bindButton(id, action) {
    const btn = document.getElementById(id);
    if (!btn) {
        console.warn(`Button ${id} not found in HTML.`);
        return;
    }

    btn.addEventListener('touchstart', (e) => {
        e.preventDefault(); 
        action();
    });
    
    btn.addEventListener('mousedown', (e) => {
        action();
    });
}

// --- 7. The Initialization Wrapper ---
// This guarantees the HTML is 100% drawn before we look for IDs
document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize the grid
    generateTrackerGrid();
    updateCursor(); 

    // Bind the buttons safely
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
    // ... (Your existing D-pad bindings) ...

    // --- Action Button Bindings ---
    
    bindButton('btn-a', () => {
        const activeCell = document.querySelector('.cell.active');
        if (activeCell) {
            // Replace the placeholder text with a standard tracker note format
            // [Note] [Instrument] [Volume] [Effect]
            activeCell.innerText = 'C-4 01 F ...';
            
            // Standard tracker behavior: auto-advance cursor after entering a note
            if (currentRow < MAX_ROWS - 1) {
                currentRow++;
                updateCursor();
            }
        }
    });

    bindButton('btn-b', () => {
        const activeCell = document.querySelector('.cell.active');
        if (activeCell) {
            // Revert the cell back to the empty placeholder format
            activeCell.innerText = '--- .. .. ...';
        }
    });

    console.log("All tracker UI modules loaded and bound.");
});
