// main.js

// 1. Настройки и константы
const CANVAS_SIZE = 320;
const GRID_SIZE   = 32;
const CELL_SIZE   = CANVAS_SIZE / GRID_SIZE;
const ACTIONS     = ['Expand', 'Develop', 'Deal'];

let canvas, ctx;
let map = [];
let turn = 1;
let currentPlayer = 'you'; // or 'ai'

// 2. Вспомогательные функции
function createEmptyMap() {
  map = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      row.push({ owner: null, level: 0, resource: false });
    }
    map.push(row);
  }
}

function getOwnedCoords(player) {
  const coords = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (map[y][x].owner === player) {
        coords.push({ x, y });
      }
    }
  }
  return coords;
}

function getEmptyNeighbors(coordsList) {
  const nbors = [];
  coordsList.forEach(({ x, y }) => {
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      const nx = x + dx, ny = y + dy;
      if (
        nx >= 0 && nx < GRID_SIZE &&
        ny >= 0 && ny < GRID_SIZE &&
        !map[ny][nx].owner
      ) {
        nbors.push({ x: nx, y: ny });
      }
    });
  });
  return nbors;
}

// 3. Действия игрока
function expand() {
  const owned = getOwnedCoords(currentPlayer);
  const nbors = getEmptyNeighbors(owned);
  if (nbors.length === 0) return;
  const { x, y } = nbors[Math.floor(Math.random() * nbors.length)];
  map[y][x].owner = currentPlayer;
  map[y][x].level = 1;
}

function develop() {
  const owned = getOwnedCoords(currentPlayer);
  if (owned.length === 0) return;
  const { x, y } = owned[Math.floor(Math.random() * owned.length)];
  map[y][x].level++;
}

function deal() {
  const owned = getOwnedCoords(currentPlayer);
  if (owned.length === 0) return;
  const { x, y } = owned[Math.floor(Math.random() * owned.length)];
  map[y][x].resource = !map[y][x].resource;
}

// 4. Основная логика хода
function doAction(action) {
  switch (action) {
    case 'Expand':  expand();  break;
    case 'Develop': develop(); break;
    case 'Deal':    deal();    break;
  }
  nextTurn();
}

function nextTurn() {
  turn++;
  currentPlayer = currentPlayer === 'you' ? 'ai' : 'you';
  if (currentPlayer === 'ai') {
    setTimeout(aiMove, 300);
  } else {
    draw();
  }
}

// 5. AI
function aiMove() {
  const choice = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  doAction(choice);
}

// 6. Рендеринг
function clearCanvas() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
}

function drawMap() {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = map[y][x];
      if (cell.owner) {
        ctx.fillStyle = cell.owner === 'you' ? '#06f' : '#f30';
        if (cell.resource) ctx.globalAlpha = 0.6;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.globalAlpha = 1;
        if (cell.level > 1) {
          ctx.fillStyle = '#fff';
          ctx.font = '8px sans-serif';
          ctx.fillText(cell.level, x * CELL_SIZE + 2, y * CELL_SIZE + 10);
        }
      } else {
        ctx.fillStyle = '#333';
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

function drawHUD() {
  document.getElementById('turn-info').textContent =
    `Ход ${turn}: ${(currentPlayer === 'you') ? 'Ваш' : 'ИИ'} ход`;
}

function draw() {
  clearCanvas();
  drawMap();
  drawHUD();
}

// 7. Обработка ввода
function bindHUD() {
  document.querySelectorAll('#hud button').forEach(btn => {
    btn.addEventListener('click', () => doAction(btn.dataset.action));
  });
  canvas.addEventListener('click', handleClick);
}

function handleClick(evt) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((evt.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((evt.clientY - rect.top) / CELL_SIZE);
  const owned = getOwnedCoords(currentPlayer);
  const nbors = getEmptyNeighbors(owned);
  if (nbors.some(c => c.x === x && c.y === y)) {
    map[y][x].owner = currentPlayer;
    map[y][x].level = 1;
    nextTurn();
  }
}

// 8. Инициализация
function init() {
  createEmptyMap();
  const mid = Math.floor(GRID_SIZE / 2);
  map[mid][mid].owner = currentPlayer;
  map[mid][mid].level = 1;
  bindHUD();
  draw();
}

// 9. Старт игры
window.onload = () => {
  canvas = document.getElementById('game');
  ctx    = canvas.getContext('2d');
  init();
};
