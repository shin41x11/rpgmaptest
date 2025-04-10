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
    // Handle player movement
    try {
      if (!this.player || !this.cursors) return;

      // Reset player velocity at the start of each update
      this.player.setVelocity(0, 0);
      
      // Log player position for debugging
      if (this.time.now % 60 === 0) { // Log every second approximately
        console.log('Player position:', 
          'x:', this.player.x,
          'y:', this.player.y,
          'velocity:', this.player.body?.velocity.x, this.player.body?.velocity.y
        );
      }

      // Handle player movement
      this.handlePlayerMovement();
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
      
      this.player = this.physics.add.sprite(x, y, 'hero');
      this.player.setScale(0.5);
      this.player.setCollideWorldBounds(true);
      
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

    const speed = 200; // Increased speed for better responsiveness
    let isMoving = false;
    
    // Get keyboard state for WASD keys
    const wKey = this.input.keyboard?.addKey('W');
    const aKey = this.input.keyboard?.addKey('A');
    const sKey = this.input.keyboard?.addKey('S');
    const dKey = this.input.keyboard?.addKey('D');
    
    // Explicitly log key states for debugging
    if (this.time.now % 120 === 0) {
      console.log('Key states:', 
        'left:', this.cursors.left?.isDown, 'A:', aKey?.isDown,
        'right:', this.cursors.right?.isDown, 'D:', dKey?.isDown,
        'up:', this.cursors.up?.isDown, 'W:', wKey?.isDown,
        'down:', this.cursors.down?.isDown, 'S:', sKey?.isDown
      );
    }
    
    // Handle horizontal movement with arrow keys or WASD
    const leftPressed = this.cursors.left?.isDown || aKey?.isDown;
    const rightPressed = this.cursors.right?.isDown || dKey?.isDown;
    const upPressed = this.cursors.up?.isDown || wKey?.isDown;
    const downPressed = this.cursors.down?.isDown || sKey?.isDown;
    
    // Handle horizontal movement
    if (leftPressed) {
      this.player.setVelocityX(-speed);
      this.player.flipX = true;
      this.playerState.direction = Direction.LEFT;
      isMoving = true;
      console.log('Moving left, velocity set to', -speed);
    } else if (rightPressed) {
      this.player.setVelocityX(speed);
      this.player.flipX = false;
      this.playerState.direction = Direction.RIGHT;
      isMoving = true;
      console.log('Moving right, velocity set to', speed);
    } else {
      // Stop horizontal movement if neither left nor right is pressed
      this.player.setVelocityX(0);
    }
    
    // Handle vertical movement
    if (upPressed) {
      this.player.setVelocityY(-speed);
      if (!isMoving) {
        this.playerState.direction = Direction.UP;
      }
      isMoving = true;
      console.log('Moving up, velocity set to', -speed);
    } else if (downPressed) {
      this.player.setVelocityY(speed);
      if (!isMoving) {
        this.playerState.direction = Direction.DOWN;
      }
      isMoving = true;
      console.log('Moving down, velocity set to', speed);
    } else {
      // Stop vertical movement if neither up nor down is pressed
      this.player.setVelocityY(0);
    }
    
    // Update player state and player visibility if it's moved
    this.playerState.isMoving = isMoving;
    if (isMoving) {
      // Ensure player is visible and has the correct size
      this.player.setAlpha(1);
      this.player.setScale(0.5);
    }
  }
}
