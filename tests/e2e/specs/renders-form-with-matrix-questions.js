describe("Form with Matrix Questions Tests", () => {
  beforeEach(() => {
    // stub the response to /form/{formId}
    cy.intercept("GET", Cypress.env("backend") + "/form/*", {
      fixture: "form_questionnaire.json",
    });

    // stub the response to /sessions
    cy.intercept("POST", "/sessions/", {
      fixture: "new_form_session.json",
    });

    cy.intercept("PATCH", "/session_answers/**", { status: 200 }).as(
      "patchSessionAnswerRequest"
    );
    cy.intercept("PATCH", "/sessions/*", { body: { timeRemaining: 1800 } });

    cy.intercept(
      "GET",
      Cypress.env("backend") + "/organizations/authenticate/*",
      {
        fixture: "org_authentication.json",
      }
    );
    cy.visit("/form/form_quiz_123456?userId=1&apiKey=pqr");
  });

  it("should render and interact with matrix rating questions", () => {
    // Start the form
    cy.get('[data-test="splash"]').should("be.visible");
    cy.get('[data-test="startQuiz"]').click();

    // Wait for the first question to load
    cy.get('[data-test="body"]').should("be.visible");

    // Fill out first 4 questions to get to matrix rating question (question 5)
    // Question 1: subjective
    cy.get('[data-test="subjectiveAnswer"]').type("John Doe");
    cy.get('[data-test="submitButton"]').click();
    cy.wait(500);

    // Question 2: single choice
    cy.get('[data-test="optionSelector-1"]').click(); // PCB
    cy.get('[data-test="submitButton"]').click();
    cy.wait(500);

    // Question 3: multi choice
    cy.get('[data-test="optionSelector-0"]').click(); // Maths
    cy.get('[data-test="optionSelector-1"]').click(); // English
    cy.get('[data-test="submitButton"]').click();
    cy.wait(500);

    // Question 4: single choice
    cy.get('[data-test="optionSelector-2"]').click(); // Because these subjects have more career options
    cy.get('[data-test="submitButton"]').click();
    cy.wait(500);

    // Check that we're on the matrix rating question
    cy.get('[data-test="matrixRatingContainer"]').should("be.visible");
    cy.get('[data-test="question-index-type"]').should("contain", "Q.5");

    // Test matrix rating interactions - Fill all 5 rows (Math, Physics, Chemistry, Biology, English)
    cy.get('[data-test="matrixRatingSelector-0-2"]')
      .filter(":visible")
      .first()
      .click(); // Math - Option 3
    cy.get('[data-test="matrixRatingSelector-1-1"]')
      .filter(":visible")
      .first()
      .click(); // Physics - Option 2
    cy.get('[data-test="matrixRatingSelector-2-0"]')
      .filter(":visible")
      .first()
      .click(); // Chemistry - Option 1
    cy.get('[data-test="matrixRatingSelector-3-4"]')
      .filter(":visible")
      .first()
      .click(); // Biology - Option 5
    cy.get('[data-test="matrixRatingSelector-4-3"]')
      .filter(":visible")
      .first()
      .click(); // English - Option 4

    // Verify selections are made
    cy.get('[data-test="matrixRatingSelector-0-2"]')
      .filter(":visible")
      .first()
      .should("be.checked");
    cy.get('[data-test="matrixRatingSelector-1-1"]')
      .filter(":visible")
      .first()
      .should("be.checked");
    cy.get('[data-test="matrixRatingSelector-2-0"]')
      .filter(":visible")
      .first()
      .should("be.checked");
    cy.get('[data-test="matrixRatingSelector-3-4"]')
      .filter(":visible")
      .first()
      .should("be.checked");
    cy.get('[data-test="matrixRatingSelector-4-3"]')
      .filter(":visible")
      .first()
      .should("be.checked");

    // Move to next question (matrix numerical)
    cy.get('[data-test="submitButton"]').click();
  });

  it("should render and interact with matrix numerical questions", () => {
    // Start the form and navigate to matrix numerical question (question 6)
    cy.get('[data-test="splash"]').should("be.visible");
    cy.get('[data-test="startQuiz"]').click();

    // Fill out first 5 questions to get to matrix numerical question (question 6)
    // Question 1: subjective
    cy.get('[data-test="subjectiveAnswer"]').type("John Doe");
    cy.get('[data-test="submitButton"]').click();
    cy.wait(500);

    // Question 2: single choice
    cy.get('[data-test="optionSelector-1"]').click(); // PCB
    cy.get('[data-test="submitButton"]').click();
    cy.wait(500);

    // Question 3: multi choice
    cy.get('[data-test="optionSelector-0"]').click(); // Maths
    cy.get('[data-test="optionSelector-1"]').click(); // English
    cy.get('[data-test="submitButton"]').click();
    cy.wait(500);

    // Question 4: single choice
    cy.get('[data-test="optionSelector-2"]').click(); // Because these subjects have more career options
    cy.get('[data-test="submitButton"]').click();
    cy.wait(500);

    // Question 5: matrix rating - answer all rows
    cy.get('[data-test="matrixRatingSelector-0-2"]')
      .filter(":visible")
      .first()
      .click(); // Math
    cy.get('[data-test="matrixRatingSelector-1-1"]')
      .filter(":visible")
      .first()
      .click(); // Physics
    cy.get('[data-test="matrixRatingSelector-2-0"]')
      .filter(":visible")
      .first()
      .click(); // Chemistry
    cy.get('[data-test="matrixRatingSelector-3-4"]')
      .filter(":visible")
      .first()
      .click(); // Biology
    cy.get('[data-test="matrixRatingSelector-4-3"]')
      .filter(":visible")
      .first()
      .click(); // English
    cy.get('[data-test="submitButton"]').click();
    cy.wait(500);

    // Check that we're on the matrix numerical question
    cy.get('[data-test="matrixNumericalContainer"]').should("be.visible");
    cy.get('[data-test="question-index-type"]').should("contain", "Q.6");

    // Test matrix numerical inputs - Fill all 6 rows (Math, Physics, Chemistry, Biology, English, Overall)
    cy.get('[data-test="matrixNumericalInput-0"]').type("85"); // Math
    cy.get('[data-test="matrixNumericalInput-1"]').type("78"); // Physics
    cy.get('[data-test="matrixNumericalInput-2"]').type("92"); // Chemistry
    cy.get('[data-test="matrixNumericalInput-3"]').type("88"); // Biology
    cy.get('[data-test="matrixNumericalInput-4"]').type("90"); // English
    cy.get('[data-test="matrixNumericalInput-5"]').type("85"); // Overall

    // Verify values are entered
    cy.get('[data-test="matrixNumericalInput-0"]').should("have.value", "85");
    cy.get('[data-test="matrixNumericalInput-1"]').should("have.value", "78");
    cy.get('[data-test="matrixNumericalInput-2"]').should("have.value", "92");
    cy.get('[data-test="matrixNumericalInput-3"]').should("have.value", "88");
    cy.get('[data-test="matrixNumericalInput-4"]').should("have.value", "90");
    cy.get('[data-test="matrixNumericalInput-5"]').should("have.value", "85");

    // Move to next question
    cy.get('[data-test="submitButton"]').click();
  });

  it("should complete the entire form and show scorecard", () => {
    // Start the form
    cy.get('[data-test="splash"]').should("be.visible");
    cy.get('[data-test="startQuiz"]').click();

    // Fill out first question (subjective)
    cy.get('[data-test="body"]').should("be.visible");
    cy.get('[data-test="subjectiveAnswer"]')
      .should("be.visible")
      .type("John Doe");
    cy.get('[data-test="submitButton"]').should("not.be.disabled").click();
    cy.wait(1000);

    // Fill out second question (single choice)
    cy.get('[data-test="body"]').should("be.visible");
    cy.get('[data-test="optionSelector-1"]').should("be.visible").click(); // PCB
    cy.get('[data-test="submitButton"]').should("not.be.disabled").click();
    cy.wait(1000);

    // Fill out third question (multi choice)
    cy.get('[data-test="body"]').should("be.visible");
    cy.get('[data-test="optionSelector-0"]').should("be.visible").click(); // Maths
    cy.get('[data-test="optionSelector-1"]').should("be.visible").click(); // English
    cy.get('[data-test="submitButton"]').should("not.be.disabled").click();
    cy.wait(1000);

    // Fill out fourth question (single choice)
    cy.get('[data-test="body"]').should("be.visible");
    cy.get('[data-test="optionSelector-2"]').should("be.visible").click(); // Because these subjects have more career options
    cy.get('[data-test="submitButton"]').should("not.be.disabled").click();
    cy.wait(1000);

    // Fill out matrix rating question - ALL 5 rows required (Math, Physics, Chemistry, Biology, English)
    cy.get('[data-test="body"]').should("be.visible");
    cy.get('[data-test="matrixRatingContainer"]').should("be.visible");
    cy.get('[data-test="matrixRatingSelector-0-2"]')
      .filter(":visible")
      .first()
      .should("be.visible")
      .click(); // Math
    cy.get('[data-test="matrixRatingSelector-1-1"]')
      .filter(":visible")
      .first()
      .should("be.visible")
      .click(); // Physics
    cy.get('[data-test="matrixRatingSelector-2-0"]')
      .filter(":visible")
      .first()
      .should("be.visible")
      .click();
    cy.get('[data-test="matrixRatingSelector-3-4"]')
      .filter(":visible")
      .first()
      .should("be.visible")
      .click(); // Biology
    cy.get('[data-test="matrixRatingSelector-4-3"]')
      .filter(":visible")
      .first()
      .should("be.visible")
      .click(); // English
    cy.get('[data-test="submitButton"]').should("not.be.disabled").click();
    cy.wait(1000);

    // Fill out matrix numerical question - ALL 6 rows required (Math, Physics, Chemistry, Biology, English, Overall)
    cy.get('[data-test="body"]').should("be.visible");
    cy.get('[data-test="matrixNumericalContainer"]').should("be.visible");
    cy.get('[data-test="matrixNumericalInput-0"]')
      .should("be.visible")
      .type("85"); // Math
    cy.get('[data-test="matrixNumericalInput-1"]')
      .should("be.visible")
      .type("78"); // Physics
    cy.get('[data-test="matrixNumericalInput-2"]')
      .should("be.visible")
      .type("92"); // Chemistry
    cy.get('[data-test="matrixNumericalInput-3"]')
      .should("be.visible")
      .type("88"); // Biology
    cy.get('[data-test="matrixNumericalInput-4"]')
      .should("be.visible")
      .type("90"); // English
    cy.get('[data-test="matrixNumericalInput-5"]')
      .should("be.visible")
      .type("85"); // Overall
    cy.get('[data-test="submitButton"]').should("not.be.disabled").click();
    cy.wait(1000);

    // Fill out seventh question (subjective)
    cy.get('[data-test="body"]').should("be.visible");
    cy.get('[data-test="subjectiveAnswer"]')
      .should("be.visible")
      .type("Doctor");
    cy.get('[data-test="submitButton"]').should("not.be.disabled").click();
    cy.wait(1000);

    // Fill out last question (subjective)
    cy.get('[data-test="body"]').should("be.visible");
    cy.get('[data-test="subjectiveAnswer"]')
      .should("be.visible")
      .type("Great service!");
    cy.get('[data-test="submitButton"]').should("not.be.disabled").click();
    cy.wait(1000);

    // The form should automatically end and show scorecard with completion message
    cy.get('[data-test="scorecard"]').should("be.visible");
    cy.get('[data-test="scorecard"]').should(
      "contain",
      "Thank you for completing the questionnaire!"
    );

    // Should show completion message instead of share button since show_scores is false
    cy.get('[data-test="scorecard"]').should(
      "contain",
      "Thanks for completing the questionnaire! You may close this window."
    );

    // Should not show share button when show_scores is false
    cy.get('[data-test="share"]').should("not.exist");

    // Should not show proceed button when there's no next step URL
    cy.get('[data-test="proceed-next"]').should("not.exist");
  });

  // it("should not show OMR mode for forms even if omrMode=true", () => {
  //   // Visit with omrMode parameter
  //   cy.visit("/form/form_quiz_123456?userId=1&apiKey=pqr&omrMode=true");

  //   cy.get('[data-test="splash"]').should("be.visible");
  //   cy.get('[data-test="startQuiz"]').click();

  //   // Should still show regular QuestionModal, not SinglePageModal
  //   cy.get('[data-test="body"]').should("be.visible");
  //   cy.get('[data-test="omr-modal"]').should("not.exist");

  //   // Should not show OMR toggle button
  //   cy.get('[data-test="toggleOmrMode"]').should("not.exist");
  // });
});
