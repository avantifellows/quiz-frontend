// https://docs.cypress.io/api/introduction/api.html

const PARTIAL_QSET_ID = "62540adb0f748c8e206c1613";
const PARTIAL_QSET_NAME = "Question Set 0";
const PARTIAL_MAX_ALLOWED = 2;

const buildPartialMetrics = ({
  correct = 0,
  wrong = 0,
  partial = 0,
  skipped,
  marks = 0,
  markedForReview = 0,
} = {}) => {
  const answered = correct + wrong + partial;
  const numSkipped =
    skipped != null ? skipped : Math.max(PARTIAL_MAX_ALLOWED - answered, 0);
  const attemptRate =
    PARTIAL_MAX_ALLOWED > 0 ? answered / PARTIAL_MAX_ALLOWED : 0;
  const accuracyRate = answered > 0 ? (correct + 0.5 * partial) / answered : 0;
  return {
    qset_metrics: [
      {
        name: PARTIAL_QSET_NAME,
        qset_id: PARTIAL_QSET_ID,
        marks_scored: marks,
        num_answered: answered,
        num_skipped: numSkipped,
        num_correct: correct,
        num_wrong: wrong,
        num_partially_correct: partial,
        num_marked_for_review: markedForReview,
        attempt_rate: attemptRate,
        accuracy_rate: accuracyRate,
      },
    ],
    total_answered: answered,
    total_skipped: numSkipped,
    total_correct: correct,
    total_wrong: wrong,
    total_partially_correct: partial,
    total_marked_for_review: markedForReview,
    total_marks: marks,
  };
};

describe("Player for Assessment quizzes with partial marks", () => {
  let sessionMetrics = buildPartialMetrics();

  beforeEach(() => {
    // stub the response to /quiz/{quizId}
    cy.intercept("GET", Cypress.env("backend") + "/quiz/*", {
      fixture: "partial_mark_assessment_quiz_without_answers.json",
    });
  });

  describe("New Session", () => {
    beforeEach(() => {
      // stub the response to /sessions
      cy.intercept("POST", "/sessions/", {
        fixture: "new_partial_mark_session.json",
      });

      cy.intercept("PATCH", "/session_answers/**", { body: {} }).as(
        "patchSessionAnswerRequest"
      );
      cy.intercept("PATCH", "/sessions/*", (req) => {
        if (req.body && req.body.event === "end-quiz") {
          req.reply({ body: { time_remaining: 100, metrics: sessionMetrics } });
        } else {
          req.reply({ body: { time_remaining: 100 } });
        }
      });

      cy.intercept(
        "GET",
        Cypress.env("backend") + "/organizations/authenticate/*",
        {
          fixture: "org_authentication.json",
        }
      );
      cy.visit("/quiz/abcd?userId=test_student&apiKey=pqr");

      // define aliasas
      cy.get('[data-test="startQuiz"]').as("startQuizButton");
    });

    it("shows splash screen", () => {
      cy.get('[data-test="quizType"]').should("have.text", "assessment");
    });

    describe("Quiz Started", () => {
      beforeEach(() => {
        cy.get("@startQuizButton").trigger("click");
      });

      it("shows correct number of partially correct and skipped questions", () => {
        sessionMetrics = buildPartialMetrics({
          partial: 1,
          skipped: 1,
          marks: 0,
        });

        // question 1
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .trigger("click");
        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");

        // question 2 - skipped; end test
        cy.get('[data-test="modal"]')
          .get('[data-test="question-index-type')
          .should("have.text", "Q.2 | Multiple Answer");
        cy.get('[data-test="modal"]')
          .get('[data-test="endTestButton"]')
          .trigger("click");

        // additional click to protect endTest button
        cy.get('[data-test="modal"]')
          .get('[data-test="endTestButton"]')
          .trigger("click");

        // number of skipped questions shown in scorecard
        cy.get('[data-test="scorecard"]')
          .get('[data-test="metricValue-3"]')
          .should("have.text", 1);

        // number of partially correct shown in scorecard
        cy.get('[data-test="scorecard"]')
          .get('[data-test="metricValue-2"]')
          .should("have.text", 1);
      });

      it("should not be partially correct if even a single wrong option is selected", () => {
        sessionMetrics = buildPartialMetrics({
          wrong: 1,
          skipped: 1,
          marks: -3,
        });

        // question 1 - option 2 is wrong (but chosen here)
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-1"]')
          .trigger("click");
        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");

        // end test
        cy.get('[data-test="modal"]')
          .get('[data-test="endTestButton"]')
          .trigger("click");

        // additional click to protect endTest button
        cy.get('[data-test="modal"]')
          .get('[data-test="endTestButton"]')
          .trigger("click");

        // number of wrong questions shown in scorecard
        cy.get('[data-test="scorecard"]')
          .get('[data-test="metricValue-1"]')
          .should("have.text", 1);

        // number of skipped shown in scorecard
        // note that partially correct field won't exist here!
        cy.get('[data-test="scorecard"]')
          .get('[data-test="metricValue-2"]')
          .should("have.text", 1);
      });

      it("partially correct should be awarded partial marks", () => {
        sessionMetrics = buildPartialMetrics({
          partial: 1,
          skipped: 1,
          marks: 0,
        });

        // question 1 - option 1 is correct (and chosen here)
        // actual answer is option 1 and option 3
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .trigger("click");
        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");

        // end test
        cy.get('[data-test="modal"]')
          .get('[data-test="question-index-type')
          .should("have.text", "Q.2 | Multiple Answer");
        cy.get('[data-test="modal"]')
          .get('[data-test="endTestButton"]')
          .trigger("click");

        // additional click to protect endTest button
        cy.get('[data-test="modal"]')
          .get('[data-test="endTestButton"]')
          .trigger("click");

        // number of partially correct shown in scorecard
        cy.get('[data-test="scorecard"]')
          .get('[data-test="metricValue-2"]')
          .should("have.text", 1);

        // partially correct score should be 1 (acc to scheme in fixture)
        // skipped has -1 in this fixture
        // so total score = 0/8
        cy.get('[data-test="scorecard"]')
          .get('[data-test="progress"]')
          .get('[data-test="value"]')
          .should("have.text", "0/8");
      });

      describe("End test", () => {
        beforeEach(() => {
          cy.get('[data-test="modal"]')
            .get('[data-test="endTestButton"]')
            .trigger("click");

          cy.get('[data-test="modal"]')
            .get('[data-test="endTestButton"]')
            .trigger("click"); // additional click to protect endTest button
        });

        it("shows scorecard upon selecting End Test", () => {
          cy.get('[data-test="modal"]').should("not.exist");
          cy.get('[data-test="scorecard"]').should("exist");
        });

        it("Check if the user-id is visible", () => {
          cy.get('[data-test="scorecard-user-id"]').should(
            "have.text",
            " Id: test_student" // Id of the student
          );
        });

        it("shows score instead of accuracy in scorecard", () => {
          const progressBar = cy
            .get('[data-test="scorecard"]')
            .get('[data-test="progress"]');
          progressBar.get('[data-test="value"]').should("contain", "/");
          progressBar.get('[data-test="title"]').should("contain", "Score");
        });
      });

      describe("Question Palette", () => {
        beforeEach(() => {
          cy.get('[data-test="togglePaletteButton"]').trigger("click");
        });
        it("shows question palette upon clicking toggle palette button", () => {
          cy.get('[data-test="questionPalette"]').should("exist");
        });

        it("shows title of question set in palette", () => {
          cy.get('[data-test="paletteTitle-0"').should("exist");
          cy.get('[data-test="paletteTitle-0"').should(
            "have.text",
            "Question Set 0"
          );
        });

        it("shows instruction of question set in palette -- attempt all questions", () => {
          cy.get('[data-test="paletteInstruction-0"').should("exist");
          cy.get('[data-test="paletteInstruction-0"').should(
            "have.text",
            "Question Set 0 DescriptionYou may attempt all questions in this section."
          );
        });
      });
    });
  });
});
