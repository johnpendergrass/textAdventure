# Claude ToBeContinued - 2025-10-04
# Major Gameplay Enhancements & Command System Expansion

## Current State of Project

Today's session involved significant enhancements to the command system, locked door mechanics, hidden item discovery, inventory management, and quality-of-life improvements. We implemented GO command support, EAT command, brass key door unlocking, hidden bookmark discovery in the Frankenstein book, interior room exit formatting, and fixed several bugs.

## Major Accomplishments Completed (October 4, 2025)

### ✅ GO Command Prefix Support

**Problem solved:** Players expect to type "GO NORTH" in text adventures, not just "NORTH".

**Implementation:**
- Added command preprocessing in `processCommand()` before any other checks
- Strips "go" prefix if present and followed by another word
- Works with all commands, not just directions

**Code (textAdventure.js ~line 1485):**
```javascript
// Strip "go" prefix if present (support "go north", "go take apple", etc.)
const words = command.trim().split(/\s+/);
if (words.length > 1 && words[0].toLowerCase() === 'go') {
  command = words.slice(1).join(' ');
}
```

**Examples:**
- "go north" → processes as "north"
- "go take apple" → processes as "take apple"
- "GO USE KEY" → processes as "USE KEY"
- "go" alone → error message (expected behavior)

**Files modified:**
- textAdventure.js - Added GO prefix stripping

### ✅ RING as Synonym for USE

**Problem solved:** "RING DOORBELL" is more intuitive than "USE DOORBELL".

**Implementation:**
- Added "ring" to shortcuts array for USE command
- No functionality changes needed - ring maps to use_item action

**Code (commands.json):**
```json
"use": {
  "shortcuts": ["u", "ring"]
}
```

**Files modified:**
- commands.json - Added "ring" shortcut

### ✅ Door Knocker & Front Door Unlocking

**Problem solved:** Radley House front door needed to start locked, unlock with door knocker.

**Implementation:**

**Door Setup (rooms-w-doors.json):**
```json
"front-porch2foyer": {
  "locked": true,
  "open": false
}
```

**Door Knocker Item (items.json):**
```json
"door_knocker": {
  "visible": true,
  "hasBeenUsed": false,
  "typedNames": ["knocker", "doorknocker", "door", ...],
  "actions": {
    "use": {
      "response": "KNOCK KNOCK! ... You hear a loud CLICK as the door unlatches. The heavy door creaks open."
    }
  }
}
```

**Handler Logic (textAdventure.js ~line 1180):**
- First use: Shows message, unlocks door, marks as used, calls lookAtRoom()
- Subsequent uses: "The door is already unlocked."

**Player Experience:**
1. Arrive at FRONT-PORCH → sees only "south" exit (north hidden because locked)
2. USE KNOCKER → door unlocks and opens
3. North exit appears, can enter Radley House

**Files modified:**
- rooms-w-doors.json - Locked front-porch2foyer door
- items.json - Added use action to door_knocker, added "door" to typedNames
- textAdventure.js - Added door_knocker special handling in handleUseCommand()

### ✅ Locked Doors Visible in Exits List

**Problem solved:** Locked doors should appear in exits list but block movement when tried.

**Previous behavior:** Locked doors were hidden from exits list
**New behavior:** Locked doors shown in exits, movement blocked with message

**Implementation:**

**Exit Filtering Logic Change (textAdventure.js ~line 647, 1290):**
```javascript
// OLD: Only show if door is visible AND (unlocked OR open)
return doorData.visible && (!doorData.locked || doorData.open);

// NEW: Only show if door is visible
return doorData.visible;
```

**Result:**
- Locked doors appear: "Exits: NORTH door, SOUTH door, WEST door"
- Player types "n" → "The bedroom door is locked. You'll need a key to open it."
- After unlocking → player can proceed north

**Files modified:**
- textAdventure.js - Simplified door visibility filtering in displayRoom() and lookAtRoom()

### ✅ Brass Key & Locked Bedroom Door

**Problem solved:** Needed quest item (key) to unlock a door, teaching USE mechanic.

**Implementation:**

**Bedroom Door (rooms-w-doors.json):**
```json
"bedroom2tv-room": {
  "description": "It is a heavy wooden door.",
  "locked": true,
  "open": false,
  "lockedMessage": "The bedroom door is locked. You'll need a key to open it."
}
```

**Brass Key Item (items.json):**
```json
"brass_key": {
  "type": "tools",
  "location": "LIBRARY",
  "hasBeenUsed": false,
  "actions": {
    "use": {
      "response": "You insert the brass key into the bedroom door lock and turn it. CLICK! The door unlocks."
    }
  }
}
```

**Handler Logic (textAdventure.js ~line 1205):**
- Checks if at TV-ROOM (where bedroom door is located)
- If elsewhere: "There's nothing to unlock here."
- First use: Unlocks bedroom2tv-room door, marks key as used
- Subsequent uses: "The bedroom door is already unlocked."

**Player Experience:**
1. TV-ROOM shows: "Exits: NORTH door, SOUTH door, WEST door"
2. Try north → "The bedroom door is locked. You'll need a key to open it."
3. Find brass key in LIBRARY
4. Return to TV-ROOM, "use key"
5. Door unlocks, can now enter BEDROOM

**Files modified:**
- rooms-w-doors.json - Locked bedroom2tv-room door with custom message
- items.json - Added hasBeenUsed, use action to brass_key
- textAdventure.js - Added brass_key special handling in handleUseCommand()

### ✅ Hidden Bookmark Discovery in Frankenstein Book

**Problem solved:** Need quest items that are discovered when examining other items.

**Implementation:**

**Frankenstein Book (scavengerItems.json):**
```json
"frankenstein": {
  "revealsItem": "oldnote",
  "hasBeenSearched": false,
  "actions": {
    "examine": "The book is a First Edition... As you riffle through the pages you notice an old yellowed bookmark inside the cover. You take the bookmark."
  }
}
```

**Bookmark Item (items.json):**
```json
"oldnote": {
  "type": "notes",
  "typedNames": ["bookmark", "oldbookmark", "frankensteinbookmark"],
  "display": "old bookmark",
  "location": "HIDDEN",
  "visible": false,
  "actions": {
    "examine": "An old yellowed bookmark with faded writing on it. [Generic text for now - can add password/clue later]"
  }
}
```

**Reveal Logic (textAdventure.js ~line 1069):**
```javascript
if (item.revealsItem && !item.hasBeenSearched) {
  const revealedItem = items[item.revealsItem];
  if (revealedItem && revealedItem.location === "HIDDEN") {
    revealedItem.location = "INVENTORY";
    revealedItem.visible = true;
    item.hasBeenSearched = true;
    updateGameStatus();
    // Show current room state after revealing item
    addToBuffer([{ text: "", type: "flavor" }]);
    lookAtRoom();
  }
}
```

**Player Experience:**
1. Take Frankenstein book
2. Examine book → see text about finding bookmark
3. Bookmark auto-added to inventory
4. Room state displayed (exits, items)
5. Can examine bookmark separately for clues/password

**Files modified:**
- scavengerItems.json - Added revealsItem, hasBeenSearched to frankenstein
- items.json - Created oldnote (bookmark) item with HIDDEN location
- textAdventure.js - Added reveal item logic in handleExamineCommand(), fixed examine for inventory items without take action

### ✅ Item Type System & Inventory Reordering

**Problem solved:** Needed clear item categories and proper inventory display order.

**Item Types:**
- **tools** - Quest items like brass key (normal text styling)
- **notes** - Quest items like bookmark, Mrs. McGillicutty's list (handwritten styling)
- **candy** - Treats to collect (type: "candy")
- **scavenger** - Scavenger hunt items (type: "scavenger")
- **fixed** - Environmental items like doorbell, porch lights

**Inventory Display Order (changed):**
1. **ITEMS** - tools and notes combined
2. **SCAVENGER ITEMS (X/9)**
3. **TREATS (X/20)**

**Implementation (textAdventure.js ~line 756):**
```javascript
const toolItems = inventoryItems.filter((item) => item.type === "tools");
const noteItems = inventoryItems.filter((item) => item.type === "notes");
const questItems = [...toolItems, ...noteItems];
```

**Display Format:**
```
You are carrying:
ITEMS
  brass key
  old bookmark
  Mrs. McGillicutty's List

SCAVENGER ITEMS (2/9)
  Frankenstein book
  Decorative Pumpkin

TREATS (2/20)
  Snickers mini-bar, Whatchamacallit bar
```

**Files modified:**
- items.json - Changed brass_key type from "fixed" to "tools"
- textAdventure.js - Added toolItems filter, created questItems, reordered display sections

### ✅ Treats Counting Fix

**Problem solved:** Non-candy items (brass key, notes) were being counted as treats.

**Bug:**
```javascript
// OLD: Counted everything that wasn't a scavenger item
const treatsCount = inventory.filter((item) => !item.isScavengerItem).length;
```

**Fix:**
```javascript
// NEW: Only count actual candy items
const scavengerCount = inventory.filter((item) => item.type === "scavenger").length;
const treatsCount = inventory.filter((item) => item.type === "candy").length;
```

**Result:** Status panel now correctly shows treats count without including tools/notes.

**Files modified:**
- textAdventure.js - Fixed treats counting in updateGameStatus()

### ✅ EAT Command Implementation

**Problem solved:** Candy items have eat actions defined but no command to use them.

**Command Definition (commands.json):**
```json
"eat": {
  "includeInGame": true,
  "type": "action",
  "shortcuts": [],
  "action": "eat_item"
}
```

**Handler Function (textAdventure.js ~line 946):**
- Validates item is in inventory
- Checks `eatable === true`
- Checks `actions.eat` exists
- Shows eat response message
- Removes item from game via `delete items[itemKey]`
- Updates status panel (treats count decreases)

**Player Experience:**
- "eat snickers" → "Delicious! You feel slightly healthier."
- Item removed from inventory
- Treats count decreases

**Files modified:**
- commands.json - Added eat command
- textAdventure.js - Added eat_item case in processCommand(), created handleEatCommand()

### ✅ Note/Bookmark Naming to Avoid Confusion

**Problem solved:** Two items both responded to "note" - confusing for player.

**Changes:**

**Mrs. McGillicutty's List:**
- Removed "note" from typedNames
- Display: "Mrs. McGillicutty's List"
- Player types: "x list"

**Frankenstein Bookmark:**
- Changed from "old note" to "old bookmark"
- typedNames: ["bookmark", "oldbookmark", "frankensteinbookmark"]
- Display: "old bookmark"
- Player types: "x bookmark"

**Files modified:**
- items.json - Updated both items' typedNames and display names
- scavengerItems.json - Updated frankenstein examine text to say "bookmark"

### ✅ Interior Room Exit Format

**Problem solved:** Interior house rooms needed clearer exit descriptions.

**Implementation:**

**Format:**
- **Interior rooms** (9 house rooms): "Exits: SOUTH door, NORTH door, EAST door"
- **Exterior rooms** (streets, porches): "Exits: north, south"

**Code (textAdventure.js ~line 652, 1295):**
```javascript
const interiorRooms = ["FOYER", "LIBRARY", "MUSIC-ROOM", "GAME-ROOM", "KITCHEN", "BEDROOM", "STUDY", "DINING-ROOM", "TV-ROOM"];
let exitsText;
if (interiorRooms.includes(currentRoom)) {
  exitsText = availableExits.map(dir => `${dir.toUpperCase()} door`).join(", ");
} else {
  exitsText = availableExits.join(", ");
}
```

**Examples:**
- FOYER: "Exits: SOUTH door, NORTH door, EAST door, WEST door"
- LIBRARY: "Exits: EAST door, NORTH door"
- STREET-01: "Exits: north, east" (unchanged)

**Files modified:**
- textAdventure.js - Updated both displayRoom() and lookAtRoom() exit display logic

### ✅ Secret Door Setup (Music-Room to Game-Room)

**Problem solved:** Secret door should be invisible until discovered, then locked until puzzle solved.

**Door Configuration (rooms-w-doors.json):**
```json
"music-room2game-room": {
  "description": "It is a secret door.",
  "visible": false,    // Hidden until button pressed
  "locked": true,      // Locked until puzzle solved
  "open": false,
  "requiresPuzzle": "say-friend"
}
```

**Player Experience (planned):**
1. MUSIC-ROOM initially: "Exits: SOUTH door"
2. Press button → `doors["music-room2game-room"].visible = true`
3. MUSIC-ROOM: "Exits: SOUTH door, NORTH door" (now visible)
4. Try north → puzzle prompt or locked message
5. Solve puzzle → door unlocks
6. Enter GAME-ROOM

**Files modified:**
- rooms-w-doors.json - Set music-room2game-room to invisible and locked

### ✅ Fixed Examine Logic for Items Without Take Actions

**Bug:** Items without take actions could only be examined in current room, not in inventory.

**Fix (textAdventure.js ~line 1088):**
```javascript
// OLD: Can only examine in current room
if (item.location === currentRoom && item.visible && !item.locked)

// NEW: Can examine in current room OR inventory
if ((item.location === currentRoom || item.location === "INVENTORY") && item.visible && !item.locked)
```

**Also:** Set revealed items as visible when adding to inventory.

**Files modified:**
- textAdventure.js - Updated examine logic, added visible flag when revealing items

## Current Game Statistics

### Items (42 total)
- **Tools**: 1 item (brass_key)
- **Notes**: 2 items (oldnote/bookmark, mrsmcgillicuttyslist)
- **Scavenger**: 11 items (9 active, 2 inactive)
- **Candy**: 23 items (all active, eatable)
- **Fixed**: 5 items (doorbell, door_knocker, 2 porch lights, candy_bag-inactive)

### Rooms (16 total)
- **Starting**: STREET-01
- **Mrs. McGillicutty**: NICE-PORCH (active), NICE-HOUSE (preserved but inaccessible)
- **Radley Exterior**: FRONT-PORCH, STREET-02
- **Radley Interior**: FOYER, LIBRARY, STUDY, DINING-ROOM, KITCHEN, MUSIC-ROOM, GAME-ROOM, TV-ROOM, BEDROOM (9 rooms)
- **Special**: HOME (end-game), INVENTORY (meta-room)

### Commands (12 total)
- help (h, ?)
- look (l)
- inventory (i)
- north (n), south (s), east (e), west (w)
- take (get, grab, pick)
- examine (x, ex)
- drop (put, place)
- use (u, ring)
- eat
- quit (home) - uppercase required

### Doors (12 total)
- **Unlocked**: 9 doors (most interior doors, street connections)
- **Locked (requires knocker)**: front-porch2foyer
- **Locked (requires key)**: bedroom2tv-room
- **Secret (invisible)**: music-room2game-room

## Files Modified This Session

### JSON Files:
1. **commands.json**
   - Added "ring" to use shortcuts
   - Added eat command

2. **items.json**
   - Changed brass_key type to "tools", added hasBeenUsed, use action
   - Created oldnote (bookmark) item with HIDDEN location
   - Updated mrsmcgillicuttyslist typedNames (removed "note")
   - Updated door_knocker with use action, added "door" to typedNames

3. **scavengerItems.json**
   - Added revealsItem, hasBeenSearched to frankenstein
   - Updated examine text to mention bookmark

4. **rooms-w-doors.json**
   - Locked front-porch2foyer door
   - Locked bedroom2tv-room door with custom lockedMessage
   - Set music-room2game-room to invisible and locked

### JavaScript Files:
5. **textAdventure.js**
   - **processCommand()**: Added GO prefix stripping, eat_item case
   - **displayRoom()**: Simplified door filtering, added interior room exit formatting
   - **lookAtRoom()**: Added interior room exit formatting
   - **handleUseCommand()**: Added door_knocker handler, brass_key handler
   - **handleExamineCommand()**: Added reveal item logic, fixed examine for inventory items without take
   - **handleEatCommand()**: NEW - Complete eat command implementation
   - **updateGameStatus()**: Fixed treats counting to only count candy items

## Technical Architecture Updates

### Command Processing Flow
1. Strip "GO" prefix if present
2. Check QUIT/HOME uppercase requirement
3. Find command via exact/shortcut/prefix matching
4. Execute action handler

### Item Reveal System
- Items can have `revealsItem` property pointing to another item key
- Revealed items start with `location: "HIDDEN"` and `visible: false`
- When examined, revealed item moves to INVENTORY and becomes visible
- Parent item marked with `hasBeenSearched: true` to prevent re-revealing

### Door Visibility & Locking
- **visible: false** → Door doesn't appear in exits list at all
- **visible: true, locked: true** → Door appears in exits, blocks movement with message
- **visible: true, locked: false, open: true** → Door appears and allows movement

### Interior Room Detection
- Nine rooms defined as "interior": FOYER, LIBRARY, MUSIC-ROOM, GAME-ROOM, KITCHEN, BEDROOM, STUDY, DINING-ROOM, TV-ROOM
- These rooms use "DIRECTION door" format for exits
- All other rooms use standard "direction" format

## Known Issues & Future Enhancements

### Working Perfectly:
- ✅ GO command prefix stripping
- ✅ RING as USE synonym
- ✅ Door knocker unlocking front door
- ✅ Brass key unlocking bedroom door
- ✅ Hidden bookmark discovery in Frankenstein book
- ✅ Locked doors visible in exits but blocking movement
- ✅ EAT command removing candy from inventory
- ✅ Proper item type categorization
- ✅ Inventory display order (ITEMS, SCAVENGER, TREATS)
- ✅ Interior room exit formatting
- ✅ Treats counting (only candy items)

### Not Yet Implemented:
- Secret door button in MUSIC-ROOM (needs implementation)
- Puzzle system for music-room2game-room door
- Password/clue text in old bookmark (placeholder text currently)
- Health system (property exists but not displayed/used)
- Image display during examine (icon150, icon90x90 ready but not shown)

### Future Enhancements:

**Secret Door Mechanism:**
1. Add button item to MUSIC-ROOM
2. USE BUTTON → sets doors["music-room2game-room"].visible = true
3. North exit appears but door is locked
4. Puzzle prompt: "An inscription reads: 'Speak, friend, and enter.'"
5. SAY FRIEND → unlocks door
6. Can enter GAME-ROOM

**Additional USE Actions:**
1. More items with use actions (tools, keys, etc.)
2. Combination items (use A with B)
3. Context-sensitive uses

**Quest Item Expansion:**
1. Add password/clue to old bookmark
2. More hidden items in other scavenger items
3. Maps, keys, tools as quest items

**Health System:**
1. Display health in status panel
2. Track health changes from eating
3. Game over at 0 health?

**Visual Enhancements:**
1. Show item images when examining (icon150, icon90x90, icon250x250)
2. Inline or overlay image display
3. Item icons in inventory

## Testing Notes

### Verified Working:
- ✅ "go north" processes as "north"
- ✅ "ring doorbell" works same as "use doorbell"
- ✅ Door knocker unlocks front door on FRONT-PORCH
- ✅ Front door creaks open message
- ✅ North exit appears after using knocker
- ✅ Brass key unlocks bedroom door at TV-ROOM
- ✅ Locked doors appear in exits list
- ✅ Locked door messages displayed when trying to pass
- ✅ Examining Frankenstein book reveals bookmark
- ✅ Bookmark added to ITEMS in inventory
- ✅ Bookmark can be examined separately
- ✅ Room state displays after discovering bookmark
- ✅ EAT command removes candy and updates treats count
- ✅ "x list" shows Mrs. McGillicutty's list
- ✅ "x bookmark" shows old bookmark
- ✅ Interior rooms show "SOUTH door, NORTH door" format
- ✅ Exterior rooms show "north, south" format
- ✅ Secret door hidden from MUSIC-ROOM exits initially
- ✅ Treats count excludes tools and notes

### Test Sequence:
1. Start at STREET-01
2. "go north" to NICE-PORCH → GO prefix works
3. "ring doorbell" → RING synonym works
4. Go to FRONT-PORCH
5. "use knocker" → door unlocks and opens
6. Enter FOYER → see "Exits: SOUTH door, NORTH door, EAST door, WEST door"
7. Navigate to LIBRARY
8. "take key" → get brass key
9. "take book" → get Frankenstein book
10. "x book" → discover bookmark, see room state
11. "i" → see brass key and bookmark in ITEMS section
12. Navigate to TV-ROOM → see "Exits: SOUTH door, NORTH door, WEST door"
13. "n" → "The bedroom door is locked. You'll need a key to open it."
14. "use key" → door unlocks
15. "n" → enter BEDROOM
16. Take some candy
17. "eat snickers" → candy removed, treats count decreases
18. Check MUSIC-ROOM → see only "Exits: SOUTH door" (secret north door hidden)

## Context for Next Claude Code Session

**MAJOR GAMEPLAY ENHANCEMENTS COMPLETE**: This session added significant quality-of-life improvements and gameplay mechanics including GO prefix, locked doors, hidden items, key-based unlocking, and proper inventory management.

**COMMAND SYSTEM EXPANDED**: GO prefix support, RING synonym, and fully functional EAT command implemented.

**DOOR MECHANICS REFINED**: Locked doors now visible in exits but block movement. Players can see all exits and get appropriate messages when doors are locked.

**KEY & DOOR PUZZLE IMPLEMENTED**: Brass key in LIBRARY unlocks bedroom door at TV-ROOM, demonstrating USE mechanic for quest progression.

**HIDDEN ITEM DISCOVERY**: Frankenstein book reveals hidden bookmark when examined, establishing system for items-within-items.

**INVENTORY IMPROVEMENTS**: Proper type system (tools, notes, candy, scavenger), correct display order, accurate treats counting.

**INTERIOR ROOM POLISH**: Nine house rooms now show clearer exit format ("SOUTH door, NORTH door" vs "north, south").

**SECRET DOOR READY**: music-room2game-room door set up as invisible and locked, ready for button/puzzle implementation.

**IMMEDIATE NEXT STEPS:**
1. Implement button in MUSIC-ROOM to reveal secret door
2. Implement puzzle system for secret door ("Speak, friend, and enter")
3. Add password/clue text to old bookmark
4. Consider implementing health system display
5. Consider adding image display on examine

**Key architectural achievements:**
- GO command preprocessing
- Item reveal system (revealsItem, hasBeenSearched)
- Door visibility vs. locked states properly separated
- Item type system with proper filtering
- Interior vs. exterior room detection for formatting
- Location-based USE validation (brass_key only works at TV-ROOM)

**Current version**: v0.28 - Command Expansion & Locked Door Mechanics

**Total items**: 42 (1 tools + 2 notes + 11 scavenger + 23 candy + 5 fixed)
**Total commands**: 12 (including EAT)
**Total rooms**: 16
**Total doors**: 12 (2 locked, 1 secret invisible)

The game now has robust locked door mechanics, hidden item discovery, proper inventory categorization, and intuitive command aliases!
