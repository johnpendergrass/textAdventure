// ========================================
// === ASCII ART TEST ENVIRONMENT ===
// ========================================

// ASCII Art Grid System
let displayGrid = [];
let asciiArtLibrary = {};
let currentSpeed = 'medium';
let currentEffect = 'instant';
let isAnimating = false;

// Animation speeds (in milliseconds)
const ANIMATION_SPEEDS = {
  slow: 8,
  medium: 3,
  fast: 1
};

// ========================================
// === CORE GRID FUNCTIONS ===
// ========================================

// Helper function for animation delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize empty display grid (32 rows × 60 columns)
function initializeDisplayGrid() {
  displayGrid = [];
  for (let y = 0; y < 32; y++) {
    displayGrid[y] = [];
    for (let x = 0; x < 60; x++) {
      displayGrid[y][x] = ' ';
    }
  }
}

// Convert array of strings to 2D character grid
function convertLinesToGrid(lines) {
  const grid = [];
  for (let y = 0; y < 32; y++) {
    grid[y] = [];
    const line = lines[y] || '';
    for (let x = 0; x < 60; x++) {
      grid[y][x] = line[x] || ' ';
    }
  }
  return grid;
}

// Update the DOM from display grid
function refreshDisplay() {
  const asciiArtDiv = document.querySelector(".ascii-art");
  let output = "";
  
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 60; x++) {
      output += displayGrid[y][x];
    }
    output += "\n";
  }
  
  asciiArtDiv.textContent = output;
}

// ========================================
// === DATA LOADING ===
// ========================================

// Load ASCII art library from JSON
async function loadAsciiArtLibrary() {
  try {
    const response = await fetch("asciiArt.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    asciiArtLibrary = data;
    updateStatus(`Loaded ${Object.keys(data).length} ASCII art pieces`);
    return data;
  } catch (error) {
    console.error("Error loading ASCII art library:", error);
    updateStatus("Error loading ASCII art library");
    return {};
  }
}

// ========================================
// === ANIMATION EFFECTS ===
// ========================================

// Instant copy - no animation
function instantCopy(sourceGrid) {
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 60; x++) {
      displayGrid[y][x] = sourceGrid[y][x];
    }
  }
  refreshDisplay();
}

// Character-by-character fade in
async function fadeInEffect(sourceGrid) {
  const delay = ANIMATION_SPEEDS[currentSpeed];
  const CHARS_PER_UPDATE = 3;
  let charCount = 0;
  
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 60; x++) {
      displayGrid[y][x] = sourceGrid[y][x];
      charCount++;
      
      if (charCount % CHARS_PER_UPDATE === 0) {
        refreshDisplay();
        await sleep(delay);
      }
    }
  }
  refreshDisplay();
}

// Row-by-row typewriter effect
async function typewriterEffect(sourceGrid) {
  const delay = ANIMATION_SPEEDS[currentSpeed] * 10; // Slower for row effect
  
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 60; x++) {
      displayGrid[y][x] = sourceGrid[y][x];
    }
    refreshDisplay();
    await sleep(delay);
  }
}

// Column-by-column vertical sweep
async function verticalSweepEffect(sourceGrid) {
  const delay = ANIMATION_SPEEDS[currentSpeed] * 5;
  
  for (let x = 0; x < 60; x++) {
    for (let y = 0; y < 32; y++) {
      displayGrid[y][x] = sourceGrid[y][x];
    }
    refreshDisplay();
    await sleep(delay);
  }
}

// Random scatter effect
async function randomScatterEffect(sourceGrid) {
  const delay = ANIMATION_SPEEDS[currentSpeed];
  const positions = [];
  
  // Create list of all positions
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 60; x++) {
      positions.push({x, y});
    }
  }
  
  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  // Fill in random order
  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    displayGrid[pos.y][pos.x] = sourceGrid[pos.y][pos.x];
    
    if (i % 5 === 0) { // Update every 5 characters
      refreshDisplay();
      await sleep(delay);
    }
  }
  refreshDisplay();
}

// Spiral inward effect
async function spiralInEffect(sourceGrid) {
  const delay = ANIMATION_SPEEDS[currentSpeed] * 2;
  let top = 0, bottom = 31, left = 0, right = 59;
  
  while (top <= bottom && left <= right) {
    // Top row
    for (let x = left; x <= right; x++) {
      displayGrid[top][x] = sourceGrid[top][x];
    }
    top++;
    refreshDisplay();
    await sleep(delay);
    
    // Right column
    for (let y = top; y <= bottom; y++) {
      displayGrid[y][right] = sourceGrid[y][right];
    }
    right--;
    refreshDisplay();
    await sleep(delay);
    
    // Bottom row
    if (top <= bottom) {
      for (let x = right; x >= left; x--) {
        displayGrid[bottom][x] = sourceGrid[bottom][x];
      }
      bottom--;
      refreshDisplay();
      await sleep(delay);
    }
    
    // Left column
    if (left <= right) {
      for (let y = bottom; y >= top; y--) {
        displayGrid[y][left] = sourceGrid[y][left];
      }
      left++;
      refreshDisplay();
      await sleep(delay);
    }
  }
}

// Spiral outward effect (from center out)
async function spiralOutEffect(sourceGrid) {
  const delay = ANIMATION_SPEEDS[currentSpeed] * 2;
  const centerX = 29; // Center of 60 wide grid (0-59, so 29.5 rounded down)
  const centerY = 15; // Center of 32 tall grid (0-31, so 15.5 rounded down)
  
  // Track which positions have been filled
  const filled = Array(32).fill().map(() => Array(60).fill(false));
  
  // Start from center and expand outward
  let radius = 0;
  const maxRadius = Math.max(centerX + 1, centerY + 1, 59 - centerX, 31 - centerY);
  
  while (radius <= maxRadius) {
    const positions = [];
    
    // Find all unfilled positions at exactly this distance from center
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 60; x++) {
        if (!filled[y][x]) {
          // Calculate Chebyshev distance (max of horizontal and vertical distance)
          const distance = Math.max(Math.abs(x - centerX), Math.abs(y - centerY));
          
          if (distance === radius) {
            positions.push({y, x});
            filled[y][x] = true;
          }
        }
      }
    }
    
    // Draw all positions at this radius
    for (const pos of positions) {
      displayGrid[pos.y][pos.x] = sourceGrid[pos.y][pos.x];
    }
    
    if (positions.length > 0) {
      refreshDisplay();
      await sleep(delay);
    }
    
    radius++;
  }
  
  // Safety check: fill any remaining unfilled positions
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 60; x++) {
      if (!filled[y][x]) {
        displayGrid[y][x] = sourceGrid[y][x];
      }
    }
  }
  refreshDisplay();
}

// Diagonal wipe effect
async function diagonalWipeEffect(sourceGrid) {
  const delay = ANIMATION_SPEEDS[currentSpeed] * 3;
  
  // Fill diagonally from top-left to bottom-right
  for (let d = 0; d < 32 + 60 - 1; d++) {
    for (let y = 0; y < 32; y++) {
      const x = d - y;
      if (x >= 0 && x < 60) {
        displayGrid[y][x] = sourceGrid[y][x];
      }
    }
    refreshDisplay();
    await sleep(delay);
  }
}

// ========================================
// === MAIN DISPLAY FUNCTION ===
// ========================================

async function displayAsciiArt(artName, effectName) {
  if (isAnimating) {
    updateStatus("Animation in progress...");
    return;
  }
  
  if (!asciiArtLibrary[artName]) {
    updateStatus(`Art piece "${artName}" not found`);
    return;
  }
  
  isAnimating = true;
  updateStatus(`Loading ${artName} with ${effectName} effect...`);
  
  const sourceGrid = convertLinesToGrid(asciiArtLibrary[artName].rows);
  
  try {
    switch (effectName) {
      case 'instant':
        instantCopy(sourceGrid);
        break;
      case 'fadeIn':
        await fadeInEffect(sourceGrid);
        break;
      case 'typewriter':
        await typewriterEffect(sourceGrid);
        break;
      case 'verticalSweep':
        await verticalSweepEffect(sourceGrid);
        break;
      case 'randomScatter':
        await randomScatterEffect(sourceGrid);
        break;
      case 'spiralIn':
        await spiralInEffect(sourceGrid);
        break;
      case 'spiralOut':
        await spiralOutEffect(sourceGrid);
        break;
      case 'diagonalWipe':
        await diagonalWipeEffect(sourceGrid);
        break;
      default:
        instantCopy(sourceGrid);
    }
    
    updateStatus(`${artName} loaded successfully`);
  } catch (error) {
    updateStatus(`Error during ${effectName} effect: ${error.message}`);
  }
  
  isAnimating = false;
}

// ========================================
// === UI FUNCTIONS ===
// ========================================

function updateStatus(message) {
  const statusDiv = document.querySelector('.status-display');
  if (statusDiv) {
    const timestamp = new Date().toLocaleTimeString();
    statusDiv.innerHTML = `[${timestamp}] ${message}`;
  }
}

function updateActiveButtons() {
  // Update speed buttons
  document.querySelectorAll('.speed-buttons .control-button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`speed-${currentSpeed}`).classList.add('active');
  
  // Update effect buttons
  document.querySelectorAll('.effect-button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`effect-${currentEffect}`).classList.add('active');
}

function setSpeed(speed) {
  if (isAnimating) {
    updateStatus("Cannot change speed during animation");
    return;
  }
  currentSpeed = speed;
  updateActiveButtons();
  updateStatus(`Speed set to: ${speed}`);
}

function setEffect(effect) {
  currentEffect = effect;
  updateActiveButtons();
  updateStatus(`Effect set to: ${effect}`);
}

function clearDisplay() {
  if (isAnimating) {
    updateStatus("Cannot clear during animation");
    return;
  }
  initializeDisplayGrid();
  refreshDisplay();
  updateStatus("Display cleared");
}

// ========================================
// === INITIALIZATION ===
// ========================================

function loadSelectedArt() {
  const dropdown = document.getElementById('art-selector');
  const selectedArt = dropdown.value;
  if (selectedArt) {
    displayAsciiArt(selectedArt, currentEffect);
  }
}

function populateArtDropdown() {
  const dropdown = document.getElementById('art-selector');
  dropdown.innerHTML = '<option value="">-- Select ASCII Art --</option>';
  
  for (const artName in asciiArtLibrary) {
    const option = document.createElement('option');
    option.value = artName;
    option.textContent = artName;
    dropdown.appendChild(option);
  }
}

function initializeControls() {
  const controlsDiv = document.querySelector('.controls');
  
  controlsDiv.innerHTML = `
    <div class="control-section">
      <div class="control-title">ASCII ART PIECES</div>
      <div class="dropdown-container">
        <select id="art-selector" class="art-dropdown">
          <option value="">-- Select ASCII Art --</option>
        </select>
        <button class="load-button" onclick="loadSelectedArt()">Load</button>
      </div>
    </div>
    
    <div class="control-section">
      <div class="control-title">ANIMATION EFFECTS</div>
      <div class="button-group">
        <button class="control-button effect-button" id="effect-instant" onclick="setEffect('instant')">Instant</button>
        <button class="control-button effect-button" id="effect-fadeIn" onclick="setEffect('fadeIn')">Fade In</button>
        <button class="control-button effect-button" id="effect-typewriter" onclick="setEffect('typewriter')">Typewriter</button>
        <button class="control-button effect-button" id="effect-verticalSweep" onclick="setEffect('verticalSweep')">Vertical Sweep</button>
        <button class="control-button effect-button" id="effect-randomScatter" onclick="setEffect('randomScatter')">Random Scatter</button>
        <button class="control-button effect-button" id="effect-spiralIn" onclick="setEffect('spiralIn')">Spiral In</button>
        <button class="control-button effect-button" id="effect-spiralOut" onclick="setEffect('spiralOut')">Spiral Out</button>
        <button class="control-button effect-button" id="effect-diagonalWipe" onclick="setEffect('diagonalWipe')">Diagonal Wipe</button>
      </div>
    </div>
    
    <div class="control-section">
      <div class="control-title">ANIMATION SPEED</div>
      <div class="speed-buttons">
        <button class="control-button" id="speed-slow" onclick="setSpeed('slow')">Slow</button>
        <button class="control-button" id="speed-medium" onclick="setSpeed('medium')">Med</button>
        <button class="control-button" id="speed-fast" onclick="setSpeed('fast')">Fast</button>
      </div>
    </div>
    
    <div class="control-section">
      <div class="control-title">UTILITIES</div>
      <div class="button-group">
        <button class="control-button" onclick="clearDisplay()">Clear Display</button>
      </div>
    </div>
    
    <div class="status-display">Ready to test ASCII art effects...</div>
  `;
  
  updateActiveButtons();
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", async function () {
  initializeDisplayGrid();
  refreshDisplay();
  
  await loadAsciiArtLibrary();
  initializeControls();
  populateArtDropdown();
  
  updateStatus("ASCII Art Test Environment Ready");
});