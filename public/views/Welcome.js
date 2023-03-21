import env from '/env'
import { WebComponent, wc, dom, register } from '../dom.js'

const totalLanes = env.LANE_COUNT
const halfOfTheLanes = Math.floor(totalLanes/2)

const template = wc`
  <h1>Welcome!</h1>

  <h2>Double Elimination Race Format</h2>
  <p>
    All cars will race in a double elimination format. Racing will take place on a ${totalLanes}-lane track, 
    with cars randomly chosen to race in heats. The first ${halfOfTheLanes} cars that finish in a heat are considered
    a “win”, and the last ${halfOfTheLanes} cars to finish are considered a “loss”. When a car receives its first 
    loss it will be set aside. Heats will continue to be run until only ${halfOfTheLanes} cars remain without a loss 
    – those ${halfOfTheLanes} cars are automatically in the Finals.
  </p>

  <p>
    Then all the cars with one loss will be run in heats again. Cars that receive a second
    loss will be eliminated from the race. Heats will continue until all the cars have been run
    and only ${halfOfTheLanes} cars remain with a single loss. These ${halfOfTheLanes} cars will
    join the other ${halfOfTheLanes} cars in the Finals.
  </p>

  <p>
    For the Finals, the ${totalLanes} remaining cars will run ${totalLanes} heats. Each car will run one heat in
    each lane. Cars receive:
  </p>
  <ul>
    <li>1 point for a first-place finish</li>
    <li>2 points for second place</li>
    <li>3 points for third place</li>
    <li>etc...</li>
  </ul> 
  <p>
    After ${totalLanes} heats, the car with the lowest total score is the winner of the derby!
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
