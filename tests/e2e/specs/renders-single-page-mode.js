// https://docs.cypress.io/api/introduction/api.html

describe("Player for Single Page Mode with Full Text", () => {
  beforeEach(() => {
    // stub the response to /quiz/{quizId}
    cy.intercept("GET", Cypress.env("backend") + "/quiz/*", {
      fixture: "multi_qset_omr.json", // 2 question sets -- each has 12 questions
      // in set 1 -- all questions can be answered
      // in set 2 -- only upto 3 questions can be answered
    });
  });

  describe("New Session with Single Page Mode", () => {
    beforeEach(() => {
      // stub the response to /sessions
      cy.intercept("POST", "/sessions/", {
        fixture: "new_session_for_multiset_quiz.json",
      });

      cy.intercept("PATCH", "/session_answers/**", { body: {} }).as(
        "patchSessionAnswerRequest"
      );
      cy.intercept("PATCH", "/sessions/*", { body: { timeRemaining: 100 } });

      cy.intercept(
        "GET",
        Cypress.env("backend") + "/organizations/authenticate/*",
        {
          fixture: "org_authentication.json",
        }
      );
      // Visit with singlePageMode=true query parameter
      cy.visit("/quiz/abcd?userId=1&apiKey=pqr&singlePageMode=true");

      cy.server();
      cy.clock();

      // define aliases
      cy.get('[data-test="startQuiz"]').as("startQuizButton");
      cy.route("PATCH", "/session_answers/**").as("patch_session_answers");
    });

    it("shows splash screen", () => {
      cy.get('[data-test="quizType"]').should("exist");
    });

    describe("Quiz Started", () => {
      beforeEach(() => {
        cy.get("@startQuizButton").trigger("click");
      });

      it("should not contain regular Question Modal", () => {
        cy.get('[data-test="modal"]').should("not.exist");
      });

      it("should contain SinglePageModal", () => {
        cy.get('[data-test="single-page-modal"]').should("exist");
      });

      it("single page modal does not contain clear and save&next buttons", () => {
        cy.get('[data-test="single-page-modal"]')
          .should("exist")
          .within(() => {
            cy.get('[data-test="clearButton"]').should("not.exist");
          });

        cy.get('[data-test="single-page-modal"]').within(() => {
          cy.get('[data-test="saveAndNextButton"]').should("not.exist");
        });
      });

      it("single page modal does not contain previous and next buttons", () => {
        cy.get('[data-test="single-page-modal"]')
          .should("exist")
          .within(() => {
            cy.get('[data-test="previousQuestionButton"]').should("not.exist");
          });

        cy.get('[data-test="single-page-modal"]').within(() => {
          cy.get('[data-test="nextQuestionButton"]').should("not.exist");
        });
      });

      it("displays all questions on single page", () => {
        // Should have multiple SinglePageItem components visible
        cy.get('[data-test="single-page-modal"]')
          .get('[data-test^="SinglePageItem-"]')
          .should("have.length.greaterThan", 1);
      });

      describe("Answer selected in full text mode", () => {
        beforeEach(() => {
          // question 1 - select first option
          cy.get('[data-test="single-page-modal"]')
            .get('[data-test="SinglePageItem-0"]')
            .within(() => {
              cy.get('[data-test="optionSelector-0"]').trigger("click");
            });
        });

        it("submits answer for single page question", () => {
          cy.wait("@patch_session_answers");
          cy.get("@patch_session_answers")
            .its("request.body")
            .should("deep.equal", {
              visited: true,
            });

          cy.wait("@patch_session_answers");
          cy.get("@patch_session_answers")
            .its("request.body")
            .should("deep.equal", {
              answer: [0],
              marked_for_review: false,
            });
        });

        it("clears the answer upon clicking the option again", () => {
          // option 1 should be selected
          cy.get('[data-test="single-page-modal"]')
            .get('[data-test="SinglePageItem-0"]')
            .within(() => {
              cy.get('[data-test="optionSelector-0"]').should("be.checked");
            });

          // click again to clear
          cy.get('[data-test="single-page-modal"]')
            .get('[data-test="SinglePageItem-0"]')
            .within(() => {
              cy.get('[data-test="optionSelector-0"]').trigger("click");
            });

          // option 1 should no longer be selected
          cy.get('[data-test="single-page-modal"]')
            .get('[data-test="SinglePageItem-0"]')
            .within(() => {
              cy.get('[data-test="optionSelector-0"]').should("not.be.checked");
            });
        });
      });

      it("shows scorecard after answering questions and ending test", () => {
        // question 1
        cy.get('[data-test="single-page-modal"]')
          .get('[data-test="SinglePageItem-0"]')
          .within(() => {
            cy.get('[data-test="optionSelector-0"]').trigger("click");
          });

        // question 2
        cy.get('[data-test="single-page-modal"]')
          .get('[data-test="SinglePageItem-1"]')
          .find('[data-test="optionSelector-0"]')
          .trigger("click");

        // question 3
        cy.get('[data-test="single-page-modal"]')
          .get('[data-test="SinglePageItem-2"]')
          .find('[data-test="optionSelector-0"]')
          .trigger("click");

        // end test
        cy.get('[data-test="single-page-modal"]')
          .get('[data-test="endTestButton"]')
          .trigger("click");

        // additional click to protect endTest button
        cy.get('[data-test="single-page-modal"]')
          .get('[data-test="endTestButton"]')
          .trigger("click");

        // check if update all session answers request is made
        cy.wait("@patchSessionAnswerRequest").then((interception) => {
          const request = interception.request;
          const response = interception.response;

          expect(request.method).to.equal("PATCH");
          expect(response.statusCode).to.equal(200);
        });

        // scorecard should be shown
        cy.get('[data-test="scorecard"]').should("exist");
      });

      describe("End test", () => {
        beforeEach(() => {
          cy.get('[data-test="single-page-modal"]')
            .get('[data-test="endTestButton"]')
            .trigger("click");

          cy.get('[data-test="single-page-modal"]')
            .get('[data-test="endTestButton"]')
            .trigger("click"); // additional click to protect endTest button
        });

        it("shows scorecard upon selecting End Test", () => {
          cy.get('[data-test="single-page-modal"]').should("not.exist");
          cy.get('[data-test="scorecard"]').should("exist");
        });
      });

      describe("Question Palette", () => {
        it("Single page view should contain question palette", () => {
          cy.get('[data-test="togglePaletteButton"]').should("be.visible");
        });
      });

      describe("Checking correctness of question display", () => {
        it("check if question number displayed is correct", () => {
          cy.get('[data-test="single-page-modal"]')
            .get('[data-test="SinglePageItem-0"]')
            .within(() => {
              cy.get('[data-test="question-header-text"]').should(
                "contain.text",
                "Q.1"
              );
            });
        });

        it("displays question text in full text mode", () => {
          // In full text mode, question text should be visible
          cy.get('[data-test="single-page-modal"]')
            .get('[data-test="SinglePageItem-0"]')
            .should("contain.text", "Q.1");
        });
      });

      describe("Checking numerical integer inputs in single page mode", () => {
        it("number with more than 10 digit in integral part will be truncated", () => {
          cy.get('[data-test="single-page-modal"]')
            .get('[data-test="SinglePageItem-3"]')
            .within(() => {
              cy.get('[data-test="numericalAnswer"]').type("1".repeat(11));
            });

          cy.get('[data-test="single-page-modal"]')
            .get('[data-test="SinglePageItem-3"]')
            .within(() => {
              cy.get('textarea[data-test="input"]').should(
                "have.value",
                "1".repeat(10)
              );
            });
        });

        it("characters other than digits should not be considered", () => {
          cy.get('[data-test="single-page-modal"]')
            .get('[data-test="SinglePageItem-3"]')
            .within(() => {
              cy.get('[data-test="numericalAnswer"]').type("1aa23");
            });

          cy.get('[data-test="single-page-modal"]')
            .get('[data-test="SinglePageItem-3"]')
            .within(() => {
              cy.get('textarea[data-test="input"]').should("have.value", "123");
            });
        });
      });

      describe("Check for optional questions and limits in single page mode", () => {
        beforeEach(() => {
          // answer question 12, 13, 14
          cy.get('[data-test="single-page-modal"]')
            .get('[data-test="SinglePageItem-12"]')
            .within(() => {
              cy.get('[data-test="optionSelector-0"]').trigger("click");
            });
          cy.get('[data-test="single-page-modal"]')
            .get('[data-test="SinglePageItem-13"]')
            .within(() => {
              cy.get('[data-test="optionSelector-0"]').trigger("click");
            });
          cy.get('[data-test="single-page-modal"]')
            .get('[data-test="SinglePageItem-14"]')
            .within(() => {
              cy.get('[data-test="optionSelector-0"]').trigger("click");
            });
        });

        it("cannot select answer for question once optional limit reached", () => {
          // cannot answer question index 15 as optional limit is hit
          cy.get('[data-test="single-page-modal"]')
            .get('[data-test="SinglePageItem-15"]')
            .within(() => {
              cy.get('[data-test="optionSelector-0"]').should("be.disabled");
            });
        });

        it("clear answer for already-answered question to attempt different question in optional set", () => {
          // clear the answer for 3rd question in 2nd qset (index 14)
          cy.get('[data-test="single-page-modal"]')
            .get('[data-test="SinglePageItem-14"]')
            .within(() => {
              cy.get('[data-test="optionSelector-0"]').trigger("click");
            });

          // now go to 4th question in 2nd qset and answer
          // its not disabled anymore!
          cy.get('[data-test="single-page-modal"]')
            .get('[data-test="SinglePageItem-15"]')
            .within(() => {
              cy.get('[data-test="optionSelector-0"]').should(
                "not.be.disabled"
              );
            });
        });

        it("question set title and instruction are shown in single page modal", () => {
          cy.get('[data-test="questionSetTitle-1"').should("exist");
          cy.get('[data-test="questionSetTitle-1"').should(
            "have.text",
            "Question Set 1"
          );

          cy.get('[data-test="questionSetInstruction-1"').should("exist");
        });
      });
    });
  });

  // check if resume session data flows well to SinglePageModal
  describe("Resume Session with Single Page Mode", () => {
    beforeEach(() => {
      // stub the response to /sessions
      cy.intercept("POST", "/sessions/", {
        fixture: "resume_session_for_multiset_quiz.json",
      });

      cy.intercept("PATCH", "/session_answers/**", { body: {} }).as(
        "patchSessionAnswerRequest"
      );
      cy.intercept("PATCH", "/sessions/*", { body: { timeRemaining: 100 } });
      cy.intercept(
        "GET",
        Cypress.env("backend") + "/organizations/authenticate/*",
        {
          fixture: "org_authentication.json",
        }
      );
      cy.visit("/quiz/abcd?userId=1&apiKey=pqr&singlePageMode=true");

      // define aliases
      cy.get('[data-test="startQuiz"]').as("startQuizButton");
    });

    describe("updating answers of questions", () => {
      beforeEach(() => {
        cy.get("@startQuizButton").trigger("click");
        cy.get('[data-test="single-page-modal"]').as("single-page-modal");
      });

      it("answers from previous session should be reflected accordingly", () => {
        // only option 1 should be checked, option-2 shouldn't be checked
        cy.get("@single-page-modal")
          .get('[data-test="SinglePageItem-0"]')
          .within(() => {
            cy.get('[data-test="optionSelector-0"]').should("be.checked");
          });

        cy.get("@single-page-modal")
          .get('[data-test="SinglePageItem-0"]')
          .within(() => {
            cy.get('[data-test="optionSelector-1"]').should("not.be.checked");
          });

        // answer is [0, 1] for 2nd question
        cy.get("@single-page-modal")
          .get('[data-test="SinglePageItem-1"]')
          .within(() => {
            cy.get('[data-test="optionSelector-0"]').should("be.checked");

            cy.get('[data-test="optionSelector-1"]').should("be.checked");
          });

        // answer is 3 for 4th question numerical
        cy.get('[data-test="single-page-modal"]')
          .get('[data-test="SinglePageItem-3"]')
          .within(() => {
            cy.get('textarea[data-test="input"]').should("have.value", "3");
          });
      });

      it("updates answer when new option is checked", () => {
        cy.get("@single-page-modal")
          .get('[data-test="SinglePageItem-0"]')
          .within(() => {
            cy.get('[data-test="optionSelector-1"]').trigger("click");
          });

        cy.get("@single-page-modal")
          .get('[data-test="SinglePageItem-0"]')
          .within(() => {
            cy.get('[data-test="optionSelector-1"]').should("be.checked");
          });

        cy.get("@single-page-modal")
          .get('[data-test="SinglePageItem-0"]')
          .within(() => {
            cy.get('[data-test="optionSelector-0"]').should("not.be.checked");
          });
      });
    });
  });
});
