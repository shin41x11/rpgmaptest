import Phaser from 'phaser';
import { Direction, PlayerState } from '@/types/game';
import { useAudio } from '@/lib/stores/useAudio';
import { useGameState } from '@/lib/stores/useGameState';

export class WorldScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private playerState: PlayerState = {
    direction: Direction.DOWN,
    isMoving: false
  };
  private map?: Phaser.Tilemaps.Tilemap;
  private terrainLayer?: Phaser.Tilemaps.TilemapLayer;
  private obstaclesLayer?: Phaser.Tilemaps.TilemapLayer;
  private backgroundMusic?: Phaser.Sound.BaseSound;
  private hitSound?: Phaser.Sound.BaseSound;
  private successSound?: Phaser.Sound.BaseSound;

  constructor() {
    super('WorldScene');
  }

  create(): void {
    console.log('Creating world scene');
    
    // Create the tilemap
    this.createMap();
    
    // Create player
    this.createPlayer();
    
    // Setup camera
    this.setupCamera();
    
    // Setup input
    this.setupInput();
    
    // Setup sounds
    this.setupSounds();
  }

  update(): void {
    if (!this.player || !this.cursors) return;

    // Reset player velocity
    this.player.setVelocity(0);

    // Handle player movement
    this.handlePlayerMovement();
  }

  private createMap(): void {
    // Create the tilemap from the JSON data
    this.map = this.make.tilemap({ key: 'world' });
    
    try {
      // Add tilesets using the available textures
      const grassTileset = this.map.addTilesetImage('grass', 'grass') || undefined;
      const sandTileset = this.map.addTilesetImage('sand', 'sand') || undefined;
      const waterTileset = this.map.addTilesetImage('water', 'wood') || undefined;
      const obstacleTileset = this.map.addTilesetImage('obstacle', 'asphalt') || undefined;
      
      // Create the terrain layer if all required tilesets are available
      if (grassTileset && sandTileset && waterTileset) {
        // Use non-null assertion operator since we already checked for null values
        const tilesets = [grassTileset, sandTileset, waterTileset].filter(Boolean) as Phaser.Tilemaps.Tileset[];
        const terrainLayer = this.map.createLayer('Terrain', tilesets, 0, 0);
        if (terrainLayer) this.terrainLayer = terrainLayer;
      }
      
      // Create the obstacles layer if the tileset is available
      if (obstacleTileset) {
        const obstaclesLayer = this.map.createLayer('Obstacles', [obstacleTileset], 0, 0);
        if (obstaclesLayer) this.obstaclesLayer = obstaclesLayer;
      }
      
      // Set collisions for the obstacles layer
      if (this.obstaclesLayer) {
        this.obstaclesLayer.setCollisionByProperty({ collides: true });
      }
      
      // Set world bounds based on the map dimensions
      if (this.terrainLayer) {
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
      }
    } catch (error) {
      console.error('Error creating map layers:', error);
      
      // Create a simple fallback map with a green background if tilemap fails to load
      const worldWidth = 1280;
      const worldHeight = 1280;
      
      // Set a background color instead of using the tilemap
      this.cameras.main.setBackgroundColor(0x4CAF50);
      
      // Set world bounds
      this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    }
  }

  private createPlayer(): void {
    try {
      // Default position in the center of the screen
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      
      // Try to get the spawn point from the map if it exists
      let x = centerX;
      let y = centerY;
      
      if (this.map) {
        try {
          const spawnPoint = this.map.findObject('Objects', obj => obj.name === 'SpawnPoint');
          if (spawnPoint && spawnPoint.x !== undefined && spawnPoint.y !== undefined) {
            x = spawnPoint.x;
            y = spawnPoint.y;
          }
        } catch (error) {
          console.error('Error finding spawn point:', error);
        }
      }
      
      // Create the player sprite at the spawn location
      this.player = this.physics.add.sprite(x, y, 'hero');
      this.player.setScale(0.5);
      this.player.setCollideWorldBounds(true);
      
      // Create simple player animations for SVG sprite
      this.createPlayerAnimations();
      
      // Add collision between player and obstacles if they exist
      if (this.obstaclesLayer) {
        // Create a collider with a type-safe callback
        const collider = this.physics.add.collider(
          this.player, 
          this.obstaclesLayer, 
          () => {
            // Play hit sound when collision occurs
            this.hitSound?.play();
            console.log('Collision with obstacle detected');
          }, 
          undefined, 
          this
        );
      }
    } catch (error) {
      console.error('Error creating player:', error);
    }
  }

  private createPlayerAnimations(): void {
    // For SVG sprite, we'll use simple directional animations
    // Down
    this.anims.create({
      key: 'down',
      frames: [{ key: 'hero', frame: 0 }],
      frameRate: 10,
    });
    
    // Left
    this.anims.create({
      key: 'left',
      frames: [{ key: 'hero', frame: 0 }],
      frameRate: 10,
    });
    
    // Right
    this.anims.create({
      key: 'right',
      frames: [{ key: 'hero', frame: 0 }],
      frameRate: 10,
    });
    
    // Up
    this.anims.create({
      key: 'up',
      frames: [{ key: 'hero', frame: 0 }],
      frameRate: 10,
    });
    
    // Idle
    this.anims.create({
      key: 'idle',
      frames: [{ key: 'hero', frame: 0 }],
      frameRate: 10
    });
  }

  private setupCamera(): void {
    // Set bounds for the camera to follow the player within the map
    if (this.map && this.player) {
      this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
      this.cameras.main.startFollow(this.player, true, 0.5, 0.5);
      this.cameras.main.setZoom(1.5); // Default zoom level
    }
  }

  private setupInput(): void {
    // Create cursor keys for input
    this.cursors = this.input.keyboard?.createCursorKeys();
    
    // Add key listener for debugging
    this.input.keyboard?.on('keydown-D', () => {
      this.physics.world.drawDebug = !this.physics.world.drawDebug;
      if (!this.physics.world.drawDebug) {
        this.physics.world.debugGraphic.clear();
      }
      console.log('Debug mode:', this.physics.world.drawDebug ? 'ON' : 'OFF');
    });
    
    // Add key listener for zooming
    this.input.keyboard?.on('keydown-Z', () => {
      this.cameras.main.zoom += 0.25;
      console.log('Zoomed in, current zoom:', this.cameras.main.zoom);
    });
    
    this.input.keyboard?.on('keydown-X', () => {
      this.cameras.main.zoom -= 0.25;
      console.log('Zoomed out, current zoom:', this.cameras.main.zoom);
    });
  }

  private setupSounds(): void {
    // Setup background music
    this.backgroundMusic = this.sound.add('background', { 
      loop: true, 
      volume: 0.5 
    });
    this.backgroundMusic.play();
    
    // Setup sound effects
    this.hitSound = this.sound.add('hit', { volume: 0.3 });
    this.successSound = this.sound.add('success', { volume: 0.5 });
    
    // Sync with useAudio store
    const audioEl = this.backgroundMusic as unknown as HTMLAudioElement;
    const hitEl = this.hitSound as unknown as HTMLAudioElement;
    const successEl = this.successSound as unknown as HTMLAudioElement;
    
    useAudio.getState().setBackgroundMusic(audioEl);
    useAudio.getState().setHitSound(hitEl);
    useAudio.getState().setSuccessSound(successEl);
    
    // Update the game state
    useGameState.getState().setHealth(100);
    useGameState.getState().resetGame();
  }

  private handlePlayerMovement(): void {
    if (!this.player || !this.cursors) return;

    const speed = 160;
    let isMoving = false;
    
    // Check for movement input
    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-speed);
      this.player.flipX = true; // Flip sprite to face left
      this.playerState.direction = Direction.LEFT;
      isMoving = true;
      console.log('Moving left');
    } else if (this.cursors.right?.isDown) {
      this.player.setVelocityX(speed);
      this.player.flipX = false; // Reset flip
      this.playerState.direction = Direction.RIGHT;
      isMoving = true;
      console.log('Moving right');
    }
    
    if (this.cursors.up?.isDown) {
      this.player.setVelocityY(-speed);
      if (!isMoving) {
        this.playerState.direction = Direction.UP;
      }
      isMoving = true;
      console.log('Moving up');
    } else if (this.cursors.down?.isDown) {
      this.player.setVelocityY(speed);
      if (!isMoving) {
        this.playerState.direction = Direction.DOWN;
      }
      isMoving = true;
      console.log('Moving down');
    }
    
    // Update player state
    this.playerState.isMoving = isMoving;
    
    // Play appropriate animation based on movement
    if (isMoving) {
      switch(this.playerState.direction) {
        case Direction.UP:
          this.player.anims.play('up', true);
          break;
        case Direction.DOWN:
          this.player.anims.play('down', true);
          break;
        case Direction.LEFT:
          this.player.anims.play('left', true);
          break;
        case Direction.RIGHT:
          this.player.anims.play('right', true);
          break;
      }
    } else {
      // If not moving, show idle animation
      this.player.anims.play('idle', true);
    }
  }

  // handleCollision is now implemented inline in the createPlayer method
}
