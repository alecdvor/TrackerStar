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
// 4. SEQUENCER STATE & NOTE LOGIC
// ==========================================
let isPlaying = false;
let isEditing = false;

// The standard 12-note chromatic scale used in trackers
const NOTE_SCALE = ['C-', 'C#', 'D-', 'D#', 'E-', 'F-', 'F#', 'G-', 'G#', 'A-', 'A#', 'B-'];

// Helper function to shift the pitch up or down inside the cell string
function shiftNote(direction) {
    const activeCell = document.querySelector('.cell.active');
    if (!activeCell) return;

    let text = activeCell.innerText;
    
    // Parse the current cell text (e.g., 'C-4 01 F ...')
    let notePart = text.substring(0, 2); // 'C-'
    let octavePart = parseInt(text.substring(2, 3)); // 4
    
    // If it's an empty cell, initialize it before shifting
    if (isNaN(octavePart)) {
        notePart = 'C-';
        octavePart = 4;
        text = 'C-4 01 F ...'; 
    }

    let noteIndex = NOTE_SCALE.indexOf(notePart);
    if (noteIndex === -1) noteIndex = 0;

    // Shift pitch
    noteIndex += direction;

    // Handle octave wrap-around
    if (noteIndex >= NOTE_SCALE.length) {
        noteIndex = 0;
        if (octavePart < 9) octavePart++;
    } else if (noteIndex < 0) {
        noteIndex = NOTE_SCALE.length - 1;
        if (octavePart > 0) octavePart--;
    }

    // Reconstruct the string and update the cell
    const newNoteStr = NOTE_SCALE[noteIndex] + octavePart + text.substring(3);
    activeCell.innerText = newNoteStr;
}

// ==========================================
// 5. MOBILE GAMEPAD INPUT BINDINGS
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

document.addEventListener('DOMContentLoaded', () => {
    
    generateTrackerGrid();
    updateCursor(); 

    // --- System Buttons ---
    bindButton('btn-start', () => {
        isPlaying = !isPlaying;
        const startBtn = document.getElementById('btn-start');
        if (isPlaying) {
            startBtn.style.background = '#00ff00';
            startBtn.style.color = '#121212';
            console.log("Playback: RUNNING");
            // Future step: Start the sequencer tick loop here
        } else {
            startBtn.style.background = '#444';
            startBtn.style.color = '#ccc';
            console.log("Playback: PAUSED");
            // Future step: Pause the sequencer tick loop here
        }
    });

    bindButton('btn-select', () => {
        console.log("Select button pressed");
    });

    // --- D-Pad Bindings (Forked by Edit State) ---
    bindButton('btn-up', () => {
        if (isEditing) {
            shiftNote(1); // Pitch up
        } else if (currentRow > 0) {
            currentRow--;
            updateCursor();
        }
    });

    bindButton('btn-down', () => {
        if (isEditing) {
            shiftNote(-1); // Pitch down
        } else if (currentRow < MAX_ROWS - 1) {
            currentRow++;
            updateCursor();
        }
    });

    bindButton('btn-left', () => {
        if (!isEditing && currentTrack > 0) {
            currentTrack--;
            updateCursor();
        }
    });

    bindButton('btn-right', () => {
        if (!isEditing && currentTrack < MAX_TRACKS - 1) {
            currentTrack++;
            updateCursor();
        }
    });

    // --- Action Button Bindings ---
    bindButton('btn-a', () => {
        const activeCell = document.querySelector('.cell.active');
        if (!activeCell) return;

        isEditing = !isEditing; // Toggle state

        if (isEditing) {
            // Lock cursor and turn pink
            activeCell.classList.add('editing');
            if (activeCell.innerText.startsWith('---')) {
                activeCell.innerText = 'C-4 01 F ...'; // Default init
            }
        } else {
            // Unlock cursor, remove pink, auto-advance row
            activeCell.classList.remove('editing');
            if (currentRow < MAX_ROWS - 1) {
                currentRow++;
                updateCursor();
            }
        }
    });

    bindButton('btn-b', () => {
        // Cancel edit or delete note
        const activeCell = document.querySelector('.cell.active');
        if (activeCell) {
            activeCell.innerText = '--- .. .. ...';
            if (isEditing) {
                isEditing = false;
                activeCell.classList.remove('editing');
            }
        }
    });

    bindButton('btn-x', () => console.log("X pressed"));
    bindButton('btn-y', () => console.log("Y pressed"));

});
