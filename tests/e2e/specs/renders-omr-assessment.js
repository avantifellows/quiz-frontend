// https://docs.cypress.io/api/introduction/api.html

describe("Player for OMR quizzes", () => {
  beforeEach(() => {
    // stub the response to /quiz/{quizId}
    cy.intercept("GET", Cypress.env("backend") + "/quiz/*", {
      fixture: "multi_qset_omr.json", // 2 question sets -- each has 12 questions
      // in set 1 -- all questions can be answered
      // in set 2 -- only upto 3 questions can be answered
    });
  });

  describe("New Session", () => {
    beforeEach(() => {
      // stub the response to /sessions
      cy.intercept("POST", "/sessions/", {
        fixture: "new_session_for_multiset_quiz.json",
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
      cy.get('[data-test="quizType"]').should("have.text", "omr-assessment");
    });

    describe("Quiz Started", () => {
      beforeEach(() => {
        cy.get("@startQuizButton").trigger("click");
      });

      it("should not contain Question Modal", () => {
        cy.get('[data-test="modal"]').should("not.exist");
      });

      it("omr modal does not contain clear and save&next buttons", () => {
        cy.get('[data-test="omr-modal"]')
          .should("exist")
          .within(() => {
            cy.get('[data-test="clearButton"]').should("not.exist");
          });

        cy.get('[data-test="omr-modal"]').within(() => {
          cy.get('[data-test="saveAndNextButton"]').should("not.exist");
        });
      });

      it("omr modal does not contain previous and next buttons", () => {
        cy.get('[data-test="omr-modal"]')
          .should("exist")
          .within(() => {
            cy.get('[data-test="previousQuestionButton"]').should("not.exist");
          });

        cy.get('[data-test="omr-modal"]').within(() => {
          cy.get('[data-test="nextQuestionButton"]').should("not.exist");
        });
      });

      describe("Answer selected", () => {
        beforeEach(() => {
          // question 1
          cy.get('[data-test="omr-modal"]')
            .get('[data-test="OmrItem-0"]')
            .within(() => {
              cy.get('[data-test="optionSelector-0"]').trigger("click");
            });
        });

        it("clears the answer upon clicking the option again", () => {
          // option 1 should be selected
          cy.get('[data-test="omr-modal"]')
            .get('[data-test="OmrItem-0"]')
            .within(() => {
              cy.get('[data-test="optionSelector-0"]').should("be.checked");
            });

          // click again to clear
          cy.get('[data-test="omr-modal"]')
            .get('[data-test="OmrItem-0"]')
            .within(() => {
              cy.get('[data-test="optionSelector-0"]').trigger("click");
            });

          // option 1 should no longer be selected
          cy.get('[data-test="omr-modal"]')
            .get('[data-test="OmrItem-0"]')
            .within(() => {
              cy.get('[data-test="optionSelector-0"]').should("not.be.checked");
            });
        });
      });

      it("shows number of skipped questions in the scorecard too", () => {
        // question 1
        cy.get('[data-test="omr-modal"]')
          .get('[data-test="OmrItem-0"]')
          .within(() => {
            cy.get('[data-test="optionSelector-0"]').trigger("click");
          });

        // question 2
        cy.get('[data-test="omr-modal"]')
          .get('[data-test="OmrItem-1"]')
          .find('[data-test="optionSelector-0"]')
          .trigger("click");

        // question 3
        cy.get('[data-test="omr-modal"]')
          .get('[data-test="OmrItem-2"]')
          .find('[data-test="optionSelector-0"]')
          .trigger("click");

        // question 4 -- typed and thus submitted!
        cy.get('[data-test="omr-modal"]')
          .get('[data-test="OmrItem-3"]')
          .within(() => {
            cy.get('[data-test="numericalAnswer"]').type("3");
          });

        // question 18 - answered!
        cy.get('[data-test="omr-modal"]')
          .get('[data-test="OmrItem-18"]')
          .within(() => {
            cy.get('[data-test="numericalAnswer"]').type("3");
          });

        // end test
        cy.get('[data-test="omr-modal"]')
          .get('[data-test="endTestButton"]')
          .trigger("click");

        // additional click to protect endTest button
        cy.get('[data-test="omr-modal"]')
          .get('[data-test="endTestButton"]')
          .trigger("click");

        // number of skipped questions shown in scorecard
        cy.get('[data-test="scorecard"]')
          .get('[data-test="metricValue-2"]')
          .should("have.text", 10);
      });

      describe("End test", () => {
        beforeEach(() => {
          cy.get('[data-test="omr-modal"]')
            .get('[data-test="endTestButton"]')
            .trigger("click");

          cy.get('[data-test="omr-modal"]')
            .get('[data-test="endTestButton"]')
            .trigger("click"); // additional click to protect endTest button
        });

        it("shows scorecard upon selecting End Test", () => {
          cy.get('[data-test="omr-modal"]').should("not.exist");
          cy.get('[data-test="scorecard"]').should("exist");
        });
      });

      describe("Question Palette", () => {
        it("Omr view should not contain question palette", () => {
          cy.get('[data-test="togglePaletteButton"]').should("not.be.visible");
        });
      });

      describe("Checking correctness of question header description", () => {
        // Item-3 is numerical int question
        it("check if question number displayed is correct", () => {
          cy.get('[data-test="omr-modal"]')
            .get('[data-test="OmrItem-3"]')
            .within(() => {
              cy.get('[data-test="question-header-text"]').should(
                "have.text",
                "Q.4: "
              );
            });
        });
      });

      describe("Checking correctness of numerical integer inputs", () => {
        it("number with more than 10 digit in integral part will be truncated", () => {
          cy.get('[data-test="omr-modal"]')
            .get('[data-test="OmrItem-3"]')
            .within(() => {
              cy.get('[data-test="numericalAnswer"]').type("1".repeat(11));
            });

          cy.get('[data-test="omr-modal"]')
            .get('[data-test="OmrItem-3"]')
            .within(() => {
              cy.get('textarea[data-test="input"]').should(
                "have.value",
                "1".repeat(10)
              );
            });
        });

        it("characters other than digits should not be considered", () => {
          cy.get('[data-test="omr-modal"]')
            .get('[data-test="OmrItem-3"]')
            .within(() => {
              cy.get('[data-test="numericalAnswer"]').type("1aa23");
            });

          cy.get('[data-test="omr-modal"]')
            .get('[data-test="OmrItem-3"]')
            .within(() => {
              cy.get('textarea[data-test="input"]').should("have.value", "123");
            });
        });
      });

      describe("Check for optional questions and limits", () => {
        beforeEach(() => {
          // answer question 12, 13, 14
          cy.get('[data-test="omr-modal"]')
            .get('[data-test="OmrItem-12"]')
            .within(() => {
              cy.get('[data-test="optionSelector-0"]').trigger("click");
            });
          cy.get('[data-test="omr-modal"]')
            .get('[data-test="OmrItem-13"]')
            .within(() => {
              cy.get('[data-test="optionSelector-0"]').trigger("click");
            });
          cy.get('[data-test="omr-modal"]')
            .get('[data-test="OmrItem-14"]')
            .within(() => {
              cy.get('[data-test="optionSelector-0"]').trigger("click");
            });
        });

        it("cannot select answer for question once optional limit reached", () => {
          // cannot answer question index 15 as optional limit is hit
          // all option containers should have a gray background
          cy.get('[data-test="omr-modal"]')
            .get('[data-test="OmrItem-15"]')
            .within(() => {
              cy.get('[data-test="optionSelector-0"]').should("be.disabled");

              cy.get('[data-test="optionContainer-0"]').should(
                "have.class",
                "bg-gray-200"
              );

              cy.get('[data-test="optionContainer-1"]').should(
                "have.class",
                "bg-gray-200"
              );

              cy.get('[data-test="optionContainer-2"]').should(
                "have.class",
                "bg-gray-200"
              );
            });

          // cannot answer question index 16 as optional limit is hit
          cy.get('[data-test="omr-modal"]')
            .get('[data-test="OmrItem-16"]')
            .within(() => {
              cy.get('textarea[data-test="input"]').should("be.disabled");
            });
        });

        it("clear answer for already-answered question to attempt different question in optional set", () => {
          // clear the answer for 3rd question in 2nd qset (index 14)
          cy.get('[data-test="omr-modal"]')
            .get('[data-test="OmrItem-14"]')
            .within(() => {
              cy.get('[data-test="optionSelector-0"]').trigger("click");
            });

          // now go to 4th question in 2nd qset and answer
          // its not disabled anymore!
          cy.get('[data-test="omr-modal"]')
            .get('[data-test="OmrItem-15"]')
            .within(() => {
              cy.get('[data-test="optionSelector-0"]').should(
                "not.be.disabled"
              );

              cy.get('[data-test="optionContainer-0"]').should(
                "not.have.class",
                "bg-gray-200"
              );

              cy.get('[data-test="optionContainer-1"]').should(
                "not.have.class",
                "bg-gray-200"
              );

              cy.get('[data-test="optionContainer-2"]').should(
                "not.have.class",
                "bg-gray-200"
              );
            });
        });

        it("quesiton set title and instruction are shown in omr modal", () => {
          cy.get('[data-test="questionSetTitle-1"').should("exist");
          cy.get('[data-test="questionSetTitle-1"').should(
            "have.text",
            "Question Set 1"
          );

          cy.get('[data-test="questionSetInstruction-1"').should("exist");
          cy.get('[data-test="questionSetInstruction-1"').should(
            "have.text",
            "Question Set 1 Description\nYou may attempt only up to 3 questions in this section."
          );
        });

        it("once scorecard displayed, number of skipped questions should not consider optional questions", () => {
          cy.get('[data-test="omr-modal"]')
            .get('[data-test="endTestButton"]')
            .trigger("click");

          // additional click to protect endTest button
          cy.get('[data-test="omr-modal"]')
            .get('[data-test="endTestButton"]')
            .trigger("click");

          cy.get('[data-test="scorecard"]')
            .get('[data-test="metricValue-2"]')
            .should("have.text", 12); // 12 skipped in first qset, none skipped in 2nd qset
        });
      });
    });
  });

  // check if resume session data is flowing well to OmrModal and OmrItem
  describe("Resume Session", () => {
    beforeEach(() => {
      // stub the response to /sessions
      cy.intercept("POST", "/sessions/", {
        fixture: "resume_session_for_multiset_quiz.json",
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
        cy.get('[data-test="omr-modal"]').as("omr-modal");
      });

      it("answers from previous session should be reflected accordingly", () => {
        // only option 1 should be checked, option-2 shouldn't be checked
        cy.get("@omr-modal")
          .get('[data-test="OmrItem-0"]')
          .within(() => {
            cy.get('[data-test="optionSelector-0"]').should("be.checked");
          });

        cy.get("@omr-modal")
          .get('[data-test="OmrItem-0"]')
          .within(() => {
            cy.get('[data-test="optionSelector-1"]').should("not.be.checked");
          });

        // answer is [0, 1] for 2nd question
        cy.get("@omr-modal")
          .get('[data-test="OmrItem-1"]')
          .within(() => {
            cy.get('[data-test="optionSelector-0"]').should("be.checked");

            cy.get('[data-test="optionSelector-1"]').should("be.checked");
          });

        // answer is 3 for 4th question numerical
        cy.get('[data-test="omr-modal"]')
          .get('[data-test="OmrItem-3"]')
          .within(() => {
            cy.get('textarea[data-test="input"]').should("have.value", "3");
          });
      });

      it("updates answer when new option is checked", () => {
        cy.get("@omr-modal")
          .get('[data-test="OmrItem-0"]')
          .within(() => {
            cy.get('[data-test="optionSelector-1"]').trigger("click");
          });

        cy.get("@omr-modal")
          .get('[data-test="OmrItem-0"]')
          .within(() => {
            cy.get('[data-test="optionSelector-1"]').should("be.checked");
          });

        cy.get("@omr-modal")
          .get('[data-test="OmrItem-0"]')
          .within(() => {
            cy.get('[data-test="optionSelector-0"]').should("not.be.checked");
          });
      });
    });
  });
});
