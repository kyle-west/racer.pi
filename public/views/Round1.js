import env from '/env'
import { WebComponent, wc, dom, register, inline, css } from '../dom.js'
import CarConfig from './CarConfig.js'
import { localStorage } from '../storage.js'
import { Timer } from '../timer.js'
import { formatOrdinals } from '../util.js'

const totalLanes = env.LANE_COUNT
const halfOfTheLanes = Math.floor(totalLanes/2)

const styles = css`
  table {
    border-collapse: collapse;
    width: 100%;
  }

  table td, table th {
    border: 1px solid #ddd;
    padding: 4px;
  }

  table tr:nth-child(even) { background-color: #f2f2f2; }
  table tr:hover { background-color: #ddd; }

  table thead th {
    padding-top: 6px;
    padding-bottom: 6px;
    text-align: left;
    background-color: #333;
    color: white;
  }

  table tbody th {
    text-align: start;
  }
`

const messageTemplate = wc`
  <h1>First Elimination Round</h1>
  <p>
    Racing will take place on a ${totalLanes}-lane track, with cars randomly 
    chosen to race in heats. The first ${halfOfTheLanes} cars that finish in
    a heat are considered a “win”, and the last ${halfOfTheLanes} cars to finish
    are considered a “loss”. When a car receives its first loss it will be set
    aside until the second round. Heats will continue to be run until only 
    ${halfOfTheLanes} cars remain without a loss – those ${halfOfTheLanes}
    cars are automatically in the Finals.
  </p>

  <button name="continue">Begin Round 1</button>
  <button name="configure-racers">Configure Racers</button>
`

const round = wc`
  ${styles}
  <h1>First Elimination Round</h1>
  <pre id="timer"></pre>
  <div id="heats"></div>
`

export default class Round1 extends WebComponent {
  static is = 'round-one';
  constructor () { 
    super(messageTemplate)
    this.continuing = Object
      .values(localStorage.get(CarConfig.is, {}))
      .map(x => ({ times: [], ...x }))
    this.eliminated = []
  }

  connectedCallback() {
    const raceStart = this.onRaceStart.bind(this)
    const raceUpdate = this.onRaceUpdate.bind(this)
    const raceEnd = this.onRaceEnd.bind(this)

    document.addEventListener('race-start', raceStart)
    document.addEventListener('race-update', raceUpdate)
    document.addEventListener('race-end', raceEnd)

    this.cleanup = () => {
      document.removeEventListener('race-start', raceStart)
      document.removeEventListener('race-update', raceUpdate)
      document.removeEventListener('race-end', raceEnd)
    }
  }
  disconnectedCallback () { this.cleanup() }

  onClickContinue () {
    this.template = round
    this.render()
    this.newHeat()
  }
  
  onClickConfigureRacers () {
    document.dispatchEvent(new CustomEvent('view-car-config'))
  }
  
  getHeatMemberLaneAssignments() {
    const { continuing } = this
    const ordered = [...continuing].sort(({times: a}, {times:b}) => a.length - b.length)
    const racers = ordered
      .slice(0, totalLanes)
      .sort(() => Math.random()*2 - Math.random()*2)
    return Object.fromEntries(racers.map((racer, index) => [index+1, racer]))
  }

  newHeat() {
    this.heatNumber = (this.heatNumber || 0) + 1;
    const assignments = this.getHeatMemberLaneAssignments()
    this.laneAssignments = assignments

    this.$('#heats').appendChild(dom`
      <section id="heat-${this.heatNumber}">
        <h2>Heat ${this.heatNumber}</h2>
        <table>
          <thead>
            <tr><th>Assignment</th><th>Car Name</th><th>Time</th><th>Place</th><th>Status</th></tr>
          </thead>
          <tbody>
          ${inline(Object.entries(assignments).map(([laneNumber, { name }]) => `
            <tr id="heat-${this.heatNumber}-lane-${laneNumber}">
              <td>Lane ${laneNumber}</td>
              <th>${name}</th>
              <td id="heat-${this.heatNumber}-lane-${laneNumber}-time"></td>
              <td id="heat-${this.heatNumber}-lane-${laneNumber}-place"></td>
              <td id="heat-${this.heatNumber}-lane-${laneNumber}-status"></td>
            </tr>
          `))}
          </tbody>
        </table>
      </section>
    `)
  }

  onRaceStart () {
    const timerDOM = this.$('#timer')
    this.timer = this.timer || new Timer((time) => {
      timerDOM.innerHTML = `${time}ms`
    })
    this.timer.start()
  }

  onRaceUpdate ({ detail: { lanes = {} } }) {
    this.laneData = lanes
    Object.entries(lanes).sort(([_,a],[__,b]) => a-b).forEach(([laneNumber, time], idx) => {
      this.$(`#heat-${this.heatNumber}-lane-${laneNumber}-time`).innerHTML = time+ 's'
      
      const order = formatOrdinals(idx + 1)
      this.$(`#heat-${this.heatNumber}-lane-${laneNumber}-place`).innerHTML = order

      const status = idx < halfOfTheLanes ? 'Continuing' : 'Eliminated'
      this.$(`#heat-${this.heatNumber}-lane-${laneNumber}-status`).innerHTML = status
    })
  }

  onRaceEnd (data) {
    this.timer?.stop()
  }
}

register(Round1)
