describe("Contact page", () => {
  it("successfully loads", () => {
    cy.visit("/contact");
  });

  it("looks inside <title> tag", () => {
    cy.get("head title").should("contain", "Contact | Juul");
  });
});
