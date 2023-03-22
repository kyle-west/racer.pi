import env from '/env'

function notify (name, detail) {
  document.dispatchEvent(new CustomEvent(name, { detail }))
}

const socket = new WebSocket(`ws://${window.location.hostname}:${env.WS_PORT}`);

// Connection opened
socket.addEventListener('open', function (event) {
  socket.send(JSON.stringify({ message: 'Ready' }));
});

// Listen for messages
socket.addEventListener('message', function ({ data: wsData }) {
  const { type, data } = JSON.parse(wsData)
  console.log('[SERVER EVENT]', type, data)
  switch (type) {
    case 'RACE_CURRENT': notify('race-current', data); break;
    case 'RACE_START': notify('race-start', data); break;
    case 'RACE_UPDATE': notify('race-update', data); break;
    case 'RACE_END': notify('race-end', data); break;
  }
});
