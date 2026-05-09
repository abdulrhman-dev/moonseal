<h1 align="center">
Moonseal
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" >
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" >
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" >
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" >
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" >
  <img src="https://img.shields.io/badge/Redux-764ABC?style=for-the-badge&logo=redux&logoColor=white" >
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" >
</p>

<p align="center">
  A real-time multiplayer Magic: The Gathering game engine with 3D card visualization, live battlefield rendering, and socket-based gameplay synchronization. Full-stack TypeScript application featuring interactive card mechanics, player targeting systems, damage assignment, and phase management with an immersive 3D UI.
</p>

## Features

- ✅ **3D Card Visualization** - Immersive three-dimensional card rendering and interactions using Three.js
- ✅ **Real-time Multiplayer** - Socket.io-powered live gameplay synchronization across players
- ✅ **Interactive Mechanics** - Card targeting, damage assignment, and phase management systems
- ✅ **Responsive UI** - Modern, responsive interface built with React and Tailwind CSS
- ✅ **Type-Safe Development** - Full TypeScript implementation for reliable, maintainable code
- ✅ **Redux State Management** - Predictable state management with Redux Toolkit

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:

```bash
npm run dev
```

This runs the backend with hot-reload and the frontend development server.

### Production Build

```bash
npm run build
npm start
```

---

## Commands & Scripts

| **Action**               | **Command**     |
| ------------------------ | --------------- |
| Start Development Server | `npm run dev`   |
| Build for Production     | `npm run build` |
| Run Production Server    | `npm start`     |

---

## Project Structure

```
src/
├── client/              # React frontend application
│   ├── components/      # Reusable UI components
│   ├── css/             # Component-scoped styles
│   ├── features/        # Redux state management
│   ├── game/            # Game logic and hooks
│   ├── layers/          # 3D rendering layers
│   └── modals/          # Modal dialogs
└── server/              # Express backend
    ├── cards/           # Card definitions
    ├── classes/         # Game entity classes
    ├── socket/          # Socket.io handlers
    └── types/           # TypeScript type definitions
```

---

## Technology Stack

### Frontend

- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Three.js** - 3D graphics rendering
- **React Three Fiber** - React renderer for Three.js
- **Redux Toolkit** - State management
- **Tailwind CSS** - Utility-first styling
- **Vite** - Build tool and dev server

### Backend

- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **TypeScript** - Type-safe backend

### UI Components

- **Radix UI** - Accessible component library
- **Lucide React** - Icon library

---

## Deployment

The project includes Docker and Railway configuration for easy deployment.
