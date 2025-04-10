import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    // Load minimal assets needed for the loading screen
    this.load.svg('loading-spinner', '/assets/ui/controls.svg');
  }

  create(): void {
    this.scene.start('PreloadScene');
    console.log('Boot scene completed, starting preload');
  }
}
