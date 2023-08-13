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

  it.only('should tag each car with valuable stats', () => {
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
