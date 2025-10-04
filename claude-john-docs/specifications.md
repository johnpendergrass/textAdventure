# Halloween Text Adventure - Complete Specifications
# v0.27 - USE Command System & UI Redesign

## Project Overview

**Version:** 0.27
**Total Project Size:** ~220KB (with grid assets and fonts)
**Source Files:** 8 core files + 41 items + documentation
**Architecture:** Clean vanilla HTML/CSS/JavaScript with visual scavenger tracking, handwritten notes, and USE command system
**Target Platform:** Web browsers (GitHub Pages compatible)
**Current State:** Fully interactive text adventure with visual 3×3 scavenger grid, handwritten notes display, redesigned status panel with compass, visit tracking, and robust USE command system

## Major Features

### Handwritten Notes Display System ✨ NEW in v0.27
- Google Fonts integration (Caveat) for consistent handwriting across platforms
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

### Redesigned Status Panel ✨ NEW in v0.27
- Scavenger Items and Treats progress tracking
- Three-column command grid with aligned text
- ASCII compass for visual direction reference
- Cleaner, more scannable layout
- No more inventory clutter (use 'i' command instead)

### USE Command System ✨ NEW in v0.27
- Generic USE command for item interactions
- Special handling for doorbell (Mrs. McGillicutty interaction)
- Extensible for future use actions (keys, tools, etc.)
- Replaces auto-actions with player agency

### Room Visit Tracking ✨ NEW in v0.27
- Tracks visits to each room in player.core.visitedRooms
- Supports first/second/repeat enterText variations
- Dynamic descriptions based on game state
- Enables narrative progression (light on → light off)

### HOME/QUIT Command ✨ NEW in v0.27
- QUIT and HOME are synonyms
- Must be typed in UPPERCASE (serves as confirmation)
- Moves player to HOME room with ending message
- Custom background image for game completion

### Enhanced Inventory Display
- Categorized display (Scavenger Items / Items / Treats)
- Progress tracking (X/Total format)
- Scavenger items sorted by room location
- Underlined section headers
- Clean, organized layout

### Item Type Classification
- All items categorized: scavenger, candy, fixed, notes
- Droppable property prevents loss of valuable items
- Type-based rendering (notes use handwritten style)
- Self-documenting JSON structure

## Overall Structure & File Size

### Directory Structure
```
/mnt/d/dev/projects/halloween/games/textAdventure/
├── textAdventure.html           (44 lines)
├── textAdventure.css            (270+ lines, includes notes, compass, grid)
├── textAdventure.js             (~1700 lines, USE system, visit tracking)
├── HALLOWEEN-GAME/
│   ├── gameData.json            (29 lines)
│   ├── rooms-w-doors.json       (360+ lines, visit tracking text)
│   ├── commands.json            (76 lines, 11 commands including USE and QUIT)
│   ├── items.json               (700+ lines, 30 items including doorbell use action)
│   ├── scavengerItems.json      (280+ lines, 11 items with type & droppable)
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
    ├── Claude-ToBeContinued-2025-10-04.md (latest - USE command & UI)
    ├── Claude-ToBeContinued-2025-10-02.md (quest items)
    ├── Claude-ToBeContinued-2025-10-01-1600.md (grid & inventory)
    ├── specifications.md (this file)
    └── specifications-technical.md
```

**Total JavaScript Code:** ~1700 lines (includes USE system, visit tracking, notes rendering)
**Game Data:** 1500+ lines across 6 JSON files
**Total Items:** 41 (11 scavenger + 24 candy + 5 fixed + 1 notes)
**Total Commands:** 11 (including USE and QUIT)

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

#### Right Bottom Panel (Status Box) ✨ UPDATED in v0.27
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

### Item Type System ✨ ENHANCED in v0.27

**All 41 items now classified by type:**

**Type: "scavenger" (11 items)**
- Purpose: Scavenger hunt collectibles
- Points: 10 each
- Droppable: false
- Display: Visual grid + inventory category
- Special: icon90x90, icon250x250, found property

**Type: "candy" (24 items)**
- Purpose: Treat collection
- Points: 1 each
- Droppable: true
- Display: Inventory treats category
- Special: icon150, eatable, health values

**Type: "fixed" (5 items)**
- Purpose: Environmental/utility items
- Points: 0
- Droppable: varies
- Items: doorbell, candy_bag, 2 porch lights, door_knocker
- Special: Can have use/ring/knock actions

**Type: "notes" (1 item) ✨ NEW in v0.27**
- Purpose: Quest items, clues, maps
- Points: 0
- Droppable: false
- Display: Handwritten paper style when examined
- Special: Rendered with Caveat font, paper background

### Universal Item Structure

```json
{
  "includeInGame": true,
  "type": "scavenger" | "candy" | "fixed" | "notes",
  "typedNames": ["primary", "alias1", "alias2"],
  "display": "Display Name",
  "description": "Brief description",
  "location": "ROOM-NAME",
  "points": 0-10,
  "health": -5 to 6,
  "eatable": true/false,
  "droppable": true/false,
  "visible": true/false,
  "locked": false,
  "hasBeenUsed": false,  // For items with use actions (NEW)
  "icon150": "assets/items/name150.png",          // candy items
  "icon90x90": "assets/scavenger/name90x90.png",  // scavenger items
  "icon250x250": "assets/scavenger/name250x250.png", // scavenger items
  "actions": {
    "examine": "examine text",
    "use": {  // NEW action type
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

### Room Structure with Visit Tracking ✨ NEW in v0.27

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

### Command Structure ✨ ENHANCED in v0.27

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
- Interaction: take_item, drop_item, examine_item, examine_room, use_item

## Visual Design Elements

### Handwritten Notes (.notes-text) ✨ NEW in v0.27

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

### Status Panel Components ✨ NEW in v0.27

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
- `.notes-text` - Handwritten paper style - Quest items ✨ NEW

## Game Mechanics

### Complete Command System ✨ ENHANCED in v0.27

**Movement Commands:**
- north (n) - Move north
- south (s) - Move south
- east (e) - Move east
- west (w) - Move west

**Information Commands:**
- help (h, ?) - Show command list
- look (l) - Describe current room
- inventory (i) - Show categorized inventory

**Interaction Commands:**
- take (get, grab, pick) - Pick up items
- examine (x, ex) - Examine items in detail
- drop (put, place) - Drop items
- **use (u) - Use items** ✨ NEW
  - Generic handler for item interactions
  - Special logic for doorbell (Mrs. McGillicutty)
  - Extensible for future use actions

**System Commands:**
- **quit (home) - End game** ✨ NEW
  - Must be typed in UPPERCASE
  - Moves to HOME room
  - Both QUIT and HOME work identically

### Natural Language Command Processing

**Multi-Word Parsing:**
```
"take gummy bears" → strips spaces → matches "gummybears"
"examine reeses pieces" → strips spaces → matches "reesespieces"
"use doorbell" → strips spaces → matches "doorbell"
```

**All inputs:**
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
- Fixed items: Must be in current room
- Shows item.actions.examine text
- **Notes items: Rendered with handwritten style** ✨ NEW

**Use Command:** ✨ NEW in v0.27
- Generic handler for items with use actions
- Validates: item exists, has use action, in room or inventory
- **Special: Doorbell**
  - First use: Shows Mrs. McGillicutty dialogue, adds note, turns off light, marks used
  - Subsequent uses: "You ring and ring, but no one answers."
- Other items: Shows item.actions.use.response

### Room Visit Tracking ✨ NEW in v0.27

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
9. frankenstein - Frankenstein book (LIBRARY, square 6)

**Inactive (includeInGame: false):**
10. watch - Fancy Watch (BEDROOM) - not currently in game
11. gamingmouse - Razer Gaming Mouse (GAME-ROOM) - not currently in game

### Candy/Treats (24 total)

**Distribution across rooms:**
- FOYER: snickers
- LIBRARY: whatchamacallit
- DINING-ROOM: 100grand, apple, lemondrops
- STUDY: 3musketeers, gummybears, lifesavers
- KITCHEN: butterfinger, cannedcorn, reesespieces
- MUSIC-ROOM: smarties
- GAME-ROOM: mars, hersheykisses, popcorn
- BEDROOM: mounds, jollyrancher, rottentomato, spicedrops
- TV-ROOM: mrgoodbar, hotdog, skittles, twizzlers

**Special item:**
- socks: Not eatable (eatable: false)

### Fixed Items (5 total)

1. **doorbell (NICE-PORCH)** - Has use action, triggers Mrs. McGillicutty interaction ✨ UPDATED
2. candy_bag (MUSIC-ROOM) - Trick-or-treat bag, 0 points, takeable
3. porch_light_nice (NICE-PORCH) - Not takeable, visible changes based on doorbell use
4. door_knocker (FRONT-PORCH) - Not takeable, knock action
5. porch_light_front (FRONT-PORCH) - Not visible, not takeable

### Notes/Quest Items (1 total) ✨ NEW in v0.27

1. **mrsmcgillicuttyslist (NICE-HOUSE → auto-moved to INVENTORY)** - Scavenger hunt clues
   - 9 clues matching the 9 active scavenger items
   - Displays in handwritten style when examined
   - Auto-given when doorbell is used first time

## Scoring System

### Current Implementation

**Status Box Display:**
- Scavenger Items: X / 9 - Count of scavenger items in inventory
- Treats: X / 20 - Count of candy items in inventory (max display 20)

**Inventory Display:**
- SCAVENGER ITEMS (X/9) - Shows found/total active scavenger items
- ITEMS - Shows quest items (no count needed)
- TREATS (X/20) - Shows collected/limit candy items

**Not Currently Used:**
- Point values (items still have them but not displayed)
- Health score (property exists but not tracked in UI)
- Total score (not calculated in simplified system)

**Available for Future:**
- Item points still defined (candy: 1, scavenger: 10)
- Health values on eatable items
- Total score calculation possible if needed

## Mrs. McGillicutty Interaction ✨ REDESIGNED in v0.27

**Old Design (v0.26 and earlier):**
- Player went north from NICE-PORCH to NICE-HOUSE
- Auto-take gave list, turned off light, locked door
- Complex door locking logic
- Narrative said door closes but player was inside

**New Design (v0.27):**
- Player stays on NICE-PORCH at all times
- Uses doorbell to trigger interaction
- No room entry, no door locking needed
- NICE-HOUSE preserved but inaccessible

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
- FRONT-PORCH - Entrance to Radley House

**Radley House Interior (9 rooms with scavenger items):**
- FOYER (square 7) - Entry hall, pumpkin
- GAME-ROOM (square 0) - nvidia card
- KITCHEN (square 1) - cup o' noodles
- BEDROOM (square 2) - krugerrand coin
- MUSIC-ROOM (square 3) - Beatles CD
- DINING-ROOM (square 4) - cat mug
- TV-ROOM (square 5) - Bringing Up Baby DVD
- LIBRARY (square 6) - Frankenstein book
- STUDY (square 8) - odd dog

**Special Rooms:**
- HOME - End-game location, accessed via QUIT/HOME command
- INVENTORY - Meta-room for item storage

## Future Development

### Ready to Implement

**Eat Command:**
- Items have eat actions defined
- Health values assigned
- removeItem: true configured
- Just needs command handler

**Image Display on Examine:**
- icon150 property on all candy items
- Images exist in assets/items/
- Ready for inline or overlay display

**Health System:**
- Health property on all items
- Health score tracking code exists
- Just needs UI integration

### Potential Enhancements

**USE Command Expansion:**
- Door knocker use action
- Candy bag use action (organize/sort treats)
- Key items for locked doors
- Tool items for puzzles
- Combination items (use A with B)

**Quest Items:**
- Additional notes with handwritten rendering
- Maps showing room layout
- Keys for locked doors
- Tools for specific puzzles

**Room Features:**
- Locked doors requiring keys
- Puzzles requiring item combinations
- Hidden rooms/passages
- Time-based events

**Inventory Options:**
- Toggle compact/detailed view
- Show item icons
- Sorting options
- Search/filter items

## Version History

### v0.27 (October 4, 2025) ✨ CURRENT
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

*This specification documents the complete USE command system, handwritten notes rendering, redesigned status panel, visit tracking, and refactored Mrs. McGillicutty interaction for Halloween Text Adventure v0.27.*
