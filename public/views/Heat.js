import env from '/env'
import { WebComponent, dom, register, inline, css } from '../dom.js'
import { formatOrdinals } from '../util.js'

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

  tr.Continuing, tr.Finished { background-color: #eff6ff !important; }
  tr.Eliminated { background-color: #fff1f2 !important; }
  tr.Finalist, tr.First { background-color: #f0fdf4 !important; }

  .hidden {
    display: none;
  }

  td {
    transition: background-color 0.25s;
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
              <td><button name="edit-lane" data-heat="${this.attrs.heat}" data-lane="${laneNumber}" no-styles><img src="/assets/pencil.svg" style="width:1rem;height:1rem;display:block;pointer-events:none" alt="Edit" title="Edit"></button></td>
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
