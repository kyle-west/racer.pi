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

  td[data-manual="true"]::after {
    content: ' *';
    opacity: 0.6;
    font-style: italic;
  }
`

export default class Heat extends WebComponent {
  static is = 'race-heat';
  static observedAttributes = ['round', 'heat'];

  constructor () {   
    super(() => dom`
      ${styles}
      <section id="heat-${this.attrs.heat}">
        <h2>Heat ${this.attrs.heat}</h2>
        <table>
          <thead>
            <tr><th>Assignment</th><th>Car Name</th><th>Time</th><th>Place</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
          ${inline(Object.entries(this._laneAssignments).map(([laneNumber, { name }]) => `
            <tr id="lane-${laneNumber}">
              <td>Lane ${laneNumber}</td>
              <th>${name}</th>
              <td id="lane-${laneNumber}-time"></td>
              <td id="lane-${laneNumber}-place"></td>
              <td id="lane-${laneNumber}-status"></td>
              <td><button name="edit-lane" data-heat="${this.attrs.heat}" data-lane="${laneNumber}" no-styles title="Edit">✏</button></td>
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
    laneEntries.forEach(([laneNumber, time], idx) => {
      if (!this.$(`#lane-${laneNumber}`)) return // for partially full track

      const timeCell = this.$(`#lane-${laneNumber}-time`)
      timeCell.innerHTML = time + 's'
      if (this.manualLanes?.has(`${this.attrs.heat}-${laneNumber}`)) {
        timeCell.dataset.manual = 'true'
      }

      const rank = idx + 1
      const order = formatOrdinals(rank)
      this.$(`#lane-${laneNumber}-place`).innerHTML = order

      const status = this.computeStatus(rank, this._laneAssignments[laneNumber])
      this.$(`#lane-${laneNumber}-status`).innerHTML = status
      this.$(`#lane-${laneNumber}`).classList.add(status.replace(/\W+/g, '-'))
    })
  }

  onClickEditLane (evt) {
    this.dispatchEvent(new CustomEvent('lane-edit-request', {
      bubbles: true,
      composed: true,
      detail: { heat: +evt.element.dataset.heat, lane: +evt.element.dataset.lane }
    }))
  }

  restart () {
    this.$$(`td[id]`).forEach(elem => elem.innerHTML = '')
    this.$$(`tr`).forEach(elem => elem.className = '')
  }
}

register(Heat)
