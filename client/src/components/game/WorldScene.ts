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
      
      // Instead of resetting velocity, let's keep track of the previous position
      // to detect if player actually moved
      const prevX = this.player.x;
      const prevY = this.player.y;
      
      // Process all movement controls
      this.handlePlayerMovement();
      
      // Check if player actually moved this frame
      const hasMoved = (prevX !== this.player.x || prevY !== this.player.y);
      
      // Log player position and movement status
      if (this.time.now % 60 === 0) { // Log every second approximately
        console.log('Player update:', 
          'position:', this.player.x.toFixed(1), this.player.y.toFixed(1), 
          'moved:', hasMoved,
          'velocity:', 
          this.player.body?.velocity.x.toFixed(1), 
          this.player.body?.velocity.y.toFixed(1)
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
      
      // Create player sprite with physics
      this.player = this.physics.add.sprite(x, y, 'hero');
      this.player.setScale(0.5);
      this.player.setCollideWorldBounds(true);
      
      // Make sure physics body is enabled and not affected by gravity
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      if (body) {
        // Critical: Set drag to zero to prevent automatic slowing down
        body.setDrag(0, 0);
        
        // Prevent bounce effect
        body.setBounce(0, 0);
        
        // Set fixed position updates instead of frame-dependent
        body.useDamping = false;
        
        console.log('Player physics configured');
      }
      
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

    const moveStep = 5; // Direct position change amount
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
    
    // Apply position changes directly
    if (isMoving) {
      // Set the new position
      this.player.setPosition(x, y);
      
      // Make sure player stays within world bounds
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      if (body) {
        body.updateBounds();
      }
      
      // Ensure player is visible and has the correct size
      this.player.setAlpha(1);
      this.player.setScale(0.5);
    }
    
    // Update player state
    this.playerState.isMoving = isMoving;
  }
}
