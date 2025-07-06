# TODO: Hide Quiz Answers from Frontend

## Problem
Students can access correct answers via browser developer tools through multiple attack vectors:
1. **Network Tab**: API responses contain `correct_answer` fields
2. **Vue DevTools**: Component state includes all question data with answers
3. **JavaScript Console**: Direct access to question objects with answers
4. **Component Inspector**: Props and state visible in browser dev tools

## Key Constraint
**Homework mode provides immediate feedback** on answer correctness and must continue to work without exposing all answers upfront.

---

## Backend Changes (Required)

### 1. Create Secure Quiz API Endpoints
- [ ] **NEW**: `GET /api/quiz/{id}/secure` - Returns quiz data WITHOUT correct answers
- [ ] **NEW**: `POST /api/quiz/{id}/validate-answer` - Server-side answer validation endpoint
- [ ] **MODIFY**: Existing quiz endpoints to optionally exclude answers based on quiz state

### 2. Answer Validation API
- [ ] **NEW**: Create endpoint for real-time answer validation (for homework mode)
  ```
  POST /api/quiz/{quiz_id}/question/{question_id}/validate
  Body: { "answer": [...], "session_id": "..." }
  Response: { "is_correct": true/false, "is_partial": true/false, "solution": "..." }
  ```
- [ ] **SECURITY**: Validate session state and question access permissions
- [ ] **RATE LIMITING**: Prevent answer enumeration attacks

### 3. Session Management Updates
- [ ] **MODIFY**: Session API to track which questions have been answered
- [ ] **MODIFY**: Only allow answer validation for questions that haven't been submitted
- [ ] **MODIFY**: Include answer validation results in session responses

### 4. Quiz State Management
- [ ] **NEW**: Track quiz completion state per user
- [ ] **NEW**: Only include correct answers in API responses after:
  - Quiz is completed AND review is enabled, OR
  - Quiz type is homework AND specific question is answered
- [ ] **MODIFY**: Separate data structures for active vs completed quizzes

---

## Frontend Changes (Required)

### 1. Update Type Definitions (`src/types.ts`)
- [ ] **NEW**: Create `SecureQuestion` interface without `correct_answer` field
- [ ] **NEW**: Create `QuestionValidationResponse` interface
- [ ] **MODIFY**: Update `QuizAPIResponse` to use `SecureQuestion[]` during active quiz
- [ ] **NEW**: Create `CompletedQuestion` interface with answers (for review mode)

### 2. API Service Updates

#### `src/services/API/Quiz.ts`
- [ ] **MODIFY**: `getQuiz()` to use secure endpoint for active quizzes
- [ ] **NEW**: `getQuizForReview()` for completed quizzes with answers
- [ ] **NEW**: `validateAnswer()` method for homework mode feedback

#### `src/services/API/Question.ts`
- [ ] **MODIFY**: `getQuestions()` to exclude answers for active quizzes
- [ ] **NEW**: `getQuestionsForReview()` for completed quizzes

### 3. Component Updates

#### `src/views/Player.vue`
- [ ] **MODIFY**: Replace client-side answer evaluation with server validation
- [ ] **NEW**: Add `validateAnswer()` method for homework mode
- [ ] **MODIFY**: State management to handle validation responses
- [ ] **MODIFY**: Only load complete question data when quiz is completed

#### `src/components/Questions/Body.vue`
- [ ] **MODIFY**: `optionBackgroundClass()` to use validation results instead of `correct_answer`
- [ ] **NEW**: Add loading states for answer validation
- [ ] **MODIFY**: Remove direct access to `correct_answer` prop
- [ ] **NEW**: Handle validation response for styling

#### `src/components/Questions/QuestionModal.vue`
- [ ] **MODIFY**: Submit flow to call validation API for homework mode
- [ ] **NEW**: Handle validation loading state
- [ ] **MODIFY**: Update button states based on validation response

### 4. Utility Function Updates

#### `src/services/Functional/Utilities.ts`
- [ ] **REMOVE**: `isQuestionAnswerCorrect()` function (move to backend)
- [ ] **NEW**: `processValidationResponse()` for handling server responses
- [ ] **NEW**: `formatValidationFeedback()` for UI display

### 5. State Management Updates

#### `src/store/index.ts`
- [ ] **NEW**: Add validation results to store
- [ ] **NEW**: Track loading states for answer validation
- [ ] **MODIFY**: Remove correct answers from question state during active quiz

---

## Implementation Strategy

### Phase 1: Backend Foundation
1. Create secure API endpoints
2. Implement answer validation service
3. Add session state tracking
4. Deploy backend changes

### Phase 2: Frontend Security
1. Update type definitions
2. Modify API service calls
3. Remove client-side answer evaluation
4. Test with assessment mode (no immediate feedback)

### Phase 3: Homework Mode Integration
1. Implement real-time validation calls
2. Update UI feedback mechanisms
3. Add loading states and error handling
4. Test immediate feedback functionality

### Phase 4: Testing & Validation
1. Security testing (verify no answers exposed)
2. Functionality testing (homework vs assessment modes)
3. Performance testing (validation API load)
4. User experience testing

---

## Security Validation Checklist

After implementation, verify:
- [ ] **Network Tab**: No `correct_answer` fields in API responses during active quiz
- [ ] **Vue DevTools**: No correct answers in component state
- [ ] **JavaScript Console**: No accessible answer data
- [ ] **Component Props**: No answer-related props visible
- [ ] **Source Code**: No hardcoded answers in minified JS
- [ ] **localStorage/sessionStorage**: No client-side answer storage
- [ ] **Browser Cache**: No cached responses with answers

---

## Testing Requirements

### Assessment Mode Testing
- [ ] Questions load without answers
- [ ] No immediate feedback during quiz
- [ ] Answers revealed only after completion (if review enabled)
- [ ] No client-side validation

### Homework Mode Testing
- [ ] Questions load without answers
- [ ] Immediate feedback works after submission
- [ ] Validation API called for each submission
- [ ] Correct/incorrect styling applies correctly
- [ ] Solutions displayed after validation
- [ ] Performance acceptable for real-time validation

### Edge Cases
- [ ] Network failures during validation
- [ ] Race conditions with rapid submissions
- [ ] Session timeout during validation
- [ ] Multiple tab/window scenarios
- [ ] Back button navigation

---

## Performance Considerations

### Validation API Optimization
- [ ] **Caching**: Cache validation results to avoid duplicate calls
- [ ] **Debouncing**: Prevent rapid-fire validation requests
- [ ] **Connection Pooling**: Optimize backend API performance
- [ ] **CDN**: Consider edge caching for static quiz data

### Frontend Optimization
- [ ] **Loading States**: Prevent UI blocking during validation
- [ ] **Retry Logic**: Handle temporary network failures
- [ ] **Offline Support**: Graceful degradation when offline

---

## Rollback Plan

If issues arise:
1. **Backend**: Keep existing endpoints active alongside new ones
2. **Frontend**: Feature flag to switch between secure/legacy modes
3. **Database**: Ensure backward compatibility
4. **Monitoring**: Track validation API performance and errors

---

## Timeline Estimate
- **Backend Changes**: 2-3 weeks
- **Frontend Security**: 1-2 weeks  
- **Homework Mode Integration**: 1-2 weeks
- **Testing & Validation**: 1 week
- **Total**: 5-8 weeks

---

## Priority Order
1. **Critical**: Remove answers from network responses
2. **High**: Implement server-side validation
3. **High**: Update frontend to use secure APIs
4. **Medium**: Restore homework mode functionality
5. **Low**: Performance optimizations