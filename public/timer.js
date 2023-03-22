export class Timer {
  constructor (onTick, sampleRate) {
    this.onTick = onTick
    this.sampleRate = sampleRate || 100
  }

  start () {
    this._time = Date.now()
    this.timer = setInterval(() => {
      this.time = Date.now() - this._time
      if (this.onTick) this.onTick(this.time)
    }, this.sampleRate)
  }

  stop () {
    clearInterval(this.timer)
    this.timer = null
  }
}