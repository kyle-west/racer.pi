import { WebComponent, wc, register, css } from '../dom.js'
import { Timer } from '../timer.js'

const styles = css`
  :host {
    display: block;
    margin: 1rem 0;
  }
  pre {
    font-size: 1.75rem;
    font-family: 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace;
    font-weight: 600;
    color: var(--text, #0f172a);
    margin: 0;
    white-space: pre-wrap;
    letter-spacing: -0.01em;
    line-height: 1.4;
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
