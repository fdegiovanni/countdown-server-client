const BASE_TIME = 90;
const WAIT_TIME = 10;
const SHIFTS = ["AB", "CD", "CD", "AB", "AB", "CD", "CD", "AB", "AB", "CD", "CD", "AB", "AB", "CD", "CD", "AB", "AB", "CD","CD", "AB"];

let paused = true;
let timerRunning = false;
let cycleCount = 1; // contador de ciclos completados
let currentShiftIndex = 0; // índice del turno actual en la secuencia
let timeLeft = BASE_TIME; // tiempo en segundos
let countdownTimer;

const countDown = document.getElementById("countdown");
const shiftIndicator = document.getElementById("shift-indicator");
const cycleIndicator = document.getElementById("cycle-indicator")
const statusMsg = document.getElementById('status');
const audioBtn = document.getElementById('audiobtn');

const ws = new WebSocket(`ws://${document.location.hostname}:3010`);
// const ws = new WebSocket('ws://192.168.0.100:80');

ws.onopen = (socket) => {
  console.log('Conectado');
  statusMsg.style.color = "green";
  /* audioBtn.click(); */
}

ws.onmessage = (event) => {
  console.log(event.data);
  
  switch(event.data) {
    case 'iniciar':
      startCountdown();
      break;
    
    case 'detener':
      stopCountdown();
      break;
    
    case 'siguiente':
      nextShift();
      break;
    
    default:
  }
}

ws.onerror = (err) => {
  console.log(err);
  statusMsg.style.color = "red";
}


function playSound(sound) {
  const audioElement = document.getElementById(sound);
  audioElement.muted = false;
  audioElement.volume = 1;
  audioElement.play();

  /* const audio = new Audio();
  audio.src = `./${sound}.mp3`;
  audio.volume = 1;
  audio.play();
  audio.onended = () => { delete(audio); } */
}

// función para actualizar el indicador de tiempo restante y el número de turno actual
function updateCountdown() {
  let minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft - minutes * 60;

  // Cambiar el color del contador
  if (timeLeft > 30) {
    countDown.style.color = "green";
  } else if (timeLeft > 0) {
    countDown.style.color = "yellow";
  } else {
    countDown.style.color = "red";
  }
  // agregar un cero delante de los segundos si es necesario
  if (seconds < 10) seconds = "0" + seconds;

  if (!paused) timeLeft--;

  // Cambiar el turno después de cada 90 segundos
  if (timeLeft < 0) {
    pauseCountdown();

    currentShiftIndex++;
    if (currentShiftIndex === SHIFTS.length) currentShiftIndex = 0;
    const isOddShift = currentShiftIndex % 2 !== 0;
    
    shiftIndicator.innerHTML = SHIFTS[currentShiftIndex];

    if(isOddShift){
      nextShift(false);
      setTimeout(() => {
        startCountdown();
      }, 10);
      
    } else {
      playSound("beep3");
      cycleCount++;
    }
  }

  countDown.innerHTML = minutes + ":" + seconds;
  cycleIndicator.innerHTML = cycleCount;
}

// función para iniciar el temporizador
function startCountdown() {
  if (!timerRunning) {
    paused = false;
    timerRunning = true;
    
    setTimeout(() => {
      playSound("beep1");
      setTimeout(() => {
        playSound("beep2");
        shiftIndicator.innerHTML = SHIFTS[currentShiftIndex];
        countdownTimer = setInterval(updateCountdown, 1000);
      }, WAIT_TIME * 1000);
    }, 1000);
  }
}

// función para pausar el temporizador
function pauseCountdown() {
  paused = true;
  timerRunning = false;
  timeLeft = BASE_TIME;
  clearInterval(countdownTimer);
}

// función para detener el temporizador
function stopCountdown() {
  pauseCountdown();
  
  cycleCount = 1;
  currentShiftIndex = 0;
  timeLeft = BASE_TIME;

  countDown.innerHTML = "1:30";
  countDown.style.color = "#333";
  shiftIndicator.innerHTML = SHIFTS[currentShiftIndex];
  cycleIndicator.innerHTML = cycleCount;
  
  playSound("beep1");
  setTimeout(() => { playSound("beep2"); }, 1000);
}

// función para avanzar al siguiente turno
function nextShift(addIndex = true) {
  if (paused) {
    if(addIndex) currentShiftIndex++;
    if (currentShiftIndex == SHIFTS.length) currentShiftIndex = 0;
    shiftIndicator.innerHTML = SHIFTS[currentShiftIndex];
    cycleIndicator.innerHTML = cycleCount;
  }
}
