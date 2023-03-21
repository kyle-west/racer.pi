import { attach } from './dom.js'
import CarConfig from './views/CarConfig.js'
import Welcome from './views/Welcome.js'

const appNode = document.getElementById('app')

attach(appNode, Welcome)

document.addEventListener('view-rules', () => attach(appNode, Welcome))
document.addEventListener('view-car-config', () => attach(appNode, CarConfig))
