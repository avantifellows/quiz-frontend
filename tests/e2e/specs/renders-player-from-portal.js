describe("Player from Portal", () => {
  beforeEach(() => {
    cy.intercept("GET", Cypress.env("backend") + "/quiz/*", {
      fixture: "assessment_quiz.json",
    });

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

    cy.intercept("GET", "**/auth/verify", {
      fixture: "portal_auth_verify.json",
    });

    cy.visit("/quiz/abcd?apiKey=pqr&fromPortal=true", {
      onBeforeLoad(win) {
        win.localStorage.setItem("access_token", "portal-access-token");
        win.localStorage.setItem("refresh_token", "portal-refresh-token");
      },
    });
  });

  it("shows portal display id without a whitelisted query userId", () => {
    cy.get('[data-test="startQuiz"]').trigger("click");
    cy.get('[data-test="user-id"]').should("contain", "STU-001");
  });

  it("shows logout in palette and redirects to portal session URL", () => {
    cy.get('[data-test="startQuiz"]').trigger("click");
    cy.get('[data-test="togglePaletteButton"]').trigger("click");

    cy.get('[data-test="portalLogoutButton"]')
      .find('[data-test="title"]')
      .should("have.text", "Logout");

    cy.get('[data-test="portalLogoutButton"]').trigger("click");

    cy.window().then((win) => {
      expect(win.__portalLogoutUrl).to.contain("sessionId=portal_group_1_abcd");
      expect(win.localStorage.getItem("access_token")).to.eq(null);
      expect(win.localStorage.getItem("refresh_token")).to.eq(null);
    });
  });
});
