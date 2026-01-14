# To-Do Widget (Electron Desktop App) ⊹ ࣪ ˖

A **to-do list widget for Windows** built with **Electron, HTML, CSS, and JavaScript**.  
Designed to stay visible while you work, with a clean, non-distracting UI.

## ⤷ Features

- Widget-style window (small, focused, non-intrusive)
- Add and manage tasks quickly
- Simple and intuitive user interface
- Fast and lightweight
- Saves tasks locally
- Cross-platform via Electron (Windows-focused)
- Auto-Start on Windows
- 5 beautiful colors to choose from

## Demo ⋆˙⟡


<img src="https://github.com/user-attachments/assets/0e3ef4e4-3c6b-4647-be77-4db765fabfdc" width="400" height="300" alt="App Demo">

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
https://github.com/LNeutral/ToDo-Widget/blob/main/README.md
## › Usage ⭑.ᐟ

Run in Development Mode:
```bash
npm start
```
Build Windows installer
```bash
npm run build
```
- The installer will be created in the **dist/** directory.

## ⚙️ Project Structure

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
