describe("Player for Assessment quizzes", () => {
  beforeEach(() => {
    // stub the response to /quiz/{quizId}
    cy.intercept("GET", Cypress.env("backend") + "/quiz/*", {
      fixture: "multi_qset_quiz.json", // 2 question sets -- each has 12 questions
      // in set 1 -- all questions can be answered
      // in set 2 -- only upto 3 questions can be answered
    });
  });

  describe("New Session", () => {
    beforeEach(() => {
      // stub the response to /sessions
      cy.intercept("POST", "/sessions/", {
        fixture: "new_session_for_multiset_quiz.json", // 24 session answers
        // of which 3 are answered (first 3 questions in 2nd qset)
      });

      cy.intercept("PATCH", "/session_answers/**", {});
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

    describe("Quiz Started", () => {
      beforeEach(() => {
        cy.get("@startQuizButton").trigger("click");
      });

      it("cannot select answer for question once optional limit reached", () => {
        cy.get('[data-test="togglePaletteButton"]').trigger("click");
        cy.get('[data-test="paletteItem-15"]').trigger("click"); // 12, 13, 14 answered in 2nd qset

        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .should("be.disabled");
      });

      it("clear answer for already-answered question to attempt different question in optional set", () => {
        // pick 3rd question in 2nd qset
        cy.get('[data-test="togglePaletteButton"]').trigger("click");
        cy.get('[data-test="paletteItem-14"]').trigger("click");

        // clear the answer and save
        cy.get('[data-test="modal"]')
          .get('[data-test="clearButton"]')
          .trigger("click");

        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");

        // now go to 4th question in 2nd qset
        cy.get('[data-test="togglePaletteButton"]').trigger("click");
        cy.get('[data-test="paletteItem-15"]').trigger("click");

        // option can be selected now!
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .should("not.be.disabled");

        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .trigger("click");

        // can submit the answer!
        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");
      });

      it("question palette shows title and instruction for 2nd qset", () => {
        cy.get('[data-test="togglePaletteButton"]').trigger("click");

        cy.get('[data-test="paletteTitle-1"').should("exist");
        cy.get('[data-test="paletteTitle-1"').should(
          "have.text",
          "Question Set 1"
        );

        cy.get('[data-test="paletteInstruction-1"').should("exist");
        cy.get('[data-test="paletteInstruction-1"').should(
          "have.text",
          "You may attempt only up to 3 questions in this section."
        );
      });

      it("once scorecard displayed, number of skipped questions should not consider optional questions", () => {
        cy.get('[data-test="modal"]')
          .get('[data-test="endTestButton"]')
          .trigger("click");

        // additional click to protect endTest button
        cy.get('[data-test="modal"]')
          .get('[data-test="endTestButton"]')
          .trigger("click");

        cy.get('[data-test="scorecard"]')
          .get('[data-test="metricValue-2"]')
          .should("have.text", 12); // 12 in first qset, none in 2nd qset
      });
    });
  });
});
