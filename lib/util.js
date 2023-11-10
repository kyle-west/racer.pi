const ip = require("ip")

const interpolate = (str) => {
  const num = parseFloat(str)
  return isNaN(num) ? str : num;
}

const listenMsg = ({ port, pre, post }) => () => {
  let localhostURL = port === 80 ? 'http://localhost/' : `http://localhost:${port}/`
  let ipURL = port === 80 ? `http://${ip.address()}/` : `http://${ip.address()}:${port}/`
  pre && console.log(pre)
  console.log(`${localhostURL}\n  ${ipURL}`)
  post && console.log(post)
}

function toCSVString (array) {
  return array.map(row => row.join(',')).join('\n')
}

module.exports = {
  interpolate,
  listenMsg,
  toCSVString,
}