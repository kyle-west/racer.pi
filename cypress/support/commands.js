// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// import '@testing-library/cypress/add-commands'

Cypress.Commands.add('moveToWelcomePage', (view) => {
  cy.visit(`http://localhost:${Cypress.env('SERVER_PORT')}`)
})

Cypress.Commands.add('moveToRacersPage', (view) => {
  cy.moveToWelcomePage()
  cy.get('welcome-message').shadow()
      .find('button')
      .click()
})

Cypress.Commands.add('moveToRound1', (view) => {
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
})