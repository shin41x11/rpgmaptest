import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  private loadingText?: Phaser.GameObjects.Text;
  private progressBar?: Phaser.GameObjects.Graphics;
  private progressBox?: Phaser.GameObjects.Graphics;

  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    // Create loading UI
    this.createLoadingUI();

    // Load assets
    this.loadAssets();

    // Update progress bar
    this.load.on('progress', (value: number) => {
      this.updateProgressBar(value);
    });

    this.load.on('complete', () => {
      console.log('All assets loaded');
      this.progressBar?.destroy();
      this.progressBox?.destroy();
      this.loadingText?.destroy();
    });
  }

  create(): void {
    // Start the main scene after a short delay
    this.time.delayedCall(500, () => {
      this.scene.start('WorldScene');
      console.log('Starting world scene');
    });
  }

  private createLoadingUI(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Loading text
    this.loadingText = this.add.text(
      width / 2, 
      height / 2 - 50,
      'Loading Game...', 
      { 
        fontFamily: 'Arial', 
        fontSize: '24px', 
        color: '#ffffff' 
      }
    ).setOrigin(0.5);

    // Progress bar background
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(width / 2 - 160, height / 2, 320, 30);

    // Progress bar
    this.progressBar = this.add.graphics();
  }

  private updateProgressBar(value: number): void {
    if (this.progressBar) {
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;
      
      this.progressBar.clear();
      this.progressBar.fillStyle(0x00ff00, 1);
      this.progressBar.fillRect(width / 2 - 150, height / 2 + 10, 300 * value, 10);
    }
  }

  private loadAssets(): void {
    // Load tilemap (including our updated version)
    this.load.tilemapTiledJSON('world', '/assets/tilemaps/world.json');
    
    // Load tileset images
    this.load.svg('terrain', '/assets/tilesets/terrain.svg');
    
    // Load hero sprite
    this.load.svg('hero', '/assets/sprites/hero.svg');
    this.load.svg('hero_sprites', '/assets/sprites/hero_sprites.svg');
    
    // Load audio
    this.load.audio('background', '/sounds/background.mp3');
    this.load.audio('hit', '/sounds/hit.mp3');
    this.load.audio('success', '/sounds/success.mp3');
    
    // Load images from existing textures folder for our tilemap
    this.load.image('grass', '/textures/grass.png');
    this.load.image('sand', '/textures/sand.jpg');
    this.load.image('wood', '/textures/wood.jpg');
    this.load.image('asphalt', '/textures/asphalt.png');
    this.load.image('sky', '/textures/sky.png');
    
    // Load UI assets
    this.load.svg('controls', '/assets/ui/controls.svg');
  }
}
