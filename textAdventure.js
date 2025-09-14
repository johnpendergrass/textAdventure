// ========================================
// === CONFIGURATION ===
// ========================================

// Configuration files location - change this to load different game configs
const CONFIG_LOCATION = "HALLOWEEN-GAME";

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

// Configuration data loaded from JSON files
let asciiArtConfig = {};
let gameData = {};
let player = {};
let gameState = {};
let uiConfig = {};
let keyboardShortcuts = {};

// Game world data
let rooms = {};
let doors = {};
let items = {};
let currentRoom = "STREET-01";

// ========================================
// === ERROR HANDLING FUNCTIONS ===
// ========================================

// Centralized error display function
function displayConfigError(filename, location, error, isCritical = false, fallbackAvailable = true) {
  const errorCode = error.status || error.message || 'Unknown error';
  const fullPath = `${location}/${filename}`;
  
  // Console logging with detailed information
  console.error(`Failed to load config file: ${filename}`);
  console.error(`Location: ${location}`);  
  console.error(`Full path: ${fullPath}`);
  console.error(`Error: ${errorCode}`);
  console.error(`Critical: ${isCritical}`);
  console.error(`Fallback available: ${fallbackAvailable}`);
  
  // User-visible error message in game text area
  const errorMessages = [
    { text: `CONFIG ERROR: Failed to load ${filename}`, type: "error" },
    { text: `Location: ${fullPath}`, type: "error" },
    { text: `Error: ${errorCode}`, type: "error" }
  ];
  
  if (!fallbackAvailable) {
    errorMessages.push({ text: `No fallback available - game cannot continue`, type: "error" });
    errorMessages.push({ text: `Game will exit after this error.`, type: "error" });
  } else {
    errorMessages.push({ text: `Using fallback defaults to continue`, type: "error" });
  }
  
  errorMessages.push({ text: "", type: "flavor" }); // Add blank line
  
  // Add to buffer if textBuffer exists (after initial load)
  if (typeof addToBuffer !== 'undefined') {
    addToBuffer(errorMessages);
  }
}

// ========================================
// === FALLBACK DEFAULTS ===
// ========================================

// Fallback defaults for each config type
const CONFIG_FALLBACKS = {
  asciiArtConfig: {
    grid: { rows: 32, columns: 60 },
    animation: {
      speeds: { slow: 8, medium: 3, fast: 1 },
      batchSizes: {
        fadeIn: { slow: 3, medium: 10, fast: 30 },
        randomScatter: { slow: 5, medium: 15, fast: 40 }
      },
      multipliers: {
        typewriter: 10,
        verticalSweep: 5,
        spiralIn: 2,
        spiralOut: 2,
        diagonalWipe: 3
      }
    },
    defaults: {
      asciiArt: "CASTLE",
      effect: "fadeIn", 
      speed: "fast",
      startupDelay: 500
    }
  },
  
  uiConfig: {
    statusPanel: {
      commands: {
        title: "COMMANDS:",
        list: [
          "(h)elp (l)ook (i)nventory",
          "(n)orth (s)outh (e)ast (w)est"
        ]
      },
      inventory: { title: "INVENTORY:" },
      status: { title: "STATUS:" }
    },
    fallbackText: {
      noGameText: "Configuration error. Type HELP for available commands."
    }
  },
  
  commands: {
    help: {
      type: "system",
      shortcuts: ["h", "?"],
      action: "show_help"
    },
    look: {
      type: "action",
      shortcuts: ["l"],
      action: "examine_room"
    },
    inventory: {
      type: "system", 
      shortcuts: ["i"],
      action: "show_inventory"
    },
    north: {
      type: "movement",
      shortcuts: ["n"],
      action: "move_north"
    },
    south: {
      type: "movement",
      shortcuts: ["s"],
      action: "move_south"
    },
    east: {
      type: "movement",
      shortcuts: ["e"],
      action: "move_east"
    },
    west: {
      type: "movement",
      shortcuts: ["w"],
      action: "move_west"
    }
  },
  
  player: {
    inventory: [],
    stats: {
      treats: { current: 0, max: 10 },
      houses: { current: 0, max: 25 },
      score: 0
    }
  },
  
  gameState: {
    currentRoom: "start",
    visitedRooms: ["start"],
    gameFlags: {}
  },
  
  keyboardShortcuts: {
    navigation: [
      { key: "PageUp", action: "scrollUp", preventDefault: true },
      { key: "PageDown", action: "scrollDown", preventDefault: true }
    ],
    asciiArt: []
  },
  
  gameText: [
    "SYSTEM NOTICE: Configuration files could not be loaded.",
    "Using fallback game configuration.",
    "You may experience limited functionality.",
    "",
    "Type HELP to see available commands."
  ],
  
  initGame: {
    meta: {
      gameName: "Halloween Text Adventure (Fallback)",
      version: "1.0.0",
      author: "System"
    },
    startup: {
      room: "STREET-01",
      asciiArt: {
        name: "CASTLE",
        effect: "fadeIn",
        speed: "fast",
        delay: 500
      },
      welcomeText: [
        {"text": "FALLBACK: initGame.json could not be loaded.", "type": "error"},
        {"text": "Using system defaults.", "type": "error"},
        {"text": "", "type": "flavor"},
        {"text": "Type HELP or H for a list of commands.", "type": "command"}
      ],
      availableCommands: ["help", "look", "inventory", "north", "south", "east", "west"]
    }
  },
  
  gameData: {
    meta: {
      gameName: "Halloween Text Adventure (Fallback)",
      version: "0.2.0",
      author: "System"
    },
    items: {},
    globalCommands: {}
  }
};

// ========================================
// === CRITICAL CONFIG VALIDATION ===
// ========================================

// Check if critical configurations loaded successfully
function checkCriticalConfigs() {
  let criticalErrors = [];
  
  // Check asciiArtConfig
  if (!asciiArtConfig || Object.keys(asciiArtConfig).length === 0) {
    criticalErrors.push('asciiArtConfig is empty or missing');
  } else {
    if (!asciiArtConfig.grid || !asciiArtConfig.animation || !asciiArtConfig.defaults) {
      criticalErrors.push('asciiArtConfig is missing required sections (grid, animation, defaults)');
    }
  }
  
  // Check uiConfig  
  if (!uiConfig || Object.keys(uiConfig).length === 0) {
    criticalErrors.push('uiConfig is empty or missing');
  } else {
    if (!uiConfig.statusPanel || !uiConfig.fallbackText) {
      criticalErrors.push('uiConfig is missing required sections (statusPanel, fallbackText)');
    }
  }
  
  // Check commands
  if (!commands || Object.keys(commands).length === 0) {
    criticalErrors.push('commands is empty or missing');
  } else {
    const requiredCommands = ['help', 'look', 'inventory'];
    const missingCommands = requiredCommands.filter(cmd => !commands[cmd]);
    if (missingCommands.length > 0) {
      criticalErrors.push(`commands is missing required commands: ${missingCommands.join(', ')}`);
    }
  }
  
  if (criticalErrors.length > 0) {
    console.error('CRITICAL CONFIG ERRORS DETECTED:');
    criticalErrors.forEach(error => console.error(`- ${error}`));
    
    // Display critical error message to user
    const criticalErrorMessages = [
      { text: "CRITICAL CONFIGURATION ERROR", type: "error" },
      { text: "One or more essential configuration files failed to load:", type: "error" },
      { text: "", type: "error" }
    ];
    
    criticalErrors.forEach(error => {
      criticalErrorMessages.push({ text: `• ${error}`, type: "error" });
    });
    
    criticalErrorMessages.push(
      { text: "", type: "error" },
      { text: "The game cannot start properly with these errors.", type: "error" },
      { text: "Please check the console for detailed error information.", type: "error" },
      { text: "Input has been disabled.", type: "error" }
    );
    
    if (typeof addToBuffer !== 'undefined') {
      addToBuffer(criticalErrorMessages);
    }
    
    return false;
  }
  
  console.log('All critical configurations validated successfully');
  return true;
}

// ========================================
// === DATA LOADING FUNCTIONS ===
// ========================================

// Load game text from JSON file
async function loadGameText() {
  const filename = 'startGameText.json';
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, false, true);
    console.log(`Using fallback gameText defaults`);
    return CONFIG_FALLBACKS.gameText;
  }
}

// Load commands from JSON file
async function loadCommands() {
  const filename = 'commands.json';
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, true, true);
    console.log(`Using fallback commands defaults`);
    return CONFIG_FALLBACKS.commands;
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
async function loadAsciiArtLibrary(
  filename = `${CONFIG_LOCATION}/asciiArt.txt`
) {
  const fileBaseName = 'asciiArt.txt';
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
        `Successfully loaded ${
          Object.keys(asciiArtLibrary).length
        } art pieces from ${filename}`
      );
    }

    return asciiArtLibrary;
  } catch (error) {
    displayConfigError(fileBaseName, CONFIG_LOCATION, error, false, true);
    console.log(`Using empty ASCII art library as fallback`);
    return {};
  }
}

// Load game configuration from JSON file
async function loadAsciiArtConfig() {
  const filename = 'asciiArtConfig.json';
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, true, true);
    console.log(`Using fallback asciiArtConfig defaults`);
    return CONFIG_FALLBACKS.asciiArtConfig;
  }
}

// Load player data from JSON file
async function loadPlayer() {
  const filename = 'player.json';
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Check if player.json is empty (new game scenario)
    if (Object.keys(data).length === 0) {
      console.log('player.json is empty - initializing from initGame');
      if (initGame && initGame.player) {
        console.log('Using player data from initGame.json');
        return initGame.player;
      } else {
        console.log('initGame.player not available - using fallback');
        return CONFIG_FALLBACKS.player;
      }
    }
    
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, false, true);
    console.log(`Using fallback player defaults`);
    return CONFIG_FALLBACKS.player;
  }
}

// Load game state from JSON file
async function loadGameState() {
  const filename = 'gameState.json';
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, false, true);
    console.log(`Using fallback gameState defaults`);
    return CONFIG_FALLBACKS.gameState;
  }
}

// Load UI configuration from JSON file
async function loadUIConfig() {
  const filename = 'uiConfig.json';
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, true, true);
    console.log(`Using fallback uiConfig defaults`);
    return CONFIG_FALLBACKS.uiConfig;
  }
}

// Load keyboard shortcuts from JSON file
async function loadKeyboardShortcuts() {
  const filename = 'keyboardShortcuts.json';
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, false, true);
    console.log(`Using fallback keyboardShortcuts defaults`);
    return CONFIG_FALLBACKS.keyboardShortcuts;
  }
}

// Load initial game configuration from JSON file
async function loadInitGame() {
  const filename = 'initGame.json';
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, false, true);
    console.log(`Using fallback initGame defaults`);
    return CONFIG_FALLBACKS.initGame;
  }
}

// Load unified game data from JSON file
async function loadGameData() {
  const filename = 'gameData.json';
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, false, true);
    console.log(`Using fallback gameData defaults`);
    return CONFIG_FALLBACKS.gameData;
  }
}

// Load rooms and doors data from JSON file
async function loadRoomsAndDoors() {
  const filename = 'rooms-w-doors.json';
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, true, false);
    console.log(`Failed to load rooms data - game cannot continue`);
    return {};
  }
}

// Load items data from JSON file
async function loadItems() {
  const filename = 'items.json';
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    displayConfigError(filename, CONFIG_LOCATION, error, false, true);
    console.log(`Using empty items data as fallback`);
    return { items: {} };
  }
}

// Process gameData to build active items and commands
function processGameData(gameData) {
  const processed = {
    activeItems: {},
    activeCommands: {},
    activeNPCs: {},
    playerInventory: [],
    startupData: gameData.startup || {}
  };
  
  // Filter active items
  if (gameData.items) {
    Object.entries(gameData.items).forEach(([itemId, item]) => {
      if (item.includeInGame === true) {
        processed.activeItems[itemId] = item;
        
        // Build player inventory from items with startLocation: "player"
        if (item.startLocation === "player") {
          processed.playerInventory.push(itemId);
        }
      }
    });
  }
  
  // Filter active NPCs
  if (gameData.npcs) {
    Object.entries(gameData.npcs).forEach(([npcId, npc]) => {
      if (npc.includeInGame === true) {
        processed.activeNPCs[npcId] = npc;
      }
    });
  }
  
  // Filter active commands (now from gameData.commands instead of globalCommands)
  if (gameData.commands) {
    Object.entries(gameData.commands).forEach(([commandId, command]) => {
      if (command.includeInGame === true) {
        processed.activeCommands[commandId] = command;
      }
    });
  }
  
  console.log(`Processed gameData: ${Object.keys(processed.activeItems).length} active items, ${Object.keys(processed.activeNPCs).length} active NPCs, ${Object.keys(processed.activeCommands).length} active commands`);
  console.log(`Built player inventory: ${processed.playerInventory.join(', ')}`);
  
  return processed;
}

// Validate gameData references
function validateGameData(gameData, processed) {
  const errors = [];
  
  // Check for items with invalid startLocation
  Object.entries(processed.activeItems).forEach(([itemId, item]) => {
    if (item.startLocation && item.startLocation !== "player") {
      // This would be where we check if the room exists, but we don't have rooms loaded yet
      // For now, just log it
      console.log(`Item ${itemId} starts in location: ${item.startLocation}`);
    }
  });
  
  return errors;
}

// ========================================
// === GAME ENGINE CORE FUNCTIONS ===
// ========================================

// Display current room description
function displayRoom(roomId = currentRoom) {
  if (!rooms[roomId]) {
    addToBuffer([
      { text: "ERROR: Room not found!", type: "error" }
    ]);
    return;
  }

  const room = rooms[roomId];

  // Always use first enterText for Phase 1 (ignore visit tracking)
  const enterText = room.enterText?.first || room.lookText || `You are in ${room.name}`;

  addToBuffer([
    { text: enterText, type: "flavor" }
  ]);

  // Show available exits
  const exits = Object.keys(room.exits || {});
  if (exits.length > 0) {
    addToBuffer([
      { text: `Exits: ${exits.join(", ")}`, type: "command" }
    ]);
  } else {
    addToBuffer([
      { text: "No obvious exits.", type: "command" }
    ]);
  }
}

// Check if movement through a door is allowed
function canMoveThrough(door) {
  if (!door) return { allowed: false, message: "There is no exit in that direction." };

  const doorData = doors[door.door];
  if (!doorData) return { allowed: false, message: "There is no exit in that direction." };

  // Check visibility
  if (!doorData.visible) {
    return { allowed: false, message: "There is no exit in that direction." };
  }

  // Check if door is locked
  if (doorData.locked) {
    return { allowed: false, message: "The door is locked." };
  }

  // Check if door is closed
  if (!doorData.open) {
    return { allowed: false, message: "The door is closed." };
  }

  return { allowed: true };
}

// Move player in a direction
function movePlayer(direction) {
  const room = rooms[currentRoom];
  if (!room || !room.exits) {
    addToBuffer([
      { text: "You can't move from here.", type: "error" }
    ]);
    return;
  }

  const exit = room.exits[direction];
  const moveResult = canMoveThrough(exit);

  if (!moveResult.allowed) {
    addToBuffer([
      { text: moveResult.message, type: "error" }
    ]);
    return;
  }

  // Move to new room
  currentRoom = exit.to;
  addToBuffer([
    { text: "", type: "flavor" }  // Blank line before room description
  ]);
  displayRoom(currentRoom);
}

// Show help command
function showHelp() {
  addToBuffer([
    { text: "Available commands:", type: "command" },
    { text: "", type: "flavor" },
    { text: "Movement: north (n), south (s), east (e), west (w)", type: "flavor" },
    { text: "Actions: look (l), inventory (i), help (h)", type: "flavor" },
    { text: "", type: "flavor" }
  ]);
}

// Show inventory
function showInventory() {
  const inventory = player?.core?.inventory || player?.inventory || [];

  if (inventory.length === 0) {
    addToBuffer([
      { text: "Your inventory is empty.", type: "flavor" }
    ]);
  } else {
    addToBuffer([
      { text: "You are carrying:", type: "command" }
    ]);
    inventory.forEach(item => {
      const itemName = typeof item === 'string' ? item : item.display || item.name || 'unknown item';
      addToBuffer([
        { text: `  ${itemName}`, type: "flavor" }
      ]);
    });
  }
}

// Show room description (look command)
function lookAtRoom() {
  const room = rooms[currentRoom];
  if (!room) {
    addToBuffer([
      { text: "You can't see anything here.", type: "error" }
    ]);
    return;
  }

  const lookText = room.lookText || room.enterText?.first || `You are in ${room.name}`;
  addToBuffer([
    { text: lookText, type: "flavor" }
  ]);

  // Show available exits
  const exits = Object.keys(room.exits || {});
  if (exits.length > 0) {
    addToBuffer([
      { text: `Exits: ${exits.join(", ")}`, type: "command" }
    ]);
  }

  // Show items in room (if any)
  const roomItems = Object.values(items).filter(item =>
    item.includeInGame && item.startLocation === currentRoom
  );

  if (roomItems.length > 0) {
    addToBuffer([
      { text: "You see:", type: "command" }
    ]);
    roomItems.forEach(item => {
      addToBuffer([
        { text: `  ${item.display}`, type: "flavor" }
      ]);
    });
  }
}

// ========================================
// === TEXT BUFFER MANAGEMENT ===
// ========================================

// Initialize the buffer with game text  
async function initializeBuffer(processedGameData) {
  // Use gameData.startup.welcomeText if available, otherwise fallback to loadGameText()
  if (processedGameData && processedGameData.startupData && processedGameData.startupData.welcomeText) {
    textBuffer = processedGameData.startupData.welcomeText;
    console.log('Using welcomeText from gameData.json');
  } else if (gameData && gameData.startup && gameData.startup.welcomeText) {
    textBuffer = gameData.startup.welcomeText;
    console.log('Using welcomeText from gameData.json (direct)');
  } else {
    textBuffer = await loadGameText();
    console.log('Fallback to loadGameText()');
  }
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

// Animation speeds loaded from config
let ANIMATION_SPEEDS = {};

// Helper function for animation delays
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Initialize empty display grid (configurable rows × columns)
function initializeDisplayGrid() {
  const rows = asciiArtConfig?.grid?.rows || 32;
  const columns = asciiArtConfig?.grid?.columns || 60;
  displayGrid = [];
  for (let y = 0; y < rows; y++) {
    displayGrid[y] = [];
    for (let x = 0; x < columns; x++) {
      displayGrid[y][x] = " ";
    }
  }
}

// Convert array of strings to 2D character grid
function convertLinesToGrid(lines) {
  const rows = asciiArtConfig?.grid?.rows || 32;
  const columns = asciiArtConfig?.grid?.columns || 60;
  const grid = [];
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    const line = lines[y] || "";
    for (let x = 0; x < columns; x++) {
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
  const rows = asciiArtConfig?.grid?.rows || 32;
  const columns = asciiArtConfig?.grid?.columns || 60;
  let output = "";

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
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
  const rows = asciiArtConfig?.grid?.rows || 32;
  const columns = asciiArtConfig?.grid?.columns || 60;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      displayGrid[y][x] = sourceGrid[y][x];
    }
  }
  refreshDisplay();
}

// Character-by-character fade in
async function fadeInEffect(sourceGrid, speed = "fast") {
  const delay = ANIMATION_SPEEDS[speed] || ANIMATION_SPEEDS.fast || 1;
  const rows = asciiArtConfig?.grid?.rows || 32;
  const columns = asciiArtConfig?.grid?.columns || 60;

  // Dynamic batch sizes based on speed from config
  const batchSizes = asciiArtConfig?.animation?.batchSizes?.fadeIn || {
    slow: 3,
    medium: 10,
    fast: 30,
  };
  const CHARS_PER_UPDATE = batchSizes[speed] || batchSizes.fast || 30;

  let charCount = 0;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
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
  const baseDelay = ANIMATION_SPEEDS[speed] || ANIMATION_SPEEDS.fast || 1;
  const multiplier = asciiArtConfig?.animation?.multipliers?.typewriter || 10;
  const delay = baseDelay * multiplier;
  const rows = asciiArtConfig?.grid?.rows || 32;
  const columns = asciiArtConfig?.grid?.columns || 60;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      displayGrid[y][x] = sourceGrid[y][x];
    }
    refreshDisplay();
    await sleep(delay);
  }
}

// Column-by-column vertical sweep
async function verticalSweepEffect(sourceGrid, speed = "fast") {
  const baseDelay = ANIMATION_SPEEDS[speed] || ANIMATION_SPEEDS.fast || 1;
  const multiplier = asciiArtConfig?.animation?.multipliers?.verticalSweep || 5;
  const delay = baseDelay * multiplier;
  const rows = asciiArtConfig?.grid?.rows || 32;
  const columns = asciiArtConfig?.grid?.columns || 60;

  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      displayGrid[y][x] = sourceGrid[y][x];
    }
    refreshDisplay();
    await sleep(delay);
  }
}

// Random scatter effect
async function randomScatterEffect(sourceGrid, speed = "fast") {
  const delay = ANIMATION_SPEEDS[speed] || ANIMATION_SPEEDS.fast || 1;
  const rows = asciiArtConfig?.grid?.rows || 32;
  const columns = asciiArtConfig?.grid?.columns || 60;

  // Dynamic batch sizes based on speed from config
  const batchSizes = asciiArtConfig?.animation?.batchSizes?.randomScatter || {
    slow: 5,
    medium: 15,
    fast: 40,
  };
  const CHARS_PER_UPDATE = batchSizes[speed] || batchSizes.fast || 40;

  const positions = [];

  // Create list of all positions
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
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

// ASCII art display function (now uses initGame startup config)
async function updateAsciiArtDisplay() {
  // Initialize blank display grid
  initializeDisplayGrid();

  // Refresh to show blank display
  refreshDisplay();

  // Use gameData.startup.asciiArt if available, otherwise fallback to asciiArtConfig defaults
  let startupDelay, artName, effect, speed;
  
  if (gameData && gameData.startup && gameData.startup.asciiArt) {
    startupDelay = gameData.startup.asciiArt.delay || 500;
    artName = gameData.startup.asciiArt.name || "CASTLE";
    effect = gameData.startup.asciiArt.effect || "fadeIn";
    speed = gameData.startup.asciiArt.speed || "fast";
    console.log('Using ASCII art settings from gameData.json');
  } else {
    startupDelay = asciiArtConfig?.defaults?.startupDelay || 500;
    artName = asciiArtConfig?.defaults?.asciiArt || "CASTLE";
    effect = asciiArtConfig?.defaults?.effect || "fadeIn";
    speed = asciiArtConfig?.defaults?.speed || "fast";
    console.log('Fallback to ASCII art settings from asciiArtConfig');
  }

  await sleep(startupDelay);
  await displayAsciiArt(artName, effect, speed);
}

function updateGameStatus() {
  const statusDiv = document.querySelector(".status");

  // Generate commands section from UI config
  const commandsTitle = uiConfig?.statusPanel?.commands?.title || "COMMANDS:";
  const commandsList = uiConfig?.statusPanel?.commands?.list || [
    "(h)elp (l)ook (i)nventory",
    "(n)orth (s)outh (e)ast (w)est",
  ];

  // Generate inventory section from player data
  const inventoryTitle =
    uiConfig?.statusPanel?.inventory?.title || "INVENTORY:";
  const inventory = player?.core?.inventory || player?.inventory || [];

  // Generate status section from player data
  const statusTitle = uiConfig?.statusPanel?.status?.title || "STATUS:";
  const coreStats = player?.core || {};
  const gameStats = player?.gameStats || player?.stats || {};

  let inventoryHTML = "";
  inventory.forEach((item) => {
    // Handle string items (simple format)
    if (typeof item === 'string') {
      inventoryHTML += `<div>${item}</div>`;
    }
    // Handle object items (complex format with properties)
    else if (item.quantity && item.unit) {
      inventoryHTML += `<div>${item.name} (${item.quantity} ${item.unit})</div>`;
    } else if (item.quantity && item.quantity > 1) {
      inventoryHTML += `<div>${item.name} (${item.quantity})</div>`;
    } else if (item.status) {
      inventoryHTML += `<div>${item.name} (${item.status})</div>`;
    } else {
      inventoryHTML += `<div>${item.name}</div>`;
    }
  });

  let statsHTML = "";
  
  // Core stats (score, health, etc.)
  if (coreStats.score !== undefined) {
    statsHTML += `<div>Score: ${coreStats.score}</div>`;
  }
  if (coreStats.health !== undefined) {
    statsHTML += `<div>Health: ${coreStats.health}</div>`;
  }
  
  // Game-specific stats (treats, houses, etc.)
  if (gameStats.treats) {
    statsHTML += `<div>Treats: ${gameStats.treats.current}/${gameStats.treats.max}</div>`;
  }
  if (gameStats.houses) {
    statsHTML += `<div>Houses: ${gameStats.houses.current}/${gameStats.houses.max}</div>`;
  }

  statusDiv.innerHTML = `
    <div class="status-section">
      <div class="status-title">${statusTitle}</div>
      ${statsHTML}
    </div>
    
    <div class="status-section">
      <div class="status-title">${inventoryTitle}</div>
      ${inventoryHTML}
    </div>
    
    <div class="status-section">
      <div class="status-title">${commandsTitle}</div>
      ${commandsList.map((cmd) => `<div>${cmd}</div>`).join("")}
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
      const cmd = commands[result.command];

      // Handle different command actions
      switch (cmd.action) {
        case "move_north":
          movePlayer("north");
          break;
        case "move_south":
          movePlayer("south");
          break;
        case "move_east":
          movePlayer("east");
          break;
        case "move_west":
          movePlayer("west");
          break;
        case "examine_room":
          lookAtRoom();
          break;
        case "show_inventory":
          showInventory();
          break;
        case "show_help":
          showHelp();
          break;
        default:
          addToBuffer([
            { text: `Unknown action: ${cmd.action}`, type: "error" }
          ]);
      }
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

    // Check if the command is marked as system type (equivalent to stateless)
    if (
      actualCommand &&
      commands[actualCommand] &&
      commands[actualCommand].type === "system"
    ) {
      return; // Don't add duplicate system command
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
  console.log(`Starting game initialization with CONFIG_LOCATION: ${CONFIG_LOCATION}`);

  try {
    // Load all configuration files first
    console.log('Loading configuration files...');
    asciiArtConfig = await loadAsciiArtConfig();
    gameData = await loadGameData();
    uiConfig = await loadUIConfig();

    // Load commands from separate commands.json file
    const commandsData = await loadCommands();
    commands = commandsData.commands || {};

    // Load game world data
    const roomsData = await loadRoomsAndDoors();
    rooms = roomsData.rooms || {};
    doors = roomsData.doors || {};

    const itemsData = await loadItems();
    items = itemsData.items || {};

    // Set starting room from gameData
    currentRoom = gameData.startup?.room || "STREET-01";

    // Note: player data built from gameData, but check for existing save
    const savedPlayer = await loadPlayer();
    gameState = await loadGameState();
    keyboardShortcuts = await loadKeyboardShortcuts();
    
    // Process gameData to get active items and commands
    const processedGameData = processGameData(gameData);
    
    // Create runtime player data from gameData.startup.playerStats and items
    const runtimePlayerData = {
      core: {
        score: gameData.startup?.playerStats?.score || 0,
        health: gameData.startup?.playerStats?.health || 100,
        inventory: processedGameData.playerInventory,
        currentRoom: gameData.startup?.playerStats?.currentRoom || "STREET-01",
        visitedRooms: gameData.startup?.playerStats?.visitedRooms || []
      },
      gameStats: {
        treats: gameData.startup?.playerStats?.treats || {current: 0, max: 40},
        houses: gameData.startup?.playerStats?.houses || {current: 0, max: 12}
      }
    };
    
    // Use runtime data if player.json is empty (new game) or use saved data (continue game)
    if (Object.keys(savedPlayer).length === 0) {
      player = runtimePlayerData;
      console.log('New game: Built player data from gameData.startup:', processedGameData.playerInventory);
    } else {
      player = savedPlayer;
      console.log('Continue game: Using saved player data');
    }

    // Validate critical configurations
    const configsValid = checkCriticalConfigs();
    
    if (!configsValid) {
      console.error('Critical configuration validation failed - game cannot start');
      // Initialize buffer to show error messages, but disable input
      await initializeBuffer();
      
      // Disable the input field
      const commandInput = document.getElementById("commandInput");
      if (commandInput) {
        commandInput.disabled = true;
        commandInput.placeholder = "Input disabled due to configuration errors";
      }
      return; // Exit early - do not continue initialization
    }

    // Set up animation speeds from config
    ANIMATION_SPEEDS = asciiArtConfig?.animation?.speeds || {
      slow: 8,
      medium: 3,
      fast: 1,
    };

    // Load ASCII art library
    await loadAsciiArtLibrary();

    console.log('Initializing game systems...');
    await initializeBuffer(processedGameData);
    initializeAsciiArt();
    initializeStatusInfo();
    initializeInput();

    // Show starting room after welcome text
    addToBuffer([
      { text: "", type: "flavor" }
    ]);
    displayRoom(currentRoom);

    console.log('Game initialization completed successfully');

    // Add keyboard event listener using config-based shortcuts
    document.addEventListener("keydown", async function (e) {
      // Handle navigation shortcuts
      const navShortcuts = keyboardShortcuts?.navigation || [];
      for (const shortcut of navShortcuts) {
        if (e.key === shortcut.key) {
          if (shortcut.preventDefault) e.preventDefault();
          if (shortcut.action === "scrollUp") scrollUp();
          else if (shortcut.action === "scrollDown") scrollDown();
          return;
        }
      }

      // Handle ASCII art shortcuts
      const artShortcuts = keyboardShortcuts?.asciiArt || [];
      for (const shortcut of artShortcuts) {
        let keyMatches = false;

        // Handle Alt+ combinations
        if (shortcut.key.startsWith("Alt+")) {
          const baseKey = shortcut.key.replace("Alt+", "");
          keyMatches = e.altKey && e.key === baseKey;
        } else {
          // Handle single keys (case insensitive)
          keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();
        }

        if (keyMatches) {
          if (shortcut.preventDefault) e.preventDefault();

          if (shortcut.action === "blank") {
            initializeDisplayGrid();
            refreshDisplay();
          } else if (shortcut.action === "castle") {
            await updateAsciiArtDisplay();
          } else if (shortcut.art) {
            await displayAsciiArt(shortcut.art, shortcut.effect, shortcut.speed);
          }
          return;
        }
      }
    });
    
  } catch (error) {
    console.error('Fatal error during game initialization:', error);
    
    // Try to show error in game if possible
    if (typeof addToBuffer !== 'undefined') {
      addToBuffer([
        { text: "FATAL INITIALIZATION ERROR", type: "error" },
        { text: `Error: ${error.message}`, type: "error" },
        { text: "The game could not start properly.", type: "error" },
        { text: "Please check the console for detailed error information.", type: "error" }
      ]);
    }
    
    // Disable input
    const commandInput = document.getElementById("commandInput");
    if (commandInput) {
      commandInput.disabled = true;
      commandInput.placeholder = "Input disabled due to fatal error";
    }
  }
});
