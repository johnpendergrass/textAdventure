# The Radley House - To Be Continued
## Session: October 7, 2025 - 14:00

### Current State: v0.34 - INTRO Room Removed

The game has been streamlined by removing the intermediate INTRO room. Players now move directly from START to STREET-01, creating a tighter, more focused introduction to the game.

---

## Recent Work Completed (This Session)

### 1. **Removed INTRO Room** ✂️
- Deleted entire INTRO room definition
- Simplified navigation: START → STREET-01 → STREET-02
- Room count reduced from 14 to 13

### 2. **Updated Door Connections**
- **Deleted doors:**
  - `start2intro` (no longer needed)
  - `intro2street-01` (no longer needed)
- **Created new door:**
  - `start2street-01` - Direct connection between START and STREET-01
- Door count reduced from 14 to 13

### 3. **Enhanced START Room Text**
- Added mention of Mrs. McGillicutty's house to first-time text
- Improved narrative flow: "It looks like it might be Mrs. McGillicutty's house!"
- Updated repeat text to reference Mrs. McGillicutty's house
- Creates better anticipation and direction

### 4. **Improved STREET-01 Room**
- **Integrated key INTRO content:**
  - Moved important hint about typing commands from INTRO
  - Explains command format: single words (go north, look) and two words (get key)
  - Explains that bold text = commands or keywords
- **Fixed typo:** "well-litfront" → "well-lit front"
- **Enhanced first-time narrative:**
  - "You walk east down the street..." (was "You continue east...")
  - Connects to the light seen from START
  - "That light you saw looks like it is coming from her porch"
  - Better introduction before Radley House exploration
- **Updated exit:** West now returns to START (was INTRO)

### 5. **No Game Mechanics Changes**
- INTRO had no items, puzzles, or special interactions
- All essential instructional text preserved in STREET-01
- No impact on gameplay or progression

---

## Technical Implementation Details

### File Changes Made

**rooms-w-doors.json:**
1. Deleted INTRO room (was lines 30-44)
2. Modified START room exits: `east` now points to STREET-01 via start2street-01 door
3. Modified STREET-01 room:
   - Updated first-time text to include INTRO's instructional hints
   - Changed west exit from INTRO to START
   - Fixed typo
4. Deleted start2intro door (was lines 300-306)
5. Deleted intro2street-01 door (was lines 308-314)
6. Added start2street-01 door (new definition)

**No other files changed** - items, doors, and game mechanics remain intact.

### Room Flow (Updated)
New player progression:
```
START → STREET-01 → STREET-02 (Radley House)
            ↓
      NICE-PORCH (Mrs. McGillicutty's)
```

### Design Rationale

**Why remove INTRO?**
- Redundant transitional space
- Instructions can be delivered in STREET-01 where they're more relevant
- Tighter pacing - players reach first meaningful location faster
- Simpler mental model of the game world
- One less room to maintain and document

---

## Current File Structure

### Rooms (13 total - was 14)
**Exterior:**
- **START** - Initial spawn point with Halloween night intro
- **STREET-01** - Mrs. McGillicutty's house area (now includes instructions)
- **STREET-02** - In front of Radley House
- NICE-PORCH, FRONT-PORCH, BACK-PORCH

**Interior (Radley House):**
- FOYER, GAME-ROOM, STUDY, DINING-ROOM
- MUSIC-ROOM, KITCHEN, TV-ROOM, BEDROOM, LIBRARY

**Special:**
- HOME (end game location)
- INVENTORY (virtual room)

### Doors (13 total - was 14)
- **start2street-01** ⭐ NEW
- street-012street-02
- street-012nice-porch
- nice-porch2nice-house
- street022front-porch
- front-porch2foyer
- foyer2library, foyer2study, foyer2dining-room
- library2music-room
- dining-room2kitchen, dining-room2tv-room
- study2tv-room
- music-room2game-room (locked, puzzle required)
- bedroom2tv-room (locked, key required)

### Items (38 total - unchanged)
- **Scavenger items:** 9
- **Candy items:** 23
- **Quest items:** 6

---

## Known Issues / Limitations

**None identified** - INTRO removal was clean with no side effects.

---

## Immediate ToDo Items

### 1. **Polish Introduction Text** 🎨
**START room:**
- Review welcome message length and pacing
- Consider if the centered title needs adjustment
- Ensure the light-down-the-street hook is compelling

**STREET-01 room:**
- Review integrated instructional text flow
- Make sure command hints are clear but not overwhelming
- Ensure smooth transition from START

### 2. **Change Safe Combination** 🔐
**Current combination:** 13-97-55 (stored as "139755" in code)
- Located in: `textAdventure.js` line 1370
- Need to decide on new combination
- Should be memorable but not obvious
- Clues should be updated accordingly in items

**Implementation:**
- Update `handleSayCommand()` function
- Update any hint items that reference the combination
- Test to ensure new combination works

### 3. **Improve Scoring System** 🏆
**Current scoring:**
- Scavenger Items: X / 9
- Treats: X / 20

**Improvements needed:**
- Calculate a nice round final score (100 points? 1000 points?)
- Weight scavenger items more heavily than treats
- Possible scoring ideas:
  - Scavenger items: 10 points each (90 points total)
  - Treats: 0.5 points each (10 points total)
  - Total: 100 points possible
- Add scoring calculation function
- Display final score on HOME screen
- Consider bonus points for:
  - Finding all items
  - Completing puzzles
  - Opening safe

---

## Long-Term ToDo Items

**Content Enhancements:**
- Review all room descriptions for consistency
- Ensure narrative flow makes sense after INTRO removal
- Consider if other rooms could be combined/simplified

**Polish:**
- Playtest the new START → STREET-01 flow
- Get feedback on pacing
- Verify all hints are clear

**Documentation:**
- Update specifications.md with INTRO removal
- Update room count from 14 to 13 throughout docs
- Document the simplified navigation flow

**Technical:**
- Consider implementing save game system
- Achievement tracking
- High score display

---

## Version Tracking

**Previous version:** v0.33 (New START Room & Enhanced Introductions)
**Current version:** v0.34 (INTRO Room Removed & Streamlined Navigation)

**Key changes from v0.33:**
- Removed INTRO room completely
- Simplified door structure (13 doors instead of 14)
- Enhanced START and STREET-01 text
- Fixed "well-lit front" typo
- Direct START → STREET-01 connection

---

## Safe Combination Details (For Next Steps)

**Current Implementation:**
- **File:** textAdventure.js
- **Line:** 1370
- **Current code:** `normalizedPhrase === "139755"`
- **Displayed as:** "13-97-55"
- **Location:** STUDY room
- **Reveals:** Krugerrand (scavenger item) + password parchment

**When changing:**
1. Update line 1370 with new number (no spaces/dashes)
2. Update line 1373 with formatted display version
3. Search for any clue items that reference the combination
4. Test both correct and incorrect combinations

---

## Notes for Next Session

**Priorities:**
1. Clean up START and STREET-01 text for better flow
2. Choose and implement new safe combination
3. Design and implement point-based scoring system

**Game state:**
- All core functionality working perfectly
- No bugs introduced by INTRO removal
- Ready for text polish and scoring implementation

**Files modified this session:**
- HALLOWEEN-GAME/rooms-w-doors.json (major restructuring)

**No code changes** were needed in textAdventure.js - the existing game engine handles the new room structure correctly.

---

**Session completed:** October 7, 2025 at 14:00
**Version:** 0.34 (INTRO Room Removed)
**Status:** ✅ Fully functional, ready for polish and scoring
