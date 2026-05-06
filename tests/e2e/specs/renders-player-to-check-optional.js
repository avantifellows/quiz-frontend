const OPTIONAL_QSET_METRICS = [
  { id: "62540adb0f748c8e206c1613", name: "Question Set 0", maxAllowed: 12 },
  { id: "6285554a1016dc7050373fbf", name: "Question Set 1", maxAllowed: 3 },
];

const buildOptionalMetrics = ({
  qset0Answered = 0,
  qset1Answered = 0,
  correct = 0,
  wrong = 0,
  partial = 0,
  marks = 0,
  markedForReview = 0,
} = {}) => {
  const qset0Skipped = Math.max(
    OPTIONAL_QSET_METRICS[0].maxAllowed - qset0Answered,
    0
  );
  const qset1Skipped = Math.max(
    OPTIONAL_QSET_METRICS[1].maxAllowed - qset1Answered,
    0
  );
  const totalAnswered = correct + wrong + partial;
  const totalSkipped = qset0Skipped + qset1Skipped;
  return {
    qset_metrics: [
      {
        name: OPTIONAL_QSET_METRICS[0].name,
        qset_id: OPTIONAL_QSET_METRICS[0].id,
        marks_scored: 0,
        num_answered: qset0Answered,
        num_skipped: qset0Skipped,
        num_correct: 0,
        num_wrong: 0,
        num_partially_correct: 0,
        num_marked_for_review: 0,
        attempt_rate:
          OPTIONAL_QSET_METRICS[0].maxAllowed > 0
            ? qset0Answered / OPTIONAL_QSET_METRICS[0].maxAllowed
            : 0,
        accuracy_rate: 0,
      },
      {
        name: OPTIONAL_QSET_METRICS[1].name,
        qset_id: OPTIONAL_QSET_METRICS[1].id,
        marks_scored: 0,
        num_answered: qset1Answered,
        num_skipped: qset1Skipped,
        num_correct: correct,
        num_wrong: wrong,
        num_partially_correct: partial,
        num_marked_for_review: markedForReview,
        attempt_rate:
          OPTIONAL_QSET_METRICS[1].maxAllowed > 0
            ? qset1Answered / OPTIONAL_QSET_METRICS[1].maxAllowed
            : 0,
        accuracy_rate:
          totalAnswered > 0 ? (correct + 0.5 * partial) / totalAnswered : 0,
      },
    ],
    total_answered: totalAnswered,
    total_skipped: totalSkipped,
    total_correct: correct,
    total_wrong: wrong,
    total_partially_correct: partial,
    total_marked_for_review: markedForReview,
    total_marks: marks,
  };
};

describe("Player for Assessment quizzes", () => {
  let sessionMetrics = buildOptionalMetrics();

  beforeEach(() => {
    // stub the response to /quiz/{quizId}
    cy.intercept("GET", Cypress.env("backend") + "/quiz/*", {
      fixture: "multi_qset_quiz_without_answers.json", // 2 question sets -- each has 12 questions
      // in set 1 -- all questions can be answered
      // in set 2 -- only upto 3 questions can be answered
    });
  });

  describe("New Session", () => {
    beforeEach(() => {
      // stub the response to /sessions
      cy.intercept("POST", "/sessions/", {
        fixture: "new_session_for_multiset_quiz.json", // 24 session answers
        // of which 3 are answered (first 3 questions in 2nd qset)
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

    describe("Quiz Started", () => {
      beforeEach(() => {
        cy.get("@startQuizButton").trigger("click");
        // jump to question index 12
        cy.get('[data-test="togglePaletteButton"]').trigger("click");
        cy.get('[data-test="paletteItem-12"]').trigger("click");

        // question 12
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .trigger("click");
        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");

        // question 13
        cy.get('[data-test="modal"]')
          .get('[data-test="question-index-type')
          .should("have.text", "Q.14 | Multiple Answer");
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .trigger("click");
        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");

        // question 14
        cy.get('[data-test="modal"]')
          .get('[data-test="question-index-type')
          .should("have.text", "Q.15 | Multiple Answer");
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .trigger("click");
        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");
      });

      it("cannot select answer for question once optional limit reached", () => {
        cy.get('[data-test="modal"]')
          .get('[data-test="question-index-type')
          .should("have.text", "Q.16 | Numerical");
        cy.get('[data-test="togglePaletteButton"]').trigger("click");
        cy.get('[data-test="paletteItem-15"]').trigger("click");

        cy.get('[data-test="modal"]')
          .get('[data-test="input"]')
          .should("be.disabled");
      });

      it("clear answer for already-answered question to attempt different question in optional set", () => {
        // pick 3rd question in 2nd qset
        cy.get('[data-test="modal"]')
          .get('[data-test="question-index-type')
          .should("have.text", "Q.16 | Numerical");
        cy.get('[data-test="togglePaletteButton"]').trigger("click");
        cy.get('[data-test="paletteItem-14"]').trigger("click");

        // clear the answer and save
        cy.get('[data-test="modal"]')
          .get('[data-test="clearButton"]')
          .trigger("click");

        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");

        // now go to 4th question in 2nd qset
        cy.get('[data-test="modal"]')
          .get('[data-test="question-index-type')
          .should("have.text", "Q.16 | Numerical");
        cy.get('[data-test="togglePaletteButton"]').trigger("click");
        cy.get('[data-test="paletteItem-15"]').trigger("click");

        // option can be selected now!
        cy.get('[data-test="modal"]')
          .get('[data-test="input"]')
          .should("not.be.disabled");

        cy.get('[data-test="modal"]')
          .get('[data-test="numericalAnswer"]')
          .type(".1");

        // can submit the answer!
        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");
      });

      it("question palette shows title and instruction for 2nd qset", () => {
        cy.get('[data-test="togglePaletteButton"]').trigger("click");

        cy.get('[data-test="paletteTitle-1"').should("exist");
        cy.get('[data-test="paletteTitle-1"').should(
          "have.text",
          "Question Set 1"
        );

        cy.get('[data-test="paletteInstruction-1"').should("exist");
        cy.get('[data-test="paletteInstruction-1"').should(
          "have.text",
          "Question Set 1 DescriptionYou may attempt only up to 3 questions in this section."
        );
      });

      it("check if scorecard eventually becomes visible", () => {
        sessionMetrics = buildOptionalMetrics({
          qset0Answered: 0,
          qset1Answered: 3,
          correct: 3,
          marks: 0,
        });

        // Remove or hide any toast notifications
        cy.get(".Vue-Toastification__toast-body").should("not.exist");

        // Interact with the endTestButton
        cy.get('[data-test="modal"]')
          .find('[data-test="endTestButton"]')
          .click();

        // Additional check to ensure the button click was successful
        cy.get('[data-test="modal"]')
          .find('[data-test="endTestButton"]')
          .click();

        // Wait for the scorecard to become visible
        cy.get('[data-test="scorecard"]').should("be.visible");

        // Verify the text of the metricValue-2
        cy.get('[data-test="scorecard"]')
          .find('[data-test="metricValue-2"]')
          .should("have.text", "12"); // Ensure the text is a string
      });
    });
  });
});
