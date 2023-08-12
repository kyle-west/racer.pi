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


Cypress.Commands.add('seedDB', (target) => {
  cy.fixture(`storage__${target}`).then((data) => {
    cy.window().then((win) => {
      win.localStorage.setItem(target, JSON.stringify(data))
    })
  })
})

Cypress.Commands.add('seedDBAll', (target) => {
  cy.fixture(`multi__${target}`).then((data) => {
    cy.window().then((win) => {
      Object.entries(data).forEach(([db, info]) => {
        win.localStorage.setItem(db, JSON.stringify(info))
      })
    })
  })
})

Cypress.Commands.add('simulateHeat', (numberOfLanes = 6) => {
  const MIN_LANE_TIME=1
  const MAX_LANE_TIME=3

  cy.request({ url: `http://localhost:${Cypress.env('SERVER_PORT')}/gpio/start`, method: 'POST' })
  Array.from({ length: numberOfLanes }, (_, idx) => idx + 1).forEach((lane) => {
    const time = Math.random() * (MAX_LANE_TIME - MIN_LANE_TIME) + MIN_LANE_TIME
    cy.request({ url: `http://localhost:${Cypress.env('SERVER_PORT')}/gpio/time?lane=${lane}&time=${time}`, method: 'POST' })
  })
})

Cypress.Commands.add('moveToRound1', (view) => {
  cy.seedDB('car-group')
  cy.moveToRacersPage()
  cy.get('car-group').shadow()
    .find('button[name="start-race"]')
    .should('exist')
    .click()
})

Cypress.Commands.add('moveToRound1', (view) => {
  cy.seedDB('car-group')
  cy.moveToRacersPage()
  cy.get('car-group').shadow()
    .find('button[name="start-race"]')
    .should('exist')
    .click()
})

Cypress.Commands.add('roundOneAcceptHeatTimes', (view) => {
  cy.get('round-one').shadow()
    .find('elimination-round').shadow()
    .find('[name="accept"]')
    .contains('Accept & Continue')
    .click()
})

Cypress.Commands.add('shadowDrill', (...levels) => {
  let node;
  levels.forEach((level) => {
    node = node ? node.shadow().find(level) : cy.get(level)
  })
  return node;
})
