# To-Do Widget (Electron Desktop App)

A **to-do list widget for Windows** built with **Electron, HTML, CSS, and JavaScript**.  
Designed to stay visible while you work, with a clean, non-distracting UI.

## Features

- Widget-style window (small, focused, non-intrusive)
- Add and manage tasks quickly
- Simple and intuitive user interface
- Fast and lightweight
- Saves tasks locally
- Cross-platform via Electron (Windows-focused)
- Auto-Start on Windows

## Demo ⋆˙⟡

![App Demo](./demo.gif)



## ⤷ Prerequisites

Before you begin, make sure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

Check your versions:
```bash
node --version
npm --version
```

## ⏻ Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## › Usage ⭑.ᐟ

Start the application:
```bash
npm start
```

## Project Structure

- `index.html` - Main application UI
- `main.js` - Electron main process
- `preload.js` - Preload script for secure context
- `renderer.js` - Renderer process logic
- `styles.css` - Application styling
- `package.json` - Project dependencies and configuration

## Development

To modify the app:
1. Edit `index.html` for UI changes
2. Edit `styles.css` for styling
3. Edit `renderer.js` for application logic
4. Edit `main.js` for Electron configuration

## License

MIT
