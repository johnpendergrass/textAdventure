// ========================================
// === GAME STATE VARIABLES ===
// ========================================

// Text Buffer System
let textBuffer = [];

// Command History System
let commandHistory = [];
let historyIndex = -1;

// Commands loaded from JSON
let commands = {};

// ASCII Art Library loaded from text file
let asciiArtLibrary = {};

// ========================================
// === DATA LOADING FUNCTIONS ===
// ========================================

// Load game text from JSON file
async function loadGameText() {
  try {
    const response = await fetch("startGameText.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading game text:", error);
    // Fallback to empty array if file can't be loaded
    return ["There is no game text to load. Just type commands for now"];
  }
}

// Load commands from JSON file
async function loadCommands() {
  try {
    const response = await fetch("commands.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading commands:", error);
    // Fallback to empty object if file can't be loaded
    return {};
  }
}

// Parse ASCII art from text file format
function parseAsciiArtText(textContent) {
  // Handle all line ending types (Windows, Unix, Mac)
  const lines = textContent.split(/\r?\n|\r/);
  const artPieces = {};
  const loadValidationIssues = {};
  const fileMetadata = {};

  let currentArt = null;
  let currentMetadata = {};
  let currentRows = [];
  let lineIndex = 0;

  for (const rawLine of lines) {
    lineIndex++;

    // Clean any trailing/leading whitespace and control characters
    const line = rawLine.trim();

    // Skip empty lines
    if (line === "") {
      // If we have current art, save it
      if (currentArt) {
        // Build art piece in same format as JSON
        artPieces[currentArt] = {
          color: currentMetadata.color || "white",
          textSize: parseInt(currentMetadata.size) || 8,
          rows: [...currentRows], // Copy the rows
        };

        // Store metadata for display
        fileMetadata[currentArt] = { ...currentMetadata };

        // Reset for next piece
        currentArt = null;
        currentMetadata = {};
        currentRows = [];
      }
      continue;
    }

    // Parse metadata lines (must contain = and not start with quote)
    if (line.includes("=") && !line.startsWith('"')) {
      const [key, value] = line.split("=", 2);
      if (key === "name") {
        currentArt = value;
      } else {
        currentMetadata[key] = value;
      }
      continue;
    }

    // Parse quoted art rows - must start AND end with quotes
    if (line.startsWith('"') && line.endsWith('"') && line.length >= 2) {
      // Strip ONLY the first and last character (the quotes)
      const rowContent = line.substring(1, line.length - 1);
      currentRows.push(rowContent);
      continue;
    }

    // Unrecognized line format
    console.warn(
      `Unrecognized line format at line ${lineIndex}: "${line}" (length: ${line.length})`
    );
  }

  // Handle last art piece if file doesn't end with blank line
  if (currentArt) {
    artPieces[currentArt] = {
      color: currentMetadata.color || "white",
      textSize: parseInt(currentMetadata.size) || 8,
      rows: [...currentRows],
    };

    // Store metadata for display
    fileMetadata[currentArt] = { ...currentMetadata };
  }

  return { artPieces, loadValidationIssues, fileMetadata };
}

// Load ASCII art library from text file
async function loadAsciiArtLibrary(filename = "asciiArt.txt") {
  try {
    const response = await fetch(filename);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const textContent = await response.text();
    const parseResult = parseAsciiArtText(textContent);

    asciiArtLibrary = parseResult.artPieces;

    // Report load-time validation issues
    const issueCount = Object.keys(parseResult.loadValidationIssues).length;
    if (issueCount > 0) {
      console.warn(
        "Load-time validation issues:",
        parseResult.loadValidationIssues
      );
      console.log(
        `Loaded ${
          Object.keys(asciiArtLibrary).length
        } art pieces from ${filename} (${issueCount} with issues)`
      );
    } else {
      console.log(
        `Loaded ${
          Object.keys(asciiArtLibrary).length
        } art pieces from ${filename}`
      );
    }

    return asciiArtLibrary;
  } catch (error) {
    console.error("Error loading ASCII art library:", error);
    return {};
  }
}

// ========================================
// === TEXT BUFFER MANAGEMENT ===
// ========================================

// Initialize the buffer with game text
async function initializeBuffer() {
  textBuffer = await loadGameText();
  updateDisplay();
}

// Update the text display (now shows all buffer content)
function updateDisplay() {
  const textDiv = document.querySelector(".text");

  // Convert buffer objects to HTML with appropriate classes
  const htmlLines = textBuffer.map((entry) => {
    if (typeof entry === "string") {
      // Handle legacy string entries
      return `<span class="flavor-text">${entry}</span>`;
    }

    let className;
    switch (entry.type) {
      case "prompt":
        className = "prompt-echo";
        break;
      case "command":
        className = "command-output";
        break;
      case "error":
        className = "error-text";
        break;
      case "flavor":
      default:
        className = "flavor-text";
        break;
    }

    return `<span class="${className}">${entry.text}</span>`;
  });

  textDiv.innerHTML = htmlLines.join("<br>");

  // Auto-scroll to bottom when new content is added
  textDiv.scrollTop = textDiv.scrollHeight;
}

// Scroll up (PAGE UP) - now uses native scrolling
function scrollUp() {
  const textDiv = document.querySelector(".text");
  const lineHeight = parseInt(getComputedStyle(textDiv).lineHeight);
  textDiv.scrollTop -= lineHeight; // Scroll up 1 line
}

// Scroll down (PAGE DOWN) - now uses native scrolling
function scrollDown() {
  const textDiv = document.querySelector(".text");
  const lineHeight = parseInt(getComputedStyle(textDiv).lineHeight);
  textDiv.scrollTop += lineHeight; // Scroll down 1 line
}

// Add text to buffer (for commands and responses)
function addToBuffer(text, type = "flavor") {
  if (Array.isArray(text)) {
    // Check if array items are already objects with text and type
    if (
      text.length > 0 &&
      typeof text[0] === "object" &&
      text[0].text !== undefined
    ) {
      // Array of properly formatted objects, add directly
      textBuffer.push(...text);
    } else {
      // Array of strings, convert to objects
      const textObjects = text.map((line) => ({
        text: line,
        type: type,
      }));
      textBuffer.push(...textObjects);
    }
  } else if (typeof text === "object" && text.text !== undefined) {
    // Already an object with text and type
    textBuffer.push(text);
  } else {
    // Single string
    textBuffer.push({
      text: text,
      type: type,
    });
  }

  // Update display with new content
  updateDisplay();
}

// Add command echo to buffer
function echoCommand(command) {
  addToBuffer([
    { text: "", type: "flavor" },
    { text: "> " + command, type: "prompt" },
    { text: "", type: "flavor" },
  ]);
}

// ========================================
// === ASCII ART & STATUS FUNCTIONS ===
// ========================================

// ASCII Art Grid System
let displayGrid = [];

// Animation speeds (in milliseconds)
const ANIMATION_SPEEDS = {
  slow: 8,
  medium: 3,
  fast: 1,
};

// Helper function for animation delays
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Initialize empty display grid (32 rows × 60 columns)
function initializeDisplayGrid() {
  displayGrid = [];
  for (let y = 0; y < 32; y++) {
    displayGrid[y] = [];
    for (let x = 0; x < 60; x++) {
      displayGrid[y][x] = " ";
    }
  }
}

// Convert array of strings to 2D character grid
function convertLinesToGrid(lines) {
  const grid = [];
  for (let y = 0; y < 32; y++) {
    grid[y] = [];
    const line = lines[y] || "";
    for (let x = 0; x < 60; x++) {
      grid[y][x] = line[x] || " ";
    }
  }
  return grid;
}

// Copy source grid to display grid instantly
function copyGridToDisplay(sourceGrid) {
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 60; x++) {
      displayGrid[y][x] = sourceGrid[y][x];
    }
  }
  refreshDisplay();
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
async function fadeInEffect(sourceGrid, speed = "fast") {
  const delay = ANIMATION_SPEEDS[speed] || ANIMATION_SPEEDS.fast;

  // Dynamic batch sizes based on speed
  const CHARS_PER_UPDATE =
    {
      slow: 3,
      medium: 10,
      fast: 30,
    }[speed] || 30;

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
async function typewriterEffect(sourceGrid, speed = "fast") {
  const delay = ANIMATION_SPEEDS[speed] * 10; // Slower for row effect

  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 60; x++) {
      displayGrid[y][x] = sourceGrid[y][x];
    }
    refreshDisplay();
    await sleep(delay);
  }
}

// Column-by-column vertical sweep
async function verticalSweepEffect(sourceGrid, speed = "fast") {
  const delay = ANIMATION_SPEEDS[speed] * 5;

  for (let x = 0; x < 60; x++) {
    for (let y = 0; y < 32; y++) {
      displayGrid[y][x] = sourceGrid[y][x];
    }
    refreshDisplay();
    await sleep(delay);
  }
}

// Random scatter effect
async function randomScatterEffect(sourceGrid, speed = "fast") {
  const delay = ANIMATION_SPEEDS[speed];

  // Dynamic batch sizes based on speed
  const CHARS_PER_UPDATE =
    {
      slow: 5,
      medium: 15,
      fast: 40,
    }[speed] || 40;

  const positions = [];

  // Create list of all positions
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 60; x++) {
      positions.push({ x, y });
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

    if (i % CHARS_PER_UPDATE === 0) {
      refreshDisplay();
      await sleep(delay);
    }
  }
  refreshDisplay();
}

// Spiral inward effect
async function spiralInEffect(sourceGrid, speed = "fast") {
  const delay = ANIMATION_SPEEDS[speed] * 2;
  let top = 0,
    bottom = 31,
    left = 0,
    right = 59;

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
async function spiralOutEffect(sourceGrid, speed = "fast") {
  const delay = ANIMATION_SPEEDS[speed] * 2;
  const centerX = 29; // Center of 60 wide grid (0-59, so 29.5 rounded down)
  const centerY = 15; // Center of 32 tall grid (0-31, so 15.5 rounded down)

  // Track which positions have been filled
  const filled = Array(32)
    .fill()
    .map(() => Array(60).fill(false));

  // Start from center and expand outward
  let radius = 0;
  const maxRadius = Math.max(
    centerX + 1,
    centerY + 1,
    59 - centerX,
    31 - centerY
  );

  while (radius <= maxRadius) {
    const positions = [];

    // Find all unfilled positions at exactly this distance from center
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 60; x++) {
        if (!filled[y][x]) {
          // Calculate Chebyshev distance (max of horizontal and vertical distance)
          const distance = Math.max(
            Math.abs(x - centerX),
            Math.abs(y - centerY)
          );

          if (distance === radius) {
            positions.push({ y, x });
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
async function diagonalWipeEffect(sourceGrid, speed = "fast") {
  const delay = ANIMATION_SPEEDS[speed] * 3;

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

// Main displayAsciiArt trigger function
async function displayAsciiArt(artName, effectName = "fadeIn", speed = "fast") {
  if (!asciiArtLibrary[artName]) {
    console.error(`Art piece "${artName}" not found`);
    return;
  }

  const sourceGrid = convertLinesToGrid(asciiArtLibrary[artName].rows);

  try {
    switch (effectName) {
      case "instant":
        instantCopy(sourceGrid);
        break;
      case "fadeIn":
        await fadeInEffect(sourceGrid, speed);
        break;
      case "typewriter":
        await typewriterEffect(sourceGrid, speed);
        break;
      case "verticalSweep":
        await verticalSweepEffect(sourceGrid, speed);
        break;
      case "randomScatter":
        await randomScatterEffect(sourceGrid, speed);
        break;
      case "spiralIn":
        await spiralInEffect(sourceGrid, speed);
        break;
      case "spiralOut":
        await spiralOutEffect(sourceGrid, speed);
        break;
      case "diagonalWipe":
        await diagonalWipeEffect(sourceGrid, speed);
        break;
      default:
        instantCopy(sourceGrid);
    }

    console.log(`${artName} loaded with ${effectName} effect`);
  } catch (error) {
    console.error(`Error during ${effectName} effect: ${error.message}`);
  }
}

// ASCII art display function (now uses new system to show CASTLE)
async function updateAsciiArtDisplay() {
  // Initialize blank display grid
  initializeDisplayGrid();

  // Refresh to show blank display
  refreshDisplay();

  // Wait a moment, then display CASTLE with fade-in effect using new system
  await sleep(500); // Brief pause before animation starts
  await displayAsciiArt("CASTLE", "fadeIn", "fast");
}

function updateGameStatus() {
  const statusDiv = document.querySelector(".status");

  statusDiv.innerHTML = `
    <div class="status-section">
      <div class="status-title">COMMANDS:</div>
      <div>(h)elp (l)ook (i)nventory</div>
      <div>(n)orth (s)outh (e)ast (w)est</div>
    </div>
    
    <div class="status-section">
      <div class="status-title">INVENTORY:</div>
      <div>Candy bag (3 treats)</div>
      <div>Plastic sword</div>
      <div>Flashlight (on)</div>
      <div>Fake vampire teeth</div>
    </div>
    
    <div class="status-section">
      <div class="status-title">STATUS:</div>
      <div>Treats: 3/20</div>
      <div>Houses: 2/12</div>
      <div>Score: 150</div>
    </div>
  `;
}

// ========================================
// === COMMAND PROCESSING ===
// ========================================

// Smart command matching function
function findCommand(input) {
  const cmd = input.toLowerCase().trim();

  // Check for exact matches first (including full command names)
  if (commands[cmd]) {
    return { type: "exact", command: cmd };
  }

  // Check single-letter shortcuts (priority shortcuts)
  for (const [commandName, commandData] of Object.entries(commands)) {
    if (commandData.shortcuts && commandData.shortcuts.includes(cmd)) {
      return { type: "shortcut", command: commandName };
    }
  }

  // Check prefix matches for longer inputs (2+ characters)
  if (cmd.length >= 2) {
    const matches = Object.keys(commands).filter((commandName) =>
      commandName.startsWith(cmd)
    );

    if (matches.length === 1) {
      return { type: "prefix", command: matches[0] };
    } else if (matches.length > 1) {
      return { type: "ambiguous", matches: matches };
    }
  }

  return { type: "unknown" };
}

// Command processing with smart matching
function processCommand(command) {
  const result = findCommand(command);
  let isValid = false;

  switch (result.type) {
    case "exact":
    case "shortcut":
    case "prefix":
      addToBuffer(commands[result.command].response);
      isValid = true;
      break;

    case "ambiguous":
      addToBuffer([
        { text: `Did you mean: ${result.matches.join(", ")}?`, type: "error" },
      ]);
      isValid = false;
      break;

    case "unknown":
    default:
      addToBuffer([
        {
          text: "I don't understand that command. Type HELP for",
          type: "error",
        },
        { text: "a list of available commands.", type: "error" },
      ]);
      isValid = false;
      break;
  }

  return isValid;
}

// ========================================
// === COMMAND HISTORY MANAGEMENT ===
// ========================================

// Navigate command history
function navigateHistory(direction, input) {
  if (commandHistory.length === 0) return;

  if (direction === "up") {
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      input.value = commandHistory[commandHistory.length - 1 - historyIndex];
    }
  } else if (direction === "down") {
    if (historyIndex > 0) {
      historyIndex--;
      input.value = commandHistory[commandHistory.length - 1 - historyIndex];
    } else if (historyIndex === 0) {
      historyIndex = -1;
      input.value = "";
    }
  }
}

// Add command to history (with intelligent filtering)
function addToHistory(command, wasValid) {
  // Don't add invalid commands to history
  if (!wasValid) return;

  const lastCommand = commandHistory[commandHistory.length - 1];
  const normalizedCommand = command.toLowerCase().trim();
  const normalizedLast = lastCommand ? lastCommand.toLowerCase().trim() : "";

  // Check if this is a duplicate stateless command
  if (lastCommand && normalizedCommand === normalizedLast) {
    // Find the actual command name to check if it's stateless
    const result = findCommand(command);
    let actualCommand = "";

    if (result.type === "exact") {
      actualCommand = result.command;
    } else if (result.type === "shortcut" || result.type === "prefix") {
      actualCommand = result.command;
    }

    // Check if the command is marked as stateless in the JSON data
    if (
      actualCommand &&
      commands[actualCommand] &&
      commands[actualCommand].type === "stateless"
    ) {
      return; // Don't add duplicate stateless command
    }
  }

  commandHistory.push(command);
  historyIndex = -1; // Reset history navigation
}

// ========================================
// === INPUT HANDLING ===
// ========================================

// Handle input from the command line
function handleInput(event) {
  const input = event.target;

  if (event.key === "Enter") {
    const command = input.value.trim();

    if (command) {
      // Echo the command to the text buffer
      echoCommand(command);

      // Process the command and get validity
      const wasValid = processCommand(command);

      // Add to history buffer only if valid and not duplicate stateless
      addToHistory(command, wasValid);

      // Clear the input
      input.value = "";
    }
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    navigateHistory("up", input);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    navigateHistory("down", input);
  }
}

// ========================================
// === INITIALIZATION FUNCTIONS ===
// ========================================

// Initialize ASCII art display
function initializeAsciiArt() {
  updateAsciiArtDisplay();
}

// Initialize status information display
function initializeStatusInfo() {
  updateGameStatus();
}

// Initialize input system
function initializeInput() {
  const commandInput = document.getElementById("commandInput");
  commandInput.addEventListener("keydown", handleInput);

  // Focus the input field
  commandInput.focus();
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", async function () {
  // Load commands first
  commands = await loadCommands();

  // Load ASCII art library
  await loadAsciiArtLibrary();

  await initializeBuffer();
  initializeAsciiArt();
  initializeStatusInfo();
  initializeInput();

  // Add keyboard event listener for PAGE UP/DOWN and ASCII art hotkeys
  document.addEventListener("keydown", async function (e) {
    if (e.key === "PageUp") {
      e.preventDefault();
      scrollUp();
    } else if (e.key === "PageDown") {
      e.preventDefault();
      scrollDown();
    } else if (e.key === "b" || e.key === "B") {
      // Load blank display
      e.preventDefault();
      initializeDisplayGrid();
      refreshDisplay();
    } else if (e.key === "c" || e.key === "C") {
      // Load castle with fade effect
      e.preventDefault();
      await updateAsciiArtDisplay();
    } else if (e.altKey && e.key === "1") {
      // ALT-1: Load DEFAULT with fadeIn/fast
      e.preventDefault();
      await displayAsciiArt("DEFAULT", "fadeIn", "fast");
    } else if (e.altKey && e.key === "2") {
      // ALT-2: Load CASTLE with randomScatter/fast
      e.preventDefault();
      await displayAsciiArt("CASTLE", "randomScatter", "fast");
    } else if (e.altKey && e.key === "3") {
      // ALT-3: Load SAMPLE with typewriter/fast
      e.preventDefault();
      await displayAsciiArt("SAMPLE", "typewriter", "fast");
    } else if (e.altKey && e.key === "4") {
      // ALT-4: Load QUESTION with spiralIn/fast
      e.preventDefault();
      await displayAsciiArt("QUESTION", "spiralIn", "fast");
    }
  });
});
