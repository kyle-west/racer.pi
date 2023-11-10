function containsInOrder(orderedCarNames) {
  cy.shadowFind('car-leader-board', '.car')
    .should('have.length', orderedCarNames.length)
    .each((car, index) => {
      cy.wrap(car)
        .contains(orderedCarNames[index])
    })
}

describe('Cars Leader Board', () => {
  beforeEach(() => {
    cy.moveToCarsPage()
  })

  it('should prompt the user to add a car if there are no cars', () => {
    cy.shadowFind('car-leader-board', '#message')
      .contains('please visit the main page to register')
  })

  it('should show the cars in order of their rank as the race progresses', () => {
    // init
    cy.seedDB('car-group')
    cy.reload()

    containsInOrder([
      "Fast Boi",
      "Good Lookin'",
      "slim jim",
      "pizza",
      "taco",
      "bacon",
      "lobster",
      "cat mobile",
      "dogsRule",
      "snake on a car",
      "car",
      "burgermobile",
      "pinecar",
    ])

    
    // it's unfortunate that we have to reload here, but it's the only way to get the data to update in cypress
    // TODO: figure out a way to test localStorage events in cypress
    cy.seedDBAll('round1')
    cy.reload()

    containsInOrder([
      "burgermobile",
      "pinecar",
      "snake on a car",
      "bacon",
      "Fast Boi",
      "pizza",
      "lobster",
      "taco",
      "car",
      "cat mobile",
      "Good Lookin'",
      "slim jim",
      "dogsRule",
    ])

    cy.seedDBAll('round2')
    cy.reload()

    containsInOrder([
      "bacon",
      "Fast Boi",
      "taco",
      "burgermobile",
      "pinecar",
      "snake on a car",
      "Good Lookin'",
      "pizza",
      "lobster",
      "car",
      "slim jim",
      "cat mobile",
      "dogsRule",
    ])

    cy.seedDBAll('finals')
    cy.reload()

    containsInOrder([
      "bacon",
      "burgermobile",
      "snake on a car",
      "Fast Boi",
      "taco",
      "pinecar",
      "Good Lookin'",
      "pizza",
      "lobster",
      "car",
      "slim jim",
      "cat mobile",
      "dogsRule",
    ])

    cy.seedDBRaw('results-committed', true)
    cy.reload()

    containsInOrder([
      "bacon",
      "burgermobile",
      "snake on a car",
      "Fast Boi",
      "taco",
      "pinecar",
      "Good Lookin'",
      "pizza",
      "lobster",
      "car",
      "slim jim",
      "cat mobile",
      "dogsRule",
    ])
    containsInOrder([ "1st Place", "2nd Place", "3rd Place", "4th Place", "5th Place", "6th Place", "7th Place", "8th Place", "9th Place", "10th Place", "11th Place", "12th Place", "13th Place" ])
  })

  it('should tag each car with valuable stats', () => {
    cy.seedDBAll('finals')
    cy.reload()

    containsInOrder([
      'Lowest Average',
      'Finalist',
      'Finalist',
      'Finalist',
      'Finalist',
      'Lowest Time',
      'Heaviest',
      'Eliminated',
      'Eliminated',
      'Eliminated',
      'Eliminated',
      'Eliminated',
      'Lightest',
    ])
  })
})

describe('Save Race & Download CSV button', () => {
  beforeEach(() => {
    cy.moveToCarsPage()
  })

  it('should allow user to download CSV of the results', () => {
    cy.seedDBAll('finals')
    cy.seedDBRaw('results-committed', true)
    cy.reload()

    cy.shadowFind('car-leader-board', '[name="download"]')
      .click()

    cy.window().then((win) => {
      const csvDownloadUrl = win.__last_csv_download_url
      expect(csvDownloadUrl).to.equal('/data/e2e.test.csv')
      return csvDownloadUrl
    }).then(downloadUrl => {
      const filename = downloadUrl.replace('/data/', '')
      console.log(filename)
      cy.readFile(Cypress.config("downloadsFolder") + `/${downloadUrl.replace('/data/', '')}`)
        .should("exist")
        .should('contain', 'Round,Heat,Lane,Name,Time,Status')
        .should('contain', 'Final Round,Heat 2,Lane 3,burgermobile,2.155808301443833,4 pts') // random sample
        .should('contain', 'Place,Name,Points')
        .should('contain', '1,bacon,12,WINNER')
        .should('contain', '2,burgermobile,20')
        .should('contain', '6,pinecar,26')
    })
  })
})

describe('Delete All Data & Start New Race button', () => {
  beforeEach(() => {
    cy.moveToCarsPage()
  })

  it('clicking cancel should cancel the delete', () => {
    cy.seedDBAll('finals')
    cy.seedDBRaw('results-committed', true)
    cy.reload()

    containsInOrder([ "1st Place", "2nd Place", "3rd Place", "4th Place", "5th Place", "6th Place", "7th Place", "8th Place", "9th Place", "10th Place", "11th Place", "12th Place", "13th Place" ])
    
    // clicking cancel should cancel the delete
    cy.on('window:confirm', () => false);
    cy.shadowFind('car-leader-board', '[name="delete-race-data"]')
    .click()
  })
  
  it('clicking ok should execute the delete', () => {
    cy.seedDBAll('finals')
    cy.seedDBRaw('results-committed', true)
    cy.reload()
    
    containsInOrder([ "1st Place", "2nd Place", "3rd Place", "4th Place", "5th Place", "6th Place", "7th Place", "8th Place", "9th Place", "10th Place", "11th Place", "12th Place", "13th Place" ])

    // clicking cancel should cancel the delete
    cy.on('window:confirm', () => true);
    cy.shadowFind('car-leader-board', '[name="delete-race-data"]')
    .click()
    
    cy.shadowFind('car-leader-board', '#message')
      .contains('please visit the main page to register')
  })
})