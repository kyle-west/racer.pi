import env from '/env'
import { WebComponent, dom, register, inline, css } from '../dom.js'
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

  tr.Continuing, tr.Finished { background-color: lightblue !important; }
  tr.Eliminated { background-color: lightpink !important; }
  tr.Finalist, tr.First   { background-color: lightgreen !important; }

  .hidden {
    display: none;
  }

  td {
    transition: all 0.3s;
  }
`

export default class Heat extends WebComponent {
  static is = 'race-heat';
  static observedAttributes = ['round', 'heat', 'completed'];

  constructor () {   
    super(() => dom`
      ${styles}
      <section id="heat-${this.attrs.heat}">
        <h2>Heat ${this.attrs.heat}</h2>
        <table>
          <thead>
            <tr><th>Assignment</th><th>Car Name</th><th>Time</th><th>Place</th><th>Status</th></tr>
          </thead>
          <tbody>
          ${inline(Object.entries(this._laneAssignments).map(([laneNumber, { name }]) => `
            <tr id="lane-${laneNumber}">
              <td>Lane ${laneNumber}</td>
              <th>${name}</th>
              <td id="lane-${laneNumber}-time" name="laneTime"></td>
              <td id="lane-${laneNumber}-place"></td>
              <td id="lane-${laneNumber}-status"></td>
            </tr>
          `))}
          </tbody>
        </table>
      </section>
    `, { defer: true })
    this._laneAssignments = []
  }

  set laneAssignments (assignments) {
    this._laneAssignments = assignments
    this.render()
  }

  computeStatus (rank) {
    const win = this.finalHeat ? 'Finalist' : 'Continuing'
    return rank < halfOfTheLanes ? win : 'Eliminated'
  }

  updateLaneInfo (laneEntries) {
    this._lastEntries = laneEntries
    laneEntries.forEach(([laneNumber, time], idx) => {
      if (!this.$(`#lane-${laneNumber}`)) return // for partially full track
      
      this.$(`#lane-${laneNumber}-time`).innerHTML = this.attrs.completed 
        ? `${time}s` 
        : `<input value="${time}" class="timeInput" name="laneTime" data-lane="${laneNumber}" type="number" step="0.000000000001"/>`
      
      const rank = idx + 1
      const order = formatOrdinals(rank)
      this.$(`#lane-${laneNumber}-place`).innerHTML = order

      const status = this.computeStatus(rank, this._laneAssignments[laneNumber])
      this.$(`#lane-${laneNumber}-status`).innerHTML = status
      this.$(`#lane-${laneNumber}`).classList.add(status.replace(/\W+/g, '-'))
    })
  }

  restart () {
    this.$$(`td[id]`).forEach(elem => elem.innerHTML = '')
    this.$$(`tr`).forEach(elem => elem.className = '')
  }

  onAttributeChange (name) {
    if (name === 'completed') {
      this.updateLaneInfo(this._lastEntries)
    }
  }

  // THIS IS WHERE I LEFT OFF LAST   <<<=========================================================
  onInputLaneTime(event) {
    console.log('input', event)
    // TODO: add confirmation dialog
  }
  onBlurLaneTime(event) {
    console.log('blur', event)
    // TODO: add confirmation dialog
  }

  // The blur event only fires when the webComponent loses focus
  onClickLaneTime(event) {
    if (this.__activeInput && this.__activeInput !== event.element.value) {
      this.__activeInput = event.element.value
      this.onBlurLaneTime(event)
    }
  }
}

register(Heat)
