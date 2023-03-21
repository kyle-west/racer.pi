import env from '/env'
import { WebComponent, wc, dom, register } from '../dom.js'
import { localStorage } from '../storage.js';

const template = wc`
  <h1>Racers</h1>
  <p>
    Before we begin, we need to record the participants in today's Derby. Please enter all of the cars info below:
  </p>
  <ul id="cars"></ul>
  <button name="add-car">Add Car</button>
  <button name="start-race">Start Race</button>
`

const car = ({ id, name="", weight="" }) => dom`
  <li class="car">
    <label class="name">Car Name: <input id="${id}" type="text" name="car-name" value="${name}"/></label>
    <label class="weight">Weight: <input id="${id}-weight" type="number" name="car-weight" value="${weight}"/>oz</label>
    <button name="remove-car" title="Remove Car" data-id="${id}">X</button>
  </li>
`

function calculateRaces(racers) {
  const laneCount = env.LANE_COUNT
  const racerIds = Object.keys(racers)
  console.log(laneCount, racerIds)
}

export default class CarConfig extends WebComponent {
  static is = 'car-group';

  constructor() {
    super(template);
    this.cars = localStorage.get(CarConfig.is, {})
    Object.entries(this.cars).forEach(([id, carConfig]) => {
      this.addCar({ id, ...carConfig })
    })
    this.addNewCar()
  }

  addCar ({ id, name, weight }) {
    this.cars[id] = { name, weight }
    return this.$('#cars').appendChild(car({ id, name, weight }))
  }

  addNewCar () {
    const id = 'car-' + +(new Date())
    this.addCar({ id })
    this.$(`#${id}`).focus()
  }

  onClickAddCar () { this.addNewCar() }
  onKeyDown ({ key }) {
    if (key === 'Enter') {
      this.addNewCar()
    }
  }

  onInputCarName ({ element: { id, value } }) {
    this.cars[id].name = value
    localStorage.set(CarConfig.is, this.cars)
  }

  onInputCarWeight ({ element: { id, value } }) {
    const num = +value
    if (Number.isNaN(num)) return

    this.cars[id.replace('-weight', '')].weight = num
    localStorage.set(CarConfig.is, this.cars)
  }

  onClickRemoveCar (evt) {
    const id = evt.element.dataset.id
    this.$(`.car:has(#${id})`).remove()
    delete this.cars[id]
    localStorage.set(CarConfig.is, this.cars)
  }

  onClickStartRace () {
    console.log(calculateRaces(this.cars))
  }
}

register(CarConfig)
