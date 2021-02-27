describe.only("Home page", () => {
  it("successfully loads", () => {
    cy.visit("/");
  });

  it("looks inside <title> tag", () => {
    cy.get("head title").should("contain", "Juul");
  });

  it("has correct h1", () => {
    cy.get("h1").contains("Hi! I'm Martin");
  });

  it("has career section", () => {
    cy.get("h2").contains("Career");
  });
});
