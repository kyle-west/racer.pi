describe('Lane Time Editing', () => {
  beforeEach(() => {
    cy.moveToRound1()
    cy.shadowFind('round-one', 'button[name="continue"]')
      .should('exist')
      .click()
    cy.shadowFind('round-one', 'elimination-round', '#timer')
      .contains('Ready')
  })

  it('fills in a missing lane to complete a race', () => {
    // Simulate 5 of 6 lanes — lane 6 is the car that fell off the track
    cy.simulateHeat(5)
    cy.shadowFind('round-one', 'elimination-round', '#heat-1-lane-1-time')
      .should('not.be.empty')

    // Fill in the missing lane 6 — race should complete and Accept should appear
    cy.shadowFind('round-one', 'elimination-round', '[name="accept"]')
      .should('have.class', 'hidden')
    cy.shadowFind('round-one', 'elimination-round', 'button[name="edit-lane"][data-lane="6"]')
      .click()
    cy.shadowFind('round-one', 'elimination-round', '[name="edit-time"]')
      .clear().type('9.999')
    cy.shadowFind('round-one', 'elimination-round', 'button[name="confirm-edit"]').click()
    cy.shadowFind('round-one', 'elimination-round', '[name="accept"]')
      .should('not.have.class', 'hidden')
  })

  it('edits a live lane time and marks it with an asterisk', () => {
    cy.simulateHeat(6)
    cy.shadowFind('round-one', 'elimination-round', '#heat-1-lane-1-time')
      .should('not.be.empty')

    cy.shadowFind('round-one', 'elimination-round', 'button[name="edit-lane"][data-lane="1"]')
      .click()
    cy.shadowFind('round-one', 'elimination-round', '[name="edit-time"]')
      .clear().type('5.555')
    cy.shadowFind('round-one', 'elimination-round', 'button[name="confirm-edit"]').click()
    cy.shadowFind('round-one', 'elimination-round', '#heat-1-lane-1-time')
      .should('contain', '5.555')
      .should('have.attr', 'data-manual', 'true')
  })
})
