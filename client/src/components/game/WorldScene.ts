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
      // タイルマップではなく手動で地形を作成
      this.createTerrainManually();
      console.log('Tilemap created successfully');
    } catch (error) {
      console.error('Error creating tilemap:', error);
    }
  }
  
  private createTerrainManually(): void {
    // 世界サイズ
    const worldWidth = 640;
    const worldHeight = 640;
    const tileSize = 32;
    
    // 描画用グラフィックス
    const terrain = this.add.graphics();
    
    // 草地の背景（全体）
    terrain.fillStyle(0x8BC34A, 1);
    terrain.fillRect(0, 0, worldWidth, worldHeight);
    
    // 砂地のパターン
    terrain.fillStyle(0xE3A412, 1);
    
    // 砂の道を引く
    terrain.fillRect(worldWidth/2 - 50, 0, 100, worldHeight);
    terrain.fillRect(0, worldHeight/2 - 50, worldWidth, 100);
    
    // 水のパターン
    terrain.fillStyle(0x42A5F5, 1);
    
    // 角に水場を追加
    const radius = 100;
    terrain.fillCircle(50, 50, radius);
    terrain.fillCircle(worldWidth - 50, 50, radius);
    terrain.fillCircle(50, worldHeight - 50, radius);
    terrain.fillCircle(worldWidth - 50, worldHeight - 50, radius);
    
    // 装飾的な草を追加
    terrain.fillStyle(0x558B2F, 1);
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * worldWidth;
      const y = Math.random() * worldHeight;
      const size = 2 + Math.random() * 5;
      terrain.fillCircle(x, y, size);
    }
    
    // 壁の配置
    this.createWalls();
    
    // 装飾的なオブジェクト
    this.createDecorativeObjects();
  }
  
  private createWalls(): void {
    // 壁配置パターン - 数字は位置を表す
    const wallPattern = [
      { x: 100, y: 100, width: 50, height: 150 },
      { x: 500, y: 100, width: 50, height: 150 },
      { x: 100, y: 400, width: 50, height: 150 },
      { x: 500, y: 400, width: 50, height: 150 },
      { x: 250, y: 200, width: 150, height: 50 },
      { x: 250, y: 350, width: 150, height: 50 }
    ];
    
    // 壁グループの作成
    const walls = this.physics.add.staticGroup();
    
    // 壁用のキーを作成
    const wallKey = 'wall_rect';
    
    // 壁用の共通テクスチャを一度だけ生成
    // 汎用的な壁テクスチャ（一度だけ生成）
    if (!this.textures.exists(wallKey)) {
      const size = 32; // 基本サイズ
      const graphics = this.add.graphics();
      // 茶色の壁
      graphics.fillStyle(0x795548, 1);
      graphics.fillRect(0, 0, size, size);
      // 枠線
      graphics.lineStyle(2, 0x5D4037, 1);
      graphics.strokeRect(0, 0, size, size);
      
      // テクスチャ生成
      graphics.generateTexture(wallKey, size, size);
      graphics.destroy();
    }
    
    // 壁の追加
    wallPattern.forEach(wall => {
      // スケーリングで壁のサイズを調整
      const scaleX = wall.width / 32;
      const scaleY = wall.height / 32;
      
      // スプライトを生成して配置
      const wallSprite = walls.create(
        wall.x + wall.width / 2, 
        wall.y + wall.height / 2,
        wallKey
      );
      
      // サイズ調整
      wallSprite.setScale(scaleX, scaleY);
      
      // 当たり判定のサイズをグラフィックに合わせる
      wallSprite.setSize(wall.width / scaleX, wall.height / scaleY);
      
      // 茶色のティント
      wallSprite.setTint(0x795548);
    });
    
    // プレイヤーと壁の衝突判定
    if (this.player) {
      this.physics.add.collider(this.player, walls);
    }
  }
  
  private createDecorativeObjects(): void {
    // 装飾オブジェクトの位置
    const decorations = [
      { x: 100, y: 50, radius: 15, color: 0xCDDC39 },  // 黄緑の丸
      { x: 540, y: 50, radius: 15, color: 0xCDDC39 },  // 黄緑の丸
      { x: 100, y: 590, radius: 15, color: 0xCDDC39 }, // 黄緑の丸
      { x: 540, y: 590, radius: 15, color: 0xCDDC39 }, // 黄緑の丸
      { x: 320, y: 320, radius: 25, color: 0xFF9800 }  // オレンジの丸（中央）
    ];
    
    // 装飾を描画
    decorations.forEach(dec => {
      const graphics = this.add.graphics();
      graphics.fillStyle(dec.color, 1);
      graphics.fillCircle(dec.x, dec.y, dec.radius);
      
      // 発光エフェクト
      const glow = this.add.graphics();
      glow.fillStyle(dec.color, 0.3);
      glow.fillCircle(dec.x, dec.y, dec.radius * 1.5);
    });
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

      // 動きをスムーズにするための設定
      if (this.player.body) {
        // ドラッグを直接設定
        this.player.setDrag(0.95, 0.95);
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
