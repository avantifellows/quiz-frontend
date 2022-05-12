// https://docs.cypress.io/api/introduction/api.html

describe("Player for homework quizzes", () => {
  it("shows 404 error page when quiz ID not provided", () => {
    cy.visit("/");
    cy.url().should("include", "/404-not-found");
  });

  it("shows 403 error page if quiz ID provided but user ID is not", () => {
    cy.visit("/quiz/abcd");
    cy.url().should("include", "/403-access-denied");
  });

  describe("Quiz ID and User ID provided", () => {
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
          fixture: "new_session.json",
        });

        cy.intercept("PATCH", "/session_answers/*", {});

        cy.visit("/quiz/abcd?userId=1");

        // define aliasas
        cy.get('[data-test="startQuiz"]').as("startQuizButton");
      });

      it("shows splash screen", () => {
        cy.get('[data-test="splash"]').should("exist");
        cy.get('[data-test="modal"]').should("not.exist");
        cy.get("@startQuizButton").should("exist");
        cy.get("@startQuizButton").should("contain", "Let's Start");
      });

      it("shows modal upon clicking start button on splash screen", () => {
        cy.get("@startQuizButton").trigger("click");
        cy.get('[data-test="splash"]').should("not.exist");
        cy.get('[data-test="modal"]').should("exist");
      });

      it("scorecard shown when all questions are answered", () => {
        cy.get('[data-test="startQuiz"]').trigger("click");

        // question 1
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .trigger("click");
        cy.get('[data-test="modal"]')
          .get('[data-test="submitButton"]')
          .trigger("click");
        // continue button
        cy.get('[data-test="modal"]')
          .get('[data-test="submitButton"]')
          .trigger("click");

        // question 2
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .trigger("click");
        cy.get('[data-test="modal"]')
          .get('[data-test="submitButton"]')
          .trigger("click");
        // continue button
        cy.get('[data-test="modal"]')
          .get('[data-test="submitButton"]')
          .trigger("click");

        // question 3
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .trigger("click");
        cy.get('[data-test="modal"]')
          .get('[data-test="submitButton"]')
          .trigger("click");
        // continue button
        cy.get('[data-test="modal"]')
          .get('[data-test="submitButton"]')
          .trigger("click");

        cy.get('[data-test="splash"]').should("not.exist");
        cy.get('[data-test="modal"]').should("not.exist");
        cy.get('[data-test="scorecard"]').should("exist");
      });
    });

    describe("Resume Session", () => {
      beforeEach(() => {
        // stub the response to /sessions
        cy.intercept("POST", "/sessions/", {
          fixture: "resume_session.json",
        });

        cy.visit("/quiz/abcd?userId=1");

        // define aliasas
        cy.get('[data-test="startQuiz"]').as("startQuizButton");
      });
      it("changes the text of the start quiz button", () => {
        cy.get("@startQuizButton").should("contain", "Resume");
      });

      describe("restores answers of questions", () => {
        beforeEach(() => {
          cy.get("@startQuizButton").trigger("click");
          cy.get('[data-test="modal"]').as("modal");
        });

        it("ungraded questions", () => {
          cy.get("@modal")
            .get('[data-test="optionContainer-0"]')
            .should("have.class", "bg-gray-200");
          cy.get("@modal")
            .get('[data-test="optionContainer-1"]')
            .should("not.have.class", "bg-gray-200");
          cy.get("@modal")
            .get('[data-test="optionContainer-2"]')
            .should("not.have.class", "bg-gray-200");
        });

        it("graded questions", () => {
          // move to second question
          cy.get("@modal").get('[data-test="submitButton"]').trigger("click");

          cy.get("@modal")
            .get('[data-test="optionContainer-0"]')
            .should("have.class", "bg-green-500");
          cy.get("@modal")
            .get('[data-test="optionContainer-1"]')
            .should("have.class", "bg-red-500");
          cy.get("@modal")
            .get('[data-test="optionContainer-2"]')
            .should("have.class", "bg-green-500");
        });
      });
    });
  });
});
