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
      
      // 現在位置をログ
      const currentX = this.player.x;
      const currentY = this.player.y;
      
      // プレーヤーの移動処理
      this.handlePlayerMovement();
      
      // 次のフレームで移動の結果をチェックするための遅延ログ
      // (少し遅らせて実際の移動結果を確認する)
      this.time.delayedCall(50, () => {
        const newX = this.player.x;
        const newY = this.player.y;
        const hasMoved = (currentX !== newX || currentY !== newY);
        
        if (hasMoved) {
          // 実際に移動した場合のみ詳細なログ
          console.log('Player moved:', 
            'from:', currentX.toFixed(0), currentY.toFixed(0),
            'to:', newX.toFixed(0), newY.toFixed(0),
            'delta:', (newX - currentX).toFixed(0), (newY - currentY).toFixed(0)
          );
        }
      });

      // 物理デバッグのために情報表示
      if (this.time.now % 500 === 0) { // 約500ミリ秒ごとに情報を表示
        if (this.player.body && this.player.body.velocity) {
          console.log('Debug info - Player at:',
            this.player.x.toFixed(0), this.player.y.toFixed(0),
            'velocity:', this.player.body.velocity.x.toFixed(0), this.player.body.velocity.y.toFixed(0)
          );
        }
      }
    } catch (error) {
      console.error('Error in update:', error);
    }
  }

  private createPlayer(): void {
    try {
      // 画面の中央に配置
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      
      console.log('Creating player at position:', centerX, centerY);
      
      // ダミーオブジェクトを作成して赤い四角を表示
      // 直接グラフィックを作成すると動かない可能性があるので、
      // スプライトを使用して単純な表示にします
      this.player = this.physics.add.sprite(centerX, centerY, 'hero');
      
      // プレイヤーのサイズを大きくして明確に見える
      this.player.setScale(3.0);
      
      // 物理演算を簡素化
      this.player.setCollideWorldBounds(true); // 世界の端で止まる
      this.player.setBounce(0); // 反発しない
      this.player.setImmovable(false); // 動かせる状態
      
      // 目立つように赤色に
      this.player.setTint(0xFF0000);
      
      // 判定枠の大きさを確認するため（デバッグ用）
      this.player.setDebug(true, true, 0xFF00FF);
      
      // 確認用ログ
      console.log('Player created with dimensions:', 
        this.player.width, 'x', this.player.height,
        'at position', this.player.x, this.player.y);
    } catch (error) {
      console.error('Error creating player:', error);
    }
  }

  private setupCamera(): void {
    try {
      if (this.player) {
        // Reset and reconfigure camera
        const camera = this.cameras.main;
        
        // Set world bounds based on our fixed constants
        const worldWidth = 1280;
        const worldHeight = 720;
        camera.setBounds(0, 0, worldWidth, worldHeight);
        
        // Configure camera to follow player with immediate response (no lag)
        camera.startFollow(this.player, true, 1, 1);
        
        // Set a wider zoom level to see more of the game
        camera.setZoom(0.75);
        
        // Add a red border to help visualize the game area
        const graphics = this.add.graphics();
        graphics.lineStyle(4, 0xff0000, 1);
        graphics.strokeRect(0, 0, worldWidth, worldHeight);
        
        console.log('Camera setup with enhanced view and visual border');
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

    const moveStep = 50; // 移動量を一気に大きくして明確に
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
    
    // 通常の速度ベクトルではなく直接速度値を設定
    let velocityX = 0;
    let velocityY = 0;
    
    // キー入力による速度設定
    if (leftPressed) {
      velocityX = -moveStep;
      this.playerState.direction = Direction.LEFT;
      isMoving = true;
      console.log('Moving left');
    } else if (rightPressed) {
      velocityX = moveStep;
      this.playerState.direction = Direction.RIGHT;
      isMoving = true;
      console.log('Moving right');
    }
    
    if (upPressed) {
      velocityY = -moveStep;
      if (!isMoving) {
        this.playerState.direction = Direction.UP;
      }
      isMoving = true;
      console.log('Moving up');
    } else if (downPressed) {
      velocityY = moveStep;
      if (!isMoving) {
        this.playerState.direction = Direction.DOWN;
      }
      isMoving = true;
      console.log('Moving down');
    }
    
    // Phaserの物理エンジンを使って速度設定（CollideWorldBoundsと共に動作）
    this.player.setVelocity(velocityX, velocityY);
    
    // 移動をログ
    if (isMoving) {
      console.log('Player now at:', this.player.x, this.player.y, 
        'with velocity:', this.player.body.velocity.x, this.player.body.velocity.y);
    }
    
    // 更新時にプレイヤーの色とサイズを維持（物理更新で上書きされることを防止）
    this.player.setTint(0xFF0000);       // 明るい赤色
    this.player.setScale(3.0);           // 大きく表示
    this.player.setAlpha(1);             // 完全に不透明
    
    // プレイヤーの状態を更新
    this.playerState.isMoving = isMoving;
  }
}
