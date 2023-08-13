function acceptTimes() {
  cy.shadowFind('final-round', '[name="accept"]')
    .click()
}


describe('Final Round', () => {
  beforeEach(() => {
    cy.moveToFinalRound()

    cy.shadowFind('final-round', 'h1')
      .contains('Finals')

    cy.shadowFind('final-round', 'p')
      .contains('For the Finals, the')

    cy.shadowFind('final-round', 'button[name="continue"]')
      .should('exist')
      .click()
    
    cy.shadowFind('final-round', '#timer', 'pre')
      .contains('Ready')
  })

  it('Allows for each heat to be recorded from start to finish', () => {
    // Heat 1
    cy.shadowFind('final-round', 'final-heat', '#heat-1')
      .contains('Heat 1')
    cy.simulateHeat(6)
    acceptTimes()

    // Heat 2
    cy.shadowFind('final-round', 'final-heat', '#heat-2')
      .contains('Heat 2')
    cy.simulateHeat(6)
    acceptTimes()

    // Heat 3
    cy.shadowFind('final-round', 'final-heat', '#heat-3')
      .contains('Heat 3')
    cy.simulateHeat(6)
    acceptTimes()

    // Heat 4
    cy.shadowFind('final-round', 'final-heat', '#heat-4')
      .contains('Heat 4')
    cy.simulateHeat(6)
    acceptTimes()

    // Heat 5
    cy.shadowFind('final-round', 'final-heat', '#heat-5')
      .contains('Heat 5')
    cy.simulateHeat(6)
    acceptTimes()

    // Heat 6
    cy.shadowFind('final-round', 'final-heat', '#heat-6')
      .contains('Heat 6')
    cy.simulateHeat(6)
    acceptTimes()

    cy.location('pathname').should('eq', '/cars/')
  })

  it('reloading the page shows the same results as before', () => {
    cy.seedDBAll('finals')

    cy.reload()
    cy.fixture('multi__finals').then(({ finals }) => {
      Object.entries(finals.heat).forEach(([heat, laneData]) => {
        Object.entries(laneData).forEach(([lane, { name, time }]) => {
          cy.shadowFind('final-round', `final-heat[round="3"][heat="${heat}"]`, `section#heat-${heat} #lane-${lane}`)
            .invoke('text')
            .should('contain', name)
            .should('contain', time)
        })
      })
    })

    cy.shadowFind('final-round', '#timer', 'button[name="see-results"]')
      .contains('See Results')
      .click()
    
    cy.location('pathname').should('eq', '/cars/')
  })

  it('can call for a redo of a if the need arises', () => {
    // Heat 1
    cy.simulateHeat(6)
    acceptTimes()

    // Heat 2
    cy.simulateHeat(5) // two lane is missing

    cy.shadowFind('final-round', 'final-heat').should('have.length', 2)


    // should accept new values from server if not accepted yet
    // Heat 2 redo
    cy.simulateHeat(6)

    cy.shadowFind('final-round', '[name="restart"]')
      .contains('Redo Race')
      .click()

    cy.shadowFind('final-round', 'final-heat').should('have.length', 2)

    cy.simulateHeat(6)
    acceptTimes()

    cy.shadowFind('final-round', 'final-heat').should('have.length', 3)
  })
})
