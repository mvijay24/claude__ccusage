# Installation Guide

## Quick Install (Recommended)

```bash
# Clone the repository
git clone https://github.com/mvijay24/claude__ccusage.git
cd claude__ccusage

# Install dependencies
npm install

# Link globally
npm link

# Run from anywhere
ccusage
```

## Alternative Methods

### Method 1: Direct from GitHub
```bash
# Run without installing
npx github:mvijay24/claude__ccusage

# Or with bunx
bunx github:mvijay24/claude__ccusage
```

### Method 2: Local Development
```bash
# Clone and run locally
git clone https://github.com/mvijay24/claude__ccusage.git
cd claude__ccusage
npm install
node bin/ccusage.js
```

## Setup Shortcuts (Optional)

For quick access with `cc` commands:

```bash
# Download shortcuts
curl -o ~/.ccusage_shortcuts.sh https://raw.githubusercontent.com/mvijay24/claude__ccusage/main/.ccusage_shortcuts.sh

# Add to bashrc
echo -e "\n# Load ccusage shortcuts\nif [ -f ~/.ccusage_shortcuts.sh ]; then\n    source ~/.ccusage_shortcuts.sh\nfi" >> ~/.bashrc

# Reload shell
source ~/.bashrc
```

Now you can use:
- `cc` - Quick access
- `cc 30` - Last 30 days
- `cc month` - Monthly view
- `cc help` - All shortcuts

## Requirements

- Node.js 16+
- Claude Code must be installed and used at least once
- Linux/macOS/WSL (Windows users need WSL)

## Troubleshooting

If you get "command not found":
```bash
# Check if npm global bin is in PATH
echo $PATH | grep npm

# If not, add to PATH
export PATH="$PATH:$(npm bin -g)"
```

For Windows users:
```bash
# Use from WSL terminal
wsl ccusage

# Or from Windows Terminal with WSL profile
ccusage
```