import { SceneBase } from './base';
import { GardenScene } from './garden';
import { TILE_SIZE, ASSETS } from '../types';

export class Preloader extends SceneBase {
  private allAssetsLoaded = true;

  private loadSpritesheet(tag: string, filename: string) {
    this.load.spritesheet(tag, filename, {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
  }

  public preload(): void {
    this.load.setBaseURL('/assets/');

    this.load.on('loaderror', () => {
      this.allAssetsLoaded = false;
    });

    this.loadSpritesheet(ASSETS.TILES.BACKGROUND, 'tiles32.png');
    this.loadSpritesheet(ASSETS.TILES.PLANTS, 'plants32.png');
    this.loadSpritesheet(ASSETS.SPRITESHEETS.WEED_1, 'spritesheet-weed1.png');
    this.loadSpritesheet(ASSETS.SPRITESHEETS.WEED_2, 'spritesheet-weed2.png');
    this.loadSpritesheet(ASSETS.SPRITESHEETS.WEED_3, 'spritesheet-weed3.png');
    this.load.audio('click', ['sfx/switch10.wav']);
  }

  public create(): void {
    if (this.allAssetsLoaded) {
      this.scene.start(GardenScene.name);
    }
  }
}
