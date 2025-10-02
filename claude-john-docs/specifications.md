# Halloween Text Adventure - Complete Specifications
# v0.24 - Visual Scavenger Grid & Enhanced Inventory System

## Project Overview

**Version:** 0.24
**Total Project Size:** ~200KB (with grid assets)
**Source Files:** 8 core files + 40 items + documentation
**Architecture:** Clean vanilla HTML/CSS/JavaScript with visual scavenger tracking
**Target Platform:** Web browsers (GitHub Pages compatible)
**Current State:** Fully interactive text adventure with visual 3×3 scavenger grid, categorized inventory, 40 items with type classification

## Major Features

### Visual Scavenger Hunt System ✨ NEW
- 3×3 grid showing 9 scavenger item locations
- Background image support
- Items appear when discovered with green checkmark overlay
- Icon halos for visibility against any background
- Spatial mapping to house rooms

### Enhanced Inventory Display ✨ NEW
- Categorized display (Scavenger Items / Treats)
- Progress tracking (X/Total format)
- Scavenger items sorted by room location
- Underlined section headers
- Clean, organized layout

### Item Type Classification ✨ NEW
- All items categorized: scavenger, candy, or fixed
- Droppable property prevents loss of valuable items
- Self-documenting JSON structure

## Overall Structure & File Size

### Directory Structure
```
/mnt/d/dev/projects/halloween/games/textAdventure/
├── textAdventure.html           (44 lines)
├── textAdventure.css            (200+ lines, includes grid styles)
├── textAdventure.js             (~1540 lines, grid + inventory)
├── HALLOWEEN-GAME/
│   ├── gameData.json            (29 lines)
│   ├── rooms-w-doors.json       (360+ lines, with displaySquare properties)
│   ├── commands.json            (64 lines, 10 commands)
│   ├── items.json               (640+ lines, 29 items with type & droppable)
│   ├── scavengerItems.json      (280+ lines, 11 items with type & droppable)
│   ├── uiConfig.json            (21 lines)
│   └── keyboardShortcuts.json   (15 lines)
├── assets/
│   ├── items/                   (24 candy/food images at 150px dimension)
│   └── scavenger/               (scavenger items: 90×90 and 250×250 versions)
│       ├── default250x250.png   (grid background image)
│       └── [item]90x90.png      (scavenger item icons)
└── claude-john-docs/
    ├── Claude-ToBeContinued-2025-10-01-1600.md (latest - grid & inventory)
    ├── Claude-ToBeContinued-2025-10-01.md (typedNames migration)
    ├── Claude-ToBeContinued-2025-09-30.md (location refactoring)
    ├── specifications.md (this file)
    └── specifications-technical-v0.23-updates.md
```

**Total JavaScript Code:** ~1540 lines (includes scavenger grid system)
**Game Data:** 1400+ lines across 5 JSON files
**Total Items:** 40 (24 candy + 11 scavenger + 5 fixed)

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

#### Right Top Panel (Scavenger Grid) ✨ NEW
- **Position:** 313px × 280px
- **Content:** 3×3 scavenger item grid
- **Grid:** CSS Grid with 2px gap
- **Background:** Supports full-bleed background image
- **Squares:** Transparent, ~95×84px each
- **Display:** Shows found items with icons + green checkmarks

#### Right Bottom Panel (Status Box)
- **Position:** 313px × variable height
- **Content:** SCORE display, COMMANDS reference
- **Score Format:** `Treats: X / 20`
- **Commands:** Help reference (unchanged)

## Data Architecture

### Item Type System ✨ NEW

**All 40 items now classified by type:**

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
- Droppable: true (except where not takeable)
- Items: candy_bag, doorbell, porch_light_nice, door_knocker, porch_light_front

### Universal Item Structure

```json
{
  "includeInGame": true,
  "type": "scavenger" | "candy" | "fixed",        // ✨ NEW
  "typedNames": ["primary", "alias1", "alias2"],
  "display": "Display Name",
  "description": "Brief description",
  "location": "ROOM-NAME",
  "points": 0-10,
  "health": -5 to 6,
  "eatable": true/false,
  "droppable": true/false,                        // ✨ NEW
  "visible": true/false,
  "locked": false,
  "icon150": "assets/items/name150.png",          // candy items
  "icon90x90": "assets/scavenger/name90x90.png",  // scavenger items
  "icon250x250": "assets/scavenger/name250x250.png", // scavenger items
  "actions": {
    "examine": "examine text",
    "take": {
      "response": "pickup message",
      "addToInventory": true,
      "markAsFound": true                         // scavenger only
    },
    "eat": {                                      // candy only
      "response": "eat message",
      "addHealth": -5 to 6,
      "removeItem": true
    }
  }
}
```

**Scavenger items additional:**
```json
{
  "found": false  // Tracks discovery status
}
```

**Runtime properties (added by code):**
```json
{
  "isScavengerItem": true,              // Added at load time
  "originalLocation": "ROOM-NAME"       // Saves starting room for grid
}
```

### Room DisplaySquare System ✨ NEW

**9 rooms map to grid squares (0-8):**

```json
"ROOM-NAME": {
  "special": {
    "displaySquare": 0-8    // Grid position
  }
}
```

**Grid mapping:**
```
0: GAME-ROOM    1: KITCHEN       2: BEDROOM
3: MUSIC-ROOM   4: DINING-ROOM   5: TV-ROOM
6: LIBRARY      7: FOYER         8: STUDY
```

## Visual Scavenger Grid System ✨ NEW

### Grid Specifications

**Container:** `.scavenger` div
- Size: 313px × 280px
- Layout: CSS Grid 3×3
- Gap: 2px
- Padding: 2px
- Overflow: hidden

**Background:**
- Image: `url('assets/scavenger/default250x250.png')`
- Size: cover (fills entire container)
- Position: center
- Repeat: no-repeat
- Fallback: black

**Grid Squares:** `.scavenger-square`
- Size: ~95×84px (1fr with gaps)
- Background: transparent
- Border: 1px solid transparent (no visual lines)
- Display: flex, centered
- Position: relative (for checkmark positioning)

**Item Icons:**
- Size: 90×90px
- Fit: object-fit: contain
- Effect: White glow/halo
  - Inner: drop-shadow(0 0 2px rgba(255,255,255,0.8))
  - Outer: drop-shadow(0 0 4px rgba(255,255,255,0.5))
- Display: Only when item.found === true

**Found Indicator:** `.scavenger-square.found::after`
- Content: "✓"
- Position: Absolute, top: 4px, left: 4px
- Size: 20px circle
- Background: #22c55e (green)
- Color: white
- Font: 14px bold
- Shadow: 0 2px 4px rgba(0,0,0,0.3)

### Grid Update Logic

**Initial Load:**
1. `initScavengerGrid()` called on game start
2. Creates 9 squares (indexes 0-8)
3. All squares transparent, background shows through

**Item Discovery:**
1. Player uses `take` command on scavenger item
2. `handleTakeCommand()` sets `item.found = true`
3. Calls `updateScavengerGrid()`
4. Grid updates to show:
   - Item's icon90x90 image in correct square
   - Green checkmark overlay in top-left
   - White glow around icon

**Mapping Process:**
1. Loop through squares 0-8
2. Find room with `special.displaySquare === squareIndex`
3. Find scavenger item with `originalLocation === roomName`
4. If `item.found === true`: display icon + checkmark
5. If not found: square remains empty/transparent

## Enhanced Inventory System ✨ NEW

### Display Format

```
You are carrying:
SCAVENGER ITEMS (3/9)
───────────────────── (underlined text)
  NVidia 5090 Video Card
  Cat Mug
  Decorative Pumpkin

TREATS (5/20)
──────────── (underlined text)
  Snickers mini-bar, Gummy Bears, Apple, Popcorn, Skittles
```

### Display Features

**Categorization:**
- Scavenger items shown first (type === "scavenger")
- Treats shown second (type === "candy")
- Blank line separator between categories
- Fixed items not shown in inventory display

**Scavenger Items:**
- One item per line
- Sorted by room displaySquare (0-8)
- Maintains spatial relationship to grid
- Progress: (current/total) e.g., (3/9)

**Treats:**
- Comma-separated on single line
- No specific sorting
- Progress: (current/max) e.g., (5/20)
- Max hardcoded at 20

**Headers:**
- CSS underlined text (text-decoration: underline)
- Progress counts included in header
- Format: `CATEGORY (X/Total)`

**No Point Values:**
- Removed (+1) (+10) displays
- Cleaner, simpler appearance

### Implementation

**Code location:** `showInventory()` function (textAdventure.js ~675-742)

**Process:**
1. Filter inventory items by type
2. Count total scavenger items (all with type === "scavenger")
3. Sort scavenger items by room.special.displaySquare
4. Format headers with counts
5. Display scavenger items (one per line)
6. Display treats (comma-separated)

## Simplified Status Box ✨ NEW

### Current Display

```
SCORE:
Treats: 12 / 20

COMMANDS:
(h)elp (l)ook (i)nventory
(n)orth (s)outh (e)ast (w)est
```

### Changes from Previous Version

**Removed:**
- INVENTORY section (now via 'i' command only)
- Scavenger score display
- Health score display
- Total score display
- Score divider line

**Kept:**
- Treats count with limit (X / 20)
- COMMANDS reference section

**Benefits:**
- Cleaner, less cluttered
- Focuses on treat collection limit
- Inventory accessible via command
- More screen space for scavenger grid

## Droppable Property System ✨ NEW

### Purpose
Prevents players from accidentally dropping valuable scavenger items

### Implementation

**JSON Configuration:**
- All items now have `"droppable": true | false`
- Scavenger items: `"droppable": false`
- Candy items: `"droppable": true`
- Fixed items: `"droppable": true`

**Code Enforcement:**
```javascript
// In handleDropCommand()
if (item.droppable === false) {
  addToBuffer([
    { text: "You worked hard to find this treasure! You cannot drop it.",
      type: "error" }
  ]);
  return;
}
```

**Location:** textAdventure.js ~833-842

## Game Mechanics

### Complete Command System

**Movement:** north (n), south (s), east (e), west (w)
**Information:** help (h), look (l), inventory (i)
**Interaction:** take (get/grab/pick), examine (x/ex), drop (put/place)

### Natural Language Command Processing

**Multi-Word Parsing:**
```
"take gummy bears" → strips spaces → matches "gummybears"
"examine reeses pieces" → strips spaces → matches "reesespieces"
"get mr goodbar" → strips spaces → matches "mrgoodbar"
```

**All inputs:**
- Converted to lowercase
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
- Checks droppable property ✨ NEW
- Prevents dropping scavenger items
- Moves to current room location
- Updates status box

**Examine Command:**
- Portable items: Must be in inventory
- Fixed items: Must be in current room
- Shows item.actions.examine text

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

1. candy_bag (MUSIC-ROOM) - Trick-or-treat bag, 0 points, takeable
2. doorbell (NICE-PORCH) - Not visible, not takeable, ring action
3. porch_light_nice (NICE-PORCH) - Not takeable, examine only
4. door_knocker (FRONT-PORCH) - Not takeable, knock action
5. porch_light_front (FRONT-PORCH) - Not visible, not takeable

## Scoring System

### Current Implementation

**Status Box Display:**
- Treats: X / 20 (count of candy items in inventory, max display 20)

**Inventory Display:**
- Scavenger: (X/9) - shows found/total active scavenger items
- Treats: (X/20) - shows collected/limit candy items

**Not Currently Used:**
- Point values (items still have them but not displayed)
- Health score (property exists but not tracked in UI)
- Total score (not calculated in simplified system)

**Available for Future:**
- Item points still defined (candy: 1, scavenger: 10)
- Health values on eatable items
- Total score calculation possible if needed

## CSS Styling Additions ✨ NEW

### Grid Styles

```css
.scavenger {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 2px;
  background-image: url('assets/scavenger/default250x250.png');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: black;
  padding: 2px;
  overflow: hidden;
}

.scavenger-square {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  position: relative;
}

.scavenger-square.found::after {
  content: "✓";
  position: absolute;
  top: 4px;
  left: 4px;
  width: 20px;
  height: 20px;
  background: #22c55e;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.scavenger-square img {
  max-width: 100%;
  max-height: 100%;
  width: 90px;
  height: 90px;
  object-fit: contain;
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.8))
    drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
}

.underlined-text {
  text-decoration: underline;
}
```

## JavaScript Functions ✨ NEW

### Scavenger Grid Functions

**initScavengerGrid()** (line ~1119)
- Called on game initialization
- Calls updateScavengerGrid()

**updateScavengerGrid()** (lines ~1124-1165)
- Creates 9 div.scavenger-square elements
- Maps squares to rooms via displaySquare
- Finds items by originalLocation
- Displays icon90x90 if item.found === true
- Adds "found" class for checkmark overlay

**Called from:**
- Initial game load: initScavengerGrid() at startup
- Item pickup: handleTakeCommand() after markAsFound

### Enhanced Inventory Function

**showInventory()** (lines ~675-742)
- Filters items by type
- Counts total scavenger items
- Sorts scavenger by displaySquare
- Formats with underlined headers
- Shows progress (X/Total)
- Categorized display

**New text type:**
- "underlined" type added to updateDisplay() switch
- Maps to .underlined-text CSS class

## Technical Architecture

### Type System Benefits

**Self-documenting:**
- JSON clearly shows item purpose
- No guessing about item category
- Easy to understand at a glance

**Cleaner code:**
- `item.type === "scavenger"` vs `item.isScavengerItem`
- Consistent property names
- Easier to filter and categorize

**Future-proof:**
- Easy to add new types (keys, quest items, tools)
- Extensible without code changes
- Supports complex item hierarchies

### Grid-Room Mapping

**Spatial relationship maintained:**
- Grid layout matches house floor plan
- Items appear in logical positions
- Visual representation of physical space

**Easy reconfiguration:**
- Change displaySquare values to rearrange grid
- No code changes needed
- Self-contained in room definitions

### Runtime Property System

**Load-time additions:**
- `isScavengerItem: true` - Backward compatibility
- `originalLocation: "ROOM"` - Grid mapping support

**Why not in JSON:**
- Keeps JSON clean and minimal
- Calculated values, not configuration
- Added programmatically for consistency

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

**Grid Interactivity:**
- Click square for location hint
- Hover for item name preview
- Visual feedback on hover

**Inventory Options:**
- Toggle compact/detailed view
- Show item icons
- Sorting options

**Additional Item Types:**
- Keys for locked doors
- Quest items for puzzles
- Tools for special actions

**Command Shortcuts:**
- Add "g" for get
- Add "d" for drop
- Single-letter efficiency

## Asset Requirements

### Required Assets

**Grid Background:**
- default250x250.png - Background image for scavenger grid

**Scavenger Item Icons:**
- [item]90x90.png - 9 active scavenger items
- Used in grid display when found
- Should have transparent backgrounds for proper display

**Candy Item Icons:**
- [item]150.png - 24 candy items
- Ready for examine command image display
- Currently loaded but not displayed

### Asset Specifications

**Grid background:**
- Size: 250×250px or larger
- Format: PNG (supports transparency if needed)
- Location: assets/scavenger/default250x250.png
- Display: Cover sizing (crops to fit 313×280 container)

**Scavenger icons:**
- Size: 90×90px
- Format: PNG with transparency recommended
- Effects: White glow added by CSS
- Checkmark: Generated by CSS (not in image)

**Candy icons:**
- Size: ~150px (one dimension)
- Format: PNG
- Not currently displayed (future feature)

## Version History

### v0.24 (October 1, 2025 - Afternoon)
- ✨ Added 3×3 visual scavenger grid
- ✨ Implemented type property system (scavenger/candy/fixed)
- ✨ Added droppable property to prevent item loss
- ✨ Redesigned inventory with categories and progress
- ✨ Simplified status box (removed complex scoring)
- ✨ Added room displaySquare mapping
- ✨ Added green checkmark overlay for found items
- ✨ Added white glow effect to scavenger icons
- ✨ Added underlined text CSS class

### v0.23 (October 1, 2025 - Morning)
- Universal typedNames array migration
- 22 new candy/food items added (29 total)
- icon150 property for image support
- Enhanced multi-word command parsing
- Space-stripping algorithm
- Scavenger items property renamed typedName → typedNames

### v0.22 (September 30, 2025)
- Location property refactoring
- INVENTORY as room concept

---

*This specification documents the complete visual scavenger hunt system with 3×3 grid display, type classification, droppable property enforcement, and enhanced categorized inventory with progress tracking.*
