import { attach } from './dom.js'
import Welcome from './views/Welcome.js'
import CarConfig from './views/CarConfig.js'
import Round1 from './views/Round1.js'

const appNode = document.getElementById('app')

attach(appNode, Welcome)

document.addEventListener('view-rules', () => attach(appNode, Welcome))
document.addEventListener('view-car-config', () => attach(appNode, CarConfig))
document.addEventListener('view-round-one', () => attach(appNode, Round1))
