// Text Buffer System
let textBuffer = [];

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
    // If it's an array of strings, convert to objects
    const textObjects = text.map(line => ({
      text: line,
      type: type
    }));
    textBuffer.push(...textObjects);
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

// Initialize status display
function initializeStatus() {
  updateStatusArt('pumpkin');
  updateStatusInfo();
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", async function () {
  await initializeBuffer();
  initializeStatus();

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
