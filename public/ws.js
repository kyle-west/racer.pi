window.serverConfigPromise = window.fetch('/config').then(r => r.json())

function notify (name, details) {
  document.dispatchEvent(new CustomEvent(name, { details }))
}

window.serverConfigPromise.then((config) => {
  window.LANES = config.LANES
  // Create WebSocket connection.
  const socket = new WebSocket(`ws://${window.location.hostname}:${config.WS_PORT}`);
  
  // Connection opened
  socket.addEventListener('open', function (event) {
    socket.send(JSON.stringify({ message: 'Ready' }));
  });
  
  // Listen for messages
  socket.addEventListener('message', function ({ data: wsData }) {
    const { type, data } = JSON.parse(wsData)
    console.log('[SERVER EVENT]', type, data)
    switch (type) {
      case 'RACE_INIT': notify('race-init', data); break;
      case 'RACE_START': notify('race-start', data); break;
      case 'RACE_UPDATE': notify('race-update', data); break;
      case 'RACE_END': notify('race-end', data); break;
    }
  });

  return config // so that others down the chain may have it
})
