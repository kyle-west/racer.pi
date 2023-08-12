import { WebComponent, wc, css, dom, register, attach } from '../dom.js'
import { localStorage } from '../storage.js';
import { formatOrdinals } from '../util.js';

const styles = css`
  #cars {
    padding: 0;
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
    border-collapse: collapse;
  }

  .car {
    border: 1px solid #ccc;
    margin-bottom: 2rem;
  }

  .weight {
    font-weight: normal;
  }
  
  td {
    padding: 1rem;
  }

  .car .stats {
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
    content: 'fastest';
    border: 1px solid grey;
  }

  .car .averageTime::after {
    content: 'average';
    border: 1px solid grey;
  }

  .flex {
    display: flex;
    height: 100%;
    width: 100%;
  }

  .columns {
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
  }

  .best-personal-time {
    text-decoration: underline;
    font-weight: bold;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    color: black;
  }

  .tags > * {
    font-size: 0.75rem;
    padding: 0.25rem;
    border-radius: 0.5rem;
  }

  .lowest-time {
    background-color: lightgreen;
  }

  .lowest-average {
    background-color: lightblue;
  }

  .lightest-car {
    background-color: lightyellow;
  }

  .heaviest-car {
    background-color: lightgray;
  }

  .finalist {
    border: 2px solid black;
  }

  .place-1 {
    background-color: darkblue;
    color: white;
  }

  .place-2, .place-3 {
    background-color: gold;
  }
`

function getPoints () {
  const finals = localStorage.get('finals', null)
  if (!finals) return {}

  const totalPoints = {}
  Object.values(finals.heat).forEach((heat) => {
    Object.values(heat).forEach(({ id, points }) => {
      totalPoints[id] = totalPoints[id] || 0
      totalPoints[id] += points
    })
  })

  return Object.fromEntries(
    Object.keys(totalPoints).map(id => ([id, { points: totalPoints[id] }]))
  )
}

const template = wc`
  ${styles}
  <table id="cars"></table>
`

const car = ({ id, name="", weight="" }) => dom`
  <tr class="car" id="${id}">
    <td class="place"></td>
    <td class="title">
      <h2>${name} <small class="weight">(${weight}oz)</small></h2>
      <div class="tags"></div>
    </td>
    <td class="stats">
      <div class="flex columns">
        <div class="bestTime"></div>
        <div class="averageTime"></div>
      </div>
    </td>
    <td class="times"></td>
    <td class="points"></td>
  </tr>
`

export default class CarLeaderBoard extends WebComponent {
  static is = 'car-leader-board';
  constructor () {
    super(template)
    this.cars = localStorage.get('car-group', {})
    this.initStats()
    this.initUI()
    this.updateTimes()
  }

  initStats () {
    let lightest = Infinity
    let heaviest = 0
    Object.entries(this.cars).forEach(([id, carConfig]) => {
      if (carConfig.weight < lightest) {
        lightest = carConfig.weight
        this.lightest = id
      }
      if (carConfig.weight > heaviest) {
        heaviest = carConfig.weight
        this.heaviest = id
      }
    })
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

    const score = getPoints()

    times.forEach(([id, { bestTime, averageTime, times }]) => {
      this.$(`#${id} .bestTime`).innerHTML = bestTime ? `${bestTime.toFixed(3)}s` : ''
      this.$(`#${id} .averageTime`).innerHTML = averageTime ? `${averageTime.toFixed(3)}s` : ''
      this.$(`#${id} .times`).innerHTML = times
        .map((time) => `${time.toFixed(3)}`)
        .join(', ')
        .replace(bestTime.toFixed(3), `<span class="best-personal-time">${bestTime.toFixed(3)}</span>`)

      const { points } = score[id] || {}
      this.$(`#${id} .points`).innerHTML = points ? `${points} points` : ''

      if (points) {
        this.$(`#${id}`).classList.add('finalist')
      } else {
        this.$(`#${id}`).classList.remove('finalist')
      }
    })

    this.sortCars(times, score)
  }

  sortCars (times, score) {
    const completed = localStorage.get('results-committed', false)
    const cars = this.$('#cars');

    const byFinalScore = ([aID, a], [bID, b]) => {
      const aScore = score[aID]
      const bScore = score[bID]
      
      if (aScore && bScore) {
        return aScore.points - bScore.points
      }
      if (!aScore && bScore) return 1
      if (aScore && !bScore) return -1

      // TODO: if they have the same points, how should we break the tie?
      // right now I picked fastest time as the tie breaker
      // but maybe we should do average time?
      return a.bestTime - b.bestTime
    }

    let lowestOverallTime = Infinity;
    let lowestAverageTime = Infinity;

    if (completed) {
      times.forEach(([_, { bestTime, averageTime }]) => {
        if (bestTime < lowestOverallTime) lowestOverallTime = bestTime
        if (averageTime < lowestAverageTime) lowestAverageTime = averageTime
      })
    }

    [...times].sort(byFinalScore).forEach(([id, { bestTime, averageTime }], idx) => {
      const car = this.$(`#${id}`)
      
      if (completed) {
        this.$(`#${id}`).classList.add(`place-${idx + 1}`)
      } else {
        this.$(`#${id}`).classList.remove(`place-${idx + 1}`)
      }

      this.$(`#${id} .place`).innerHTML = completed ? `${formatOrdinals(idx + 1)} Place` : ''

      this.$(`#${id} .tags`).innerHTML = `
        ${completed && bestTime === lowestOverallTime ? `<span class="lowest-time">Lowest Time</span>` : ''}
        ${completed && averageTime === lowestAverageTime ? `<span class="lowest-average">Lowest Average</span>` : ''}
        ${this.lightest === id ? `<span class="lightest-car">Lightest</span>` : ''}
        ${this.heaviest === id ? `<span class="heaviest-car">Heaviest</span>` : ''}
      `

      cars.appendChild(car)
    })
  }
  connectedCallback() {
    const handleStorage = () => this.updateTimes()
    window.addEventListener('storage', handleStorage)
    this.cleanup = () => {
      window.removeEventListener('storage', handleStorage)
    }
  }
  disconnectedCallback () { this.cleanup() }
}

register(CarLeaderBoard)
attach(document.getElementById('app'), CarLeaderBoard)