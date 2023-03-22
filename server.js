require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const WebSocket = require('ws')
const { interpolate, listenMsg } = require('./lib/util')
const Race = require('./lib/Race')

const {
  SERVER_PORT,
  WS_PORT,
  LANE_COUNT,
  TRACK_LENGTH_IN_FEET,
} = process.env

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
const raceEventHandlers = {
  onRaceStart: (data) => broadcast('RACE_START', data),
  onRaceUpdate: (data) => broadcast('RACE_UPDATE', data),
  onRaceEnd: (data) => broadcast('RACE_END', data)
}
let CURRENT_RACE = new Race(raceEventHandlers)

// --------------------------------------------------------------------------
// Service handlers
// --------------------------------------------------------------------------
app.use(express.static('public'))

app.get('/env', (req, res) => {
  res.setHeader('Content-Type', "application/javascript")
  res.send(`export default {
    SERVER_PORT: ${SERVER_PORT},
    WS_PORT: ${WS_PORT},
    LANE_COUNT: ${LANE_COUNT},
    TRACK_LENGTH_IN_FEET: ${TRACK_LENGTH_IN_FEET},
  }`)
})

app.post('/gpio/start', (req, res) => {
  CURRENT_RACE.start()
  res.sendStatus(204)
})

app.post('/gpio/time', (req, res) => {
  const lane = interpolate(req.query.lane)
  const time = interpolate(req.query.time)
  CURRENT_RACE.crossFinishLine(lane, time)
  res.sendStatus(204)
})

app.get('/', (req, res) => res.sendFile(path.resolve('.', './public/index.html')))

// --------------------------------------------------------------------------

wss.on('connection', ws => ws.send(Message('RACE_CURRENT', CURRENT_RACE.latest)))

app.listen(SERVER_PORT, listenMsg({ port: SERVER_PORT, pre: `Node Service Started. Hosted at:` }))
