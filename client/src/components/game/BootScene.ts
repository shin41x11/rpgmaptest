import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    // Skip loading any assets in boot scene to avoid errors
    console.log('Boot scene preload completed');
  }

  create(): void {
    this.scene.start('PreloadScene');
    console.log('Boot scene completed, starting preload');
  }
}
