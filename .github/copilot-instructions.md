# Copilot Instructions: Discipline FX Journal

## Project Overview
A vanilla JavaScript single-page Forex/Crypto trading journal app. **No frameworks, no build tools, no backend.** Files are standalone and loaded directly in the browser. Data persists via browser `localStorage` only.

## Architecture & Data Flow

### Core Data Model (`script.js`)
- **Single data structure**: `trades` array stored in `localStorage["trades"]`
- **Trade object shape**:
  ```javascript
  {
    pair, date, session, direction, entry, sl, tp, lot, 
    risk, emotion, result, rr (calculated)
  }
  ```
- **No synchronization**: Each browser/device maintains separate data. Data loss occurs if localStorage is cleared.

### Component Separation
- **Form inputs** (`index.html`): All form field IDs follow the pattern `id="fieldName"` (e.g., `#pair`, `#entry`, `#result`)
- **Rendering**: `renderTrades()` regenerates the entire table on every trade change; no partial updates
- **Summary calculation**: `calculateSummary()` computes totals, win rate, avg R:R, and best pair; triggers chart update
- **Edit mode**: Button text changes to "Update Trade" and `saveBtn.onclick` is reassigned to update logic (stateful mutation)

### Chart Integration
- **Charting library**: Chart.js loaded from CDN
- **Chart type**: Doughnut chart showing [Wins, Losses, Break-even]
- **Update pattern**: Mutate `chart.data.datasets[0].data` array, then call `chart.update()`
- **Sample trades**: Pre-loaded if `localStorage["trades"]` is empty to demonstrate features

## Key Workflows

### Adding a Trade
1. User fills form fields with trade details
2. Click "Save Trade" → `saveTrade()` executes
3. **Critical step**: `calculateRR(entry, sl, tp)` computes Risk:Reward ratio
4. Trade object pushed to `trades` array → persisted to localStorage
5. `renderTrades()` regenerates table, clears form

### Editing a Trade
1. Click "Edit" button on table row
2. Form fields populate from `trades[index]`
3. Button text changes to "Update Trade" and `saveBtn.onclick` reassigned
4. Update logic overwrites `trades[index]`, persists, and resets button
5. **Critical detail**: Must reset `saveBtn.onclick = saveTrade` after update to restore save mode

### Deleting a Trade
1. Click "Delete" button
2. `trades.splice(index, 1)` removes entry
3. localStorage updated immediately
4. `renderTrades()` regenerates table

## Patterns & Conventions

### Event Listener Pattern
- Event listeners are **reattached on every `renderTrades()` call** (inefficient but simple)
- `.editBtn` and `.deleteBtn` selectors use `data-index` attributes to track trade position
- Avoid caching button references—they're re-created on re-render

### Form Handling
- All inputs are **cleared via `document.querySelector("form")?.reset()`** (no explicit field-by-field clearing)
- No client-side validation—assumes valid numeric inputs for `entry`, `sl`, `tp`, `lot`, `risk`

### localStorage Conventions
- Key is hardcoded as `"trades"` throughout; no constants defined
- No error handling for quota exceeded or access denied
- Load happens once at startup: `let trades = JSON.parse(localStorage.getItem("trades")) || []`

## Development Notes

### What NOT to Change
- **Session options** (Asia, London, New York): Hard-coded in form; mirrored in sample trades
- **Result states** (Pending, Win, Loss, Break-even): Referenced in filter logic and chart labels
- **Emotion field**: Free-form text, no validation (by design for flexibility)

### When Adding Features
1. **New trade fields**: Add to HTML `<input>` in form, include in trade object, update `renderTrades()` table row, update `saveTrade()` and edit logic
2. **New summary metric**: Add calculation in `calculateSummary()`, create new `.card` div in HTML
3. **New chart**: Create new Chart.js instance with same CDN approach; use same `trades` data
4. **Filtering**: Build on existing pattern—e.g., `trades.filter(t => t.pair === "EURUSD")` for pair-specific views

### Browser Compatibility
- Requires modern JS (arrow functions, destructuring, `optional chaining` `?.`)
- Chart.js via CDN—check internet connectivity if chart fails to render
- No transpilation; test in target browsers directly

### Testing Edge Cases
- **Empty trades**: Summary cards show 0, chart renders with all zeros
- **Duplicate pairs**: Best pair logic uses `reduce()` with comparison—last duplicate wins
- **Invalid numeric inputs**: R:R calculation may produce `Infinity` or `NaN`; no defensive checks

## File Reference
- [index.html](../index.html): Form inputs, summary cards, trade table structure
- [script.js](../script.js): All business logic, data management, event handlers
- [style.css](../style.css): Responsive grid layout, card/table styling, button animations

