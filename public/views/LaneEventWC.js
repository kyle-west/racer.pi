import { WebComponent } from '../dom.js'

function bindOnEval(getHandler, scope) {
  return (...args) => {
    const handler = getHandler()
    if (handler) {
      handler.bind(scope)(...args)
    }
  }
}

export default class LaneEventWC extends WebComponent {
  connectedCallback() {
    const raceStart = bindOnEval(() => this.onRaceStart, this)
    const raceUpdate = bindOnEval(() => this.onRaceUpdate, this)
    const raceEnd = bindOnEval(() => this.onRaceEnd, this)

    document.addEventListener('race-start', raceStart)
    document.addEventListener('race-update', raceUpdate)
    document.addEventListener('race-end', raceEnd)

    this.cleanup = () => {
      document.removeEventListener('race-start', raceStart)
      document.removeEventListener('race-update', raceUpdate)
      document.removeEventListener('race-end', raceEnd)
    }
  }
  disconnectedCallback () { this.cleanup() }
}
