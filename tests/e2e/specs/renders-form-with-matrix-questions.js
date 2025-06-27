describe("Form with Matrix Questions Tests", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.intercept("POST", "**/organizations/authenticate", {
      fixture: "org_authentication.json",
    }).as("getAuthenticatedOrg");

    cy.intercept("GET", "**/quiz/**", {
      fixture: "form_questionnaire.json",
    }).as("getFormQuiz");

    cy.intercept("POST", "**/sessions", {
      fixture: "new_form_session.json",
    }).as("createSession");

    cy.intercept("PUT", "**/sessions/**", {
      statusCode: 200,
      body: { time_remaining: 1800 },
    }).as("updateSession");

    cy.intercept("PUT", "**/session_answers/**", {
      statusCode: 200,
    }).as("updateSessionAnswer");
  });

  it("should render and interact with matrix rating questions", () => {
    // Start the form
    cy.get('[data-test="splash"]').should("be.visible");
    cy.get('[data-test="start-button"]').click();

    // Wait for the first question to load
    cy.get('[data-test="body"]').should("be.visible");

    // Navigate to the matrix rating question (question 5)
    for (let i = 0; i < 4; i++) {
      cy.get('[data-test="next-button"]').click();
      cy.wait(500);
    }

    // Check that we're on the matrix rating question
    cy.get('[data-test="matrixRatingContainer"]').should("be.visible");
    cy.get('[data-test="question-index-type"]').should("contain", "Q.5");

    // Test matrix rating interactions - Fill all 4 rows (Math, Physics, Chemistry, Biology)
    cy.get('[data-test="matrixRatingSelector-0-2"]').click(); // Math - Option 3
    cy.get('[data-test="matrixRatingSelector-1-1"]').click(); // Physics - Option 2
    cy.get('[data-test="matrixRatingSelector-2-0"]').click(); // Chemistry - Option 1
    cy.get('[data-test="matrixRatingSelector-3-4"]').click(); // Biology - Option 5

    // Verify selections are made
    cy.get('[data-test="matrixRatingSelector-0-2"]').should("be.checked");
    cy.get('[data-test="matrixRatingSelector-1-1"]').should("be.checked");
    cy.get('[data-test="matrixRatingSelector-2-0"]').should("be.checked");
    cy.get('[data-test="matrixRatingSelector-3-4"]').should("be.checked");

    // Move to next question (matrix numerical)
    cy.get('[data-test="next-button"]').click();
  });

  it("should render and interact with matrix numerical questions", () => {
    // Start the form and navigate to matrix numerical question (question 6)
    cy.get('[data-test="splash"]').should("be.visible");
    cy.get('[data-test="start-button"]').click();

    // Navigate to the matrix numerical question
    for (let i = 0; i < 5; i++) {
      cy.get('[data-test="next-button"]').click();
      cy.wait(500);
    }

    // Check that we're on the matrix numerical question
    cy.get('[data-test="matrixNumericalContainer"]').should("be.visible");
    cy.get('[data-test="question-index-type"]').should("contain", "Q.6");

    // Test matrix numerical inputs - Fill all 5 rows (Math, Physics, Chemistry, Biology, Overall)
    cy.get('[data-test="matrixNumericalInput-0"]').type("85"); // Math
    cy.get('[data-test="matrixNumericalInput-1"]').type("78"); // Physics
    cy.get('[data-test="matrixNumericalInput-2"]').type("92"); // Chemistry
    cy.get('[data-test="matrixNumericalInput-3"]').type("88"); // Biology
    cy.get('[data-test="matrixNumericalInput-4"]').type("85"); // Overall

    // Verify values are entered
    cy.get('[data-test="matrixNumericalInput-0"]').should("have.value", "85");
    cy.get('[data-test="matrixNumericalInput-1"]').should("have.value", "78");
    cy.get('[data-test="matrixNumericalInput-2"]').should("have.value", "92");
    cy.get('[data-test="matrixNumericalInput-3"]').should("have.value", "88");
    cy.get('[data-test="matrixNumericalInput-4"]').should("have.value", "85");

    // Move to next question
    cy.get('[data-test="next-button"]').click();
  });

  it("should complete the entire form and show scorecard", () => {
    // Start the form
    cy.get('[data-test="splash"]').should("be.visible");
    cy.get('[data-test="start-button"]').click();

    // Fill out first question (subjective)
    cy.get('[data-test="subjectiveAnswer"]').type("John Doe");
    cy.get('[data-test="next-button"]').click();

    // Fill out second question (single choice)
    cy.get('[data-test="optionSelector-1"]').click(); // 18-25
    cy.get('[data-test="next-button"]').click();

    // Fill out third question (multi choice)
    cy.get('[data-test="optionSelector-0"]').click(); // Student
    cy.get('[data-test="optionSelector-1"]').click(); // Working Professional
    cy.get('[data-test="next-button"]').click();

    // Fill out fourth question (single choice)
    cy.get('[data-test="optionSelector-2"]').click(); // Search Engine
    cy.get('[data-test="next-button"]').click();

    // Fill out matrix rating question - ALL 4 rows required (Math, Physics, Chemistry, Biology)
    cy.get('[data-test="matrixRatingSelector-0-2"]').click(); // Math
    cy.get('[data-test="matrixRatingSelector-1-1"]').click(); // Physics
    cy.get('[data-test="matrixRatingSelector-2-0"]').click(); // Chemistry
    cy.get('[data-test="matrixRatingSelector-3-4"]').click(); // Biology
    cy.get('[data-test="next-button"]').click();

    // Fill out matrix numerical question - ALL 5 rows required (Math, Physics, Chemistry, Biology, Overall)
    cy.get('[data-test="matrixNumericalInput-0"]').type("85"); // Math
    cy.get('[data-test="matrixNumericalInput-1"]').type("78"); // Physics
    cy.get('[data-test="matrixNumericalInput-2"]').type("92"); // Chemistry
    cy.get('[data-test="matrixNumericalInput-3"]').type("88"); // Biology
    cy.get('[data-test="matrixNumericalInput-4"]').type("85"); // Overall
    cy.get('[data-test="next-button"]').click();

    // Fill out last question (subjective)
    cy.get('[data-test="subjectiveAnswer"]').type("Great service!");

    // The form should automatically end and show scorecard
    cy.get('[data-test="scorecard"]').should("be.visible");
    cy.get('[data-test="scorecard"]').should(
      "contain",
      "Thank you for completing the questionnaire!"
    );
  });

  it("should not show OMR mode for forms even if omrMode=true", () => {
    // Visit with omrMode parameter
    cy.visit("/?omrMode=true");

    cy.get('[data-test="splash"]').should("be.visible");
    cy.get('[data-test="start-button"]').click();

    // Should still show regular QuestionModal, not OmrModal
    cy.get('[data-test="body"]').should("be.visible");
    cy.get('[data-test="omr-modal"]').should("not.exist");

    // Should not show OMR toggle button
    cy.get('[data-test="toggleOmrMode"]').should("not.exist");
  });
});
