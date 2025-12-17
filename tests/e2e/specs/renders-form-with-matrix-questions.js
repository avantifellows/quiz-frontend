// https://docs.cypress.io/api/introduction/api.html

describe("Form with Matrix Questions Tests", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", (err) => {
      if (err.message.includes("Network Error")) {
        return false;
      }
    });

    cy.intercept("GET", Cypress.env("backend") + "/form/*", {
      fixture: "form_questionnaire.json",
    }).as("getForm");

    cy.intercept(
      "GET",
      Cypress.env("backend") + "/organizations/authenticate/*",
      {
        fixture: "org_authentication.json",
      }
    ).as("authCheck");
  });

  describe("New Form Session", () => {
    beforeEach(() => {
      cy.intercept("POST", Cypress.env("backend") + "/sessions/", {
        fixture: "new_form_session.json",
      }).as("createSession");

      cy.intercept("PATCH", Cypress.env("backend") + "/session_answers/**", {
        statusCode: 200,
        body: {},
      }).as("patchSessionAnswer");

      cy.intercept("PATCH", Cypress.env("backend") + "/sessions/*", {
        body: { timeRemaining: 1800 },
      }).as("patchSession");

      cy.visit("/form/form_quiz_123456?userId=1&apiKey=pqr");
      cy.wait("@getForm");
      cy.get('[data-test="startQuiz"]', { timeout: 10000 }).as(
        "startQuizButton"
      );
    });

    it("shows splash screen with form title", () => {
      cy.get('[data-test="metadata-title"]').should(
        "have.text",
        "Student Baseline Form"
      );
    });

    it("starts the form and shows first question", () => {
      cy.get("@startQuizButton").click();
      cy.get('[data-test="question-index-type"]').should("contain", "Q.1");
    });

    it("completes subjective question (Q1)", () => {
      cy.get("@startQuizButton").click();
      cy.get('[data-test="question-index-type"]').should("contain", "Q.1");
      cy.get('[data-test="subjectiveAnswer"]').type("John Doe");
      cy.get('[data-test="submitButton"]').should("not.be.disabled");
      cy.get('[data-test="submitButton"]').click();
      cy.wait("@patchSessionAnswer");
      cy.get('[data-test="question-index-type"]').should("contain", "Q.2");
    });

    it("completes single choice question (Q2)", () => {
      cy.get("@startQuizButton").click();
      // Q1
      cy.get('[data-test="subjectiveAnswer"]').type("John Doe");
      cy.get('[data-test="submitButton"]').click();
      cy.wait("@patchSessionAnswer");
      // Q2
      cy.get('[data-test="question-index-type"]').should("contain", "Q.2");
      cy.get('[data-test="optionSelector-1"]').click();
      cy.get('[data-test="submitButton"]').should("not.be.disabled");
      cy.get('[data-test="submitButton"]').click();
      cy.wait("@patchSessionAnswer");
      cy.get('[data-test="question-index-type"]').should("contain", "Q.3");
    });

    it("navigates to matrix rating question (Q5)", () => {
      cy.get("@startQuizButton").click();

      // Q1: subjective
      cy.get('[data-test="question-index-type"]').should("contain", "Q.1");
      cy.get('[data-test="subjectiveAnswer"]').type("John Doe");
      cy.get('[data-test="submitButton"]').click();
      cy.wait("@patchSessionAnswer");

      // Q2: single choice
      cy.get('[data-test="question-index-type"]').should("contain", "Q.2");
      cy.get('[data-test="optionSelector-1"]').click();
      cy.get('[data-test="submitButton"]').click();
      cy.wait("@patchSessionAnswer");

      // Q3: multi choice
      cy.get('[data-test="question-index-type"]').should("contain", "Q.3");
      cy.get('[data-test="optionSelector-0"]').click();
      cy.get('[data-test="optionSelector-1"]').click();
      cy.get('[data-test="submitButton"]').click();
      cy.wait("@patchSessionAnswer");

      // Q4: single choice
      cy.get('[data-test="question-index-type"]').should("contain", "Q.4");
      cy.get('[data-test="optionSelector-2"]').click();
      cy.get('[data-test="submitButton"]').click();
      cy.wait("@patchSessionAnswer");

      // Q5: matrix rating
      cy.get('[data-test="question-index-type"]').should("contain", "Q.5");
      cy.get('[data-test="matrixRatingContainer"]').should("be.visible");
    });

    it("selects matrix rating answers and navigates to Q6", () => {
      cy.get("@startQuizButton").click();

      // Q1: subjective
      cy.get('[data-test="question-index-type"]').should("contain", "Q.1");
      cy.get('[data-test="subjectiveAnswer"]').type("John Doe");
      cy.get('[data-test="submitButton"]').click();
      cy.wait("@patchSessionAnswer");

      // Q2: single choice
      cy.get('[data-test="question-index-type"]').should("contain", "Q.2");
      cy.get('[data-test="optionSelector-1"]').click();
      cy.get('[data-test="submitButton"]').click();
      cy.wait("@patchSessionAnswer");

      // Q3: multi choice
      cy.get('[data-test="question-index-type"]').should("contain", "Q.3");
      cy.get('[data-test="optionSelector-0"]').click();
      cy.get('[data-test="optionSelector-1"]').click();
      cy.get('[data-test="submitButton"]').click();
      cy.wait("@patchSessionAnswer");

      // Q4: single choice
      cy.get('[data-test="question-index-type"]').should("contain", "Q.4");
      cy.get('[data-test="optionSelector-2"]').click();
      cy.get('[data-test="submitButton"]').click();
      cy.wait("@patchSessionAnswer");

      // Q5: matrix rating - select all 5 rows
      cy.get('[data-test="question-index-type"]').should("contain", "Q.5");
      cy.get('[data-test="matrixRatingContainer"]').should("be.visible");
      cy.get('[data-test="matrixRatingSelector-0-2"]').first().click();
      cy.get('[data-test="matrixRatingSelector-1-1"]').first().click();
      cy.get('[data-test="matrixRatingSelector-2-0"]').first().click();
      cy.get('[data-test="matrixRatingSelector-3-4"]').first().click();
      cy.get('[data-test="matrixRatingSelector-4-3"]').first().click();
      cy.get('[data-test="submitButton"]').click();
      cy.wait("@patchSessionAnswer");

      // Q6: matrix numerical
      cy.get('[data-test="question-index-type"]').should("contain", "Q.6");
    });
  });
});
