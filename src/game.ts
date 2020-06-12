import 'phaser';

export default class PlantGame extends Phaser.Scene {
  constructor() {
    super('plantgame');
  }

  preload() {
    this.load.spritesheet('tiles', 'assets/tiles32.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
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
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#b06758',
  width: 512,
  height: 512,
  scene: PlantGame,
};

const game = new Phaser.Game(config);
