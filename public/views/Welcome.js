import { WebComponent, wc, dom, register } from '../dom.js'

const template = wc`
  <h1>Welcome!</h1>

  <ul id="cars"></ul>
  <button name="add-car">Add Car</button>
  <button name="start-race">Start Race</button>
`

const car = (id) => dom`
  <div class="car">
    <label class="name">Car Name: <input id="${id}" type="text" name="car-name"/></label>
    <label class="weight">Weight: <input id="${id}-weight" type="number" name="car-weight"/>oz</label>
  </div>
`

export default class Welcome extends WebComponent {
  static is = 'welcome-view';

  constructor() {
    super(template);
    this.cars = {}
  }

  onClickAddCar () {
    const id = 'car-' + Object.keys(this.cars).length
    this.cars[id] = { name: null, weight: null }
    this.$('#cars').appendChild(car(id))
  }

  onInputCarName ({ element: { id, value } }) {
    this.cars[id].name = value
    console.log(this.cars)
  }

  onInputCarWeight ({ element: { id, value } }) {
    const num = +value
    if (Number.isNaN(num)) return

    this.cars[id.replace('-weight', '')].weight = num
    console.log(this.cars)
  }
}

register(Welcome)
