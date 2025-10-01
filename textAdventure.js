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

// Configuration data loaded from JSON files
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
  
  uiConfig: {
    statusPanel: {
      commands: {
        title: "COMMANDS:",
        list: [
          "(h)elp (l)ook (i)nventory",
          "(t)ake e(x)amine (d)rop",
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
    },
    take: {
      type: "action",
      shortcuts: ["get", "grab", "pick"],
      action: "take_item"
    },
    examine: {
      type: "action",
      shortcuts: ["x", "ex"],
      action: "examine_item"
    },
    drop: {
      type: "action",
      shortcuts: ["put", "place"],
      action: "drop_item"
    }
  },
  
  player: {
    core: {
      score: 0,
      health: 100,
      inventory: [],
      currentRoom: "STREET-01",
      visitedRooms: []
    },
    gameStats: {
      treats: { current: 0, max: 40 },
      houses: { current: 0, max: 12 }
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
    ]
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

// Load scavenger items data from JSON file
async function loadScavengerItems() {
  const filename = 'scavengerItems.json';
  try {
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);
    return data;
  } catch (error) {
    console.log(`No scavengerItems.json found - continuing without scavenger items`);
    return { scavengerItems: {} };
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
        
        // Build player inventory from items with location: "player"
        if (item.location === "player") {
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
  
  // Check for items with invalid location
  Object.entries(processed.activeItems).forEach(([itemId, item]) => {
    if (item.location && item.location !== "player") {
      // This would be where we check if the room exists, but we don't have rooms loaded yet
      // For now, just log it
      console.log(`Item ${itemId} starts in location: ${item.location}`);
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

  // Show items in room (if any)
  const roomItems = Object.values(items).filter(item =>
    item.includeInGame && item.location === currentRoom && item.visible
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
    { text: "Actions: look (l), inventory (i), help (h), take (get), examine (x), drop (put)", type: "flavor" },
    { text: "", type: "flavor" }
  ]);
}

// Show inventory
function showInventory() {
  // Get items from INVENTORY room
  const inventoryItems = Object.values(items).filter(item =>
    item.includeInGame && item.location === "INVENTORY"
  );

  if (inventoryItems.length === 0) {
    addToBuffer([
      { text: "Your inventory is empty.", type: "flavor" }
    ]);
  } else {
    addToBuffer([
      { text: "You are carrying:", type: "command" }
    ]);
    inventoryItems.forEach(item => {
      const points = item.points || 0;
      addToBuffer([
        { text: `  ${item.display} (+${points})`, type: "flavor" }
      ]);
    });
  }
}

// Handle take/get command
function handleTakeCommand(command) {
  // Extract the item name - get everything after the command, lowercase, strip spaces
  const input = command.toLowerCase().trim();
  const firstSpace = input.indexOf(' ');

  if (firstSpace === -1) {
    addToBuffer([
      { text: "Take what?", type: "error" }
    ]);
    return;
  }

  const remainder = input.substring(firstSpace + 1).trim();
  const targetTypedName = remainder.replace(/\s+/g, ''); // Strip all spaces

  // Find item in current room with matching typedNames
  const roomItems = Object.entries(items).filter(([key, item]) =>
    item.includeInGame &&
    item.location === currentRoom &&
    item.visible &&
    !item.locked &&
    item.typedNames?.includes(targetTypedName) &&
    item.actions?.take?.addToInventory === true
  );

  if (roomItems.length === 0) {
    addToBuffer([
      { text: `You don't see any "${targetTypedName}" here that you can take.`, type: "error" }
    ]);
    return;
  }

  // Take the first matching item
  const [itemKey, item] = roomItems[0];
  const takeAction = item.actions.take;

  // Show response message
  addToBuffer([
    { text: takeAction.response || `You pick up the ${item.display}.`, type: "flavor" }
  ]);

  // Move item to inventory
  item.location = "INVENTORY";

  // Mark as found if specified (for scavenger hunt)
  if (takeAction.markAsFound) {
    item.found = true;
  }

  // Update the status panel to show new inventory
  updateGameStatus();
}

// Handle drop/put command
function handleDropCommand(command) {
  // Extract the item name - get everything after the command, lowercase, strip spaces
  const input = command.toLowerCase().trim();
  const firstSpace = input.indexOf(' ');

  if (firstSpace === -1) {
    addToBuffer([
      { text: "Drop what?", type: "error" }
    ]);
    return;
  }

  const remainder = input.substring(firstSpace + 1).trim();
  const targetTypedName = remainder.replace(/\s+/g, ''); // Strip all spaces

  // Find item in inventory with matching typedNames
  const inventoryItems = Object.entries(items).filter(([key, item]) =>
    item.includeInGame &&
    item.location === "INVENTORY" &&
    item.typedNames?.includes(targetTypedName) &&
    item.actions?.take  // Can only drop items that are portable (have take action)
  );

  if (inventoryItems.length === 0) {
    addToBuffer([
      { text: `You're not carrying any "${targetTypedName}".`, type: "error" }
    ]);
    return;
  }

  // Drop the first matching item
  const [itemKey, item] = inventoryItems[0];

  // Show response message
  addToBuffer([
    { text: `You drop the ${item.display}.`, type: "flavor" }
  ]);

  // Move item from inventory to current room
  item.location = currentRoom;

  // Update the status panel to show new inventory
  updateGameStatus();
}

// Handle examine command
function handleExamineCommand(command) {
  // Extract the item name - get everything after the command, lowercase, strip spaces
  const input = command.toLowerCase().trim();
  const firstSpace = input.indexOf(' ');

  if (firstSpace === -1) {
    addToBuffer([
      { text: "Examine what?", type: "error" }
    ]);
    return;
  }

  const remainder = input.substring(firstSpace + 1).trim();
  const targetTypedName = remainder.replace(/\s+/g, ''); // Strip all spaces

  // Find item by typedNames in either inventory or current room
  const allItems = Object.entries(items).filter(([key, item]) =>
    item.includeInGame && item.typedNames?.includes(targetTypedName)
  );

  if (allItems.length === 0) {
    addToBuffer([
      { text: `You don't see any "${targetTypedName}" here.`, type: "error" }
    ]);
    return;
  }

  const [itemKey, item] = allItems[0];

  // Check if item has examine action
  if (!item.actions || !item.actions.examine) {
    addToBuffer([
      { text: `You can't examine the ${item.display}.`, type: "error" }
    ]);
    return;
  }

  // Determine examine rules based on whether item has take action
  if (item.actions.take) {
    // Item has take action - must be in inventory to examine
    if (item.location === "INVENTORY") {
      addToBuffer([
        { text: `${item.display}: ${item.actions.examine}`, type: "flavor" }
      ]);
    } else {
      addToBuffer([
        { text: `You need to pick up the ${item.display} first to examine it closely.`, type: "error" }
      ]);
    }
  } else {
    // Item doesn't have take action - can examine if visible in current room
    if (item.location === currentRoom && item.visible && !item.locked) {
      addToBuffer([
        { text: `${item.display}: ${item.actions.examine}`, type: "flavor" }
      ]);
    } else {
      addToBuffer([
        { text: `You don't see any "${targetTypedName}" here.`, type: "error" }
      ]);
    }
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
    item.includeInGame && item.location === currentRoom && item.visible
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
// === STATUS FUNCTIONS ===
// ========================================


function updateGameStatus() {
  const statusDiv = document.querySelector(".status");

  // Generate commands section from UI config
  const commandsTitle = uiConfig?.statusPanel?.commands?.title || "COMMANDS:";
  const commandsList = uiConfig?.statusPanel?.commands?.list || [
    "(h)elp (l)ook (i)nventory",
    "(n)orth (s)outh (e)ast (w)est",
  ];

  // Get inventory items from INVENTORY room
  const inventory = Object.values(items).filter(item =>
    item.includeInGame && item.location === "INVENTORY"
  );

  // Count treats (non-scavenger items) - limit display to 20
  const treatsCount = inventory.filter(item => !item.isScavengerItem).length;
  const displayCount = Math.min(treatsCount, 20);

  // Generate status section
  const statusTitle = uiConfig?.statusPanel?.status?.title || "SCORE:";

  let statsHTML = "";
  statsHTML += `<div>Treats: ${displayCount} / 20</div>`;

  statusDiv.innerHTML = `
    <div class="status-section">
      <div class="status-title">${statusTitle}</div>
      ${statsHTML}
    </div>

    <div class="status-section">
      <div class="status-title">${commandsTitle}</div>
      ${commandsList.map((cmd) => `<div>${cmd}</div>`).join("")}
    </div>
  `;
}

// Initialize scavenger grid display
function initScavengerGrid() {
  const scavengerDiv = document.querySelector(".scavenger");

  // Create 9 squares for the 3x3 grid
  let gridHTML = "";
  for (let i = 0; i < 9; i++) {
    gridHTML += `
      <div class="scavenger-square">
        <img src="assets/scavenger/orange90x90.png" alt="Test image ${i + 1}">
      </div>
    `;
  }

  scavengerDiv.innerHTML = gridHTML;
}

// ========================================
// === COMMAND PROCESSING ===
// ========================================

// Smart command matching function
function findCommand(input) {
  const fullInput = input.toLowerCase().trim();
  const cmd = fullInput.split(/\s+/)[0]; // Extract first word for command matching

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
        case "take_item":
          handleTakeCommand(command);
          break;
        case "examine_item":
          handleExamineCommand(command);
          break;
        case "drop_item":
          handleDropCommand(command);
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

    // Load and merge scavenger items
    const scavengerData = await loadScavengerItems();
    const scavengerItems = scavengerData.scavengerItems || {};

    // Mark scavenger items for scoring purposes
    Object.values(scavengerItems).forEach(item => {
      item.isScavengerItem = true;
    });

    // Merge scavenger items into main items object
    items = { ...items, ...scavengerItems };
    console.log(`Merged ${Object.keys(scavengerItems).length} scavenger items into main items list`);

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



    console.log('Initializing game systems...');
    await initializeBuffer(processedGameData);
    initializeStatusInfo();
    initScavengerGrid();
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
