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

// Update the DOM from display grid (identical to main game)
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

// Validate art piece during loading
function validateArtPieceDuringLoad(name, metadata, rows) {
  const issues = [];
  
  // Check metadata
  if (metadata.rows !== '32') {
    issues.push(`Metadata rows=${metadata.rows}, expected 32`);
  }
  if (metadata.charsPerLine !== '60') {
    issues.push(`Metadata charsPerLine=${metadata.charsPerLine}, expected 60`);
  }
  
  // Check actual row count
  if (rows.length !== 32) {
    issues.push(`Actual rows: ${rows.length}, expected 32`);
  }
  
  // Check each row
  rows.forEach((row, i) => {
    if (row.length !== 60) {
      issues.push(`Row ${i}: ${row.length} chars, expected 60`);
    }
    
    // Check characters are ASCII 32-126
    for (let j = 0; j < row.length; j++) {
      const code = row.charCodeAt(j);
      if (code < 32 || code > 126) {
        issues.push(`Row ${i}, pos ${j}: char code ${code} not in ASCII 32-126`);
      }
    }
  });
  
  return issues;
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
  let inMultiLineComment = false;
  
  for (const rawLine of lines) {
    lineIndex++;
    
    // Clean any trailing/leading whitespace and control characters
    const line = rawLine.trim();
    
    // Handle multi-line comments
    if (line.includes('/*')) {
      inMultiLineComment = true;
      // Check if comment ends on same line
      if (line.includes('*/') && line.indexOf('*/') > line.indexOf('/*')) {
        inMultiLineComment = false;
      }
      continue;
    }
    
    if (inMultiLineComment) {
      if (line.includes('*/')) {
        inMultiLineComment = false;
      }
      continue;
    }
    
    // Skip empty lines
    if (line === '') {
      // If we have current art, save it
      if (currentArt) {
        // Validate during load
        const issues = validateArtPieceDuringLoad(currentArt, currentMetadata, currentRows);
        if (issues.length > 0) {
          loadValidationIssues[currentArt] = issues;
        }
        
        // Build art piece in same format as JSON
        artPieces[currentArt] = {
          color: currentMetadata.color || 'white',
          textSize: parseInt(currentMetadata.size) || 8,
          rows: [...currentRows] // Copy the rows
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
    
    // Skip single-line comment lines (lines starting with //)
    if (line.startsWith('//')) {
      continue;
    }
    
    // Parse metadata lines (must contain = and not start with quote)
    if (line.includes('=') && !line.startsWith('"')) {
      const [key, value] = line.split('=', 2);
      if (key === 'name') {
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
    console.warn(`Unrecognized line format at line ${lineIndex}: "${line}" (length: ${line.length})`);
  }
  
  // Handle last art piece if file doesn't end with blank line
  if (currentArt) {
    const issues = validateArtPieceDuringLoad(currentArt, currentMetadata, currentRows);
    if (issues.length > 0) {
      loadValidationIssues[currentArt] = issues;
    }
    
    artPieces[currentArt] = {
      color: currentMetadata.color || 'white',
      textSize: parseInt(currentMetadata.size) || 8,
      rows: [...currentRows]
    };
    
    // Store metadata for display
    fileMetadata[currentArt] = { ...currentMetadata };
  }
  
  return { artPieces, loadValidationIssues, fileMetadata };
}

// Store current file info for metadata display
let currentFileMetadata = {};

// Load ASCII art library from specified text file
async function loadAsciiArtLibrary(filename = "asciiArt.txt") {
  try {
    const response = await fetch(filename);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const textContent = await response.text();
    const parseResult = parseAsciiArtText(textContent);
    
    asciiArtLibrary = parseResult.artPieces;
    currentFileMetadata = parseResult.fileMetadata || {};
    
    // Report load-time validation issues
    const issueCount = Object.keys(parseResult.loadValidationIssues).length;
    if (issueCount > 0) {
      console.warn("Load-time validation issues:", parseResult.loadValidationIssues);
      updateStatus(`Loaded ${Object.keys(asciiArtLibrary).length} art pieces from ${filename} (${issueCount} with issues)`);
    } else {
      updateStatus(`Loaded ${Object.keys(asciiArtLibrary).length} art pieces from ${filename}`);
    }
    
    // Store validation issues for display
    window.loadTimeValidationIssues = parseResult.loadValidationIssues;
    
    return asciiArtLibrary;
  } catch (error) {
    console.error("Error loading ASCII art library:", error);
    updateStatus(`Error loading ${filename}: ${error.message}`);
    return {};
  }
}

// Comprehensive file validation with line numbers
function validateAsciiArtFile(textContent) {
  const lines = textContent.split(/\r?\n|\r/);
  let artPieceCount = 0;
  let currentArt = null;
  let currentMetadata = {};
  let currentRows = [];
  let errors = [];
  let warnings = [];
  let artPieces = [];
  let inMultiLineComment = false;
  
  const requiredMetadata = ['name', 'color', 'size', 'rows', 'charsPerLine', 'charsPermitted'];
  
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const trimmedLine = line.trim();
    const lineNum = lineIndex + 1;
    
    // Handle multi-line comments
    if (trimmedLine.includes('/*')) {
      inMultiLineComment = true;
      // Check if comment ends on same line
      if (trimmedLine.includes('*/') && trimmedLine.indexOf('*/') > trimmedLine.indexOf('/*')) {
        inMultiLineComment = false;
      }
      continue;
    }
    
    if (inMultiLineComment) {
      if (trimmedLine.includes('*/')) {
        inMultiLineComment = false;
      }
      continue;
    }
    
    // Skip empty lines
    if (trimmedLine === '') {
      // If we have current art, process it
      if (currentArt) {
        const artErrors = validateSingleArtPiece(currentArt, currentMetadata, currentRows, lineNum);
        errors = errors.concat(artErrors);
        artPieceCount++;
        
        // Collect art piece info
        artPieces.push({
          name: currentArt,
          size: currentMetadata.size || '8',
          rows: currentRows.length,
          color: currentMetadata.color || 'white'
        });
        
        // Reset for next piece
        currentArt = null;
        currentMetadata = {};
        currentRows = [];
      }
      continue;
    }
    
    // Skip single-line comment lines (lines starting with //)
    if (trimmedLine.startsWith('//')) {
      continue;
    }
    
    // Parse metadata lines
    if (trimmedLine.includes('=') && !trimmedLine.startsWith('"')) {
      const [key, value] = trimmedLine.split('=', 2);
      if (key === 'name') {
        // Starting new art piece
        if (currentArt) {
          const artErrors = validateSingleArtPiece(currentArt, currentMetadata, currentRows, lineNum);
          errors = errors.concat(artErrors);
          artPieceCount++;
          
          // Collect previous art piece info
          artPieces.push({
            name: currentArt,
            size: currentMetadata.size || '8',
            rows: currentRows.length,
            color: currentMetadata.color || 'white'
          });
        }
        currentArt = value;
        currentMetadata = { name: value };
        currentRows = [];
      } else {
        currentMetadata[key] = value;
      }
      continue;
    }
    
    // Parse quoted art rows
    if (trimmedLine.startsWith('"') && trimmedLine.endsWith('"') && trimmedLine.length >= 2) {
      const rowContent = trimmedLine.substring(1, trimmedLine.length - 1);
      currentRows.push({ content: rowContent, lineNum });
      continue;
    }
    
    // Unrecognized line format
    errors.push(`Line ${lineNum}: Unrecognized format${currentArt ? ` in art "${currentArt}"` : ''} - "${trimmedLine}"`);
  }
  
  // Process final art piece if file doesn't end with blank line
  if (currentArt) {
    const artErrors = validateSingleArtPiece(currentArt, currentMetadata, currentRows, lines.length);
    errors = errors.concat(artErrors);
    artPieceCount++;
    
    // Collect final art piece info
    artPieces.push({
      name: currentArt,
      size: currentMetadata.size || '8',
      rows: currentRows.length,
      color: currentMetadata.color || 'white'
    });
  }
  
  return {
    isValid: errors.length === 0 && artPieceCount > 0,
    artPieceCount,
    artPieces: artPieces,
    errors,
    warnings,
    summary: `Found ${artPieceCount} art pieces, ${errors.length} errors, ${warnings.length} warnings`
  };
}

// Validate individual art piece
function validateSingleArtPiece(name, metadata, rows, endLineNum) {
  const errors = [];
  const requiredFields = ['name', 'color', 'size', 'rows', 'charsPerLine', 'charsPermitted'];
  
  // Check required metadata
  for (const field of requiredFields) {
    if (!metadata[field]) {
      errors.push(`Art "${name}": Missing required field "${field}"`);
    }
  }
  
  if (metadata.rows && parseInt(metadata.rows) !== 32) {
    errors.push(`Art "${name}": rows=${metadata.rows}, expected 32`);
  }
  
  if (metadata.charsPerLine && parseInt(metadata.charsPerLine) !== 60) {
    errors.push(`Art "${name}": charsPerLine=${metadata.charsPerLine}, expected 60`);
  }
  
  // Check actual row count
  if (rows.length !== 32) {
    errors.push(`Art "${name}": Has ${rows.length} rows, expected 32`);
  }
  
  // Check each row
  rows.forEach((row, index) => {
    if (row.content.length !== 60) {
      errors.push(`Art "${name}", Row ${index + 1} (Line ${row.lineNum}): Has ${row.content.length} chars, expected 60`);
    }
    
    // Check ASCII range
    for (let i = 0; i < row.content.length; i++) {
      const charCode = row.content.charCodeAt(i);
      if (charCode < 32 || charCode > 126) {
        errors.push(`Art "${name}", Row ${index + 1}, Col ${i + 1} (Line ${row.lineNum}): Invalid character (code ${charCode})`);
        break; // Only report first invalid char per row
      }
    }
  });
  
  return errors;
}

// Update validation display
function updateValidationDisplay(validation, filename = 'asciiArt.txt') {
  const summaryElement = document.getElementById('file-summary');
  const detailsElement = document.getElementById('validation-details');
  
  // Show filename and count
  summaryElement.textContent = `File: ${filename} - ${validation.artPieceCount} pieces`;
  summaryElement.className = 'validation-summary ' + (validation.isValid ? 'validation-ok' : 'validation-error');
  
  let detailsHTML = '';
  
  // Show list of art pieces found
  if (validation.artPieces && validation.artPieces.length > 0) {
    detailsHTML += '<div class="validation-item"><strong>Art Pieces Found:</strong></div>';
    validation.artPieces.forEach(piece => {
      detailsHTML += `<div class="validation-item">• ${piece.name} (${piece.size}px, ${piece.rows} rows, ${piece.color})</div>`;
    });
    detailsHTML += '<div class="validation-item">-------------------</div>';
  }
  
  // Show validation status
  if (validation.isValid) {
    detailsHTML += '<div class="validation-item validation-ok"><strong>✓ VALIDATION PASSED</strong></div>';
    detailsHTML += '<div class="validation-item validation-ok">All art pieces meet requirements</div>';
  } else {
    detailsHTML += '<div class="validation-item validation-error"><strong>✗ VALIDATION FAILED</strong></div>';
  }
  
  // Show errors with line numbers
  if (validation.errors.length > 0) {
    detailsHTML += '<div class="validation-item validation-error"><strong>ERRORS FOUND:</strong></div>';
    validation.errors.forEach(error => {
      detailsHTML += `<div class="validation-item validation-error">• ${error}</div>`;
    });
  }
  
  // Show warnings if any
  if (validation.warnings.length > 0) {
    detailsHTML += '<div class="validation-item validation-warning"><strong>WARNINGS:</strong></div>';
    validation.warnings.forEach(warning => {
      detailsHTML += `<div class="validation-item validation-warning">• ${warning}</div>`;
    });
  }
  
  detailsElement.innerHTML = detailsHTML;
}

// Load default asciiArt.txt file
async function loadDefaultFile() {
  const summaryElement = document.getElementById('file-summary');
  summaryElement.textContent = 'Loading default file...';
  summaryElement.className = 'validation-summary';
  
  try {
    const response = await fetch('asciiArt.txt');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const textContent = await response.text();
    
    // Validate file
    const validation = validateAsciiArtFile(textContent);
    updateValidationDisplay(validation, 'asciiArt.txt');
    
    if (!validation.isValid) {
      document.getElementById('art-selector').innerHTML = '<option value="">-- File has errors --</option>';
      return;
    }
    
    // Parse and load
    const parseResult = parseAsciiArtText(textContent);
    asciiArtLibrary = parseResult.artPieces;
    currentFileMetadata = parseResult.fileMetadata || {};
    
    populateArtDropdown();
    updateStatus(`Loaded ${Object.keys(asciiArtLibrary).length} art pieces from asciiArt.txt`);
    
  } catch (error) {
    console.error("Error loading default file:", error);
    updateValidationDisplay({
      isValid: false,
      artPieceCount: 0,
      artPieces: [],
      errors: [`Error loading file: ${error.message}`],
      warnings: [],
      summary: 'Failed to load default file'
    }, 'asciiArt.txt');
  }
}

// Load selected file from file input
async function loadSelectedFile() {
  const fileInput = document.getElementById('file-selector');
  const selectedFile = fileInput.files[0];
  
  if (!selectedFile) {
    updateValidationDisplay({
      isValid: false,
      artPieceCount: 0,
      artPieces: [],
      errors: [],
      warnings: [],
      summary: 'No file selected'
    }, 'No file');
    return;
  }
  
  const summaryElement = document.getElementById('file-summary');
  summaryElement.textContent = 'Loading file...';
  summaryElement.className = 'validation-summary';
  
  try {
    // Read file content
    const textContent = await selectedFile.text();
    
    // Comprehensive validation
    const validation = validateAsciiArtFile(textContent);
    updateValidationDisplay(validation, selectedFile.name);
    
    if (!validation.isValid) {
      document.getElementById('art-selector').innerHTML = '<option value="">-- File has errors --</option>';
      return;
    }
    
    // Parse the file
    const parseResult = parseAsciiArtText(textContent);
    asciiArtLibrary = parseResult.artPieces;
    currentFileMetadata = parseResult.fileMetadata || {};
    
    // Populate art dropdown
    populateArtDropdown();
    updateStatus(`Loaded ${Object.keys(asciiArtLibrary).length} art pieces from ${selectedFile.name}`);
    
  } catch (error) {
    console.error("Error loading file:", error);
    updateValidationDisplay({
      isValid: false,
      artPieceCount: 0,
      artPieces: [],
      errors: [`Error loading file: ${error.message}`],
      warnings: [],
      summary: 'Failed to load file'
    }, selectedFile?.name || 'Unknown file');
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
  
  // Dynamic batch sizes based on speed
  const CHARS_PER_UPDATE = {
    slow: 3,
    medium: 10,
    fast: 30
  }[currentSpeed] || 3;
  
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
  
  // Dynamic batch sizes based on speed
  const CHARS_PER_UPDATE = {
    slow: 5,
    medium: 15,
    fast: 40
  }[currentSpeed] || 5;
  
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
    
    if (i % CHARS_PER_UPDATE === 0) {
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
// === VALIDATION FUNCTIONS ===
// ========================================

// Analyze JSON escape sequences and categorize them
function analyzeJsonEscapes(str) {
  const issues = [];
  let parsed = '';
  
  try {
    // Try to parse with JSON.parse first
    const jsonString = '"' + str + '"';
    parsed = JSON.parse(jsonString);
  } catch (error) {
    // If parsing fails, we'll do manual analysis
    parsed = str;
  }
  
  // Manual analysis for detailed escape sequence detection
  let i = 0;
  while (i < str.length) {
    if (str[i] === '\\') {
      if (i === str.length - 1) {
        issues.push({
          type: 'ERROR',
          sequence: '\\',
          position: i,
          message: 'Lone backslash at end',
          fix: 'Add another backslash (\\\\) or remove this one'
        });
        i++;
        continue;
      }
      
      const nextChar = str[i + 1];
      const fullSequence = str.substring(i, i + 2);
      
      switch (nextChar) {
        case '\\':
          // Valid: backslash in output
          break;
        case '"':
          // Valid: quote in output
          break;
        case '/':
          issues.push({
            type: 'WARNING',
            sequence: fullSequence,
            position: i,
            message: 'Unnecessary forward slash escape',
            fix: 'Can be simplified to just "/" instead of "\\/"'
          });
          break;
        case 'n':
          issues.push({
            type: 'FORBIDDEN',
            sequence: fullSequence,
            position: i,
            message: 'Newline escape sequence found',
            fix: 'Remove \\n - ASCII art rows should not contain newlines'
          });
          break;
        case 'r':
          issues.push({
            type: 'FORBIDDEN',
            sequence: fullSequence,
            position: i,
            message: 'Carriage return escape sequence found',
            fix: 'Remove \\r - ASCII art rows should not contain carriage returns'
          });
          break;
        case 't':
          issues.push({
            type: 'FORBIDDEN',
            sequence: fullSequence,
            position: i,
            message: 'Tab escape sequence found',
            fix: 'Replace \\t with appropriate number of spaces'
          });
          break;
        case 'b':
          issues.push({
            type: 'FORBIDDEN',
            sequence: fullSequence,
            position: i,
            message: 'Backspace escape sequence found',
            fix: 'Remove \\b - not printable ASCII'
          });
          break;
        case 'f':
          issues.push({
            type: 'FORBIDDEN',
            sequence: fullSequence,
            position: i,
            message: 'Form feed escape sequence found',
            fix: 'Remove \\f - not printable ASCII'
          });
          break;
        case 'u':
          // Unicode escape \uXXXX
          if (i + 5 < str.length) {
            const hex = str.substring(i + 2, i + 6);
            const unicodeSequence = str.substring(i, i + 6);
            if (/^[0-9A-Fa-f]{4}$/.test(hex)) {
              const charCode = parseInt(hex, 16);
              if (charCode < 32 || charCode > 126) {
                issues.push({
                  type: 'FORBIDDEN',
                  sequence: unicodeSequence,
                  position: i,
                  message: 'Unicode escape to non-printable ASCII',
                  fix: 'Replace with printable ASCII character (32-126) or remove'
                });
              } else {
                issues.push({
                  type: 'WARNING',
                  sequence: unicodeSequence,
                  position: i,
                  message: 'Unicode escape for ASCII character',
                  fix: `Replace ${unicodeSequence} with direct character: "${String.fromCharCode(charCode)}"`
                });
              }
              i += 6;
              continue;
            } else {
              issues.push({
                type: 'ERROR',
                sequence: str.substring(i, Math.min(i + 6, str.length)),
                position: i,
                message: 'Invalid Unicode escape sequence',
                fix: 'Use \\uXXXX with 4 hex digits, or remove'
              });
            }
          } else {
            issues.push({
              type: 'ERROR',
              sequence: str.substring(i, str.length),
              position: i,
              message: 'Incomplete Unicode escape sequence',
              fix: 'Complete the \\uXXXX sequence or remove'
            });
          }
          break;
        default:
          issues.push({
            type: 'ERROR',
            sequence: fullSequence,
            position: i,
            message: `Invalid escape sequence \\${nextChar}`,
            fix: `Either use \\\\${nextChar} (to show \\${nextChar}) or remove the backslash`
          });
          break;
      }
      i += 2;
    } else {
      i++;
    }
  }
  
  return { parsed: parsed, issues: issues };
}

// Parse JSON escape sequences and return actual string with character count
function parseJsonEscapes(str) {
  const analysis = analyzeJsonEscapes(str);
  const errors = analysis.issues
    .filter(issue => issue.type === 'ERROR' || issue.type === 'FORBIDDEN')
    .map(issue => `${issue.message} at position ${issue.position}: ${issue.fix}`);
    
  const warnings = analysis.issues
    .filter(issue => issue.type === 'WARNING')
    .map(issue => `${issue.message} at position ${issue.position}: ${issue.fix}`);
  
  return { 
    parsed: analysis.parsed, 
    errors: errors,
    warnings: warnings
  };
}

// Validate ASCII art against specifications (text format - no escapes needed!)
function validateAsciiArt(artName) {
  const validation = {
    valid: true,
    errors: [],
    warnings: [],
    details: {
      rowCount: 0,
      expectedRows: 32,
      rowLengths: [],
      expectedLength: 60,
      characterIssues: [],
      attributeIssues: [],
      loadTimeIssues: []
    }
  };
  
  if (!asciiArtLibrary[artName]) {
    validation.valid = false;
    validation.errors.push("Art piece not found in library");
    return validation;
  }
  
  const artData = asciiArtLibrary[artName];
  const rows = artData.rows || [];
  
  // Check for load-time validation issues
  if (window.loadTimeValidationIssues && window.loadTimeValidationIssues[artName]) {
    validation.details.loadTimeIssues = window.loadTimeValidationIssues[artName];
    window.loadTimeValidationIssues[artName].forEach(issue => {
      validation.warnings.push(`Load-time issue: ${issue}`);
    });
  }
  
  // Validate attributes
  if (typeof artData.color !== 'string' || artData.color.trim() === '') {
    validation.warnings.push("Missing or invalid color attribute");
    validation.details.attributeIssues.push("color");
  }
  
  if (typeof artData.textSize !== 'number' || artData.textSize <= 0) {
    validation.warnings.push("Missing or invalid textSize attribute");
    validation.details.attributeIssues.push("textSize");
  }
  
  // Validate row count
  validation.details.rowCount = rows.length;
  if (rows.length !== 32) {
    validation.valid = false;
    validation.errors.push(`Row count: ${rows.length}, expected: 32`);
  }
  
  // Validate each row (no escape parsing needed for text format!)
  rows.forEach((row, rowIndex) => {
    // Check row length directly (no escape sequences to parse)
    const actualLength = row.length;
    validation.details.rowLengths.push(actualLength);
    
    if (actualLength !== 60) {
      validation.valid = false;
      validation.errors.push(`Row ${rowIndex}: ${actualLength} chars, expected: 60`);
    }
    
    // Check each character is printable ASCII
    for (let i = 0; i < row.length; i++) {
      const charCode = row.charCodeAt(i);
      if (charCode < 32 || charCode > 126) {
        validation.valid = false;
        const issue = `Row ${rowIndex}, pos ${i}: char code ${charCode} not printable ASCII (32-126)`;
        validation.details.characterIssues.push(issue);
        validation.errors.push(issue);
      }
    }
  });
  
  return validation;
}

// ========================================
// === MAIN DISPLAY FUNCTION ===
// ========================================


// Update art information panel
function updateArtInfo(artName) {
  if (!asciiArtLibrary[artName]) {
    document.getElementById('art-name').textContent = "Art not found";
    document.getElementById('art-color').textContent = "-";
    document.getElementById('art-size').textContent = "-";
    document.getElementById('art-dimensions').textContent = "-";
    document.getElementById('art-chars').textContent = "-";
    document.getElementById('metadata-rows').textContent = "-";
    document.getElementById('metadata-chars-per-line').textContent = "-";
    document.getElementById('metadata-chars-permitted').textContent = "-";
    updateValidationDisplay(null);
    return;
  }
  
  const artData = asciiArtLibrary[artName];
  const rows = artData.rows;
  
  // Calculate character statistics
  let minChars = rows.length > 0 ? rows[0].length : 0;
  let maxChars = minChars;
  let totalChars = 0;
  
  for (const row of rows) {
    minChars = Math.min(minChars, row.length);
    maxChars = Math.max(maxChars, row.length);
    totalChars += row.length;
  }
  
  // Update basic info panel
  document.getElementById('art-name').textContent = artName;
  document.getElementById('art-color').textContent = artData.color || "white";
  document.getElementById('art-size').textContent = artData.textSize + "px";
  document.getElementById('art-dimensions').textContent = `${rows.length} rows × ${minChars === maxChars ? minChars : minChars + "-" + maxChars} chars`;
  document.getElementById('art-chars').textContent = `${totalChars} total (avg: ${Math.round(totalChars / rows.length)}/row)`;
  
  // Update metadata info (from the text file metadata)
  const metadata = currentFileMetadata[artName] || {};
  document.getElementById('metadata-rows').textContent = metadata.rows || "-";
  document.getElementById('metadata-chars-per-line').textContent = metadata.charsPerLine || "-";
  document.getElementById('metadata-chars-permitted').textContent = metadata.charsPermitted || "-";
  
  // Run validation and update display
  const validation = validateAsciiArt(artName);
  updateValidationDisplay(validation);
}

async function displayAsciiArt(artName, effectName) {
  if (isAnimating) {
    updateStatus("Animation in progress...");
    return;
  }
  
  if (!asciiArtLibrary[artName]) {
    updateStatus(`Art piece "${artName}" not found`);
    // updateArtInfo(artName); // Commented out - elements don't exist in current HTML
    return;
  }
  
  isAnimating = true;
  updateStatus(`Loading ${artName} with ${effectName} effect...`);
  // updateArtInfo(artName); // Commented out - elements don't exist in current HTML
  
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

async function loadSelectedArt() {
  const dropdown = document.getElementById('art-selector');
  const selectedArt = dropdown.value;
  if (selectedArt) {
    // Reload the JSON file to get fresh data
    await loadAsciiArtLibrary();
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

// Select art piece and display metadata
function selectArtPiece() {
  const dropdown = document.getElementById('art-selector');
  const selectedArt = dropdown.value;
  const metadataDiv = document.getElementById('art-metadata');
  
  if (!selectedArt || !asciiArtLibrary[selectedArt]) {
    metadataDiv.innerHTML = '<div class="metadata-item">No art piece selected</div>';
    return;
  }
  
  const artData = asciiArtLibrary[selectedArt];
  const metadata = currentFileMetadata[selectedArt] || {};
  
  let metadataHTML = '';
  metadataHTML += `<div class="metadata-item"><span class="metadata-label">Name:</span> <span class="metadata-value">${selectedArt}</span></div>`;
  metadataHTML += `<div class="metadata-item"><span class="metadata-label">Color:</span> <span class="metadata-value">${metadata.color || 'white'}</span></div>`;
  metadataHTML += `<div class="metadata-item"><span class="metadata-label">Size:</span> <span class="metadata-value">${metadata.size || '8'}px</span></div>`;
  metadataHTML += `<div class="metadata-item"><span class="metadata-label">Chars/Line:</span> <span class="metadata-value">${artData.rows[0]?.length || 0}</span></div>`;
  metadataHTML += `<div class="metadata-item"><span class="metadata-label">Rows:</span> <span class="metadata-value">${artData.rows.length}</span></div>`;
  
  // Individual validation
  const errors = validateIndividualArt(selectedArt, artData);
  if (errors.length > 0) {
    metadataHTML += '<div class="metadata-item validation-error">Validation Issues:</div>';
    errors.forEach(error => {
      metadataHTML += `<div class="metadata-item validation-error">• ${error}</div>`;
    });
  } else {
    metadataHTML += '<div class="metadata-item validation-ok">✓ Validation passed</div>';
  }
  
  metadataDiv.innerHTML = metadataHTML;
}

// Validate individual art piece
function validateIndividualArt(name, artData) {
  const errors = [];
  
  if (artData.rows.length !== 32) {
    errors.push(`Has ${artData.rows.length} rows, expected 32`);
  }
  
  artData.rows.forEach((row, index) => {
    if (row.length !== 60) {
      errors.push(`Row ${index + 1}: ${row.length} chars, expected 60`);
    }
  });
  
  return errors;
}

// Select animation effect
function selectEffect(effect) {
  currentEffect = effect;
  
  // Update button states
  document.querySelectorAll('.effect-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
}

// Select animation speed
function selectSpeed(speed) {
  currentSpeed = speed;
  
  // Update button states in speed group
  const speedButtons = event.target.parentElement.querySelectorAll('.effect-btn');
  speedButtons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

// Load animation
async function loadAnimation() {
  const dropdown = document.getElementById('art-selector');
  const selectedArt = dropdown.value;
  
  if (!selectedArt || !asciiArtLibrary[selectedArt]) {
    alert('Please select an art piece first');
    return;
  }
  
  await displayAsciiArt(selectedArt, currentEffect);
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  initializeDisplayGrid();
  refreshDisplay();
  
  updateStatus("ASCII Art Test Environment Ready");
});