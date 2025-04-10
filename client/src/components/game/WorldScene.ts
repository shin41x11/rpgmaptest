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

      // Reset player velocity
      this.player.setVelocity(0);

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
      
      // Add key listener for zooming
      this.input.keyboard?.on('keydown-Z', () => {
        this.cameras.main.zoom += 0.25;
        console.log('Zoomed in, current zoom:', this.cameras.main.zoom);
      });
      
      this.input.keyboard?.on('keydown-X', () => {
        this.cameras.main.zoom -= 0.25;
        console.log('Zoomed out, current zoom:', this.cameras.main.zoom);
      });
      
      console.log('Input setup complete');
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
    if (!this.player || !this.cursors) return;

    const speed = 160;
    let isMoving = false;
    
    // Check for movement input
    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-speed);
      this.player.flipX = true; // Flip sprite to face left
      this.playerState.direction = Direction.LEFT;
      isMoving = true;
    } else if (this.cursors.right?.isDown) {
      this.player.setVelocityX(speed);
      this.player.flipX = false; // Reset flip
      this.playerState.direction = Direction.RIGHT;
      isMoving = true;
    }
    
    if (this.cursors.up?.isDown) {
      this.player.setVelocityY(-speed);
      if (!isMoving) {
        this.playerState.direction = Direction.UP;
      }
      isMoving = true;
    } else if (this.cursors.down?.isDown) {
      this.player.setVelocityY(speed);
      if (!isMoving) {
        this.playerState.direction = Direction.DOWN;
      }
      isMoving = true;
    }
    
    // Update player state
    this.playerState.isMoving = isMoving;
  }
}
