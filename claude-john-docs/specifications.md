# Halloween Text Adventure - Complete Specifications
# v0.32 - Victory Celebration & Polish Complete

## Project Overview

**Game Title:** The Radley House
**Subtitle:** A well-articulated treasure hunt
**Version:** 0.32 (Victory Celebration Complete)
**Total Project Size:** ~300KB (with all assets, images, and fonts)
**Source Files:** 8 core files + 7 data JSON files + 38 items + documentation + images
**Architecture:** Clean vanilla HTML/CSS/JavaScript with visual scavenger tracking, victory celebration animations, handwritten notes, locked doors, hidden items, interactive puzzles, two-column inventory, and comprehensive command system
**Target Platform:** Web browsers (GitHub Pages compatible)
**Current State:** Fully functional text adventure with rich visual feedback, victory celebration, polished UI, hidden commands, and comprehensive player guidance

## Major Features

### Victory Celebration System 🎉 NEW in v0.32

#### Scavenger Item Discovery Message
- **Congratulatory text** on picking up each scavenger item
- Format: `** SCAVENGER HUNT ITEM!!! ** (one of nine)`
- **Flashing animation:**
  - Bright orange color (#ffa500)
  - 20px bold font
  - 2-second opacity animation (1 → 0.3 → 1)
  - Infinite loop while visible
- **Word-based count:** "one of nine" instead of "1 / 9"
- **Single display:** Only shows on TAKE, not in subsequent INVENTORY/EXAMINE
- Appears above item description and 250px image

#### 9th Item Victory Celebration Animation
**Sequence:**
1. Normal "nine of nine" message displays
2. 3-second pause
3. **Grid Animation Begins:**
   - Semi-transparent dark overlay (85% opacity black)
   - 3×3 grid of all 9 scavenger items
   - Images sized to 165×165px with 5px gaps
   - 2px white border around grid
   - Centered in text area using fixed positioning

**Animation Details:**
- **Punch-rotate effect:**
  - Each image starts at 10% scale, 0° rotation, opacity 0
  - Rotates 360° while scaling to 110% (60% mark)
  - Settles to 100% scale, opacity 1
  - 0.6s duration per image
  - Staggered by 0.15s (9 images = ~1.5s total animation)
- **Glowing aura:**
  - Orange/gold drop-shadow filters
  - Pulsing animation (2s infinite loop)
  - Starts after punch animation completes

**Victory Text Overlay:**
- Appears 5 seconds after grid starts
- Centered over grid with fade-in + scale animation
- **Content:**
  ```
  YOU WON! (48px)
  You found all NINE
  SCAVENGER ITEMS!

  Arthur and Mr. Radley (28px)
  CONGRATULATE YOU!! (28px)
  ```
- **Styling:**
  - Gold color (#ffd700)
  - Bold font
  - Chiseled text-shadow effect (black + white highlights)
  - Additional gold glow
  - Semi-transparent black background (85%)
  - 4px gold border with rounded corners

**Dismissal:**
- Player presses Enter to dismiss
- Overlay fades out over 0.5s
- Returns to normal game display
- Input blocked during celebration (`awaitingCelebrationDismiss` flag)

### Two-Column Inventory Display NEW in v0.32

**Implementation:**
- Scavenger items display in 2 columns instead of 1
- Reduces vertical space from 9 lines to 5 lines
- Prevents text overflow on HOME/QUIT screen

**Technical Details:**
- Column width: 33 characters
- Spacing: `&nbsp;` HTML entities (browsers won't collapse)
- Smart length calculation: Strips HTML tags before measuring
- Helper function: `formatScavengerTwoColumns(scavengerItems)`
- Applied to:
  - INVENTORY command
  - HOME screen ending

**Layout:**
```
SCAVENGER ITEMS (9/9)
  NVidia 5090 Video Card    Beatles Revolver CD
  Cup O' Noodles            Cat Mug
  Odd Dog                   Bringing Up Baby DVD
  Frankenstein book         Decorative Pumpkin
  Krugerrand coin
```

### Hidden Commands System NEW in v0.32

#### HINT Command
- **Purpose:** Reveals all secret commands and aliases
- **Shortcut:** SECRETS
- **Display sections:**
  1. **Hidden/Secret Commands:**
     - ABOUT - Game information
     - DEBUG - Testing items
     - CELEBRATE - Replay victory
     - RESTART - Reload game
     - THROW - Easter egg
     - HINT [secrets] - Shows list

  2. **Command Aliases** (2-column format):
     - Directions: north [n], south [s], east [e], west [w]
     - Help: help [h, ?]
     - Common: look [l], examine [x, ex, read], take [t, get, g, grab, pick]
     - Actions: drop [put, place], inventory [i]
     - Special: use [u, ring, turn], eat, open [unlock], say [speak, push, press, dial]
     - System: quit [home]

- Compact display saves vertical space
- Uses &nbsp; padding for alignment

#### CELEBRATE Command
- **Purpose:** Replay victory animation
- **Requirement:** Must have all 9 scavenger items
- **Error handling:** Shows "You haven't collected all items yet! Found: X / 9"
- Immediately triggers full celebration sequence
- Perfect for showing off ending or testing

#### RESTART Command
- **Purpose:** Reload game from beginning
- **Implementation:** Simple `location.reload()`
- Resets all items, locations, and game state
- Same as browser refresh but accessible in-game
- Header hint: "Type **RESTART** to start a new game"

#### ABOUT Command
- **Purpose:** Display game information and credits
- **Storage:** gameData.json → "about" section
- **Editable:** Change text without touching code
- **Current content:**
  - Title: "About The Radley House"
  - Game description
  - Credits: "Game created by Poppy/John"
  - Version number
- Uses same text array format as startup.welcomeText

#### DEBUG Command (Enhanced)
- **Purpose:** Testing and development
- **New features:**
  - Adds 8 scavenger items (all except pumpkin)
  - Adds 15 random candy/treats
  - Marks all as found
  - Updates inventory and scavenger grid
- **Message:** "DEBUG: Added 8 scavenger items and 15 treats to inventory. You still need to find the pumpkin!"
- Perfect for testing end-game scenarios

#### THROW Command (Easter Egg)
- Hidden command not in HELP
- Shortcuts: throw, toss, chuck, hurl
- Always refuses with humorous messages
- Validates inventory like other commands
- 5 random rejection responses

### Header Design 🎃 NEW in v0.32

**Title:** "The Radley House"
- Font: Cinzel (elegant serif from Google Fonts)
- Size: 40px
- Weight: 700 (bold)
- Color: Bright orange (#ff9500)
- Letter-spacing: 4px (spread out horizontally)
- Text-shadow:
  - Purple glow (0 0 10px and 20px #6a0dad)
  - Black depth shadow (2px 2px 4px #000)

**Subtitle:** "A well-articulated treasure hunt"
- Font: Special Elite (typewriter-style) or Courier New
- Size: 16px
- Style: Italic
- Color: Pale purple (#b19cd9)
- Text-shadow: Subtle purple glow (0 0 5px purple 50% opacity)
- **Meaning:** Witty reference to text-based gameplay

**Header Hints:**
- Bottom-left: "Type **RESTART** to start a new game"
  - Color: #bbb, 10px
- Bottom-right: "Type HINT for secrets"
  - Color: #888, 10px

**Color Scheme:**
- Orange/Purple/Black Halloween theme
- Complements scavenger grid background
- Professional yet playful

### Inline Item Images System ✨

#### Candy Item Images (150px)
- 23 candy items with custom 150×150 images
- Display on EXAMINE and TAKE commands
- Pattern: Item name → Image → Examine text
- Auto-scroll after image loads

#### Scavenger Item Images (250px)
- 9 scavenger items with 250×250 images
- Larger format for important collectibles
- Same display pattern
- Items:
  1. NVidia 5090 Video Card
  2. Cup O' Noodles
  3. Odd Dog figure
  4. Beatles Revolver CD
  5. Cat Mug
  6. Bringing Up Baby DVD
  7. Frankenstein book
  8. Decorative Pumpkin
  9. Krugerrand coin

#### Technical Implementation
- Smart image loading with `onload` handler
- Scrolls text area to show full content
- Separate logic branches for scavenger vs. candy
- Images stored in assets/scavenger/ and assets/candy/
- Both 90×90 (grid) and 150/250px (display) versions

### Visual Scavenger Hunt System ✨

**3×3 Grid Display:**
- Grid area: 313×280px in top-right of screen
- 9 squares representing each scavenger item
- Background: Radley House silhouette or HOME background
- Real-time updates as items are discovered

**Item Discovery:**
- Green checkmark (✓) appears when item found
- Square position determined by room's `displaySquare` property
- Items remain visible throughout game
- Provides visual progress feedback

**Background Images:**
- Changes based on current room
- HOME: Special HOME background
- Radley House rooms: Haunted house silhouette
- Creates atmospheric connection to location

### Status Panel System

**Score Section (Centered):**
- SCORE (no colon)
- Scavenger Items: X / 9
- Treats: X / 20

**Commands Section:**
- Shows essential commands with shortcuts
- Arguments indicated with `?` for clarity:
  - (h)elp, (l)ook, (i)nventory
  - (t)ake ?, (d)rop ?, e(x)amine ?
  - (u)se ?, eat ?, say ?
- Commands centered under title

**Compass:**
- ASCII art directional indicator
- Shows available exits
- Positioned for visual balance

### HOME/QUIT Confirmation System

**Two-Step Process:**
1. First HOME/QUIT: Warning message
   - Yellow text (#ffcc00)
   - "!*!*!*! HEY! This will take you back to your home and QUIT THE GAME!"
   - Underlined emphasis on "QUIT THE GAME"
2. Second HOME/QUIT: Executes quit

**Auto-Cancel:**
- ANY other command cancels quit attempt
- Natural gameplay flow preserved
- Prevents accidental quits

**HOME Room Display:**
- Moved to HOME room
- Shows complete inventory summary
- Lists all collected items:
  - Scavenger items (two-column format)
  - Treats (comma-separated)
- Satisfying conclusion showing player achievements

### Interactive Puzzle Systems

#### SAY Command System
- Multi-purpose phrase input
- **Safe combination:** `SAY 27-13-42`
- **Door passwords:** `SAY friend` (Tolkien reference)
- **Phone numbers:** `SAY 5551234`
- Shortcuts: speak, push, press, dial
- Context-sensitive responses

#### OPEN Command System
- **Cabinet:** First open reveals hidden DVD
- **Safe:** Requires combination via SAY
- Shortcut: unlock
- State tracking (opened/not opened)

#### Door Lock System
- Locked doors block movement
- Keys required to unlock
- State persists once unlocked
- Clear feedback on attempt

### Text Formatting System

**HTML Support:**
- `<b>bold</b>` for emphasis
- `<br>` for line breaks
- Color spans for hints
- Inline images

**Smart Spacing:**
- Blank line before/after commands
- Strategic spacing in room descriptions
- No double-blank issues
- Professional presentation

### Handwritten Notes System

**Special Display:**
- Cream/ivory background (#fffef0)
- Dark text (#2d2d2d)
- Caveat cursive font (Google Fonts)
- 20px size
- Padding and box-shadow for paper effect
- Preserves line breaks

**Usage:**
- Clues and atmosphere
- Used for notes found in game
- Distinct visual style

## Game Structure

### Rooms (13 total)
**Exterior:**
- STREET-01, STREET-02
- NICE-PORCH (McGillicutty's)
- FRONT-PORCH, BACK-PORCH (Radley House)

**Interior (Radley House):**
- FOYER, GAME-ROOM, STUDY, DINING-ROOM
- MUSIC-ROOM, KITCHEN, TV-ROOM, BEDROOM

**Special:**
- HOME (end game location)

### Items (38 total)
**Scavenger Items (9):** Valuable collectibles
**Candy Items (23):** Halloween treats
**Quest Items (6):** Keys, notes, puzzle pieces

### Commands (17 total)
**Movement:** north, south, east, west
**Observation:** look, examine
**Inventory:** inventory, take, drop
**Actions:** use, eat, open, say
**System:** help, quit/home, hint, restart, about
**Hidden:** throw, debug, celebrate

## File Structure

### Core Files
- textAdventure.html (147 lines)
- textAdventure.css (300+ lines with animations)
- textAdventure.js (~2600 lines)

### Data Files (HALLOWEEN-GAME/)
- gameData.json (meta, about, startup)
- commands.json (17 commands)
- rooms-w-doors.json (13 rooms, 13 doors, 3 puzzles)
- items.json (27 regular items)
- scavengerItems.json (11 scavenger items, 9 active)
- uiConfig.json (status panel configuration)
- keyboardShortcuts.json (no shortcuts currently)

### Assets
- scavenger/ - 9 items × 2 sizes (90×90, 250×250)
- candy/ - 23 items × 2 sizes (90×90, 150×150)
- background/ - Room background images
- Google Fonts: Cinzel, Special Elite, Caveat

## Design Decisions

### Color Palette
- **Orange:** #ff9500 (title), #ffa500 (celebrations)
- **Purple:** #6a0dad (dark), #b19cd9 (pale)
- **Yellow:** #ffcc00 (prompts, hints)
- **Green:** #00ff00 (main text), #1acdb2 (command output)
- **Black:** Background
- **White:** Borders

### Typography
- **Headers:** Cinzel (elegant serif)
- **Subtitle:** Special Elite (typewriter)
- **Body:** Courier New (monospace)
- **Notes:** Caveat (handwritten cursive)
- Consistent spacing and sizing

### Layout (950×720px)
- **Grid:** 607px text, 313px right panel
- **Header:** 120px
- **Text area:** Variable height
- **Scavenger grid:** 280px
- **Status panel:** Variable
- **Prompt:** 40px

### Animation Principles
- Smooth, not jarring
- Appropriate timing (0.6s punch, 2s pulse)
- Staggered for visual interest
- Clear purpose (feedback, celebration)
- Dismissible by player

## Technical Notes

### State Management
- `currentRoom` - Player location
- `items[].location` - Item placement
- `items[].found` - Discovery tracking
- `awaitingQuitConfirmation` - Quit flow
- `awaitingCelebrationDismiss` - Animation control

### Helper Functions
- `formatScavengerTwoColumns()` - Two-column layout
- `numberToWord()` - Number to word conversion
- `showCelebrationGrid()` - Victory animation
- `restoreNormalDisplay()` - Cleanup
- `updateScavengerGrid()` - Visual updates

### Performance
- Minimal DOM manipulation
- CSS animations (GPU accelerated)
- Efficient text buffering
- No external dependencies
- ~300KB total size

## Version History

**v0.32** (Current) - Victory Celebration & Polish
- 9th item celebration animation
- Two-column inventory
- HINT/CELEBRATE/RESTART/ABOUT commands
- Header redesign with Halloween theme
- Enhanced DEBUG command

**v0.31** - Pre-celebration checkpoint
**v0.30** - Working game, needs scoring/ending
**v0.28** - Nearly finished, GUI work
**Earlier versions** - Core development

---

*Last updated: October 6, 2025*
*Game ready for playtesting and feedback*
