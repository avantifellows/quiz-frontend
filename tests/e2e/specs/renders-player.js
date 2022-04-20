// https://docs.cypress.io/api/introduction/api.html

describe("Player", () => {
  it("shows 404 error page when quiz ID not provided", () => {
    cy.visit("/");
    // we should be redirected to 404 error page
    cy.url().should("include", "/404-not-found");
  });
  describe("Quiz ID provided", () => {
    beforeEach(() => {
      // stub the response to /quiz/{quizId}
      cy.intercept("GET", "/quiz/*", {
        fixture: "quiz.json",
      });

      cy.visit("/abcd");
    });
    it("shows splash screen", () => {
      cy.get('[data-test="splash"]').should("exist");
      cy.get('[data-test="modal"]').should("not.exist");
      cy.get('[data-test="startQuiz"]').should("exist");
    });

    it("shows modal upon clicking start button on splash screen", () => {
      cy.get('[data-test="startQuiz"]').trigger("click");
      cy.get('[data-test="splash"]').should("not.exist");
      cy.get('[data-test="modal"]').should("exist");
    });

    it("neither splash screen nor modal shown when all questions are answered", () => {
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
    });
  });
});
