# Drone Survey Management System

A full-stack application for managing drone surveys, missions, and fleet operations.

## Project Structure

```
├── Frontend/           # React-based SPA frontend
│   ├── client/        # Frontend source code
│   └── shared/        # Shared types and schemas
├── Backend/           # Node.js/Express backend
│   ├── server/        # Backend source code
│   ├── prisma/        # Database schema and migrations
│   └── shared/        # Shared types and schemas
```

## Technology Stack

### Frontend

- React with TypeScript
- Vite build tool
- Wouter for routing
- TanStack Query for state management
- Radix UI primitives
- Tailwind CSS
- Leaflet for maps

### Backend

- Node.js & Express
- TypeScript
- Prisma ORM
- PostgreSQL (via Neon serverless)
- WebSocket for real-time updates
- JWT authentication

## Getting Started

### Prerequisites

- Node.js (Latest LTS version)
- npm or yarn
- PostgreSQL database

### Frontend Setup

1. Navigate to Frontend directory:

```bash
cd Frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5138`

### Backend Setup

1. Navigate to Backend directory:

```bash
cd Backend
```

2. Install dependencies:

```bash
npm install
```
e
3. Set up environment variables:

```bash
cp .env.example .env
```

4. Run database migrations:

```bash
npx prisma migrate dev
```

5. Start development server:

```bash
npm run dev
```

The backend API will be available at `http://localhost:3000`

## Key Features

- Mission Planning

  - Interactive map interface
  - Multiple mission types (crosshatch, perimeter, grid)
  - Advanced mission parameters
  - Recurring mission scheduling

- Fleet Management

  - Real-time drone status monitoring
  - Battery level tracking
  - Maintenance scheduling
  - Automated drone assignment

- Mission Monitoring

  - Real-time mission progress tracking
  - Live drone location updates
  - Mission control actions
  - Mission completion reporting

- Dashboard
  - Mission overview
  - Fleet status summary
  - Recent activity feed
  - Performance metrics

## Development Guidelines

### Code Style

- Follow TypeScript best practices
- Use functional components in React
- Implement proper error boundaries
- Write meaningful comments

### Testing Strategy

- Unit tests for utilities
- Component testing with React Testing Library
- Integration tests for critical flows
- E2E testing with Cypress

## API Documentation

The backend provides RESTful APIs for:

- User authentication
- Mission management
- Drone fleet operations
- Survey reporting
- Real-time updates via WebSocket

Detailed API documentation is available in the Backend README.

