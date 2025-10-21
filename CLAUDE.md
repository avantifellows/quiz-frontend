# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development Server
```bash
npm run serve
```
Starts the development server with hot reloading at `http://localhost:8080/quiz/{quizId}?userId={userId}&apiKey={apikey}`.

### Building
```bash
npm run build                    # Production build
npm run build-staging            # Staging build
```

### Testing
```bash
npm run test:unit                # Run all unit tests
npm run test:unit -- Header.spec.ts  # Run specific test file
npx cypress run                  # Run e2e tests
```

### Code Quality
```bash
npm run lint                     # Check linting
npm run lint:fix                 # Fix linting issues
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure:
- `VUE_APP_BACKEND`: Backend API URL (default: http://127.0.0.1:8000)

For staging/production builds, use `.env.staging` or `.env.production` respectively.

## Architecture Overview

### Tech Stack
- **Frontend**: Vue 3 with TypeScript, Composition API
- **State Management**: Vuex 4
- **Routing**: Vue Router 4
- **UI Framework**: Tailwind CSS (with custom theme)
- **HTTP Client**: Axios
- **Testing**: Jest (unit), Cypress (e2e)
- **Build Tool**: Vue CLI 5

### Key Application Structure

#### Core Components
- `src/views/Player.vue` - Main quiz player interface
- `src/components/Questions/` - Question rendering components
- `src/components/Omr/` - OMR (Optical Mark Recognition) mode components
- `src/components/UI/` - Reusable UI components

#### Service Layer
- `src/services/API/` - API clients and endpoints
  - `RootClient.ts` - Axios configuration and error handling
  - `Quiz.ts`, `Question.ts`, `Session.ts` - Domain-specific API clients
- `src/services/Functional/Utilities.ts` - Utility functions

#### State Management
- `src/store/index.ts` - Vuex store with:
  - Question bucketing for performance
  - Locale management
  - Loading states

#### Types and Interfaces
- `src/types.ts` - Comprehensive TypeScript definitions for:
  - Question types (single-choice, multi-choice, numerical, subjective, matrix-match)
  - Quiz metadata and session data
  - API request/response shapes

### Key Features
- **Multi-language support** (English/Hindi) with vue-i18n
- **Question bucketing** for performance optimization
- **OMR mode** for optical mark recognition
- **Session management** with resume capability
- **Different quiz types**: assessment, homework, omr-assessment
- **Responsive design** with custom Tailwind breakpoints
- **MathJax integration** for mathematical expressions

### Authentication & Routing
- Routes require `userId` and `apiKey` query parameters
- Main route: `/quiz/:quizId` with authentication checks
- Error handling for 404 and 403 scenarios

### Styling Notes
- Uses custom Tailwind configuration with disabled preflight
- Custom color scheme with primary orange (#F78000)
- Custom font support for Hindi (Kruti Dev)
- Responsive breakpoints for mobile-first design

### Testing Setup
- Jest configured for unit testing with coverage
- Cypress for e2e testing with fixtures
- Mock implementations for external dependencies
- Test files follow `*.spec.ts` convention

### Build Configuration
- Vue CLI with TypeScript preset
- Webpack optimizations for performance
- Parallel builds disabled for stability
- Code splitting with lazy-loaded routes
