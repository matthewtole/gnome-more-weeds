import { SceneBase } from './base';
import { GardenScene } from './garden';
import { TILE_SIZE, ASSET_TAGS } from '../types';

export class Preloader extends SceneBase {
  private loadSpritesheet(tag: string, filename: string) {
    this.load.spritesheet(tag, `assets/${filename}`, {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
  }

  public preload(): void {
    this.loadSpritesheet(ASSET_TAGS.TILES.BACKGROUND, 'tiles32.png');
    this.loadSpritesheet(ASSET_TAGS.TILES.PLANTS, 'plants32.png');
    this.loadSpritesheet(
      ASSET_TAGS.SPRITESHEETS.WEED_1,
      'spritesheet-weed1.png'
    );
    this.loadSpritesheet(
      ASSET_TAGS.SPRITESHEETS.WEED_2,
      'spritesheet-weed2.png'
    );
    this.loadSpritesheet(
      ASSET_TAGS.SPRITESHEETS.WEED_3,
      'spritesheet-weed3.png'
    );
    this.load.audio('click', ['assets/sfx/switch10.wav']);
  }

  public create(): void {
    this.scene.start(GardenScene.name);
  }
}
