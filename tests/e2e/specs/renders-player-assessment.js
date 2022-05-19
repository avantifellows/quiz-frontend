// https://docs.cypress.io/api/introduction/api.html

describe("Player for Assessment quizzes", () => {
  beforeEach(() => {
    // stub the response to /quiz/{quizId}
    cy.intercept("GET", Cypress.env("backend") + "/quiz/*", {
      fixture: "assessment_quiz.json",
    });
  });

  describe("New Session", () => {
    beforeEach(() => {
      // stub the response to /sessions
      cy.intercept("POST", "/sessions/", {
        fixture: "new_session.json",
      });

      cy.intercept("PATCH", "/session_answers/*", {});
      cy.intercept("PATCH", "/sessions/*", {});

      cy.visit("/quiz/abcd?userId=1");

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
            .get('[data-test="previousQuestionButton"]')
            .trigger("click");

          // only option 1 should be checked
          cy.get('[data-test="modal"]')
            .get('[data-test="optionSelector-0"]')
            .should("be.checked");
          cy.get('[data-test="modal"]')
            .get('[data-test="optionSelector-1"]')
            .should("not.be.checked");

          // only option 1 should have a gray background
          cy.get('[data-test="modal"]')
            .get('[data-test="optionContainer-0"]')
            .should("have.class", "bg-gray-200");
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
        // question 1
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .trigger("click");
        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");

        // question 2
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .trigger("click");
        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");

        // question 3
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .trigger("click");

        // end test
        cy.get('[data-test="modal"]')
          .get('[data-test="endTestButton"]')
          .trigger("click");

        cy.get('[data-test="scorecard"]')
          .get('[data-test="metricValue-2"]')
          .should("have.text", 1);
      });

      describe("End test", () => {
        beforeEach(() => {
          cy.get('[data-test="modal"]')
            .get('[data-test="endTestButton"]')
            .trigger("click");
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

        it("moves to question when clicking on item on question palette", () => {
          // index for the item corresponding to question 1 should be highlighted
          cy.get('[data-test="questionPalette"]')
            .get('[data-test="paletteItem-0"]')
            .get('[data-test="index"]')
            .should("have.class", "bg-yellow-200");

          cy.get('[data-test="paletteItem-2"]')
            .get('[data-test="index"]')
            .should("have.class", "bg-gray-200");

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

      cy.intercept("PATCH", "/session_answers/*", {});

      cy.visit("/quiz/abcd?userId=1");

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

        // only option 1 should be marked selected
        cy.get("@modal")
          .get('[data-test="optionContainer-0"]')
          .should("have.class", "bg-gray-200");
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
          .get('[data-test="previousQuestionButton"]')
          .trigger("click");

        // option 1 should no longer be marked selected
        cy.get("@modal")
          .get('[data-test="optionContainer-0"]')
          .should("not.have.class", "bg-gray-200");
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
          .get('[data-test="previousQuestionButton"]')
          .trigger("click");

        // option 1 should no longer be checked, option 2 should be checked
        cy.get("@modal")
          .get('[data-test="optionSelector-0"]')
          .should("not.be.checked");
        cy.get("@modal")
          .get('[data-test="optionSelector-1"]')
          .should("be.checked");

        // option 1 should no longer be marked selected, option 2 should be
        cy.get("@modal")
          .get('[data-test="optionContainer-0"]')
          .should("not.have.class", "bg-gray-200");
        cy.get("@modal")
          .get('[data-test="optionContainer-1"]')
          .should("have.class", "bg-gray-200");
      });
    });
  });
});
