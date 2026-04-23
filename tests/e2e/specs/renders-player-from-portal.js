describe("Player from Portal", () => {
  const launchToken = "portal-launch-token";

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
    }).as("verifyPortalToken");

    cy.visit(`/quiz/abcd?apiKey=pqr&launchToken=${launchToken}`, {
      onBeforeLoad(win) {
        win.sessionStorage.clear();
      },
    });
  });

  it("strips launchToken from the URL and shows the portal display id", () => {
    cy.wait("@verifyPortalToken");
    cy.location("search").should("eq", "?apiKey=pqr");

    cy.get('[data-test="startQuiz"]').trigger("click");
    cy.get('[data-test="user-id"]').should("contain", "STU-001");

    cy.get('[data-test="togglePaletteButton"]').trigger("click");
    cy.get('[data-test="portalLogoutButton"]').should("not.exist");
  });

  it("restores portal identity on same-tab refresh without the launch token", () => {
    cy.wait("@verifyPortalToken");
    cy.location("search").should("eq", "?apiKey=pqr");

    cy.reload();
    cy.get('[data-test="startQuiz"]').trigger("click");
    cy.get('[data-test="user-id"]').should("contain", "STU-001");
  });
});
