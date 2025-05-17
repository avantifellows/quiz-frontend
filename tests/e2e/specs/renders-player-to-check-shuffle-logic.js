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
      });
      it("Checking if questions are shuffled only within their respective subsets and question sets", () => {
        cy.get('[data-test="togglePaletteButton"]').trigger("click");

        cy.intercept("GET", "/questions/*", {
          fixture: "question_bucket_fetched_multiset.json",
        }).as("question_bucket_call");

        cy.get('[data-test="paletteItem-10"]').trigger("click"); // 11th question

        cy.wait("@question_bucket_call");

        cy.get('[data-test="modal"]')
          .get('[data-test="question-index-type"]')
          .should("have.text", "Q.11 | Numerical");

        cy.get('[data-test="footer"]')
          .get('[data-test="nextQuestionButton"]').trigger("click");

        cy.get('[data-test="modal"]')
          .get('[data-test="question-index-type"]')
          .should("have.text", "Q.12 | Numerical");
      })
      it("Checking if the palette displays question indices in the correct order", () => {
        cy.get('[data-test="togglePaletteButton"]').trigger("click");
        for (let i = 0; i < 24; i++) {
          cy.get(`[data-test="paletteItem-${i}"]`)
            .should("have.text", `${i + 1}`
            );
        }
      });
    });
  });

  describe("Resume Session", () => {
    beforeEach(() => {
      // stub the response to /sessions
      cy.intercept("POST", "/sessions/", {
        fixture: "resume_session_for_multiset_quiz.json",
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
    it("Checking if the shuffled order remains consistent and answers are stored in the correct positions", () => {
      cy.get("@startQuizButton").trigger("click");
      cy.get('[data-test="modal"]')
        .get('[data-test="body"]')
        .get('[data-test="text"]')
        .should("have.text", "Which grade are you in?");
      cy.get('[data-test="optionSelector-0"]')
        .should("be.checked");
      cy.get('[data-test="optionSelector-1"]')
        .should("be.checked");
      cy.get('[data-test="optionSelector-2"]')
        .should("not.be.checked");

      cy.get('[data-test="togglePaletteButton"]').trigger("click");
      cy.get('[data-test="paletteItem-3"]')
        .trigger("click");
      cy.get('textarea[data-test="input"]')
        .should("have.value", "3");
    });
  });
})
