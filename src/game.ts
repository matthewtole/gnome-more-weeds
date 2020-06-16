import 'phaser';
import { Boot } from './scenes/boot';
import { Preloader } from './scenes/preloader';
import { GardenScene } from './scenes/garden';

export class Game extends Phaser.Game {
  constructor() {
    super({
      type: Phaser.AUTO,
      width: 512,
      height: 512 + 64,
      title: 'Gnome More Weeds',
      backgroundColor: '#b06758',
    });

    this.scene.add(Boot.name, Boot);
    this.scene.add(Preloader.name, Preloader);
    this.scene.add(GardenScene.name, GardenScene);

    // start
    this.scene.start(Boot.name);
  }
}

new Game();
