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
      // 世界の境界設定
      const worldWidth = 640;   // 20 tiles x 32px
      const worldHeight = 640;  // 20 tiles x 32px
      this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
      
      // タイルマップの作成
      this.createTilemap();
      
      // プレイヤーキャラクターの作成
      this.createPlayer();
      
      // カメラのセットアップ
      this.setupCamera();
      
      // 入力のセットアップ
      this.setupInput();
      
      // サウンドのセットアップ
      this.setupSounds();
      
      // 衝突判定の設定
      this.setupCollisions();
      
      console.log('World scene created successfully');
    } catch (error) {
      console.error('Error creating world scene:', error);
    }
  }
  
  private createTilemap(): void {
    try {
      // キャッシュからタイルマップを作成
      const map = this.make.tilemap({ key: 'world' });
      
      // 各タイルセットを追加
      const grassTiles = map.addTilesetImage('grass', 'grass');
      const sandTiles = map.addTilesetImage('sand', 'sand');
      const waterTiles = map.addTilesetImage('water', 'water');
      const wallTiles = map.addTilesetImage('wall', 'wall');
      
      // 利用可能なタイルセット配列
      const tiles = [grassTiles, sandTiles, waterTiles, wallTiles];
      
      // レイヤーを作成
      const groundLayer = map.createLayer('ground', tiles);
      const obstaclesLayer = map.createLayer('obstacles', tiles);
      
      // 障害物に衝突判定を追加（壁の場合）
      if (obstaclesLayer) {
        obstaclesLayer.setCollisionByExclusion([-1, 0]);
      }
      
      console.log('Tilemap created successfully');
    } catch (error) {
      console.error('Error creating tilemap:', error);
    }
  }
  
  private setupCollisions(): void {
    try {
      // タイルマップとプレイヤーの衝突設定
      if (this.player) {
        // 障害物との衝突
        const obstaclesLayer = this.children.getByName('obstacles') as Phaser.Tilemaps.TilemapLayer;
        if (obstaclesLayer) {
          this.physics.add.collider(this.player, obstaclesLayer);
        }
        
        console.log('Collisions setup complete');
      }
    } catch (error) {
      console.error('Error setting up collisions:', error);
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
      // ゲーム画面の中央に配置
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      
      console.log('Creating player at position:', centerX, centerY);
      
      // 新しいヒーロースプライトを作成
      this.player = this.physics.add.sprite(centerX, centerY, 'hero');
      
      // より適切なサイズに調整
      this.player.setScale(1.0);
      
      // 物理設定
      this.player.setCollideWorldBounds(true);
      this.player.setBounce(0);
      this.player.setFriction(0);
      this.player.setDepth(10); // 他のオブジェクトより上に表示

      // 素早く止まるようにするためのドラッグ設定
      if (this.player.body) {
        this.player.body.setDamping(true);
        this.player.body.setDrag(0.95, 0.95);
      }
      
      // キャラの周りに装飾的な光エフェクトを追加
      const glow = this.add.graphics();
      glow.fillStyle(0x4466ff, 0.3);
      glow.fillCircle(centerX, centerY, 30);
      
      // プレイヤーの影を追加
      const shadow = this.add.ellipse(centerX, centerY + 20, 40, 15, 0x000000, 0.3);
      shadow.setDepth(9);
      
      // グラフィックを追従させる
      this.events.on('update', () => {
        if (this.player) {
          glow.x = this.player.x - centerX;
          glow.y = this.player.y - centerY;
          shadow.x = this.player.x;
          shadow.y = this.player.y + 20;
        }
      });
      
      console.log('Enhanced player created with dimensions:', 
        this.player.width, 'x', this.player.height,
        'at position', this.player.x, this.player.y);
    } catch (error) {
      console.error('Error creating player:', error);
    }
  }

  private setupCamera(): void {
    try {
      if (this.player) {
        // カメラを構成
        const camera = this.cameras.main;
        
        // タイルマップの世界サイズに合わせてカメラの境界を設定
        const worldWidth = 640;   // 20 tiles x 32px
        const worldHeight = 640;  // 20 tiles x 32px
        camera.setBounds(0, 0, worldWidth, worldHeight);
        
        // プレイヤーをカメラの中心に
        camera.startFollow(this.player, true, 0.9, 0.9);
        
        // ズームレベルをタイルマップにちょうど良い大きさに設定
        camera.setZoom(1.0);
        
        // 世界の境界を視覚化（デバッグ用）
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xff0000, 1);
        graphics.strokeRect(0, 0, worldWidth, worldHeight);
        
        console.log('Camera setup complete - following player at zoom level:', camera.zoom);
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
