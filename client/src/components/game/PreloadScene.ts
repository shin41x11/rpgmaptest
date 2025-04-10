import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  private loadingText?: Phaser.GameObjects.Text;

  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    // Simple loading text
    this.loadingText = this.add.text(
      this.cameras.main.width / 2, 
      this.cameras.main.height / 2,
      'Loading Game...', 
      { 
        fontFamily: 'Arial', 
        fontSize: '24px', 
        color: '#ffffff' 
      }
    ).setOrigin(0.5);

    // Load basic assets
    try {
      // For hero character
      this.load.svg('hero', '/assets/sprites/hero.svg');
      
      // For audio
      this.load.audio('background', '/sounds/background.mp3');
      this.load.audio('hit', '/sounds/hit.mp3');
      this.load.audio('success', '/sounds/success.mp3');
      
      // For textures (only what we need)
      this.load.image('grass', '/textures/grass.png');
      
      console.log('Starting asset loading...');
    } catch (error) {
      console.error('Error in PreloadScene.preload:', error);
    }

    this.load.on('complete', () => {
      console.log('All assets loaded');
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
