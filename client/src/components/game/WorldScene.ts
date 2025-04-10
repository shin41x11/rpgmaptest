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
  private backgroundMusic?: Phaser.Sound.BaseSound;
  private hitSound?: Phaser.Sound.BaseSound;
  private successSound?: Phaser.Sound.BaseSound;

  constructor() {
    super('WorldScene');
  }

  create(): void {
    console.log('Creating world scene');
    
    try {
      // Set a green background color
      this.cameras.main.setBackgroundColor(0x4CAF50);
      
      // Set world bounds
      this.physics.world.setBounds(0, 0, 1280, 720);
      
      // Create player
      this.createPlayer();
      
      // Setup camera
      this.setupCamera();
      
      // Setup input
      this.setupInput();
      
      // Setup sounds
      this.setupSounds();
      
      console.log('World scene created successfully');
    } catch (error) {
      console.error('Error creating world scene:', error);
    }
  }

  update(): void {
    try {
      if (!this.player || !this.cursors) return;
      
      // Store initial position for debugging
      const startX = this.player.x;
      const startY = this.player.y;
      
      // Apply direct movement (position changes) based on input
      this.handlePlayerMovement();
      
      // Check if player position changed
      const hasMoved = (startX !== this.player.x || startY !== this.player.y);
      
      // Always log movement on each frame for better debugging
      if (hasMoved) {
        console.log('Player moved:', 
          'from:', startX.toFixed(0), startY.toFixed(0),
          'to:', this.player.x.toFixed(0), this.player.y.toFixed(0),
          'delta:', (this.player.x - startX).toFixed(0), (this.player.y - startY).toFixed(0)
        );
      }
    } catch (error) {
      console.error('Error in update:', error);
    }
  }

  private createPlayer(): void {
    try {
      // Create the player sprite at center of screen
      const x = this.cameras.main.width / 2;
      const y = this.cameras.main.height / 2;
      
      console.log('Creating player at position:', x, y);
      
      // Create the player with physics
      this.player = this.physics.add.sprite(x, y, 'hero');
      
      if (this.player) {
        // Make it bigger and set initial scale
        this.player.setScale(1.0);
        
        // Turn off collision with world bounds - we'll handle manually
        this.player.setCollideWorldBounds(false);
        
        // Apply a distinctive color tint so it's very visible
        this.player.setTint(0xFF0000); // Bright red
      }
      
      // Log success
      console.log('Player created successfully');
    } catch (error) {
      console.error('Error creating player:', error);
    }
  }

  private setupCamera(): void {
    try {
      if (this.player) {
        // Basic camera setup - follow player
        this.cameras.main.startFollow(this.player, true, 0.5, 0.5);
        this.cameras.main.setZoom(1.5); // Default zoom level
        console.log('Camera setup complete');
      }
    } catch (error) {
      console.error('Error setting up camera:', error);
    }
  }

  private setupInput(): void {
    try {
      // Create cursor keys for input
      this.cursors = this.input.keyboard?.createCursorKeys();
      
      // Set up direct event listeners for arrow keys as backup
      const leftKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
      const rightKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
      const upKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
      const downKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
      
      // Alternative WASD keys
      const wKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      const aKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      const sKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      const dKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      
      // Log that we've added these explicit key handlers
      console.log('Alternative key controls added', 
        'LEFT:', !!leftKey,
        'RIGHT:', !!rightKey,
        'UP:', !!upKey,
        'DOWN:', !!downKey,
        'WASD:', !!wKey && !!aKey && !!sKey && !!dKey
      );
      
      // Add key listener for zooming
      this.input.keyboard?.on('keydown-Z', () => {
        this.cameras.main.zoom += 0.25;
        console.log('Zoomed in, current zoom:', this.cameras.main.zoom);
      });
      
      this.input.keyboard?.on('keydown-X', () => {
        this.cameras.main.zoom -= 0.25;
        console.log('Zoomed out, current zoom:', this.cameras.main.zoom);
      });
      
      // Add specific debug key press logging
      this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
        console.log('Key pressed:', event.key, event.keyCode);
      });
      
      console.log('Input setup complete with enhanced controls');
    } catch (error) {
      console.error('Error setting up input:', error);
    }
  }

  private setupSounds(): void {
    try {
      // Get the sounds created in PreloadScene
      this.backgroundMusic = this.sound.get('background');
      this.hitSound = this.sound.get('hit');
      this.successSound = this.sound.get('success');
      
      // Update the game state
      useGameState.getState().setHealth(100);
      useGameState.getState().resetGame();
      
      console.log('Sound setup complete');
    } catch (error) {
      console.error('Error setting up sounds:', error);
    }
  }

  private handlePlayerMovement(): void {
    if (!this.player || !this.cursors) {
      console.log('Player or cursors not initialized');
      return;
    }

    const moveStep = 30; // さらに移動量を大幅に増やす
    let isMoving = false;
    
    // Get keyboard state for WASD keys
    const wKey = this.input.keyboard?.addKey('W');
    const aKey = this.input.keyboard?.addKey('A');
    const sKey = this.input.keyboard?.addKey('S');
    const dKey = this.input.keyboard?.addKey('D');
    
    // Keyboard checks for movement
    const leftPressed = this.cursors.left?.isDown || aKey?.isDown;
    const rightPressed = this.cursors.right?.isDown || dKey?.isDown;
    const upPressed = this.cursors.up?.isDown || wKey?.isDown;
    const downPressed = this.cursors.down?.isDown || sKey?.isDown;
    
    // Store current position
    let x = this.player.x;
    let y = this.player.y;
    
    // Move using direct position changes instead of velocity
    if (leftPressed) {
      x -= moveStep;
      this.player.flipX = true;
      this.playerState.direction = Direction.LEFT;
      isMoving = true;
      console.log('Moving left');
    } else if (rightPressed) {
      x += moveStep;
      this.player.flipX = false;
      this.playerState.direction = Direction.RIGHT;
      isMoving = true;
      console.log('Moving right');
    }
    
    if (upPressed) {
      y -= moveStep;
      if (!isMoving) {
        this.playerState.direction = Direction.UP;
      }
      isMoving = true;
      console.log('Moving up');
    } else if (downPressed) {
      y += moveStep;
      if (!isMoving) {
        this.playerState.direction = Direction.DOWN;
      }
      isMoving = true;
      console.log('Moving down');
    }
    
    // Always apply the position changes directly
    // Set the new position
    this.player.setPosition(x, y);
    
    // Ensure player stays within the world boundaries
    const worldWidth = 1280;
    const worldHeight = 720;
    const playerWidth = this.player.width * this.player.scaleX / 2;
    const playerHeight = this.player.height * this.player.scaleY / 2;
    
    // Keep player within bounds manually
    if (this.player.x < playerWidth) this.player.x = playerWidth;
    if (this.player.x > worldWidth - playerWidth) this.player.x = worldWidth - playerWidth;
    if (this.player.y < playerHeight) this.player.y = playerHeight;
    if (this.player.y > worldHeight - playerHeight) this.player.y = worldHeight - playerHeight;
    
    // Ensure player is visible and has the correct size - red tint to see it clearly
    this.player.setAlpha(1);
    this.player.setScale(1.0);
    this.player.setTint(0xFF0000); // Keep it bright red
    
    // Update player state
    this.playerState.isMoving = isMoving;
  }
}
