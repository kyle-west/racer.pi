module.exports = class Race {
  constructor({ debug }) {
    this.timer = { lanes: {} }
    this.active = false
    this.debug = !!debug
  }

  start () {
    if (this.active) return
    this.timer.start = Date.now()
    this.time.lanes = {}
    this.timer.end = null
    this.active = true
  }
  
  crossFinishLine(lane) {
    const time = Date.now() - this.timer.start
    this.timer.lanes[lane] = time
    this.debug && console.log(`Lane <${lane}> completed race in ${time}ms`)
    return this.times
  }

  end () {
    if (!this.active) return
    this.timer.end = Date.now()
    this.active = false
  }

  get times () {
    return this.lanes
  }
}