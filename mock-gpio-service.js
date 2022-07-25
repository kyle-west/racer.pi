require('dotenv').config()
const prompt = require('prompt')
const express = require('express')
const app = express()
const { listenMsg } = require('./lib/util')

const PORT = process.env.MOCK_GPIO_PORT

let CURRENT_STATE = {
  startTime: null,
  running: false,
  times: {}
}

app.get('/lane-state', (req, res) => res.json(CURRENT_STATE))

function validLane (lane) {
  const valid = lane && /^\w$/.test(lane)
  return valid && lane
}

function processActionInput (err, result) {
  if (err) { console.log(err); return 1 }
  
  switch (result?.action) {
    case 'start': {
      CURRENT_STATE.running = true;
      CURRENT_STATE.startTime = Date.now()
      CURRENT_STATE.times = {}
      console.log('  Marking race as "STARTED" at:', new Date(CURRENT_STATE.startTime).toISOString())
      break;
    }
    case 'end': {
      CURRENT_STATE.running = false
      console.log(`  Marking race as "ENDED" (from ${new Date(CURRENT_STATE.startTime).toISOString()})`)
      break;
    }
    case 'current': {
      console.log(CURRENT_STATE)
      break;
    }
    default: {
      const lane = validLane(result?.action)
      if (lane) {
        const time = Date.now() - CURRENT_STATE.startTime;
        CURRENT_STATE.times[lane] = time
        console.log(`  Marking LANE ${lane} with time of ${time}`)
      } else if (result?.action) {
        console.log(`unknown action or laneId: "${result?.action}" `)
      }
    }
  }
  
  prompt.get([{ name: 'action', minItems: 0, required: false, description: 'enter [start|end|<lane-id>|current] >' }], processActionInput)
}

app.listen(PORT, () => {
  listenMsg({ port: PORT, pre: `MOCK GPIO Service Started. Hosted at:` })()

  prompt.message = '$ '
  prompt.delimiter = ''
  prompt.start()
  processActionInput()
})
