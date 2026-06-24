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
  :host {
    display: block;
  }

  section {
    margin-bottom: 2rem;
  }

  section h2 {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-muted, #64748b);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 0.5rem;
  }

  table {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    font-size: 0.9rem;
    border: 1px solid var(--border, #e2e8f0);
    border-radius: var(--radius-lg, 10px);
    overflow: hidden;
    box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.06));
  }

  table td, table th {
    border-bottom: 1px solid var(--border, #e2e8f0);
    border-right: 1px solid var(--border, #e2e8f0);
    padding: 10px 14px;
  }

  table td:last-child, table th:last-child {
    border-right: none;
  }

  table tbody tr:last-child td,
  table tbody tr:last-child th {
    border-bottom: none;
  }

  table tr:nth-child(even) { background-color: #f8fafc; }
  table tr:hover { background-color: #f1f5f9; }

  table thead th {
    padding: 10px 14px;
    text-align: left;
    background-color: #1e293b;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border-bottom: none;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }

  table thead th:last-child {
    border-right: none;
  }

  table tbody th {
    text-align: start;
    font-weight: 500;
  }

  tr.Continuing { background-color: #eff6ff !important; }
  tr.Eliminated { background-color: #fff1f2 !important; }
  tr.Finalist   { background-color: #f0fdf4 !important; }

  .hidden {
    display: none;
  }

  td {
    transition: background-color 0.25s, color 0.25s;
  }

  td[data-manual="true"]::after {
    content: ' *';
    opacity: 0.5;
    font-style: italic;
    font-size: 0.8em;
  }

  button[no-styles][name="edit-lane"] {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.95rem;
    opacity: 0.35;
    padding: 2px 6px;
    border-radius: var(--radius, 6px);
    transition: opacity 0.15s, background-color 0.15s, filter 0.15s;
  }
  button[no-styles][name="edit-lane"] img {
    filter: grayscale(1);
    transition: filter 0.15s;
  }
  button[no-styles][name="edit-lane"]:hover {
    opacity: 1;
    background-color: var(--bg, #f8fafc);
  }
  button[no-styles][name="edit-lane"]:hover img {
    filter: grayscale(0);
  }
  td:has(button[name="edit-lane"]) {
    width: 1px;
    white-space: nowrap;
  }

  .action {
    display: flex;
    gap: 0.25rem;
    margin-top: 0.75rem;
  }

  button[name="accept"] {
    background-color: var(--accent, #4263eb);
    color: white;
    border-color: var(--accent, #4263eb);
    font-weight: 600;
  }
  button[name="accept"]:hover {
    background-color: var(--accent-hover, #3451d1);
    border-color: var(--accent-hover, #3451d1);
    box-shadow: 0 2px 8px rgba(66, 99, 235, 0.25);
  }

  #timer {
    font-size: 1.75rem;
    font-family: 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace;
    font-weight: 600;
    color: var(--text, #0f172a);
    margin: 1rem 0;
    white-space: pre-wrap;
    letter-spacing: -0.01em;
  }

  #edit-dialog {
    border: none;
    border-radius: var(--radius-lg, 10px);
    padding: 1.5rem;
    min-width: 280px;
    background: var(--surface, white);
    box-shadow: var(--shadow-md, 0 4px 16px rgba(0,0,0,0.12));
  }
  #edit-dialog::backdrop {
    background: rgba(15, 23, 42, 0.35);
    backdrop-filter: blur(2px);
  }
  #edit-dialog-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 1.25rem;
    color: var(--text, #0f172a);
  }
  #edit-dialog label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    color: var(--text, #0f172a);
  }
  #edit-dialog [name="edit-time"] {
    padding: 6px 10px;
    border: 1px solid var(--border, #e2e8f0);
    border-radius: var(--radius, 6px);
    font-size: 0.875rem;
    font-family: inherit;
    width: 110px;
    color: var(--text, #0f172a);
    background: var(--bg, #f8fafc);
    transition: border-color 0.15s;
    outline: none;
  }
  #edit-dialog [name="edit-time"]:focus {
    border-color: var(--accent, #4263eb);
    background: white;
  }
  #edit-dialog br {
    display: none;
  }
  #edit-dialog button[name="confirm-edit"] {
    background-color: var(--accent, #4263eb);
    color: white;
    border-color: var(--accent, #4263eb);
    font-weight: 600;
  }
  #edit-dialog button[name="confirm-edit"]:hover {
    background-color: var(--accent-hover, #3451d1);
    border-color: var(--accent-hover, #3451d1);
  }
`
  
const template = wc`
  ${styles}
  <slot name="start-message"></slot>
  <pre id="timer"></pre>
  <div id="heats"></div>
  <${ClearDataButton.is}></${ClearDataButton.is}>
  <dialog id="edit-dialog">
    <h3 id="edit-dialog-title">Edit Lane</h3>
    <label>Time (s): <input type="number" name="edit-time" step="0.001" min="0" /></label>
    <br/>
    <button name="confirm-edit">Save</button>
    <button name="cancel-edit" type="button">Cancel</button>
  </dialog>
`

export default class EliminationRound extends WebComponent {
  static is = 'elimination-round';
  constructor () { 
    super(template)
    this.roundNumber = +this.getAttribute('number')
    console.log('ROUND:', this.roundNumber)
    this.manualLanes = new Set()
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
            <tr><th>Assignment</th><th>Car Name</th><th>Time</th><th>Place</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
          ${inline(Object.entries(this.laneAssignments).map(([laneNumber, { name }]) => `
            <tr id="heat-${this.heatNumber}-lane-${laneNumber}">
              <td>Lane ${laneNumber}</td>
              <th>${name}</th>
              <td id="heat-${this.heatNumber}-lane-${laneNumber}-time"></td>
              <td id="heat-${this.heatNumber}-lane-${laneNumber}-place"></td>
              <td id="heat-${this.heatNumber}-lane-${laneNumber}-status"></td>
              <td><button name="edit-lane" data-heat="${this.heatNumber}" data-lane="${laneNumber}" no-styles><img src="/assets/pencil.svg" style="width:1rem;height:1rem;display:block;pointer-events:none" alt="Edit" title="Edit"></button></td>
            </tr>
          `))}
          </tbody>
        </table>

        <div class="action hidden">
          <button name="restart">Redo Race</button>
          <button name="accept" class="hidden">Accept & Continue</button>
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
    // if we get data for a lane that isn't got a car in it - just ignore it
    const activeLanes = Object.fromEntries(
      Object.entries(lanes).filter(([lane]) => this.laneAssignments[lane])
    )

    // Preserve manually-edited times so server updates don't overwrite them
    for (const key of this.manualLanes) {
      const [h, l] = key.split('-')
      if (+h === this.heatNumber && activeLanes[l] !== undefined && this.laneData?.[l] !== undefined) {
        activeLanes[l] = this.laneData[l]
      }
    }

    this.$('.action').classList.remove('hidden')
    this.laneData = activeLanes
    const laneEntries = Object.entries(activeLanes).sort(([_,a],[__,b]) => a-b)

    if (laneEntries.length === 1) {
      this.timer?.stop()
      const [lane, time] = laneEntries[0]
      this.$('#timer').innerHTML = `Time: ${time.toFixed(3)}s ${this.laneAssignments[lane].name} Wins!`
    }
    
    laneEntries.forEach(([laneNumber, time], idx) => {
      if (!this.$(`#heat-${this.heatNumber}-lane-${laneNumber}`)) return // for partially full track

      const timeCell = this.$(`#heat-${this.heatNumber}-lane-${laneNumber}-time`)
      timeCell.innerHTML = time + 's'
      if (this.manualLanes.has(`${this.heatNumber}-${laneNumber}`)) {
        timeCell.dataset.manual = 'true'
      }

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
    this.$('.action [name="accept"]').classList.remove('hidden')
    this._unsubmitted = true
  }

  onClickEditLane (evt) {
    const heat = +evt.element.dataset.heat
    const lane = +evt.element.dataset.lane
    this._editingHeat = heat
    this._editingLane = lane

    this.$('#edit-dialog-title').innerHTML = `Edit Heat ${heat} — Lane ${lane}`

    let currentTime

    if (heat === this.heatNumber) {
      currentTime = this.laneData?.[lane]
    } else {
      const heatData = localStorage.get('races')?.round?.[this.roundNumber]?.heat?.[heat] || {}
      currentTime = heatData[lane]?.time
    }

    this._editingOriginalTime = currentTime
    this.$('[name="edit-time"]').value = currentTime ?? ''

    this.$('#edit-dialog').showModal()
  }

  onClickConfirmEdit () {
    const heat = this._editingHeat
    const lane = this._editingLane
    const newTimeStr = this.$('[name="edit-time"]').value
    const newTime = newTimeStr !== '' ? +newTimeStr : null

    this.$('#edit-dialog').close()

    const isCurrent = heat === this.heatNumber

    if (newTime !== null && newTime !== this._editingOriginalTime) {
      if (isCurrent) {
        if (!this.laneData?.[lane]) {
          this.manualLanes.add(`${heat}-${lane}`)
          fetch(`/gpio/time?lane=${lane}&time=${newTime}`, { method: 'POST' })
        } else {
          this.laneData[lane] = newTime
          this.manualLanes.add(`${heat}-${lane}`)
          this.onRaceUpdate({ detail: { lanes: this.laneData } })
        }
      } else {
        localStorage.merge('races', {
          round: { [this.roundNumber]: { heat: { [heat]: { [lane]: { time: newTime } } } } }
        })
        const timeCell = this.$(`#heat-${heat}-lane-${lane}-time`)
        if (timeCell) {
          timeCell.innerHTML = `${newTime}s`
          timeCell.dataset.manual = 'true'
        }
        this.manualLanes.add(`${heat}-${lane}`)
      }
    }
  }

  onClickCancelEdit () {
    this.$('#edit-dialog').close()
  }

  onClickRestart () {
    this.$('.action').classList.add('hidden')
    this.$('.action [name="accept"]').classList.add('hidden')
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

        this.$('.action').classList.add('hidden')
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
