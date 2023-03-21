import env from '/env'
import { WebComponent, wc, dom, register, inline } from '../dom.js'
import CarConfig from './CarConfig.js'
import { localStorage } from '../storage.js'

const totalLanes = env.LANE_COUNT
const halfOfTheLanes = Math.floor(totalLanes/2)

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

const heatResults = ({ continuing = [], eliminated = [] }) => dom`
  ${inline(continuing.length > 0 && '<h3>Winners!</h3><ol>')}
  ${inline(continuing.map(({ name, weight, time }) => `<li>${name}[${weight}] - ${time}</li>`))}
  ${inline(continuing.length > 0 && '</ol>')}
  ${inline(eliminated.length > 0 && `<h3>Eliminated</h3><ol start="${halfOfTheLanes}">`)}
  ${inline(eliminated.map(({ name, weight, time }) => `<li>${name}[${weight}] - ${time}</li>`))}
  ${inline(eliminated.length > 0 && '</ol>')}
`

const round = wc`
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

        <p>Lane Assignments:</p>
        <dl>
          ${inline(Object.entries(assignments).map(([laneNumber, { name, weight }]) => `
            <dt>Lane ${laneNumber}</dt><dd>${name}[${weight}]</dd>
          `))}
        </dl>

        <button id="action" name="start-race">Start!</button>
        <div id="${this.heatNumber}-results"></div>
      </section>
    `)
  }

  onClickStartRace () {
    // TODO: call endpoint and listen to lane events
  }
}

register(Round1)
