import env from '/env'
import { WebComponent, wc, dom, register, css } from '../dom.js'

const totalLanes = env.LANE_COUNT
const halfOfTheLanes = Math.floor(totalLanes/2)

const styles = css`
  :host {
    display: block;
  }
  h2 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text, #0f172a);
    margin: 2rem 0 0.5rem;
  }
  p {
    color: var(--text, #0f172a);
    margin: 0 0 1rem;
  }
  ul {
    margin: 0 0 1rem;
    padding-left: 1.5rem;
  }
  li {
    margin-bottom: 0.25rem;
  }
  a {
    color: var(--accent, #4263eb);
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  button[name="continue"] {
    margin-top: 0.75rem;
    padding: 10px 28px;
    background-color: var(--accent, #4263eb);
    color: white;
    border-color: var(--accent, #4263eb);
    font-size: 0.9375rem;
    font-weight: 600;
  }
  button[name="continue"]:hover {
    background-color: var(--accent-hover, #3451d1);
    border-color: var(--accent-hover, #3451d1);
    box-shadow: 0 2px 8px rgba(66, 99, 235, 0.25);
  }
`

const template = wc`
  ${styles}
  <h1>Welcome!</h1>

  <h2>Double Elimination Race Format</h2>
  <p>
    All cars will race in a double elimination format. Racing will take place on
    a ${totalLanes}-lane track, with cars randomly chosen to race in heats. The
    first ${halfOfTheLanes} cars that finish in a heat are considered a “win”, and
    the last ${halfOfTheLanes} cars to finish are considered a “loss”. When a car
    receives its first loss it will be set aside. Heats will continue to be run 
    until only ${halfOfTheLanes} cars remain without a loss – those ${halfOfTheLanes}
    cars are automatically in the Finals.
  </p>

  <p>
    Then all the cars with one loss will be run in heats again. Cars that receive a
    second loss will be eliminated from the race. Heats will continue until all the
    cars have been run and only ${halfOfTheLanes} cars remain with a single loss.
    These ${halfOfTheLanes} cars will join the other ${halfOfTheLanes} cars in the
    Finals.
  </p>

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

  <p>
    You can <a target="_blank" href="/cars">open the leader board</a> in a new tab if
    you want to see just the results.
  </p>

  <button name="continue">Continue</button>
`
export default class Welcome extends WebComponent {
  static is = 'welcome-message';
  constructor () { super(template) }

  onClickContinue () {
    document.dispatchEvent(new CustomEvent('view-car-config'))
  }
}

register(Welcome)
