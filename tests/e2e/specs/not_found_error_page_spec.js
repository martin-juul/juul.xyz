describe.only("Not found error page", () => {
  it("successfully loads", () => {
    cy.visit("/foobar");
  });

  it("has correct h1", () => {
    cy.get("h1").contains("Sorry. This page does not exist.");
  });

  it("link to homepage", () => {
    cy.get("#go-to-home-link");
  });
});
