# Technical Implementation Patterns
## Halloween Haunted House Adventure Game
### Date: September 3, 2025

## Overview

This document contains specific code patterns and implementation details for the simplified rules system designed for the 10-room Halloween haunted house game. These patterns provide concrete examples of how to implement game mechanics without building a complex rules engine.

## Core Implementation Philosophy

**For a 10-room game that's mostly linear:**
- Use simple state flags instead of complex rule systems
- Embed conditions directly in JSON data files
- Handle special cases explicitly with if/then logic
- Keep code readable and debuggable

## JSON Data Structure Patterns

### Room Definitions with Conditional Content

```json
// rooms.json
{
  "foyer": {
    "name": "Grand Foyer",
    "description_dark": "It's pitch black. You can barely make out the outline of furniture.",
    "description_lit": "A dusty entrance hall with cobwebs hanging from the chandelier. Moonlight streams through tall windows.",
    "ascii_art_dark": "DARKNESS",
    "ascii_art_lit": "FOYER",
    "exits": {
      "north": {
        "room": "library",
        "blocked": true,
        "blocked_by": "brass_key",
        "blocked_message": "The library door is locked. It has a brass keyhole.",
        "unlock_message": "You unlock the library door with the brass key."
      },
      "east": "kitchen",  // Always accessible
      "up": {
        "room": "staircase",
        "blocked": false,
        "requires_light": true,
        "dark_message": "It's too dark to safely climb the stairs."
      }
    },
    "items_dark": [],  // Can't see items in darkness
    "items_lit": ["candy_corn", "brass_key"],
    "creatures": ["black_cat"],
    "health_effect": -5, // Lose 5% health from dusty air on first visit
    "points": 1.5, // Points for visiting this room
    "first_visit": true // Flag to track if this is first time here
  },
  
  "library": {
    "name": "Ancient Library",
    "description": "Towering bookshelves reach toward a vaulted ceiling...",
    "exits": {
      "south": "foyer",
      "secret": {
        "room": "secret_study",
        "blocked": true,
        "blocked_by": "secret_discovered",
        "trigger_action": "pull_red_book",
        "trigger_message": "You pull the red book and hear a click...",
        "reveal_message": "The bookshelf swings open, revealing a hidden passage!"
      }
    },
    "items": ["chocolate_bar", "dusty_tome"],
    "ascii_art": "LIBRARY",
    "points": 1.5
  }
}
```

### Item Definitions with Properties

```json
// items.json
{
  "flashlight": {
    "name": "Flashlight",
    "description": "A heavy metal flashlight with a working bulb",
    "type": "tool",
    "takeable": true,
    "use_effect": "toggle_light",
    "health_restore": 0,
    "points": 0,
    "single_use": false
  },
  
  "brass_key": {
    "name": "Brass Key",
    "description": "An ornate brass key with intricate engravings",
    "type": "key",
    "takeable": true,
    "use_with": ["library_door", "basement_door"],
    "points": 0,
    "single_use": false
  },
  
  "candy_corn": {
    "name": "Candy Corn",
    "description": "A handful of orange and yellow Halloween candies",
    "type": "candy",
    "takeable": true,
    "candy_value": 1, // Points if kept
    "health_restore": 10, // Health if eaten
    "single_use": true // Consumed when eaten
  },
  
  "chocolate_bar": {
    "name": "Chocolate Bar",
    "description": "A full-size chocolate bar - a rare Halloween treat!",
    "type": "candy",
    "takeable": true,
    "candy_value": 5,
    "health_restore": 25,
    "single_use": true
  }
}
```

### Creature Interactions

```json
// creatures.json
{
  "black_cat": {
    "name": "Shadow",
    "description": "A sleek black cat with glowing golden eyes",
    "location": "foyer",
    "friendly": false,
    "befriend_with": "can_of_tuna",
    "befriend_message": "The cat purrs loudly and rubs against your leg. You sense it likes you now.",
    "already_friendly_message": "Shadow the cat meows softly and follows you around.",
    "points": 2,
    "ascii_art": "BLACK_CAT"
  },
  
  "house_mouse": {
    "name": "Squeaky",
    "description": "A tiny brown mouse with bright eyes",
    "location": "kitchen",
    "friendly": false,
    "befriend_with": "cheese_crumb",
    "befriend_message": "The mouse nibbles the cheese and squeaks gratefully.",
    "points": 2
  }
}
```

## JavaScript Implementation Patterns

### Game State Management

```javascript
// Global game state object
let gameState = {
  // Player status
  current_room: "foyer",
  health: 100,
  score: 0,
  inventory: ["flashlight"],
  
  // Progress tracking
  rooms_visited: ["foyer"],
  secrets_found: [],
  creatures_befriended: [],
  candy_collected: 0,
  candy_eaten: 0,
  
  // Boolean flags for key game states
  flags: {
    flashlight_on: false,
    library_unlocked: false,
    secret_study_found: false,
    basement_drained: false,
    cat_befriended: false,
    mouse_befriended: false,
    ghost_met: false
  }
};

// Load game data objects (populated from JSON files)
let rooms = {};
let items = {};
let creatures = {};
let secrets = {};
```

### Room Description Logic

```javascript
function describeRoom(roomName) {
  const room = rooms[roomName];
  let description = "";
  
  // Handle lighting conditions
  if (room.description_dark && !gameState.flags.flashlight_on) {
    description = room.description_dark;
    // In darkness, can't see items or creatures
    displayAsciiArt(room.ascii_art_dark || "DARKNESS", "fadeIn", "medium");
    return description;
  }
  
  // Handle special room states
  if (roomName === "basement" && gameState.flags.basement_flooded) {
    description = "The basement is flooded with murky water. You can't explore much.";
    displayAsciiArt("FLOODED_BASEMENT", "fadeIn", "medium");
    return description;
  }
  
  // Standard lit room description
  description = room.description_lit || room.description;
  displayAsciiArt(room.ascii_art_lit || room.ascii_art, "fadeIn", "medium");
  
  // Add visible items if room is lit
  if (gameState.flags.flashlight_on || !room.description_dark) {
    const visibleItems = room.items_lit || room.items || [];
    if (visibleItems.length > 0) {
      description += "\n\nYou can see: " + visibleItems.map(item => items[item].name).join(", ");
    }
  }
  
  // Add creature descriptions
  if (room.creatures) {
    room.creatures.forEach(creatureName => {
      const creature = creatures[creatureName];
      if (creature) {
        description += `\n\n${creature.description}`;
      }
    });
  }
  
  return description;
}
```

### Movement Validation

```javascript
function canMove(direction) {
  const room = rooms[gameState.current_room];
  const exit = room.exits[direction];
  
  // Check if exit exists
  if (!exit) {
    return { allowed: false, message: "You can't go that way." };
  }
  
  // Handle simple exits (just room names)
  if (typeof exit === 'string') {
    return { allowed: true, destination: exit };
  }
  
  // Handle complex exits (objects with conditions)
  if (exit.blocked) {
    // Check if player has required key
    if (exit.blocked_by && !hasItem(exit.blocked_by) && !gameState.flags[exit.blocked_by]) {
      return { allowed: false, message: exit.blocked_message };
    }
  }
  
  // Check lighting requirements
  if (exit.requires_light && !gameState.flags.flashlight_on) {
    return { allowed: false, message: exit.dark_message };
  }
  
  return { allowed: true, destination: exit.room };
}

function movePlayer(direction) {
  const moveResult = canMove(direction);
  
  if (!moveResult.allowed) {
    addToTextBuffer(moveResult.message, "error");
    return;
  }
  
  // Move to new room
  gameState.current_room = moveResult.destination;
  
  // Track visited rooms for scoring
  if (!gameState.rooms_visited.includes(moveResult.destination)) {
    gameState.rooms_visited.push(moveResult.destination);
    const room = rooms[moveResult.destination];
    gameState.score += room.points || 0;
  }
  
  // Apply health effects on first visit
  const room = rooms[moveResult.destination];
  if (room.first_visit && room.health_effect) {
    gameState.health = Math.max(25, gameState.health + room.health_effect);
    room.first_visit = false; // Only apply once
  }
  
  // Display new room
  const description = describeRoom(gameState.current_room);
  addToTextBuffer(description, "flavor");
  updateStatusDisplay();
}
```

### Item Usage System

```javascript
function handleUse(itemName) {
  if (!hasItem(itemName)) {
    return "You don't have that item.";
  }
  
  const item = items[itemName];
  
  switch(itemName) {
    case "flashlight":
      gameState.flags.flashlight_on = !gameState.flags.flashlight_on;
      const message = gameState.flags.flashlight_on ? 
        "The flashlight illuminates the room!" : 
        "You turn off the flashlight. The room becomes dark.";
      
      // Redisplay room with new lighting
      setTimeout(() => {
        const description = describeRoom(gameState.current_room);
        addToTextBuffer(description, "flavor");
      }, 100);
      
      return message;
      
    case "brass_key":
      const room = rooms[gameState.current_room];
      // Check if there's a door to unlock here
      for (let direction in room.exits) {
        const exit = room.exits[direction];
        if (exit.blocked_by === "brass_key") {
          gameState.flags.library_unlocked = true;
          exit.blocked = false;
          return exit.unlock_message || "You unlock the door.";
        }
      }
      return "There's nothing to unlock here.";
      
    case "candy_corn":
    case "chocolate_bar":
      // Eating candy: restore health, remove from inventory, don't get points
      gameState.health = Math.min(100, gameState.health + item.health_restore);
      gameState.candy_eaten++;
      removeFromInventory(itemName);
      updateStatusDisplay();
      return `You eat the ${item.name}. Health restored! (+${item.health_restore}%)`;
      
    default:
      return "You can't use that item.";
  }
}
```

### Creature Interaction System

```javascript
function handlePet(creatureName) {
  const room = rooms[gameState.current_room];
  if (!room.creatures || !room.creatures.includes(creatureName)) {
    return "There's no such creature here.";
  }
  
  const creature = creatures[creatureName];
  const flagName = creature.name.toLowerCase() + "_befriended";
  
  if (gameState.flags[flagName]) {
    return creature.already_friendly_message || `${creature.name} is already your friend.`;
  }
  
  // Check if player has required item to befriend
  if (creature.befriend_with && !hasItem(creature.befriend_with)) {
    return `${creature.name} seems wary. Maybe you need something to win its trust.`;
  }
  
  // Befriend the creature
  gameState.flags[flagName] = true;
  gameState.creatures_befriended.push(creatureName);
  gameState.score += creature.points;
  
  // Remove befriending item if required
  if (creature.befriend_with) {
    removeFromInventory(creature.befriend_with);
  }
  
  updateStatusDisplay();
  return creature.befriend_message;
}
```

### Secret Discovery System

```javascript
function handlePull(target) {
  if (target === "red_book" && gameState.current_room === "library") {
    if (gameState.flags.secret_study_found) {
      return "The bookshelf is already open, revealing the secret passage.";
    }
    
    // Discover the secret
    gameState.flags.secret_study_found = true;
    gameState.secrets_found.push("bookshelf_passage");
    gameState.score += 2.5;
    
    // Update room exits to show the secret passage
    rooms.library.exits.secret.blocked = false;
    
    updateStatusDisplay();
    return "You pull the red book and hear a mechanical click. The bookshelf swings open, revealing a hidden passage to the NORTH!";
  }
  
  return "You can't pull that.";
}
```

### Status Display Updates

```javascript
function updateStatusDisplay() {
  const statusElement = document.getElementById('status');
  
  const healthPercent = Math.round(gameState.health);
  const candyCount = gameState.inventory.filter(item => 
    items[item] && items[item].type === 'candy'
  ).length + gameState.candy_collected;
  
  const secretsFound = gameState.secrets_found.length;
  const roomsVisited = gameState.rooms_visited.length;
  const creaturesBefiended = gameState.creatures_befriended.length;
  
  const statusHTML = `
    <div class="status-section">
      <h3>═══ HALLOWEEN STATS ═══</h3>
      <p>HEALTH:       ${healthPercent}%</p>
      <p>CANDY BAG:    ${candyCount} pieces</p>
      <p>SECRETS:      ${secretsFound}/10</p>
      <p>ROOMS:        ${roomsVisited}/10</p>
      <p>CREATURES:    ${creaturesBefiended} befriended</p>
      <p><strong>SCORE: ${gameState.score}/100</strong></p>
    </div>
    
    <div class="status-section">
      <h3>INVENTORY:</h3>
      ${gameState.inventory.map(item => `<p>- ${items[item].name}</p>`).join('')}
    </div>
    
    <div class="status-section">
      <h3>COMMANDS:</h3>
      <p>LOOK, GO [direction]</p>
      <p>TAKE [item], USE [item]</p>
      <p>PET [creature], PULL [object]</p>
      <p>INVENTORY, HELP</p>
    </div>
  `;
  
  statusElement.innerHTML = statusHTML;
}
```

## Special Cases to Handle

### The 5-6 Key Puzzle Elements

1. **Dark Rooms + Flashlight**
   - Foyer starts dark, need flashlight to see items/exits
   - Some exits require light for safety

2. **Locked Doors + Keys**  
   - Library door locked, need brass key
   - Maybe basement door locked, need skeleton key

3. **Creature Befriending**
   - Black cat needs tuna can
   - Mouse needs cheese crumb
   - Each gives points when befriended

4. **Secret Discoveries**
   - Bookshelf passage (pull red book)
   - Maybe hidden panel (examine painting)
   - Each discovery gives points and new area access

5. **Room State Changes**
   - Basement might be flooded initially
   - Need to find drain valve to empty it
   - Changes room description and available exits

6. **Health/Candy System**
   - Health decreases from room effects (dust, startling sounds)
   - Candy can be kept (points) or eaten (health)
   - Creates strategic choice

## Helper Functions

```javascript
// Utility functions for common operations
function hasItem(itemName) {
  return gameState.inventory.includes(itemName);
}

function removeFromInventory(itemName) {
  const index = gameState.inventory.indexOf(itemName);
  if (index > -1) {
    gameState.inventory.splice(index, 1);
  }
}

function addToInventory(itemName) {
  if (!hasItem(itemName)) {
    gameState.inventory.push(itemName);
  }
}

function addToTextBuffer(text, type) {
  textBuffer.push({text: text, type: type});
  updateDisplay();
}
```

## Implementation Order

1. **Start with basic room navigation** - Load rooms.json, implement movement
2. **Add item system** - Take/drop items, basic inventory
3. **Implement lighting** - Flashlight toggle, dark/lit room descriptions  
4. **Add locked doors** - Key usage, exit blocking/unblocking
5. **Create creature interactions** - Pet commands, befriending mechanics
6. **Implement secrets** - Discovery triggers, hidden passages
7. **Add scoring display** - STATUS section updates, point tracking

This approach builds complexity gradually while keeping each piece simple and debuggable.