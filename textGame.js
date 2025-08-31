// Text Buffer System
let textBuffer = [];

// Command History System
let commandHistory = [];
let historyIndex = -1;

// Load sample playthrough from JSON file
async function loadSamplePlaythrough() {
  try {
    const response = await fetch('samplePlaythrough.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading sample playthrough:', error);
    // Fallback to empty array if file can't be loaded
    return [];
  }
}

// Initialize the buffer with sample game text
async function initializeBuffer() {
  textBuffer = await loadSamplePlaythrough();
  updateDisplay();
}

// Update the text display (now shows all buffer content)
function updateDisplay() {
  const textDiv = document.querySelector(".text");
  
  // Convert buffer objects to HTML with appropriate classes
  const htmlLines = textBuffer.map(entry => {
    if (typeof entry === 'string') {
      // Handle legacy string entries
      return `<span class="flavor-text">${entry}</span>`;
    }
    
    let className;
    switch(entry.type) {
      case 'prompt':
        className = 'prompt-echo';
        break;
      case 'command':
        className = 'command-output';
        break;
      case 'error':
        className = 'error-text';
        break;
      case 'flavor':
      default:
        className = 'flavor-text';
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
  textDiv.scrollTop -= lineHeight * 4; // Scroll up 4 lines
}

// Scroll down (PAGE DOWN) - now uses native scrolling
function scrollDown() {
  const textDiv = document.querySelector(".text");
  const lineHeight = parseInt(getComputedStyle(textDiv).lineHeight);
  textDiv.scrollTop += lineHeight * 4; // Scroll down 4 lines
}

// Add text to buffer (for commands and responses)
function addToBuffer(text, type = 'flavor') {
  if (Array.isArray(text)) {
    // Check if array items are already objects with text and type
    if (text.length > 0 && typeof text[0] === 'object' && text[0].text !== undefined) {
      // Array of properly formatted objects, add directly
      textBuffer.push(...text);
    } else {
      // Array of strings, convert to objects
      const textObjects = text.map(line => ({
        text: line,
        type: type
      }));
      textBuffer.push(...textObjects);
    }
  } else if (typeof text === 'object' && text.text !== undefined) {
    // Already an object with text and type
    textBuffer.push(text);
  } else {
    // Single string
    textBuffer.push({
      text: text,
      type: type
    });
  }

  // Update display with new content
  updateDisplay();
}

// Add command echo to buffer
function echoCommand(command) {
  addToBuffer([
    {text: "", type: "flavor"},
    {text: "> " + command, type: "prompt"},
    {text: "", type: "flavor"}
  ]);
}

// ASCII Art Library
const asciiArt = {
  pumpkin: `   ___
  /o o\\
 ( > < )
  \\___/
    |`,
  
  door: ` _______
|[]   []|
|   __  |
|  |  | |
|__|__|_|
 [_____]`,

  bat: `  /\\_/\\
 (  -.- )
  o_/"\\`,

  house: ` ___[]___
|  ___  |
| |   | |
| |___| |
|_______|`
};

// Status display functions
function updateStatusArt(artType = 'pumpkin') {
  const statusArtDiv = document.querySelector('.status-art');
  const artClass = `art-${artType}`;
  
  statusArtDiv.innerHTML = `<div class="ascii-art ${artClass}">${asciiArt[artType]}</div>`;
}

function updateStatusInfo() {
  const statusInfoDiv = document.querySelector('.status-info');
  
  statusInfoDiv.innerHTML = `
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

// Command definitions (hardcoded for testing)
const commands = {
  help: {
    shortcuts: ['h'],
    response: [
      {text: "Available commands:", type: "command"},
      {text: "HELP or H - Show this help", type: "command"},
      {text: "LOOK or L - Look around", type: "command"},
      {text: "INVENTORY or I - Check your items", type: "command"},
      {text: "NORTH/N, SOUTH/S, EAST/E, WEST/W - Move", type: "command"}
    ]
  },
  look: {
    shortcuts: ['l'],
    response: [
      {text: "You are standing on a dark street corner. Halloween", type: "flavor"},
      {text: "decorations sway in the autumn breeze. Jack-o'-lanterns", type: "flavor"},
      {text: "grin from nearby porches. You can go NORTH to the", type: "flavor"},
      {text: "mansion, EAST or WEST down the street.", type: "flavor"}
    ]
  },
  inventory: {
    shortcuts: ['i'],
    response: [
      {text: "You are carrying:", type: "command"},
      {text: "- A canvas trick-or-treat bag (3 treats)", type: "command"},
      {text: "- A plastic sword", type: "command"},
      {text: "- A flashlight (on)", type: "command"},
      {text: "- Fake vampire teeth", type: "command"}
    ]
  },
  north: {
    shortcuts: ['n'],
    response: [
      {text: "You approach the iron gate. It's locked tight.", type: "flavor"},
      {text: "The Victorian mansion looms behind it, dark and", type: "flavor"},
      {text: "foreboding.", type: "flavor"}
    ]
  },
  south: {
    shortcuts: ['s'],
    response: [
      {text: "You head back down the street toward where you", type: "flavor"},
      {text: "started your trick-or-treating adventure.", type: "flavor"}
    ]
  },
  east: {
    shortcuts: ['e'],
    response: [
      {text: "You walk east down Elm Street. More houses with", type: "flavor"},
      {text: "glowing windows line the sidewalk. The wind picks", type: "flavor"},
      {text: "up, rustling the fallen leaves.", type: "flavor"}
    ]
  },
  west: {
    shortcuts: ['w'],
    response: [
      {text: "You head west. The streetlights cast long shadows", type: "flavor"},
      {text: "as you walk. You can smell woodsmoke from nearby", type: "flavor"},
      {text: "chimneys.", type: "flavor"}
    ]
  }
};

// Smart command matching function
function findCommand(input) {
  const cmd = input.toLowerCase().trim();
  
  // Check for exact matches first (including full command names)
  if (commands[cmd]) {
    return { type: 'exact', command: cmd };
  }
  
  // Check single-letter shortcuts (priority shortcuts)
  for (const [commandName, commandData] of Object.entries(commands)) {
    if (commandData.shortcuts && commandData.shortcuts.includes(cmd)) {
      return { type: 'shortcut', command: commandName };
    }
  }
  
  // Check prefix matches for longer inputs (2+ characters)
  if (cmd.length >= 2) {
    const matches = Object.keys(commands).filter(commandName => 
      commandName.startsWith(cmd)
    );
    
    if (matches.length === 1) {
      return { type: 'prefix', command: matches[0] };
    } else if (matches.length > 1) {
      return { type: 'ambiguous', matches: matches };
    }
  }
  
  return { type: 'unknown' };
}

// Command processing with smart matching
function processCommand(command) {
  const result = findCommand(command);
  let isValid = false;
  
  switch (result.type) {
    case 'exact':
    case 'shortcut':
    case 'prefix':
      addToBuffer(commands[result.command].response);
      isValid = true;
      break;
      
    case 'ambiguous':
      addToBuffer([
        {text: `Did you mean: ${result.matches.join(', ')}?`, type: "error"}
      ]);
      isValid = false;
      break;
      
    case 'unknown':
    default:
      addToBuffer([
        {text: "I don't understand that command. Type HELP for", type: "error"},
        {text: "a list of available commands.", type: "error"}
      ]);
      isValid = false;
      break;
  }
  
  return isValid;
}

// Navigate command history
function navigateHistory(direction, input) {
  if (commandHistory.length === 0) return;
  
  if (direction === 'up') {
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      input.value = commandHistory[commandHistory.length - 1 - historyIndex];
    }
  } else if (direction === 'down') {
    if (historyIndex > 0) {
      historyIndex--;
      input.value = commandHistory[commandHistory.length - 1 - historyIndex];
    } else if (historyIndex === 0) {
      historyIndex = -1;
      input.value = '';
    }
  }
}

// Add command to history (with intelligent filtering)
function addToHistory(command, wasValid) {
  // Don't add invalid commands to history
  if (!wasValid) return;
  
  const lastCommand = commandHistory[commandHistory.length - 1];
  
  // Don't add duplicate stateless commands (commands that don't change game state)
  const statelessCommands = ['help', 'h', 'inventory', 'i', 'look', 'l'];
  const normalizedCommand = command.toLowerCase().trim();
  const normalizedLast = lastCommand ? lastCommand.toLowerCase().trim() : '';
  
  // Check if this is a duplicate stateless command
  if (lastCommand && normalizedCommand === normalizedLast) {
    // Find the actual command name to check if it's stateless
    const result = findCommand(command);
    let actualCommand = '';
    
    if (result.type === 'exact') {
      actualCommand = result.command;
    } else if (result.type === 'shortcut' || result.type === 'prefix') {
      actualCommand = result.command;
    }
    
    if (statelessCommands.includes(actualCommand) || statelessCommands.includes(normalizedCommand)) {
      return; // Don't add duplicate stateless command
    }
  }
  
  commandHistory.push(command);
  historyIndex = -1; // Reset history navigation
}

// Handle input from the command line
function handleInput(event) {
  const input = event.target;
  
  if (event.key === 'Enter') {
    const command = input.value.trim();
    
    if (command) {
      // Echo the command to the text buffer
      echoCommand(command);
      
      // Process the command and get validity
      const wasValid = processCommand(command);
      
      // Add to history buffer only if valid and not duplicate stateless
      addToHistory(command, wasValid);
      
      // Clear the input
      input.value = '';
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    navigateHistory('up', input);
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    navigateHistory('down', input);
  }
}

// Initialize status display
function initializeStatus() {
  updateStatusArt('pumpkin');
  updateStatusInfo();
}

// Initialize input system
function initializeInput() {
  const commandInput = document.getElementById('commandInput');
  commandInput.addEventListener('keydown', handleInput);
  
  // Focus the input field
  commandInput.focus();
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", async function () {
  await initializeBuffer();
  initializeStatus();
  initializeInput();

  // Add keyboard event listener for PAGE UP/DOWN
  document.addEventListener("keydown", function (e) {
    if (e.key === "PageUp") {
      e.preventDefault();
      scrollUp();
    } else if (e.key === "PageDown") {
      e.preventDefault();
      scrollDown();
    }
  });
});
