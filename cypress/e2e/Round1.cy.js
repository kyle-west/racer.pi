function acceptTimes() {
  cy.shadowDrill('round-one', 'elimination-round', '[name="accept"]')
    .click()
}

describe('First Elimination Round', () => {
  beforeEach(() => {
    cy.moveToRound1()

    cy.shadowDrill('round-one', 'h1')
      .contains('First Elimination Round')

    cy.shadowDrill('round-one', 'p')
      .contains('Racing will take place on a 6-lane track, with cars randomly chosen to race in heats. The first 3 cars that finish')

    cy.shadowDrill('round-one', 'button[name="continue"]')
      .should('exist')
      .click()
    
    cy.shadowDrill('round-one', 'elimination-round', '#timer')
      .contains('Ready')
  })

  it('Allows for the first round to be recorded from start to finish', () => {
    // Heat 1
    cy.shadowDrill('round-one', 'elimination-round', '#heat-1')
      .contains('Heat 1')
    cy.simulateHeat(6)
    acceptTimes()

    // Heat 2
    cy.shadowDrill('round-one', 'elimination-round', '#heat-2')
      .contains('Heat 2')
    cy.simulateHeat(6)
    acceptTimes()

    // Heat 3
    cy.shadowDrill('round-one', 'elimination-round', '#heat-3')
      .contains('Heat 3')
    cy.simulateHeat(6)
    acceptTimes()

    // Heat 4
    cy.shadowDrill('round-one', 'elimination-round', '#heat-4')
      .contains('Heat 4')
    cy.simulateHeat(4)

    acceptTimes()

    // accepting the last heat should move us to the next round
    cy.shadowDrill('round-two', 'h1')
      .contains('Second Elimination Round')
  })

  it('reloading the page shows the same results as before', () => {
    cy.seedDBAll('round1')

    cy.reload()
    cy.fixture('multi__round1').then(({ races }) => {
      const round = races.round[1]
      Object.entries(round.heat).forEach(([heat, laneData]) => {
        Object.entries(laneData).forEach(([lane, { name, time }]) => {
          cy.shadowDrill('round-one', 'elimination-round', `#heat-${heat}-lane-${lane}`)
            .invoke('text')
            .should('contain', name)
            .should('contain', time)
        })
      })
    })

    // clicking "Go to next round" should take us to the next round
    cy.shadowDrill('round-one', 'elimination-round', 'button[name="accept"]')
      .contains('Go to Next Round')
      .click()
    cy.shadowDrill('round-two', 'h1')
      .contains('Second Elimination Round')
  })

  it('can call for a redo of a if the need arises', () => {
    // Heat 1
    cy.simulateHeat(6)
    acceptTimes()

    // Heat 2
    cy.simulateHeat(5) // one lane is missing

    cy.shadowDrill('round-one', 'elimination-round', '#heats')
      .invoke('text')
      .should('contain', 'Heat 1')
      .should('contain', 'Heat 2')
      .should('not.contain', 'Heat 3')


    // should accept new values from server if not accepted yet
    // Heat 2 redo
    cy.simulateHeat(6)

    cy.get('round-one').shadow()
      .find('elimination-round').shadow()
      .find('[name="restart"]')
      .contains('Redo Race')
      .click()

    cy.shadowDrill('round-one', 'elimination-round', '#heats')
      .invoke('text')
      .should('contain', 'Heat 1')
      .should('contain', 'Heat 2')
      .should('not.contain', 'Heat 3')

    cy.simulateHeat(6)
    acceptTimes()

    cy.shadowDrill('round-one', 'elimination-round', '#heats')
      .invoke('text')
      .should('contain', 'Heat 1')
      .should('contain', 'Heat 2')
      .should('contain', 'Heat 3')
  })
})
