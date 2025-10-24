# PyGuard Cyberpunk Terminal Components

This directory contains the cyberpunk terminal-themed components for the PyGuard interactive demo page.

## Components

### `code-rain.tsx`
Matrix-style digital rain background animation using HTML5 Canvas. Creates a cyberpunk atmosphere with falling green characters.

**Features:**
- 60fps smooth animation
- Responsive to window resize
- Low opacity overlay that doesn't interfere with content

### `terminal-header.tsx`
Top navigation bar with cyberpunk styling.

**Features:**
- Real-time UTC clock
- Theme toggle (dark/light mode)
- Smooth show/hide animations
- Terminal-style branding

### `terminal-footer.tsx`
Bottom footer with project attribution.

**Features:**
- Fixed positioning at bottom
- Backdrop blur effect
- Smooth transitions
- Terminal typography

### `pyguard-terminal.tsx`
Main interactive terminal component that showcases PyGuard functionality.

**Features:**
- Character-by-character typing animations
- Interactive command system with history
- Command history navigation (up/down arrows)
- Multiple commands:
  - `help` - Show available commands
  - `about` - About PyGuard
  - `demo` - Run validation demo
  - `patterns` - List bug patterns
  - `validate` - Validate Python code
  - `features` - Show features
  - `flipthebits` - Easter egg BSOD sequence
- Auto-focus on desktop for better UX
- BSOD (Blue Screen of Death) easter egg
- Responsive design for mobile and desktop

## Usage

The PyGuard terminal is available at `/pyguard` route:

```tsx
import { CodeRain } from "@/components/pyguard/code-rain"
import { TerminalHeader } from "@/components/pyguard/terminal-header"
import { TerminalFooter } from "@/components/pyguard/terminal-footer"
import { PyGuardTerminal } from "@/components/pyguard/pyguard-terminal"

export default function PyGuardPage() {
  const [showHeaderFooter, setShowHeaderFooter] = useState(true)

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060f] text-white">
      <CodeRain />
      <div className="relative z-10">
        <TerminalHeader isVisible={showHeaderFooter} />
        <PyGuardTerminal onExitTriggered={(isExiting) => setShowHeaderFooter(!isExiting)} />
      </div>
      <TerminalFooter isVisible={showHeaderFooter} />
    </main>
  )
}
```

## Styling

The components use the cyberpunk terminal theme defined in `app/globals.css`:

**Dark Mode Colors:**
- Background: `#0a0a0a` (deep black)
- Foreground: `#00ff41` (matrix green)
- Primary: `#059669` (emerald)
- Border: `#333333` (dark gray)

**Animations:**
- Blink animation for cursor: `1s step-end infinite`
- Typing speed: `2.5-3.75ms` per character
- Cursor blink: `125ms` toggle

## Easter Egg

Type `flipthebits` in the terminal to trigger the BSOD (Blue Screen of Death) easter egg sequence with:
- Dramatic system failure messages
- Kernel panic output
- Blue screen transition
- Countdown timer
- Restart functionality

## Responsive Design

- **Desktop:** Full terminal experience with auto-focus and command history
- **Mobile:** Simplified interface with touch-friendly input
- **Tablet:** Hybrid approach with optimized spacing

## Integration with Module Spelunker

The PyGuard page is accessible from the main Module Spelunker landing page via the "Try PyGuard Terminal" button in the header, and includes a back button for easy navigation.
