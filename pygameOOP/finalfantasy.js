const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const tileSize = 32;
const gridWidth = 10;
const gridHeight = 10;

// Map data (0 = grass, 1 = water, 2 = forest, 3 = mountain)
const map = [
  [3,3,3,3,3,3,3,3,3,3],
  [3,0,0,0,2,2,0,0,0,3],
  [3,0,2,2,0,0,2,2,0,3],
  [3,0,0,2,0,0,0,2,0,3],
  [3,0,0,2,2,2,0,2,0,3],
  [3,0,0,0,0,2,0,0,0,3],
  [3,0,2,2,0,2,2,0,2,3],
  [3,0,2,0,0,0,2,0,1,3],
  [3,0,0,0,1,1,0,0,1,3],
  [3,3,3,3,3,3,3,3,3,3]
];

// NPCs (Non-Playable Characters)
const npcs = [
  { x: 3, y: 3, name: 'Elder', color: '#f0f' },
  { x: 7, y: 2, name: 'Merchant', color: '#ff0' },
  { x: 2, y: 6, name: 'Wizard', color: '#0ff' }
];

// Player object
const player = {
  x: 1,
  y: 1,
  direction: 'down', // down, up, left, right
  moving: false
};

// Tile colors (NES style)
const tileColors = {
  0: '#6c9944', // grass
  1: '#3b6cb8', // water
  2: '#2d6d3e', // forest
  3: '#9c7c4a'  // mountain
};

// Draw a single tile
function drawTile(x, y, tileType) {
  const color = tileColors[tileType];
  ctx.fillStyle = color;
  ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
  
  // Add borders for better visibility
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
}

// Draw the entire map
function drawMap() {
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      drawTile(x, y, map[y][x]);
    }
  }
}

// Draw NPC
function drawNPC(npc) {
  const px = npc.x * tileSize + tileSize / 2;
  const py = npc.y * tileSize + tileSize / 2;
  
  // Head
  ctx.fillStyle = '#f0d090';
  ctx.fillRect(px - 6, py - 10, 12, 10);
  
  // Body
  ctx.fillStyle = npc.color;
  ctx.fillRect(px - 6, py, 12, 12);
  
  // Name label
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 8px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText(npc.name, px, py + 18);
}

// Draw player character
function drawPlayer(x, y, direction) {
  const px = x * tileSize + tileSize / 2;
  const py = y * tileSize + tileSize / 2;
  
  // Skin/face
  ctx.fillStyle = '#f0d090';
  ctx.fillRect(px - 6, py - 12, 12, 10);
  
  // Hair (changes based on direction)
  ctx.fillStyle = '#8b4513';
  if (direction === 'down') {
    ctx.fillRect(px - 6, py - 12, 12, 4);
  } else if (direction === 'up') {
    ctx.fillRect(px - 6, py - 8, 12, 4);
  }
  
  // Body - Blue shirt (classic FF protagonist)
  ctx.fillStyle = '#0066ff';
  ctx.fillRect(px - 6, py - 2, 12, 10);
  
  // Legs - brown pants
  ctx.fillStyle = '#8b4513';
  ctx.fillRect(px - 6, py + 8, 12, 4);
  
  // Eyes
  ctx.fillStyle = '#000';
  ctx.fillRect(px - 3, py - 8, 2, 2);
  ctx.fillRect(px + 1, py - 8, 2, 2);
  
  // Direction indicator (arrow above player)
  ctx.strokeStyle = '#ffff00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (direction === 'up') {
    ctx.moveTo(px, py - 14);
    ctx.lineTo(px - 4, py - 18);
    ctx.moveTo(px, py - 14);
    ctx.lineTo(px + 4, py - 18);
  } else if (direction === 'down') {
    ctx.moveTo(px, py + 14);
    ctx.lineTo(px - 4, py + 18);
    ctx.moveTo(px, py + 14);
    ctx.lineTo(px + 4, py + 18);
  }
  ctx.stroke();
}

// Update position info
function updateInfo() {
  document.getElementById('pos').textContent = `${player.x}, ${player.y}`;
}

// Check if tile is walkable
function isWalkable(x, y) {
  if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) return false;
  const tileType = map[y][x];
  return tileType !== 1 && tileType !== 3; // Can't walk on water or mountains
}

// Main draw function
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw background
  drawMap();
  
  // Draw NPCs
  npcs.forEach(npc => drawNPC(npc));
  
  // Draw player
  drawPlayer(player.x, player.y, player.direction);
}

// Handle player movement
document.addEventListener('keydown', (e) => {
  let newX = player.x;
  let newY = player.y;
  
  if (e.key === 'ArrowUp') {
    newY--;
    player.direction = 'up';
    e.preventDefault();
  } else if (e.key === 'ArrowDown') {
    newY++;
    player.direction = 'down';
    e.preventDefault();
  } else if (e.key === 'ArrowLeft') {
    newX--;
    player.direction = 'left';
    e.preventDefault();
  } else if (e.key === 'ArrowRight') {
    newX++;
    player.direction = 'right';
    e.preventDefault();
  } else if (e.key === ' ') {
    // Interaction with NPCs
    checkNPCInteraction();
    e.preventDefault();
  }
  
  // Check collision and move
  if (isWalkable(newX, newY)) {
    player.x = newX;
    player.y = newY;
    updateInfo();
  }
  
  draw();
});

// Check NPC interaction
function checkNPCInteraction() {
  for (let npc of npcs) {
    if (player.x === npc.x && player.y === npc.y) {
      alert(`You met ${npc.name}!\n\n"Hello, adventurer!"`);
      return;
    }
  }
  alert('Nothing here...');
}

// Initial draw
updateInfo();
draw();

// Animation loop (optional, for smoother updates)
setInterval(draw, 60);