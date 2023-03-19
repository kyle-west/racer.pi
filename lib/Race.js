const LANE_COUNT = +(process.env.LANE_COUNT || 0)
const result = ([name, time]) => ({name, time})

module.exports = class Race {
  constructor(evenHandlers = {}) {
    Object.assign(this, evenHandlers, { state : {} })

    this.active = false
    this.state.lanes = {}
  }

  start () {
    if (this.active) return
    this.state.lanes = {}
    this.active = true
    this.onRaceStart && this.onRaceStart(this.state)
  }

  restart () {
    this.active = false
    this.state = {}
    this.start()
  }
  
  crossFinishLine(lane, time) {
    if (!this.active || this.state.lanes[lane]) return
    this.state.lanes[lane] = time
    this.onRaceUpdate && this.onRaceUpdate(this.state)
    
    // auto end race when all the results come in
    if (LANE_COUNT === Object.entries(this.state.lanes).length) {
      this.end()
    }
  }
  
  end () {
    if (!this.active) return
    const [ first, second, third ] = Object.entries(this.state.lanes).sort(([x,a], [y,b]) => a - b)
    this.state.winners = { first: result(first), second: result(second), third: result(third) }
    this.active = false
    this.onRaceEnd && this.onRaceEnd(this.state)
  }

  get latest () {
    return { ...this.state, active: this.active }
  }
}