function acceptTimes() {
  cy.shadowFind('round-two', 'elimination-round', '[name="accept"]')
    .click()
}


describe('Second Elimination Round', () => {
  beforeEach(() => {
    cy.moveToRound2()

    cy.shadowFind('round-two', 'h1')
      .contains('Second Elimination Round')

    cy.shadowFind('round-two', 'p')
      .contains('All the cars with one loss will be run in heats again')

    cy.shadowFind('round-two', 'button[name="continue"]')
      .should('exist')
      .click()
    
    cy.shadowFind('round-two', 'elimination-round', '#timer')
      .contains('Ready')
  })

  it('Allows for each heat to be recorded from start to finish', () => {
    // Heat 1
    cy.shadowFind('round-two', 'elimination-round', '#heat-1')
      .contains('Heat 1')
    cy.simulateHeat(6)
    acceptTimes()

    // Heat 2
    cy.shadowFind('round-two', 'elimination-round', '#heat-2')
      .contains('Heat 2')
    cy.simulateHeat(6)
    acceptTimes()

    // Heat 3
    cy.shadowFind('round-two', 'elimination-round', '#heat-3')
      .contains('Heat 3')
    cy.simulateHeat(4)

    acceptTimes()

    cy.shadowFind('final-round', 'h1')
      .contains('Finals')
  })

  it('reloading the page shows the same results as before', () => {
    cy.seedDBAll('round2')

    cy.reload()
    cy.fixture('multi__round2').then(({ races }) => {
      const round = races.round[2]
      Object.entries(round.heat).forEach(([heat, laneData]) => {
        Object.entries(laneData).forEach(([lane, { name, time }]) => {
          cy.shadowFind('round-two', 'elimination-round', `#heat-${heat}-lane-${lane}`)
            .invoke('text')
            .should('contain', name)
            .should('contain', time)
        })
      })
    })

    // clicking "Go to next round" should take us to the finals
    cy.shadowFind('round-two', 'elimination-round', 'button[name="accept"]')
      .contains('Go to Next Round')
      .click()
    cy.shadowFind('final-round', 'h1')
      .contains('Finals')
  })

  it('can call for a redo of a if the need arises', () => {
    // Heat 1
    cy.simulateHeat(6)
    acceptTimes()

    // Heat 2
    cy.simulateHeat(5) // two lane is missing

    cy.shadowFind('round-two', 'elimination-round', '#heats')
      .invoke('text')
      .should('contain', 'Heat 1')
      .should('contain', 'Heat 2')
      .should('not.contain', 'Heat 3')


    // should accept new values from server if not accepted yet
    // Heat 2 redo
    cy.simulateHeat(6)

    cy.shadowFind('round-two', 'elimination-round', '[name="restart"]')
      .contains('Redo Race')
      .click()

    cy.shadowFind('round-two', 'elimination-round', '#heats')
      .invoke('text')
      .should('contain', 'Heat 1')
      .should('contain', 'Heat 2')
      .should('not.contain', 'Heat 3')

    cy.simulateHeat(6)
    acceptTimes()

    cy.shadowFind('round-two', 'elimination-round', '#heats')
      .invoke('text')
      .should('contain', 'Heat 1')
      .should('contain', 'Heat 2')
      .should('contain', 'Heat 3')
  })
})
