import env from '/env'
import { WebComponent, wc, dom, register, css } from '../dom.js'
import { localStorage } from '../storage.js';

import ClearDataButton from './ClearDataButton.js';

const styles = css`
  :host {
    display: block;
  }
  p {
    color: var(--text-muted, #64748b);
    margin: 0 0 1.25rem;
  }
  ol {
    list-style: none;
    padding: 0;
    margin: 0 0 0.5rem;
  }
  .car {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 0.875rem;
    background: var(--surface, #fff);
    border: 1px solid var(--border, #e2e8f0);
    border-radius: var(--radius, 6px);
    margin-bottom: 0.5rem;
  }
  .car label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.875rem;
    color: var(--text-muted, #64748b);
  }
  .car input {
    padding: 5px 10px;
    border: 1px solid var(--border, #e2e8f0);
    border-radius: var(--radius, 6px);
    font-size: 0.875rem;
    font-family: inherit;
    color: var(--text, #0f172a);
    background: var(--bg, #f8fafc);
    transition: border-color 0.15s, background-color 0.15s;
    outline: none;
  }
  .car input:focus {
    border-color: var(--accent, #4263eb);
    background: white;
  }
  .car input[name="car-name"] {
    width: 160px;
  }
  .car input[name="car-weight"] {
    width: 68px;
  }
  button[no-styles][name="remove-car"] {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid var(--border, #e2e8f0);
    background: none;
    color: var(--text-muted, #64748b);
    cursor: pointer;
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin-left: auto;
    transition: background-color 0.15s, color 0.15s, border-color 0.15s;
    flex-shrink: 0;
  }
  button[no-styles][name="remove-car"]:hover {
    background-color: #fef2f2;
    color: #dc2626;
    border-color: #fecaca;
  }
  .button-row {
    display: flex;
    align-items: center;
    margin-top: 0.75rem;
  }
  button[name="start-race"] {
    background-color: var(--accent, #4263eb) !important;
    color: white !important;
    border-color: var(--accent, #4263eb) !important;
    font-weight: 600;
  }
  button[name="start-race"]:hover {
    background-color: var(--accent-hover, #3451d1) !important;
    border-color: var(--accent-hover, #3451d1) !important;
    box-shadow: 0 2px 8px rgba(66, 99, 235, 0.25);
  }
  [name="clear"] {
    background-color: #fef2f2;
    color: #dc2626;
    border-color: #fecaca;
    margin-left: auto;
  }
  [name="clear"]:hover {
    background-color: #fee2e2;
    border-color: #fca5a5;
    box-shadow: none;
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
  </div>
  <${ClearDataButton.is} all=""></${ClearDataButton.is}>
`

const car = ({ id, name="", weight="" }) => dom`
  <li class="car">
    <label class="name">Car Name: <input id="${id}" type="text" name="car-name" value="${name}"/></label>
    <label class="weight">Weight: <input id="${id}-weight" type="number" name="car-weight" value="${weight}"/>oz</label>
    <button name="remove-car" title="Remove Car" data-id="${id}" no-styles>X</button>
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
}

register(CarConfig)
