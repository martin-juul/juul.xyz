describe("Projects page", () => {
  it("successfully loads", () => {
    cy.visit("/projects");
  });

  it("looks inside <title> tag", () => {
    cy.get("head title").should("contain", "Projects | Juul");
  });

  it("has hero", () => {
    cy.get("h1").contains("Projects");
  });
});
