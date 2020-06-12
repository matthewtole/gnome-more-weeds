import 'phaser';
import Garden from './garden';

export default class PlantGame extends Phaser.Scene {
  private garden: Garden;

  constructor() {
    super('plantgame');
    this.garden = new Garden(14, 14, 8);
  }

  preload() {
    this.load.spritesheet('tiles', 'assets/tiles32.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('plants', 'assets/plants32.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  private createBackground() {
    this.add.sprite(16, 16, 'tiles', 89);
    for (let t = 1; t < 15; t += 1) {
      this.add.sprite(16 + 32 * t, 16, 'tiles', 90);
    }
    this.add.sprite(512 - 16, 16, 'tiles', 91);

    this.add.sprite(16, 512 - 16, 'tiles', 135);
    for (let t = 1; t < 15; t += 1) {
      this.add.sprite(16 + 32 * t, 512 - 16, 'tiles', 136);
    }
    this.add.sprite(512 - 16, 512 - 16, 'tiles', 137);

    for (let t = 1; t < 15; t += 1) {
      this.add.sprite(16, 16 + 32 * t, 'tiles', 112);
    }

    for (let t = 1; t < 15; t += 1) {
      this.add.sprite(512 - 16, 16 + 32 * t, 'tiles', 114);
    }
  }

  private tileSelect(pointer: Phaser.Input.Pointer) {
    console.log(pointer);
  }

  create() {
    this.createBackground();
    for (let y = 0; y < 14; y += 1) {
      for (let x = 0; x < 14; x += 1) {
        switch (this.garden.getPlot(x, y).type) {
          case 'plant':
            this.add.sprite(32 + 16 + 32 * x, 32 + 16 + 32 * y, 'plants', 3);
            break;
          case 'weed':
            this.add.sprite(
              32 + 16 + 32 * x,
              32 + 16 + 32 * y,
              'plants',
              Math.min(this.garden.getWeedStrength(x, y) - 1, 2)
            );

            break;
        }
      }
    }
    this.input.on('pointerdown', this.tileSelect, this);
  }
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#b06758',
  width: 512,
  height: 512,
  scene: PlantGame,
};

const game = new Phaser.Game(config);
