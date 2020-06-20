window.serverConfigPromise = window.fetch('/config').then(r => r.json())


window.serverConfigPromise.then((config) => {
  // Create WebSocket connection.
  const socket = new WebSocket(`ws://${window.location.hostname}:${config.WS_PORT}`);
  
  // Connection opened
  socket.addEventListener('open', function (event) {
    socket.send(JSON.stringify({ message: 'Ready' }));
  });
  
  // Listen for messages
  socket.addEventListener('message', function ({ data: wsData }) {
    const { type, data } = JSON.parse(wsData)
    console.log(type, data)
    switch (type) {
      case 'RACE_INIT': raceInit(data); break;
      case 'RACE_START': raceStart(data); break;
      case 'RACE_UPDATE': raceUpdate(data); break;
      case 'RACE_END': raceEnd(data); break;
    }
  });

  return config // so that others down the chain may have it
})

