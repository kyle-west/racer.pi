import { WebComponent, wc } from '../dom.js'

const template = wc`
  <h1>Welcome!</h1>
`

console.log(template())

export default class Welcome extends WebComponent {
  static is = 'welcome-view'

  constructor() {
    super(template);
    console.log(this.children)
  }
}