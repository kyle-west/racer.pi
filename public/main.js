const $$ = {
  title: document.getElementById('race-title'),
  timer: document.getElementById('timer'),
  info: document.getElementById('race-info'),
  lane1Timer: document.getElementById('lane1-timer'),
  lane2Timer: document.getElementById('lane2-timer'),
  lane3Timer: document.getElementById('lane3-timer'),
  lane4Timer: document.getElementById('lane4-timer'),
}

function pinMsg (pin, msg, clean = false) {
  while (clean && pin.firstChild) {
    pin.removeChild(pin.firstChild)
  }
  let elem = document.createElement('p')
  elem.className = 'pin'
  elem.innerHTML = msg
  pin.appendChild(elem)
}

class Timer {
  constructor (binding) {
    this.elem = binding
  }

  start (base = Date.now()) {
    this.startTime = base
    clearInterval(this._interval)
    this._interval = setInterval(() => {
      this.update()
    }, 13)
  }
  
  update (current = Date.now(), noCalc) {
    const diff = current - this.startTime
    pinMsg(this.elem, Timer.format(noCalc ? current : diff), true)
  }
  
  end (base = Date.now(), noCalc) {
    this.endTime = base
    clearInterval(this._interval)
    this.update(this.endTime, noCalc)
  }

  static format (ms) {
    return (ms / Timer.SECONDS).toFixed(3).padStart(6, '0') + 's'
  }
  static SECONDS = 1000;
}

const timers = {
  global: new Timer($$.timer),
  lane1: new Timer($$.lane1Timer),
  lane2: new Timer($$.lane2Timer),
  lane3: new Timer($$.lane3Timer),
  lane4: new Timer($$.lane4Timer),
}

function lookupLaneByName (name) {
  return 'lane' + Object.entries(window.LANES).find(([lane, lname]) => lname === name)[0]
}

function raceInit({ start, active }) {
  if (active) {
    pinMsg($$.info, `Race in progress.`)
    raceStart({ start })
  } else {
    pinMsg($$.info, `Race has not begun.`)
  }
}

function raceStart({ start }) {
  timers.global.start(start)
  Object.entries(window.LANES).forEach(([num]) => {
    timers[`lane${num}`].start(start)
  })
  pinMsg($$.info, `Race has started!`)
}

function raceUpdate({ lanes }) {
  Object.entries(lanes).forEach(([name, time]) => {
    const lane = lookupLaneByName(name)
    timers[lane].end(time, true)
  })
  pinMsg($$.info, `Update: ${JSON.stringify(lanes)}`)
}

function raceEnd({ lanes, winners: { first, second, third } }) {
  timers.global.end(first.time, true)
  pinMsg($$.info, `Race has ended.`)
  pinMsg($$.info, `${lookupLaneByName(first.name).toUpperCase()} got first place with ${Timer.format(first.time)}ms!`)
  pinMsg($$.info, `${lookupLaneByName(second.name).toUpperCase()} got second place with ${Timer.format(second.time)}ms!`)
  pinMsg($$.info, `${lookupLaneByName(third.name).toUpperCase()} got third place with ${Timer.format(third.time)}ms!`)
}