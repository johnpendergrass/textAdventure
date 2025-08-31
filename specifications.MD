# Text Adventure Game - Project Specifications

## Project Overview
A browser-based text adventure game in the style of 1970s/1980s Zork-style games.
Theme: Halloween Edition - "An exciting game of Trick or Treating and Suspense!"

## Technical Specifications

### Layout
- Fixed window size: 1280x720 pixels
- 4-section grid layout with 2px white borders and 10px gutters:
  1. **HEADER** - Full width, 120px height, centered text
  2. **TEXT** - 3/4 width, main content area 
  3. **PROMPT** - 3/4 width, 40px height, command input area
  4. **STATUS** - 1/4 width, spans height of TEXT + PROMPT sections

### Styling
- Black background with white text
- Monospace font family (Courier New)
- H1 text color: orange
- All sections have white borders
- Responsive grid using CSS Grid

### Text Display System
- **TEXT Box Features:**
  - Scrollable content with custom green scrollbar
  - Three-color text system:
    - **Prompt Echo** (#ffcc00 yellow): User commands ("> look north")
    - **Command Output** (#1acdb2 teal): System responses (help, inventory)
    - **Flavor Text** (#00ff00 green): Story/narrative descriptions
  - Buffer system stores all game history
  - PAGE UP/DOWN scrolling (4 lines at a time)
  - Auto-scroll to bottom for new content

### Files Structure
- `index.html` - Main HTML structure with header content
- `textGame.css` - All styling, layout, and text colors
- `textGame.js` - Text buffer system and display logic
- `backup/` - Backup files folder

## Development Approach
- Build in very small increments
- Add minor improvements gradually
- Don't suggest new features unless asked
- Wait for user direction on each step

## Development Notes

### Backup Procedure
When John asks to create a backup:
- Backup ALL project files (index.html, textGame.css, textGame.js, etc.)
- Place backups in `/backup` folder
- Use naming convention: `<filename>.<extension>.backup##` (incrementing numbers)
- Example: `index.html.backup01`, `index.html.backup02`, etc.