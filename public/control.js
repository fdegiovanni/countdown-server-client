const socket = new WebSocket("ws://localhost:3010");
const statusMsg = document.getElementById('status');

socket.onopen = (e) => {
  statusMsg.style.color = "green";
  socket.send("CONTROL conectado");
};

socket.onmessage = (event) => {
  // console.log(`[message] Data received from server: ${event.data}`);
};

socket.onclose = (event) => {
  statusMsg.style.color = "red";
  if (event.wasClean) {
    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    console.log('[close] Connection died');
  }
};

socket.onerror = (error) => {
  console.log(`[error]`);
};

const playSound = (sound) => {
  const audioElement = document.getElementById(sound);
  audioElement.play();
}

const startCountdown = () => {
  socket.send('iniciar');
}

const stopCountdown = () => {
  socket.send('detener');
}

const nextShift = () => {
  socket.send('siguiente');
}
