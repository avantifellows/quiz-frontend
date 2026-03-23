# Quiz Frontend - Project Context

> Last updated: 2026-03-23

## What Is This Project?

This is the **Quiz Frontend** for [Avanti Fellows](https://avantifellows.org/), an education non-profit in India. It is a generic quiz engine that serves different types of questions (MCQ, subjective, numerical, matrix-match, etc.) in a mobile-friendly web application. The app is used by students (primarily low-income, government school students) to take quizzes, assessments, homework, and fill out forms/questionnaires.

- **Repository**: `avantifellows/quiz-frontend`
- **License**: GPL v3
- **Backend**: [avantifellows/quiz-backend](https://github.com/avantifellows/quiz-backend) (Python/FastAPI)

---

## User Flow

1. A student receives a URL like `/quiz/{quizId}?userId={userId}&apiKey={apiKey}`
2. The app authenticates via the `apiKey` (checked against the backend's organization endpoint)
3. A **Splash Screen** is shown with quiz metadata (title, subject, grade, number of questions, quiz type)
4. For assessments, an **Instruction Page** with test overview, palette legend, and answering instructions is displayed (supports English/Hindi toggle)
5. The student clicks "Let's Start" (or "Resume" / "Review" for returning sessions)
6. The backend creates/resumes a **session** for the user-quiz pair
7. Questions are presented one at a time in a **QuestionModal** (standard mode) or all at once in a **SinglePageModal** (OMR/single-page mode)
8. Students answer questions; answers are submitted to the backend in real-time via session answer API calls
9. For assessments: a countdown timer runs; a question palette allows navigation; "Save & Next", "Clear", and "Mark for Review" actions are available
10. For homework: questions are answered one at a time with immediate feedback (correct/wrong highlighting, solution display)
11. For forms/questionnaires: similar to homework but without grading, scoring, or correct answer display
12. When the quiz ends (manually via "End Test" or automatically when timer expires), a **Scorecard** is shown with results, metrics, confetti animation, and sharing capability
13. If `next_step_url` is configured in quiz metadata, an auto-redirect countdown leads the student to the next step (another quiz, external URL, etc.)

### URL Query Parameters

| Parameter | Purpose |
|-----------|---------|
| `userId` | Required. Identifies the student. |
| `apiKey` | Required. Authenticates the organization. |
| `omrMode` | Optional. `true` to display in OMR/bubble-sheet mode. |
| `singlePageMode` | Optional. `true` to show all questions on one page with full text. |
| `autoStart` | Optional. `true` to skip the splash screen and start immediately. |
| `new_backend` | Optional. When present (any value), routes API calls to the ECS backend instead of the default Lambda backend. Requires `VUE_APP_BACKEND_ECS` env var to be set. |

---

## Quiz Types and Modes

| Quiz Type | Behavior |
|-----------|----------|
| `assessment` | Timed test, all questions navigable, "End Test" required, scorecard with marks |
| `omr-assessment` | Assessment displayed in OMR/bubble-sheet mode (all questions on single page) |
| `homework` | One question at a time, immediate feedback after each submission, solutions shown |
| `form` | Questionnaire mode - no grading, no scores, no correct answers, completion message only |

### Display Modes

- **Standard Mode** (`QuestionModal`): One question at a time with navigation buttons (previous/next), header with timer, question palette sidebar
- **OMR / Single-Page Mode** (`SinglePageModal`): All questions visible on a scrollable page, answers auto-submit on selection, used for OMR assessments and single-page forms
- The `singlePageMode` query param with `showFullText` shows full question text (non-OMR single page)

---

## Question Types Supported

| Type | Enum Value | Description |
|------|------------|-------------|
| Single Choice MCQ | `single-choice` | One correct answer from options |
| Multiple Choice MCQ | `multi-choice` | Multiple correct answers, supports partial marking |
| Numerical Integer | `numerical-integer` | Integer answer input |
| Numerical Float | `numerical-float` | Decimal answer input (tolerance: 0.05) |
| Subjective | `subjective` | Free-text answer, optional character limit |
| Matrix Match | `matrix-match` | Grid of checkboxes (rows A-J, columns P-Z), supports partial marking |
| Matrix Rating | `matrix-rating` | Rating scale - radio buttons per row against option columns |
| Matrix Numerical | `matrix-numerical` | Numerical input per row (0-100) |
| Matrix Subjective | `matrix-subjective` | Text input per row |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vue 3 (Composition API) |
| Language | TypeScript |
| State Management | Vuex 4 |
| Routing | Vue Router 4 |
| HTTP Client | Axios |
| CSS | Tailwind CSS 3 (preflight disabled) |
| i18n | vue-i18n 9 (English + Hindi) |
| Math Rendering | MathJax 3 (loaded via CDN in index.html) |
| Toasts | vue-toastification |
| Build Tool | Vue CLI 5 (Webpack) |
| Unit Tests | Jest + @vue/test-utils |
| E2E Tests | Cypress 9 |
| Code Quality | ESLint + pre-commit hooks |
| Deployment | AWS S3 (static site hosting) via GitHub Actions |

### Key Dependencies

- `canvas-confetti` - Confetti animation on scorecard
- `dom-to-image` - Captures scorecard as image for sharing
- `deep-eql` - Deep equality checks for answer comparison
- `lodash.clonedeep` - Deep cloning for state management
- `uuid` - Generating unique IDs
- `vue3-click-away` - Click-outside detection

---

## Project Structure

```
quiz-frontend/
├── public/
│   └── index.html              # MathJax config, app shell
├── src/
│   ├── main.ts                 # App entry, plugin registration (i18n, toast, router, store)
│   ├── App.vue                 # Root component, just a <router-view>
│   ├── types.ts                # All TypeScript interfaces & enums
│   ├── index.css               # Tailwind imports
│   ├── router/
│   │   └── index.ts            # Route definitions + auth guard
│   ├── store/
│   │   └── index.ts            # Vuex store (spinner, bucketing, locale)
│   ├── services/
│   │   ├── API/
│   │   │   ├── RootClient.ts   # Axios client factory (default + ECS backend)
│   │   │   ├── Endpoints.ts    # API endpoint constants
│   │   │   ├── Quiz.ts         # Quiz API (getQuiz)
│   │   │   ├── Form.ts         # Form API (getForm)
│   │   │   ├── Session.ts      # Session API (create, update, answer management)
│   │   │   ├── Question.ts     # Question API (paginated fetch)
│   │   │   ├── Organization.ts # Auth token verification
│   │   │   └── ErrorHandling.ts# Global error handler (404 redirect)
│   │   └── Functional/
│   │       └── Utilities.ts    # Answer evaluation, confetti, bucketing, screen helpers
│   ├── views/
│   │   ├── Player.vue          # Main quiz player (orchestrator component, ~1260 lines)
│   │   └── Error.vue           # Error pages (404, 403, quiz-not-available, form-not-available)
│   ├── components/
│   │   ├── Splash.vue          # Pre-quiz splash screen with metadata
│   │   ├── InstructionPage.vue # Test paper overview + instructions (assessment only)
│   │   ├── LocalePicker.vue    # English/Hindi language toggle
│   │   ├── LandingPage.vue     # Simple landing page at root URL
│   │   ├── Scorecard.vue       # Post-quiz results with progress bar, metrics, sharing
│   │   ├── Questions/
│   │   │   ├── QuestionModal.vue    # Standard one-at-a-time question display
│   │   │   ├── Body.vue            # Question body: text, image, options, all input types
│   │   │   ├── Header.vue          # Assessment header: timer, palette toggle, end test
│   │   │   ├── Footer.vue          # Navigation buttons: submit, clear, mark-for-review, save & next
│   │   │   └── Palette/
│   │   │       ├── QuestionPalette.vue  # Question navigator sidebar
│   │   │       ├── Item.vue             # Individual palette item (question number circle)
│   │   │       ├── Success.vue          # Green state indicator
│   │   │       ├── Error.vue            # Red state indicator
│   │   │       ├── Neutral.vue          # Gray state indicator
│   │   │       ├── PartialSuccess.vue   # Partial correct indicator
│   │   │       ├── Review.vue           # Purple review indicator
│   │   │       ├── KeyTemplate.vue      # Palette legend template
│   │   │       └── Utils.ts            # Palette utilities
│   │   ├── SinglePage/
│   │   │   ├── SinglePageModal.vue  # All-questions-on-one-page mode (OMR + single page)
│   │   │   └── SinglePageItem.vue   # Individual question in single-page mode
│   │   └── UI/
│   │       ├── Buttons/
│   │       │   └── IconButton.vue   # Reusable button with icon + title
│   │       ├── Icons/
│   │       │   ├── BaseIcon.vue     # Icon dispatcher (maps name to SVG component)
│   │       │   ├── Correct.vue, Wrong.vue, Skip.vue, etc.  # SVG icon components
│   │       ├── Progress/
│   │       │   └── CircularProgress.vue  # Animated circular progress bar
│   │       └── Text/
│   │           ├── InputText.vue    # Text input with validation
│   │           └── Textarea.vue     # Auto-resizing textarea
│   ├── locales/
│   │   ├── englishTranslationData.json
│   │   └── hindiTranslationData.json
│   ├── assets/
│   │   ├── fonts/               # Kruti Dev font for Hindi
│   │   └── json/                # Region/state/JNV mapping data
│   └── directives/
│       └── lazyLoadImages.ts    # Image lazy loading directive
├── tests/
│   └── unit/
│       ├── views/Player.spec.ts
│       └── components/          # Unit tests mirroring src/components structure
├── .github/
│   └── workflows/
│       ├── ci.yml               # Pre-commit, unit tests, e2e tests (Chrome + Firefox)
│       ├── deploy_to_s3_staging.yml   # Staging deploy on push to main
│       └── deploy_to_s3_prod.yml      # Production deploy on push to release
├── CLAUDE.md                    # Instructions for AI coding agents
├── context_for_ai/
│   └── project-context.md       # This file
├── docs/
│   └── ENV.md                   # Environment variable documentation
├── .env.example                 # Template env file
├── package.json
├── vue.config.js                # Webpack config (prefetch disabled, parallel off)
├── tailwind.config.js           # Custom theme, breakpoints, preflight disabled
├── jest.config.js
├── tsconfig.json
└── cypress.json
```

---

## Key Files Deep Dive

### `src/views/Player.vue` - The Orchestrator (~1260 lines)

This is the central component that orchestrates the entire quiz flow. It:

- Fetches quiz details and creates/resumes a session on mount
- Manages all reactive state (questions, responses, timers, scores)
- Handles quiz lifecycle: start -> answer questions -> end test -> show scorecard
- Computes question set states for the palette (answered, not visited, correct, wrong)
- Manages question bucketing for performance (lazy-loads question details in batches of 10)
- Calculates scorecard metrics (correct, wrong, skipped, partial, marks scored)
- Supports all quiz types via computed properties (`isQuizAssessment`, `isFormQuiz`, `isOmrMode`)
- Periodically syncs timer and time-spent data with backend (every 20 seconds)
- Handles auto-start via URL query parameter

**Key reactive state in Player.vue:**
```typescript
currentQuestionIndex: number     // -1 = splash, 0..n = questions, n = scorecard
responses: SubmittedResponse[]   // server-synced answer state for each question
questions: Question[]            // all question data
sessionId: string                // current session ID
hasQuizEnded: boolean            // whether quiz has been submitted
timeRemaining: number            // seconds remaining (assessment only)
timeSpentOnQuestion: TimeSpentEntry[]  // per-question time tracking
qsetMetrics: QuestionSetMetric[] // per-question-set scoring metrics
```

### `src/services/API/RootClient.ts` - Dual Backend Support

Creates two Axios instances: one for the default backend (Lambda, `VUE_APP_BACKEND`) and one for the ECS backend (`VUE_APP_BACKEND_ECS`). The `apiClient()` function checks for `?new_backend` in the URL to decide which client to use. This allows A/B testing between backend implementations.

```typescript
export function apiClient(): AxiosInstance {
  return useEcsBackend() ? ecsClient! : defaultClient;
}
```

### `src/services/Functional/Utilities.ts` - Answer Evaluation

The `isQuestionAnswerCorrect()` function is critical - it evaluates whether a student's answer is correct, handling all question types:
- Single choice: exact match
- Multi choice: exact match or partial (subset of correct answers)
- Numerical integer: exact match
- Numerical float: tolerance of 0.05
- Subjective: any non-empty answer is "correct"
- Matrix match: exact match or partial (subset)
- Matrix rating/numerical: exact match
- Matrix subjective: any non-empty response per row

### `src/services/API/Session.ts` - Session Management

Handles all session-related API calls:
- `createSession()` - Creates or resumes a session for user-quiz pair
- `updateSession()` - Sends start/resume/end events with optional metrics payload
- `updateSessionAnswer()` - Updates a single answer at a specific position
- `updateSessionAnswersAtSpecificPositions()` - Bulk updates multiple answers (used in OMR mode)

### `src/types.ts` - Type System

Comprehensive TypeScript definitions including:
- Question types enum, quiz types, test formats
- API request/response interfaces (QuizAPIResponse, SessionAPIResponse, etc.)
- UI state types (paletteItemState, questionSetPalette, etc.)
- Answer types (submittedAnswer, DraftResponse, CorrectAnswerType)

---

## API Endpoints

All calls go through the Axios client from `RootClient.ts`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/quiz/{quizId}` | GET | Fetch quiz with question sets and questions |
| `/form/{formId}` | GET | Fetch form (questionnaire variant) |
| `/sessions/` | POST | Create session for user-quiz pair |
| `/sessions/{sessionId}` | PATCH | Update session (start/resume/end events + metrics) |
| `/session_answers/{sessionId}/{position}` | PATCH | Update individual answer at position |
| `/session_answers/{sessionId}/update-multiple-answers` | PATCH | Bulk update answers |
| `/questions/` | GET | Fetch questions by question_set_id with pagination |
| `/organizations/authenticate/{apiKey}` | GET | Verify API key |

---

## Question Bucketing (Performance Optimization)

For quizzes with many questions, question details are lazy-loaded in "buckets" of 10:

1. On quiz load, only the first bucket of questions per set has full details
2. `createQuestionBuckets()` creates a map tracking which buckets are fetched
3. When navigating to a question whose bucket isn't fetched, `fetchQuestionBucket()` loads it
4. The Vuex store tracks bucket fetch status per question set
5. This is skipped entirely in single-page mode (all questions needed upfront)

---

## State Management (Vuex Store)

The Vuex store is minimal, handling only cross-component concerns:

```typescript
state: {
  isSpinnerShown: boolean           // Global loading spinner
  questionBucketingMaps: QuestionBucketingMap[]  // Bucket fetch status
  bucketSize: 10                    // Questions per bucket
  locale: "en" | "hi"              // Current language
}
```

Most quiz state lives in `Player.vue`'s reactive state, not Vuex.

---

## Routing

| Route | Component | Description |
|-------|-----------|-------------|
| `/quiz/:quizId` | Player.vue | Main quiz player |
| `/form/:quizId` | Player.vue | Form/questionnaire player (same component, different API) |
| `/` | LandingPage.vue | Simple welcome page |
| `/404-not-found` | Error.vue | Not found error |
| `/403-access-denied` | Error.vue | Access denied error |
| `/quiz-not-available` | Error.vue | Quiz not available |
| `/form-not-available` | Error.vue | Form not available |

**Auth guard**: Routes with `requiresAuth: true` must have `userId` and `apiKey` query params, otherwise redirected to 403.

---

## Internationalization (i18n)

- Supports English (`en`) and Hindi (`hi`)
- Translation files: `src/locales/englishTranslationData.json`, `src/locales/hindiTranslationData.json`
- Used primarily on the Instruction Page (assessment instructions, general instructions, answering guidelines)
- Language toggle available via `LocalePicker.vue` component
- Hindi uses the "Kruti Dev" custom font (loaded in `App.vue`)

---

## Styling

- **Tailwind CSS 3** with preflight disabled (to avoid conflicts with CMS-generated question HTML)
- **Custom breakpoints**: `bp-320` (320px), `bp-360` (360px), `bp-420` (420px), `bp-500` (500px), plus standard md/lg/xl/2xl
- **Primary color**: `#F78000` (orange)
- **Google Fonts**: Poppins (splash screen), Londrina Solid
- **Mobile-first design**: Most components have responsive classes targeting small screens first

---

## Development Setup

### Prerequisites
- Node.js (compatible with Vue CLI 5)
- The [quiz-backend](https://github.com/avantifellows/quiz-backend) running locally
- `pre-commit` installed (`pip install pre-commit` or `brew install pre-commit`)

### Getting Started

```bash
# Install dependencies
npm install

# Install pre-commit hooks
pre-commit install

# Copy environment file
cp .env.example .env.local
# Edit .env.local: set VUE_APP_BACKEND=http://127.0.0.1:8001

# Start dev server
npm run serve
# Access at: http://localhost:8080/quiz/{quizId}?userId={userId}&apiKey={apiKey}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VUE_APP_BACKEND` | Default backend API URL | `http://127.0.0.1:8001` |
| `VUE_APP_BACKEND_ECS` | Optional ECS backend URL. When set, `?new_backend=true` query param routes calls here | (empty) |

### Common Commands

```bash
npm run serve              # Dev server with hot reload
npm run build              # Production build
npm run build-staging      # Staging build
npm run test:unit          # Run all unit tests
npm run test:unit -- Header.spec.ts  # Run specific test
npx cypress run            # Run E2E tests
npm run lint               # Check linting
npm run lint:fix           # Fix lint issues
```

---

## Testing

### Unit Tests (Jest)
- Located in `tests/unit/`, mirroring `src/` structure
- Test files follow `*.spec.ts` convention
- Run with `npm run test:unit`
- Coverage reporting via `--coverageProvider=v8`
- Key test files:
  - `Player.spec.ts` - Main quiz flow tests
  - `Body.spec.ts` - Question rendering tests
  - `Header.spec.ts` - Timer and navigation tests
  - `Footer.spec.ts` - Button behavior tests
  - `QuestionModal.spec.ts` - Question modal interaction tests
  - `Scorecard.spec.ts` - Scorecard display tests

### E2E Tests (Cypress)
- Run with `npx cypress run`
- CI runs tests on Chrome (desktop + mobile viewport) and Firefox

---

## Deployment

### Infrastructure
- **Hosting**: AWS S3 static site hosting
- **Region**: `ap-south-1` (Mumbai)
- **Staging bucket**: `question-set-player-staging`
- **Production bucket**: `question-set-player`
- **Backend (ECS)**:
  - Staging: `https://quiz-backend-testing.avantifellows.org`
  - Production: `https://quiz-backend.avantifellows.org`

### CI/CD (GitHub Actions)

| Workflow | Trigger | Environment | Action |
|----------|---------|-------------|--------|
| `ci.yml` | PR + push to main | - | Pre-commit, unit tests, e2e tests |
| `deploy_to_s3_staging.yml` | PR + push to main | Staging | Build + deploy to staging S3 |
| `deploy_to_s3_prod.yml` | Push to `release` branch | Production | Build + deploy to prod S3 |

### Branching Strategy
- `main` - Development branch, auto-deploys to staging
- `release` - Production branch, auto-deploys to production
- Feature branches merge into `main` via PRs

---

## Key Architectural Patterns

### 1. Composition API with Reactive State
All components use Vue 3's Composition API with `reactive()` for state and `computed()` for derived values. The main `Player.vue` component contains the bulk of business logic in its `setup()` function.

### 2. Dual Display Modes
The same `Player.vue` orchestrator conditionally renders either `QuestionModal` (one at a time) or `SinglePageModal` (all at once) based on the quiz type and URL parameters. Both modes share the same underlying response and session management logic.

### 3. Real-time Session Sync
Answers are sent to the backend immediately on submission. A 20-second interval (`timerUpdates`) syncs time-spent data and checks time remaining. This ensures no data loss even if the browser closes unexpectedly.

### 4. Event-Driven Communication
Child components communicate with `Player.vue` via emitted events (`submit-question`, `end-test`, `fetch-question-bucket`, etc.). The parent handles all API calls and state mutations.

### 5. Draft vs. Submitted Answers
The `QuestionModal` maintains separate `draftResponses` (what the user has selected but not saved) and `responses` (what's been sent to the backend). This prevents data loss on API failures - if a submission fails, the response reverts to the previous saved state.

---

## Important Business Logic

### Answer Evaluation (`Utilities.ts`)
- Ungraded questions: any response counts as "answered" but no correct/wrong evaluation
- Multi-choice partial marking: if partial marking rules exist and user's answer is a subset of correct answers, it's "partially correct" with specific marks per number of correct options selected
- Numerical float tolerance: answers within 0.05 of the correct answer are considered correct
- Matrix match: follows same partial marking logic as multi-choice

### Scorecard Metrics Calculation (`Player.vue`)
- Per-question-set metrics: marks scored, attempt rate, accuracy rate
- Global metrics: total correct, wrong, partially correct, skipped, marks scored
- Metrics are sent to the backend in the `end-quiz` event payload

### Session Lifecycle
1. `createSession()` - Returns session with pre-initialized answers array, question order, and quiz-ended status
2. `updateSession(START_QUIZ/RESUME_QUIZ)` - Returns time remaining
3. `updateSessionAnswer()` - Called per question on submit/navigation
4. `updateSession(DUMMY_EVENT)` - Called every 20s to check time and sync data
5. `updateSession(END_QUIZ)` - Sends final metrics, marks quiz as ended

---

## Known Patterns and Conventions

- Question indices throughout the app may be "shuffled" - the backend returns a `question_order` array that maps display position to actual position in the questions array
- The `isSessionAnswerRequestProcessing` flag is used to disable UI buttons during API calls to prevent double-submissions
- Toast notifications (via vue-toastification) are used for all user-facing messages (errors, warnings, info)
- `data-test` attributes are used extensively for Cypress E2E test selectors
- `MathJax.typeset()` is called on mount and update of `Body.vue` to render mathematical expressions in question text
- The "End Test" button requires two clicks in assessment mode - first click shows a summary toast, second click actually submits
