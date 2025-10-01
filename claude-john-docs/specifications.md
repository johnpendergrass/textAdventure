# Halloween Text Adventure - Complete Specifications
# Multi-Component Scoring System & Complete Item Interaction

## Project Overview

**Total Project Size:** ~165KB (enhanced from foundation)
**Source Files:** 8 core files + documentation
**Architecture:** Clean vanilla HTML/CSS/JavaScript with complete item system and multi-component scoring
**Target Platform:** Web browsers (GitHub Pages compatible)
**Current State:** Fully interactive text adventure with take/drop/examine commands and comprehensive scoring system

## Overall Structure & File Size

### Directory Structure
```
/mnt/d/dev/projects/halloween/games/textAdventure/
├── textAdventure.html           (44 lines)
├── textAdventure.css            (193 lines, monospace themed)
├── textAdventure.js             (~1450 lines, enhanced with scoring)
├── HALLOWEEN-GAME/
│   ├── gameData.json            (29 lines)
│   ├── rooms-w-doors.json       (360 lines, +INVENTORY room)
│   ├── commands.json            (64 lines, 10 commands)
│   ├── items.json               (127 lines, streamlined properties)
│   ├── scavengerItems.json      (194 lines, streamlined properties)
│   ├── uiConfig.json            (21 lines)
│   └── keyboardShortcuts.json   (15 lines)
├── assets/
│   ├── candy/                   (18 candy bar images, various sizes)
│   └── scavenger/               (12 items, each with 90×90 and 250×250 versions)
└── claude-john-docs/
    ├── Claude-ToBeContinued-2025-09-30.md (latest session)
    ├── Claude-ToBeContinued-2025-09-29-1800.md (scoring system)
    ├── Claude-ToBeContinued-2025-09-29-1652.md (morning session)
    ├── specifications.md (this file)
    └── specifications-technical.md
```

**Total JavaScript Code:** ~1150 lines (enhanced with multi-component scoring)
**Game Data:** 810 lines across 5 JSON files
**Documentation:** 4 comprehensive files

## Screen Layout & Fixed Dimensions

### Main Game Area (Unchanged)
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
- **Content:** Game title, **SCORE breakdown** (Treats/Scavenger/Health/Total), game description
- **Background:** Linear gradient (#3d2817 to #2a1810)

#### Center Game Area (Main Interface)
- **Position:** absolute at (250px, 0)
- **Width:** 950px
- **Height:** 720px
- **Content:** Text adventure output, command input, item interactions
- **Background:** Linear gradient (#1a1410 to #261a10)

#### Right Panel (Reserved for Future - INVENTORY)
- **Position:** absolute at (1030px, 0)
- **Width:** 250px
- **Height:** 720px
- **Content:** INVENTORY list with item (+X) point display
- **Background:** Linear gradient (#3d2817 to #2a1810)

## Data Architecture (STREAMLINED & ENHANCED)

### Unified Item Properties (Streamlined)
**All 17 items now have clean, minimal properties:**

```json
{
  "includeInGame": true,
  "typedName": "snickers",         // One-word command name
  "display": "Snickers mini-bar",  // Display name
  "description": "A fun-size Snickers bar",
  "location": "FOYER",        // Physical room or "INVENTORY"
  "points": 1,                     // Score contribution
  "health": 1,                     // Health value (for eating)
  "eatable": true,                 // Can be eaten
  "visible": true,                 // Visibility control
  "locked": false,                 // Interaction control
  "actions": {
    "examine": "examine text",
    "take": {                      // Pickup capability
      "response": "pickup message",
      "addToInventory": true
    },
    "eat": {                       // Eating capability (optional)
      "response": "eat message",
      "addHealth": 5,
      "removeItem": true
    }
  }
}
```

**Scavenger items additional property:**
```json
{
  "found": false,                  // Tracking for scavenger hunt
  "isScavengerItem": true         // Runtime flag (added during load)
}
```

### INVENTORY as Room Innovation
**Revolutionary approach to inventory management:**
- **INVENTORY room** - Virtual room in rooms-w-doors.json
- **Unified location system** - All items always have location
- **No separate arrays** - Inventory items are just items with location: "INVENTORY"
- **Consistent filtering** - Same code handles room items and inventory items

### Multi-Component Scoring System (NEW)

**Score Components:**
1. **Treats Score** - Points from regular items (candy, bag, etc.)
2. **Scavenger Score** - Points from scavenger hunt items only
3. **Health Score** - Player's current health (starts at 100)
4. **Total Score** - Sum of all three components

**Display Format:**
```
SCORE:
Treats: 2        ← Regular items only
Scavenger: 45    ← Scavenger items only
Health: 100      ← Player health
───────────
Score: 147       ← Total
```

**Item Separation:**
- Regular items: points 0-1, no special flag
- Scavenger items: points 11-20, marked with `isScavengerItem: true` at runtime
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

**Regular Items (7 total):**
- **MUSIC-ROOM**: candy_bag (typedName: "bag") - 0 pts
- **FOYER**: snickers_bar (typedName: "snickers") - 1 pt
- **LIBRARY**: whatchamacallit (typedName: "whatchamacallit") - 1 pt
- **NICE-PORCH**: doorbell (typedName: "doorbell") - 0 pts, fixed
- **NICE-PORCH**: porch_light_nice (typedName: "light") - 0 pts, fixed
- **FRONT-PORCH**: door_knocker (typedName: "knocker") - 0 pts, fixed
- **FRONT-PORCH**: porch_light_front (typedName: "light") - 0 pts, fixed

**Scavenger Items (10 total):**
- **KITCHEN**: item_01 ("item1") - 11 pts, item_02 ("item2") - 12 pts
- **LIBRARY**: item_03 ("item3") - 13 pts, item_04 ("item4") - 14 pts
- **STUDY**: item_05 ("item5") - 15 pts, item_06 ("item6") - 16 pts
- **DINING-ROOM**: item_07 ("item7") - 17 pts, item_08 ("item8") - 18 pts
- **FOYER**: item_09 ("item9") - 19 pts
- **BEDROOM**: item_10 ("item10") - 20 pts

**Total Points Available:**
- Treats: 2 points (snickers + whatchamacallit)
- Scavenger: 155 points (sum of 11-20)
- Health: 100 points (starting value)
- **Maximum Score: 257 points**

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

### Advanced Command Processing Flow
```
User Input: "drop snickers"
↓
findCommand() splits input → extracts "drop" → maps to "drop" command
↓
processCommand() identifies "drop_item" action
↓
handleDropCommand() receives full "drop snickers" input
↓
Extracts "snickers" → finds item by typedName → validates in INVENTORY
↓
Updates item.location from "INVENTORY" to currentRoom
↓
updateGameStatus() refreshes score panel and calculates new total
```

### Item Interaction System (COMPLETE)

#### Room Entry Behavior
1. Load room data and show enterText
2. List available exits
3. **Show visible items automatically** - filtered by visible: true
4. Items appear with display names for easy identification

#### Take Command Validation (6-Step Process)
1. **Item exists** with matching typedName in current room
2. **includeInGame** === true
3. **visible** === true (item is discoverable)
4. **locked** === false (item is not restricted)
5. **Has actions.take** property (item is portable)
6. **actions.take.addToInventory** === true (confirms pickup)

#### Drop Command Validation
1. **Item exists** with matching typedName in INVENTORY
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

## Code Architecture (ENHANCED ENGINE)

### Core Functions (textAdventure.js - 1150 lines)
```javascript
// Data Loading System
loadItems()              // Load items.json
loadScavengerItems()     // Load scavengerItems.json, mark with isScavengerItem
loadRoomsAndDoors()      // Load 16 rooms including INVENTORY
loadCommands()           // Load 10 commands

// Enhanced Game Engine
displayRoom()            // Show room + exits + visible items
movePlayer()             // Handle movement with door validation
processCommand()         // Parse and execute all commands
findCommand()            // Extract first word for command matching

// Item Interaction System (COMPLETE)
handleTakeCommand()      // Complete pickup system with 6-step validation
handleDropCommand()      // Complete drop system with validation
handleExamineCommand()   // Smart examination with portable/fixed rules
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

### Revolutionary Scoring Architecture
```javascript
// Mark scavenger items during load
Object.values(scavengerItems).forEach(item => {
  item.isScavengerItem = true;
});

// Calculate separate score components
let regularItemsScore = 0;
let scavengerScore = 0;

inventory.forEach(item => {
  const points = item.points || 0;
  if (item.isScavengerItem) {
    scavengerScore += points;
  } else {
    regularItemsScore += points;
  }
});

const healthScore = player?.core?.health || 0;
const totalScore = regularItemsScore + scavengerScore + healthScore;

// Update player score
if (player.core) {
  player.core.score = totalScore;
}
```

### Command System Enhancement
**Fallback Commands + JSON Loading:**
- Commands defined in both commands.json AND CONFIG_FALLBACKS
- Handles browser caching and loading failures gracefully
- findCommand() fixed to parse multi-word inputs correctly

## Current Game Experience

### ✅ Complete Interactive Gameplay
**Players can now:**
1. **Navigate** through all 15 rooms with consistent descriptions
2. **Discover items** automatically when entering rooms
3. **Pick up items** using natural commands ("get snickers", "take bag")
4. **Drop items** in any room ("drop snickers", "put bag")
5. **Examine items** with realistic rules (hold portable items, examine fixed items in place)
6. **Track score** with detailed breakdown (Treats, Scavenger, Health, Total)
7. **View inventory** with point values displayed (+X format)
8. **Get help** with updated command list

### ✅ Example Gameplay Session
```
> help
Available commands:
Movement: north (n), south (s), east (e), west (w)
Actions: look (l), inventory (i), help (h), take (get), examine (x), drop (put)

> north
You enter the Radley House foyer.
Exits: south, north, east, west
You see:
  Snickers mini-bar
  Scavenger item #9

> get snickers
You pick up the Snickers bar.

> get item9
You pick up Scavenger item #9.

[SCORE panel updates:]
SCORE:
Treats: 1
Scavenger: 19
Health: 100
───────────
Score: 120

[INVENTORY panel shows:]
INVENTORY:
Snickers mini-bar (+1)
Scavenger item #9 (+19)

> west
You enter the library.

> drop snickers
You drop the Snickers mini-bar.

[SCORE panel updates:]
SCORE:
Treats: 0
Scavenger: 19
Health: 100
───────────
Score: 119

> look
You see:
  Snickers mini-bar
  Whatchamacallit bar
  Scavenger item #3
  Scavenger item #4
```

### ✅ Item Categories Working
**Portable Items (require pickup to examine):**
- candy_bag (0 pts), snickers_bar (1 pt), whatchamacallit (1 pt)
- All 10 scavenger items (11-20 pts each)

**Fixed Items (examine in place):**
- doorbell, door_knocker, porch lights (0 pts each)
- Future: safes, paintings, furniture

## Technical Achievements

### Multi-Component Scoring Benefits
- **Separate tracking** enables gameplay decisions
- **Health as score** creates risk/reward for eating candy
- **Scavenger hunt** has clear progress metric
- **Total score** provides overall achievement measure

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

### Phase 1: Eating System (NEXT - 1-2 hours)
**Eat Command:**
- Add "eat" command to commands.json
- Validate item.eatable property
- Apply actions.eat effects (addHealth, removeItem)
- Update health score in real-time
- Implement health bounds (0-100?)

**Game Over Condition:**
- Health reaches 0 → game over
- Display final score

### Phase 2: Scavenger Hunt Completion (1 session)
**Progress Tracking:**
- Track item.found property
- Display "Scavenger: X/10 found"
- Award bonus points for completion
- Victory condition when all found

### Phase 3: Use Command & Puzzles (1-2 sessions)
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

### Phase 4: Advanced Features (Future)
**Enhanced Gameplay:**
- Health degradation over time
- Walking costs health
- Different foods restore different amounts
- Random item placement modes
- Multiple difficulty levels
- Hint system
- Achievement tracking

## Image Assets & Visual System

### Asset Directory Structure
```
/mnt/d/dev/projects/halloween/games/textAdventure/assets/
├── candy/                  (18 candy bar images)
│   ├── Snickers.png       (354×101)
│   ├── MarsBar.png        (799×261)
│   ├── gummyBears.png     (970×425)
│   └── ... (15 more candy images)
└── scavenger/             (12 scavenger hunt items)
    ├── dog90x90.png       (90×90 thumbnail)
    ├── dog250x250.png     (250×250 display)
    ├── watch90x90.png     (90×90 thumbnail)
    ├── watch250x250.png   (250×250 display)
    ├── _90x90blank.png    (placeholder with "?")
    ├── _250x250blank.png  (placeholder)
    └── ... (10 more items, each with 2 sizes)
```

### Scavenger Hunt Items (12 total)
1. Krugerrand (gold coin)
2. Beatles album
3. Bringing Up Baby (movie)
4. Cat mug
5. Cup o' Noodles
6. Dog figurine
7. Flashlight
8. Gaming mouse
9. Maria Schneider album
10. nVidia graphics card
11. Pumpkin
12. Watch

**Note:** Currently have 10 items in scavengerItems.json but 12 prepared images. Need to either:
- Add 2 more items to JSON
- Remove 2 image sets
- Use 10 items and adjust grid (2×5 or remove 1 for 3×3)

### Visual Scavenger Hunt System (DESIGNED, NOT YET IMPLEMENTED)

**Concept:**
Replace text-based scavenger item list with visual 3×3 grid showing hunt progress.

**Layout Design:**
```
┌─────────────────────────────┐
│  Scavenger Box (313×280px)  │
├─────────────────────────────┤
│  ┌───┬───┬───┐              │
│  │ ? │ ? │ ? │  3×3 Grid    │
│  ├───┼───┼───┤              │
│  │ ? │ ? │ ? │  Each cell:  │
│  ├───┼───┼───┤  99×90px     │
│  │ ? │ ? │ ? │              │
│  └───┴───┴───┘              │
└─────────────────────────────┘
```

**Box Calculations:**
- Total: 313px × 280px
- Border: 2px (each side)
- Padding: 3px (each side) ← Reduced from 10px
- Usable: 303px × 270px
- Grid gaps: 3px
- Cell size: 99px × 90px
- Image size: 90×90px (perfect fit)

**Behavior:**
1. **Initial state:** All 9 cells show `_90x90blank.png` (question mark placeholder)
2. **Item found:** Cell updates to show actual item image (90×90 version)
3. **Progress tracking:** Visual representation of hunt completion (X/9 items found)
4. **Badge feel:** Achievement-style unlocking as items discovered

**Implementation Requirements:**
- CSS Grid layout (3×3, 3px gaps)
- JavaScript function to update cells based on `item.found` property
- Mapping between scavenger items and grid cells (0-8 indices)
- Image swap logic in updateGameStatus()

### Candy Image Display (PLANNED)

**Goal:** Show candy image when examining candy items

**Option 1: Inline Text Buffer Display**
- Insert `<img>` tag into text output
- Size: 200-250px (clearly visible)
- Scrolls away naturally
- Simple implementation (~5 lines)

**Option 2: Temporary Status Box Overlay**
- Absolutely positioned div
- Shows 250×250 image prominently
- Auto-clears on next command
- More complex (~30 lines + CSS)

**Option 3: Split Scavenger Box**
- Top section: Image display (variable)
- Bottom section: Reduced scavenger grid
- Permanent display area

**Decision:** Test Option 1 first, upgrade if scrolling is problematic

## Design Philosophy & Technical Innovation

### Current Approach
**Multi-Component Scoring** - The scoring system creates interesting gameplay decisions. Health as a score component means eating candy provides immediate benefit but uses up health-restoring items for long-term. This creates strategic thinking.

### Key Innovations
1. **INVENTORY as Room** - Revolutionary simplification of item management
2. **Property-Driven Items** - visible/locked/health/eatable properties enable fine-grained game control
3. **Smart Command Parsing** - Robust handling of natural language input
4. **Real-Time Synchronization** - Score panel and text output always match
5. **Runtime Flagging** - isScavengerItem keeps JSON clean while enabling targeted logic
6. **Component Scoring** - Separates scoring into meaningful categories

### Code Quality
- **Clean separation** of concerns between data, logic, and display
- **Consistent patterns** across all item interactions
- **Comprehensive validation** prevents edge cases and errors
- **Self-documenting** code with clear function names and logic flow
- **Minimal properties** in JSON - only what's actually used

---

*This specification documents the complete interactive item system with drop command and multi-component scoring. The game has evolved from a room exploration demo into a proper text adventure with comprehensive item management and meaningful score tracking across Treats, Scavenger Hunt, and Health components.*