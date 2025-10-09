# The Radley House - Game Specifications
# v0.35 - Scavenger Display Redesign & Content Updates

## Project Overview

**Game Title:** The Radley House
**Subtitle:** A well-articulated treasure hunt
**Version:** 0.35 (Scavenger Display Redesign)
**Total Project Size:** ~350KB (with all assets, images, and fonts)
**Source Files:** 8 core files + 7 data JSON files + 38 items + documentation + images
**Architecture:** Clean vanilla HTML/CSS/JavaScript with visual scavenger tracking, victory celebration animations, handwritten notes, locked doors, hidden items, interactive puzzles, two-column inventory, and comprehensive command system
**Target Platform:** Web browsers (GitHub Pages compatible)
**Current State:** Fully functional text adventure with rich visual feedback, victory celebration, polished UI, hidden commands, and comprehensive player guidance

---

## Major Features

### Scavenger Item Display System ✨ NEW in v0.35

#### Side-by-Side Layout
When taking a scavenger item, the display now shows:
- **250×250px item image** on the left
- **Stacked text badge** on the right

**Badge Format:**
```
*********
SCAVENGER
  HUNT
   ITEM
*********
   one
   of
  nine
```

**Technical Implementation:**
- Flexbox layout (`display: flex; align-items: flex-start;`)
- Gap: 20px between image and badge
- Badge padding-top: 60px (vertical centering)
- Each line is a separate span with `scavenger-found` class
- Manual `&nbsp;` spacing for staggered indent effect
- Flashing animation on all badge text

**Display Sequence:**
1. Take response text
2. Blank line
3. **Image + Badge (side-by-side)**
4. Blank line
5. Examine text
6. Blank line
7. Auto-LOOK (room description, items, exits)

**Space Requirements:**
- Text area width: 607px (577px usable)
- Image + gap + badge: ~390px (fits comfortably)

#### Scavenger Item Discovery Animations
- **Flashing badge animation:**
  - Duration: 2s
  - Easing: ease-in-out
  - Loop: infinite
  - Effect: opacity 1.0 → 0.3 → 1.0
  - Color: #ffa500 (bright orange/gold)
  - Applied to all badge spans

### Auto-LOOK After Scavenger Pickup NEW in v0.35

**Behavior:**
After collecting any scavenger item, automatically displays:
- Blank line
- Room description ("You are in the LIBRARY")
- Items in room ("YOU SEE: brass key")
- Exits ("EXITS: east, north")

**Purpose:**
- Smooth continuation of gameplay
- Reorients player after item pickup
- Shows what else is available to explore
- No manual LOOK command needed

### Empty Enter Key Handler NEW in v0.35

**Behavior:**
- **First empty Enter:** Shows helpful hint + auto-executes LOOK
- **Subsequent empty Enters:** Silent (anti-spam)
- **Reset:** Any actual command resets the flag

**Hint Message:**
```
I'll remind you of where you are now - but... btw... you can always use the
scroll bar to scroll back in your game to see what happened earlier!
```

**Purpose:**
- Helps confused/stuck players
- Teaches scroll functionality
- Reorients player without punishment
- Prevents accidental spam

### Content Updates - v0.35

#### Beatles → Monster Mash
**Monster Mash CD** (MUSIC-ROOM)
- Bobby Pickett, 1962
- Clue: "Graveyard smash"
- Description: "The 1962 Monster Mash song by Bobby Pickett - a twisted horror song"
- Examine: "A scary, vampire themed horror song that kids play repeatedly when they want to REALLY annoy their parents. 'I was working in the lab, late one night... We did the Monster Mash!'"
- Images: monsterMashCD90x90.png, monsterMashCD250x250.png
- Points: 10

#### Bringing Up Baby → Stranger Things
**Stranger Things DVD** (TV-ROOM)
- Netflix 2016 series, starring Millie Bobby Brown
- Clue: "Schwinn Sting-Ray" (bikes featured in show)
- Description: "A DVD of the 2016 Netflix series Stranger Things"
- Examine: "An old style clamshell case DVD of the 2016 Netflix series Stranger Things. Not scratched at all!"
- **Legal Disclaimer** (slow-blinking animation):
  ```
  (LEGAL DISCLAIMER:'Stranger Things' is a trademark of Netflix Inc.
  and is brought to you by paid subscription only by Netflix.
  Click HERE to subscribe. Season 5, Volume 1 COMING SOON on November 26, 2025!
  Hold onto your walkie-talkies and mark your calendar!)
  ```
- Images: strangerThings90x90.png, strangerThings250x250.png
- Points: 10

#### Mrs. McGillicutty's List Updates
Changed clues:
- "Fab Four" → "Graveyard smash" (Monster Mash)
- "Playful tiger" → "Schwinn Sting-Ray" (Stranger Things)

#### TV ROOM Description Updates
- Changed from "Bringing Up Baby" movie to "Stranger Things" show
- New description: "kids on bikes are racing through a dark forest, flashlights cutting through the fog"
- Look text: "currently playing 'Stranger Things'"
- DVD cabinet reveals "strangerthings" item (not "bringingupbaby")

### FOYER Entrance Effect NEW in v0.35

**Staggered "cautiously" text:**
```
You c
     a
      u
       t
        i
         o
          u
           s
            l
             y enter the Radley House FOYER...
```

Implementation: `<br>&nbsp;` tags with incrementing spaces (c=0, a=5, u=6, etc.)
Purpose: Dramatic emphasis for entering the scary house

### Room Name Capitalization NEW in v0.35

All house room names standardized to UPPERCASE:
- FOYER, LIBRARY, DINING ROOM, STUDY
- MUSIC ROOM, GAME ROOM, KITCHEN
- BEDROOM, TV ROOM

Consistent display throughout game text.

### 9th Item Victory Celebration Animation

**Sequence:**
1. Normal "nine of nine" message displays
2. 3-second delay
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

### Two-Column Inventory Display

**Implementation:**
- Scavenger items display in 2 columns instead of 1
- Reduces vertical space from 9 lines to 5 lines
- Prevents text overflow on HOME/QUIT screen

**Layout:**
```
SCAVENGER ITEMS (9/9)
  NVidia 5090 Video Card    Monster Mash CD
  Cup O' Noodles            Cat Mug
  Odd Dog                   Stranger Things DVD
  Frankenstein book         Decorative Pumpkin
  Krugerrand coin
```

### Hidden Commands System

#### HINT Command
- **Purpose:** Reveals all secret commands and aliases
- **Shortcut:** SECRETS
- Displays two-column formatted list of all command shortcuts

#### CELEBRATE Command
- **Purpose:** Replay victory animation
- **Requirement:** Must have all 9 scavenger items
- **Error:** "You have not won yet! You must collect all nine scaventer items to win."
- Shows count: "Found: X / 9"

#### RESTART Command
- **Purpose:** Reload game from beginning
- Implementation: `location.reload()`
- Header hint: "Type **RESTART** to start a new game"

#### DEBUG Command (Enhanced in v0.35)
- **Purpose:** Testing and development
- Adds 8 scavenger items (all except pumpkin)
- Adds 15 random candy/treats
- Marks all as found
- Updates inventory and scavenger grid
- **NEW:** Checks if all 9 items collected after adding
- **NEW:** Triggers celebration if player already had pumpkin
- **Messages:**
  - With pumpkin: "You now have all 9 scavenger items! Celebration incoming..."
  - Without pumpkin: "You still need to find the pumpkin - check the FOYER."

#### ABOUT Command
- Display game information and credits
- Editable in gameData.json

#### THROW Command (Easter Egg)
- Hidden command not in HELP
- Shortcuts: throw, toss, chuck, hurl
- Always refuses with humorous messages

### Command Shortcuts Cleanup NEW in v0.35

**Valid Shortcuts (matching commands.json):**
- take: [t, get, g] ❌ NOT: grab, pick
- examine: [x, ex, read]
- drop: [] ❌ NO shortcuts (not put, place)
- help: [h, ?]
- use: [u, ring, turn]
- say: [speak, push, press, dial]
- open: [unlock]

**Fixed Locations:**
- showHelp() function display
- handleHintCommand() alias list
- CONFIG_FALLBACKS command definitions

### Visual Scavenger Hunt System

**3×3 Grid Display:**
- Grid area: 313×280px in top-right of screen
- 9 squares representing each scavenger item
- Background: Radley House silhouette or HOME background
- Real-time updates as items are discovered

**Item Discovery:**
- Green checkmark (✓) appears when item found
- 90×90px image displays in grid
- Square position determined by room's `displaySquare` property
- Items remain visible throughout game

---

## Game Structure

### Scavenger Hunt Items (9 Total)

**Current List:**

1. **NVidia 5090 Video Card** (GAME-ROOM)
   - Clue: "Video game hardware helper"
   - Hidden, revealed by examining powerful PC
   - Points: 10

2. **Cup O'Noodles** (KITCHEN)
   - Clue: "Food from the sea"
   - Visible from start
   - Points: 10

3. **Krugerrand Gold Coin** (STUDY)
   - Clue: "Atomic 79" (gold's atomic number)
   - Hidden in safe, requires combination 13-97-55
   - Points: 10

4. **Monster Mash CD** (MUSIC-ROOM) 🆕
   - Clue: "Graveyard smash"
   - Bobby Pickett, 1962
   - Visible from start
   - Points: 10

5. **Cat Mug** (DINING-ROOM)
   - Clue: "Scary Feline"
   - Black ceramic cat-shaped mug
   - Visible from start
   - Points: 10

6. **Stranger Things DVD** (TV-ROOM) 🆕
   - Clue: "Schwinn Sting-Ray" (bikes in show)
   - Netflix 2016 series
   - Hidden in DVD cabinet
   - Points: 10

7. **Frankenstein Book** (LIBRARY)
   - Clue: "Not a monster" (Frankenstein is the doctor)
   - First Edition 1818 novel
   - Visible from start
   - Contains bookmark with safe combination
   - Points: 10

8. **Decorative Pumpkin** (FOYER)
   - Clue: "gourd"
   - Glass hand-blown pumpkin
   - Visible from start
   - Points: 10

9. **Odd Dog** (BEDROOM)
   - Clue: "Odd pup"
   - King Charles Cavalier ceramic figurine
   - Requires brass key from LIBRARY
   - Points: 10

### Rooms (13 total)

**Exterior:**
- START - Halloween Night (starting location)
- STREET-01, STREET-02
- NICE-PORCH (McGillicutty's)
- FRONT-PORCH (Radley House)

**Interior (Radley House):**
- FOYER, LIBRARY, DINING ROOM, STUDY
- MUSIC ROOM, GAME ROOM, KITCHEN
- BEDROOM, TV ROOM

**Special:**
- HOME (end game location)

### Commands (17 total)

**Movement:** north/n, south/s, east/e, west/w
**Observation:** look/l, examine/x/ex/read
**Inventory:** inventory/i, take/t/get/g, drop
**Actions:** use/u/ring/turn, eat, open/unlock, say/speak/push/press/dial
**System:** help/h/?, quit/home, hint/secrets, restart, about
**Hidden:** throw/toss/chuck/hurl, debug, celebrate

---

## Visual Design

### Layout Dimensions

**Overall Game Panel**: 950px × 720px

**Grid Layout:**
- Left column: 607px (text area + prompt)
- Right column: 313px (scavenger grid + status)
- Gap: 10px

**Text Area Usable Width**: 577px (607px - 30px padding)

### Color Palette

**Primary Colors:**
- Background: `#0a0a0a` (near black)
- Text (standard): `#00ff00` (bright green)
- Borders: `#ffffff` (white)
- Error text: `#ff0000` (red)
- Hint text: `#ffcc00` (yellow-gold)

**Accent Colors:**
- Scavenger found: `#ffa500` (bright orange/gold) - flashing
- Title: `#ff9500` (orange) with purple glow (`#6a0dad`)
- Legal disclaimer: `#ffdd77` (warm golden-yellow) - slow blinking

### Animations

**Flash Animation** (scavenger-found):
- Duration: 2s, infinite loop
- Effect: opacity 1.0 → 0.3 → 1.0

**Slow Blink Animation** (legal disclaimers): 🆕
- Duration: 3s, infinite loop
- Effect: opacity 1.0 → 0.5 → 1.0
- Used for Stranger Things disclaimer

**Punch Rotate** (celebration):
- Duration: 0.6s per item
- Staggered start (0.15s delay each)
- Effect: scale + rotate

---

## Technical Notes

### File Structure

```
textAdventure/
├── textAdventure.js         # Main game logic (~2900 lines)
├── textAdventure.css        # Styling + animations
├── index.html              # Game container
├── HALLOWEEN-GAME/         # Game data (JSON)
│   ├── gameData.json
│   ├── commands.json
│   ├── rooms-w-doors.json
│   ├── items.json
│   └── scavengerItems.json
├── assets/
│   ├── scavenger/          # 90x90 + 250x250 images
│   └── background/
└── claude-john-docs/
```

### State Management

- `currentRoom` - Player location
- `items[].location` - Item placement
- `items[].found` - Discovery tracking
- `awaitingQuitConfirmation` - Quit flow
- `awaitingCelebrationDismiss` - Animation control
- `lastWasEmptyEnter` - Empty Enter spam prevention 🆕

### Key Helper Functions

- `formatScavengerTwoColumns()` - Two-column layout
- `numberToWord()` - Number to word conversion
- `showCelebrationGrid()` - Victory animation
- `lookAtRoom()` - Room description display
- `updateScavengerGrid()` - Visual updates

---

## Version History

**v0.35** (Current) - Scavenger Display Redesign & Content Updates
- Side-by-side scavenger item display (image + badge)
- Empty Enter key handler with helpful hint
- Beatles → Monster Mash replacement
- Bringing Up Baby → Stranger Things replacement
- Mrs. McGillicutty's list clue updates
- Room name capitalization standardization
- FOYER "cautiously" staggered text effect
- Gong handle text fixes
- Command shortcuts cleanup
- Auto-LOOK after scavenger pickup
- DEBUG command celebration trigger
- CELEBRATE error message update

**v0.32** - Victory Celebration & Polish
- 9th item celebration animation
- Two-column inventory
- HINT/CELEBRATE/RESTART/ABOUT commands
- Header redesign with Halloween theme

**v0.31** - Pre-celebration checkpoint
**v0.30** - Working game, needs scoring/ending
**Earlier versions** - Core development

---

*Last updated: October 9, 2025*
*Game ready for Halloween 2025*
