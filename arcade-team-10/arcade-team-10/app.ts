﻿window.onload = function ()
{
	//  Note that this html file is set to pull down Phaser 2.5.0 from the JS Delivr CDN.
	//  Although it will work fine with this tutorial, it's almost certainly not the most current version.
	//  Be sure to replace it with an updated version before you start experimenting with adding your own code.
	var game = new Phaser.Game(1920, 1080, Phaser.AUTO, '', { preload: preload, create: create, update: update });

	let keyState: Phaser.Keyboard;
	let player: Player;
	var enemies;
	let enemyBullets: Phaser.Group;

	let walls: Phaser.Group;
	var gates: Phaser.Group;
	let gate1: Barrier;
	let gate2: Barrier;
	let gate3: Barrier;
	let gate4: Barrier;
	let background: Phaser.Sprite;

	let scoreText: Phaser.Text;
	var score;

	let lives: Phaser.Group;
	var hud;

	function preload()
	{
		game.stage.backgroundColor = '#eee';
		game.load.spritesheet('pSprite', 'assets/PlayerSpritesheet.png', 128, 52, 6, 0, 2);
		game.load.image('testBullet', 'assets/temp.png');

		game.load.image('background', 'assets/Maze1.png');
		game.load.image('wall', 'assets/wall.png');
		game.load.image('life', 'assets/life.png');
		game.load.image('gate', 'assets/gate.png');

		game.load.image('heart', 'assets/Heart.png');
	}

	function create()
	{
		fullScreen();
		game.physics.startSystem(Phaser.Physics.ARCADE);
		background = game.add.sprite(0, 0, 'background');
		background.scale.setTo(4, 3);

		createWalls();
		createGates();
		player = new Player(300, 350, game);
		game.add.existing(player);

		enemies = game.add.group();
		enemies.enableBody = true;
		enemies.physicsBodyType = Phaser.Physics.ARCADE;

		enemyBullets = game.add.physicsGroup();
		enemyBullets.enableBody = true;
		enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;

		createEnemies();

		hud = game.add.group();
		hud.enableBody = false;
		for (var i = 0; i < player.maxHealth; i++)
		{
			hud.add(new Phaser.Sprite(game, 0, 0, 'heart'));
			hud.children[i].position.set((hud.children[i].width * i) + (hud.children[i].width / 2), hud.children[i].height / 2);
		}

		var style = { font: "bold 64px Arial", fill: '#fff', align: "right", boundsAlignH: "right" };
		scoreText = game.add.text(game.world.width - 100, 5, '0', style);
		scoreText.setTextBounds(-50, 0, 100, 100);
		score = 0;

		//lives = game.add.group();
		//for (var i = 0; i < player.lives; i++)
		//{
		//	var life = lives.create(20 + (30 * i), 30, 'life');
		//	life.anchor.setTo(0.5, 0.5);
		//}
	}

	function update()
	{
		let deltaTime: number = game.time.elapsed / 10;

		keyState = game.input.keyboard;

		player.pUpdate(deltaTime, keyState);
		enemies.forEach(function (enemy)
		{
			enemy.eUpdate(deltaTime);
		}, this);

		game.physics.arcade.collide(player, walls);
		game.physics.arcade.collide(enemies, walls);
		game.physics.arcade.collide(player, gates, screenTransition);

		game.physics.arcade.collide(player.weapon.bullets, walls, killBullet);
		game.physics.arcade.collide(enemyBullets, walls, killBullet);

		game.physics.arcade.overlap(player, enemies, enemyHitPlayer);

		game.physics.arcade.overlap(player.weapon.bullets, enemies, bulletHitEnemy, null, this);
		for (var i = 0; i < enemies.children.length; i++)
		{
			game.physics.arcade.overlap(enemies.children[i].weapon.bullets, player, bulletHitPlayer, null, this);
		}

		scoreText.text = score;
	}

	function fullScreen()
	{
		game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVertically = true;
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.setGameSize(1280, 720);
	}

	function bulletHitPlayer(player: Player, bullet: Phaser.Bullet)
	{
		bullet.kill();
		damagePlayer(player, 1);
	}

	function enemyHitPlayer(player: Player, enemy: Enemy)
	{
		damagePlayer(player, 1);
	}

	function damagePlayer(player: Player, dNum: number)
	{
		if (player.canDamage)
		{
			player.damage(dNum);
			hud.children[player.health].visible = false;
			playerInvuln();
			playerVisible();
			game.time.events.repeat(200, 3, playerVisible, this);
			game.time.events.add(800, playerInvuln, this);
		}
	}

	function playerVisible()
	{
		player.visible = !player.visible;
	}

	function playerInvuln()
	{
		player.canDamage = !player.canDamage;
	}

	function healPlayer(player: Player, hNum: number)
	{
		hud.children[player.health].visible = true;
		player.heal(hNum);
	}

	function increaseHealth(player: Player)
	{
		player.maxHealth += 1;
		player.heal(1);
		hud.add(new Phaser.Sprite(game, (hud.children[0].width * (player.maxHealth - 1)) + (hud.children[0].width / 2), hud.children[0].height / 2, 'heart'));
	}

	function bulletHitEnemy(enemy: Enemy, bullet: Phaser.Bullet) // -----------------------------------------------------Enemy code
	{
		bullet.kill();
		enemy.kill();
		score += 50;
	}

	function createEnemies()
	{
		var enemy1 = new Enemy(300, 550, game, player);
		enemies.add(enemy1);
		enemyBullets.add(enemy1.weapon.bullets);

		var enemy2 = new Enemy(1000, 500, game, player);
		enemies.add(enemy2);
		enemyBullets.add(enemy2.weapon.bullets);

		var enemy3 = new Enemy(1000, 200, game, player);
		enemies.add(enemy3);
		enemyBullets.add(enemy3.weapon.bullets);
	}

	function createWalls()
	{
		walls = game.add.physicsGroup();

		var wall1 = new Barrier(145, 35, 400, 10, game, walls, 'wall');
		var wall2 = new Barrier(735, 35, 400, 10, game, walls, 'wall');
		var wall3 = new Barrier(735, 650, 400, 10, game, walls, 'wall');
		var wall4 = new Barrier(145, 650, 400, 10, game, walls, 'wall');
		var wall5 = new Barrier(145, 240, 220, 10, game, walls, 'wall');
		var wall6 = new Barrier(735, 240, 400, 10, game, walls, 'wall');
		var wall7 = new Barrier(145, 450, 220, 10, game, walls, 'wall');
		var wall8 = new Barrier(145, 35, 10, 200, game, walls, 'wall');
		var wall9 = new Barrier(145, 450, 10, 200, game, walls, 'wall');
		var wall10 = new Barrier(735, 450, 10, 200, game, walls, 'wall');
		var wall11 = new Barrier(1120, 450, 10, 200, game, walls, 'wall');
		var wall12 = new Barrier(1120, 35, 10, 200, game, walls, 'wall');
		var wall13 = new Barrier(530, 250, 10, 200, game, walls, 'wall');
		var wall14 = new Barrier(530, 440, 220, 10, game, walls, 'wall');

		walls.enableBody = true;
	}

	function createGates()
	{
		gates = game.add.physicsGroup();

		gate1 = new Barrier(540, 35, 200, 10, game, gates, 'gate');
		gate2 = new Barrier(540, 650, 200, 10, game, gates, 'gate');
		gate3 = new Barrier(145, 250, 10, 190, game, gates, 'gate');
		gate4 = new Barrier(1120, 250, 10, 190, game, gates, 'gate');

		gates.enableBody = true;
	}

	function screenTransition(player: Player, gate: Barrier)
	{
		gates.forEach(function (item)
		{
			item.renderable = false;
		}, this);

		if (player.body.touching.left && gate4.renderable != true)
		{
			player.body.position.x = 1000;
			player.body.position.y = 300;
			gate4.renderable = true;
		}
		else if (player.body.touching.right && gate3.renderable != true)
		{
			player.body.position.x = 300;
			player.body.position.y = 300;
			gate3.renderable = true;
		}
		else if (player.body.touching.down && gate1.renderable != true)
		{
			player.body.position.x = 600;
			player.body.position.y = 100;
			gate1.renderable = true;
		}
		else if (player.body.touching.up && gate2.renderable != true)
		{
			player.body.position.x = 600;
			player.body.position.y = 500;
			gate2.renderable = true;
		}

		enemies.removeAll();
		enemyBullets.removeAll();
		createEnemies();
	}

	function killPlayer(player: Player)
	{
		var life = lives.getFirstAlive();

		if (life)
		{
			life.kill();
			player.kill();
			player.lives--;
			player.reset(300, 300, 1);
		}

		if (player.lives < 1)
		{
			score = "Game Over";
			player.kill();
		}
	}

	function killBullet(bullet: Phaser.Bullet, wall: Barrier)
	{
		bullet.kill();
	}
};

class Barrier extends Phaser.Sprite 
{
	constructor(xPos: number, yPos: number, width: number, height: number, game: Phaser.Game, group: Phaser.Group, type: string)
	{
		super(game, xPos, yPos, type);
		this.scale.setTo(width, height);
		game.physics.arcade.enable(this);
		this.body.immovable = true;
		this.renderable = false;
		group.add(this);
	}
}

class Player extends Phaser.Sprite
{
	aim: boolean;
	pVelocityX: number;
	pVelocityY: number;
	pSpeed: number;
	weapon: Phaser.Weapon;
	lives: number;
	canDamage: boolean;
	newPFrame;

	pDirEnum =
	{
		RIGHT: 0,
		LEFT: 1,
		UPRIGHT: 2,
		UPLEFT: 3,
		DOWN: 4,
		UP: 5,
		DOWNRIGHT: 6,
		DOWNLEFT: 7
	};

	constructor(xPos: number, yPos: number, game: Phaser.Game)
	{
		super(game, xPos, yPos, 'pSprite');

		this.frame = this.pDirEnum.RIGHT;
		this.newPFrame = this.frame;
		this.smoothed = false;
		this.exists = true;
		this.anchor.setTo(0.5, 0.5);

		this.game.physics.enable(this, Phaser.Physics.ARCADE);
		this.body.setSize(30, 45, 28, 8);
		this.body.collideWorldBounds = true;
		this.maxHealth = 5;
		this.health = this.maxHealth;
		this.canDamage = true;

		this.aim = false;
		this.pVelocityX = 0;
		this.pVelocityY = 0;
		this.pSpeed = 150;

		this.weapon = game.add.weapon(100, 'testBullet');
		
		this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
		this.weapon.bulletSpeed = 200;
		this.weapon.fireRate = 500;

		this.lives = 1;
	}

	pUpdate(time: number, keyState: Phaser.Keyboard)
	{
		this.pVelocityX = 0;
		this.pVelocityY = 0;

		if (keyState.isDown(Phaser.KeyCode.SPACEBAR))
		{
			this.aim = true;
		}

		this.weapon.trackSprite(this, 0, 0);
		this.weapon.fireAngle = 0;

		if (!this.aim)
		{
			if ((keyState.isDown(Phaser.KeyCode.W) || keyState.isDown(Phaser.KeyCode.S)) && (keyState.isDown(Phaser.KeyCode.D) || keyState.isDown(Phaser.KeyCode.A)) && !((keyState.isDown(Phaser.KeyCode.W) && keyState.isDown(Phaser.KeyCode.S)) || (keyState.isDown(Phaser.KeyCode.A) && keyState.isDown(Phaser.KeyCode.D))))
			{
				if (keyState.isDown(Phaser.KeyCode.W))
				{
					this.pVelocityY -= Math.sqrt(Math.pow(this.pSpeed, 2) / 2);
				}
				else
				{
					this.pVelocityY += Math.sqrt(Math.pow(this.pSpeed, 2) / 2);
				}

				if (keyState.isDown(Phaser.KeyCode.A))
				{
					this.pVelocityX -= Math.sqrt(Math.pow(this.pSpeed, 2) / 2);
				}
				else
				{
					this.pVelocityX += Math.sqrt(Math.pow(this.pSpeed, 2) / 2);
				}
			}
			else
			{
				if (keyState.isDown(Phaser.KeyCode.W))
				{
					this.pVelocityY -= this.pSpeed;
				}
				if (keyState.isDown(Phaser.KeyCode.S))
				{
					this.pVelocityY += this.pSpeed;
				}

				if (keyState.isDown(Phaser.KeyCode.A))
				{
					this.pVelocityX -= this.pSpeed;
				}
				if (keyState.isDown(Phaser.KeyCode.D))
				{
					this.pVelocityX += this.pSpeed;
				}
			}
		}
		else
		{
			if ((keyState.isDown(Phaser.KeyCode.W) || keyState.isDown(Phaser.KeyCode.S)) && (keyState.isDown(Phaser.KeyCode.D) || keyState.isDown(Phaser.KeyCode.A)) && !((keyState.isDown(Phaser.KeyCode.W) && keyState.isDown(Phaser.KeyCode.S)) || (keyState.isDown(Phaser.KeyCode.A) && keyState.isDown(Phaser.KeyCode.D))))
			{
				if (keyState.isDown(Phaser.KeyCode.W))
				{
					//this.weapon.trackOffset.y = -this.height / 2;
					this.weapon.fireAngle = 270;
				}
				else
				{
					//this.weapon.trackOffset.y = this.height / 2;
					this.weapon.fireAngle = 90;
				}

				if (keyState.isDown(Phaser.KeyCode.A))
				{
					//this.weapon.trackOffset.x = -this.width / 2;
					if (this.weapon.fireAngle > 180)
					{
						this.weapon.fireAngle -= 45;
					}
					else
					{
						this.weapon.fireAngle += 45;
					}
				}
				else
				{
					//this.weapon.trackOffset.x = this.width / 2;
					if (this.weapon.fireAngle > 180)
					{
						this.weapon.fireAngle += 45;
					}
					else
					{
						this.weapon.fireAngle -= 45;
					}
				}
			}
			else
			{
				if (keyState.isDown(Phaser.KeyCode.W))
				{
					//this.weapon.trackOffset.y -= this.height / 2;
					this.weapon.fireAngle = 270;
				}
				if (keyState.isDown(Phaser.KeyCode.S))
				{
					//this.weapon.trackOffset.y += this.height / 2;
					if (this.weapon.fireAngle == 270)
					{
						this.weapon.fireAngle = 0;
					}
					else
					{
						this.weapon.fireAngle = 90;
					}
				}

				if (keyState.isDown(Phaser.KeyCode.A))
				{
					//this.weapon.trackOffset.x -= this.width / 2;
					this.weapon.fireAngle = 180;
				}
				if (keyState.isDown(Phaser.KeyCode.D))
				{
					//this.weapon.trackOffset.x += this.width / 2;
					this.weapon.fireAngle = 0;
				}
			}
			this.weapon.bulletAngleOffset = 90;
			this.weapon.fire(this.body.center);
		}

		// ----------------------------------------------------- Determining new direction

		if (this.pVelocityX > 0)
		{
			if (this.pVelocityY > 0)
			{
				this.newPFrame = this.pDirEnum.DOWNRIGHT;
			}
			else if (this.pVelocityY < 0)
			{
				this.newPFrame = this.pDirEnum.UPRIGHT;
			}
			else
			{
				this.newPFrame = this.pDirEnum.RIGHT;
			}
		}
		else if (this.pVelocityX < 0)
		{
			if (this.pVelocityY > 0)
			{
				this.newPFrame = this.pDirEnum.DOWNLEFT;
			}
			else if (this.pVelocityY < 0)
			{
				this.newPFrame = this.pDirEnum.UPLEFT;
			}
			else
			{
				this.newPFrame = this.pDirEnum.LEFT;
			}
		}
		else
		{
			if (this.pVelocityY > 0)
			{
				this.newPFrame = this.pDirEnum.DOWN;
			}
			else if (this.pVelocityY < 0)
			{
				this.newPFrame = this.pDirEnum.UP;
			}
		}

		if (this.pVelocityX == 0 && this.pVelocityY == 0)
		{
			if (this.weapon.fireAngle == 90 || this.weapon.fireAngle == 45 || this.weapon.fireAngle == 135)
			{
				this.newPFrame = this.pDirEnum.DOWN;
			}
			else if (this.weapon.fireAngle == 0)
			{
				this.newPFrame = this.pDirEnum.RIGHT;
			}
			else if (this.weapon.fireAngle == 180)
			{
				this.newPFrame = this.pDirEnum.LEFT;
			}
			else if (this.weapon.fireAngle == 270)
			{
				this.newPFrame = this.pDirEnum.UP;
			}
			else if (this.weapon.fireAngle == 225)
			{
				this.newPFrame = this.pDirEnum.UPLEFT;
			}
			else if (this.weapon.fireAngle == 315)
			{
				this.newPFrame = this.pDirEnum.UPRIGHT;
			}
		}

		if (this.newPFrame == this.pDirEnum.DOWNLEFT || this.newPFrame == this.pDirEnum.DOWNRIGHT)
		{
			this.newPFrame = this.pDirEnum.DOWN;
		}

		if (this.newPFrame != this.frame)
		{
			this.frame = this.newPFrame;
		}

		// -----------------------------------------------------

		this.body.velocity.y = this.pVelocityY * time;
		this.body.velocity.x = this.pVelocityX * time;

		this.aim = false;
	}
}

class Enemy extends Phaser.Sprite // -----------------------------------------------------Enemy code
{
	aim: boolean;
	eVelocityX: number;
	eVelocityY: number;
	eSpeed: number;
	weapon: Phaser.Weapon;
	player: Player;

	eMoveUp: boolean;
	eMoveDown: boolean;
	eMoveLeft: boolean;
	eMoveRight: boolean;
	eAim: boolean;

	fireTimer: number;
	dead: boolean;

	constructor(xPos: number, yPos: number, game: Phaser.Game, player: Player)
	{
		super(game, xPos, yPos, 'life');
		this.smoothed = false;
		this.exists = true;
		this.anchor.setTo(0.5, 0.5);

		this.game.physics.enable(this, Phaser.Physics.ARCADE);
		this.body.collideWorldBounds = true;
		this.maxHealth = 1;

		this.aim = false;
		this.eVelocityX = 0;
		this.eVelocityY = 0;
		this.eSpeed = 50;
		this.fireTimer = this.game.time.now + 3000;

		this.weapon = game.add.weapon(100, 'testBullet');
		this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
		this.weapon.bulletSpeed = 200;
		this.weapon.fireRate = 500;

		this.player = player;
		game.add.existing(this);
	}

	ePathfinding()
	{
		if (this.alive)
		{
			if (this.position.x < this.player.position.x - 10)
			{
				this.eMoveLeft = false;
				this.eMoveRight = true;
			}
			else if (this.position.x > this.player.position.x + 10)
			{
				this.eMoveLeft = true;
				this.eMoveRight = false;
			}
			else
			{
				this.eMoveLeft = false;
				this.eMoveRight = false;
			}

			if (this.position.y < this.player.position.y - 10)
			{
				this.eMoveUp = false;
				this.eMoveDown = true;
			}
			else if (this.position.y > this.player.position.y + 10)
			{
				this.eMoveUp = true;
				this.eMoveDown = false;
			}
			else
			{
				this.eMoveUp = false;
				this.eMoveDown = false;
			}
		}
	}

	eUpdate(time: number)
	{
		if (this.alive)
		{
			this.eVelocityX = 0;
			this.eVelocityY = 0;

			if (this.game.time.now > this.fireTimer)
			{
				this.eAim = true;
				this.fireTimer = this.game.time.now + 2000;
			}

			if (this.eAim)
			{
				this.aim = true;
			}

			this.weapon.trackSprite(this, 0, 0);
			this.weapon.fireAngle = 0;

			this.ePathfinding();
			if (!this.aim)
			{
				if ((this.eMoveUp || this.eMoveDown) && (this.eMoveLeft || this.eMoveRight) && !((this.eMoveUp && this.eMoveDown) || (this.eMoveLeft && this.eMoveRight)))
				{
					if (this.eMoveUp)
					{
						this.eVelocityY -= Math.sqrt(Math.pow(this.eSpeed, 2) / 2);
					}
					else
					{
						this.eVelocityY += Math.sqrt(Math.pow(this.eSpeed, 2) / 2);
					}

					if (this.eMoveLeft)
					{
						this.eVelocityX -= Math.sqrt(Math.pow(this.eSpeed, 2) / 2);
					}
					else
					{
						this.eVelocityX += Math.sqrt(Math.pow(this.eSpeed, 2) / 2);
					}
				}
				else
				{
					if (this.eMoveUp)
					{
						this.eVelocityY -= this.eSpeed;
					}
					if (this.eMoveDown)
					{
						this.eVelocityY += this.eSpeed;
						this.weapon.fireAngle = 90;
					}

					if (this.eMoveLeft)
					{
						this.eVelocityX -= this.eSpeed;
						this.weapon.fireAngle = 180;
					}
					if (this.eMoveRight)
					{
						this.eVelocityX += this.eSpeed;
						this.weapon.fireAngle = 0;
					}
				}
			}
			else
			{
				if ((this.eMoveUp || this.eMoveDown) && (this.eMoveLeft || this.eMoveRight) && !((this.eMoveUp && this.eMoveDown) || (this.eMoveLeft && this.eMoveRight)))
				{
					if (this.eMoveUp)
					{
						this.weapon.trackOffset.y = -this.height / 2;
						this.weapon.fireAngle = 270;
					}
					else
					{
						this.weapon.trackOffset.y = this.height / 2;
						this.weapon.fireAngle = 90;
					}

					if (this.eMoveLeft)
					{
						this.weapon.trackOffset.x = -this.width / 2;
						if (this.weapon.fireAngle > 180)
						{
							this.weapon.fireAngle -= 45;
						}
						else
						{
							this.weapon.fireAngle += 45;
						}
					}
					else
					{
						this.weapon.trackOffset.x = this.width / 2;
						if (this.weapon.fireAngle > 180)
						{
							this.weapon.fireAngle += 45;
						}
						else
						{
							this.weapon.fireAngle -= 45;
						}
					}
				}
				else
				{
					if (this.eMoveUp)
					{
						this.weapon.trackOffset.y -= this.height / 2;
						this.weapon.fireAngle = 270;
					}
					if (this.eMoveDown)
					{
						this.weapon.trackOffset.y += this.height / 2;
						if (this.weapon.fireAngle == 270)
						{
							this.weapon.fireAngle = 0;
						}
						else
						{
							this.weapon.fireAngle = 90;
						}
					}

					if (this.eMoveLeft)
					{
						this.weapon.trackOffset.x -= this.width / 2;
						this.weapon.fireAngle = 180;
					}
					if (this.eMoveRight)
					{
						this.weapon.trackOffset.x += this.width / 2;
						this.weapon.fireAngle = 0;
					}
				}
				this.weapon.bulletAngleOffset = 90;
				this.weapon.fire();
				this.eAim = false;
			}

			this.body.velocity.y = this.eVelocityY * time;
			this.body.velocity.x = this.eVelocityX * time;

			this.aim = false;
		}
	}
}