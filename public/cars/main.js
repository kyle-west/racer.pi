import { WebComponent, wc, css, dom, register, attach } from '../dom.js'
import { localStorage } from '../storage.js';
import { formatOrdinals } from '../util.js';
import ClearDataButton from '../views/ClearDataButton.js';

import '../debug.js'

const styles = css`
  :host {
    display: block;
  }

  h1 {
    font-size: 1.875rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text, #0f172a);
    margin: 0 0 1.5rem;
  }

  #message {
    color: var(--text-muted, #64748b);
    margin-bottom: 1rem;
  }
  #message a {
    color: var(--accent, #4263eb);
    text-decoration: none;
  }
  #message a:hover {
    text-decoration: underline;
  }

  #cars {
    width: 100%;
    max-width: 860px;
    margin: 0 auto;
    border-collapse: separate;
    border-spacing: 0;
    border: 1px solid var(--border, #e2e8f0);
    border-radius: var(--radius-lg, 10px);
    overflow: hidden;
    box-shadow: var(--shadow, 0 1px 4px rgba(0,0,0,0.08));
  }

  .car {
    background: var(--surface, #fff);
    border-bottom: 1px solid var(--border, #e2e8f0);
    transition: background-color 0.2s;
  }
  .car:last-child {
    border-bottom: none;
  }

  td {
    padding: 1rem 1.25rem;
    vertical-align: middle;
  }

  .place {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-muted, #64748b);
    white-space: nowrap;
    width: 80px;
    text-align: center;
  }

  .title h2 {
    margin: 0 0 0.25rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text, #0f172a);
  }

  .weight {
    font-weight: 400;
    font-size: 0.875rem;
    color: var(--text-muted, #64748b);
  }

  .stats {
    white-space: nowrap;
    min-width: 140px;
  }

  .stats-container {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .bestTime, .averageTime {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text, #0f172a);
  }

  .bestTime::after, .averageTime::after {
    font-size: 0.68rem;
    font-weight: 500;
    padding: 2px 7px;
    border-radius: 20px;
    margin-left: 0.4rem;
    vertical-align: middle;
  }

  .bestTime::after {
    content: 'fastest';
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
  }

  .averageTime::after {
    content: 'average';
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
  }

  .times {
    color: var(--text-muted, #64748b);
    font-size: 0.82rem;
    font-family: 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace;
    line-height: 1.6;
  }

  .best-personal-time {
    font-weight: 700;
    color: var(--text, #0f172a);
    text-decoration: underline;
  }

  .points {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--text-muted, #64748b);
    white-space: nowrap;
  }

  .hidden {
    display: none !important;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 0.3rem;
  }

  .tags > * {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 20px;
    letter-spacing: 0.02em;
  }

  .finalist-badge {
    background-color: var(--accent, #4263eb);
    color: white;
  }

  .eliminated {
    background-color: #fee2e2;
    color: #dc2626;
  }

  .lowest-time {
    background-color: #dcfce7;
    color: #166534;
  }

  .lowest-average {
    background-color: #dbeafe;
    color: #1e40af;
  }

  .lightest-car {
    background-color: #fef9c3;
    color: #92400e;
  }

  .heaviest-car {
    background-color: #f1f5f9;
    color: #475569;
  }

  .finalist td:first-child {
    box-shadow: inset 3px 0 0 var(--accent, #4263eb);
  }

  .place-1 {
    background-color: #fffbeb;
  }
  .place-1 .place {
    color: #b45309;
  }

  .place-2 {
    background-color: #f8fafc;
  }
  .place-2 .place {
    color: #475569;
  }

  .place-3 {
    background-color: #fff7ed;
  }
  .place-3 .place {
    color: #c2410c;
  }

  #after-race {
    max-width: 860px;
    margin: 1.25rem auto;
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  [name="download"] {
    background-color: #eff6ff;
    color: #1d4ed8;
    border-color: #bfdbfe;
    font-weight: 500;
  }
  [name="download"]:hover {
    background-color: #dbeafe;
    border-color: #93c5fd;
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
  <h1>Leaderboard</h1>
  <div id="message"></div>
  <table id="cars"></table>
  <div id="after-race" class="hidden">
    <button name="download">Save Race & Download CSV</button>
  </div>
  <${ClearDataButton.is} id="clearEverything" all></${ClearDataButton.is}>
  <${ClearDataButton.is} id="clearRaceData"></${ClearDataButton.is}>
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

      const medals = ['/assets/medal-gold.svg', '/assets/medal-silver.svg', '/assets/medal-bronze.svg']
      const medal = completed && idx < 3 ? `<img src="${medals[idx]}" style="display:block;width:2.4rem;height:2.4rem;margin:0 auto" alt="">` : ''
      this.$(`#${id} .place`).innerHTML = completed ? `${medal}${formatOrdinals(idx + 1)} Place` : ''

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
}

register(CarLeaderBoard)
attach(document.getElementById('app'), CarLeaderBoard)