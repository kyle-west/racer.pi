import { WebComponent, wc, register, css } from '../dom.js'
import { Timer } from '../timer.js'

const styles = css`
  pre {
    font-size: 30px;
    white-space: pre-wrap;
  }
`

const template = wc`
  ${styles}
  <pre></pre>
`
export default class TimerComponent extends WebComponent {
  static is = 'timer-component';
  constructor () {
    super(template)

    const timerDOM = this.$('pre')
    this._timer = new Timer((time) => {
      timerDOM.innerHTML = `Time: ${(time/1000).toFixed(3)}s`
    }, 17)
  }

  clear () { this.$('pre').innerHTML = 'Ready.' }
  start () { this._timer.start() }
  stop  () { return this._timer.stop() }
  
  display (message) {
    this.$('pre').innerHTML = message
  }
}

register(TimerComponent)
