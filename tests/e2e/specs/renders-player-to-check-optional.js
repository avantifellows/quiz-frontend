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

      cy.intercept("PATCH", "/session_answers/**", { body: {} }).as(
        "patchSessionAnswerRequest"
      );
      cy.intercept("PATCH", "/sessions/*", { body: { timeRemaining: 100 } });

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
        // jump to question index 12
        cy.get('[data-test="togglePaletteButton"]').trigger("click");
        cy.get('[data-test="paletteItem-12"]').trigger("click");

        // question 12
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .trigger("click");
        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");

        // question 13
        cy.get('[data-test="modal"]')
          .get('[data-test="question-index-type')
          .should("have.text", "Q.14 | Multiple Answer");
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .trigger("click");
        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");

        // question 14
        cy.get('[data-test="modal"]')
          .get('[data-test="question-index-type')
          .should("have.text", "Q.15 | Multiple Answer");
        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .trigger("click");
        cy.get('[data-test="modal"]')
          .get('[data-test="saveAndNextButton"]')
          .trigger("click");
      });

      it("cannot select answer for question once optional limit reached", () => {
        cy.get('[data-test="modal"]')
          .get('[data-test="question-index-type')
          .should("have.text", "Q.16 | Single Choice");
        cy.get('[data-test="togglePaletteButton"]').trigger("click");
        cy.get('[data-test="paletteItem-15"]').trigger("click");

        cy.get('[data-test="modal"]')
          .get('[data-test="optionSelector-0"]')
          .should("be.disabled");
      });

      it("clear answer for already-answered question to attempt different question in optional set", () => {
        // pick 3rd question in 2nd qset
        cy.get('[data-test="modal"]')
          .get('[data-test="question-index-type')
          .should("have.text", "Q.16 | Single Choice");
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
        cy.get('[data-test="modal"]')
          .get('[data-test="question-index-type')
          .should("have.text", "Q.16 | Single Choice");
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
          "Question Set 1 DescriptionYou may attempt only up to 3 questions in this section."
        );
      });

      it("check if scorecard eventually becomes visible", () => {
        // Remove or hide any toast notifications
        cy.get(".Vue-Toastification__toast-body").should("not.exist");

        // Interact with the endTestButton
        cy.get('[data-test="modal"]')
          .find('[data-test="endTestButton"]')
          .click();

        // Additional check to ensure the button click was successful
        cy.get('[data-test="modal"]')
          .find('[data-test="endTestButton"]')
          .click();

        // Wait for the scorecard to become visible
        cy.get('[data-test="scorecard"]').should("be.visible");

        // Verify the text of the metricValue-2
        cy.get('[data-test="scorecard"]')
          .find('[data-test="metricValue-2"]')
          .should("have.text", "12"); // Ensure the text is a string
      });
    });
  });
});
