import 'phaser';
import Garden from './garden';
import { PLANT_TILES, TILE_SIZE, GARDEN_WIDTH, GARDEN_HEIGHT } from './types';

function plotPos(p: number) {
  return TILE_SIZE / 2 + p * TILE_SIZE;
}

type Mode = 'dig' | 'rake' | 'mark';

export default class PlantGame extends Phaser.Scene {
  private garden: Garden;
  private mode: Mode = 'rake';
  private toolButtons: { [mode: string]: Phaser.GameObjects.Sprite } = {};

  constructor() {
    super('plantgame');
    this.garden = new Garden(GARDEN_WIDTH, GARDEN_HEIGHT, 16);
  }

  preload() {
    this.load.spritesheet('tiles', 'assets/tiles32.png', {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
    this.load.spritesheet('plants', 'assets/plants32.png', {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
  }

  private createBackground() {
    for (let t = 0; t < GARDEN_WIDTH; t += 1) {
      // TOP EDGE
      this.add.sprite(
        plotPos(t),
        plotPos(0),
        'tiles',
        t === 0 ? 89 : t === GARDEN_WIDTH - 1 ? 91 : 90
      );

      // BOTTOM EDGE
      this.add.sprite(
        plotPos(t),
        plotPos(GARDEN_HEIGHT - 1),
        'tiles',
        t === 0 ? 135 : t === GARDEN_WIDTH - 1 ? 137 : 136
      );
    }

    for (let t = 1; t < GARDEN_HEIGHT - 1; t += 1) {
      // LEFT EDGE
      this.add.sprite(plotPos(0), plotPos(t), 'tiles', 112);

      // RIGHT EDGE
      this.add.sprite(plotPos(GARDEN_WIDTH - 1), plotPos(t), 'tiles', 114);
    }
  }

  private createGarden() {
    this.garden.forEachPlot((x, y, plot) => {
      plot.leafEdges = [
        this.add.sprite(
          plotPos(x),
          plotPos(y),
          'plants',
          PLANT_TILES.LEAF_EDGE_DOWN
        ),
        this.add.sprite(
          plotPos(x),
          plotPos(y),
          'plants',
          PLANT_TILES.LEAF_EDGE_LEFT
        ),
        this.add.sprite(
          plotPos(x),
          plotPos(y),
          'plants',
          PLANT_TILES.LEAF_EDGE_RIGHT
        ),
        this.add.sprite(
          plotPos(x),
          plotPos(y),
          'plants',
          PLANT_TILES.LEAF_EDGE_UP
        ),
      ];

      if (plot.type !== 'edge') {
        plot.sprite = this.add.sprite(
          plotPos(x),
          plotPos(y),
          'plants',
          PLANT_TILES.LEAVES
        );
        plot.sprite?.setInteractive();
        plot.sprite?.setData('type', 'plot');
        plot.sprite?.setData('pos', { x, y });
      }

      plot.marker = this.add.sprite(
        plotPos(x),
        plotPos(y),
        'plants',
        PLANT_TILES.TAG
      );
      plot.marker?.setVisible(false);
    });
    this.garden.updateLeafEdges();
  }

  private tileSelect(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject
  ) {
    switch (gameObject.getData('type')) {
      case 'button':
        gameObject.getData('onclick')(pointer);
        break;
      case 'plot':
        const pos = gameObject.getData('pos') as { x: number; y: number };
        if (!pos) {
          return;
        }
        switch (this.mode) {
          case 'mark':
            this.garden.markPlot(pos.x, pos.y);
            break;
          case 'rake':
            this.garden.revealPlot(pos.x, pos.y);
            break;
          case 'dig':
            this.garden.digPlot(pos.x, pos.y);
            break;
          default:
          // Nothing yet
        }

        break;
    }
  }

  create() {
    this.createBackground();
    this.createGarden();

    this.toolButtons.dig = this.add.sprite(
      16 + 8,
      TILE_SIZE * GARDEN_HEIGHT + 16 + 8,
      'plants',
      PLANT_TILES.TOOL_DIG
    );
    this.toolButtons.dig
      .setInteractive()
      .setData('type', 'button')
      .setData('onclick', (pointer: Phaser.Input.Pointer) => {
        this.toolButtons[this.mode].setAlpha(0.5);
        this.mode = 'dig';
        this.toolButtons[this.mode].setAlpha(1);
      })
      .setAlpha(0.5);

    this.toolButtons.rake = this.add.sprite(
      16 + 8 + 32,
      TILE_SIZE * GARDEN_HEIGHT + 16 + 8,
      'plants',
      PLANT_TILES.TOOL_RAKE
    );
    this.toolButtons.rake
      .setInteractive()
      .setData('type', 'button')
      .setData('onclick', (pointer: Phaser.Input.Pointer) => {
        this.toolButtons[this.mode].setAlpha(0.5);
        this.mode = 'rake';
        this.toolButtons[this.mode].setAlpha(1);
      })
      .setAlpha(0.5);

    this.toolButtons.mark = this.add.sprite(
      16 + 8 + 64,
      TILE_SIZE * GARDEN_HEIGHT + 16 + 8,
      'plants',
      PLANT_TILES.TAG
    );
    this.toolButtons.mark
      .setInteractive()
      .setData('type', 'button')
      .setData('onclick', (pointer: Phaser.Input.Pointer) => {
        this.toolButtons[this.mode].setAlpha(0.5);
        this.mode = 'mark';
        this.toolButtons[this.mode].setAlpha(1);
      })
      .setAlpha(0.5);

    this.toolButtons[this.mode].setAlpha(1);

    this.input.on('gameobjectdown', this.tileSelect, this);
  }
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#b06758',
  width: TILE_SIZE * GARDEN_WIDTH,
  height: TILE_SIZE * GARDEN_HEIGHT + 64,
  scene: PlantGame,
};

const game = new Phaser.Game(config);
