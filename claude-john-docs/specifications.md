# Halloween Text Adventure - Complete Specifications
# v0.28 - Command Expansion & Locked Door Mechanics

## Project Overview

**Version:** 0.28
**Total Project Size:** ~225KB (with grid assets and fonts)
**Source Files:** 8 core files + 42 items + documentation
**Architecture:** Clean vanilla HTML/CSS/JavaScript with visual scavenger tracking, handwritten notes, locked doors, hidden items, and expanded command system
**Target Platform:** Web browsers (GitHub Pages compatible)
**Current State:** Fully interactive text adventure with GO command prefix, locked door mechanics, brass key puzzle, hidden bookmark discovery, EAT command, proper item categorization, and interior room exit formatting

## Major Features

### GO Command Prefix Support ✨ NEW in v0.28
- Accept "GO NORTH" in addition to "NORTH"
- Works with all commands (GO TAKE, GO USE, etc.)
- Intuitive for text adventure players
- Strips "go" prefix during command preprocessing
- "go" alone generates appropriate error

### Locked Door System ✨ NEW in v0.28
- Doors can be visible but locked
- Locked doors appear in exits list
- Movement blocked with custom messages
- Doors unlock via special items (knocker, keys)
- Supports invisible doors (secret passages)

### Door Knocker & Key Puzzles ✨ NEW in v0.28
- **Front door knocker**: USE to unlock Radley House entrance
- **Brass key**: Find in library, use at TV-ROOM to unlock bedroom
- Location-based validation (key only works at correct door)
- First use messages, subsequent use handling
- Room state updates after unlocking

### Hidden Item Discovery System ✨ NEW in v0.28
- Items can reveal other items when examined
- Frankenstein book contains hidden bookmark
- Revealed items auto-added to inventory
- Parent items marked as searched to prevent duplication
- Room state displayed after discovery

### Item Type System ✨ ENHANCED in v0.28
- **tools** - Quest items (brass key) with normal styling
- **notes** - Quest items (bookmark, list) with handwritten styling
- **candy** - Treats with eat actions
- **scavenger** - Hunt collectibles
- **fixed** - Environmental items
- Proper inventory categorization and display

### EAT Command ✨ NEW in v0.28
- Consume candy items from inventory
- Shows flavor text and health effects
- Removes item from game
- Updates treats counter
- Validates eatable property and eat action

### Interior Room Exit Formatting ✨ NEW in v0.28
- Nine house rooms show "SOUTH door, NORTH door" format
- Exterior rooms show "north, south" format
- Clearer navigation in complex interior spaces
- Maintains directional awareness

### Inventory System ✨ ENHANCED in v0.28
- Display order: ITEMS, SCAVENGER ITEMS, TREATS
- Tools and notes combined in ITEMS section
- Accurate treats counting (candy only)
- Proper item type filtering

### Handwritten Notes Display System
- Google Fonts integration (Caveat) for consistent handwriting
- Paper-like visual style with cream background and shadow
- Distinct rendering for quest items vs. regular text
- Line breaks preserved for proper formatting
- Applies to all items with type: "notes"

### Visual Scavenger Hunt System
- 3×3 grid showing 9 scavenger item locations
- Background image support
- Items appear when discovered with green checkmark overlay
- Icon halos for visibility against any background
- Spatial mapping to house rooms

### Redesigned Status Panel
- Scavenger Items and Treats progress tracking
- Three-column command grid with aligned text
- ASCII compass for visual direction reference
- Cleaner, more scannable layout
- No more inventory clutter (use 'i' command instead)

### USE Command System
- Generic USE command for item interactions
- Special handling for doorbell (Mrs. McGillicutty)
- Special handling for door knocker (Radley front door) ✨ NEW
- Special handling for brass key (bedroom door) ✨ NEW
- Extensible for future use actions

### Room Visit Tracking
- Tracks visits to each room in player.core.visitedRooms
- Supports first/second/repeat enterText variations
- Dynamic descriptions based on game state
- Enables narrative progression (light on → light off)

### HOME/QUIT Command
- QUIT and HOME are synonyms
- Must be typed in UPPERCASE (serves as confirmation)
- Moves player to HOME room with ending message
- Custom background image for game completion

## Overall Structure & File Size

### Directory Structure
```
/mnt/d/dev/projects/halloween/games/textAdventure/
├── textAdventure.html           (44 lines)
├── textAdventure.css            (270+ lines, includes notes, compass, grid)
├── textAdventure.js             (~1800 lines, GO prefix, locked doors, EAT, reveal system)
├── HALLOWEEN-GAME/
│   ├── gameData.json            (29 lines)
│   ├── rooms-w-doors.json       (390+ lines, locked doors, secret door)
│   ├── commands.json            (82 lines, 12 commands including EAT)
│   ├── items.json               (750+ lines, 32 items including brass key, bookmark)
│   ├── scavengerItems.json      (280+ lines, 11 items with reveal system)
│   ├── uiConfig.json            (21 lines)
│   └── keyboardShortcuts.json   (15 lines)
├── assets/
│   ├── background/              (Background images for scavenger grid)
│   │   ├── HOME250x250.png
│   │   ├── McGillicuttyHouse250x250.png
│   │   └── RadleyHouse250x250.png
│   ├── items/                   (24 candy/food images at 150px dimension)
│   └── scavenger/               (scavenger items: 90×90 and 250×250 versions)
│       └── [item]90x90.png      (scavenger item icons)
└── claude-john-docs/
    ├── Claude-ToBeContinued-2025-10-04.md (latest - v0.28)
    ├── Claude-ToBeContinued-2025-10-02.md (quest items)
    ├── Claude-ToBeContinued-2025-10-01-1600.md (grid & inventory)
    ├── specifications.md (this file)
    └── specifications-technical.md
```

**Total JavaScript Code:** ~1800 lines (includes GO prefix, locked doors, reveal system, EAT command)
**Game Data:** 1600+ lines across 6 JSON files
**Total Items:** 42 (11 scavenger + 23 candy + 1 tools + 2 notes + 5 fixed)
**Total Commands:** 12 (including EAT)

## Screen Layout & Grid System

### Main Game Area
- **Total Size:** 1280px × 720px (completely fixed)
- **Position:** Absolute center using transform
- **Border:** 3px solid #ff6600 (orange)
- **Border Radius:** 15px

### Three-Panel Layout

#### Center Game Area (Main Interface)
- **Position:** 607px wide
- **Content:** Text output, command input, gameplay

#### Right Top Panel (Scavenger Grid)
- **Position:** 313px × 280px
- **Content:** 3×3 scavenger item grid
- **Grid:** CSS Grid with 2px gap
- **Background:** Dynamic background image changes with room
- **Squares:** Transparent, ~95×84px each
- **Display:** Shows found items with icons + green checkmarks

#### Right Bottom Panel (Status Box)
- **Position:** 313px × variable height
- **Content:** SCORE, COMMANDS with grid, ASCII compass
- **Layout:**
```
SCORE:
Scavenger Items: # / 9
Treats:          # / 20

COMMANDS:
(h)elp       (l)ook       (i)nventory
(t)ake       (d)rop       e(x)amine
(u)se        (e)at        HOME

          (n)orth
             |
   (w)est ------ (e)ast
             |
          (s)outh
```

## Data Architecture

### Item Type System ✨ ENHANCED in v0.28

**All 42 items now classified by type:**

**Type: "tools" (1 item) ✨ NEW**
- Purpose: Quest items, keys, utility objects
- Points: 0
- Droppable: false
- Display: Normal text styling (not handwritten)
- Items: brass_key
- Special: Can have use actions, location-based functionality

**Type: "notes" (2 items)**
- Purpose: Quest items, clues, messages
- Points: 0
- Droppable: false
- Display: Handwritten paper style when examined
- Items: oldnote (bookmark), mrsmcgillicuttyslist
- Special: Rendered with Caveat font, paper background

**Type: "scavenger" (11 items)**
- Purpose: Scavenger hunt collectibles
- Points: 10 each
- Droppable: false
- Display: Visual grid + inventory category
- Special: icon90x90, icon250x250, found property, can reveal other items

**Type: "candy" (23 items)**
- Purpose: Treat collection
- Points: 1 each
- Droppable: true
- Display: Inventory treats category
- Special: icon150, eatable, health values, eat actions

**Type: "fixed" (5 items)**
- Purpose: Environmental/utility items
- Points: 0
- Droppable: varies
- Items: doorbell, candy_bag (inactive), 2 porch lights, door_knocker
- Special: Can have use/ring/knock actions

### Universal Item Structure ✨ ENHANCED

```json
{
  "includeInGame": true,
  "type": "tools" | "notes" | "scavenger" | "candy" | "fixed",
  "typedNames": ["primary", "alias1", "alias2"],
  "display": "Display Name",
  "description": "Brief description",
  "location": "ROOM-NAME" | "INVENTORY" | "HIDDEN",
  "points": 0-10,
  "health": -5 to 6,
  "eatable": true/false,
  "droppable": true/false,
  "visible": true/false,
  "locked": false,
  "hasBeenUsed": false,      // For items with use actions
  "revealsItem": "item_key",  // NEW - For items that reveal others
  "hasBeenSearched": false,   // NEW - Prevents re-revealing
  "icon150": "assets/items/name150.png",          // candy items
  "icon90x90": "assets/scavenger/name90x90.png",  // scavenger items
  "icon250x250": "assets/scavenger/name250x250.png", // scavenger items
  "actions": {
    "examine": "examine text",
    "use": {
      "response": "use response text"
    },
    "take": {
      "response": "pickup message",
      "addToInventory": true,
      "markAsFound": true  // scavenger only
    },
    "eat": {  // candy only
      "response": "eat message",
      "addHealth": -5 to 6,
      "removeItem": true
    }
  }
}
```

### Door Structure ✨ ENHANCED in v0.28

```json
{
  "door-id": {
    "between": ["ROOM1", "ROOM2"],
    "description": "door description",
    "visible": true/false,        // false = invisible (secret doors)
    "locked": true/false,         // true = blocks movement
    "open": true/false,
    "lockedMessage": "custom locked message",  // NEW
    "requiresPuzzle": "puzzle-id"  // For puzzle-based locks
  }
}
```

**Door Visibility Logic:**
- **visible: false** → Door doesn't appear in exits list
- **visible: true, locked: true** → Appears in exits, blocks movement with message
- **visible: true, locked: false, open: true** → Appears and allows movement

### Room Structure with Visit Tracking

```json
{
  "name": "Room Name",
  "enterText": {
    "first": "Text shown on first visit",
    "second": "Text shown on second visit (optional)",
    "repeat": "Text shown on third+ visits"
  },
  "lookText": "Text shown with look command",
  "exits": {
    "north": { "to": "OTHER-ROOM", "door": "door-id" }
  },
  "special": {
    "displaySquare": 0-8,  // For scavenger grid mapping
    "backgroundPic": "assets/background/image.png"
  }
}
```

### Command Structure ✨ ENHANCED in v0.28

```json
{
  "command_name": {
    "includeInGame": true,
    "type": "system" | "action" | "movement",
    "shortcuts": ["shortcut1", "shortcut2"],
    "action": "action_name"
  }
}
```

**Action types:**
- Movement: move_north, move_south, move_east, move_west
- System: show_help, show_inventory, quit_game
- Interaction: take_item, drop_item, examine_item, examine_room, use_item, eat_item ✨ NEW

## Visual Design Elements

### Handwritten Notes (.notes-text)

**CSS Styling:**
```css
.notes-text {
  background: #fffef0; /* Cream/ivory paper color */
  color: #2d2d2d; /* Dark gray/black for text */
  font-family: 'Caveat', cursive;
  font-size: 20px;
  padding: 15px 20px;
  margin: 10px 0;
  display: inline-block;
  border: 1px solid #bbb;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  line-height: 1.6;
  white-space: pre-line;
  max-width: 90%;
}
```

**Google Fonts Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');
```

**Usage:** Applied automatically to all items with type: "notes" when examined.

### Status Panel Components

**Command Grid:**
```css
.command-grid {
  display: grid;
  grid-template-columns: auto auto auto;
  column-gap: 10px;
  row-gap: 1px;
  line-height: 1.1;
}
```

**ASCII Compass:**
```css
.compass {
  white-space: pre;
  margin-top: 8px;
  line-height: 1.2;
}
```

### Text Type Classes

- `.prompt-echo` - Yellow (#ffcc00) - Echoed player commands
- `.command-output` - Cyan (#1acdb2) - System messages, exits
- `.flavor-text` - Green (#00ff00) - Descriptions, responses
- `.error-text` - Red (#ff4444) - Error messages
- `.underlined-text` - Underlined - Headers, categories
- `.notes-text` - Handwritten paper style - Quest items

## Game Mechanics

### Complete Command System ✨ ENHANCED in v0.28

**Movement Commands:**
- north (n) - Move north
- south (s) - Move south
- east (e) - Move east
- west (w) - Move west
- **GO prefix supported** ✨ NEW - "go north", "go take apple", etc.

**Information Commands:**
- help (h, ?) - Show command list
- look (l) - Describe current room
- inventory (i) - Show categorized inventory

**Interaction Commands:**
- take (get, grab, pick) - Pick up items
- examine (x, ex) - Examine items in detail
- drop (put, place) - Drop items
- **use (u, ring) - Use items**
  - Generic handler for item interactions
  - Doorbell (Mrs. McGillicutty) ✨ v0.27
  - Door knocker (Radley front door) ✨ NEW
  - Brass key (bedroom door) ✨ NEW
  - Extensible for future use actions
- **eat - Consume candy items** ✨ NEW

**System Commands:**
- **quit (home) - End game**
  - Must be typed in UPPERCASE
  - Moves to HOME room
  - Both QUIT and HOME work identically

### Command Processing Flow ✨ NEW in v0.28

1. **Strip GO prefix** - Remove "go" if followed by another word
2. **Check QUIT/HOME uppercase** - Validate uppercase requirement
3. **Find command** - Exact/shortcut/prefix matching
4. **Execute handler** - Route to appropriate action function

### Natural Language Command Processing

**Multi-Word Parsing:**
```
"take gummy bears" → strips spaces → matches "gummybears"
"examine reeses pieces" → strips spaces → matches "reesespieces"
"use doorbell" → strips spaces → matches "doorbell"
"go north" → removes "go", processes "north"
```

**All inputs:**
- GO prefix stripped first (if present)
- Converted to lowercase (except QUIT/HOME validation)
- Spaces stripped after command extraction
- Matched against typedNames arrays

### Item Interaction

**Take Command:**
- Validates: includeInGame, visible, locked, has take action
- Moves to INVENTORY location
- Sets found = true for scavenger items (markAsFound)
- Updates scavenger grid if scavenger item
- Updates status box

**Drop Command:**
- Checks droppable property
- Prevents dropping scavenger items
- Moves to current room location
- Updates status box

**Examine Command:**
- Portable items: Must be in inventory
- Fixed items: Can be in current room OR inventory ✨ FIXED
- Shows item.actions.examine text
- **Notes items: Rendered with handwritten style**
- **Reveal system: Discovers hidden items** ✨ NEW

**Use Command:** ✨ ENHANCED in v0.28
- Generic handler for items with use actions
- Validates: item exists, has use action, in room or inventory
- **Special: Doorbell**
  - First use: Shows Mrs. McGillicutty dialogue, adds note, turns off light
  - Subsequent: "You ring and ring, but no one answers."
- **Special: Door Knocker** ✨ NEW
  - First use: Unlocks front-porch2foyer door, shows unlock message
  - Subsequent: "The door is already unlocked."
- **Special: Brass Key** ✨ NEW
  - Location check: Must be at TV-ROOM
  - First use: Unlocks bedroom2tv-room door
  - Subsequent: "The bedroom door is already unlocked."
- Other items: Shows item.actions.use.response

**Eat Command:** ✨ NEW in v0.28
- Validates: item in inventory, eatable === true, has eat action
- Shows eat response message
- Removes item via `delete items[itemKey]`
- Updates status panel (treats count decreases)

### Hidden Item Reveal System ✨ NEW in v0.28

**How it works:**
1. Item has `revealsItem` property pointing to hidden item key
2. Hidden item starts with `location: "HIDDEN"`, `visible: false`
3. When parent examined (in inventory):
   - Hidden item moves to INVENTORY
   - Hidden item set to visible: true
   - Parent marked hasBeenSearched: true
   - Room state displayed
4. Prevents re-revealing with hasBeenSearched check

**Example (Frankenstein book):**
```json
"frankenstein": {
  "revealsItem": "oldnote",
  "hasBeenSearched": false
}

"oldnote": {
  "location": "HIDDEN",
  "visible": false
}
```

**Player experience:**
- Take Frankenstein book
- Examine book → "...you notice an old yellowed bookmark..."
- Bookmark auto-added to inventory
- Room state shown
- Can examine bookmark separately

### Locked Door System ✨ NEW in v0.28

**Door States:**
- **Invisible & Locked**: Secret doors (music-room2game-room)
- **Visible & Locked**: Requires item/puzzle (bedroom, front door initially)
- **Visible & Unlocked**: Normal traversable doors

**Movement Logic:**
1. Check if door exists in direction
2. Check if door is locked
3. If locked: Show lockedMessage or default locked text
4. If unlocked: Move to new room

**Exit Display Logic:**
1. Filter exits by door visibility
2. Show all visible doors (even if locked)
3. Format based on room type (interior vs. exterior)

**Unlocking Methods:**
- USE door_knocker at FRONT-PORCH → unlocks front door
- USE brass_key at TV-ROOM → unlocks bedroom door
- Future: Puzzles, combinations, SAY commands

### Interior Room Exit Formatting ✨ NEW in v0.28

**Interior Rooms (9 total):**
- FOYER, LIBRARY, MUSIC-ROOM, GAME-ROOM, KITCHEN, BEDROOM, STUDY, DINING-ROOM, TV-ROOM
- Format: "Exits: SOUTH door, NORTH door, EAST door"

**Exterior Rooms:**
- All other rooms (streets, porches, HOME, etc.)
- Format: "Exits: north, south, east"

**Benefits:**
- Clearer navigation in multi-exit rooms
- Matches house interior aesthetic
- Maintains lowercase simplicity for outdoor areas

### Room Visit Tracking

**How it works:**
1. Count visits: `player.core.visitedRooms.filter(r => r === roomId).length`
2. Select text:
   - 0 visits: enterText.first
   - 1 visit: enterText.second (or repeat if not defined)
   - 2+ visits: enterText.repeat
3. Append room to visitedRooms array

**Example (NICE-PORCH):**
- Visit 1: "The porch light is on, casting a warm welcoming glow."
- Visit 2: "The porch light is off, but you try the bell anyway."
- Visit 3+: "The porch light is off. No one answers the door."

**Dynamic LOOK Command:**
- lookAtRoom() checks current game state
- NICE-PORCH: Describes light based on items.porch_light_nice.visible
- Other rooms: Standard lookText

## Item Distribution

### Tools/Quest Items (1 total) ✨ NEW in v0.28

1. **brass_key (LIBRARY)** - Unlocks bedroom door at TV-ROOM
   - Type: tools
   - Display: brass key
   - Use action: Location-based (TV-ROOM only)
   - Not droppable (quest item)

### Notes/Messages (2 total)

1. **oldnote (HIDDEN → revealed by frankenstein)** ✨ NEW in v0.28
   - Type: notes
   - Display: old bookmark
   - Found inside Frankenstein book when examined
   - Handwritten style rendering
   - Placeholder for future password/clue

2. **mrsmcgillicuttyslist (NICE-HOUSE → auto-moved to INVENTORY)**
   - Type: notes
   - 9 clues matching the 9 active scavenger items
   - Displays in handwritten style when examined
   - Auto-given when doorbell is used first time

### Scavenger Items (11 total, 9 active)

**Active in game (includeInGame: true):**
1. nvidia - NVidia 5090 Video Card (GAME-ROOM, square 0)
2. beatles - Beatles Revolver Music CD (MUSIC-ROOM, square 3)
3. catmug - Cat Mug (DINING-ROOM, square 4)
4. cuponoodles - Cup O' Noodles (KITCHEN, square 1)
5. bringingupbaby - Bringing Up Baby DVD (TV-ROOM, square 5)
6. dog - Odd Dog (STUDY, square 2)
7. krugerrand - Krugerrand gold coin (BEDROOM, square 8)
8. pumpkin - Decorative Pumpkin (FOYER, square 7)
9. **frankenstein - Frankenstein book (LIBRARY, square 6)** ✨ ENHANCED
   - Has revealsItem property
   - Reveals old bookmark when examined
   - hasBeenSearched prevents re-revealing

**Inactive (includeInGame: false):**
10. watch - Fancy Watch (BEDROOM) - not currently in game
11. gamingmouse - Razer Gaming Mouse (GAME-ROOM) - not currently in game

### Candy/Treats (23 total) ✨ UPDATED

**Distribution across rooms:**
- FOYER: snickers
- LIBRARY: whatchamacallit
- DINING-ROOM: 100grand, apple, lemondrops
- STUDY: 3musketeers, gummybears, lifesavers
- KITCHEN: butterfinger, cannedcorn, reesespieces
- MUSIC-ROOM: smarties
- GAME-ROOM: mars, hersheykisses, popcorn
- BEDROOM: mounds, jollyrancher, rottentomato, spicedrops
- TV-ROOM: mrgoodbar, skittles, twizzlers  ✨ UPDATED (hotdog removed)

**Special item:**
- socks: Not eatable (eatable: false)

**All have:**
- Type: "candy"
- Eatable: true (except socks)
- Eat actions with flavor text
- Health values
- removeItem: true

### Fixed Items (5 total)

1. **doorbell (NICE-PORCH)** - Has use action, triggers Mrs. McGillicutty interaction
2. **candy_bag (MUSIC-ROOM)** - Trick-or-treat bag, includeInGame: false (inactive)
3. porch_light_nice (NICE-PORCH) - Not takeable, visible changes based on doorbell use
4. **door_knocker (FRONT-PORCH)** - Has use action, unlocks front door ✨ ENHANCED
5. porch_light_front (FRONT-PORCH) - Not visible, not takeable

## Scoring System

### Current Implementation

**Status Box Display:**
- Scavenger Items: X / 9 - Count of scavenger items in inventory
- Treats: X / 20 - Count of candy items in inventory (max display 20)

**Inventory Display:**
- ITEMS - Shows tools and notes (no count) ✨ UPDATED
- SCAVENGER ITEMS (X/9) - Shows found/total active scavenger items
- TREATS (X/20) - Shows collected/limit candy items

**Treats Counting:** ✨ FIXED in v0.28
- Now correctly counts only candy items (type === "candy")
- Tools and notes excluded from treats count
- Uses item type property instead of isScavengerItem

**Not Currently Used:**
- Point values (items still have them but not displayed)
- Health score (property exists but not tracked in UI)
- Total score (not calculated in simplified system)

**Available for Future:**
- Item points still defined (candy: 1, scavenger: 10)
- Health values on eatable items
- Total score calculation possible if needed

## Mrs. McGillicutty Interaction

**Design (v0.27+):**
- Player stays on NICE-PORCH at all times
- Uses doorbell to trigger interaction
- No room entry, no door locking needed
- NICE-HOUSE preserved but inaccessible (no exits lead to it)

**Implementation:**

**Doorbell Item (items.json):**
```json
"doorbell": {
  "visible": true,
  "hasBeenUsed": false,
  "actions": {
    "use": {
      "response": "The door swings open. Mrs. McGillicutty..."
    }
  }
}
```

**handleUseCommand() Logic:**
1. First use: Display dialogue, add note, turn off light, mark used, call lookAtRoom()
2. Subsequent: "You ring and ring, but no one answers."

**Benefits:**
- More realistic (player doesn't enter house)
- Simpler code (no auto-take, no door locking)
- Better narrative flow (matches the text)
- Player agency (USE instead of automatic)

## Room Layout

### All Rooms (16 total)

**Starting Location:**
- STREET-01 - Starting point, paths to NICE-PORCH and STREET-02

**Mrs. McGillicutty's House:**
- NICE-PORCH - Doorbell interaction, porch light state changes
- NICE-HOUSE - Preserved but inaccessible (no exits lead here)

**Radley House Exterior:**
- STREET-02 - Connects street to Radley House
- FRONT-PORCH - Entrance to Radley House (locked door with knocker) ✨ UPDATED

**Radley House Interior (9 rooms with scavenger items):**
- FOYER (square 7) - Entry hall, pumpkin
- GAME-ROOM (square 0) - nvidia card, secret door north (invisible) ✨ UPDATED
- KITCHEN (square 1) - cup o' noodles
- BEDROOM (square 2) - krugerrand coin, locked door south ✨ UPDATED
- MUSIC-ROOM (square 3) - Beatles CD, secret door north (invisible) ✨ UPDATED
- DINING-ROOM (square 4) - cat mug
- TV-ROOM (square 5) - Bringing Up Baby DVD, locked bedroom door north ✨ UPDATED
- LIBRARY (square 6) - Frankenstein book (reveals bookmark), brass key ✨ UPDATED
- STUDY (square 8) - odd dog

**Special Rooms:**
- HOME - End-game location, accessed via QUIT/HOME command
- INVENTORY - Meta-room for item storage
- HIDDEN - Meta-location for unrevealed items ✨ NEW

## Door Mechanics ✨ NEW in v0.28

### Door Configuration

**12 Doors Total:**

**Unlocked Doors (9):**
- street-012street-02 (STREET-01 ↔ STREET-02)
- street-012nice-porch (STREET-01 ↔ NICE-PORCH)
- nice-porch2nice-house (NICE-PORCH ↔ NICE-HOUSE, but no exit from NICE-PORCH)
- street022front-porch (STREET-02 ↔ FRONT-PORCH)
- foyer2library (FOYER ↔ LIBRARY)
- foyer2study (FOYER ↔ STUDY)
- foyer2dining-room (FOYER ↔ DINING-ROOM)
- And other interior connections

**Locked Doors (2):**
1. **front-porch2foyer** (FRONT-PORCH ↔ FOYER)
   - Initially locked
   - Unlocked by: USE door_knocker at FRONT-PORCH
   - Message: Door creaks open text

2. **bedroom2tv-room** (BEDROOM ↔ TV-ROOM)
   - Initially locked
   - Unlocked by: USE brass_key at TV-ROOM
   - Message: "The bedroom door is locked. You'll need a key to open it."

**Secret/Invisible Doors (1):**
3. **music-room2game-room** (MUSIC-ROOM ↔ GAME-ROOM)
   - Initially invisible (visible: false) and locked
   - Future: Button to make visible, puzzle to unlock
   - Puzzle: "say-friend" (Speak, friend, and enter)

### Door Properties

```json
{
  "visible": true/false,     // Appears in exits list?
  "locked": true/false,      // Blocks movement?
  "open": true/false,        // Door state
  "lockedMessage": "text",   // Custom locked message
  "requiresPuzzle": "id"     // For puzzle-based locks
}
```

## Future Development

### Ready to Implement

**Secret Door Mechanism:**
- Add button item to MUSIC-ROOM
- USE BUTTON → sets music-room2game-room visible: true
- North exit appears in MUSIC-ROOM
- Implement SAY command for puzzle
- SAY FRIEND → unlocks door

**Bookmark Password/Clue:**
- Update old bookmark examine text
- Add password or puzzle solution
- Use for safe, door code, or quest progression

**Image Display on Examine:**
- icon150 property on all candy items
- icon90x90, icon250x250 on scavenger items
- Images exist in assets/
- Ready for inline or overlay display

**Health System:**
- Health property on all items
- Eat actions modify health
- Display health in status panel
- Game over at 0 health?

### Potential Enhancements

**USE Command Expansion:**
- More keys for more doors
- Candy bag use action (organize/sort treats)
- Tool items for puzzles
- Combination items (use A with B)
- Context-sensitive uses

**SAY Command:**
- Verbal puzzle solutions
- Password entry
- Spell casting
- NPC dialogue

**Quest Items:**
- Additional notes with handwritten rendering
- Maps showing room layout
- More hidden items in containers
- Item combinations

**Room Features:**
- More locked doors requiring keys
- Puzzles requiring item combinations
- Hidden rooms/passages (more invisible doors)
- Time-based events
- Random events

**Inventory Options:**
- Toggle compact/detailed view
- Show item icons
- Sorting options
- Search/filter items

## Version History

### v0.28 (October 4, 2025) ✨ CURRENT
- ✨ Added GO command prefix support (go north, go take, etc.)
- ✨ Implemented locked door system (visible but blocks movement)
- ✨ Added door knocker unlock mechanism for Radley front door
- ✨ Added brass key puzzle (find in library, use at TV-ROOM)
- ✨ Implemented hidden item reveal system (bookmark in Frankenstein book)
- ✨ Created "tools" item type (brass key)
- ✨ Renamed/reorganized notes (bookmark vs. list)
- ✨ Implemented EAT command (consume candy, update treats count)
- ✨ Added interior room exit formatting (SOUTH door, NORTH door)
- ✨ Set up secret door (music-room2game-room, invisible & locked)
- ✨ Fixed treats counting to only count candy items
- ✨ Fixed examine logic for items without take actions in inventory
- ✨ Reorganized inventory display order (ITEMS, SCAVENGER, TREATS)
- ✨ Added RING as synonym for USE command

### v0.27 (October 4, 2025)
- ✨ Added handwritten notes display system with Caveat font
- ✨ Redesigned status panel with compass and command grid
- ✨ Implemented room visit tracking with first/second/repeat text
- ✨ Added HOME/QUIT command (uppercase required)
- ✨ Implemented USE command system
- ✨ Refactored Mrs. McGillicutty interaction to use doorbell
- ✨ Added dynamic lookAtRoom() descriptions
- ✨ Added blank line spacing between description and exits

### v0.26 (October 2, 2025)
- Added Mrs. McGillicutty's List item
- Implemented "notes" item type
- Enhanced inventory with ITEMS category
- Auto-take mechanism for quest items

### v0.24 (October 1, 2025 - Afternoon)
- Added 3×3 visual scavenger grid
- Implemented type property system (scavenger/candy/fixed)
- Added droppable property to prevent item loss
- Redesigned inventory with categories and progress
- Simplified status box
- Added room displaySquare mapping
- Added green checkmark overlay for found items
- Added white glow effect to scavenger icons

### v0.23 (October 1, 2025 - Morning)
- Universal typedNames array migration
- 22 new candy/food items added (29 total)
- icon150 property for image support
- Enhanced multi-word command parsing

### v0.22 (September 30, 2025)
- Location property refactoring
- INVENTORY as room concept

---

*This specification documents the complete locked door system, GO command prefix, hidden item reveal mechanism, EAT command, brass key puzzle, interior room formatting, and expanded item type system for Halloween Text Adventure v0.28.*
