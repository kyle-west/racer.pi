import env from '/env'
import { WebComponent, wc, register } from '../dom.js'
import EliminationRound from './EliminationRound.js'

const totalLanes = env.LANE_COUNT
const halfOfTheLanes = Math.floor(totalLanes/2)

const template = wc`
  <h1>Second Elimination Round</h1>

  <${EliminationRound.is} number="2">
    <div slot="start-message">
      <p>
        All the cars with one loss will be run in heats again. Cars that receive a
        second loss will be eliminated from the race. Heats will continue until all the
        cars have been run and only ${halfOfTheLanes} cars remain with a single loss.
        These ${halfOfTheLanes} cars will join the other ${halfOfTheLanes} cars in the
        Finals.
      </p>

      <button name="continue">Begin Round 2</button>
    </div>
  </${EliminationRound.is}>
`

export default class Round2 extends WebComponent {
  static is = 'round-two';
  constructor () { 
    super(template)
  }
}

register(Round2)
