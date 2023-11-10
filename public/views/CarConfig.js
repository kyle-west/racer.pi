import env from '/env'
import { WebComponent, wc, dom, register, css } from '../dom.js'
import { localStorage } from '../storage.js';

const styles = css`
  .button-row {
    display: flex;
    align-items: center;
  }

  [name="clear"] {
    background-color: red;
    color: white;
    margin-left: auto;
  }
`


const template = wc`
  ${styles}

  <h1>Racers</h1>
  <p>
    Before we begin, we need to record the participants in today's Derby. Please enter all of the cars info below:
  </p>
  <ol id="cars"></ol>
  <div class="button-row">
    <button name="add-car">Add Car</button>
    <button name="start-race">Start Race</button>
    <button name="clear">Clear All</button>
  </div>
`

const car = ({ id, name="", weight="" }) => dom`
  <li class="car">
    <label class="name">Car Name: <input id="${id}" type="text" name="car-name" value="${name}"/></label>
    <label class="weight">Weight: <input id="${id}-weight" type="number" name="car-weight" value="${weight}"/>oz</label>
    <button name="remove-car" title="Remove Car" data-id="${id}">X</button>
  </li>
`

export default class CarConfig extends WebComponent {
  static is = 'car-group';

  constructor() {
    super(template);
    this.cars = localStorage.get(CarConfig.is, {})
    Object.entries(this.cars).forEach(([id, carConfig]) => {
      this.addCar({ id, ...carConfig })
    })
    if (Object.keys(this.cars).length < env.LANE_COUNT) {
      this.addNewCar()
    }
  }

  addCar ({ id, name, weight }) {
    this.cars[id] = { name, weight, id }
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
    // clear out for car "entries" that were never filled out
    Object.entries(this.cars).forEach(([id, { name, weight }]) => {
      if (!name?.trim() && !weight) {
        delete this.cars[id]
      }
    })
    localStorage.set(CarConfig.is, this.cars)
    document.dispatchEvent(new CustomEvent('view-round-one'))
  }

  onClickClear() {
    const shouldClear = window.confirm(
      'This action will remove all race and car data, are you sure you want to continue?'
    )
    if (shouldClear) {
      localStorage.clear()
      window.location.reload()
    }
  }
}

register(CarConfig)
