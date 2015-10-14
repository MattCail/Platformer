function runSplash(deltaTime)
{
	context.drawImage(splash, 0, 0)
}
function runGame(deltaTime)
{
	// Map
	drawMap();
	
	// Collisions Debug
	if (keyboard.isKeyDown(keyboard.KEY_N) == true)
	{
		collisionsDebug = true;
	}
	if (keyboard.isKeyDown(keyboard.KEY_M) == true)
	{
		collisionsDebug = false;
	}
	if (collisionsDebug == true)
	{
		collisionsDebugMode();
	}
	
	// Score
	context.fillStyle = "#000";
	context.font = "18px Arial Black"
	var scoreText = "Score: " + score;
	context.fillText(scoreText, SCREEN_WIDTH - 120, 30);
	
	// Lives
	context.drawImage(heartImage, 10, 395);
	
	// Life counter
	context.fillStyle = "#000";
	context.font = "28px Arial Black"
	var totalLives = lives;
	context.fillText(totalLives, 45, 420);
	
	// Health
	context.drawImage(healthImage, 10, 435);
	
	// Health counter
	context.fillStyle = "#000";
	context.font = "28px Arial Black"
	var totalHealth = health;
	context.fillText(totalHealth, 45, 460);
	
	// Enemy
	for(var i = 0; i<enemies.length; ++i)
	{
		enemies[i].update(deltaTime);
		enemies[i].draw();
	}
		
	//Player
	player.update(deltaTime);
	player.draw();
	
	// update the frame counter 
	fpsTime += deltaTime;
	fpsCount++;
	if(fpsTime >= 1)
	{
		fpsTime -= 1;
		fps = fpsCount;
		fpsCount = 0;
	}		
		
	// draw the FPS
	context.fillStyle = "#f00";
	context.font="14px Arial";
	context.fillText("FPS: " + fps, 5, 20, 100);
	
	// Enemy
	for(var i = 0; i<bullets.length; ++i)
	{
		bullets[i].update(deltaTime);
		bullets[i].draw();
	}
}

function runGameOver(deltaTime)
{
	context.drawImage(gameOver, 0, 0)
}