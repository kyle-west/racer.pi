const result = ([name, time]) => ({name, time})

module.exports = class Race {
  constructor(config) {
    Object.assign(this, config, {
      state: {},
      active: false
    })
  }

  start () {
    if (this.active) return
    this.state.start = Date.now()
    this.state.lanes = {}
    this.state.end = null
    this.active = true
    this.debug && console.log('Race Started.')
    this.onRaceStart && this.onRaceStart(this.state)
  }
  
  crossFinishLine(lane) {
    if (!this.active || this.state.lanes[lane]) return
    const time = Date.now() - this.state.start
    this.state.lanes[lane] = time
    this.debug && console.log(`Lane <${lane}> completed race in ${time}ms`)
    this.onRaceUpdate && this.onRaceUpdate(this.state)
    if (this.autoEndWhenNumResults === Object.entries(this.state.lanes).length) {
      this.end()
    }
  }
  
  end () {
    if (!this.active) return
    const [ first, second, third ] = Object.entries(this.state.lanes).sort(([x,a], [y,b]) => a - b)
    this.state.winners = { first: result(first), second: result(second), third: result(third) }
    this.active = false
    this.debug && console.log('Race Ended.')
    this.onRaceEnd && this.onRaceEnd(this.state)
  }

  get latest () {
    return { ...this.state, active: this.active }
  }
}