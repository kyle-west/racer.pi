require('dotenv').config()
const express = require('express')
const path = require('path')
const ip = require("ip")
const app = express()
const WebSocket = require('ws')
const { interpolate } = require('./lib/util')
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

// --------------------------------------------------------------------------
// Race data management
// --------------------------------------------------------------------------
const RACE = new Race({debug: true})
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
// Server / WebSocket Config 
// --------------------------------------------------------------------------
const wss = new WebSocket.Server({ port: WS_PORT })



// --------------------------------------------------------------------------
// Service handlers
// --------------------------------------------------------------------------
app.use(express.static('public'))

app.get('/config', (req, res) => res.json({ SERVER_PORT, WS_PORT }))

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
// WebSocket handlers
// --------------------------------------------------------------------------
// Broadcasts data to every connection
// function broadcast(type, data = {}) {
//   wss.clients.forEach(function each(client) {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify({ type, data }))
//     }
//   });
// };
wss.on('connection', ws => ws.send('hello from server'))

app.listen(SERVER_PORT, () => {
  let localhostURL = SERVER_PORT === 80 ? 'http://localhost/' : `http://localhost:${SERVER_PORT}/`
  let ipURL = SERVER_PORT === 80 ? `http://${ip.address()}/` : `http://${ip.address()}:${SERVER_PORT}/`
  console.log(`${localhostURL}\n  ${ipURL}`)
})
