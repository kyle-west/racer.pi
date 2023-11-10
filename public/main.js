import { attach } from './dom.js'
import Welcome from './views/Welcome.js'
import CarConfig from './views/CarConfig.js'
import Round1 from './views/Round1.js'
import Round2 from './views/Round2.js'
import { localStorage } from './storage.js'
import FinalRound from './views/FinalRound.js'

import './debug.js'

const appNode = document.getElementById('app')

const finalsData = localStorage.get('finals')
if (finalsData) {
  attach(appNode, FinalRound)
} else {
  const raceData = localStorage.get('races')
  if (raceData?.round?.[2]) {
    attach(appNode, Round2)
  } else if (raceData?.round?.[1]) {
    attach(appNode, Round1)
  } else {
    attach(appNode, Welcome)
  }
}


document.addEventListener('view-rules', () => attach(appNode, Welcome))
document.addEventListener('view-car-config', () => attach(appNode, CarConfig))
document.addEventListener('view-round-one', () => attach(appNode, Round1))
document.addEventListener('view-round-two', () => attach(appNode, Round2))
document.addEventListener('view-final-round', () => attach(appNode, FinalRound))
document.addEventListener('view-results', () => {
  localStorage.set('results-committed', 'true')
  window.location.href = '/cars'
})