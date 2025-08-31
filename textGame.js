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

// Initialize when page loads
document.addEventListener("DOMContentLoaded", async function () {
  await initializeBuffer();

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
