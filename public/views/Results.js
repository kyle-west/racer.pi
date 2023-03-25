import { WebComponent, wc, register } from '../dom.js'

const template = wc`
  <h1>Stats</h1>

  Todo: add summary of event
`
export default class Results extends WebComponent {
  static is = 'results-and-stats';
  constructor () { super(template) }
}

register(Results)
