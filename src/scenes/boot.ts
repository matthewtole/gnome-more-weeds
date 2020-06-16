import { SceneBase } from './base';
import { Preloader } from './preloader';

export class Boot extends SceneBase {
  public create(): void {
    this.scene.start(Preloader.name);
  }
}
