import env from '/env'
import { wc, register, css } from '../dom.js'
import { localStorage } from '../storage.js';
import Heat from './Heat.js';
import CarConfig from './CarConfig.js';
import LaneEventWC from './LaneEventWC.js';
import TimerComponent from './Timer.js';
import { deferredAction } from '../util.js';
import ClearDataButton from './ClearDataButton.js';

const totalLanes = env.LANE_COUNT

const styles = css`
  .hidden {
    display: none;
  }

  #edit-dialog {
    border: 1px solid #333;
    border-radius: 4px;
    padding: 16px;
    min-width: 260px;
  }

  #edit-dialog label {
    display: block;
    margin-bottom: 10px;
  }

  #edit-dialog [name="edit-time"] {
    width: 100px;
  }
`

class FinalHeat extends Heat {
  static is = 'final-heat'

  computeStatus (rank) {
    return rank === 1 ? 'First' : 'Finished'
  }
}
register(FinalHeat)

const template = wc`
  ${styles}
  <h1>Finals</h1>

  <${TimerComponent.is} id="timer"></${TimerComponent.is}>

  <div id="current-heat"></div>

  <div class="action hidden">
    <button name="restart">Redo Race</button>
    <button name="accept" class="hidden">Accept & Continue</button>
  </div>

  <div id="heats">
    <p>
      For the Finals, the ${totalLanes} remaining cars will run ${totalLanes} heats.
      Each car will run one heat in each lane. Cars receive:
    </p>
    <ul>
      <li>1 point for a first-place finish</li>
      <li>2 points for second place</li>
      <li>3 points for third place</li>
      <li>etc...</li>
    </ul> 
    <p>
      After ${totalLanes} heats, the car with the lowest total score is the winner of
      the derby!
    </p>

    <button name="continue">Begin Finals</button>
  </div>

  <${ClearDataButton.is}></${ClearDataButton.is}>
  <dialog id="edit-dialog">
    <h3 id="edit-dialog-title">Edit Lane</h3>
    <label>Time (s): <input type="number" name="edit-time" step="0.001" min="0" /></label>
    <br/>
    <button name="confirm-edit">Save</button>
    <button name="cancel-edit" type="button">Cancel</button>
  </dialog>
`

export default class FinalRound extends LaneEventWC {
  static is = 'final-round';
  constructor () {
    super(template)
    const racers = localStorage.get(CarConfig.is)
    this.finalists = localStorage.get('finalists', []).map(id => racers[id])
    this.manualLanes = new Set()

    this.loadExistingData()

    this.addEventListener('lane-edit-request', (evt) => this._openEditDialog(evt.detail))
  }

  onClickContinue() {
    this.$('#heats').innerHTML = ''
    this.$('#timer').clear()
    this.newHeat()
  }

  onClickAccept () {
    this.$('#timer').clear()
    this.$('.action').classList.add('hidden')
    this.$('.action [name="accept"]').classList.add('hidden')

    this.commitHeat()

    if (this.heatNumber === totalLanes) {
      this.endGame()
    } else {
      this.newHeat()
    }

  }

  onClickRestart () {
    this.$('#timer').clear()
    this.currentHeat.restart()
    this.$('.action').classList.add('hidden')
    this.$('.action [name="accept"]').classList.add('hidden')
  }

  getHeatMemberLaneAssignments() {
    const finalists = [...this.finalists]

    // shift to the right all the values by one item per heat number
    for (let i = 1; i < this.heatNumber; ++i) {
      finalists.unshift(finalists.pop())
    }

    return Object.fromEntries(finalists.map((racer, index) => [index + 1, racer]))
  }

  newHeat(assignments, finalHeat) {

    if (this.currentHeat) {
      this.$('#heats').prepend(this.currentHeat)
    }

    this.finalHeat = finalHeat
    this.heatNumber = (this.heatNumber || 0) + 1;
    this.laneAssignments = assignments || this.getHeatMemberLaneAssignments()

    const heatElem = document.createElement(FinalHeat.is)
    heatElem.setAttribute('round', 3)
    heatElem.setAttribute('heat', this.heatNumber)
    heatElem.laneAssignments = this.laneAssignments
    heatElem.manualLanes = this.manualLanes
    this.currentHeat = heatElem

    this.$('#current-heat').prepend(heatElem)
    this.$('.action').classList.add('hidden')
  }

  onRaceUpdate ({ detail: { lanes = {} } }) {
    this.$('.action').classList.remove('hidden')

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

    this.laneData = activeLanes
    const laneEntries = Object.entries(activeLanes).sort(([_,a],[__,b]) => a-b)

    if (laneEntries.length > 0) {
      const [lane, time] = laneEntries[0]
      const timer = this.$('#timer')
      timer.stop?.()
      timer.display?.(`Time: ${time.toFixed(3)}s ${this.laneAssignments[lane].name} Wins!`)
    }
    
    if (this.currentHeat) {
      this.currentHeat.updateLaneInfo(laneEntries)
    }
  }

  onRaceStart () {
    this.$('#timer').start()
    this.$('.action').classList.add('hidden')
    this.$('.action [name="accept"]').classList.add('hidden')
  }

  onRaceEnd () {
    this.$('.action [name="accept"]').classList.remove('hidden')
  }

  endGame () {
    document.dispatchEvent(new CustomEvent('view-results'))
  }

  commitHeat () {
    const rank = Object.entries(this.laneData).sort(([_,a],[__,b]) => a-b)
    localStorage.merge('finals', {
      heat: {
        [this.heatNumber]: Object.fromEntries(
          Object.entries(this.laneAssignments).map(([lane, { id, name }]) => {
            const time = this.laneData[lane]
            const points = rank.findIndex(([laneNumber]) => laneNumber === lane) + 1
            deferredAction(() => localStorage.merge(`times:${id}`, [ time ]))
            return [lane, { id, name, time, points }]
          })
        )
      }
    })
  }

  _openEditDialog ({ heat, lane }) {
    this._editingHeat = heat
    this._editingLane = lane

    this.$('#edit-dialog-title').innerHTML = `Edit Final Heat ${heat} — Lane ${lane}`

    let currentTime

    if (heat === this.heatNumber) {
      currentTime = this.laneData?.[lane]
    } else {
      const heatData = localStorage.get('finals')?.heat?.[heat] || {}
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
        localStorage.merge('finals', {
          heat: { [heat]: { [lane]: { time: newTime } } }
        })
        const pastHeat = this._getPastHeatElement(heat)
        const timeCell = pastHeat?.$?.(`#lane-${lane}-time`)
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

  _getPastHeatElement (heat) {
    return [...this.$('#heats').querySelectorAll('final-heat')]
      .find(el => +el.getAttribute('heat') === heat) || null
  }

  loadExistingData () {
    const existingRaceInfo = localStorage.get('finals')
    const existingHeatInfo = existingRaceInfo?.heat
    if (existingHeatInfo) {
      this.$('#heats').innerHTML = ''
      
      const racers = localStorage.get(CarConfig.is, {})
      Object.entries(existingHeatInfo).forEach(([heat, laneInfo]) => {
        const assignments = Object.fromEntries(
          Object.entries(laneInfo).map(([lane, { id }]) => [lane, racers[id]])
        )
        this.newHeat(assignments, totalLanes === +heat)
        this.onRaceUpdate({ detail: { lanes: Object.fromEntries(
          Object.entries(laneInfo).map(([lane, { time }]) => [lane, time])
        )}})
      })
      window.requestAnimationFrame(() => {
        if (this.finalHeat) {
          this.$('#timer').display(`<button name="see-results">See Results</button>`)
          this.onClickSeeResults = () => this.endGame()
        } else {
          this.newHeat(null, totalLanes === this.heatNumber)
          this.$('#timer').clear()
        }
      })
    }
  }
}

register(FinalRound)
