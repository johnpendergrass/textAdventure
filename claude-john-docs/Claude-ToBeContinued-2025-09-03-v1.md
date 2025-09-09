# Text Adventure Game Prototype - Current State
## Date: September 3, 2025

## Project Overview
Halloween-themed haunted house text adventure game with integrated ASCII art system and planned scoring mechanics. The game uses a 1280x720px layout with 5 main sections: HEADER, TEXT, ASCIIART, PROMPT, and STATUS. Fully integrated ASCII art system supports 60×32 character grids with 8 animation effects.

## Recent Major Changes

### File Structure Updates (COMPLETED)
- **✅ Renamed samplePlaythrough.json → startGameText.json** - More generic filename
- **✅ Updated game content** - Replaced Halloween mansion theme with generic neighborhood exploration
- **✅ Updated function names** - loadSamplePlaythrough() → loadGameText() throughout textGame.js
- **✅ Updated comments and error messages** to reflect new naming

### Scoring System Design (PLANNED)
**Halloween Haunted House Theme - 100 Point Total:**

1. **CANDY COLLECTED (30 points)**
   - Common candy (lollipops, candy corn): 1 point each
   - Good candy (chocolate bars, gummy worms): 2 points each
   - Rare candy (full-size bars, special treats): 5 points each
   - Strategic choice: Keep for points OR eat to restore health

2. **SECRETS DISCOVERED (25 points)**
   - 10 hidden areas/secret passages (2.5 points each)
   - Examples: Hidden rooms, secret tunnels, messages behind portraits

3. **SPOOKY ENCOUNTERS (20 points)**
   - Befriend haunted house inhabitants (2 points each, max 10)
   - Pet black cat, feed rats, help friendly spider, talk to ghost
   - Whimsical interactions, not scary

4. **ROOMS EXPLORED (15 points)**
   - Visit all major rooms (1.5 points per room for 10 rooms)
   - Library, kitchen, attic, basement, master bedroom, etc.

5. **HEALTH/ENERGY (10 points)**
   - Start at 100% health
   - Decrease from: cobwebs (-5%), startling surprises (-10%), creaky stairs (-3%)
   - Restore by eating candy (+10% per candy eaten)
   - Final health × 0.1 = points (can't drop below 25%)

### Data Architecture Plan (DESIGNED)
**Simplified JSON-based system for 10-room game:**

- **rooms.json** - Location definitions with exits, items, creatures, ASCII art references
- **items.json** - Collectible objects (candy, keys, tools) with properties and effects
- **creatures.json** - House inhabitants with befriending mechanics
- **secrets.json** - Hidden discoveries and unlock conditions
- **gameState.json** - Runtime player progress (room, health, inventory, flags)

### Rules System Approach (PLANNED)
**Simplified conditional system instead of full rules engine:**
- Simple state flags (flashlight_on, library_unlocked, cat_befriended)
- Basic if/then logic for limited actions needed
- Embedded conditions directly in JSON (blocked exits, lighting requirements)
- Special case handling for 5-6 key puzzle elements

## Current File Structure

### Main Game Files
- **index.html** - Main game HTML structure
- **textGame.css** - Game styling
- **textGame.js** - ⚡ UPDATED - Function names changed, loads startGameText.json
- **startGameText.json** - ⚡ NEW - Generic neighborhood adventure content (was samplePlaythrough.json)

### ASCII Art System (Integrated)
- **asciiArt.txt** - Text format ASCII art library (DEFAULT, CASTLE, SAMPLE, QUESTION pieces)
- **testASCII.html/css/js** - Test environment (reference only)

### Legacy/Reference Files
- **commands.json** - Game commands with shortcuts and responses
- **asciiArt.json** - JSON format ASCII art library (legacy)

### Documentation
- **specifications.MD** - Technical specifications (needs update for scoring system)
- **Claude-ToBeContinued-2025-09-03-v1.md** - This file

## ASCII Art System Status: FULLY INTEGRATED ✅

### Current Capabilities
- **Text File Loading**: Game loads asciiArt.txt with metadata parsing
- **8 Animation Effects**: instant, fadeIn, typewriter, verticalSweep, randomScatter, spiralIn, spiralOut, diagonalWipe
- **3 Speed Settings**: slow/medium/fast with hardware-independent timing
- **Main Trigger Function**: displayAsciiArt(artName, effectName, speed)
- **Test Interface**: ALT-1,2,3,4 hotkeys for development testing
- **Game Integration**: Displays CASTLE art on startup with fadeIn effect

### Available Art Pieces
- **DEFAULT** - Simple geometric pattern
- **CASTLE** - Spooky castle for game startup
- **SAMPLE** - Test pattern with borders
- **QUESTION** - Question mark pattern

## Next Development Phase: Game Logic Implementation

### Priority 1: Core Game Structure
1. **Replace generic neighborhood content** with Halloween haunted house theme
2. **Implement JSON-based room system** - Create rooms.json with 10 haunted house locations
3. **Add inventory system** - Track candy, keys, and tools
4. **Create basic movement system** with exit validation

### Priority 2: Scoring System Integration
1. **Add score tracking** to STATUS section display
2. **Implement health system** with candy consumption mechanics
3. **Create collectible items** with point values
4. **Add secret discovery mechanics**

### Priority 3: Interactive Elements
1. **Implement creature interactions** for befriending points
2. **Add simple puzzle mechanics** (locked doors, dark rooms, flashlight usage)
3. **Create item usage system** (keys unlock doors, flashlight lights rooms)
4. **Location-based ASCII art** display based on current room

### Priority 4: Content Creation
1. **Design 10 haunted house rooms** with descriptions and connections
2. **Create candy and item placement** throughout the house
3. **Add 10 secret discoveries** with unlock conditions
4. **Design 5-6 friendly creatures** for interaction points

## Technical Implementation Strategy

### Simplified Rules Approach for 10-Room Game
- **State Flags**: ~10 boolean flags for key game states
- **Basic Conditionals**: Simple if/then logic for actions
- **JSON-embedded Conditions**: Blocked exits and requirements in data files
- **Special Case Handling**: ~5-6 explicit puzzle mechanics

### Game State Structure
```javascript
gameState = {
  current_room: "foyer",
  health: 100,
  inventory: ["flashlight"],
  candy_count: 0,
  score: 0,
  rooms_visited: [],
  secrets_found: [],
  creatures_befriended: [],
  flags: {
    flashlight_on: false,
    library_unlocked: false,
    cat_befriended: false
  }
}
```

## Development Notes

### Code Architecture Status
✅ **ASCII art system** - Fully integrated with 8 effects and text file loading
✅ **File structure** - Renamed and updated for generic approach
✅ **Function naming** - Updated to reflect game text loading
⏳ **Scoring system** - Designed but not yet implemented
⏳ **JSON data architecture** - Planned but files not created
⏳ **Game logic** - Basic command system exists, needs expansion

### Performance Characteristics
- **ASCII animations**: 30-40 characters per update (~48-64ms total)
- **Text file loading**: Completes in milliseconds
- **Memory usage**: Text-only operations, minimal CPU/GPU usage
- **Browser compatibility**: Modern browsers, no advanced APIs required

## Files Modified in This Session
- **samplePlaythrough.json** → **startGameText.json** (renamed and rewritten)
- **textGame.js** (function names updated)
  - loadSamplePlaythrough() → loadGameText()
  - Updated comments and error messages
  - Updated fetch() call to use new filename

## Ready for Next Phase: JSON Data Structure Implementation

The game is ready for the next development phase:
1. Create the JSON data files (rooms.json, items.json, creatures.json, secrets.json)
2. Replace startGameText.json content with Halloween haunted house theme
3. Implement basic scoring system display in STATUS section
4. Add room-based ASCII art triggering

**Current State**: Planning complete, ready for implementation of JSON-based game structure with simplified rules system for Halloween haunted house adventure.