var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

// This function will return the time in seconds since the function 
// was last called
// You should only call this function once per frame
function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();

	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	
		// validate that the delta is within range
	if(deltaTime > 1)
		deltaTime = 1;
		
	return deltaTime;
}
//-------------------- Don't modify anything above here

var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;

// Level Variables
var LAYER_COUNT = 3;
var MAP = {tw:60,th:15};
var TILE = 35;
var TILESET_TILE = TILE*2;
var TILESET_PADDING = 2;
var TILESET_SPACING = 2;
var TILESET_COUNT_X = 14;
var TILESET_COUNT_Y = 14;

// Forces
var METER = TILE;
var GRAVITY = METER * 9.8 * 6;
var MAXDX = METER * 10;
var MAXDY = METER * 15;
var ACCEL = MAXDX * 2;
var FRICTION = MAXDX * 6;
var JUMP = METER * 2500;

// Layer variables
var LAYER_BACKGROUND = 0;
var LAYER_PLATFORMS = 1;
var LAYER_LADDERS = 2;

// Game states
var STATE_SPLASH = 0;
var splash = document.createElement("img");
splash.src = "splash.png"

var STATE_GAME = 1;

var STATE_GAMEOVER = 2;
var gameOver = document.createElement("img");
gameOver.src = "gameOver.png"

var STATE_WIN = 3;
var winSplash = document.createElement("img");
winSplash.src = "winSplash.png"

var gameState = STATE_SPLASH;

// FPS
var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

// load the level to draw
var tileset = document.createElement("img");
tileset.src = "tileset.png";

// load the player to draw
var chuckNorris = document.createElement("img");
chuckNorris.src = "hero.png";

// Score
var score = 0;

// Lives
var lives = 3;

var heartImage = document.createElement("img");
heartImage.src = "heart.png";

// Health
var health = 100;

var healthImage = document.createElement("img");
healthImage.src = "health.png";

// Other JS's

var player = new Player();
var keyboard = new Keyboard();

// Bullets array
var bullets = [];

// Collision array
var cells = []; // the array that holds our simplified collision data

// Collisions Debug
var collisionsDebug = false;

// Music
var musicBackground;
var sfxFire;

// Enemy
var ENEMY_MAXDX = METER * 5;
var ENEMY_ACCEL = ENEMY_MAXDX * 2;

var enemies = [];

var LAYER_COUNT = 3;
var LAYER_BACKGOUND = 0;
var LAYER_PLATFORMS = 1;
var LAYER_LADDERS = 2;

var LAYER_OBJECT_ENEMIES = 3;
var LAYER_OBJECT_TRIGGERS = 4;

function runGameWin(deltaTime)
{
	context.drawImage(winSplash, 0, 0)
}

function initialize() 
{
	 for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) { // initialize the collision map
		 cells[layerIdx] = [];
		 var idx = 0;
		 for(var y = 0; y < level1.layers[layerIdx].height; y++) {
			 cells[layerIdx][y] = [];
			 for(var x = 0; x < level1.layers[layerIdx].width; x++) {
				 if(level1.layers[layerIdx].data[idx] != 0) {
						// for each tile we find in the layer data, we need to create 4 collisions
						// (because our collision squares are 35x35 but the tile in the
						// level are 70x70)
					cells[layerIdx][y][x] = 1;
					cells[layerIdx][y-1][x] = 1;
					cells[layerIdx][y-1][x+1] = 1;
					cells[layerIdx][y][x+1] = 1;
				 }
				 else if(cells[layerIdx][y][x] != 1) {
						// if we haven't set this cell's value, then set it to 0 now
					cells[layerIdx][y][x] = 0;
				}
				 idx++;
			 }
		 }
	 }
	 
	// Add enemies
	idx = 0;
	for(var y = 0; y < level1.layers[LAYER_OBJECT_ENEMIES].height; y++) {
		for(var x = 0; x < level1.layers[LAYER_OBJECT_ENEMIES].width; x++) {
			if(level1.layers[LAYER_OBJECT_ENEMIES].data[idx] != 0) {
				var px = tileToPixel(x);
				var py = tileToPixel(y);
				var e = new Enemy(px, py);
				enemies.push(e);
			}
			idx++;
		}
	}

	 musicBackground = new Howl(
	 {
			urls: ["background.ogg"],
			loop: true,
			buffer: true,
			volume: 0.5
	 } );
	 musicBackground.play();
	 
	 sfxFire = new Howl(
	 {
		 urls: ["fireEffect.ogg"],
		 buffer: true,
		 volume: 1,
		 onend: function(){
			 isSfxPlaying = false;
		 }
	} );
	
	// initialize trigger layer in collision map
	cells[LAYER_OBJECT_TRIGGERS] = [];
	idx = 0;
	for(var y = 0; y < level1.layers[LAYER_OBJECT_TRIGGERS].height; y++) {
		cells[LAYER_OBJECT_TRIGGERS][y] = [];
		for(var x = 0; x < level1.layers[LAYER_OBJECT_TRIGGERS].width; x++) {
			if(level1.layers[LAYER_OBJECT_TRIGGERS].data[idx] != 0) {
				cells[LAYER_OBJECT_TRIGGERS][y][x] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y-1][x] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y-1][x+1] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y][x+1] = 1;
			}
				else if(cells[LAYER_OBJECT_TRIGGERS][y][x] != 1) {
				// if we haven't set this cell's value, then set it to 0 now
				cells[LAYER_OBJECT_TRIGGERS][y][x] = 0;
			}
			idx++;
		}
	}
}
	
	function cellAtPixelCoord(layer, x,y)
	{
		if(x<0 || x>SCREEN_WIDTH || y<0)
			return 1;
		// let the player drop of the bottom of the screen (this means death)
		if(y>SCREEN_HEIGHT)
			return 0;
		return cellAtTileCoord(layer, p2t(x), p2t(y));
	};
	function cellAtTileCoord(layer, tx, ty)
	{
		if(tx<0 || tx>=MAP.tw || ty<0)
			return 1;
		// let the player drop of the bottom of the screen (this means death)
		if(ty>=MAP.th)
			return 0;
		return cells[layer][ty][tx];
	};

	function tileToPixel(tile)
	{
		return tile * TILE;
	};
	function pixelToTile(pixel)
	{
		return Math.floor(pixel/TILE);
	};
	function bound(value, min, max)
	{
		if(value < min)
			return min;
		if(value > max)
			return max;
		return value;
	}
	
var worldOffsetX = 0;
function drawMap()
{
	var startX = 1;
	var maxTiles = Math.floor(SCREEN_WIDTH / TILE) +2;
	var tileX = pixelToTile(player.position.x);
	var offsetX = TILE + Math.floor(player.position.x%TILE)
	
	startX = tileX - Math.floor(maxTiles / 2);
	
	if(startX < -1)
	{
		startX = 0;
		offsetX = 0;
	}
	if(startX > MAP.tw - maxTiles)
	{
		startX = MAP.tw - maxTiles + 1;
		offsetX = TILE;
	}
	
	worldOffsetX = startX * TILE +offsetX;
	
	 for( var layerIdx=0; layerIdx < LAYER_COUNT; layerIdx++ )
	 {
		 for( var y = 0; y < level1.layers[layerIdx].height; y++ )
		 {
		 var idx = y * level1.layers[layerIdx].width + startX;
		 for( var x = startX; x < startX + maxTiles; x++ )
		 {
			 if( level1.layers[layerIdx].data[idx] != 0 )
			 {
				 // the tiles in the Tiled map are base 1 (meaning a value of 0 means no tile),
				 // so subtract one from the tileset id to get the correct tile
				 var tileIndex = level1.layers[layerIdx].data[idx] - 1;
				 var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) *
				(TILESET_TILE + TILESET_SPACING);
				 var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) *
				(TILESET_TILE + TILESET_SPACING);
				 context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE,
				(x-startX)*TILE - offsetX, (y-1)*TILE, TILESET_TILE, TILESET_TILE);
			 }
			 idx++;
			}
		}
	}
}

function run()
{
	context.fillStyle = "#ccc";		
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	var deltaTime = getDeltaTime();
	
		switch(gameState)
	{
		case STATE_SPLASH:
			runSplash(deltaTime);
			break;
		case STATE_GAME:
			runGame(deltaTime);
			break;
		case STATE_GAMEOVER:
			runGameOver(deltaTime);
			break;
		case STATE_WIN:
			runGameWin(deltaTime);
			break;
	}
	
	if(player.position.y > SCREEN_HEIGHT)
	{
		player.position.x = SCREEN_WIDTH/2;
		player.position.y = 20;
		lives -= 1;
	}

	
	if(keyboard.isKeyDown(keyboard.KEY_SPACE) == true)
	{
		switch(gameState)
		{
			case STATE_SPLASH:
				gameState = STATE_GAME;
				break;
			case STATE_GAME:
				break;
			case STATE_GAMEOVER:
				break;
			case STATE_WIN:
				break;
		}
	}
	// Enemies update
	for(var i=0; i<enemies.length; i++)
	{
		enemies[i].update(deltaTime);
	}
	
	// Enemy, Player Collision check
		for(var i=0; i<enemies.length; i++)
	{
		for(var j=0; j<enemies.length; j++)
		{
			if(intersects(
				player.position.x, player.position.y,
				TILE, TILE,
				enemies[i].position.x , enemies[i].position.y -70,
				enemies[i].width, enemies[i].height) == true)
			{
				lives -= 1;
				player.position.x = SCREEN_WIDTH/2
				player.position.y = SCREEN_HEIGHT - SCREEN_HEIGHT
				break;
			}
		}
	}
	
	// Enemy, Bullet Collision Check
	var hit=false;
	for(var i=0; i<bullets.length; i++)
	{
		bullets[i].update(deltaTime);
		if( bullets[i].position.x - worldOffsetX < 0 ||
			bullets[i].position.x - worldOffsetX > SCREEN_WIDTH)
		{
			hit = true;
		}
		for(var j=0; j<enemies.length; j++)
			{
			if(intersects( bullets[i].position.x, bullets[i].position.y, TILE, TILE,
					enemies[j].position.x, enemies[j].position.y, TILE, TILE) == true)
				{
					// kill both the bullet and the enemy
					enemies.splice(j, 1);
					hit = true;
					// increment the player score
					score += 1;
					break;
				}
			}
			if(hit == true)
			{
				bullets.splice(i, 1);
				break;
			}
		}
	}

// Collision check
function intersects(x1, y1, w1, h1, x2, y2, w2, h2)
{
	if(y2 + h2 < y1 ||
		x2 + w2 < x1 ||
		x2 > x1 + w1 ||
		y2 > y1 + h1)
	{
		return false;	
	}
	return true;
}

function collisionsDebugMode()
{
		// draw the player collisions
	context.fillStyle = "#FF0";
	context.fillRect(player.position.x, player.position.y, TILE, TILE);

	// draw the collision map
	context.fillStyle = "#f00";
	for (var i = 0; i < cells.length; ++i) {
		if (i != 1) continue;
		var layer = cells[i];
		for (var y = 0; y < layer.length; ++y) {
			var row = layer[y];
			for (var x = 0; x < row.length; ++x) {
				var cell = row[x];
				if (cell) {
					context.fillRect(x * TILE - 1, y * TILE - 1, TILE - 2, TILE - 2);
				}
			}
		}
	}
}

initialize();

//-------------------- Don't modify anything below here
(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }
  
  window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);
