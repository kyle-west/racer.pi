import env from '/env'
import { WebComponent, wc, dom, register, inline, css } from '../dom.js'
import CarConfig from './CarConfig.js'
import { localStorage } from '../storage.js'
import { Timer } from '../timer.js'
import { deferredAction, formatOrdinals } from '../util.js'
import ClearDataButton from './ClearDataButton.js';

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

  tr.Continuing { background-color: lightblue !important; }
  tr.Eliminated { background-color: lightpink !important; }
  tr.Finalist   { background-color: lightgreen !important; }

  .hidden {
    display: none;
  }

  td {
    transition: all 0.3s;
  }

  #timer {
    font-size: 30px;
    white-space: pre-wrap;
  }
  `
  
const template = wc`
  ${styles}
  <slot name="start-message"></slot>
  <pre id="timer"></pre>
  <div id="heats"></div>
  <${ClearDataButton.is}></${ClearDataButton.is}>
`

export default class EliminationRound extends WebComponent {
  static is = 'elimination-round';
  constructor () { 
    super(template)
    this.roundNumber = +this.getAttribute('number')
    console.log('ROUND:', this.roundNumber)
    this.continuing = Object
      .values(localStorage.get('continuing', localStorage.get(CarConfig.is, {})))
      .map(x => ({ times: [], ...x }))
    this.eliminated = []

    this.loadExistingData()
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
    this.$('#timer').innerHTML = 'Ready.'
    this.$('slot[name="start-message"]').classList.add('hidden')
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
      .sort(() => Math.random() - Math.random())
    return Object.fromEntries(racers.map((racer, index) => [index+1, racer]))
  }

  newHeat(assignments, finalHeat) {
    this.finalHeat = finalHeat
    this.heatNumber = (this.heatNumber || 0) + 1;
    this.laneAssignments = assignments || this.getHeatMemberLaneAssignments()

    this.$('#heats').prepend(dom`
      <section id="heat-${this.heatNumber}">
        <h2>Heat ${this.heatNumber}</h2>
        <table>
          <thead>
            <tr><th>Assignment</th><th>Car Name</th><th>Time</th><th>Place</th><th>Status</th></tr>
          </thead>
          <tbody>
          ${inline(Object.entries(this.laneAssignments).map(([laneNumber, { name }]) => `
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

        <div class="action hidden">
          <button name="restart">Redo Race</button>
          <button name="accept">Accept & Continue</button>
        </div
      </section>
    `)
  }

  onRaceStart () {
    if (this._unsubmitted) {
      this.onClickRestart()
    }

    const timerDOM = this.$('#timer')
    this.timer = this.timer || new Timer((time) => {
      timerDOM.innerHTML = `Time: ${(time/1000).toFixed(3)}s`
    }, 17)
    this.timer.start()
  }

  onRaceUpdate ({ detail: { lanes = {} } }) {
    this.laneData = lanes
    const laneEntries = Object.entries(lanes).sort(([_,a],[__,b]) => a-b)

    if (laneEntries.length === 1) {
      this.timer?.stop()
      const [lane, time] = laneEntries[0]
      this.$('#timer').innerHTML = `Time: ${time.toFixed(3)}s ${this.laneAssignments[lane].name} Wins!`
    }
    
    laneEntries.forEach(([laneNumber, time], idx) => {
      if (!this.$(`#heat-${this.heatNumber}-lane-${laneNumber}`)) return // for partially full track

      this.$(`#heat-${this.heatNumber}-lane-${laneNumber}-time`).innerHTML = time+ 's'
      
      const order = formatOrdinals(idx + 1)
      this.$(`#heat-${this.heatNumber}-lane-${laneNumber}-place`).innerHTML = order

      const win = this.finalHeat ? 'Finalist' : 'Continuing'
      const status = idx < halfOfTheLanes ? win : 'Eliminated'
      this.$(`#heat-${this.heatNumber}-lane-${laneNumber}-status`).innerHTML = status
      this.$(`#heat-${this.heatNumber}-lane-${laneNumber}`).classList.add(status)
    })

    if (laneEntries.length === this.continuing.length) {
      this.onRaceEnd()
    }
  }

  onRaceEnd () {
    this.$('.action').classList.remove('hidden')
    this._unsubmitted = true
  }

  onClickRestart () {
    this.$('.action').classList.add('hidden')
    this.$$(`[id="heat-${this.heatNumber}"] td[id]`).forEach(elem => elem.innerHTML = '')
    this.$$(`[id="heat-${this.heatNumber}"] .Continuing`).forEach(elem => elem.classList.remove('Continuing'))
    this.$$(`[id="heat-${this.heatNumber}"] .Eliminated`).forEach(elem => elem.classList.remove('Eliminated'))
    this.$$(`[id="heat-${this.heatNumber}"] .Finalist`).forEach(elem => elem.classList.remove('Finalist'))
    this.$('#timer').innerHTML = 'Ready.'
    this.laneData = null
    this._unsubmitted = false
  }

  onClickAccept () {
    this.$('#timer').innerHTML = 'Ready.'
    this.$('.action').remove()

    const racers = Object.entries(this.laneData)
      .sort(([_,a],[__,b]) => a-b)
      .map(([lane, time]) => {
        // this is needed to help rank the next heat
        this.laneAssignments[lane].times ??= []
        this.laneAssignments[lane].times.push(time)

        return this.laneAssignments[lane]
      })

    Object.entries(this.laneAssignments).forEach(([lane, racer]) => {
      const time = this.laneData[lane]
      deferredAction(() => localStorage.merge(`times:${racer.id}`, [ time ]))
    })

    const loserIds = racers.slice(halfOfTheLanes, totalLanes).map(({id}) => id)
    this.eliminated = this.continuing.filter(({id}) => loserIds.includes(id))
    this.continuing = this.continuing.filter(({id}) => !loserIds.includes(id))

    localStorage.merge('races', {
      round: { 
        [this.roundNumber]: {
          heat: {
            [this.heatNumber]: Object.fromEntries(
              Object.entries(this.laneAssignments).map(([lane, { id, name }]) => {
                const time = this.laneData[lane]
                const status = loserIds.includes(id)
                  ? 'Eliminated' 
                  : (this.finalHeat
                      ? 'Finalist'
                      : 'Continuing'
                    )
                return [lane, { id, name, time, status }]
              })
            )
          }
        }
      }
    })

    // record globally the times of each car
    // and find eliminated values if this is the final heat
    const heatInfo = localStorage.get('races').round[this.roundNumber].heat
    const times = {}
    const eliminatedIds = []
    Object.values(heatInfo).forEach((lane) => {
      Object.values(lane).forEach(({ id, time, status }) => {
        times[id] ??= []
        times[id].push(time)
        if (status === 'Eliminated') {
          eliminatedIds.push(id)
        }
      })
    })

    if (this.finalHeat) {
      localStorage.set('finalists', [
        ...localStorage.get('finalists', []),
        ...this.continuing.map(({id}) => id)
      ])

      const racers = localStorage.get(CarConfig.is)
      localStorage.set('continuing', Object.fromEntries(
        eliminatedIds.map((id) => [id, racers[id]])
      ))
      
      document.dispatchEvent(new CustomEvent(
        this.roundNumber === 1 ? 'view-round-two' : 'view-final-round'
      ))
      return
    }

    this.newHeat(null, this.continuing.length <= totalLanes)
  }

  loadExistingData () {
    const existingRaceInfo = localStorage.get('races')
    const existingHeatInfo = existingRaceInfo?.round?.[this.roundNumber]?.heat
    if (existingHeatInfo) {
      this.$('#timer').innerHTML = 'Ready.'
      this.$('slot[name="start-message"]').classList.add('hidden')
      const racers = localStorage.get(CarConfig.is, {})
      Object.entries(existingHeatInfo).forEach(([heat, laneInfo]) => {
        const assignments = Object.fromEntries(
          Object.entries(laneInfo).map(([lane, { id }]) => [lane, racers[id]])
        )
        this.newHeat(
          assignments,
          Object.values(assignments).length + this.continuing.length <= totalLanes
        )
        this.onRaceUpdate({ detail: { lanes: Object.fromEntries(
          Object.entries(laneInfo).map(([lane, { time }]) => [lane, time])
        )}})

        const loserIds = Object.entries(this.laneData)
          .sort(([_,a],[__,b]) => a-b)
          .map(([lane]) => {
            return this.laneAssignments[lane]
          })
          .slice(halfOfTheLanes, totalLanes).map(({id}) => id)
        this.eliminated = this.continuing.filter(({id}) => loserIds.includes(id))
        this.continuing = this.continuing.filter(({id}) => !loserIds.includes(id))
      })

      if (this.finalHeat) {
        this.$('#timer').innerHTML = `<button name="accept">Go to Next Round</button>`
      } else {
        this.newHeat(null, this.continuing.length <= totalLanes)
      }
    }
  }
}

register(EliminationRound)
