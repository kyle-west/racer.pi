require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const WebSocket = require('ws')
const { interpolate, listenMsg } = require('./lib/util')
const Race = require('./lib/Race')

const {
  BTN_START,
  BTN_LANE_1,
  BTN_LANE_2,
  BTN_LANE_3,
  BTN_LANE_4,
  SERVER_PORT,
  WS_PORT,
} = process.env

const LANES = {
  1: BTN_LANE_1,
  2: BTN_LANE_2,
  3: BTN_LANE_3,
  4: BTN_LANE_4,
}

// --------------------------------------------------------------------------
// Server / WebSocket Config 
// --------------------------------------------------------------------------
const wss = new WebSocket.Server({ port: WS_PORT })

function Message (type, data = {}) {
  return JSON.stringify({ type, data })
}

// Broadcasts data to every connection
function broadcast(type, data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(Message(type, data))
    }
  });
};

// --------------------------------------------------------------------------
// Race data management
// --------------------------------------------------------------------------
const RACE = new Race({
  autoEndWhenNumResults: Object.entries(LANES).length,
  onRaceStart: (data) => {
    console.log(data)
    broadcast('RACE_START', data)
  },
  onRaceUpdate: (data) => {
    console.log(data)
    broadcast('RACE_UPDATE', data)
  },
  onRaceEnd: (data) => {
    console.log(data)
    broadcast('RACE_END', data)
  },
})
function raceEntry ({state, name}) {
  // only listen to ButtonDown events
  if (state === 1) {
    switch(name) {
      case BTN_START:  !RACE.active ? RACE.start() : RACE.end(); break;
      case BTN_LANE_1: RACE.crossFinishLine(BTN_LANE_1); break;
      case BTN_LANE_2: RACE.crossFinishLine(BTN_LANE_2); break;
      case BTN_LANE_3: RACE.crossFinishLine(BTN_LANE_3); break;
      case BTN_LANE_4: RACE.crossFinishLine(BTN_LANE_4); break;
    }
  }
}


// --------------------------------------------------------------------------
// Service handlers
// --------------------------------------------------------------------------
app.use(express.static('public'))

app.get('/config', (req, res) => res.json({ SERVER_PORT, WS_PORT, LANES }))

app.get('/gpio', (req, res) => {
  const entry = {
    name : interpolate(req.query.name),
    state:  interpolate(req.query.state),
  }
  console.log(entry)
  raceEntry(entry)
  res.sendStatus(204)
})

app.get('/', (req, res) => res.sendFile(path.resolve('.', './public/index.html')))


// --------------------------------------------------------------------------

wss.on('connection', ws => ws.send(Message('RACE_INIT', RACE.latest)))

app.listen(SERVER_PORT, listenMsg({ port: SERVER_PORT, pre: `Node Service Started. Hosted at:` }))
