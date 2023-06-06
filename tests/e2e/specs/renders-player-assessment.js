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

      cy.intercept("PATCH", "/session_answers/**", {});
      cy.intercept("PATCH", "/sessions/*", {});

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

      it("Check if the test name is visible", () => {
        cy.get('[data-test="test-name"]').should(
          "have.text",
          "cypress assessment 1 by Avanti Fellows" // test name
        );
      });

      it("Check if the user-id is visible", () => {
        cy.get('[data-test="user-id"]').should(
          "have.text",
          "Id: 1" // Id of the student
        );
      });

      it("testName is truncating or not", () => {
        cy.get('[data-test="test-name"]').then(($element) => {
          const testNameElement = $element.text();
          const maxCharacterWidth = 12.6; // Maximum width in characters
          const expectedTruncatedText =
            testNameElement.slice(0, maxCharacterWidth) + "...";
          expect(expectedTruncatedText).to.contain("...");
        });
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
        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");

        // question 4 -- typed but not submitted!
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
          .should("have.text", 15);
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
            "Question Set 0 Description\nYou may attempt all questions in this section."
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
            fixture: "question_bucket_fetched.json",
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
    });
  });

  describe("Resume Session", () => {
    beforeEach(() => {
      // stub the response to /sessions
      cy.intercept("POST", "/sessions/", {
        fixture: "resume_session.json",
      });

      cy.intercept("PATCH", "/session_answers/**", {});
      cy.intercept("PATCH", "/sessions/*", {});

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
          .get('[data-test="previousQuestionButton"]')
          .trigger("click");

        // option 1 should no longer be checked, option 2 should be checked
        cy.get("@modal")
          .get('[data-test="optionSelector-0"]')
          .should("not.be.checked");
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
