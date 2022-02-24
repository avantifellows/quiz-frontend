// https://docs.cypress.io/api/introduction/api.html

describe("Player", () => {
  it("shows header buttons", () => {
    cy.visit("/");
    cy.get('[data-test="header"]')
      .get('[data-test="skip"]')
      .should("have.text", "Skip");
  });
});
