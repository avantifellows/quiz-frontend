import { eventType } from "../../../src/types";

// https://docs.cypress.io/api/introduction/api.html

function convertTimetoInt(tx) {
  // converts hh:mm:ss -> seconds
  let currentTimeRemaining = 0;
  for (const [idx, t] of tx.split(":").entries()) {
    currentTimeRemaining += Math.pow(60, 2 - idx) * Number(t);
  }
  return currentTimeRemaining;
}

describe("Player for Assessment Timed quizzes", () => {
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

      cy.intercept("PATCH", "/session_answers/**", { status: 200 });
      cy.intercept("PATCH", "/sessions/*", { time_remaining: 200 });

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
      cy.server();
      cy.route("PATCH", "/sessions/*").as("patch_session");
    });

    describe("Timed Quiz Started", () => {
      beforeEach(() => {
        cy.get("@startQuizButton").trigger("click");
      });

      describe("Quiz Started", () => {
        it("Check if the test name is visible", () => {
          cy.get('[data-test="test-name"]').should(
            "have.text",
            "cypress assessment 1 by Avanti Fellows" // test name
          );
        });

        it("Check if the user-id is visible", () => {
          cy.get('[data-test="user-id"]').should(
            "have.text",
            " Id: 1" // Id of the student
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
      });

      it("patch session payload should have START_QUIZ event", () => {
        // wait for patch session to happen
        cy.wait("@patch_session");
        // now check if the payload sent is correct
        cy.get("@patch_session").its("request.body").should("deep.equal", {
          event: eventType.START_QUIZ,
        });
      });

      it("displays countdown timer in header", () => {
        cy.get('[data-test="countdownTimer"').should("exist");
      });

      it("length of text in countdown timer should be 8", () => {
        cy.get('[data-test="countdownTimer"')
          .invoke("text")
          .should("have.length", 8); // 2 + 1 + 2 + 1 + 2 (hh:mm:ss)
      });

      it("time displayed in button should be less than or equal to timeRemaining", () => {
        cy.get(`[data-test="countdownTimer"]`)
          .invoke("text")
          .then((tx) => {
            expect(convertTimetoInt(tx)).to.not.be.above(200);
          });
      });

      it("countdown timer background should be gray when time remaining more than warning time", () => {
        // warning time limit is 3 minutes (180 seconds)
        cy.get(`[data-test="countdownTimer"`).should(
          "have.class",
          "bg-gray-500"
        );
      });

      it("time remaining should be displayed in hh:mm:ss format", () => {
        cy.get(`[data-test="countdownTimer"`)
          .invoke("text")
          .should("equal", "00:03:20");
      });

      // *** commenting out this test for now since "Go Back" button is hidden ***
      // it("timer not displayed after test ends and we go back", () => {
      //   // click end test
      //   cy.get('[data-test="modal"]')
      //     .get('[data-test="endTestButton"]')
      //     .trigger("click");

      //   // additional click since endTest protected
      //   cy.get('[data-test="modal"]')
      //     .get('[data-test="endTestButton"]')
      //     .trigger("click");

      //   // go back
      //   cy.get('[data-test="backButton"]').trigger("click");

      //   // timer shouldn't be there in header
      //   cy.get(`[data-test="countdownTimer"`).should("not.exist");
      // });

      it("session patch should contain END_QUIZ event when end button is clicked", () => {
        // wait for START_QUIZ patch to be called
        cy.wait("@patch_session");

        // click on end button
        cy.get('[data-test="modal"]')
          .get('[data-test="endTestButton"]')
          .trigger("click");

        // click again since endTest button protected by additional click
        cy.get('[data-test="modal"]')
          .get('[data-test="endTestButton"]')
          .trigger("click");

        // wait for END_QUIZ patch to be called
        cy.wait("@patch_session");
        // check if payload has END_QUIZ event
        cy.get("@patch_session")
          .its("request.body")
          .should("deep.equal", {
            event: eventType.END_QUIZ,
            metrics: {
              name: "Question Set 0",
              maxQuestionsAllowedToAttempt: 24,
              numAnswered: 0,
              correctlyAnswered: 0,
              wronglyAnswered: 0,
              partiallyAnswered: 0,
              attemptRate: 0,
              accuracyRate: 0,
            },
          });
      });
    });
  });

  describe("New un-timed quiz Session", () => {
    beforeEach(() => {
      // stub the response to /sessions
      cy.intercept("POST", "/sessions/", {
        fixture: "new_session.json",
      });

      cy.intercept("PATCH", "/session_answers/**", { status: 200 });
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

    describe("Timed Quiz Started", () => {
      beforeEach(() => {
        cy.get("@startQuizButton").trigger("click");
      });

      it("does not display countdown timer in header", () => {
        cy.get('[data-test="countdownTimer"').should("not.exist");
      });
    });
  });

  describe("Resume Session", () => {
    beforeEach(() => {
      // stub the response to /sessions
      cy.intercept("POST", "/sessions/", {
        fixture: "resume_session.json",
      });

      cy.intercept("PATCH", "/session_answers/**", { status: 200 });
      cy.intercept("PATCH", "/sessions/*", { time_remaining: 1 });

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
      cy.server();
      cy.route("PATCH", "/sessions/*").as("patch_session");
    });

    describe("Timed Quiz Started", () => {
      beforeEach(() => {
        cy.get("@startQuizButton").trigger("click");
      });

      it("patch session payload should have RESUME_QUIZ event", () => {
        cy.wait("@patch_session");
        cy.get("@patch_session").its("request.body").should("deep.equal", {
          event: eventType.RESUME_QUIZ,
        });
      });

      it("countdown timer background should be red when time remaining less than warning time", () => {
        cy.get(`[data-test="countdownTimer"`).should(
          "have.class",
          "bg-red-600"
        );
      });

      it("end test and display scorecard when time is up (after a tick)", () => {
        cy.clock();
        cy.tick(1000);

        cy.get('[data-test="modal"]').should("not.exist");
        cy.get('[data-test="scorecard"]').should("exist");
      });
    });
  });
});

describe("Player for Homework Quizzes", () => {
  beforeEach(() => {
    // stub the response to /quiz/{quizId}
    cy.intercept("GET", Cypress.env("backend") + "/quiz/*", {
      fixture: "homework_quiz.json",
    });
  });

  describe("New Session", () => {
    beforeEach(() => {
      // stub the response to /sessions
      cy.intercept("POST", "/sessions/", {
        fixture: "new_homework_session.json",
      });

      cy.intercept("PATCH", "/session_answers/**", { status: 200 });
      cy.intercept("PATCH", "/sessions/*", { time_remaining: 200 });

      cy.intercept(
        "GET",
        Cypress.env("backend") + "/organizations/authenticate/*",
        {
          fixture: "org_authentication.json",
        }
      );
      cy.visit("/quiz/abcd?userId=1&apiKey=pqr");

      cy.clock();
      cy.server();

      // define aliasas
      cy.get('[data-test="startQuiz"]').as("startQuizButton");
      cy.route("PATCH", "/session_answers/**").as("patch_session_answers");
    });

    describe("Quiz starts", () => {
      beforeEach(() => {
        cy.get("@startQuizButton").trigger("click");
      });

      it("patch session answer payload should have time_spent key", () => {
        // wait for visited patch
        cy.wait("@patch_session_answers");
        cy.get("@patch_session_answers")
          .its("request.body")
          .should("deep.equal", {
            visited: true,
          });

        // choose an option
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .trigger("click");

        // spend three more seconds on question 1 and submit
        cy.tick(3000);
        cy.get('[data-test="modal"]')
          .get('[data-test="submitButton"]')
          .trigger("click");

        // wait for patch session answer to happen
        cy.wait("@patch_session_answers");
        // now check if the payload sent is correct
        cy.get("@patch_session_answers")
          .its("request.body")
          .should("deep.equal", {
            answer: [0],
            time_spent: 3,
          });
      });

      it("time spent on question 2 does not alter due to time spent on question 1", () => {
        // choose answer for q1 and submit
        cy.wait("@patch_session_answers");
        cy.get("@patch_session_answers")
          .its("request.body")
          .should("deep.equal", {
            visited: true,
          });
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .trigger("click");
        cy.get('[data-test="modal"]')
          .get('[data-test="submitButton"]')
          .trigger("click");
        cy.wait("@patch_session_answers");
        cy.get("@patch_session_answers")
          .its("request.body")
          .should("deep.equal", {
            answer: [0],
            time_spent: 0,
          });
        // click submit again to continue
        cy.get('[data-test="modal"]')
          .get('[data-test="submitButton"]')
          .trigger("click");

        // for q2, choose option spend 3 sec on it
        cy.wait("@patch_session_answers");
        cy.get("@patch_session_answers")
          .its("request.body")
          .should("deep.equal", {
            visited: true,
          });
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-1"]')
          .trigger("click");
        cy.tick(3000);
        // click back button
        cy.get('[data-test="modal"]')
          .get('[data-test="previousQuestionButton"]')
          .trigger("click");
        // spend 3 sec on q1
        cy.tick(3000);
        // click Continue button
        cy.get('[data-test="modal"]')
          .get('[data-test="submitButton"]')
          .trigger("click");
        // click Submit button
        cy.get('[data-test="modal"]')
          .get('[data-test="submitButton"]')
          .trigger("click");

        // wait for patch session answer to happen
        cy.wait("@patch_session_answers");
        // now check if the payload sent is correct
        cy.get("@patch_session_answers")
          .its("request.body")
          .should("deep.equal", {
            answer: [1],
            time_spent: 3, // not 6
          });
      });
    });
  });
});
