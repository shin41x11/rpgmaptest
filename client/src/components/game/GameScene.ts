import Phaser from 'phaser';
import { Direction, PlayerState } from '@/types/game';
import { useAudio } from '@/lib/stores/useAudio';

export class GameScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private playerState: PlayerState = {
    direction: Direction.DOWN,
    isMoving: false
  };
  
  constructor() {
    super('GameScene');
  }

  create(): void {
    console.log('Creating game scene');
    
    // Create the player in the center of the screen
    this.createPlayer();
    
    // Setup input
    this.setupInput();
    
    // Play success sound to indicate game started
    useAudio.getState().playSuccess();
  }

  update(): void {
    if (!this.player || !this.cursors) return;

    // Reset player velocity
    this.player.setVelocity(0);

    // Handle player movement
    this.handlePlayerMovement();
  }

  private createPlayer(): void {
    // Create the player sprite
    this.player = this.physics.add.sprite(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'hero'
    );
    this.player.setScale(0.5);
    this.player.setCollideWorldBounds(true);
    
    // Set the camera to follow the player
    this.cameras.main.startFollow(this.player, true, 0.5, 0.5);
  }

  private setupInput(): void {
    // Create cursor keys for input
    this.cursors = this.input.keyboard?.createCursorKeys();
    
    // Log that input is ready
    console.log('Input controls ready');
  }

  private handlePlayerMovement(): void {
    if (!this.player || !this.cursors) return;

    const speed = 160;
    let isMoving = false;
    
    // Check for movement input
    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-speed);
      this.playerState.direction = Direction.LEFT;
      isMoving = true;
      console.log('Moving left');
    } else if (this.cursors.right?.isDown) {
      this.player.setVelocityX(speed);
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
  }
}
