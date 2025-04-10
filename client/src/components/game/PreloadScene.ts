import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  private loadingText?: Phaser.GameObjects.Text;

  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    // ロード中の画面表示を改善
    const loadingBg = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      300, 50,
      0x333333
    ).setOrigin(0.5);
    
    this.loadingText = this.add.text(
      this.cameras.main.width / 2, 
      this.cameras.main.height / 2,
      'ゲームデータをロード中...', 
      { 
        fontFamily: 'Arial', 
        fontSize: '24px', 
        color: '#ffffff' 
      }
    ).setOrigin(0.5);

    // 進行状況バー
    const progressBar = this.add.rectangle(
      this.cameras.main.width / 2 - 140,
      this.cameras.main.height / 2 + 30,
      0, 20,
      0x00ff00
    ).setOrigin(0, 0.5);

    // プログレスバーの背景
    const progressBg = this.add.rectangle(
      this.cameras.main.width / 2 - 150,
      this.cameras.main.height / 2 + 30,
      300, 30,
      0x222222
    ).setOrigin(0.5);
    progressBg.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2 + 30);

    // ロード進行状況に応じてバーを更新
    this.load.on('progress', (value: number) => {
      const width = 280 * value;
      progressBar.width = width;
      if (this.loadingText) {
        this.loadingText.setText(`読み込み中... ${Math.floor(value * 100)}%`);
      }
    });

    // 全てのアセットを読み込む
    try {
      // ディレクトリパス定義
      const imageDir = '/assets/sprites/';
      const mapDir = '/assets/tilemaps/';
      
      // プレイヤーキャラクター
      this.load.svg('hero', imageDir + 'hero.svg');
      
      // タイルセット
      this.load.svg('grass', imageDir + 'grass.svg');
      this.load.svg('sand', imageDir + 'sand.svg');
      this.load.svg('water', imageDir + 'water.svg');
      this.load.svg('wall', imageDir + 'wall.svg');
      
      // タイルマップの読み込み（JSONファイルとして）
      this.load.tilemapTiledJSON('world-map', mapDir + 'world.json');
      
      // サウンドエフェクト
      this.sound.add('background', { loop: true });
      this.sound.add('hit');
      this.sound.add('success');
      
      console.log('アセットの読み込みを開始しました');
    } catch (error) {
      console.error('PreloadSceneでエラーが発生しました:', error);
    }

    this.load.on('complete', () => {
      console.log('全てのアセットを読み込みました');
      // ロード完了後にプログレスバーを消す
      loadingBg.destroy();
      progressBg.destroy();
      progressBar.destroy();
      if (this.loadingText) this.loadingText.destroy();
    });
  }

  create(): void {
    // Start the main scene immediately
    try {
      console.log('Preload complete, starting world scene...');
      this.scene.start('WorldScene');
      console.log('Starting world scene');
    } catch (error) {
      console.error('Error in PreloadScene.create:', error);
    }
  }
}
