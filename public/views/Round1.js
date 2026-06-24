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
