import { WebComponent, wc, css, dom, register, attach } from '../dom.js'
import { localStorage } from '../storage.js';

const styles = css`
  #cars {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 0;
    max-width: 800px;
    margin: 0 auto;
  }

  .car {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 1rem;
    gap: 2rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    width: 100%;
  }

  .car .stats {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
    font-size: 1.25rem;
  }

  .car .bestTime::after,
  .car .averageTime::after {
    margin-left: 0.5rem;
    font-size: 1rem;
    vertical-align: top;
    padding: 0.25rem;
    border-radius: 0.5rem;
  }

  .car .bestTime::after {
    content: 'best';
    background-color: lightgreen;
  }

  .car .averageTime::after {
    content: 'average';
    background-color: lightblue;
  }
`

const template = wc`
  ${styles}
  <ul id="cars"></ul>
`

const car = ({ id, name="", weight="" }) => dom`
  <li class="car" id="${id}">
    <div>
      <h2>${name} (${weight}oz)</h2>
      <div class="rank"></div>
    </div>
    <div class="stats">
      <div class="bestTime"></div>
      <div class="averageTime"></div>
    </div>
    <div class="times"></div>
  </li>
`

export default class CarLeaderBoard extends WebComponent {
  static is = 'car-leader-board';
  constructor () {
    super(template)
    this.cars = localStorage.get('car-group', {})
    this.initUI()
    this.updateTimes()
  }

  initUI () {
    Object.entries(this.cars).forEach(([id, carConfig]) => {
      console.log({ id, ...carConfig })
      this.$('#cars').appendChild(car({ id, ...carConfig }))
    })
  }

  updateTimes () {
    const times = Object.keys(this.cars)
      .map((id) => {
        const carTimes = localStorage.get(`times:${id}`, [])
        const [bestTime] = [...carTimes].sort()
        const averageTime = carTimes.reduce((sum, time) => sum + time, 0) / carTimes.length
        return [id, { bestTime, averageTime, times: carTimes }]
      })
      .sort(([, a], [, b]) => a.bestTime - b.bestTime)
    
    times.forEach(([id, { bestTime, averageTime, times }]) => {
      this.$(`#${id} .bestTime`).innerHTML = bestTime ? `${bestTime.toFixed(3)}s` : ''
      this.$(`#${id} .averageTime`).innerHTML = averageTime ? `${averageTime.toFixed(3)}s` : ''
      this.$(`#${id} .times`).innerHTML = times.map((time) => `${time.toFixed(3)}`).join(', ')
    })

    this.sortCars(times)
  }

  sortCars (times) {
    const cars = this.$('#cars')
    times.forEach(([id]) => {
      const car = this.$(`#${id}`)
      cars.appendChild(car)
    })
  }
}

register(CarLeaderBoard)
attach(document.getElementById('app'), CarLeaderBoard)