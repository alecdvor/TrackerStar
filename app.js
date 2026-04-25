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
function generateTrackerGrid(rows = 64, tracks = 4) {
    const grid = document.getElementById('tracker-grid');
    
    for (let i = 0; i < rows; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';

        // Create the Row Index (Formatted in Hexadecimal: 00 to 3F)
        const rowNum = document.createElement('div');
        rowNum.className = 'cell row-num';
        rowNum.innerText = i.toString(16).padStart(2, '0').toUpperCase();
        rowDiv.appendChild(rowNum);

        // Create the Track Columns [Note] [Instrument] [Volume] [Effect]
        for (let j = 0; j < tracks; j++) {
            const trackCell = document.createElement('div');
            trackCell.className = 'cell';
            // Placeholder tracker data format: --- (Note) .. (Instr) .. (Vol) ... (FX)
            trackCell.innerText = '--- .. .. ...'; 
            rowDiv.appendChild(trackCell);
        }
        
        grid.appendChild(rowDiv);
    }
}

// Initialize the grid visually on page load
generateTrackerGrid();
