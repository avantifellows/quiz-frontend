// https://docs.cypress.io/api/introduction/api.html

describe("Player", () => {
  beforeEach(() => {
    cy.visit("/");
  });
  it("shows splash screen", () => {
    cy.get('[data-test="splash"]').should("exist");
    cy.get('[data-test="header"]').should("not.exist");
    cy.get('[data-test="startQuiz"]').should("exist");
  });

  it("on click of start button on splash screen", () => {
    cy.get('[data-test="startQuiz"]').trigger("click");
    cy.get('[data-test="splash"]').should("not.exist");
    cy.get('[data-test="header"]').should("exist");
  });
});
