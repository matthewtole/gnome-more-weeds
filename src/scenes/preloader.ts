import { SceneBase } from './base';
import { GardenScene } from './garden';
import { TILE_SIZE, ASSETS } from '../types';

// @ts-ignore
import assets from '../assets/*.png';
// @ts-ignore
import sfx from '../assets/sfx/*.wav';

export class Preloader extends SceneBase {
  private allAssetsLoaded = true;

  private loadSpritesheet(tag: string, filename: string) {
    this.load.spritesheet(tag, filename, {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
  }

  public preload(): void {
    this.load.on('loaderror', () => {
      this.allAssetsLoaded = false;
    });

    this.loadSpritesheet(ASSETS.TILES.BACKGROUND, assets.tiles32);
    this.loadSpritesheet(ASSETS.TILES.PLANTS, assets.plants32);
    this.loadSpritesheet(
      ASSETS.SPRITESHEETS.WEED_1,
      assets['spritesheet-weed1']
    );
    this.loadSpritesheet(
      ASSETS.SPRITESHEETS.WEED_2,
      assets['spritesheet-weed2']
    );
    this.loadSpritesheet(
      ASSETS.SPRITESHEETS.WEED_3,
      assets['spritesheet-weed3']
    );
    this.load.audio('click', [sfx.switch10]);
  }

  public create(): void {
    if (this.allAssetsLoaded) {
      this.scene.start(GardenScene.name);
    }
  }
}
