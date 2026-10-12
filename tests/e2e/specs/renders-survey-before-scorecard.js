// E2E for the "survey before scorecard" flow:
// When an assessment is wired to a post-test survey (metadata.next_step_url) that the student
// hasn't submitted yet, ending the test redirects into the survey instead of showing the
// scorecard. Once the survey is submitted (or there is none), the scorecard shows as usual.
// The survey then returns to the test with ?landing=scorecard, which opens straight on the
// scorecard without the splash underneath.
//
// Homework / form / plain assessment flows are covered by the other specs; this one exercises
// only the new gate + landing behaviour for the most typical case (a single-choice assessment).

const SURVEY_QUIZ_ID = "survey123"; // matches the next_step_url in assessment_quiz_with_survey.json

const ASSESSMENT_METRICS = {
  qset_metrics: [
    {
      name: "Question Set 0",
      qset_id: "62540adb0f748c8e206c1613",
      marks_scored: 0,
      num_answered: 0,
      num_skipped: 1,
      num_correct: 0,
      num_wrong: 0,
      num_partially_correct: 0,
      num_marked_for_review: 0,
      attempt_rate: 0,
      accuracy_rate: 0,
    },
  ],
  total_answered: 0,
  total_skipped: 1,
  total_correct: 0,
  total_wrong: 0,
  total_partially_correct: 0,
  total_marked_for_review: 0,
  total_marks: 0,
};

// The test quiz, a fresh (not-yet-ended) session, and end-quiz returning metrics. The gate's
// quiz-attempts check is stubbed per-test with whether the survey is already done.
function stubTestQuiz({ quizAttempts }) {
  // API calls go to the backend host (Cypress.env("backend")); the page visit is on baseUrl, so
  // these backend-scoped intercepts don't swallow the HTML app load.
  const backend = Cypress.env("backend");
  cy.intercept("GET", backend + "/quiz/*", {
    fixture: "assessment_quiz_with_survey.json",
  });
  cy.intercept("POST", "/sessions/", { fixture: "new_session.json" });
  cy.intercept("PATCH", "/session_answers/**", { body: {} });
  cy.intercept("PATCH", "/sessions/*", (req) => {
    if (req.body && req.body.event === "end-quiz") {
      req.reply({ body: { time_remaining: 100, metrics: ASSESSMENT_METRICS } });
    } else {
      req.reply({ body: { time_remaining: 100 } });
    }
  });
  cy.intercept("GET", backend + "/organizations/authenticate/*", {
    fixture: "org_authentication.json",
  });
  cy.intercept("GET", "**/sessions/user/*/quiz-attempts", {
    body: quizAttempts,
  }).as("quizAttempts");
  // The survey the gate redirects into: stub its form API load so the redirected page renders.
  cy.intercept("GET", backend + "/form/*", {
    fixture: "form_questionnaire.json",
  });
}

function startAndEndTest() {
  cy.get('[data-test="startQuiz"]').trigger("click");
  cy.get('[data-test="endTestButton"]').trigger("click");
  cy.get('[data-test="endTestButton"]').trigger("click"); // 2nd click = final submission
}

describe("Survey before scorecard", () => {
  // The survey redirect can trigger a follow-up request that 404s against the stubs; that is not
  // what these tests assert, so don't let it fail the test.
  beforeEach(() => {
    cy.on("uncaught:exception", () => false);
  });

  context("survey not yet submitted", () => {
    beforeEach(() => {
      stubTestQuiz({ quizAttempts: {} });
      cy.visit("/quiz/abcd?userId=test_student&apiKey=pqr");
    });

    it("redirects into the survey instead of showing the scorecard", () => {
      startAndEndTest();

      cy.wait("@quizAttempts");

      // the browser should navigate to the survey form, carrying apiKey and no leftover
      // {userId} template (which would 403 a portal student)
      cy.location("pathname").should("eq", "/form/" + SURVEY_QUIZ_ID);
      cy.location("search").should("contain", "apiKey=pqr");
      cy.location("search").should("not.contain", "{userId}");
      // the test injects its own id as return_to so the shared survey knows where to come back to
      cy.location("search").should("contain", "return_to=abcd");
      cy.location("search").should("not.contain", "{quizId}");
    });
  });

  context("survey already submitted", () => {
    beforeEach(() => {
      stubTestQuiz({ quizAttempts: { [SURVEY_QUIZ_ID]: true } });
      cy.visit("/quiz/abcd?userId=test_student&apiKey=pqr");
    });

    it("shows the scorecard directly and stays on the test", () => {
      startAndEndTest();

      cy.wait("@quizAttempts");

      cy.get('[data-test="scorecard"]').should("exist");
      // no redirect: still on the test
      cy.location("pathname").should("eq", "/quiz/abcd");
    });
  });

  context("returning from the survey with ?landing=scorecard", () => {
    beforeEach(() => {
      const backend = Cypress.env("backend");
      cy.intercept("GET", backend + "/quiz/*", {
        fixture: "assessment_quiz_with_survey.json",
      });
      // createSession returns the already-ended session (with metrics)
      cy.intercept("POST", "/sessions/", {
        fixture: "ended_assessment_session.json",
      });
      cy.intercept("PATCH", "/session_answers/**", { body: {} });
      cy.intercept("PATCH", "/sessions/*", { body: { time_remaining: 100 } });
      cy.intercept("GET", backend + "/organizations/authenticate/*", {
        fixture: "org_authentication.json",
      });
      // the gate must NOT fire on the landing return; stub quiz-attempts to catch a stray call
      cy.intercept("GET", "**/sessions/user/*/quiz-attempts", { body: {} });

      cy.visit("/quiz/abcd?userId=test_student&apiKey=pqr&landing=scorecard");
    });

    it("opens straight on the scorecard with no splash behind it", () => {
      // scorecard shown immediately, without starting the quiz
      cy.get('[data-test="scorecard"]').should("exist");
      // the splash (start button) must not be rendered underneath
      cy.get('[data-test="startQuiz"]').should("not.exist");
    });
  });
});
