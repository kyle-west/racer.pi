import env from '/env'
import { WebComponent, wc, register, css } from '../dom.js'
import EliminationRound from './EliminationRound.js'

const totalLanes = env.LANE_COUNT
const halfOfTheLanes = Math.floor(totalLanes/2)

const styles = css`
  p {
    color: var(--text, #0f172a);
    margin: 0 0 1rem;
    line-height: 1.65;
  }
  button[name="continue"] {
    background-color: var(--accent, #4263eb);
    color: white;
    border-color: var(--accent, #4263eb);
    font-weight: 600;
    padding: 9px 22px;
  }
  button[name="continue"]:hover {
    background-color: var(--accent-hover, #3451d1);
    border-color: var(--accent-hover, #3451d1);
    box-shadow: 0 2px 8px rgba(66, 99, 235, 0.25);
  }
`

const template = wc`
  ${styles}
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
