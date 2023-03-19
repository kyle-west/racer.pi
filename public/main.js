import { attach } from './dom.js'
import Welcome from './views/Welcome.js'

const appNode = document.getElementById('app')

attach(appNode, Welcome)

// document.addEventListener('race-init', () => {})
