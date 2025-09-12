# Text Adventure Game - Project Specifications
# Updated: 2025-09-12 - v0.20 Data-Driven Architecture Transition

## Project Overview

A browser-based text adventure game in the style of 1970s/1980s Zork-style games.
Theme: Halloween Edition - "An exciting game of Trick or Treating and Suspense!"

**Current Layout:** Optimized 950×720px format for compact display while maintaining full functionality.

## Recent Major Updates (September 12, 2025)

### testASCII Program - FULLY FUNCTIONAL ✅
The ASCII art test environment is now completely working with all animation effects functional.

### File Renaming Completed ✅
All main game files renamed from textGame to textAdventure for consistency.

### v0.20 Architecture Planning ✅
Transition to data-driven architecture with JSON-based game content.

## Previous Updates (September 11, 2025)

### JavaScript-Style Comment System Implementation ✅

The ASCII art file format now supports JavaScript-style comments for documentation and content management:

#### Comment Types Supported
1. **Single-line comments**: `//` prefix ignores entire line
2. **Multi-line comments**: `/* ... */` blocks ignore all content between markers
3. **Same-line comments**: `/* comment */` works within single lines

#### Comment System Implementation
- **Parser Functions Updated**: Both `validateAsciiArtFile()` and `parseAsciiArtText()`
- **State Tracking**: `inMultiLineComment` boolean tracks multi-line comment blocks
- **Processing Priority**: Comments processed before any other parsing logic
- **Performance Impact**: Minimal - comments are efficiently skipped during parsing

#### Comment Usage Examples
```
// Single-line documentation comment
name=castle
color=white
/* inline metadata comment */ size=8

/*
Multi-line comment block - entire art piece disabled:
name=broken_ghost
"ghost art row 1 content here..."
"ghost art row 2 content here..."
... (all 32 rows commented out)
*/

// TODO: Fix castle drawbridge alignment in row 15
name=working_castle
```

#### Benefits
- **Documentation**: Add explanatory comments to complex art files
- **Debugging**: Temporarily disable problematic art pieces or rows
- **Development**: TODO notes and implementation reminders
- **Maintenance**: Comment out sections during testing without deletion

## Technical Specifications

### Layout

- Fixed window size: 950x720 pixels
- 5-section grid layout with 2px white borders and 10px gutters:
  1. **HEADER** - Full width (930px), 120px height, centered text
  2. **TEXT** - Left column (607px), main content area
  3. **ASCIIART** - Right column (313px), 280px height, ASCII art display
  4. **PROMPT** - Left column (607px), 40px height, command input area
  5. **STATUS** - Right column (313px), remaining height, game status information

### ASCIIART Section

- **Advanced ASCII Art Display System (FULLY INTEGRATED):**

  - **Grid Specifications:**
    - Fixed grid: 60 characters wide × 32 rows tall (1,920 total characters)
    - Technical specs: 8px "Courier New" monospace font, line-height: 1
    - Fixed height: 280px (no scrolling required)
    - Content area: 289px width (optimized for 950px layout)
    - Character-addressable grid system: each position accessible by (x, y) coordinates

  - **Updated Text File Format with Comments:**
    ```
    // Castle art piece for main game screen
    name=CASTLE
    color=#8b4513
    size=8
    rows=32
    charsPerLine=60
    charsPermitted=ascii032-126
    
    /* 
    The following 32 rows define the castle ASCII art.
    Each row must be exactly 60 characters wide.
    */
    "                                                            "
    "                                .-------.                   "
    [... exactly 32 rows of exactly 60 characters each ...]
    
    /*
    Temporarily disabled ghost art - needs alignment fixes:
    name=GHOST
    "    ___     ___                                             "
    [... 31 more rows ...]
    */
    
    // Next working art piece
    name=SAMPLE
    // This sample piece works correctly
    color=white
    size=8
    ```

## ASCII Art Test Environment (testASCII)

### Current Status (September 11, 2025)
Located in `/asciiArt-stuff/` folder with 4-box interface design:

#### Interface Layout (1183×780px)
1. **Header Section** (full width, 120px): "ASCII Art Test Environment"
2. **FILE LOADER** (280px width): File selection, validation, and error reporting
3. **ART SELECTOR** (280px width): Art piece selection and metadata display
4. **LOADER** (280px width): Animation effects and speed controls *(NEEDS RENAMING FROM "ANIMATION")*
5. **ASCII DISPLAY** (313px width): Bordered ASCII art canvas matching main game dimensions

#### Working Features ✅
- **File Loading**: HTTP server support for loading ASCII art files
- **File Validation**: Comprehensive error reporting with line numbers and specific error locations
- **Comment Support**: Full JavaScript-style comment parsing (`//` and `/* */`)
- **Art Selection**: Dropdown selection of art pieces with metadata display
- **Display Matching**: ASCII art display exactly matches main game dimensions (313×280px)

#### Working Features ✅ (FULLY FUNCTIONAL)
- **Animation Loader**: All 8 animation effects working correctly (Instant, Fade In, Typewriter, V-Sweep, Random, Spiral In/Out, Diagonal)
- **Speed Controls**: All speed settings (Slow, Medium, Fast) functional
- **UI Naming**: Renamed to "ART LOADER" with "LOAD ART" button

#### Comment System Integration Status
- ✅ **validateAsciiArtFile()**: Comments properly ignored during validation
- ✅ **parseAsciiArtText()**: Comments properly ignored during file parsing
- ✅ **Error Reporting**: Comments don't interfere with line number reporting
- ✅ **File Loading**: Comment-enabled files load correctly into test environment

### Validation Features with Comment Support
- **Load-time Validation**: Dimensions, character count, ASCII range (32-126)
- **Comment Parsing**: JavaScript-style comments ignored during validation
- **Error Reporting**: Specific locations with art piece names, row numbers, column positions
- **Metadata Display**: Art piece count, sizes, colors with comprehensive error details

## Development Approach

- Build in very small increments
- Add minor improvements gradually
- Don't suggest new features unless asked
- Wait for user direction on each step

## Data-Driven Architecture (v0.12.1+)

### Overview
Starting with version 0.12.1, the text adventure game transitions from a hardcoded prototype to a flexible, data-driven architecture. This allows the core game engine to load different games from JSON data files, making the system game-agnostic and easily extensible.

### Architecture Goals
1. **Eliminate hardcoded content** from JavaScript files
2. **Create modular JSON data system** in `/gamedata/` folder
3. **Build game engine incrementally** with thorough testing
4. **Maintain generic ASCII art** that works across multiple games

### ASCII Art Integration with Data-Driven Architecture

#### Generic Art Design with Comments
- **Documentation Support**: Use `//` comments to document art piece purposes
- **Version Control**: Use `/* */` blocks to disable old versions while keeping them for reference
- **Development Notes**: Add TODO comments for art improvements
- **Context Separation**: Comments allow same art file to serve multiple games

#### Example Data-Driven Art File with Comments:
```
// === GENERIC ART LIBRARY FOR MULTIPLE GAMES ===

// Main architectural structures
name=CASTLE
// Used in: Halloween game (main screen), Fantasy game (fortress)
color=#8b4513
size=8
rows=32
charsPerLine=60
charsPermitted=ascii032-126
"castle art rows here..."

/*
DEVELOPMENT NOTE: The following ghost art is used across
multiple game contexts - Halloween (main character),
Mystery game (apparition), etc.
*/
name=GHOST
color=white
size=8
"ghost art rows here..."

// TODO: Create more generic architectural pieces
// - DOOR (multiple door types)
// - WINDOW (different window styles)  
// - TREE (various tree shapes)
```

## v0.20 Priority Tasks - Data-Driven Architecture

### HIGH PRIORITY (Next Session)
1. **Integrate ASCII Art Loader** - Copy working animation system from testASCII into main textAdventure game
2. **Strip Hardcoded Data** - Extract all game content from textAdventure.js to JSON files
3. **Design Game Engine** - Create data-driven architecture for loading content from JSON

### MEDIUM PRIORITY (v0.20 Development)
4. **JSON Data Schema** - Design comprehensive data structure for rooms, items, messages
5. **Game Engine Core** - Build generic command processing and state management
6. **Multi-Game Support** - Enable loading different scenarios from data files

### LONG-TERM (v0.20+)
7. **Production Game Engine** - Fully modular system supporting multiple game types
8. **Advanced Features** - Save/load, inventory systems, character stats
9. **Game Creation Tools** - Tools for building new text adventure scenarios
10. **Generic ASCII Art Library** - Shared art resources across multiple games

## Files Structure

### Main Game (950×720px)
- `textAdventure.html` - Main HTML structure with 5-section layout
- `textAdventure.css` - All styling, layout, colors, responsive design
- `textAdventure.js` - Complete game engine with text buffer, command processing
- `asciiArt.txt` - ASCII art library with JavaScript-style comment support

### Test Environment (/asciiArt-stuff/)
- `testASCII.html` - 4-box test interface (1183×780px)
- `testASCII.css` - Test environment grid layout and styling
- `testASCII.js` - ASCII art system with comment-enabled validation/parsing
- `asciiArt.txt` - Test ASCII art file with comment examples

### Documentation (/claude-john-docs/)
- `specifications-2025-09-11.MD` - This file (updated specifications)
- `Claude-ToBeContinued-2025-09-11-v3.md` - Current project status and tasks
- Previous ToBeContinued files (maintain 3 most recent)

## Development Notes

### Comment System Technical Details

#### Implementation Specifics
- **Single-line Processing**: Lines starting with `//` (after trim) are completely skipped
- **Multi-line State Tracking**: `inMultiLineComment` boolean variable tracks block state
- **Same-line Comments**: `/* comment */` detected and handled within single lines
- **Parser Integration**: Applied to both validation and parsing functions identically

#### Edge Cases Handled
- **Nested Comments**: `/* outer /* inner */ outer */` - not supported (standard JavaScript behavior)
- **Comment Characters in Art**: Only affects lines outside quotes - art content unaffected
- **Empty Comment Blocks**: `/* */` handled correctly
- **Whitespace**: Comments detected after line trimming

#### Performance Considerations
- **Minimal Overhead**: Comment detection adds negligible processing time
- **Early Exit**: Comment lines skip all further processing
- **Memory Efficient**: No comment content stored or processed

This comment system enhancement significantly improves the maintainability and documentation capabilities of ASCII art files while maintaining full backward compatibility with existing comment-free files.