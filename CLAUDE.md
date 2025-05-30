# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
cd frontend
npm install           # Install dependencies
npm run dev          # Start development server
npm run tauri:dev    # Start Tauri app in development mode
```

### Testing
```bash
cd frontend
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Run tests with UI
npm run test:e2e     # Run Playwright E2E tests
```

### Code Quality
```bash
cd frontend
npm run lint         # Run ESLint
npm run build        # Build for production (includes type checking)
```

### Build
```bash
cd frontend
npm run tauri:build  # Build Tauri app for production
```

## Architecture Overview

This is a desktop application for creating and editing game scenario scripts ("skits") using a no-code approach. The architecture follows a React frontend + Tauri backend pattern:

### Core Structure
- **Frontend**: React + TypeScript with Vite, located in `frontend/`
- **Desktop App**: Tauri (Rust) wrapper for cross-platform deployment
- **State Management**: Zustand with Immer for immutable updates
- **UI**: Shadcn UI components with Tailwind CSS
- **Drag & Drop**: dnd-kit library for command manipulation

### Key Data Models
- **Commands**: Defined in YAML files, represent individual actions/instructions
- **Skits**: JSON files containing sequences of commands with metadata
- **Command Definitions**: Schema definitions for command types and their properties

### Application Flow
1. **Command Loading**: `commands.yaml` defines available command types and their properties
2. **Skit Management**: Users create/edit skits by arranging commands in sequences
3. **Real-time Editing**: Left panel shows command list, right panel shows selected command properties
4. **File System**: Tauri handles file I/O for saving/loading skits and commands

### State Management (skitStore.ts)
The main application state includes:
- `skits`: All loaded skit files
- `currentSkitId`: Currently active skit
- `selectedCommandIds`: Multi-select support for commands
- `commandDefinitions`: Available command types from YAML
- `validationErrors`: Real-time validation feedback
- `history`: Undo/redo functionality

### Component Hierarchy
```
App
├── MainLayout
├── Toolbar (undo/redo, save, etc.)
├── CommandList (left panel - skit commands)
├── CommandEditor (right panel - selected command properties)
└── ValidationLog (bottom - error display)
```

### File System Integration
- **Development**: Uses sample files via fetch for web preview
- **Production**: Tauri APIs for actual file system access
- **Project Structure**: `commands.yaml` + `skits/` directory containing JSON files

### Reserved Commands
The system includes built-in command types like `group_start`/`group_end` for organizing commands into collapsible sections. These are merged with user-defined commands from YAML.

### Validation System
Real-time validation using JSON Schema validation (ajv) ensures commands have required properties and correct data types before saving.

## Development Notes

- The project supports both web development (using sample data) and Tauri desktop app modes
- All file operations must use Tauri APIs in production builds
- Command definitions are hot-reloadable during development
- The UI is fully keyboard accessible with shortcut support
- Multi-select operations (copy/cut/paste/delete) work across command groups
- Drag and drop reordering maintains proper command relationships