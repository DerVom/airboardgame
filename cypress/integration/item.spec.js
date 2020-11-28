describe("Item interactions", () => {
  beforeEach(() => {
    cy.viewport(1000, 600);
    cy.visit("/");
    cy.contains("Test Game").parent().find(".button").click();
    // Way board loading
    cy.get(".board-pane").should(
      "have.css",
      "transform",
      "matrix(1, 0, 0, 1, 0, -200)"
    );
    cy.get(".item")
      .first()
      .children()
      .first()
      .should("have.css", "transform", "none");
  });

  it("should move item", () => {
    cy.get("img[src='/games/JC.jpg']")
      .parents(".item")
      .parent()
      .should("have.css", "transform", "matrix(1, 0, 0, 1, 420, 400)");

    // Select card
    cy.get("img[src='/games/JC.jpg']")
      .parents(".item")
      .click(500, 500, { force: true });

    cy.get("img[src='/games/JC.jpg']")
      .parents(".item")
      .trigger("pointerdown", {
        pointerId: 43,
        buttons: 1,
        clientX: 500,
        clientY: 500,
        force: true,
        isPrimary: true,
      })
      .trigger("pointermove", {
        pointerId: 43,
        buttons: 1,
        clientX: 600,
        clientY: 537,
        force: true,
        isPrimary: true,
      })
      .trigger("pointerup", {
        pointerId: 43,
        button: 1,
        force: true,
        isPrimary: true,
      });
    cy.get("img[src='/games/JC.jpg']")
      .parents(".item")
      .parent()
      .should("have.css", "transform", "matrix(1, 0, 0, 1, 520, 437)");
  });

  it("should flip item", () => {
    // Check before
    cy.get("img[src='/games/JC.jpg']")
      .siblings("img[src='/games/Red_back.jpg']")
      .should("have.css", "opacity", "0");
    cy.get("img[src='/games/JC.jpg']").should("have.css", "opacity", "1");

    // Select card
    cy.get("img[src='/games/JC.jpg']")
      .parents(".item")
      .click(500, 500, { force: true });

    cy.get('[title = "Reveal/Hide"]').click({ force: true });

    // Check after
    cy.get("img[src='/games/JC.jpg']").should("have.css", "opacity", "0");
    cy.get("img[src='/games/JC.jpg']")
      .siblings("img[src='/games/Red_back.jpg']")
      .should("have.css", "opacity", "1");
  });

  it("should tap item", () => {
    // Check before
    cy.get("img[src='/games/JC.jpg']")
      .parents(".item")
      .should("have.css", "transform", "matrix(1, 0, 0, 1, 0, 0)");

    // Select card
    cy.get("img[src='/games/JC.jpg']")
      .parents(".item")
      .click(500, 500, { force: true });

    cy.get('[title = "Tap/Untap"]').click({ force: true });

    // Check after
    cy.get("img[src='/games/JC.jpg']")
      .parents(".item")
      .should(
        "have.css",
        "transform",
        "matrix(6.12323e-17, 1, -1, 6.12323e-17, 0, 0)"
      );
  });
});
