describe('Welcome Page', () => {
  it('Landing page Renders', () => {
    cy.moveToWelcomePage()

    cy.get('welcome-message').shadow()
      .find('button')
      .should('exist')
      .click()
  })
})

describe('Racer Config Page', () => {
  it('Allows user to enter cars', () => {
    cy.moveToRacersPage()

    cy.fixture('racers').then((racers) => {
      for (let i = 1; i < racers.length; ++i) {
        cy.get('car-group').shadow().find('button[name="add-car"]').click()
      }
      cy.get('car-group').shadow().find('li').each(($el, idx) => {

        cy.wrap($el)
          .find('input[name="car-name"]')
          .should('exist')
          .type(racers[idx].name)

          cy.wrap($el)
          .find('input[name="car-weight"]')
          .should('exist')
          .type(racers[idx].weight, {force: true})
      })
    })

    cy.get('car-group').shadow()
      .find('button[name="start-race"]')
      .should('exist')
      .click()

    cy.get('round-one').shadow()
      .find('h1')
      .contains('First Elimination Round')
  })
})

describe('First Elimination Round', () => {
  it('Prompts rules', () => {
    cy.moveToRound1()

    cy.get('round-one').shadow()
      .find('h1')
      .contains('First Elimination Round')

    cy.get('round-one').shadow()
      .find('p')
      .contains('Racing will take place on a 6-lane track, with cars randomly chosen to race in heats. The first 3 cars that finish')

    cy.get('round-one').shadow()
      .find('elimination-round')
      .find('button[name="continue"]')
      .should('exist')
      .click()

    cy.get('round-one').shadow()
      .find('elimination-round').shadow()
      .find('#timer')
      .contains('Ready')
  })
})