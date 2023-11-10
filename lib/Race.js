const LANE_COUNT = +(process.env.LANE_COUNT || 0)
const result = ([name, time]) => ({name, time})

module.exports = class Race {
  constructor(evenHandlers = {}) {
    Object.assign(this, evenHandlers, { state : {} })

    this.active = false
    this.state.lanes = {}
  }

  start () {
    console.log('RACE STARTED!')
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
    console.log('TIME:', { lane, time })
    this.state.lanes[lane] = time
    this.onRaceUpdate && this.onRaceUpdate(this.state)
    
    // auto end race when all the results come in
    if (LANE_COUNT === Object.entries(this.state.lanes).length) {
      this.end()
    }
  }
  
  end () {
    console.log('RACE ENDED.')
    if (!this.active) return
    const [ first, second, third ] = Object.entries(this.state.lanes).sort(([x,a], [y,b]) => a - b)
    this.state.winners = { first: result(first), second: result(second), third: result(third) }
    this.active = false
    this.onRaceEnd && this.onRaceEnd(this.state)
  }

  get latest () {
    return { ...this.state, active: this.active }
  }

  static toCSVArray (fullRaceData) {
    const csv = [['Round', 'Heat', 'Lane', 'Name', 'Time', 'Status']]

    const hu = (str) => str.replace(/_/g, ' ').replace(/(?:^|\s)\S/g, a => a.toUpperCase())

    const points = {}
    const registerPoints = (name, pts) => {
      points[name] = points[name] || 0
      points[name] += Number(pts)
    }
    
    Object.entries(fullRaceData).forEach(([round, heats]) => {
      Object.entries(heats).forEach(([heat, lanes]) => {
        Object.entries(lanes).forEach(([lane, { id, name, time, status, points }]) => {
          if (points) registerPoints(name, points)
          csv.push([hu(round), hu(heat), hu(lane), name, time, points ? `${points} pts` : status])
        })
      })
    })

    // Append winner information
    csv.push(['','','','','',''])
    csv.push(['','','','','',''])
    csv.push(['Results','','','','',''])
    csv.push(['Place','Name','Points','','',''])

    const sortedPoints = Object.entries(points).sort(([a, x], [b, y]) => x - y)
    
    sortedPoints.forEach(([name, pts], i) => {
      csv.push([i + 1, name, pts, i === 0 ? 'WINNER' : '', '', ''])
    })

    return csv
  }
}