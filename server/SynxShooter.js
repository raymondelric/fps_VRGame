// require('./phaser.min.js')

var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var multiplePlayer = false;
var multiReady = false;

function preload() {
	game.load.image('start_menu', '/assets/menu.png');
	game.load.image('seatiles', '/assets/seatiles.png');
	game.load.image('player', '/assets/player_1.png');
	game.load.image('player2', '/assets/player_2.png');
	game.load.image('bullet', '/assets/player_weapon_bullet_1.png');
	game.load.image('bullet2', '/assets/player_weapon_bullet_2.png');
	game.load.image('ray', '/assets/player_weapon_ray.png');
	game.load.image('ray2', '/assets/player_weapon_ray.png');
	game.load.image('enemy1', '/assets/enemy_1.png');
	game.load.image('enemy2', '/assets/enemy_2.png');
	game.load.image('enemy3', '/assets/enemy_3.png');
	game.load.image('enemy_bullet1', '/assets/enemy_bullet_1.png');
	game.load.image('enemy_bullet2', '/assets/enemy_bullet_2.png');
	game.load.image('boss', '/assets/boss.png');
	game.load.image('boss_bullet0', '/assets/boss_weapon_bullet.png');
	game.load.image('boss_bullet1', '/assets/boss_weapon_ray.png');
	game.load.image('ult_ready_sign', '/assets/ult_ready.png');
	game.load.image('ult_loading_sign', '/assets/ult_loading.png');
	game.load.spritesheet('bonus_box', '/assets/cubes.png', 24, 24);
	game.load.spritesheet('enemy0', '/assets/enemy_0.png', 24, 24);
	game.load.spritesheet('explosion', '/assets/explosion.png', 32, 32);
	game.load.spritesheet('shield', '/assets/player_shield.png', 192, 192);
	game.load.spritesheet('shield2', '/assets/player_shield.png', 192, 192);
	game.load.spritesheet('lightning', '/assets/player_weapon_lightning.png', 55, 208);
	game.load.spritesheet('lightning2', 'assets/player_weapon_lightning.png', 55, 208);
	game.load.spritesheet('rocket', '/assets/player_rocket.png', 48, 48);
	game.load.spritesheet('fireball', '/assets/player_fireball.png', 32, 30);
	this.load.bitmapFont('minecraftia', '/assets/font.png', '/assets/font.xml');
	game.load.audio('menuBGM', '/assets/audio/menu.mp3');
	game.load.audio('gameBGM', '/assets/audio/ingame.mp3');
	game.load.audio('explodeSFX', '/assets/audio/explosion.wav');
}

//Weapon Ult
const BULLET = 0, RAY = 1, LIGHTNING = 2, MAX_WEAPON_LEVEL = 4;
const EMPTY = 0, FILLED = 1; //ULT state
const ULT_FILL_TIME = 10, ULT_DAMAGE = 100;
var bullets, bullets2, rays, rays2, lightnings, lightnings2;
var weaponLevel = 0, weaponLevel2 = 0;
var weaponMode = game.rnd.integerInRange(BULLET,LIGHTNING), weaponMode2 = game.rnd.integerInRange(BULLET,LIGHTNING);
var weapon_num = [500, 20, 10];
var fireRate, rayfireRate, lightningfireRate, fireRate2, rayfireRate2, lightningfireRate2;
var nextFire = 0, nextFire2 = 0;
var player_bullet_velocity = 750;
var ultText, ult_ready_sign, ult_loading_sign;
var ult = EMPTY;
var ultstate = ['restore','ready'];

// Difficulty Score Menu Gameover Gamestate Background
const INGAME = 1, STARTGAME = 0, ENDGAME = -1;
const CHANGING = 1, NOCHANGE = 0;
const LEVELUP_TIME = 25;
var DIFFICULTY = 1;
var DIFFICULTY_CHANGE = NOCHANGE;
var difficultyText;
var levelup_loop, levelupLoopRemove;
var score = 0, score2 = 0;
var scoreText, scoreText2;
var scoreBoardText;
var gamestartMenu;
var gameOverText;
var state = 0;
var background;
var background_movement = 1;

//Player
const MAX_LIFE = 3, MAX_FIREBALL = 3, MAX_ROCKETS = 20;
const FIREBALL_TIME = 15, FIREBALL_RADIUS = 100;
const ROCKET_COOLDOWN = 3000;
var username1,username2;
var player, lives, player2, lives2;
var player1Die = false, player2Die = false;
var playerSpawnUndeadTime = 3000; // in milliseconds
var playerSpawnUndead = false, playerSpawnUndead2 = false;	//whether player is undead
var tweenPlayer, tweenPlayer2; //the tween effects of player
var shield;
var newX = 0, newX2 = 0;
var newY = 0, newY2 = 0;
var rocketPool, rocket_velocity = 800;
var fireballs, fireballs2;
var Ball = new Array(), Ball2 = new Array();
var fireballEvent = new Array(), fireballEvent2 = new Array();
var fireballStartTime, fireballStartTime2;
var FireballsExist = false, FireballsExist2 = false;

// The following 2 variables are the properties of SuperPlayer. (see function superPlayer() below)
var playerSuperTime = 10000;
var playerSuper = false, playerSuper2 = false;
var superEvent;
var superTween = new Array();
var tints = [0xff00ff, 0x00ffff, 0x0000ff, 0xff00ff, 0xff0000, 0xffff00];
var tmptint;

//ENEMY
const ENEMY_KINDS = 4, ENEMY_BULLET_KINDS = 2;
const FORT_HEALTH = 5, PLANE_SMALL_HEALTH = 1, PLANE_MEDIUM_HEALTH = 3, PLANE_LARGE_HEALTH = 500;
const FORT = 0, PLANE_SMALL = 1, PLANE_MEDIUM = 2, PLANE_LARGE = 3;
const FORT_BULLET = 1, PLANE_SMALL_BULLET = 0, PLANE_MEDIUM_BULLET = 0, PLANE_LARGE_BULLET = 1;
const FORT_BULLET_NUM = 3, PLANE_LARGE_BULLET_NUM = 5;
var enemys = new Array();
var enemy_num = [4, 20, 10, 2];
var nextEnemy = [0, 0, 0, 10000];
var enemyBullets = new Array();
var enemyBullet_num = [200, 200];
var enemy_bullet_velocity = [200, 350, 250, 200];

// BOSS
const MAX_BOSS = 3;
const BOSS_STAGE_FREQ = 3;
const BOSS_HEALTH = 500, BOSS_SPEED = 5;
const BOSS_BULLET_ATTACK = 0, BOSS_LASER_ATTACK = 1;
var bossSpawned = false, ENEMYS_KILLED = false;
var bosses;
var bossBullet = new Array();
var bossBullet_num = [200, 20];

//Others
const MAX_EXPLOSION = 100;
const MAX_BOXES = 4, BOX_TIME = 120;
const yellow = 0, orange = 1, green = 2, chocolate = 3, blue = 4, dark_blue = 5, gray = 6, colorful = 7;
var boxes;
var nextBox = 0;
var explosionPool;
var magicPN, magicText;
var menumusic, gamemusic, explodeSFX;

function create() {
	setupBackground();
	setupBoss();
	setupEnemys();
	setupEnemyBullets();
	setupPlayer(false);
	setupPlayerLives();
	setupBullets();
	setupBullets2();
	setupRays();
	setupRays2();
	setupLightnings();
	setupLightnings2();
	setupFireRate();
	setupRocket();
	setupFireBalls();
	setupFireBalls2();
	setupULT();
	setupBoxes();
	setupExplosions();
	setupMenu();
	scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '20px', fill: '#000' });
	ultText = game.add.text(65, 50, 'ULT state: restore', { fontSize: '20px', fill: '#000' });
	menumusic = game.add.audio('menuBGM');
	gamemusic = game.add.audio('gameBGM');
	explodeSFX = game.add.audio('explodeSFX');
	menumusic.loopFull();
}

function update() {

	background.tilePosition.y += background_movement;

	enemys[FORT].forEachAlive(function(enemy)	{
		enemy.y += background_movement;
	}, this);

	// single player
	if(!multiplePlayer){
		player.body.velocity.x = 10*(-newY);
		player.body.velocity.y = 10*(-newX);
		player.shield.position.x = player.position.x;
		player.shield.position.y = player.position.y + player.height/2;

		if(state === INGAME && player.alive){

			updateText();

			if(inBossStage() && ENEMYS_KILLED === false) {
					killAllEnemy();
					killAllEnemyBullet();
					ENEMYS_KILLED = true;
			}

			if(DIFFICULTY_CHANGE === NOCHANGE){

				add_boxes();

				if(inBossStage()) {
					if( bossSpawned === false){
						spawn_boss();
					}
					if( levelupLoopRemove === false ){
						levelupLoopRemove = true;
						game.time.events.remove(levelup_loop);
					}
					if( bossSpawned && bosses.countDead() === MAX_BOSS ){	// boss dead
						DIFFICULTY_CHANGE = CHANGING;
						DIFFICULTY++;
						bossSpawned = false;
						ENEMYS_KILLED = false;
						enemy_bullet_velocity[0] += 20;
						enemy_bullet_velocity[1] += 35;
						enemy_bullet_velocity[2] += 25;
						enemy_bullet_velocity[3] += 20;
						difficultyText = game.add.bitmapText(game.width/2, game.height/2, 'minecraftia', 'Difficulty: '+DIFFICULTY);
						difficultyText.anchor.setTo(0.5, 0.5);
						game.time.events.add(Phaser.Timer.SECOND * 5, difficultyTextDel, this);
						levelupLoopRemove = false;
						levelup_loop = game.time.events.loop(Phaser.Timer.SECOND * LEVELUP_TIME, difficultyUP, this);
					}
					boss_attack();
				}
				else{
					spawn_enemy();
					plane_attack();
				}
			}

			createRocket();
			rotateRocket();

			if(inBossStage()) {
				if(weaponMode === BULLET) game.physics.arcade.overlap(bullets, bosses, enemyHit, null, this); // Bullets vs Enemys
				else if(weaponMode === RAY) game.physics.arcade.overlap(rays, bosses, rayenemyHit, null, this); // Rays vs Enemys
				else if(weaponMode === LIGHTNING) game.physics.arcade.overlap(lightnings, bosses, lightningenemyHit, null, this); // Lightnings vs Enemys

				game.physics.arcade.overlap(player, bosses, playerVsBoss, null, this); // Player vs Boss

				if(FireballsExist === true){ // Fireballs exist
					var par = (game.time.now - fireballStartTime) / 1000 * Math.PI;
					for(var j = 0; j < MAX_FIREBALL; j++){
						Ball[j].position.x = player.position.x + FIREBALL_RADIUS * Math.sin(par + 2/MAX_FIREBALL * j * Math.PI);
						Ball[j].position.y = player.position.y + FIREBALL_RADIUS * Math.cos(par + 2/MAX_FIREBALL * j * Math.PI);
					}
					game.physics.arcade.overlap(fireballs, bosses, fireballenemyHit, null, this); // Fireballs vs Enemys
				}

				game.physics.arcade.overlap(rocketPool, bosses, enemyHit, null, this); // Rockets vs Enemys

				for(var i = 0; i < ENEMY_BULLET_KINDS; i++){ // Player vs Enemy Bullets
					game.physics.arcade.overlap(player, enemyBullets[i], playerHitByBullet, null, this);
				}

				for( var i = 0 ; i < 2 ; i ++ )	{ // Player vs BOSS Bullets
					game.physics.arcade.overlap(player, bossBullet[i], playerHitByBullet, null, this);
				}
			} else {
				for(var i = 0 ; i < ENEMY_KINDS ; i ++ ){

					if(i != FORT) // player(on sky) cannot touch forts(on land)
						game.physics.arcade.overlap(player, enemys[i], playerHit, null, this); // Player vs Enemys

					if(weaponMode === BULLET) game.physics.arcade.overlap(bullets, enemys[i], enemyHit, null, this); // Bullets vs Enemys
					else if(weaponMode === RAY) game.physics.arcade.overlap(rays, enemys[i], rayenemyHit, null, this); // Rays vs Enemys
					else if(weaponMode === LIGHTNING){
						game.physics.arcade.overlap(lightnings, enemys[i], lightningenemyHit, null, this); // Lightnings vs Enemys
						for(var j = 0; j < ENEMY_BULLET_KINDS; j++){ // Lightnings vs Enemy Bullets
							game.physics.arcade.overlap(lightnings, enemyBullets[i], lightningBulletHit, null, this);
						}
					}
					if(FireballsExist === true){ // Fireballs exist
						var par = (game.time.now - fireballStartTime) / 1000 * Math.PI;
						for(var j = 0; j < MAX_FIREBALL; j++){
							Ball[j].position.x = player.position.x + FIREBALL_RADIUS * Math.sin(par + 2/MAX_FIREBALL * j * Math.PI);
							Ball[j].position.y = player.position.y + FIREBALL_RADIUS * Math.cos(par + 2/MAX_FIREBALL * j * Math.PI);
						}
						game.physics.arcade.overlap(fireballs, enemys[i], fireballenemyHit, null, this); // Fireballs vs Enemys
					}

					game.physics.arcade.overlap(rocketPool, enemys[i], enemyHit, null, this); // Rockets vs Enemys
				}
				for(var i = 0; i < ENEMY_BULLET_KINDS; i++){ // Player vs Enemy Bullets
					game.physics.arcade.overlap(player, enemyBullets[i], playerHitByBullet, null, this);
				}
			}
			game.physics.arcade.overlap(player, boxes, PlayerVsBox, null, this); // Player vs Boxes
		}
		else{
			if( gameOverText != null && gameOverText.alive ) { // animate gameover Text to -center- bottom (don't mix with scoreBoardText)
				if( gameOverText.y < game.height-20 )
					gameOverText.y += 2*background_movement;
			}
		}
	}

	// multi player
	else{
		player.body.velocity.x = 10*(-newY);
		player.body.velocity.y = 10*(-newX);
		player.shield.position.x = player.position.x;
		player.shield.position.y = player.position.y + player.height/2;

		player2.body.velocity.x = 10*(-newY2);
		player2.body.velocity.y = 10*(-newX2);
		player2.shield.position.x = player2.position.x;
		player2.shield.position.y = player2.position.y + player2.height/2;

		if(state === INGAME && (player.alive || player2.alive)) {

			updateText();

			if(DIFFICULTY_CHANGE === NOCHANGE){
				spawn_enemy();
				plane_attack();
				add_boxes();
			}

			for(var i = 0 ; i < ENEMY_KINDS ; i ++ ){

				if(i != FORT){ // player(on sky) cannot touch forts(on land)
					game.physics.arcade.overlap(player, enemys[i], playerHit, null, this); // Player vs Enemys
					game.physics.arcade.overlap(player2, enemys[i], playerHit2, null, this); // Player2 vs Enemys
				}

				// player 1
				if(weaponMode === BULLET) game.physics.arcade.overlap(bullets, enemys[i], enemyHit, null, this); // Bullets vs Enemys
				else if(weaponMode === RAY) game.physics.arcade.overlap(rays, enemys[i], rayenemyHit, null, this); // Rays vs Enemys
				else if(weaponMode === LIGHTNING){
					game.physics.arcade.overlap(lightnings, enemys[i], lightningenemyHit, null, this); // Lightnings vs Enemys
					for(var j = 0; j < ENEMY_BULLET_KINDS; j++){ // Lightnings vs Enemy Bullets
						game.physics.arcade.overlap(lightnings, enemyBullets[i], lightningBulletHit, null, this);
					}
				}
				if(FireballsExist === true){ // Fireballs exist
					var par = (game.time.now - fireballStartTime) / 1000 * Math.PI;
					for(var j = 0; j < MAX_FIREBALL; j++){
						Ball[j].position.x = player.position.x + FIREBALL_RADIUS * Math.sin(par + 2/MAX_FIREBALL * j * Math.PI);
						Ball[j].position.y = player.position.y + FIREBALL_RADIUS * Math.cos(par + 2/MAX_FIREBALL * j * Math.PI);
					}
					game.physics.arcade.overlap(fireballs, enemys[i], fireballenemyHit, null, this); // Fireballs vs Enemys
				}

				// player 2
				if(weaponMode2 === BULLET) game.physics.arcade.overlap(bullets2, enemys[i], enemyHit2, null, this); // Bullets vs Enemys
				else if(weaponMode2 === RAY) game.physics.arcade.overlap(rays2, enemys[i], rayenemyHit2, null, this); // Rays vs Enemys
				else if(weaponMode2 === LIGHTNING){
					game.physics.arcade.overlap(lightnings2, enemys[i], lightningenemyHit2, null, this); // Lightnings vs Enemys
					for(var j = 0; j < ENEMY_BULLET_KINDS; j++){ // Lightnings vs Enemy Bullets
						game.physics.arcade.overlap(lightnings2, enemyBullets[i], lightningBulletHit2, null, this);
					}
				}
				if(FireballsExist2 === true){ // Fireballs exist
					var par = (game.time.now - fireballStartTime) / 1000 * Math.PI;
					for(var j = 0; j < MAX_FIREBALL; j++){
						Ball2[j].position.x = player2.position.x + FIREBALL_RADIUS * Math.sin(par + 2/MAX_FIREBALL * j * Math.PI);
						Ball2[j].position.y = player2.position.y + FIREBALL_RADIUS * Math.cos(par + 2/MAX_FIREBALL * j * Math.PI);
					}
					game.physics.arcade.overlap(fireballs2, enemys[i], fireballenemyHit, null, this); // Fireballs vs Enemys
				}
			}

			for(var i = 0; i < ENEMY_BULLET_KINDS; i++){ // Player vs Enemy Bullets
				game.physics.arcade.overlap(player, enemyBullets[i], playerHitByBullet, null, this);
				game.physics.arcade.overlap(player2, enemyBullets[i], playerHitByBullet2, null, this);
			}

			game.physics.arcade.overlap(player, boxes, PlayerVsBox, null, this); // Player vs Boxes
			game.physics.arcade.overlap(player2, boxes, PlayerVsBox2, null, this); // Player2 vs Boxes
		}
	}
}

function inBossStage() {
	if(DIFFICULTY % BOSS_STAGE_FREQ === 0) return true;
	else return false;
}

function listenSocket() {

	// single player
	socket.on('setX'+magicPN, function(data) {
		newX = parseFloat(data);
	});
	socket.on('setY'+magicPN, function(data) {
		newY = parseFloat(data);
	});
	socket.on('ultra'+magicPN, function(data) {
		if(player.alive)
			launchult();
	});
	socket.on('start'+magicPN, function(data) {
		state = STARTGAME;
		if( !player.alive )	{
			setupPlayer(false);
			weaponLevel = 0;
			score = 0;
			resetPlayerLives();
		}
		if( gameOverText != null && gameOverText.alive )
			gameOverText.kill();
		if( scoreBoardText != null && scoreBoardText.alive )
			scoreBoardText.kill();
		resetMenu();
		gamemusic.stop();
		menumusic.loopFull();
	});
	socket.on('shoot'+magicPN, function(data) {
		if(state === STARTGAME){ // start game
			game.time.events.add(Phaser.Timer.SECOND * ULT_FILL_TIME, fillult, this);
			levelupLoopRemove = false;
			levelup_loop = game.time.events.loop(Phaser.Timer.SECOND * LEVELUP_TIME, difficultyUP, this);
			state = INGAME;
			setupFireRate();
			gamestartMenu.kill();
			if( scoreBoardText != null && scoreBoardText.alive )
				scoreBoardText.kill();
			setPlayerSpawnTimeUndead();
			menumusic.stop();
			gamemusic.loopFull();
		} else{
			fire();
		}
	});
	socket.on('switch_weapon1'+magicPN, function(msg){
		 weaponMode = msg;
	});
	socket.on('switch_weapon2'+magicPN, function(msg){
		 weaponMode2 = msg;
	});
	socket.on('scoreBoard'+magicPN, function(data)	{

		//console.log('data = ' + data);
		if( scoreBoardText != null )	{
			scoreBoardText.reset(game.width/2, game.height/2 + 32);
			scoreBoardText.setText(data);
		}else{
			scoreBoardText = game.add.bitmapText(game.width/2, game.height/2 + 32, 'minecraftia', data);
		}
		scoreBoardText.anchor.setTo(0.5, 0.5);
	});

	socket.on('username1'+magicPN,function(msg){
		console.log(msg);
		username1 = msg;
	});
	socket.on('username2'+magicPN,function(msg){
		console.log(msg);
		username2 = msg;
	});

	// multi player
	socket.on('players'+magicPN, function(msg) {
		if(msg == '2'){
			multiplePlayer = true;
			ult_loading_sign.kill();
			ultText.kill();
			scoreText.text = 'P1 score: 0';
			scoreText2 = game.add.text(16, 50, 'P2 score: 0', { fontSize: '20px', fill: '#000' });
			player.reset(game.width / 3, game.height - 50);
			setupPlayer2(false);
			setupPlayerLives2();
			setupBullets2();
			weaponMode = BULLET, weaponMode2 = BULLET;
		}
		if(msg == 'go'){
			multiReady = true;
		}
	});
	socket.on('setX1'+magicPN, function(data) {
		newX = parseFloat(data);
	});
	socket.on('setY1'+magicPN, function(data) {
		newY = parseFloat(data);
	});
	socket.on('setX2'+magicPN, function(data) {
		newX2 = parseFloat(data);
	});
	socket.on('setY2'+magicPN, function(data) {
		newY2 = parseFloat(data);
	});
	socket.on('start1'+magicPN, function(data) {
		state = STARTGAME;
		if(player1Die && player2Die){
			resetMenu();
			player1Die = false;
			player2Die = false;
			setupPlayer(false);	setupPlayer2(false);
			player.reset(game.width / 3, game.height - 50);
			weaponLevel = 0;
			weaponLevel2 = 0;
			score = 0;
			score2 = 0;
			resetPlayerLives();
			resetPlayerLives2();
			gameOverText.kill();
			gamemusic.stop();
			menumusic.loopFull();
		}
	});
	socket.on('shoot1'+magicPN, function(data) {
		if(state === STARTGAME && multiReady){ // game start
			levelupLoopRemove = false;
			levelup_loop = game.time.events.loop(Phaser.Timer.SECOND * LEVELUP_TIME, difficultyUP, this);
			state = INGAME;
			setupFireRate();
			gamestartMenu.kill();
			setPlayerSpawnTimeUndead();
			setPlayerSpawnTimeUndead2();
			menumusic.stop();
			gamemusic.loopFull();
		} else{
			fire();
		}
	});
	socket.on('start2'+magicPN, function(data) {
		state = STARTGAME;
		if(player1Die && player2Die){
			resetMenu();
			player1Die = false;
			player2Die = false;
			setupPlayer(false);	setupPlayer2(false);
			player.reset(game.width / 3, game.height - 50);
			weaponLevel = 0;
			weaponLevel2 = 0;
			score = 0;
			score2 = 0;
			resetPlayerLives();
			resetPlayerLives2();
			gameOverText.kill();
			gamemusic.stop();
			menumusic.loopFull();
		}
	});
	socket.on('shoot2'+magicPN, function(data) {
		if(state === STARTGAME && multiReady){ // game start
			levelupLoopRemove = false;
			levelup_loop = game.time.events.loop(Phaser.Timer.SECOND * LEVELUP_TIME, difficultyUP, this);
			state = INGAME;
			setupFireRate();
			gamestartMenu.kill();
			setPlayerSpawnTimeUndead();
			setPlayerSpawnTimeUndead2();
			menumusic.stop();
			gamemusic.loopFull();
		} else{
			fire2();
		}
	});
}

function updateText() {

	// single player
	if(!multiplePlayer){
		scoreText.text = 'Score: ' + score;
		ultText.text = 'ULT state: ' + ultstate[ult];
	}

	// multi player
	else{
		scoreText.text = username1 + ' score: ' + score;
		scoreText2.text = username2 + ' score: ' + score2;
	}
}

function difficultyUP() {
	if(!inBossStage()){
		DIFFICULTY_CHANGE = CHANGING;
		DIFFICULTY++;
		enemy_bullet_velocity[0] += 20;
		enemy_bullet_velocity[1] += 35;
		enemy_bullet_velocity[2] += 25;
		enemy_bullet_velocity[3] += 20;
		difficultyText = game.add.bitmapText(game.width/2, game.height/2, 'minecraftia', 'Difficulty: '+DIFFICULTY);
		difficultyText.anchor.setTo(0.5, 0.5);
		game.time.events.add(Phaser.Timer.SECOND * 5, difficultyTextDel, this);
	}
}

function difficultyTextDel() {
	DIFFICULTY_CHANGE = NOCHANGE;
	difficultyText.kill();
}

function fire() {
	if(weaponMode === BULLET){
		if (player.alive && game.time.now > nextFire && bullets.countDead() > 0){
			if (this.bullets.countDead() < weaponLevel * 2) {
				return;
			}
			nextFire = game.time.now + fireRate;
			var bullet = bullets.getFirstDead();
			bullet.reset(player.x , player.y - 10);
			bullet.body.velocity.y = -player_bullet_velocity;

			for (var i = 1; i <= weaponLevel; i++) {
				bullet = bullets.getFirstExists(false);
				bullet.reset(player.x - i * 6, player.y - 10); // spawn left bullet slightly left off center
				game.physics.arcade.velocityFromAngle(
					-95 - i * 10, player_bullet_velocity, bullet.body.velocity
				); // the left bullets spread from -95 degrees to -135 degrees

				bullet = bullets.getFirstExists(false);
				bullet.reset(player.x + i * 6, player.y - 10); // spawn right bullet slightly right off center
				game.physics.arcade.velocityFromAngle(
					-85 + i * 10, player_bullet_velocity, bullet.body.velocity
				); // the right bullets spread from -85 degrees to -45
			}
		}
	}
	else if(weaponMode === RAY){
		if (player.alive && game.time.now > nextFire && rays.countDead() > 0){
			nextFire = game.time.now + rayfireRate;
			var ray = rays.getFirstDead();
			ray.reset(player.x , player.y - 10);
			ray.body.velocity.y = -player_bullet_velocity*5;
			ray.scale.setTo(1+0.5*weaponLevel,1);
		}
	}
	else if(weaponMode === LIGHTNING){
		if (player.alive && game.time.now > nextFire && lightnings.countDead() > 0){
			nextFire = game.time.now + lightningfireRate;
			var lightning = lightnings.getFirstDead();
			lightning.reset(player.x , 0);
			lightning.scale.setTo(1, 5);
			lightning.animations.add('lightning', [0,1,2,3,4,5], 6, true);
			lightning.play('lightning', 15, true, false);
			game.time.events.add(Phaser.Timer.SECOND * (6+weaponLevel), fadeLightning, this, lightning);
		}
	}
}

function fire2() { // player 2
	if(weaponMode2 === BULLET){
		if (player2.alive && game.time.now > nextFire2 && bullets2.countDead() > 0){
			if (this.bullets2.countDead() < weaponLevel2 * 2) {
				return;
			}
			nextFire2 = game.time.now + fireRate2;
			var bullet = bullets2.getFirstDead();
			bullet.reset(player2.x , player2.y - 10);
			bullet.body.velocity.y = -player_bullet_velocity;

			for (var i = 1; i <= weaponLevel2; i++) {
				bullet = bullets2.getFirstExists(false);
				bullet.reset(player2.x - i * 6, player2.y - 10); // spawn left bullet slightly left off center
				game.physics.arcade.velocityFromAngle(
					-95 - i * 10, player_bullet_velocity, bullet.body.velocity
				); // the left bullets spread from -95 degrees to -135 degrees

				bullet = bullets2.getFirstExists(false);
				bullet.reset(player2.x + i * 6, player2.y - 10); // spawn right bullet slightly right off center
				game.physics.arcade.velocityFromAngle(
					-85 + i * 10, player_bullet_velocity, bullet.body.velocity
				); // the right bullets spread from -85 degrees to -45
			}
		}
	}
	else if(weaponMode2 === RAY){
		if (player2.alive && game.time.now > nextFire2 && rays2.countDead() > 0){
			nextFire2 = game.time.now + rayfireRate2;
			var ray = rays2.getFirstDead();
			ray.reset(player2.x , player2.y - 10);
			ray.body.velocity.y = -player_bullet_velocity*5;
			ray.scale.setTo(1+0.5*weaponLevel2,1);
		}
	}
	else if(weaponMode2 === LIGHTNING){
		if (player2.alive && game.time.now > nextFire2 && lightnings2.countDead() > 0){
			nextFire2 = game.time.now + lightningfireRate2;
			var lightning = lightnings2.getFirstDead();
			lightning.reset(player2.x , 0);
			lightning.scale.setTo(1, 5);
			lightning.animations.add('lightning', [0,1,2,3,4,5], 6, true);
			lightning.play('lightning', 15, true, false);
			game.time.events.add(Phaser.Timer.SECOND * (6+weaponLevel2), fadeLightning, this, lightning);
		}
	}
}

function fillult() {
	ult = FILLED;
	if( ult_ready_sign != null )	{
		ult_ready_sign.reset(16, 36);
	}else {
		ult_ready_sign = game.add.sprite(16, 36, 'ult_ready_sign');
	}
	ultText.fill = '#F00';
	socket.emit('ULT'+magicPN, 'filled');
}

function launchult() {
	if(ult === FILLED){
		ult = EMPTY;
		ultText.fill = '#000';
		ult_ready_sign.kill();
		for( var i = 0; i < ENEMY_KINDS; i++){
			enemys[i].forEachAlive(function (enemy) {
				explode(enemy);
				enemy.damage(ULT_DAMAGE);
				if( !enemy.alive ) score += 10;
				score += 10;
			}, this);
		}
		killAllEnemyBullet();
		bosses.forEachAlive(function (boss) {
				explode(boss);
				boss.damage(ULT_DAMAGE);
				if( !boss.alive ) score += 10;
				score += 10;
		}, this);
		game.time.events.add(Phaser.Timer.SECOND * ULT_FILL_TIME, fillult, this);
	}
}

function killAllEnemy() {
	for( var i = 0; i < ENEMY_KINDS; i++){
		enemys[i].forEachAlive(function (enemy) {
			explode(enemy);
			enemy.kill();
		}, this);
	}
}

function killAllEnemyBullet() {
	for( var i = 0; i < ENEMY_BULLET_KINDS; i++){
		enemyBullets[i].forEachAlive(function (bullet) {
			explode(bullet);
			bullet.kill();
		}, this);
	}
}

function killAllLigntning() {
	if( lightnings != null )	{
			lightnings.forEachAlive(function (light) {
				light.kill();
			}, this);
	}
	if(multiplePlayer && lightnings2 != null){
		lightnings2.forEachAlive(function (l2) {
			l2.kill();
		}, this);
	}
}

function add_boxes() {
	if( game.time.now > nextBox && boxes.countDead() > 0 )	{
		nextBox = game.time.now + game.rnd.integerInRange(10000, 30000);
		var box = boxes.getFirstExists(false);
		box.reset(game.rnd.integerInRange(20, game.width - 20), 0); // spawn at a random location top of the screen
		box.scale.setTo(1.5, 1.5);
		var rnd = game.rnd.integerInRange(0, 7);
		if (rnd === 7)
			box.animations.add('box', [0,3,6,9,12,15,18,1,4,7,10,13,16,19,2,5,8,11,14,17,20], 21, true); //colorful box
		else
			box.animations.add('box', [rnd*3, rnd*3+1, rnd*3+2], 21, true); //single-color box
		box.play('box', 15, true, false);
		box.type = rnd;
		game.physics.arcade.velocityFromAngle(
			game.rnd.integerInRange(180, 360), 50, box.body.velocity
		); // also randomize the speed

		game.time.events.add(Phaser.Timer.SECOND * BOX_TIME, fadeBox, this, box);
	}
}

function fadeBox(box) {
	box.kill();
}

function fadeLightning(lightning) {
	lightning.kill();
}

function fadeFireball(fireball)	{
	FireballsExist = false;
	fireball.kill();
}

function resetFireballs() {
	for(var i = 0; i < MAX_FIREBALL; i ++){
		game.time.events.remove(fireballEvent[i]);
		Ball[i].kill();
	}
	FireballsExist = false;
}

function resetFireballs2() { // player 2
	for(var i = 0; i < MAX_FIREBALL; i ++){
		game.time.events.remove(fireballEvent[i]);
		Ball2[i].kill();
	}
	FireballsExist2 = false;
}

function spawn_enemy() {
	if( !multiplePlayer && !player.alive)
		return;
	if( multiplePlayer && !player.alive && !player2.alive)
		return;

	if (game.time.now > nextEnemy[FORT] && enemys[FORT].countDead() > 0){ // Spawn forts
		nextEnemy[FORT] = game.time.now + game.rnd.integerInRange(10000, 10000);
		var enemy = enemys[FORT].getFirstExists(false);
		enemy.reset(game.rnd.integerInRange(20, game.width - 20), 0, FORT_HEALTH);
		enemy.enemyNextFire = 0;

		enemy.animations.add('open', [0, 1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8], 20, false);
		enemy.animations.add('close', [8, ,8 ,8 ,8, 8, 8, 7, 6, 5, 4, 3, 2, 1, 0], 20, false);
		enemy.loop = game.time.events.loop(Phaser.Timer.SECOND * 10, fort_attack, this, enemy);
	}
	if (game.time.now > nextEnemy[PLANE_SMALL] && enemys[PLANE_SMALL].countDead() > 0){ // Spawn small enemy plane
		nextEnemy[PLANE_SMALL] = game.time.now + game.rnd.integerInRange(1000, 3000);
		var enemy = enemys[PLANE_SMALL].getFirstExists(false);
		enemy.reset(game.rnd.integerInRange(20, game.width - 20), 0, PLANE_SMALL_HEALTH);
		enemy.body.velocity.y = game.rnd.integerInRange(30, 60);
		enemy.enemyNextFire = 0;
	}
	if (game.time.now > nextEnemy[PLANE_MEDIUM] && enemys[PLANE_MEDIUM].countDead() > 0){ // Spawn medium enemy plane
		nextEnemy[PLANE_MEDIUM] = game.time.now + game.rnd.integerInRange(2000, 4000);
		var enemy = enemys[PLANE_MEDIUM].getFirstExists(false);
		enemy.reset(game.rnd.integerInRange(20, game.width - 20), 0, PLANE_MEDIUM_HEALTH);
		var target = game.rnd.integerInRange(20, game.width - 20);
		enemy.rotation = game.physics.arcade.moveToXY(
			enemy, target, game.height,
			game.rnd.integerInRange(40, 80)
		) - Math.PI / 2;
		enemy.enemyNextFire = 0;
	}
	if (game.time.now > nextEnemy[PLANE_LARGE] && enemys[PLANE_LARGE].countDead() > 0){ // Spawn large enemy plane
		nextEnemy[PLANE_LARGE] = game.time.now + game.rnd.integerInRange(60000, 120000);
		var enemy = enemys[PLANE_LARGE].getFirstExists(false);
		enemy.reset(game.rnd.integerInRange(20, game.width - 20), 0, PLANE_LARGE_HEALTH);
		enemy.body.velocity.y = game.rnd.integerInRange(10, 20);
		enemy.enemyNextFire = 0;
	}
}

function spawn_boss() {
	if(bosses.countDead() === MAX_BOSS){
		var boss = bosses.getFirstExists(false);
		boss.body.collideWorldBounds = false;
		boss.reset( game.width / 2, 0, BOSS_HEALTH);
		boss.body.velocity.y = BOSS_SPEED;
		boss.bossNextFire = 0;
		bossSpawned = true;

		game.time.events.add(Phaser.Timer.SECOND * (boss.height/2/BOSS_SPEED), move_boss, this, boss);
	}
}

function move_boss(current_boss) {
	if( current_boss != null && current_boss.alive )	{
		if( !current_boss.body.collideWorldBounds )
			current_boss.body.collideWorldBounds = true;

		game.physics.arcade.velocityFromAngle(
			game.rnd.integerInRange(0, 360), BOSS_SPEED*10, current_boss.body.velocity
		);

		game.time.events.add(Phaser.Timer.SECOND * game.rnd.integerInRange(3, 6), move_boss, this, current_boss);
	}
}

function fort_attack(enemy)	{
	if ( enemyBullets[FORT_BULLET].countDead() > 0 && enemy.alive ){
		enemy.play('open');
		for( var i = 0 ; i < FORT_BULLET_NUM; i ++ )	{
			//  left
			var enemy_bullet = enemyBullets[FORT_BULLET].getFirstDead();
			enemy_bullet.reset(enemy.x - i*30, enemy.y );
			enemy_bullet.body.velocity.x = -enemy_bullet_velocity[FORT];
			// right
			enemy_bullet = enemyBullets[FORT_BULLET].getFirstDead();
			enemy_bullet.reset(enemy.x + i*30, enemy.y );
			enemy_bullet.body.velocity.x = enemy_bullet_velocity[FORT];
			// bottom
			enemy_bullet = enemyBullets[FORT_BULLET].getFirstDead();
			enemy_bullet.reset(enemy.x, enemy.y + i*30);
			enemy_bullet.body.velocity.y = enemy_bullet_velocity[FORT];
			// top
			enemy_bullet = enemyBullets[FORT_BULLET].getFirstDead();
			enemy_bullet.reset(enemy.x, enemy.y - i*30);
			enemy_bullet.body.velocity.y = -enemy_bullet_velocity[FORT];
		}
		enemy.play('close');
	}else if( !enemy.alive ){
		game.time.events.remove(enemy.loop);
	}
}

function plane_attack() {
	if( !player.alive && !multiplePlayer)
		return;
	if( multiplePlayer && !player.alive && !player2.alive)
		return;

	enemys[PLANE_SMALL].forEachAlive(function (enemy) {
		if (game.time.now > enemy.enemyNextFire && enemyBullets[PLANE_SMALL_BULLET].countDead() > 0){
			enemy.enemyNextFire = game.time.now + game.rnd.integerInRange(1000, 3000);
			var enemy_bullet = enemyBullets[PLANE_SMALL_BULLET].getFirstDead();
			enemy_bullet.reset(enemy.x, enemy.y + enemy.height/2);
			enemy_bullet.body.velocity.y = enemy_bullet_velocity[PLANE_SMALL];
		}
	}, this);

	enemys[PLANE_MEDIUM].forEachAlive(function (enemy) {
		if (game.time.now > enemy.enemyNextFire && enemyBullets[PLANE_MEDIUM_BULLET].countDead() > 0){
			enemy.enemyNextFire = game.time.now + game.rnd.integerInRange(2000, 5000);
			var enemy_bullet = enemyBullets[PLANE_MEDIUM_BULLET].getFirstDead();
			enemy_bullet.reset(enemy.x, enemy.y + enemy.height/2);
			if(multiplePlayer){
				if(game.rnd.integerInRange(1, 100) > 50){
					game.physics.arcade.moveToObject(enemy_bullet, player, enemy_bullet_velocity[PLANE_MEDIUM]);
				}else{
					game.physics.arcade.moveToObject(enemy_bullet, player2, enemy_bullet_velocity[PLANE_MEDIUM]);
				}
			}else{
				game.physics.arcade.moveToObject(enemy_bullet, player, enemy_bullet_velocity[PLANE_MEDIUM]);
			}
		}
	}, this);

	enemys[PLANE_LARGE].forEachAlive(function (enemy) {
		if (game.time.now > enemy.enemyNextFire && enemyBullets[PLANE_LARGE_BULLET].countDead() > 0){
			enemy.enemyNextFire = game.time.now + game.rnd.integerInRange(5000, 6000);
			if(multiplePlayer){
				for( var i = 0 ; i < PLANE_LARGE_BULLET_NUM; i ++ )	{
					var enemy_bullet = enemyBullets[PLANE_LARGE_BULLET].getFirstDead();
					enemy_bullet.reset(enemy.x + 50, enemy.y + enemy.height/2 - i*30);
					game.physics.arcade.moveToObject(enemy_bullet, player, enemy_bullet_velocity[PLANE_LARGE]);
					enemy_bullet = enemyBullets[PLANE_LARGE_BULLET].getFirstDead();
					enemy_bullet.reset(enemy.x - 50, enemy.y + enemy.height/2 - i*30);
					game.physics.arcade.moveToObject(enemy_bullet, player2, enemy_bullet_velocity[PLANE_LARGE]);
				}
			}else{
				for( var i = 0 ; i < PLANE_LARGE_BULLET_NUM; i ++ )	{
					var enemy_bullet = enemyBullets[PLANE_LARGE_BULLET].getFirstDead();
					enemy_bullet.reset(enemy.x + 50, enemy.y + enemy.height/2 - i*30);
					game.physics.arcade.moveToObject(enemy_bullet, player, enemy_bullet_velocity[PLANE_LARGE]);
					enemy_bullet = enemyBullets[PLANE_LARGE_BULLET].getFirstDead();
					enemy_bullet.reset(enemy.x - 50, enemy.y + enemy.height/2 - i*30);
					game.physics.arcade.moveToObject(enemy_bullet, player, enemy_bullet_velocity[PLANE_LARGE]);
				}
			}
		}
	}, this);
}

function boss_attack() {
	bosses.forEachAlive(function (boss){
		if (game.time.now > boss.bossNextFire){ //bossbullet
			boss.bossNextFire = game.time.now + game.rnd.integerInRange(5000, 6000);

			var cur_boss_bullet_type = game.rnd.integerInRange(0, 1);
			var cur_boss_bullet = bossBullet[parseInt(cur_boss_bullet_type)];

			switch( cur_boss_bullet_type )	{
				case BOSS_BULLET_ATTACK:	// green round bullet
					BossBulletAttack(boss, cur_boss_bullet);
					break;
				case BOSS_LASER_ATTACK:
					BossLaserAttack(boss, cur_boss_bullet);
					break;
			}
		}
	}, this);
}

function BossBulletAttack(boss, bullets) {
	// left canon
	for( var i = 0 ; i < 19 ; i ++ )	{
		var boss_bullet = bullets.getFirstDead();
		boss_bullet.reset(boss.x - boss.width*7/16, boss.y + boss.height/8);
		game.physics.arcade.velocityFromAngle( (i*20) % 185 + 40, enemy_bullet_velocity[PLANE_SMALL], boss_bullet.body.velocity);
	}
	// mid-left canon
	for( var i = 0 ; i < 19 ; i ++ )	{
		var boss_bullet = bullets.getFirstDead();
		boss_bullet.reset(boss.x - boss.width*3/16, boss.y + boss.height/4);
		game.physics.arcade.velocityFromAngle( (i*20) % 185, enemy_bullet_velocity[PLANE_SMALL], boss_bullet.body.velocity);
	}
	// mid-right canon
	for( var i = 0 ; i < 19 ; i ++ )	{
		var boss_bullet = bullets.getFirstDead();
		boss_bullet.reset(boss.x + boss.width/8, boss.y + boss.height/4);
		game.physics.arcade.velocityFromAngle( (i*20) % 185, enemy_bullet_velocity[PLANE_SMALL], boss_bullet.body.velocity);
	}
	// right canon
	for( var i = 0 ; i < 19 ; i ++ )	{
		var boss_bullet = bullets.getFirstDead();
		boss_bullet.reset(boss.x + boss.width*3/8, boss.y + boss.height/8);
		game.physics.arcade.velocityFromAngle( (i*20) % 185 - 40, enemy_bullet_velocity[PLANE_SMALL], boss_bullet.body.velocity);
	}
}

function BossLaserAttack(boss, bullets)	{
	// left canon
	var boss_bullet = bullets.getFirstDead();
	boss_bullet.reset(boss.x - boss.width*7/16, boss.y + boss.height/8);
	boss_bullet.body.velocity.y = enemy_bullet_velocity[PLANE_MEDIUM];
	// mid-left canon
	boss_bullet = bullets.getFirstDead();
	boss_bullet.reset(boss.x - boss.width*3/16, boss.y + boss.height/4);
	boss_bullet.body.velocity.y = enemy_bullet_velocity[PLANE_MEDIUM];
	// mid-right canon
	boss_bullet = bullets.getFirstDead();
	boss_bullet.reset(boss.x + boss.width/8, boss.y + boss.height/4);
	boss_bullet.body.velocity.y = enemy_bullet_velocity[PLANE_MEDIUM];
	// right canon
	boss_bullet = bullets.getFirstDead();
	boss_bullet.reset(boss.x + boss.width*3/8, boss.y + boss.height/8);
	boss_bullet.body.velocity.y = enemy_bullet_velocity[PLANE_MEDIUM];
}

function createRocket()	{
	if (game.time.now > player.nextRocket && rocketPool.countDead() > 0){
		player.nextRocket = game.time.now + ROCKET_COOLDOWN;
		for( var i = 0 ; i <= weaponLevel/2 ; i ++ )	{
			var rocket = rocketPool.getFirstDead();
			rocket.reset(player.x + 50, player.y + player.height/2 );
			rocket.target = enemys[game.rnd.integerInRange(0, 3)].getFirstAlive();
			rocket.angle = 5 + i*20;
			game.physics.arcade.velocityFromAngle( -95 - i*20, rocket_velocity + 25*weaponLevel, rocket.body.velocity);

			rocket = rocketPool.getFirstDead();
			rocket.reset(player.x - 50, player.y + player.height/2 );
			rocket.target = enemys[game.rnd.integerInRange(0, 3)].getFirstAlive();
			rocket.angle = -5 - i*20;
			game.physics.arcade.velocityFromAngle( -85 + i*20, rocket_velocity + 25*weaponLevel, rocket.body.velocity);
		}
	}
}

function rotateRocket()	{
	rocketPool.forEachAlive(function(rocket)	{
		if( rocket.target != null && rocket.target.alive )	{
			var radians = game.physics.arcade.angleBetween(rocket, rocket.target);
			var degrees = radians * (180/Math.PI);
			game.physics.arcade.velocityFromAngle(degrees, rocket_velocity + 25*weaponLevel, rocket.body.velocity);
			rocket.angle = degrees+90;
		}else {
			// velocity along original
		}
	}, this);
}

function enemyHit(bullet, enemy) {
	bullet.kill();
	enemy.damage(1);
	//if (enemy.alive) play hit animation(not available yet) else play explode animation
	explode(enemy);
	score += 10;
}

function rayenemyHit(bullet, enemy) {
	enemy.damage(1);
	//if (enemy.alive) play hit animation(not available yet) else play explode animation
	explode(enemy);
	score += 10;
}

function lightningenemyHit(lightning, enemy) {
	enemy.damage(1);
	//if (enemy.alive) play hit animation(not available yet) else play explode animation
	explode(enemy);
	score += 10;
}

function fireballenemyHit(fireball, enemy) {
	enemy.damage(1);
	//if (enemy.alive) play hit animation(not available yet) else play explode animation
	explode(enemy);
	score += 10;
}

function lightningBulletHit(lightning, bullet) {
	explode(bullet);
	bullet.kill();
	score += 5;
}

function playerVsBoss(player, boss)	{
	if (playerSpawnUndead === true) {
		return;
	}
	else if (playerSuper === true) {
		explode(boss);
		boss.damage(10);
		score += 10;
		return;
	}
	explode(boss);
	explode(player);

	game.time.events.remove(player.shield.loop);

	var life = lives.getFirstAlive();
	if (life !== null) {
		life.kill();
		if(multiplePlayer){
			socket.emit('vibrate1'+magicPN, 'hit');
		}else{
			socket.emit('vibrate'+magicPN, 'hit');
		}
		setPlayerSpawnTimeUndead();
		player.reset(game.width / 2, game.height - 50);
	} else {
		player.kill();
		player.shield.kill();
		if(FireballsExist === true)
			resetFireballs();
		if(multiplePlayer){
			socket.emit('vibrate1'+magicPN, 'die');
			gameOver1();
		}else{
			socket.emit('vibrate'+magicPN, 'die');
			gameOver();
			killAllEnemy();
			killAllEnemyBullet();
			killAllLigntning();
		}
	}
}

function playerHit(player, enemy) {
	if (playerSpawnUndead === true) {
		return;
	}
	else if (playerSuper === true) {
		explode(enemy);
		enemy.kill();
		score += 10;
		return;
	}
	explode(enemy);
	explode(player);
	enemy.kill();
	game.time.events.remove(player.shield.loop);

	var life = lives.getFirstAlive();
	if (life !== null) {
		life.kill();
		if(multiplePlayer){
			socket.emit('vibrate1'+magicPN, 'hit');
		}else{
			socket.emit('vibrate'+magicPN, 'hit');
		}
		setPlayerSpawnTimeUndead();
		if(multiplePlayer){
			player.reset(game.width / 3, game.height - 50);
		}else{
			player.reset(game.width / 2, game.height - 50);
		}
	} else {
		player.kill();
		player.shield.kill();
		if(FireballsExist === true)
			resetFireballs();
		if(multiplePlayer){
			socket.emit('vibrate1'+magicPN, 'die');
			gameOver1();
		}else{
			socket.emit('vibrate'+magicPN, 'die');
			gameOver();
			killAllEnemy();
			killAllEnemyBullet();
			killAllLigntning();
		}
	}
}

function playerHitByBullet(player, bullet) {
	if (playerSpawnUndead === true) {
		return;
	}
	else if (playerSuper === true) {
		bullet.kill();
		return;
	}
	explode(player);
	bullet.kill();
	game.time.events.remove(player.shield.loop);

	var life = lives.getFirstAlive();
	if (life !== null) {
		life.kill();
		if(multiplePlayer){
			socket.emit('vibrate1'+magicPN, 'hit');
		}else{
			socket.emit('vibrate'+magicPN, 'hit');
		}
		setPlayerSpawnTimeUndead();
		if(multiplePlayer){
			player.reset(game.width / 3, game.height - 50);
		}else{
			player.reset(game.width / 2, game.height - 50);
		}
	} else {
		player.kill();
		player.shield.kill();
		if(FireballsExist === true)
			resetFireballs();

		if(multiplePlayer){
			socket.emit('vibrate1'+magicPN, 'die');
			gameOver1();
		}else{
			socket.emit('vibrate'+magicPN, 'die');
			gameOver();
			killAllEnemy();
			killAllEnemyBullet();
			killAllLigntning();
		}
	}
}

function PlayerVsBox(player, box)	{
	switch(box.type)	{
		case yellow:
			FireBallSurround(player);
			weaponLevel--
			break;
		case orange:
			weaponLevel--;
			heal();
			break;
		case green:
			weaponLevel--;
			if(fireRate>100){
				fireRate-=25;
				rayfireRate-=100;
				lightningfireRate-=250;
			}
			break;
		case chocolate:
			break;
		case blue:
			break;
		case dark_blue:
			break;
		case gray:
			break;
		case colorful:
			superPlayer();
			break;
	}

	box.kill();
	score += 50;
	if( weaponLevel < MAX_WEAPON_LEVEL )
		weaponLevel ++;
}

function heal()	{
	var dead_lives = lives.countDead();
	if( dead_lives > 0 ) 	{
		var newlife = lives.getChildAt(dead_lives-1);
		newlife.reset(this.game.width - 10 - (MAX_LIFE * 30) + 30*(dead_lives-1) , 30);
	}
}

function superPlayer(){
// When got a colorful box, the player can become undead and kill the enemies (except turrets) with bumping
	if(playerSuper === true){
		game.time.events.remove(superEvent);
	} else{
		tmptint = player.tint;
		player.alpha = 1;
		tweenPlayer.stop();
		playerSuper = true;
		playerSpawnUndead = false;
		var startTime = Date.now();
		for(var i = 0; i < 6; i++){
			superTween[i] = game.add.tween(player).to({ tint: tints[i] }, 200, Phaser.Easing.Linear.None, false, 0, 1, false);
		}
		for(var i = 0; i < 6; i++){
			superTween[i].chain(superTween[(i+1)%6]);
		}
		superTween[0].start();
	}
	superEvent = game.time.events.add(playerSuperTime, function(){
		for(var i = 0; i < 6; i++){
			superTween[i].stop();
		}
		player.tint = tmptint;
		playerSuper = false;
	}, this);
}

function enemyHit2(bullet, enemy) { // player 2
	bullet.kill();
	enemy.damage(1);
	//if (enemy.alive) play hit animation(not available yet) else play explode animation
	explode(enemy);
	score2 += 10;
}

function rayenemyHit2(bullet, enemy) { // player 2
	enemy.damage(1);
	//if (enemy.alive) play hit animation(not available yet) else play explode animation
	explode(enemy);
	score2 += 10;
}

function lightningenemyHit2(lightning, enemy) { // player 2
	enemy.damage(1);
	//if (enemy.alive) play hit animation(not available yet) else play explode animation
	explode(enemy);
	score2 += 10;
}

function fireballenemyHit2(fireball, enemy) { // player 2
	enemy.damage(1);
	//if (enemy.alive) play hit animation(not available yet) else play explode animation
	explode(enemy);
	score2 += 10;
}

function lightningBulletHit2(lightning, bullet) { // player 2
	explode(bullet);
	bullet.kill();
	score2 += 5;
}

function playerHit2(player, enemy) { // player 2
	if (playerSpawnUndead2 === true) {
		return;
	}
	else if (playerSuper2 === true) {
		explode(enemy);
		enemy.kill();
		score2 += 10;
		return;
	}
	explode(enemy);
	explode(player2);
	enemy.kill();
	game.time.events.remove(player2.shield.loop);

	var life = lives2.getFirstAlive();
	if (life !== null) {
		life.kill();
		socket.emit('vibrate2'+magicPN, 'hit');
		setPlayerSpawnTimeUndead2();
		player2.reset(game.width * 2 / 3, game.height - 50);
	} else {
		player2.kill();
		player2.shield.kill();
		if(FireballsExist2 === true)
			resetFireballs2();
		socket.emit('vibrate2'+magicPN, 'die');
		gameOver2();
		killAllEnemy();
		killAllEnemyBullet();
		killAllLigntning();
	}
}

function playerHitByBullet2(player, bullet) { // player 2
	if (playerSpawnUndead2 === true) {
		return;
	}
	else if (playerSuper2 === true) {
		bullet.kill();
		return;
	}
	explode(player2);
	bullet.kill();
	game.time.events.remove(player2.shield.loop);

	var life = lives2.getFirstAlive();
	if (life !== null) {
		life.kill();
		socket.emit('vibrate2'+magicPN, 'hit');
		setPlayerSpawnTimeUndead2();
		player2.reset(game.width * 2 / 3, game.height - 50);
	} else {
		player2.kill();
		player2.shield.kill();
		if(FireballsExist2 === true)
			resetFireballs2();
		socket.emit('vibrate2'+magicPN, 'die');
		gameOver2();
		killAllEnemy();
		killAllEnemyBullet();
		killAllLigntning();
	}
}

function PlayerVsBox2(player, box) { // player 2
	switch(box.type)	{
		case yellow:
			FireBallSurround2(player);
			weaponLevel2--;
			break;
		case orange:
			weaponLevel2--;
			heal2();
			break;
		case green:
			weaponLevel2--;
			if(fireRate2>100){
				fireRate2-=25;
				rayfireRate2-=100;
				lightningfireRate2-=250;
			}
			break;
		case chocolate:
			break;
		case blue:
			break;
		case dark_blue:
			break;
		case gray:
			break;
		case colorful:
			superPlayer2();
			break;
	}

	box.kill();
	score2 += 50;
	if( weaponLevel2 < MAX_WEAPON_LEVEL )
		weaponLevel2 ++;
}

function heal2() { // player 2
	var dead_lives = lives2.countDead();
	if( dead_lives > 0 ) 	{
		var newlife = lives2.getChildAt(dead_lives-1);
		newlife.reset(this.game.width - 10 - (MAX_LIFE * 30) + 30*(dead_lives-1) , 70);
	}
}

function superPlayer2() { // player 2
// OLD SUPER PLAYER
	var tint = player2.tint;
	player2.alpha = 1;
	tweenPlayer2.stop();
	playerSuper2 = true;
	playerSpawnUndead2 = false;
	var startTime = Date.now();
	var tween1 = game.add.tween(player2).to({ tint: 0xff00ff }, 200, Phaser.Easing.Linear.None, false, 0, 1, false);
	var tween2 = game.add.tween(player2).to({ tint: 0x00ffff }, 200, Phaser.Easing.Linear.None, false, 0, 1, false);
	var tween3 = game.add.tween(player2).to({ tint: 0x0000ff }, 200, Phaser.Easing.Linear.None, false, 0, 1, false);
	var tween4 = game.add.tween(player2).to({ tint: 0xff00ff }, 200, Phaser.Easing.Linear.None, false, 0, 1, false);
	var tween5 = game.add.tween(player2).to({ tint: 0xff0000 }, 200, Phaser.Easing.Linear.None, false, 0, 1, false);
	var tween6 = game.add.tween(player2).to({ tint: 0xffff00 }, 200, Phaser.Easing.Linear.None, false, 0, 1, false);
	tween1.chain(tween2);
	tween2.chain(tween3);
	tween3.chain(tween4);
	tween4.chain(tween5);
	tween5.chain(tween6);
	tween6.chain(tween1);
	tween1.start();
	game.time.events.add(playerSuperTime, function(){
		tween1.stop();
		tween2.stop();
		tween3.stop();
		tween4.stop();
		tween5.stop();
		tween6.stop();
		player2.tint = tint;
		playerSuper2 = false;
	}, this);
}

function swap() {
	if(weaponMode === BULLET) weaponMode = LIGHTNING;
	else if(weaponMode === LIGHTNING) weaponMode = RAY;
	else weaponMode = BULLET;
}

function FireBallSurround(sprite) {
	if (fireballs.countDead() === 0) {
		for(var i = 0; i < MAX_FIREBALL; i++){
			game.time.events.remove(fireballEvent[i]);
			fireballEvent[i] = game.time.events.add(Phaser.Timer.SECOND * FIREBALL_TIME, fadeFireball, this, Ball[i]);
		}
	}
	else {
		FireballsExist = true;
		fireballStartTime = game.time.now;
		for(var i = 0; i < MAX_FIREBALL; i++){
			Ball[i] = fireballs.getFirstDead();
			Ball[i].reset(sprite.x, sprite.y);
			Ball[i].animations.add('flame', [0,1,2], 3, true);
			Ball[i].play('flame', 15, true, false);
			fireballEvent[i] = game.time.events.add(Phaser.Timer.SECOND * FIREBALL_TIME, fadeFireball, this, Ball[i]);
		}
	}
}

function FireBallSurround2(sprite) {
	if(fireballs2.countDead() === 0) {
		for(var i = 0; i < MAX_FIREBALL; i++){
			game.time.events.remove(fireballEvent2[i]);
			fireballEvent2[i] = game.time.events.add(Phaser.Timer.SECOND * FIREBALL_TIME, fadeFireball, this, Ball2[i]);
		}
	}
	else {
		FireballsExist2 = true;
		fireballStartTime2 = game.time.now;
		for(var i = 0; i < MAX_FIREBALL; i++){
			Ball2[i] = fireballs.getFirstDead();
			Ball2[i].reset(sprite.x, sprite.y);
			Ball2[i].animations.add('flame', [0,1,2], 3, true);
			Ball2[i].play('flame', 15, true, false);
			fireballEvent2[i] = game.time.events.add(Phaser.Timer.SECOND * FIREBALL_TIME, fadeFireball, this, Ball2[i]);
		}
	}
}

function explode(sprite) {
	explodeSFX.play();
	if (explosionPool.countDead() > 0){
		var explosion = explosionPool.getFirstExists(false);
		explosion.reset(sprite.x, sprite.y);
		explosion.play('boom', 15, false, true);
		explosion.body.velocity.x = sprite.body.velocity.x;
		explosion.body.velocity.y = sprite.body.velocity.y;
	}
}

function gameOver() {
	state = ENDGAME;
	DIFFICULTY = 1;
	DIFFICULTY_CHANGE=NOCHANGE;
	levelupLoopRemove = true;
	game.time.events.remove(levelup_loop);
	if( difficultyText != null )
		difficultyTextDel();
	gameOverText = game.add.text(game.width/2, 0, 'Game Over!', { font: '32px sans-serif', fill: '#fff'});
	gameOverText.anchor.setTo(0.5, 0.5);

	enemy_bullet_velocity = [200, 350, 250, 200]; // initialize velocity

	var boss = bosses.getFirstAlive(); // remove boss
	if( boss != null )	{
		boss.kill();
	}

	//var user = {name: String(username), score: parseInt(40000), time: Date.now()}; // save to DB
	var user = {name: String(username1), score: parseInt(score), time: Date.now()}; // save to DB
	
	socket.emit("data"+magicPN, user);
}

function gameOver1() { // multiplayer gameover
	player1Die = true;
	if(player2Die){
		state = ENDGAME;
		launchult();
		DIFFICULTY = 1;
		DIFFICULTY_CHANGE=NOCHANGE;
		levelupLoopRemove = true;
		game.time.events.remove(levelup_loop);
		if(score > score2){
			gameOverText = game.add.bitmapText(game.width/2, game.height/2, 'minecraftia', username1 + ' Wins');
		}else if(score < score2){
			gameOverText = game.add.bitmapText(game.width/2, game.height/2, 'minecraftia', username2 + ' Wins');
		}else{
			gameOverText = game.add.bitmapText(game.width/2, game.height/2, 'minecraftia', 'Tie');
		}
		gameOverText.anchor.setTo(0.5, 0.5);

		enemy_bullet_velocity = [200, 350, 250, 200]; // initialize velocity
	}
}

function gameOver2() { // multiplayer gameover
	player2Die = true;
	if(player1Die){
		state = ENDGAME;
		launchult();
		DIFFICULTY = 1;
		DIFFICULTY_CHANGE=NOCHANGE;
		levelupLoopRemove = true;
		game.time.events.remove(levelup_loop);
		if(score > score2){
			gameOverText = game.add.bitmapText(game.width/2, game.height/2, 'minecraftia', username1 + ' Wins');
		}else if(score < score2){
			gameOverText = game.add.bitmapText(game.width/2, game.height/2, 'minecraftia', username2 + ' Wins');
		}else{
			gameOverText = game.add.bitmapText(game.width/2, game.height/2, 'minecraftia', 'Tie');
		}
		gameOverText.anchor.setTo(0.5, 0.5);

		enemy_bullet_velocity = [200, 350, 250, 200]; // initialize velocity
	}
}

function setupBackground() {
	game.physics.startSystem(Phaser.Physics.ARCADE);
	background = game.add.tileSprite(0, 0, window.innerWidth, window.innerHeight, 'seatiles');
	background.tileScale.x = window.innerWidth/background.width;
	background.tileScale.y = window.innerHeight/background.height;
}

function setupPlayer(isSetSpawnTimeUndead) {
	isSetSpawnTimeUndead = typeof isSetSpawnTimeUndead !== 'undefined' ? isSetSpawnTimeUndead : true;

	if( player != null )	{
		player.reset(game.width / 2, game.height - 50);
	}else{
		player = game.add.sprite(game.width / 2, game.height - 50, 'player');
	}
	game.physics.arcade.enable(player);
	player.body.collideWorldBounds = true;
	player.anchor.x = 0.5;
	player.anchor.y = 0.5;
	player.scale.setTo(1.5, 1.5);

	player.shield = game.add.sprite(player.x, player.y, 'shield');
	game.physics.arcade.enable(player.shield);
	player.shield.anchor.x = 0.5;
	player.shield.anchor.y = 0.5;
	player.shield.animations.add('effect', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 20, true);
	player.shield.animations.play('effect');
	player.shield.loop = game.time.events.loop(Phaser.Timer.SECOND * 3, function()	{
		player.shield.animations.play('effect');
	}, this);

	player.nextRocket = 0;

	if (isSetSpawnTimeUndead === true)
		setPlayerSpawnTimeUndead();
}

function setPlayerSpawnTimeUndead() {
	player.alpha = 1;
	playerSpawnUndead = true;
	tweenPlayer = game.add.tween(player).to( { alpha: 0.5 }, 200, Phaser.Easing.Linear.None, true, 0, playerSpawnUndeadTime / (200 * 2), true);
	game.time.events.add(playerSpawnUndeadTime, function(){
		player.alpha = 1;
		tweenPlayer.stop();
		playerSpawnUndead = false;
	}, this);
}

function setupPlayer2(isSetSpawnTimeUndead) { // player 2
	isSetSpawnTimeUndead = typeof isSetSpawnTimeUndead !== 'undefined' ? isSetSpawnTimeUndead : true;

	player2 = game.add.sprite(game.width * 2 / 3, game.height - 50, 'player2');
	game.physics.arcade.enable(player2);
	player2.body.collideWorldBounds = true;
	player2.anchor.x = 0.5;
	player2.anchor.y = 0.5;
	player2.scale.setTo(1.5, 1.5);

	player2.shield = game.add.sprite(player2.x, player2.y, 'shield2');
	game.physics.arcade.enable(player2.shield);
	player2.shield.anchor.x = 0.5;
	player2.shield.anchor.y = 0.5;
	player2.shield.animations.add('effect', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 20, true);
	player2.shield.animations.play('effect');
	player2.shield.loop = game.time.events.loop(Phaser.Timer.SECOND * 3, function()	{
		player2.shield.animations.play('effect');
	}, this);

	player2.nextRocket = 0;

	if (isSetSpawnTimeUndead === true)
		setPlayerSpawnTimeUndead2();
}

function setPlayerSpawnTimeUndead2() { // player 2
	player2.alpha = 1;
	playerSpawnUndead2 = true;
	tweenPlayer2 = game.add.tween(player2).to( { alpha: 0.5 }, 200, Phaser.Easing.Linear.None, true, 0, playerSpawnUndeadTime / (200 * 2), true);
	game.time.events.add(playerSpawnUndeadTime, function(){
		player2.alpha = 1;
		tweenPlayer2.stop();
		playerSpawnUndead2 = false;
	}, this);
}

function setupBullets() {
	bullets = game.add.group();
	bullets.enableBody = true;
	bullets.physicsBodyType = Phaser.Physics.ARCADE;
	bullets.createMultiple(weapon_num[BULLET], 'bullet');
	bullets.setAll('checkWorldBounds', true);
	bullets.setAll('outOfBoundsKill', true);
}

function setupRays() {
	rays = game.add.group();
	rays.enableBody = true;
	rays.physicsBodyType = Phaser.Physics.ARCADE;
	rays.createMultiple(weapon_num[RAY], 'ray');
	rays.setAll('checkWorldBounds', true);
	rays.setAll('outOfBoundsKill', true);
	rays.setAll('anchor.x', 0.5);
	rays.setAll('anchor.y', 0.8);
}

function setupLightnings() {
	lightnings = game.add.group();
	lightnings.enableBody = true;
	lightnings.physicsBodyType = Phaser.Physics.ARCADE;
	lightnings.createMultiple(weapon_num[LIGHTNING], 'lightning');
	lightnings.setAll('anchor.x', 0.5);
}

function setupBullets2() { // player 2
	bullets2 = game.add.group();
	bullets2.enableBody = true;
	bullets2.physicsBodyType = Phaser.Physics.ARCADE;
	bullets2.createMultiple(weapon_num[BULLET], 'bullet2');
	bullets2.setAll('checkWorldBounds', true);
	bullets2.setAll('outOfBoundsKill', true);
}

function setupRays2() { // player 2
	rays2 = game.add.group();
	rays2.enableBody = true;
	rays2.physicsBodyType = Phaser.Physics.ARCADE;
	rays2.createMultiple(weapon_num[RAY], 'ray2');
	rays2.setAll('checkWorldBounds', true);
	rays2.setAll('outOfBoundsKill', true);
	rays2.setAll('anchor.x', 0.5);
	rays2.setAll('anchor.y', 0.8);
}

function setupLightnings2() { // player 2
	lightnings2 = game.add.group();
	lightnings2.enableBody = true;
	lightnings2.physicsBodyType = Phaser.Physics.ARCADE;
	lightnings2.createMultiple(weapon_num[LIGHTNING], 'lightning2');
	lightnings2.setAll('anchor.x', 0.5);
}

function setupFireRate() {
	fireRate = 200;
	fireRate2 = 200;
	rayfireRate = 500;
	rayfireRate2 = 500;
	lightningfireRate = 2000;
	lightningfireRate2 = 2000;
}

function setupFireBalls() {
	fireballs = game.add.group();
	fireballs.enableBody = true;
	fireballs.physicsBodyType = Phaser.Physics.ARCADE;
	fireballs.createMultiple(MAX_FIREBALL, 'fireball');
	fireballs.setAll('anchor.x', 0.5);
	fireballs.setAll('anchor.y', 0.5);
	fireballs.setAll('scale.x', 0.8);
	fireballs.setAll('scale.y', 0.8);
}

function setupFireBalls2() { // player 2
	fireballs2 = game.add.group();
	fireballs2.enableBody = true;
	fireballs2.physicsBodyType = Phaser.Physics.ARCADE;
	fireballs2.createMultiple(MAX_FIREBALL, 'fireball');
	fireballs2.setAll('anchor.x', 0.5);
	fireballs2.setAll('anchor.y', 0.5);
	fireballs2.setAll('scale.x', 0.8);
	fireballs2.setAll('scale.y', 0.8);
}

function setupEnemys() {
	for(var i = 0 ; i < ENEMY_KINDS; i++){
		enemys[i] = game.add.group();
		enemys[i].enableBody = true;
		enemys[i].physicsBodyType = Phaser.Physics.ARCADE;
		enemys[i].createMultiple(enemy_num[i], 'enemy'+i);
		enemys[i].setAll('checkWorldBounds', true);
		enemys[i].setAll('outOfBoundsKill', true);
		enemys[i].setAll('anchor.x', 0.5);
		enemys[i].setAll('anchor.y', 0.5);
		enemys[i].setAll('scale.x', (i == 3) ? 3 : 1.5);
		enemys[i].setAll('scale.y', (i == 3) ? 3 : 1.5);

		enemys[i].forEach(function(enemy)	{
			enemy.body.width *= enemy.scale.x;
			enemy.body.height *= enemy.scale.y;
		});
	}
}

function setupBoss() {
	bosses = game.add.group();
	bosses.enableBody = true;
	bosses.physicsBodyType = Phaser.Physics.ARCADE;
	bosses.createMultiple(MAX_BOSS, 'boss');
	bosses.setAll('checkWorldBounds', true);
	bosses.setAll('outOfBoundsKill', true);
	bosses.setAll('anchor.x', 0.5);
	bosses.setAll('anchor.y', 0.5);
}

function setupEnemyBullets() {
	for( var i = 0; i < ENEMY_BULLET_KINDS; i ++ ) {
		enemyBullets[i] = game.add.group();
		enemyBullets[i].enableBody = true;
		enemyBullets[i].physicsBodyType = Phaser.Physics.ARCADE;
		enemyBullets[i].createMultiple(enemyBullet_num[i], 'enemy_bullet' + (i+1) );
		enemyBullets[i].setAll('checkWorldBounds', true);
		enemyBullets[i].setAll('outOfBoundsKill', true);
		enemyBullets[i].setAll('scale.x', 1.5);
		enemyBullets[i].setAll('scale.y', 1.5);
	}

	for( var i = 0 ; i < 2 ; i ++ )	{
		bossBullet[i] = game.add.group();
		bossBullet[i].enableBody = true;
		bossBullet[i].physicsBodyType = Phaser.Physics.ARCADE;
		bossBullet[i].createMultiple(bossBullet_num[i], 'boss_bullet' + i );
		bossBullet[i].setAll('checkWorldBounds', true);
		bossBullet[i].setAll('outOfBoundsKill', true);
	}
}

function setupPlayerLives() {
	lives = game.add.group();
	var firstLifeIconX = this.game.width - 10 - (MAX_LIFE * 30);
	for (var i = 0; i < MAX_LIFE; i++) {
		var lifeIcon = this.lives.create(firstLifeIconX + (30 * i), 30, 'player');
		lifeIcon.scale.setTo(0.8, 0.8);
		lifeIcon.anchor.setTo(0.5, 0.5);
	}
}

function resetPlayerLives() {
	var firstLifeIconX = this.game.width - 10 - (MAX_LIFE * 30);
	for (var i = 0; i < MAX_LIFE; i++) {
		var lifeIcon = this.lives.create(firstLifeIconX + (30 * i), 30, 'player');
		lifeIcon.scale.setTo(0.8, 0.8);
		lifeIcon.anchor.setTo(0.5, 0.5);
	}
}

function setupPlayerLives2() { // player 2
	lives2 = game.add.group();
	var firstLifeIconX = this.game.width - 10 - (MAX_LIFE * 30);
	for (var i = 0; i < MAX_LIFE; i++) {
		var lifeIcon = this.lives2.create(firstLifeIconX + (30 * i), 70, 'player2');
		lifeIcon.scale.setTo(0.8, 0.8);
		lifeIcon.anchor.setTo(0.5, 0.5);
	}
}

function resetPlayerLives2() { // player 2
	var firstLifeIconX = this.game.width - 10 - (MAX_LIFE * 30);
	for (var i = 0; i < MAX_LIFE; i++) {
		var lifeIcon = this.lives2.create(firstLifeIconX + (30 * i), 70, 'player2');
		lifeIcon.scale.setTo(0.8, 0.8);
		lifeIcon.anchor.setTo(0.5, 0.5);
	}
}

function setupBoxes() {
	boxes = game.add.group();
	boxes.enableBody = true;
	boxes.physicsBodyType = Phaser.Physics.ARCADE;
	boxes.createMultiple(MAX_BOXES, 'bonus_box');
	boxes.setAll('body.collideWorldBounds', true);
	boxes.setAll('outOfBoundsKill', true);
	boxes.setAll('body.bounce.x', 1);
	boxes.setAll('body.bounce.y', 1);
}

function setupExplosions() {
	explosionPool = game.add.group();
	explosionPool.enableBody = true;
	explosionPool.physicsBodyType = Phaser.Physics.ARCADE;
	explosionPool.createMultiple(MAX_EXPLOSION, 'explosion');
	explosionPool.setAll('anchor.x', 0.5);
	explosionPool.setAll('anchor.y', 0.5);
	explosionPool.setAll('scale.x', 1.5);
	explosionPool.setAll('scale.y', 1.5);
	explosionPool.forEach(function (explosion) {
		explosion.animations.add('boom');
	});
}

function setupMenu() {
	gamestartMenu = game.add.sprite(game.width/2, game.height / 2, 'start_menu');
	gamestartMenu.anchor.setTo(0.5, 0.5);
}

function resetMenu() {
	gamestartMenu.reset(game.width/2, game.height / 2);
}

function setupULT(){
	ult_loading_sign = game.add.sprite(16, 36, 'ult_loading_sign');
}

function setupRocket() {
	rocketPool = game.add.group();
	rocketPool.enableBody = true;
	rocketPool.physicsBodyType = Phaser.Physics.ARCADE;
	rocketPool.createMultiple(MAX_ROCKETS, 'rocket');
	rocketPool.setAll('checkWorldBounds', true);
	rocketPool.setAll('outOfBoundsKill', true);
	rocketPool.setAll('anchor.x', 0.5);
	rocketPool.setAll('anchor.y', 0.5);
	rocketPool.setAll('scale.x', 0.75);
	rocketPool.setAll('scale.y', 0.75);

	rocketPool.forEach(function(rocket)	{
		rocket.frame = 42; // select the up arrow
	});
}
