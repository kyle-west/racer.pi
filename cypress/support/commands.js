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

Cypress.Commands.add('shadowFind', (...levels) => {
  let node;
  levels.forEach((level) => {
    node = node ? node.shadow().find(level) : cy.get(level)
  })
  return node;
})

Cypress.Commands.add('seedDB', (target) => {
  cy.fixture(`storage__${target}`).then((data) => {
    cy.window().then((win) => {
      win.localStorage.setItem(target, JSON.stringify(data))
    })
  })
})

Cypress.Commands.add('seedDBAll', (target, filter = (x) => x) => {
  cy.fixture(`multi__${target}`).then((data) => {
    cy.window().then((win) => {
      const filteredData = filter(data)
      Object.entries(filteredData).forEach(([db, info]) => {
        win.localStorage.setItem(db, JSON.stringify(info))
      })
    })
  })
})

Cypress.Commands.add('seedDBRaw', (target, value) => {
  cy.window().then((win) => {
    win.localStorage.setItem(target, JSON.stringify(value))
  })
})

Cypress.Commands.add('moveToHomePage', () => {
  cy.visit(`http://localhost:${Cypress.env('SERVER_PORT')}`)
})
Cypress.Commands.add('moveToCarsPage', () => {
  cy.visit(`http://localhost:${Cypress.env('SERVER_PORT')}/cars`)
})

Cypress.Commands.add('moveToRacersPage', () => {
  cy.moveToHomePage()
  cy.get('welcome-message').shadow()
      .find('button')
      .click()
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

Cypress.Commands.add('moveToRound1', () => {
  cy.seedDB('car-group')
  cy.moveToRacersPage()
  cy.get('car-group').shadow()
    .find('button[name="start-race"]')
    .should('exist')
    .click()
})

Cypress.Commands.add('moveToRound2', () => {
  cy.moveToHomePage()
  cy.seedDBAll('round1')
  cy.reload()
  cy.shadowFind('round-one', 'elimination-round', 'button[name="accept"]')
    .contains('Go to Next Round')
    .click()
})

Cypress.Commands.add('moveToFinalRound', () => {
  cy.moveToHomePage()
  cy.seedDBAll('round2')
  cy.reload()
  cy.shadowFind('round-two', 'elimination-round', 'button[name="accept"]')
    .contains('Go to Next Round')
    .click()
})
