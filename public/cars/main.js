import { WebComponent, wc, css, dom, register, attach } from '../dom.js'
import { localStorage } from '../storage.js';

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
    content: 'best';
    background-color: lightgreen;
  }

  .car .averageTime::after {
    content: 'average';
    background-color: lightblue;
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

  const rank = Object.fromEntries(
    Object.entries(totalPoints)
      .sort(([_,a], [__,b]) => a - b)
      .map(([id], idx) => [id, idx + 1])
  )

  return Object.fromEntries(
    Object.keys(totalPoints).map(id => ([id, { points: totalPoints[id], rank: rank[id]}]))
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
      <h2>${name} (${weight}oz)</h2>
      <div class="rank"></div>
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

    const score = getPoints()

    times.forEach(([id, { bestTime, averageTime, times }]) => {
      this.$(`#${id} .bestTime`).innerHTML = bestTime ? `${bestTime.toFixed(3)}s` : ''
      this.$(`#${id} .averageTime`).innerHTML = averageTime ? `${averageTime.toFixed(3)}s` : ''
      this.$(`#${id} .times`).innerHTML = times.map((time) => `${time.toFixed(3)}`).join(', ')

      const { points, rank } = score[id] || {}
      this.$(`#${id} .points`).innerHTML = points ? `${points} points` : ''
      this.$(`#${id} .rank`).innerHTML = rank ? `Rank ${rank}` : ''
    })

    this.sortCars(times, score)
  }

  sortCars (times, score) {
    const cars = this.$('#cars');

    const byFinalScore = ([aID, a], [bID, b]) => {
      const aScore = score[aID]
      const bScore = score[bID]
      
      if (aScore && bScore) {
        return aScore.points - bScore.points
      }
      if (!aScore && bScore) return 1
      if (aScore && !bScore) return -1

      return a.bestTime - b.bestTime
    }

    [...times].sort(byFinalScore).forEach(([id]) => {
      const car = this.$(`#${id}`)
      cars.appendChild(car)
    })
  }
}

register(CarLeaderBoard)
attach(document.getElementById('app'), CarLeaderBoard)