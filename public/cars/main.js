import { WebComponent, wc, css, dom, register, attach } from '../dom.js'
import { localStorage } from '../storage.js';
import { formatOrdinals } from '../util.js';

import '../debug.js'

const styles = css`
  #cars, #after-race {
    padding: 0;
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
    border-collapse: collapse;
  }

  #after-race {
    margin: 20px auto;
    display: flex;
  }

  [name="download"] {
    background-color: lightblue;
  }

  [name="delete-race-data"] {
    margin-left: auto;
    background-color: red;
    color: white;
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

  .stats-container {
    display: flex;
    height: 100%;
    width: 100%;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
  }

  .hidden {
    display: none !important;
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
    font-family: Consolas, 'Courier New', Courier, monospace;
    font-weight: bold;
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

  .finalist-badge {
    background-color: darkgreen;
    color: white;
  }

  .eliminated {
    background-color: red;
    color: white;
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
  <div id="message"></div>
  <table id="cars"></table>
  <div id="after-race" class="hidden">
    <button name="download">Save Race & Download CSV</button>
    <button name="delete-race-data">Delete All Data & Start New Race</button>
  </div>
`

const car = ({ id, name="", weight="" }) => dom`
  <tr class="car" id="${id}">
    <td class="place"></td>
    <td class="title">
      <h2>${name} <small class="weight">(${weight}oz)</small></h2>
      <div class="tags"></div>
    </td>
    <td class="stats">
      <div class="stats-container">
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
    const cars = Object.entries(this.cars)
    this.$('#message').innerHTML = cars.length === 0 ? 'No cars have been registered yet, please visit the <a href="/">main page</a> to register.' : ''
    this.$('#cars').innerHTML = ''
    cars.forEach(([id, carConfig]) => {
      console.log({ id, ...carConfig })
      this.$('#cars').appendChild(car({ id, ...carConfig }))
    })

    const completed = localStorage.get('results-committed', false)
    if (completed) {
      this.$('#after-race').classList.remove('hidden')
    } else {
      this.$('#after-race').classList.add('hidden')
    }
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

    times.forEach(([id, { bestTime = null, averageTime = null, times }]) => {
      this.$(`#${id} .bestTime`).innerHTML = bestTime ? `${bestTime.toFixed(3)}s` : ''
      this.$(`#${id} .averageTime`).innerHTML = averageTime ? `${averageTime.toFixed(3)}s` : ''

      if (times.length > 0) {
        this.$(`#${id} .stats-container`).classList.remove('hidden')
      } else {
        this.$(`#${id} .stats-container`).classList.add('hidden')
      }

      this.$(`#${id} .times`).innerHTML = times
        .map((time) => `${time.toFixed(3)}`)
        .join(', ')
        .replace((bestTime || Infinity).toFixed(3), `<span class="best-personal-time">${(bestTime || Infinity).toFixed(3)}</span>`)

      const { points } = score[id] || {}
      this.$(`#${id} .points`).innerHTML = points ? `${points} points` : ''

      if (points) {
        this.$(`#${id}`).classList.add('finalist')
      } else {
        this.$(`#${id}`).classList.remove('finalist')
      }
    })

    this.sortCarsAndAddTags(times, score)
  }

  sortCarsAndAddTags (times, score) {
    const completed = localStorage.get('results-committed', false)
    const finalistIds = localStorage.get('finalists', [])

    const cars = this.$('#cars');

    const statuses = {}
    let currentRound = 0
    const races = localStorage.get('races', {})
    if (races?.round) {
      Object.entries(races.round).forEach(([roundNumber, round]) => {
        currentRound = roundNumber
        statuses[roundNumber] = {}
        if (round.heat) {
          Object.values(round.heat).forEach((lane) => {
            Object.values(lane).forEach(({ id, status }) => {
              statuses[roundNumber][id] = status
            })
          })
        }
      })
    }

    console.log({ times, score, statuses })

    const byFinalScore = ([aID, a], [bID, b]) => {
      if (finalistIds.includes(aID) && !finalistIds.includes(bID)) return -1
      if (!finalistIds.includes(aID) && finalistIds.includes(bID)) return 1

      // only finalists have scores
      // finalists stats should be at the top, judged by points
      const aScore = score[aID]
      const bScore = score[bID]
      if (aScore && bScore) {
        return aScore.points - bScore.points
      }
      if (!aScore && bScore) return 1
      if (aScore && !bScore) return -1

      // Eliminated cars should be at the bottom of the list
      const aStatus = statuses[currentRound] && statuses[currentRound][aID]
      const bStatus = statuses[currentRound] && statuses[currentRound][bID]
      if (aStatus === 'Eliminated' && bStatus !== 'Eliminated') return 1
      if (aStatus !== 'Eliminated' && bStatus === 'Eliminated') return -1


      // TODO: how should we break the tie?
      // right now I picked fastest time as the tie breaker
      // but maybe we should do average time?
      return a.bestTime - b.bestTime
    }

    let lowestOverallTime = Infinity;
    let lowestAverageTime = Infinity;
    times.forEach(([_, { bestTime, averageTime }]) => {
      if (bestTime < lowestOverallTime) lowestOverallTime = bestTime
      if (averageTime < lowestAverageTime) lowestAverageTime = averageTime
    });


    [...times].sort(byFinalScore).forEach(([id, { bestTime, averageTime, times }], idx) => {
      const car = this.$(`#${id}`)
      
      if (completed) {
        this.$(`#${id}`).classList.add(`place-${idx + 1}`)
      } else {
        this.$(`#${id}`).classList.remove(`place-${idx + 1}`)
      }

      this.$(`#${id} .place`).innerHTML = completed ? `${formatOrdinals(idx + 1)} Place` : ''

      this.$(`#${id} .tags`).innerHTML = `
        ${finalistIds.includes(id) ? `<span class="finalist-badge">Finalist</span>` : ''}
        ${(statuses[currentRound] && statuses[currentRound][id]) === 'Eliminated' ? `<span class="eliminated">Eliminated</span>` : ''}

        ${bestTime === lowestOverallTime ? `<span class="lowest-time">Lowest Time</span>` : ''}
        ${averageTime === lowestAverageTime ? `<span class="lowest-average">Lowest Average</span>` : ''}

        ${this.lightest === id ? `<span class="lightest-car">Lightest</span>` : ''}
        ${this.heaviest === id ? `<span class="heaviest-car">Heaviest</span>` : ''}
      `

      cars.appendChild(car)
    })
  }
  connectedCallback() {
    const handleStorage = () => {
      this.cars = localStorage.get('car-group', {})
      this.initStats()
      this.initUI()
      this.updateTimes()
    }
    window.addEventListener('storage', handleStorage)
    this.cleanup = () => {
      window.removeEventListener('storage', handleStorage)
    }
  }
  disconnectedCallback () { this.cleanup() }

  onClickDownload () {
    console.log('download')

    const races = localStorage.get('races', {})
    const finals = localStorage.get('finals', {})

    const renameLanes = (lanes) => Object.fromEntries(
      Object.entries(lanes).map(([laneNumber, data]) => ([`lane_${laneNumber}`, data]))
    )
    const renameHeats = (heats) => Object.fromEntries(
      Object.entries(heats).map(([heatNumber, data]) => ([`heat_${heatNumber}`, renameLanes(data)]))
    )

    const data = {
      round_1: renameHeats(races.round?.[1].heat),
      round_2: renameHeats(races.round?.[2].heat),
      final_round: renameHeats(finals.heat)
    }

    console.log(data)

    window
      .fetch('/data/race', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } })
      .then((res) => res.json())
      .then(({ downloadUrl }) => {
        // this line opens an API for easier testing
        window.__last_csv_download_url = downloadUrl
        
        downloadUrl && window.open(downloadUrl)
      })
  }

  onClickDeleteRaceData () {
    const shouldClear = window.confirm(
      'This action will remove all race and car data, are you sure you want to continue?'
    )
    if (shouldClear) {
      localStorage.clear()
      window.location.reload()
    }
  }
}

register(CarLeaderBoard)
attach(document.getElementById('app'), CarLeaderBoard)