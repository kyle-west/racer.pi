window.serverConfigPromise = window.fetch('/config').then(r => r.json())


window.serverConfigPromise.then((config) => {
  // Create WebSocket connection.
  const socket = new WebSocket(`ws://localhost:${config.wsPort}`);
  
  // Connection opened
  socket.addEventListener('open', function (event) {
    socket.send(JSON.stringify({ message: 'Hello Server!' }));
  });
  
  // Listen for messages
  socket.addEventListener('message', function (event) {
    console.log(event.data)
  });

  return config // so that others down the chain may have it
})

