const express = require('express')
const path = require('path')
const ip = require("ip")
const app = express()
const WebSocket = require('ws')
const watch = require('node-watch')
const { interpolate } = require('./lib/util')

const port = process.env.PORT || 8000
const wsPort = port + 1

const wss = new WebSocket.Server({ port: wsPort })

app.use(express.static('public'))

app.get('/config', (req, res) => res.json({ port, wsPort }))

app.get('/gpio', (req, res) => {
  const entry = {}
  entry.name = interpolate(req.query.name)
  entry.state = interpolate(req.query.state)
  console.log(entry)
  res.sendStatus(204)
})

app.get('/', (req, res) => res.sendFile(path.resolve('.', './public/index.html')))

// Broadcasts data to every connection
// function broadcast(type, data = {}) {
//   wss.clients.forEach(function each(client) {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify({ type, data }))
//     }
//   });
// };

wss.on('connection', ws => ws.send('hello from server'))

app.listen(port, () => {
  let localhostURL = port === 80 ? 'http://localhost/' : `http://localhost:${port}/`
  let ipURL = port === 80 ? `http://${ip.address()}/` : `http://${ip.address()}:${port}/`
  console.log(`${localhostURL}\n  ${ipURL}`)
})
