import env from '/env'
import { WebComponent, wc, register } from '../dom.js'
import EliminationRound from './EliminationRound.js'

const totalLanes = env.LANE_COUNT
const halfOfTheLanes = Math.floor(totalLanes/2)

const template = wc`
  <h1>First Elimination Round</h1>

  <${EliminationRound.is} number="1">
    <div slot="start-message">
      <p>
        Racing will take place on a ${totalLanes}-lane track, with cars randomly 
        chosen to race in heats. The first ${halfOfTheLanes} cars that finish in
        a heat are considered a “win”, and the last ${halfOfTheLanes} cars to finish
        are considered a “loss”. When a car receives its first loss it will be set
        aside until the second round. Heats will continue to be run until only 
        ${halfOfTheLanes} cars remain without a loss – those ${halfOfTheLanes}
        cars are automatically in the Finals.
      </p>

      <button name="configure-racers">Configure Racers</button>
      <button name="continue">Begin Round 1</button>
    </div>
  </${EliminationRound.is}>
`

export default class Round1 extends WebComponent {
  static is = 'round-one';
  constructor () { 
    super(template)
  }
}

register(Round1)
