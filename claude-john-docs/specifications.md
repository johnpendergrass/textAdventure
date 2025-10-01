# Halloween Text Adventure - Complete Specifications
# TypedNames Array System & Expanded Content (v0.23)

## Project Overview

**Total Project Size:** ~190KB (expanded with new items)
**Source Files:** 8 core files + 40 items + documentation
**Architecture:** Clean vanilla HTML/CSS/JavaScript with unified typedNames array system
**Target Platform:** Web browsers (GitHub Pages compatible)
**Current State:** Fully interactive text adventure with 29 regular items + 11 scavenger items, natural language input, multi-component scoring

## Overall Structure & File Size

### Directory Structure
```
/mnt/d/dev/projects/halloween/games/textAdventure/
├── textAdventure.html           (44 lines)
├── textAdventure.css            (193 lines, monospace themed)
├── textAdventure.js             (~1450 lines, typedNames array support)
├── HALLOWEEN-GAME/
│   ├── gameData.json            (29 lines)
│   ├── rooms-w-doors.json       (360 lines, +INVENTORY room)
│   ├── commands.json            (64 lines, 10 commands)
│   ├── items.json               (590 lines, 29 items with typedNames arrays)
│   ├── scavengerItems.json      (257 lines, 11 items with typedNames arrays)
│   ├── uiConfig.json            (21 lines)
│   └── keyboardShortcuts.json   (15 lines)
├── assets/
│   ├── items/                   (24 candy/food images at 150px dimension)
│   └── scavenger/               (12 items, each with 90×90 and 250×250 versions)
└── claude-john-docs/
    ├── Claude-ToBeContinued-2025-10-01.md (latest - typedNames migration)
    ├── Claude-ToBeContinued-2025-09-30.md (location refactoring)
    ├── Claude-ToBeContinued-2025-09-29-1800.md (scoring system)
    ├── specifications.md (this file)
    └── specifications-technical.md
```

**Total JavaScript Code:** ~1450 lines (natural language parsing)
**Game Data:** 1340 lines across 5 JSON files
**Documentation:** 4 comprehensive files
**Total Items:** 40 (29 regular + 11 scavenger)

## Screen Layout & Fixed Dimensions

### Main Game Area
- **Total Size:** 1280px × 720px (completely fixed, not responsive)
- **Position:** Absolute center of viewport using transform: translate(-50%, -50%)
- **Border:** 3px solid #ff6600 (orange)
- **Border Radius:** 15px
- **Background:** Dark gradient with Halloween theme colors

### Three-Panel Layout

#### Left Navigation Panel (Score & Info)
- **Position:** absolute at (0, 0)
- **Width:** 250px (fixed)
- **Height:** 720px
- **Content:** Game title, SCORE breakdown (Treats/Scavenger/Health/Total), game description
- **Background:** Linear gradient (#3d2817 to #2a1810)

#### Center Game Area (Main Interface)
- **Position:** absolute at (250px, 0)
- **Width:** 950px
- **Height:** 720px
- **Content:** Text adventure output, command input, item interactions
- **Background:** Linear gradient (#1a1410 to #261a10)

#### Right Panel (Status & Inventory)
- **Position:** absolute at (1030px, 0)
- **Width:** 250px
- **Height:** 720px
- **Content:** INVENTORY list with item (+X) point display, scavenger checklist
- **Background:** Linear gradient (#3d2817 to #2a1810)

## Data Architecture (UNIFIED TYPEDNAMES SYSTEM)

### Universal Item Structure
**All 40 items use identical structure with typedNames arrays:**

```json
{
  "includeInGame": true,
  "typedNames": ["primary", "alias1", "alias2", "..."],  // 2-9 variations
  "display": "Display Name",
  "description": "Brief description",
  "location": "ROOM-NAME",       // Physical room or "INVENTORY"
  "points": 1,                   // Score contribution (1 for treats, 10 for scavenger)
  "health": 1,                   // Health value (for eating)
  "eatable": true,               // Can be eaten (boolean)
  "visible": true,               // Visibility control
  "locked": false,               // Interaction control
  "icon150": "assets/items/name150.png",  // Regular items only
  "actions": {
    "examine": "examine text",
    "take": {
      "response": "pickup message",
      "addToInventory": true,
      "markAsFound": true          // Scavenger items only
    },
    "eat": {                       // Optional - eatable items only
      "response": "eat message",
      "addHealth": 5,
      "removeItem": true
    }
  }
}
```

### Scavenger Items Additional Properties
```json
{
  "found": false,                          // Tracking property
  "isScavengerItem": true,                 // Runtime flag (added by code)
  "icon90x90": "assets/scavenger/name90x90.png",
  "icon250x250": "assets/scavenger/name250x250.png"
}
```

### INVENTORY as Room Innovation
**Revolutionary approach to inventory management:**
- **INVENTORY room** - Virtual room in rooms-w-doors.json
- **Unified location system** - All items always have location
- **No separate arrays** - Inventory items are just items with location: "INVENTORY"
- **Consistent filtering** - Same code handles room items and inventory items

### Multi-Component Scoring System

**Score Components:**
1. **Treats Score** - Points from regular items (0-24 possible)
2. **Scavenger Score** - Points from scavenger hunt items (0-110 possible)
3. **Health Score** - Player's current health (starts at 100)
4. **Total Score** - Sum of all three components

**Display Format:**
```
SCORE:
Treats: 5/24     ← Current/Maximum
Scavenger: 3/11  ← Found/Total
Health: 100      ← Current health
───────────
Score: 138       ← Total
```

**Score Separation Logic:**
- Regular items: points 0-1, no isScavengerItem flag
- Scavenger items: points 10, marked with `isScavengerItem: true` at runtime
- Separation enables targeted score tracking and gameplay mechanics

### Item Distribution Across 16 Rooms

**Physical Rooms (15 total):**
```
STREET-01 ↔ STREET-02
    ↑           ↑
NICE-PORCH  FRONT-PORCH
    ↑           ↑
NICE-HOUSE   FOYER ← Central hub
             ↑ ↑ ↑
         LIBRARY DINING-ROOM STUDY
             ↑       ↑          ↑
      MUSIC-ROOM  KITCHEN   TV-ROOM
             ↑                  ↑
       GAME-ROOM            BEDROOM
             ↑
           HOME (end game)
```

**Virtual Room:**
- **INVENTORY** - Container for carried items

**Regular Items (29 total):**

*Fixed Items (5):*
- candy_bag (0 pts) - MUSIC-ROOM - `["bag", "candybag", "pillowcase", "sack"]`
- doorbell (0 pts) - NICE-PORCH - `["doorbell", "bell", "button", "ringer"]`
- porch_light_nice (0 pts) - NICE-PORCH - `["nicelight", "warmlight", "welcominglight", "friendlylight"]`
- door_knocker (0 pts) - FRONT-PORCH - `["knocker", "doorknocker", "gargoyle", "ironknocker"]`
- porch_light_front (0 pts) - FRONT-PORCH - `["eerielight", "spookylight", "flickeringlight", "hauntedlight"]`

*Portable Candy/Food Items (24):*
- **FOYER:** snickers (1 pt)
- **LIBRARY:** whatchamacallit (1 pt)
- **DINING-ROOM:** 100grand (1 pt), apple (1 pt), lemondrops (1 pt), smarties (1 pt)
- **STUDY:** 3musketeers (1 pt), gummybears (1 pt), lifesavers (1 pt)
- **KITCHEN:** butterfinger (1 pt), corn (1 pt), reesespieces (1 pt)
- **MUSIC-ROOM:** candy_bag (0 pts) + smarties moved here
- **GAME-ROOM:** mars (1 pt), hersheykisses (1 pt), popcorn (1 pt), twizzlers (1 pt)
- **BEDROOM:** mounds (1 pt), jollyrancher (1 pt), rottentomato (1 pt), spicedrops (1 pt)
- **TV-ROOM:** mrgoodbar (1 pt), hotdog (1 pt), skittles (1 pt), socks (1 pt, not eatable)

**Scavenger Items (11 total):**
- **GAME-ROOM:** nvidia (10 pts), gamingmouse (10 pts)
- **MUSIC-ROOM:** beatles (10 pts)
- **DINING-ROOM:** catmug (10 pts)
- **LIBRARY:** cuponoodles (10 pts), frankenstein (10 pts)
- **BEDROOM:** watch (10 pts)
- **TV-ROOM:** bringingupbaby (10 pts)
- **FOYER:** dog (10 pts)
- **STUDY:** krugerrand (10 pts)
- **FRONT-PORCH:** pumpkin (10 pts)

**Total Points Available:**
- **Treats:** 24 points (24 eatable candy/food items × 1 pt, excluding bag/fixed items)
- **Scavenger:** 110 points (11 items × 10 pts)
- **Health:** 100 points (starting value)
- **Maximum Score:** 234 points

## Game Mechanics Implementation

### Complete Command System (10 total)

**Movement Commands:**
- **north** (n), **south** (s), **east** (e), **west** (w) - Room navigation

**Information Commands:**
- **help** (h) - Show available commands
- **look** (l) - Examine current room and visible items
- **inventory** (i) - List carried items with (+X) points

**Interaction Commands:**
- **take** (get, grab, pick) - Pick up items with full validation
- **examine** (x, ex) - Examine items with smart rules
- **drop** (put, place) - Drop items from inventory to current room

### Natural Language Command Processing

**Enhanced Multi-Word Parsing:**
```
User Input: "take gummy bears"
↓
1. Lowercase entire input → "take gummy bears"
2. Find first space → extract command "take"
3. Get remainder → "gummy bears"
4. Strip ALL spaces → "gummybears"
5. Check typedNames array → finds match!
```

**Works with any spacing:**
- `take gummy bears` → `gummybears` ✓
- `take   gummy   bears` → `gummybears` ✓
- `take gummybears` → `gummybears` ✓
- `TAKE Gummy Bears` → `gummybears` ✓

**Examples that now work:**
- `take reeses pieces` → matches "reesespieces"
- `examine 100 grand` → matches "100grand"
- `get mr goodbar` → matches "mrgoodbar"
- `take cup o noodles` → matches "cuponoodles"

### Item Interaction System (COMPLETE)

#### Room Entry Behavior
1. Load room data and show enterText
2. List available exits
3. **Show visible items automatically** - filtered by visible: true
4. Items appear with display names for easy identification

#### Take Command Validation (6-Step Process)
1. **Item exists** with matching name in typedNames array
2. **includeInGame** === true
3. **visible** === true (item is discoverable)
4. **locked** === false (item is not restricted)
5. **Has actions.take** property (item is portable)
6. **actions.take.addToInventory** === true (confirms pickup)

#### Drop Command Validation
1. **Item exists** with matching name in typedNames array in INVENTORY
2. **includeInGame** === true
3. **Has actions.take** property (confirms it's droppable)
4. Move from INVENTORY to currentRoom
5. Update score breakdown

#### Examine Command Intelligence
**Portable Items (have take action):**
- Must be in INVENTORY to examine closely
- "You need to pick it up first to examine it closely"

**Fixed Items (no take action):**
- Can examine if visible in current room
- Direct examination of doorbell, lights, knocker

#### Real-Time Score Updates
- **Score components recalculated** after every take/drop
- **player.core.score** updated with total
- **Display breakdown** shows Treats/Scavenger/Health/Total
- **Both text and visual displays** stay synchronized

## Code Architecture (UNIFIED SYSTEM)

### Core Functions (textAdventure.js - ~1450 lines)
```javascript
// Data Loading System
loadItems()              // Load items.json (29 items)
loadScavengerItems()     // Load scavengerItems.json (11 items), mark with isScavengerItem
loadRoomsAndDoors()      // Load 16 rooms including INVENTORY
loadCommands()           // Load 10 commands

// Enhanced Game Engine
displayRoom()            // Show room + exits + visible items
movePlayer()             // Handle movement with door validation
processCommand()         // Parse and execute all commands
findCommand()            // Extract first word for command matching

// Item Interaction System (COMPLETE)
handleTakeCommand()      // Complete pickup system with typedNames array matching
handleDropCommand()      // Complete drop system with typedNames array matching
handleExamineCommand()   // Smart examination with typedNames array matching
lookAtRoom()             // Show room description + visible items
showInventory()          // Display items from INVENTORY room with (+X) points

// Multi-Component Scoring System
updateGameStatus()       // Calculate score components, update player.core.score
  ├─ Separate regular vs scavenger items by isScavengerItem flag
  ├─ Sum points for Treats score
  ├─ Sum points for Scavenger score
  ├─ Read health for Health score
  ├─ Calculate total = Treats + Scavenger + Health
  └─ Display breakdown in SCORE panel

// Real-Time UI Management
addToBuffer()            // Text output management with type formatting
```

### Universal TypedNames Array System
```javascript
// All items loaded and merged
items = { ...items, ...scavengerItems };

// Runtime marking for scavenger items
Object.values(scavengerItems).forEach(item => {
  item.isScavengerItem = true;
});

// Unified matching pattern (same for take/drop/examine)
const targetTypedName = remainder.replace(/\s+/g, ''); // Strip spaces
const matchingItems = Object.entries(items).filter(([key, item]) =>
  item.includeInGame && item.typedNames?.includes(targetTypedName)
);
```

### Command System Enhancement
**Dual command loading:**
- Commands defined in both commands.json AND CONFIG_FALLBACKS
- Handles browser caching and loading failures gracefully
- Enhanced findCommand() parses multi-word inputs correctly

## Current Game Experience

### ✅ Complete Interactive Gameplay
**Players can now:**
1. **Navigate** through all 15 rooms with consistent descriptions
2. **Discover items** automatically when entering rooms (29 regular + 11 scavenger)
3. **Pick up items** using natural commands with aliases
4. **Drop items** in any room using any alias
5. **Examine items** with realistic rules (hold portable items, examine fixed items in place)
6. **Track score** with detailed breakdown (Treats X/Total, Scavenger X/Total, Health, Total)
7. **View inventory** with point values displayed (+X format)
8. **Get help** with updated command list

### ✅ Example Gameplay Session
```
> north
You enter the Radley House foyer.
Exits: south, north, east, west
You see:
  Snickers mini-bar
  Odd Dog

> take snickers
You pick up the Snickers bar and put it in your trick or treat bag.

> get dog
You pick up the oddly shaped ceramic dog and put it in your bag.

> inventory
You are carrying:
  Snickers mini-bar (+1)
  Odd Dog (+10)

> north
You enter the study.
You see:
  3 Musketeers bar
  Gummy Bears
  Life Savers
  Krugerrand

> take gummy bears
You pick up the bag of gummy bears.

> examine gummy
You need to pick up the Gummy Bears first to examine it closely.

> take gummy
You pick up the bag of gummy bears.

> examine gummy bears
Gummy Bears: Colorful, chewy gummy bears in all the fruit flavors!

[SCORE panel shows:]
SCORE:
Treats: 2/24
Scavenger: 1/11
Health: 100
───────────
Score: 112
```

### ✅ Item Categories Working
**Portable Items (require pickup to examine):**
- Regular candy/food: 24 items (1 pt each, except candy_bag 0 pts)
- Scavenger items: 11 items (10 pts each)

**Fixed Items (examine in place):**
- doorbell, door_knocker, porch lights (0 pts each)
- Future: safes, paintings, furniture

## Technical Achievements

### Universal TypedNames Arrays
- **Consistent structure** across all 40 items
- **No special cases** in code (single pattern for all items)
- **Natural language flexibility** with 2-9 aliases per item
- **Unique naming** prevents conflicts between items

### Multi-Word Parsing
- **Space-insensitive** matching works with any input format
- **Case-insensitive** lowercasing for flexibility
- **Handles all variations** of multi-word item names

### Multi-Component Scoring Benefits
- **Separate tracking** enables gameplay decisions
- **Health as score** creates risk/reward for eating candy
- **Scavenger hunt** has clear progress metric
- **Total score** provides overall achievement measure
- **X/Total format** shows progress clearly

### Browser Compatibility Solved
- **Fallback command system** prevents caching issues
- **Multiple server ports** for development testing
- **JSON validation** ensures all configuration files load correctly
- **Command parsing fixes** resolve multi-word input problems

### Performance Optimizations
- **Unified item filtering** reduces code complexity
- **Single source of truth** for item locations eliminates synchronization bugs
- **Real-time updates** only when needed (item pickup/drop, score changes)
- **Clean memory usage** with no duplicate item tracking
- **Runtime flagging** keeps JSON files clean

### Scalability Features
- **Property-driven system** makes adding new items trivial
- **Command framework** easily extensible for new interactions
- **Room system** supports unlimited expansion
- **Type-safe item validation** prevents runtime errors
- **Score component system** can add new score types easily

## Future Development Roadmap

### Phase 1: Visual Scavenger Checklist (NEXT - 2-3 hours)
**Goal:** Replace text-based scavenger tracking with visual display

**Option A: Checkbox List (Simpler)**
- Item name + checkbox/checkmark
- Updates when item found
- Shows X/11 progress
- Minimal CSS changes

**Option B: Icon Grid (More Complex)**
- 3×3 or 3×4 grid of 90×90 icons
- Grayscale when not found
- Color when found
- Uses icon90x90 images

**Recommendation:** Start with Option A

### Phase 2: Eating System (1-2 hours)
**Eat Command:**
- Add "eat" command to commands.json
- Validate item.eatable property
- Apply actions.eat effects (addHealth, removeItem)
- Update health score in real-time
- Implement health bounds (0-100)

**Game Over Condition:**
- Health reaches 0 → game over
- Display final score

### Phase 3: Image Display During Examine (1-2 hours)
**Use icon150 property:**
- Inline display in text buffer (simplest)
- Or temporary overlay on status box
- Or dedicated image display area

**All items ready:**
- icon150 property already defined
- 24 images in assets/items folder

### Phase 4: Use Command & Puzzles (2-3 sessions)
**Use Command:**
- Add "use" command for doorbell/knocker
- Trigger special events
- Door opens, NPC appears
- Puzzle progression

**Hidden Item System:**
- Set items to visible: false initially
- Reveal mechanics: "examine painting" → reveals safe
- Progressive discovery gameplay

**Puzzle Implementation:**
- Locked doors requiring keys
- Password-protected items
- "say friend" puzzle for secret passage

### Phase 5: Advanced Features (Future)
**Enhanced Gameplay:**
- Health degradation over time
- Walking costs health
- Different foods restore different amounts
- Random item placement modes
- Multiple difficulty levels
- Hint system
- Achievement tracking

## Design Philosophy & Technical Innovation

### Current Approach
**Universal TypedNames System** - The unified array structure eliminates special cases and makes the codebase dramatically simpler and more maintainable. Every item can have multiple aliases, enabling natural language input.

**Multi-Word Parsing** - Space-stripping algorithm allows players to type item names naturally without worrying about spacing, making the game more intuitive and accessible.

### Key Innovations
1. **INVENTORY as Room** - Revolutionary simplification of item management
2. **Universal TypedNames Arrays** - Consistent structure eliminates special cases
3. **Multi-Word Space-Stripping Parser** - Natural language flexibility
4. **Property-Driven Items** - visible/locked/health/eatable properties enable fine-grained game control
5. **Runtime Flagging** - isScavengerItem keeps JSON clean while enabling targeted logic
6. **Component Scoring** - Separates scoring into meaningful categories
7. **Icon System** - Prepared for visual display with icon150/icon90/icon250 properties

### Code Quality
- **Clean separation** of concerns between data, logic, and display
- **Consistent patterns** across all item interactions
- **Comprehensive validation** prevents edge cases and errors
- **Self-documenting** code with clear function names and logic flow
- **Minimal properties** in JSON - only what's actually used
- **Universal structure** - no special cases for different item types

---

*This specification documents the complete interactive item system with universal typedNames arrays, natural language multi-word parsing, 40 total items (29 regular + 11 scavenger), and comprehensive scoring system. The game has evolved into a robust text adventure with flexible input, diverse content, and clear progression tracking.*
