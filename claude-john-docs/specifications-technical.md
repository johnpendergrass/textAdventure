# Halloween Text Adventure - Technical Specifications
# Implementation Details & Architecture Deep Dive

## Command Processing Architecture

### Complete Command Flow Pipeline
```
User Input: "drop snickers"
    ↓
Event Handler (keydown listener on commandInput)
    ↓
echoCommand() - Display command in output with blue "command" type
    ↓
processCommand() - Main command router
    ↓
findCommand() - Parse input, extract first word "drop"
    ↓
Lookup commands["drop"] → finds action: "drop_item"
    ↓
Command Action Switch in processCommand()
    ↓
case "drop_item": handleDropCommand(command)
    ↓
Item Validation & State Changes
  ├─ Parse "snickers" from "drop snickers"
  ├─ Find item by typedName in INVENTORY
  ├─ Validate has actions.take (droppable)
  └─ Change item.startLocation to currentRoom
    ↓
updateGameStatus() - Recalculate score components & refresh UI
  ├─ Filter inventory items
  ├─ Separate regular vs scavenger by isScavengerItem flag
  ├─ Sum Treats, Scavenger, Health scores
  ├─ Update player.core.score with total
  └─ Generate and display SCORE panel HTML
```

### Critical Command Parsing Fix
**Problem Solved:** Original findCommand() tried to match entire input as single command.

**Before (broken):**
```javascript
function findCommand(input) {
  const cmd = input.toLowerCase().trim(); // "drop snickers"
  if (commands[cmd]) { ... } // Failed - no command named "drop snickers"
}
```

**After (working):**
```javascript
function findCommand(input) {
  const fullInput = input.toLowerCase().trim();
  const cmd = fullInput.split(/\s+/)[0]; // Extract "drop" only

  // Check exact command match
  if (commands[cmd]) {
    return { type: "exact", command: cmd };
  }

  // Check shortcuts (aliases)
  for (const [commandName, commandData] of Object.entries(commands)) {
    if (commandData.shortcuts && commandData.shortcuts.includes(cmd)) {
      return { type: "shortcut", command: commandName };
    }
  }

  return { type: "unknown" };
}
```

**Impact:** This single change enabled all multi-word commands (take/drop/examine with item names).

## Item System Technical Implementation

### Data Structure Evolution

**Phase 1 - Original (Minimal):**
```json
{
  "includeInGame": true,
  "display": "Snickers mini-bar",
  "startLocation": "FOYER"
}
```

**Phase 2 - Added Interaction:**
```json
{
  "includeInGame": true,
  "typedName": "snickers",
  "display": "Snickers mini-bar",
  "startLocation": "FOYER",
  "visible": true,
  "locked": false,
  "actions": { "take": {...}, "examine": "..." }
}
```

**Phase 3 - Current (Streamlined with Health):**
```json
{
  "includeInGame": true,
  "typedName": "snickers",
  "display": "Snickers mini-bar",
  "description": "A fun-size Snickers bar",
  "startLocation": "FOYER",
  "points": 1,
  "health": 1,
  "eatable": true,
  "visible": true,
  "locked": false,
  "actions": {
    "examine": "It's a Snickers bar, what's not to like?",
    "take": { "response": "...", "addToInventory": true },
    "eat": { "response": "...", "addHealth": 5, "removeItem": true }
  }
}
```

**Removed Properties (unused in code):**
- ~~capacity/quantity~~ - Never referenced
- ~~itemType~~ - Never checked (replaced with runtime isScavengerItem flag)
- ~~found~~ - Removed from items.json (kept in scavengerItems.json)

### INVENTORY Room Innovation

**Traditional Approach Problems:**
```javascript
// OLD WAY - Complex, error-prone
player.inventory = ["snickers_bar", "item_01"];

// Check if item in inventory
if (player.inventory.includes(itemId)) { ... }

// Add to inventory
player.inventory.push(itemId);

// Remove from inventory
player.inventory = player.inventory.filter(id => id !== itemId);

// Display inventory - need to lookup each item
player.inventory.forEach(itemId => {
  const item = items[itemId];
  display(item.display);
});
```

**Our Solution - INVENTORY as Room:**
```javascript
// NEW WAY - Simple, elegant

// INVENTORY room in rooms-w-doors.json
"INVENTORY": {
  "name": "Inventory",
  "enterText": {},
  "lookText": "",
  "exits": {},
  "special": { "inventory-room": true }
}

// Add to inventory - simple location change
item.startLocation = "INVENTORY";

// Remove from inventory - simple location change
item.startLocation = currentRoom;

// Check if in inventory - same as checking any room
if (item.startLocation === "INVENTORY") { ... }

// Display inventory - same filtering as any room
const inventoryItems = Object.values(items).filter(item =>
  item.includeInGame && item.startLocation === "INVENTORY"
);
```

**Technical Benefits:**
1. **No special cases** - Inventory uses same code paths as rooms
2. **No synchronization** - Single source of truth (item.startLocation)
3. **No arrays** - Objects with locations, not array management
4. **Automatic updates** - Changing location updates everywhere instantly
5. **Simple filtering** - Same pattern for all item queries

### Item Visibility & Interaction Rules

**Display Filtering (Universal Pattern):**
```javascript
// Used for rooms, inventory, everywhere
function getVisibleItems(location) {
  return Object.values(items).filter(item =>
    item.includeInGame &&
    item.startLocation === location &&
    item.visible
  );
}
```

**Take Command Validation Chain:**
```javascript
function handleTakeCommand(command) {
  // 1. Parse item name from "take snickers" → "snickers"
  const words = command.trim().split(/\s+/);
  if (words.length < 2) {
    return showError("Take what?");
  }
  const targetTypedName = words[1].trim();

  // 2. Find matching items with 6-step validation
  const roomItems = Object.entries(items).filter(([key, item]) =>
    item.includeInGame &&                    // Step 1: Active item
    item.startLocation === currentRoom &&    // Step 2: In current room
    item.visible &&                          // Step 3: Discoverable
    !item.locked &&                          // Step 4: Not restricted
    item.typedName === targetTypedName &&    // Step 5: Name match
    item.actions?.take?.addToInventory === true // Step 6: Takeable
  );

  // 3. Execute if validation passes
  if (roomItems.length === 0) {
    return showError(`You don't see any "${targetTypedName}" here that you can take.`);
  }

  const [itemKey, item] = roomItems[0];

  // 4. Apply action
  addToBuffer([
    { text: item.actions.take.response || `You pick up the ${item.display}.`, type: "flavor" }
  ]);

  // 5. Update location
  item.startLocation = "INVENTORY";

  // 6. Mark as found (for scavenger items)
  if (item.actions.take.markAsFound) {
    item.found = true;
  }

  // 7. Update UI
  updateGameStatus();
}
```

**Drop Command Validation (Symmetric):**
```javascript
function handleDropCommand(command) {
  // 1. Parse item name
  const words = command.trim().split(/\s+/);
  if (words.length < 2) {
    return showError("Drop what?");
  }
  const targetTypedName = words[1].trim();

  // 2. Find matching items in INVENTORY
  const inventoryItems = Object.entries(items).filter(([key, item]) =>
    item.includeInGame &&
    item.startLocation === "INVENTORY" &&
    item.typedName === targetTypedName &&
    item.actions?.take  // Must be portable to be droppable
  );

  // 3. Execute if found
  if (inventoryItems.length === 0) {
    return showError(`You're not carrying any "${targetTypedName}".`);
  }

  const [itemKey, item] = inventoryItems[0];

  // 4. Apply action
  addToBuffer([
    { text: `You drop the ${item.display}.`, type: "flavor" }
  ]);

  // 5. Update location (reverse of take)
  item.startLocation = currentRoom;

  // 6. Update UI
  updateGameStatus();
}
```

**Examine Command Logic Tree:**
```javascript
function handleExamineCommand(command) {
  // Parse and find item by typedName
  const words = command.trim().split(/\s+/);
  if (words.length < 2) {
    return showError("Examine what?");
  }
  const targetTypedName = words[1].trim();

  // Find item in either current room or inventory
  const allItems = Object.entries(items).filter(([key, item]) =>
    item.includeInGame &&
    item.typedName === targetTypedName &&
    (item.startLocation === currentRoom || item.startLocation === "INVENTORY")
  );

  if (allItems.length === 0) {
    return showError(`You don't see any "${targetTypedName}" here.`);
  }

  const [itemKey, item] = allItems[0];

  // Check if item has examine action
  if (!item.actions?.examine) {
    return showError(`You can't examine the ${item.display}.`);
  }

  // DECISION TREE: Portable vs Fixed
  if (item.actions.take) {
    // PORTABLE ITEM RULE - Must be in inventory
    if (item.startLocation === "INVENTORY") {
      // Can examine - it's in your hands
      addToBuffer([
        { text: `${item.display}: ${item.actions.examine}`, type: "flavor" }
      ]);
    } else {
      // Can't examine - not holding it yet
      addToBuffer([
        { text: `You need to pick up the ${item.display} first to examine it closely.`, type: "error" }
      ]);
    }
  } else {
    // FIXED ITEM RULE - Must be visible in current room
    if (item.startLocation === currentRoom && item.visible && !item.locked) {
      // Can examine - it's here and visible
      addToBuffer([
        { text: `${item.display}: ${item.actions.examine}`, type: "flavor" }
      ]);
    } else {
      addToBuffer([
        { text: `You don't see any "${targetTypedName}" here.`, type: "error" }
      ]);
    }
  }
}
```

## Multi-Component Scoring System

### Runtime Item Flagging
**Problem:** Need to distinguish scavenger items from regular items without cluttering JSON.

**Solution:** Mark items at runtime during load.

```javascript
// In initGame() function, after loading items
async function initGame() {
  // ... other loading code ...

  const itemsData = await loadItems();
  items = itemsData.items || {};

  // Load and merge scavenger items
  const scavengerData = await loadScavengerItems();
  const scavengerItems = scavengerData.scavengerItems || {};

  // CRITICAL: Mark scavenger items with runtime flag
  Object.values(scavengerItems).forEach(item => {
    item.isScavengerItem = true;  // Runtime property, not in JSON
  });

  // Merge into main items object
  items = { ...items, ...scavengerItems };
  console.log(`Merged ${Object.keys(scavengerItems).length} scavenger items`);

  // ... rest of initialization ...
}
```

**Benefits:**
- JSON files stay clean (no itemType field)
- Clear separation at runtime
- Easy to check: `if (item.isScavengerItem)`
- Scales to multiple item categories if needed

### Score Component Calculation

**Complete updateGameStatus() Function:**
```javascript
function updateGameStatus() {
  const statusDiv = document.querySelector(".status");

  // 1. Get inventory items
  const inventory = Object.values(items).filter(item =>
    item.includeInGame && item.startLocation === "INVENTORY"
  );

  // 2. Calculate separate score components
  let regularItemsScore = 0;
  let scavengerScore = 0;

  inventory.forEach(item => {
    const points = item.points || 0;
    if (item.isScavengerItem) {
      scavengerScore += points;  // Scavenger items (11-20 pts each)
    } else {
      regularItemsScore += points;  // Regular items (0-1 pts each)
    }
  });

  // 3. Get health score from player
  const healthScore = player?.core?.health || 0;

  // 4. Calculate total score
  const totalScore = regularItemsScore + scavengerScore + healthScore;

  // 5. Update player.core.score for persistence
  if (player.core) {
    player.core.score = totalScore;
  }

  // 6. Generate inventory HTML for right panel
  let inventoryHTML = "";
  inventory.forEach((item) => {
    const points = item.points || 0;
    inventoryHTML += `<div>${item.display} (+${points})</div>`;
  });

  // 7. Generate score breakdown HTML for left panel
  let statsHTML = "";
  statsHTML += `<div>Treats: ${regularItemsScore}</div>`;
  statsHTML += `<div>Scavenger: ${scavengerScore}</div>`;
  statsHTML += `<div>Health: ${healthScore}</div>`;
  statsHTML += `<div>───────────</div>`;
  statsHTML += `<div>Score: ${totalScore}</div>`;

  // 8. Update DOM
  statusDiv.innerHTML = `
    <div class="status-section">
      <div class="status-title">SCORE:</div>
      ${statsHTML}
    </div>

    <div class="status-section">
      <div class="status-title">INVENTORY:</div>
      ${inventoryHTML}
    </div>

    <div class="status-section">
      <div class="status-title">COMMANDS:</div>
      ${commandsList.map((cmd) => `<div>${cmd}</div>`).join("")}
    </div>
  `;
}
```

**Why This Design:**
1. **Separation of concerns** - Each score component has clear meaning
2. **Gameplay decisions** - Eating candy trades health for treat collection
3. **Progress tracking** - Each component shows different achievement
4. **Extensibility** - Easy to add new score components (time bonus, puzzle points, etc.)

### Player Data Structure

**CONFIG_FALLBACKS.player (Fixed Structure):**
```javascript
player: {
  core: {
    score: 0,          // Total score (sum of components)
    health: 100,       // Current health (default 100)
    inventory: [],     // Unused (kept for compatibility)
    currentRoom: "STREET-01",
    visitedRooms: []
  },
  gameStats: {
    treats: { current: 0, max: 40 },
    houses: { current: 0, max: 12 }  // Legacy, may remove
  }
}
```

**Runtime Player Data (from gameData.json):**
```javascript
const runtimePlayerData = {
  core: {
    score: gameData.startup?.playerStats?.score || 0,
    health: gameData.startup?.playerStats?.health || 100,  // Default 100
    inventory: processedGameData.playerInventory,
    currentRoom: gameData.startup?.playerStats?.currentRoom || "STREET-01",
    visitedRooms: gameData.startup?.playerStats?.visitedRooms || []
  },
  gameStats: {
    treats: gameData.startup?.playerStats?.treats || {current: 0, max: 40},
    houses: gameData.startup?.playerStats?.houses || {current: 0, max: 12}
  }
};
```

**Player Initialization Logic:**
```javascript
// Check if player.json exists and has content
const savedPlayer = await loadPlayer();

if (Object.keys(savedPlayer).length === 0) {
  // New game or missing player.json - use runtime data
  player = runtimePlayerData;
  console.log('New game: Built player data from gameData.startup');
} else {
  // Continue game - use saved data
  player = savedPlayer;
  console.log('Continue game: Using saved player data');
}
```

**Critical Fix:** CONFIG_FALLBACKS.player must match runtimePlayerData structure, otherwise fallback will be used instead of runtime data even when player.json doesn't exist.

## Configuration & Loading System

### Fallback Command Architecture
**Problem:** Browser caching prevented commands.json updates from loading.

**Solution:** Dual command system with fallbacks.

**Implementation:**
```javascript
// 1. CONFIG_FALLBACKS at top of file (lines 79-149)
const CONFIG_FALLBACKS = {
  commands: {
    help: { type: "system", shortcuts: ["h", "?"], action: "show_help" },
    look: { type: "action", shortcuts: ["l"], action: "examine_room" },
    inventory: { type: "system", shortcuts: ["i"], action: "show_inventory" },
    north: { type: "movement", shortcuts: ["n"], action: "move_north" },
    south: { type: "movement", shortcuts: ["s"], action: "move_south" },
    east: { type: "movement", shortcuts: ["e"], action: "move_east" },
    west: { type: "movement", shortcuts: ["w"], action: "move_west" },
    take: { type: "action", shortcuts: ["get", "grab", "pick"], action: "take_item" },
    examine: { type: "action", shortcuts: ["x", "ex"], action: "examine_item" },
    drop: { type: "action", shortcuts: ["put", "place"], action: "drop_item" }
  },
  // ... other fallbacks ...
};

// 2. Try to load from JSON
async function loadCommands() {
  try {
    const response = await fetch(`${CONFIG_LOCATION}/commands.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    console.log('Successfully loaded commands.json');
    return data;
  } catch (error) {
    console.log('Using fallback commands');
    return CONFIG_FALLBACKS.commands;  // Use hardcoded fallback
  }
}

// 3. In initGame()
const commandsData = await loadCommands();
commands = commandsData.commands || {};
```

**Result:** Commands work regardless of cache state or JSON loading issues.

### JSON File Loading Pipeline
All JSON files follow this pattern:

```javascript
async function loadXXX() {
  const filename = 'xxx.json';
  try {
    // 1. Fetch from server
    const response = await fetch(`${CONFIG_LOCATION}/${filename}`);

    // 2. Check HTTP status
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 3. Parse JSON
    const data = await response.json();

    // 4. Log success
    console.log(`Successfully loaded ${filename} from ${CONFIG_LOCATION}`);

    // 5. Return data
    return data;

  } catch (error) {
    // 6. Handle errors gracefully
    displayConfigError(filename, CONFIG_LOCATION, error, isCritical, hasFallback);

    // 7. Return fallback if available
    if (hasFallback) {
      console.log(`Using fallback ${filename} defaults`);
      return CONFIG_FALLBACKS.xxx;
    }

    // 8. Return empty structure if no fallback
    return { xxx: {} };
  }
}
```

**Files with fallbacks:**
- commands.json → CONFIG_FALLBACKS.commands
- player.json → CONFIG_FALLBACKS.player
- gameState.json → CONFIG_FALLBACKS.gameState
- uiConfig.json → CONFIG_FALLBACKS.uiConfig
- keyboardShortcuts.json → CONFIG_FALLBACKS.keyboardShortcuts

**Files without fallbacks (critical):**
- rooms-w-doors.json (game cannot run without rooms)
- items.json (returns empty object)
- scavengerItems.json (returns empty object)

## Real-Time UI Synchronization

### Status Panel Update System
**When updateGameStatus() is called:**
1. After handleTakeCommand() success
2. After handleDropCommand() success
3. During game initialization
4. Future: After handleEatCommand() when implemented

**No manual synchronization needed** - changing item.startLocation automatically reflects in next updateGameStatus() call.

### Text Buffer Management
```javascript
function addToBuffer(messages) {
  // messages is array of {text, type} objects
  messages.forEach(message => {
    textBuffer.push({
      text: message.text,
      type: message.type  // "command", "flavor", "error"
    });
  });
  updateDisplay();  // Render to DOM
}
```

**Message Types & Styling:**
- **command**: Blue text (#4a9eff) - Commands and prompts
- **flavor**: White text - Descriptions and responses
- **error**: Red/orange text - Invalid commands and failures

### Display Update Flow
```
User Action (take/drop)
    ↓
Handler function modifies item.startLocation
    ↓
Handler calls updateGameStatus()
    ↓
updateGameStatus() recalculates:
  ├─ Inventory contents (filter by startLocation)
  ├─ Score components (regular vs scavenger)
  ├─ Total score (sum + health)
  └─ player.core.score (persistence)
    ↓
Generate HTML strings:
  ├─ inventoryHTML (items with +X)
  ├─ statsHTML (score breakdown)
  └─ commandsHTML (commands list)
    ↓
Update DOM via innerHTML
    ↓
User sees updated panels instantly
```

## Browser Compatibility & Development Challenges

### Caching Issues Solved
**Problem:** Commands.json changes not reflected in browser after refresh.

**Root Cause:** Aggressive browser caching of localhost resources.

**Solutions Implemented:**
1. **Fallback commands** in JavaScript file (CONFIG_FALLBACKS)
2. **Multiple development server ports** (8000-8005) for cache busting
3. **JSON syntax validation** before deployment
4. **Hard refresh instructions** for users (Ctrl+Shift+R)

### Development Server Strategy
```bash
# Port rotation for cache busting during development
python3 -m http.server 8000  # Initial development
# Make changes to commands.json
python3 -m http.server 8001  # After commands.json changes
# Browser fetches from new port = cache miss
python3 -m http.server 8002  # After more changes
# etc.
```

### JSON Validation Pipeline
```bash
# Validate all JSON files before deployment
python3 -c "import json; json.load(open('HALLOWEEN-GAME/commands.json'))"
python3 -c "import json; json.load(open('HALLOWEEN-GAME/items.json'))"
python3 -c "import json; json.load(open('HALLOWEEN-GAME/scavengerItems.json'))"
python3 -c "import json; json.load(open('HALLOWEEN-GAME/rooms-w-doors.json'))"
python3 -c "import json; json.load(open('HALLOWEEN-GAME/uiConfig.json'))"
python3 -c "import json; json.load(open('HALLOWEEN-GAME/gameData.json'))"
```

## Performance Considerations

### Item Filtering Optimization
**Efficient - Single Pass:**
```javascript
const roomItems = Object.values(items).filter(item =>
  item.includeInGame &&
  item.startLocation === currentRoom &&
  item.visible
);
```

**Avoided - Multiple Passes:**
```javascript
// DON'T DO THIS - inefficient multiple iterations
const activeItems = items.filter(item => item.includeInGame);
const roomItems = activeItems.filter(item => item.startLocation === currentRoom);
const visibleItems = roomItems.filter(item => item.visible);
```

### Memory Management
- **No duplicate objects**: Items exist once in global `items` object
- **Reference-based operations**: Only change properties, never copy items
- **Minimal DOM updates**: Status panel updated only when inventory changes
- **Event delegation**: Single keydown listener handles all input
- **Object.values() caching**: Could be optimized if needed, but not bottleneck

### Potential Optimizations (Future)
```javascript
// Current: Recalculate inventory every updateGameStatus()
const inventory = Object.values(items).filter(item =>
  item.includeInGame && item.startLocation === "INVENTORY"
);

// Future: Cache inventory, invalidate on changes
let cachedInventory = null;
let inventoryDirty = true;

function getInventory() {
  if (inventoryDirty) {
    cachedInventory = Object.values(items).filter(item =>
      item.includeInGame && item.startLocation === "INVENTORY"
    );
    inventoryDirty = false;
  }
  return cachedInventory;
}

function invalidateInventory() {
  inventoryDirty = true;
}
```

**Not needed yet** - performance is excellent with current item count (~17 items).

## Error Handling & Validation

### Item Command Validation Errors
```javascript
// Clear, user-friendly error messages for each failure case

// Missing item name
if (words.length < 2) {
  return showError("Take what?");
}

// Item not found
if (allItems.length === 0) {
  return showError(`You don't see any "${targetName}" here.`);
}

// Item can't be examined
if (!item.actions?.examine) {
  return showError(`You can't examine the ${item.display}.`);
}

// Item not in inventory (portable items)
if (item.actions.take && item.startLocation !== "INVENTORY") {
  return showError(`You need to pick up the ${item.display} first to examine it closely.`);
}

// Item not droppable
if (!item.actions?.take) {
  return showError(`You can't drop the ${item.display}.`);
}
```

### Graceful Degradation
- **Missing JSON files**: Use hardcoded fallbacks
- **Invalid commands**: Clear error messages, never crash
- **Missing items**: Helpful "not found" responses
- **Network issues**: Local fallback data
- **Malformed JSON**: Catch and display config errors
- **Missing properties**: Use optional chaining (?.) and defaults (||)

## Future Technical Considerations

### Extensibility Points

**Adding New Commands:**
1. Add to `commands.json` with action name
2. Add to `CONFIG_FALLBACKS.commands` for reliability
3. Add case to `processCommand()` switch statement
4. Implement handler function (e.g., handleEatCommand)
5. Update `showHelp()` text

**Adding New Item Properties:**
1. Define property in JSON schema (items.json & scavengerItems.json)
2. Update validation logic if property gates behavior
3. Handle in display functions if property affects UI
4. Document in specifications

**Adding New Score Components:**
1. Calculate component in updateGameStatus()
2. Add to total score calculation
3. Add display line in statsHTML
4. Update player.core if persistent value

### Scalability Architecture
- **Room system**: Supports unlimited rooms via JSON (currently 16)
- **Item system**: Property-driven, no code changes for new items
- **Command system**: Pluggable architecture for new interactions
- **Display system**: Template-driven HTML generation, easily customizable
- **Score system**: Component-based, easy to add new scoring types

### Database Migration Path (Future)
Current file-based system could migrate to database without code changes:

```javascript
// Current: File-based
const items = await loadItems();

// Future: Database-based
const items = await db.query('SELECT * FROM items WHERE includeInGame = true');

// Future: Local Storage
const items = JSON.parse(localStorage.getItem('items'));

// Future: IndexedDB
const items = await db.items.toArray();
```

All current logic would remain unchanged due to consistent data structure.

### Testing Strategy
**Manual Testing Checklist:**
- [ ] Take command works with all item types
- [ ] Drop command works in all rooms
- [ ] Examine command distinguishes portable/fixed items
- [ ] Score components calculate correctly
- [ ] player.core.score updates after take/drop
- [ ] Health score displays current health value
- [ ] Inventory panel shows (+X) points
- [ ] Commands load from JSON and fallback
- [ ] Browser refresh preserves game state (if player.json saved)

**Future: Automated Testing**
```javascript
// Example test cases for future implementation
describe('Item Commands', () => {
  test('take command moves item to inventory', () => {
    const item = items['snickers_bar'];
    item.startLocation = 'FOYER';
    handleTakeCommand('take snickers');
    expect(item.startLocation).toBe('INVENTORY');
  });

  test('drop command moves item to current room', () => {
    currentRoom = 'LIBRARY';
    const item = items['snickers_bar'];
    item.startLocation = 'INVENTORY';
    handleDropCommand('drop snickers');
    expect(item.startLocation).toBe('LIBRARY');
  });

  test('score components calculate correctly', () => {
    items['snickers_bar'].startLocation = 'INVENTORY';  // 1 pt
    items['item_01'].startLocation = 'INVENTORY';       // 11 pts
    player.core.health = 100;                           // 100 pts
    updateGameStatus();
    expect(player.core.score).toBe(112);
  });
});
```

---

*This technical specification provides the implementation details needed to understand, maintain, and extend the Halloween Text Adventure codebase. The architecture emphasizes simplicity, consistency, and extensibility while solving real-world development challenges like browser caching, score tracking, and state management.*