const $$ = {
  title: document.getElementById('race-title'),
  info: document.getElementById('race-info'),
}

function pinMsg (pin, msg) {
  let elem = document.createElement('p')
  elem.className = 'pin'
  elem.innerText = msg
  pin.appendChild(elem)
}

function raceInit({ start, lanes, end }) {
  if (!start) {
    pinMsg($$.info, `Race has not begun.`)
  } else {
    pinMsg($$.info, `Race in progress.`)
  }
}

function raceStart({ start, lanes, end }) {
  pinMsg($$.info, `Race has started!`)
}

function raceUpdate({ start, lanes, end }) {
  pinMsg($$.info, `Update: ${JSON.stringify(lanes)}`)
}

function raceEnd({ start, lanes, end }) {
  pinMsg($$.info, `Race has ended.`)
}