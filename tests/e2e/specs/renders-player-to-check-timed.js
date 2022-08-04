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

      cy.intercept("PATCH", "/session_answers/*", {});
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
    });

    describe("Timed Quiz Started", () => {
      beforeEach(() => {
        cy.get("@startQuizButton").trigger("click");
      });

      it("displays countdown timer in header", () => {
        cy.get('[data-test="countdownTimer"').should("exist");
      });

      it("length of text in countdown timer should be 8", () => {
        cy.get('[data-test="countdownTimer"')
          .invoke("text")
          .should("have.length", 8); // 2 + 1 + 2 + 1 + 2
      });

      it("time displayed in button should be less than or equal to timeRemaining", () => {
        cy.get(`[data-test="countdownTimer"]`)
          .invoke("text")
          .then((tx) => {
            expect(convertTimetoInt(tx)).to.not.be.below(200);
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

      it("timer not displayed after test ends and we go back", () => {
        // click end test
        cy.get('[data-test="modal"]')
          .get('[data-test="endTestButton"]')
          .trigger("click");

        // go back
        cy.get('[data-test="backButton"]').trigger("click");

        // timer shouldn't be there in header
        cy.get(`[data-test="countdownTimer"`).should("not.exist");
      });
    });
  });

  describe("New un-timed quiz Session", () => {
    beforeEach(() => {
      // stub the response to /sessions
      cy.intercept("POST", "/sessions/", {
        fixture: "new_session.json",
      });

      cy.intercept("PATCH", "/session_answers/*", {});
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

      cy.intercept("PATCH", "/session_answers/*", {});
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
    });

    describe("Timed Quiz Started", () => {
      beforeEach(() => {
        cy.get("@startQuizButton").trigger("click");
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
