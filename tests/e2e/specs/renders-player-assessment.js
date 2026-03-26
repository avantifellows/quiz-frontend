// https://docs.cypress.io/api/introduction/api.html

const ASSESSMENT_QSET_ID = "62540adb0f748c8e206c1613";
const ASSESSMENT_QSET_NAME = "Question Set 0";
const ASSESSMENT_MAX_ALLOWED = 24;

const buildAssessmentMetrics = ({
  correct = 0,
  wrong = 0,
  partial = 0,
  skipped,
  marks,
  markedForReview = 0,
} = {}) => {
  const answered = correct + wrong + partial;
  const numSkipped =
    skipped != null ? skipped : Math.max(ASSESSMENT_MAX_ALLOWED - answered, 0);
  const totalMarks =
    marks != null ? marks : correct * 4 + wrong * -2 + numSkipped * -1;
  const attemptRate =
    ASSESSMENT_MAX_ALLOWED > 0 ? answered / ASSESSMENT_MAX_ALLOWED : 0;
  const accuracyRate = answered > 0 ? (correct + 0.5 * partial) / answered : 0;
  return {
    qset_metrics: [
      {
        name: ASSESSMENT_QSET_NAME,
        qset_id: ASSESSMENT_QSET_ID,
        marks_scored: totalMarks,
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
    total_marks: totalMarks,
  };
};

describe("Player for Assessment quizzes", () => {
  let sessionMetrics = buildAssessmentMetrics();

  beforeEach(() => {
    // stub the response to /quiz/{quizId}
    cy.intercept("GET", Cypress.env("backend") + "/quiz/*", {
      fixture: "assessment_quiz_without_answers.json",
    });
  });

  describe("New Session", () => {
    beforeEach(() => {
      // stub the response to /sessions
      cy.intercept("POST", "/sessions/", {
        fixture: "new_session.json",
      });

      cy.intercept("PATCH", "/session_answers/**", { status: 200 }).as(
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
      cy.visit("/quiz/abcd?userId=1&apiKey=pqr");

      // define aliasas
      cy.get('[data-test="startQuiz"]').as("startQuizButton");
    });

    it("shows splash screen", () => {
      cy.get('[data-test="metadata-title"]').should(
        "have.text",
        "cypress assessment 1 by Avanti Fellows"
      );
    });

    describe("Quiz Started", () => {
      beforeEach(() => {
        cy.get("@startQuizButton").trigger("click");
      });

      it("disables clear and save & next buttons", () => {
        cy.get('[data-test="modal"]')
          .get('[data-test="clearButton"]')
          .should("be.disabled");
        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .should("be.disabled");
      });

      describe("Answer selected", () => {
        beforeEach(() => {
          // question 1
          cy.get('[data-test="modal"]')
            .get('[data-test="optionSelector-0"]')
            .trigger("click");
        });

        it("enables clear and save & next buttons", () => {
          cy.get('[data-test="modal"]')
            .get('[data-test="clearButton"]')
            .should("not.be.disabled");
          cy.get('[data-test="modal"]')
            .get('[data-test="saveAndNextButton"]')
            .should("not.be.disabled");
        });

        it("clears the answer upon clicking Clear", () => {
          // option 1 should be selected
          cy.get('[data-test="modal"]')
            .get('[data-test="optionSelector-0"]')
            .should("be.checked");

          cy.get('[data-test="modal"]')
            .get('[data-test="clearButton"]')
            .trigger("click");

          // option 1 should no longer be selected
          cy.get('[data-test="modal"]')
            .get('[data-test="optionSelector-0"]')
            .should("not.be.checked");
        });

        it("submits the answer upon clicking Save & Next", () => {
          cy.get('[data-test="modal"]')
            .get('[data-test="saveAndNextButton"]')
            .trigger("click");

          // move back to the previous question
          cy.get('[data-test="modal"]')
            .get('[data-test="question-index-type"]')
            .should("have.text", "Q.2 | Multiple Answer");
          cy.get('[data-test="modal"]')
            .get('[data-test="previousQuestionButton"]')
            .trigger("click");

          // only option 1 should be checked
          cy.get('[data-test="modal"]')
            .get('[data-test="optionSelector-0"]')
            .should("be.checked");
          cy.get('[data-test="modal"]')
            .get('[data-test="optionSelector-1"]')
            .should("not.be.checked");

          // no option should have a gray background
          cy.get('[data-test="modal"]')
            .get('[data-test="optionContainer-0"]')
            .should("not.have.class", "bg-gray-200");
          cy.get('[data-test="modal"]')
            .get('[data-test="optionContainer-1"]')
            .should("not.have.class", "bg-gray-200");
        });

        it("only moves to the next question without submitting the answer upon clicking Next", () => {
          cy.get('[data-test="modal"]')
            .get('[data-test="nextQuestionButton"]')
            .trigger("click");

          // move back to the previous question
          cy.get('[data-test="modal"]')
            .get('[data-test="previousQuestionButton"]')
            .trigger("click");

          // only option 1 should be checked
          cy.get('[data-test="modal"]')
            .get('[data-test="optionSelector-0"]')
            .should("be.checked");
          cy.get('[data-test="modal"]')
            .get('[data-test="optionSelector-1"]')
            .should("not.be.checked");

          // no option should have a gray background
          cy.get('[data-test="modal"]')
            .get('[data-test="optionContainer-0"]')
            .should("not.have.class", "bg-gray-200");
          cy.get('[data-test="modal"]')
            .get('[data-test="optionContainer-1"]')
            .should("not.have.class", "bg-gray-200");
        });
      });

      it("shows number of skipped questions in the scorecard too", () => {
        sessionMetrics = buildAssessmentMetrics({
          correct: 1,
          wrong: 2,
          skipped: 21,
        });

        // question 1
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .trigger("click");
        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");

        // question 2
        cy.get('[data-test="modal"]')
          .get('[data-test="question-index-type"]')
          .should("have.text", "Q.2 | Multiple Answer");
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .trigger("click");
        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");

        // question 3
        cy.get('[data-test="modal"]')
          .get('[data-test="question-index-type"]')
          .should("have.text", "Q.3 | Multiple Answer");
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .trigger("click");
        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");

        // question 4 -- typed but not submitted!
        cy.get('[data-test="modal"]')
          .get('[data-test="question-index-type"]')
          .should("have.text", "Q.4 | Numerical Integer");
        cy.get('[data-test="modal"]')
          .get('[data-test="numericalAnswer"]')
          .type("3");

        // question 5 - skipped; end test
        cy.get('[data-test="modal"]')
          .get('[data-test="endTestButton"]')
          .trigger("click");

        // additional click to protect endTest button
        cy.get('[data-test="modal"]')
          .get('[data-test="endTestButton"]')
          .trigger("click");

        // number of skipped questions shown in scorecard
        cy.get('[data-test="scorecard"]')
          .get('[data-test="metricValue-2"]')
          .should("have.text", 21); // 24 - 3 = 21
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

        it("moves to question when clicking on item on question palette", () => {
          // index for the item corresponding to question 1 should be highlighted
          cy.get('[data-test="questionPalette"]')
            .get('[data-test="paletteItem-0"]')
            .get('[data-test="index"]')
            .should("have.class", "bg-yellow-200");

          cy.get('[data-test="paletteItem-2"]')
            .get('[data-test="index"]')
            .should("have.class", "bg-gray-200");

          // click the 3rd item in the question palette
          cy.get('[data-test="paletteItem-2"]').trigger("click");

          // question palette must be closed
          cy.get('[data-test="questionPalette"]').should("not.exist");

          // open the question palette
          cy.get('[data-test="togglePaletteButton"]').trigger("click");

          // index for the item corresponding to question 3 should be highlighted
          cy.get('[data-test="paletteItem-0"]')
            .get('[data-test="index"]')
            .should("have.class", "bg-gray-200");

          cy.get('[data-test="paletteItem-2"]')
            .get('[data-test="index"]')
            .should("have.class", "bg-yellow-200");

          // check if question_set subset pattern is working well
          cy.intercept("GET", "/questions/*", {
            fixture: "question_bucket_fetched_without_answers.json",
          }).as("question_bucket_call");

          // click the last question present in the question palette
          cy.get('[data-test="paletteItem-22"]').trigger("click");

          // question palette must be closed
          cy.get('[data-test="questionPalette"]').should("not.exist");

          cy.wait("@question_bucket_call");

          // open the question palette
          cy.get('[data-test="togglePaletteButton"]').trigger("click");

          // index for the item corresponding to the last question should be highlighted
          cy.get('[data-test="paletteItem-22"]')
            .get('[data-test="index"]')
            .should("have.class", "bg-gray-200");
        });
      });

      describe("Checking correctness of question header description", () => {
        beforeEach(() => {
          cy.get('[data-test="togglePaletteButton"]').trigger("click");
        });
        // Item-3 is numerical int question
        it("check if question index type & question subject section is displayed correctly", () => {
          cy.get('[data-test="paletteItem-3"]').trigger("click");
          cy.get('[data-test="question-index-type"]').should(
            "have.text",
            "Q.4 | Numerical Integer" // Q.{Question Number} | {Question Type}}
          );
          cy.get('[data-test="question-subject-section"]').should(
            "have.text",
            "Question Set 0" // {Question Set Title}
          );
        });

        it("check if matrix match question header is displayed correctly", () => {
          cy.get('[data-test="paletteItem-8"]').trigger("click");
          cy.get('[data-test="question-index-type"]').should(
            "have.text",
            "Q.9 | Matrix Matching" // Q.{Question Number} | {Question Type}}
          );
        });
      });

      describe("Checking correctness of numerical integer inputs", () => {
        beforeEach(() => {
          cy.get('[data-test="togglePaletteButton"]').trigger("click");
          cy.get('[data-test="paletteItem-3"]').trigger("click");
        });
        it("number with more than 10 digit in integral part will be truncated", () => {
          cy.get('[data-test="modal"]')
            .get('[data-test="numericalAnswer"]')
            .type("1".repeat(11));
          cy.get('textarea[data-test="input"]').should(
            "have.value",
            "1".repeat(10)
          );
        });

        it("characters other than digits should not be considered", () => {
          cy.get('[data-test="modal"]')
            .get('[data-test="numericalAnswer"]')
            .type("1aa23");
          cy.get('textarea[data-test="input"]').should("have.value", "123");
        });

        it("decimal points should not be considered since this is numerical integer type", () => {
          cy.get('[data-test="modal"]')
            .get('[data-test="numericalAnswer"]')
            .type("12.3");
          cy.get('textarea[data-test="input"]').should("have.value", "123");
        });
      });

      describe("Checking correctness of numerical float inputs", () => {
        beforeEach(() => {
          cy.get('[data-test="togglePaletteButton"]').trigger("click");
          cy.get('[data-test="paletteItem-4"]').trigger("click");
        });
        it("floating numbers with more than 10 characters should be truncated", () => {
          cy.get('[data-test="modal"]')
            .get('[data-test="numericalAnswer"]')
            .type("1.0123456789012");
          cy.get('textarea[data-test="input"]').should(
            "have.value",
            "1.01234567"
          );
        });

        it("characters other than digits and decimal point should not be considered", () => {
          cy.get('[data-test="modal"]')
            .get('[data-test="numericalAnswer"]')
            .type("1aa23.234");
          cy.get('textarea[data-test="input"]').should("have.value", "123.234");
        });

        it("only one decimal point should be allowed", () => {
          cy.get('[data-test="modal"]')
            .get('[data-test="numericalAnswer"]')
            .type("12.3......234");
          cy.get('textarea[data-test="input"]').should("have.value", "12.3234");
        });

        it("first character as decimal point is not considered", () => {
          cy.get('[data-test="modal"]')
            .get('[data-test="numericalAnswer"]')
            .type(".1");
          cy.get('textarea[data-test="input"]').should("have.value", "1");
        });
      });

      describe("Checking matrix matching answers", () => {
        beforeEach(() => {
          cy.get('[data-test="togglePaletteButton"]').trigger("click");
          cy.get('[data-test="paletteItem-8"]').trigger("click");
          // answer is ["AP", "BR", "CS"]
        });

        it("selecting correct matches should fetch points", () => {
          sessionMetrics = buildAssessmentMetrics({
            correct: 1,
            skipped: 23,
          });

          cy.get('[data-test="modal"]')
            .get('[data-test="matrixMatchSelector-0-0"]') // AP
            .trigger("click");

          cy.get('[data-test="modal"]')
            .get('[data-test="matrixMatchSelector-1-2"]') // BR
            .trigger("click");

          cy.get('[data-test="modal"]')
            .get('[data-test="matrixMatchSelector-2-3"]') // CS
            .trigger("click");

          cy.get('[data-test="modal"]')
            .get('[data-test="saveAndNextButton"]')
            .trigger("click"); // save answer

          cy.get('[data-test="modal"]')
            .get('[data-test="endTestButton"]')
            .trigger("click");

          // additional click to protect endTest button
          cy.get('[data-test="modal"]')
            .get('[data-test="endTestButton"]')
            .trigger("click");

          cy.get('[data-test="scorecard"]')
            .get('[data-test="metricValue-0"]')
            .should("have.text", 1); // one correct answer
        });
      });
    });
  });

  describe("Resume Session", () => {
    beforeEach(() => {
      // stub the response to /sessions
      cy.intercept("POST", "/sessions/", {
        fixture: "resume_session.json",
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
      cy.visit("/quiz/abcd?userId=1&apiKey=pqr");

      // define aliasas
      cy.get('[data-test="startQuiz"]').as("startQuizButton");
    });

    describe("updating answers of questions", () => {
      beforeEach(() => {
        cy.get("@startQuizButton").trigger("click");
        cy.get('[data-test="modal"]').as("modal");
      });

      it("clears submitted answer upon clicking clear + save & next", () => {
        // only option 1 should be checked
        cy.get("@modal")
          .get('[data-test="optionSelector-0"]')
          .should("be.checked");
        cy.get("@modal")
          .get('[data-test="optionSelector-1"]')
          .should("not.be.checked");

        // no option should have a gray background
        cy.get("@modal")
          .get('[data-test="optionContainer-0"]')
          .should("not.have.class", "bg-gray-200");
        cy.get("@modal")
          .get('[data-test="optionContainer-1"]')
          .should("not.have.class", "bg-gray-200");

        cy.get('[data-test="modal"]')
          .get('[data-test="clearButton"]')
          .trigger("click");
        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");

        // move back to the previous question
        cy.get('[data-test="modal"]')
          .get('[data-test="question-index-type"]')
          .should("have.text", "Q.2 | Multiple Answer");
        cy.get('[data-test="modal"]')
          .get('[data-test="previousQuestionButton"]')
          .trigger("click");

        // option 1 should no longer be checked
        cy.get("@modal")
          .get('[data-test="optionContainer-0"]')
          .should("not.be.checked");
      });

      it("updates submitted answer upon selecting new answer + clicking save & next", () => {
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-1"]')
          .trigger("click");

        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");

        // move back to the previous question
        cy.get('[data-test="modal"]')
          .get('[data-test="question-index-type"]')
          .should("have.text", "Q.2 | Multiple Answer");
        cy.get('[data-test="modal"]')
          .get('[data-test="previousQuestionButton"]')
          .trigger("click");
        cy.get("@modal")
          .get('[data-test="optionSelector-1"]')
          .should("be.checked");

        // neither option 1 nor option 2 should have gray background
        cy.get("@modal")
          .get('[data-test="optionContainer-0"]')
          .should("not.have.class", "bg-gray-200");
        cy.get("@modal")
          .get('[data-test="optionContainer-1"]')
          .should("not.have.class", "bg-gray-200");
      });

      it("does not update submitted answer upon selecting new answer, but not clicking save & bext", () => {
        // change option, click next without saving
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-1"]')
          .trigger("click");
        cy.get('[data-test="modal"]')
          .get('[data-test="nextQuestionButton"]')
          .trigger("click");

        // go back to previous question
        cy.get('[data-test="modal"]')
          .get('[data-test="previousQuestionButton"]')
          .trigger("click");

        // previous submitted option1 should only be checked
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .should("be.checked");
      });
    });
  });
});
