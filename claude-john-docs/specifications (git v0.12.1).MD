# Text Adventure Game - Project Specifications

## Project Overview

A browser-based text adventure game in the style of 1970s/1980s Zork-style games.
Theme: Halloween Edition - "An exciting game of Trick or Treating and Suspense!"

**Current Layout:** Optimized 950×720px format for compact display while maintaining full functionality.

## Technical Specifications

### Layout

- Fixed window size: 950x720 pixels
- 5-section grid layout with 2px white borders and 10px gutters:
  1. **HEADER** - Full width (930px), 120px height, centered text
  2. **TEXT** - Left column (607px), main content area
  3. **ASCIIART** - Right column (313px), 280px height, ASCII art display
  4. **PROMPT** - Left column (607px), 40px height, command input area
  5. **STATUS** - Right column (313px), remaining height, game status information

### Styling

- Black background with variable color text, depending on location and purpose
- Monospace font family (Courier New)
- H1 text color: orange
- All sections have white borders
- Responsive grid using CSS Grid
- PROMPT box uses yellow color (#ffcc00) to match prompt echoes

### Text Display System

- **TEXT Box Features:**
  - Width: 607px (583px content area)
  - Scrollable content with custom green scrollbar
  - Four-color text system:
    - **Prompt Echo** (#ffcc00 yellow): User commands ("> look north")
    - **Command Output** (#1acdb2 teal): System responses (help, inventory)
    - **Flavor Text** (#00ff00 green): Story/narrative descriptions
    - **Error Text** (#ff4444 red): Invalid commands, error messages
  - Buffer system stores all game history as objects: `{text: "...", type: "prompt|command|flavor|error"}`
  - PAGE UP/DOWN scrolling (1 line at a time)
  - Auto-scroll to bottom for new content
  - Dynamic content loading from JSON files
  - HTML contains no hardcoded text content

### ASCIIART Section

- **Advanced ASCII Art Display System (FULLY INTEGRATED):**

  - **Grid Specifications:**
    - Fixed grid: 60 characters wide × 32 rows tall (1,920 total characters)
    - Technical specs: 8px "Courier New" monospace font, line-height: 1
    - Fixed height: 280px (no scrolling required)
    - Content area: 289px width (optimized for 950px layout)
    - Character-addressable grid system: each position accessible by (x, y) coordinates
    - Grid indexing starts at position 0,0 (top-left corner)

  - **Data Loading Architecture:**
    - **Source System**: ASCII art loaded from asciiArt.txt text file format
    - **Text File Parser**: parseAsciiArtText() function handles metadata and art rows
    - **Library Storage**: asciiArtLibrary object indexed by art name
    - **Memory Buffer**: 2D JavaScript array (32×60) for current display state
    - **Conversion Pipeline**: Text file → parsed library → 2D character array → DOM display

  - **Animation System (8 Effects Available):**
    - **Effect Types**: instant, fadeIn, typewriter, verticalSweep, randomScatter, spiralIn, spiralOut, diagonalWipe
    - **Speed Settings**: slow/medium/fast with dynamic batch processing
    - **Batch Processing**: Fast mode processes 30-40 characters per update
    - **Hardware Independent**: Consistent timing across different computers
    - **Performance Optimized**: Updates use ANIMATION_SPEEDS constant for precise timing

  - **Integration Features:**
    - **Main Trigger Function**: displayAsciiArt(artName, effectName, speed)
    - **Test Hotkeys**: ALT-1,2,3,4 for testing different art pieces and effects
    - **Legacy Hotkeys**: 'B' key loads blank screen, 'C' key loads castle (now uses new system)
    - **Game Startup**: Automatically loads asciiArt.txt and displays CASTLE with fadeIn
    - **Dynamic Loading**: Can switch between different ASCII art images using trigger function

  - **Text File Format:**
    ```
    name=CASTLE
    color=#8b4513
    size=8
    rows=32
    charsPerLine=60
    charsPermitted=ascii032-126
    "                                                            "
    "                                .-------.                   "
    [... exactly 32 rows of exactly 60 characters each ...]
    ```

  - **Data Structure:**
    ```javascript
    // Display grid (current state)
    let displayGrid = Array(32).fill().map(() => Array(60).fill(' '));
    
    // ASCII Art Library (loaded from text file)
    let asciiArtLibrary = {
      "CASTLE": {
        "color": "#8b4513",
        "textSize": 8,
        "rows": ["60-character strings..."]
      }
    };
    
    // Main trigger function
    await displayAsciiArt('CASTLE', 'randomScatter', 'fast');
    ```

  - **Performance Optimizations:**
    - Batched DOM updates (not 1,920 individual updates)
    - Text file parsing only on startup
    - Efficient character-level manipulation with speed-based batching

### STATUS Section

- **Game Status Information Display:**
  - Width: 313px (289px content area)
  - Available commands with shortcuts
  - Current inventory with item counts
  - Game progress (treats collected, houses visited, score)
  - Scrollable content for longer lists
  - Independent initialization from ASCIIART section

### PROMPT Box and Input System

- **Input Interface:**
  - Width: 607px (583px content area)
  - Terminal-style prompt with ">" symbol
  - Yellow text input field matching prompt echo color
  - Auto-focus on page load
- **Smart Command Processing:**
  - Prefix matching: "s", "so", "sou", "south" all match "south"
  - Single-letter priority shortcuts: s→south, n→north, h→help, etc.
  - Ambiguous command handling with "Did you mean..." suggestions
  - Case-insensitive command recognition
- **Command History Buffer:**
  - Up/Down arrow navigation through command history
  - Intelligent filtering: only valid commands stored
  - Duplicate prevention for stateless commands (help, inventory, look)
  - Stateful commands (movement) always stored even if repeated

### Data Architecture

- **JSON-based content system** for externalized game data
- Text buffer objects structured as: `{text: "content", type: "prompt|command|flavor"}`
- **Current Data Files:**
  - `samplePlaythrough.json` - Demo content for testing and development
  - `commands.json` - All game commands with type, shortcuts, and responses
  - `asciiArt.json` - ASCII art library with DEFAULT, CASTLE, and SAMPLE art pieces
- **Command Structure:**
  ```json
  {
    "command_name": {
      "type": "stateless|stateful",
      "shortcuts": ["single-letter shortcuts"],
      "response": [{ "text": "...", "type": "prompt|command|flavor|error" }]
    }
  }
  ```
- **Planned Future Files:**
  - `gameData.json` - Common responses, intro text, help content
  - `rooms.json` - Location descriptions and connections
  - `items.json` - Object descriptions and properties

### Files Structure

- `textGame.html` - Main HTML structure with 5-section layout (950×720px)
- `textGame.css` - All styling, layout, colors, and responsive design (updated for 950px width)
- `textGame.js` - Complete game engine with text buffer, command processing, input handling
- `samplePlaythrough.json` - Demo game content for testing
- `commands.json` - All game commands with smart matching and responses
- `asciiArt.txt` - Text format ASCII art library with metadata
- `layout-diagram.svg` - Visual layout diagram showing exact dimensions
- `backup/` - Incremental backup files folder

## ASCII Art System Status: INTEGRATED ✅

### Current Implementation (September 2, 2025)
The ASCII art system has been fully integrated from the test environment into the main game. Key integration points:

- **✅ Text File Loading**: Game loads asciiArt.txt on startup with full metadata parsing
- **✅ Animation Effects**: All 8 effects (instant, fadeIn, typewriter, verticalSweep, randomScatter, spiralIn, spiralOut, diagonalWipe)
- **✅ Speed Control**: Three speed settings (slow/medium/fast) with optimized batch processing  
- **✅ Main Trigger**: displayAsciiArt(artName, effectName, speed) function available
- **✅ Test Interface**: ALT-1,2,3,4 hotkeys for testing different art pieces and effects
- **✅ Game Startup**: Displays CASTLE art automatically with fadeIn effect

### Available Test Commands
```javascript
// Test different art pieces and effects
ALT-1: displayAsciiArt('DEFAULT', 'fadeIn', 'fast')
ALT-2: displayAsciiArt('CASTLE', 'randomScatter', 'fast')  
ALT-3: displayAsciiArt('SAMPLE', 'typewriter', 'fast')
ALT-4: displayAsciiArt('QUESTION', 'spiralIn', 'fast')

// Legacy hotkeys (still functional)
B: Blank screen
C: CASTLE with fadeIn (now uses new system)
```

### Next Development Phase: Game Logic Integration
The ASCII art system is ready for:
1. **Location-based art display** - Show different art based on game location
2. **Item/object visualization** - Display art for inventory items and game objects
3. **Story event art** - Trigger specific art during key game moments
4. **Metadata tagging** - Add location= and type= tags to asciiArt.txt for smart lookup

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

### Data File Structure

#### `/gamedata/` Folder Organization
```
gamedata/
├── movement.json    # Navigation system, room connections
├── rooms.json       # Room descriptions, properties, actions
├── items.json       # Item definitions, interactions, properties
├── actions.json     # Player commands, responses, game effects  
├── character.json   # NPCs, player stats, dialogue systems
└── [additional files as features expand]
```

#### JSON Schema Design

**movement.json** - Navigation System
```json
{
  "exits": {
    "room_id": {
      "north": "destination_room_id",
      "south": "destination_room_id",
      "east": "destination_room_id", 
      "west": "destination_room_id"
    }
  },
  "blocked_exits": {
    "room_id": {
      "north": {
        "reason": "The door is locked",
        "requirement": "old_key"
      }
    }
  }
}
```

**rooms.json** - Room Definitions
```json
{
  "rooms": {
    "room_id": {
      "name": "Room Display Name",
      "description": "Detailed room description",
      "asciiArt": "ART_NAME",
      "items": ["item_id_1", "item_id_2"],
      "npcs": ["npc_id"],
      "actions": ["special_action_id"],
      "properties": {
        "lightLevel": "dim",
        "temperature": "cold",
        "firstVisit": true
      }
    }
  }
}
```

**items.json** - Item System
```json
{
  "items": {
    "item_id": {
      "name": "Item Display Name",
      "description": "Item description",
      "asciiArt": "ITEM_ART",
      "type": "decoration|tool|key|consumable",
      "canTake": true,
      "weight": 2,
      "actions": ["examine", "take", "use"],
      "properties": {
        "lit": false,
        "durability": 100
      }
    }
  }
}
```

**actions.json** - Command System
```json
{
  "actions": {
    "action_id": {
      "aliases": ["action", "act", "do"],
      "description": "Action description",
      "requirements": {
        "location": ["required_room_id"],
        "items": ["required_item_id"],
        "flags": ["game_flag"]
      },
      "effects": {
        "message": "Action result text",
        "changeRoom": "new_room_id",
        "addItem": "item_id",
        "removeItem": "item_id",
        "setFlag": "flag_name",
        "asciiArt": "ART_NAME"
      }
    }
  }
}
```

**character.json** - NPCs and Player
```json
{
  "player": {
    "inventory": [],
    "stats": {
      "health": 100,
      "score": 0
    },
    "flags": {}
  },
  "npcs": {
    "npc_id": {
      "name": "NPC Name",
      "description": "NPC description", 
      "asciiArt": "NPC_ART",
      "dialogue": {
        "greeting": "Hello there!",
        "responses": {
          "help": "I can help you with...",
          "goodbye": "Farewell!"
        }
      },
      "inventory": ["item_id"],
      "hostile": false,
      "canTalk": true
    }
  }
}
```

### Game Engine Components

#### Data Loading System
- **DataLoader class** handles loading and parsing JSON files
- **Schema validation** ensures data integrity
- **Error handling** for malformed data files
- **Caching system** for improved performance

#### Game State Manager
- **Current game state** tracking (room, inventory, flags)
- **State persistence** for save/load functionality
- **State validation** against data schemas
- **Event-driven updates** when state changes

#### Command Processor
- **Input parsing** with alias support
- **Action resolution** using actions.json definitions
- **Requirement checking** before executing actions
- **Effect application** after successful actions

#### Content Renderer
- **Dynamic text generation** from data definitions
- **ASCII art integration** based on current context
- **UI updates** reflecting game state changes
- **Color coding** for different text types

### ASCII Art Integration

#### Generic Art Design
- **Reusable pieces** that work across multiple games
- **Context-agnostic naming** (CASTLE, FOREST, DOOR, etc.)
- **Flexible association** through data file references
- **Scalable library** for expanding content

#### Data-Driven Art Display
- **Room-based art** loaded from rooms.json asciiArt field
- **Item examination art** from items.json asciiArt field  
- **Action-triggered art** from actions.json effects
- **NPC character art** from character.json asciiArt field

### Development Implementation Strategy

#### Phase 1: Foundation (IMMEDIATE)
1. Create `/gamedata/` folder structure
2. Design and validate JSON schemas
3. Implement basic DataLoader class
4. Create minimal test data files
5. Test data loading functionality

#### Phase 2: Core Migration (INCREMENTAL)
1. **Movement System** - Migrate room navigation
2. **Room Descriptions** - Extract room content
3. **Basic Commands** - Expand command system
4. **Item Mechanics** - Add take/drop functionality
5. **Character System** - Implement NPCs and dialogue

#### Phase 3: Advanced Features
1. **Event System** - Complex interactions and triggers
2. **Puzzle Mechanics** - Multi-step challenges
3. **Save/Load System** - Game state persistence
4. **Multiple Game Support** - Different gamedata folders

### Benefits of Data-Driven Architecture

#### For Development
- **Easier content creation** - JSON editing vs code changes
- **Rapid iteration** - Quick content updates without programming
- **Modular testing** - Individual system validation
- **Clear separation** - Engine logic vs game content

#### For Extensibility
- **Multiple games** using same engine
- **Community content** creation support
- **Easy localization** through data file translation
- **Plugin architecture** for additional features

#### for Maintenance
- **Bug isolation** - Separate engine bugs from content issues
- **Version control** - Track content changes independently
- **Content validation** - Schema-based error detection
- **Performance optimization** - Targeted improvements

### Success Metrics
- ✅ All game functionality preserved during migration
- ✅ New games can be created by editing JSON files only
- ✅ Engine remains content-agnostic
- ✅ Performance remains acceptable with data loading
- ✅ ASCII art system integrates seamlessly with data

This data-driven architecture transforms the text adventure from a single-purpose prototype into a flexible game creation platform while maintaining all existing functionality and the optimized 950×720px layout.

## ASCII Art Test Environment

### Overview
A dedicated test environment (separate from the main game) for developing and testing ASCII art loading schemes, animations, and validation. The test environment ensures 100% code compatibility with the main game while providing comprehensive debugging tools.

### Files
- **testASCII.html** - Test environment HTML structure
- **testASCII.css** - Test environment styling (780px height, 3-column layout)
- **testASCII.js** - Complete ASCII art system with all effects
- **asciiArt.txt** - Text format ASCII art library

### Interface Layout (1280x780px)
1. **Header Section** (full width, 120px): Title and description
2. **Info Panel** (300px width): File source, metadata display, validation results
3. **Controls Panel** (280px width): Art selection, animation effects, speed controls
4. **ASCII Art Canvas** (remaining width): Bordered content display area

### Text File Format Specification
```
name=CASTLE
color=#8b4513
size=8
rows=32
charsPerLine=60
charsPermitted=ascii032-126
"                                                            "
"                                .-----.                     "
[... exactly 32 rows of exactly 60 characters each ...]

name=NEXT_ART_PIECE
[... metadata and rows ...]
```

### Animation Effects System
- **8 Animation Types**: instant, fadeIn, typewriter, verticalSweep, randomScatter, spiralIn, spiralOut, diagonalWipe
- **3 Speed Settings**: slow, medium, fast with dynamic batch processing
- **Performance Optimized**: 
  - Fast fadeIn: 30 chars/update (~64ms total)
  - Fast randomScatter: 40 chars/update (~48ms total)
  - Hardware-independent timing (works on 2-10+ year old computers)

### Validation Features
- **Load-time Validation**: Dimensions, character count, ASCII range (32-126)
- **Runtime Validation**: Real-time error checking and reporting
- **Metadata Verification**: File format compliance, required fields
- **Visual Feedback**: Color-coded validation status with detailed error messages

### Usage Instructions
1. Open `testASCII.html` in web browser
2. Select ASCII art file from dropdown (default: asciiArt.txt)
3. Choose art piece from the art selector
4. Select animation effect and speed
5. Click Load to test animation
6. Check validation panel for any issues

### Code Portability
All JavaScript functions in the test environment are **identical** to the main game:
- Same `displayGrid` 32×60 array structure  
- Same `refreshDisplay()` function (pure grid output)
- Same animation effects and timing system
- Direct copy-paste compatibility for game integration

### Integration Notes
The ASCII art system is ready for integration into the main game with:
- Text file parser and loader functions
- Complete animation effect library
- Comprehensive validation system
- Performance-optimized batch processing

## Development Notes

### Backup Procedure

When John asks to create a backup:

- Backup ALL project files (index.html, textGame.css, textGame.js, etc.)
- Place backups in `/backup` folder
- Use naming convention: `<filename>.<extension>.backup##` (incrementing numbers)
- Example: `index.html.backup01`, `index.html.backup02`, etc.
