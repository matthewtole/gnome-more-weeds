import { SceneBase } from './base';
import 'phaser';
import Garden from '../lib/garden';
import {
  PLANT_TILES,
  TILE_SIZE,
  GARDEN_WIDTH,
  GARDEN_HEIGHT,
  ASSETS,
  Mode,
} from '../types';

function plotPos(p: number) {
  return TILE_SIZE / 2 + p * TILE_SIZE;
}

export class GardenScene extends SceneBase {
  private garden: Garden;
  private mode: Mode = 'rake';
  private toolButtons: { [mode: string]: Phaser.GameObjects.Sprite } = {};
  private scores: {
    dead?: Phaser.GameObjects.Text;
    found?: Phaser.GameObjects.Text;
    hidden?: Phaser.GameObjects.Text;
  };

  private messageText?: Phaser.GameObjects.Text;
  private messageBubble?: Phaser.GameObjects.Rectangle;

  constructor() {
    super(GardenScene.name);

    this.scores = {};
    this.garden = new Garden(
      Garden.generateLayout(GARDEN_WIDTH, GARDEN_HEIGHT, 16)
    );
  }

  private createBackground() {
    for (let t = 0; t < GARDEN_WIDTH; t += 1) {
      // TOP EDGE
      this.add.sprite(
        plotPos(t),
        plotPos(0),
        ASSETS.TILES.BACKGROUND,
        t === 0 ? 89 : t === GARDEN_WIDTH - 1 ? 91 : 90
      );

      // BOTTOM EDGE
      this.add.sprite(
        plotPos(t),
        plotPos(GARDEN_HEIGHT - 1),
        ASSETS.TILES.BACKGROUND,
        t === 0 ? 135 : t === GARDEN_WIDTH - 1 ? 137 : 136
      );
    }

    for (let t = 1; t < GARDEN_HEIGHT - 1; t += 1) {
      // LEFT EDGE
      this.add.sprite(plotPos(0), plotPos(t), ASSETS.TILES.BACKGROUND, 112);

      // RIGHT EDGE
      this.add.sprite(
        plotPos(GARDEN_WIDTH - 1),
        plotPos(t),
        ASSETS.TILES.BACKGROUND,
        114
      );
    }
  }

  private createGarden() {
    this.garden.forEachPlot((x, y, plot) => {
      plot.leafEdges = [
        PLANT_TILES.LEAF_EDGE_DOWN,
        PLANT_TILES.LEAF_EDGE_LEFT,
        PLANT_TILES.LEAF_EDGE_RIGHT,
        PLANT_TILES.LEAF_EDGE_UP,
      ].map((frame) =>
        this.add.sprite(plotPos(x), plotPos(y), ASSETS.TILES.PLANTS, frame)
      );

      if (plot.type !== 'edge') {
        plot.sprite = this.add
          .sprite(
            plotPos(x),
            plotPos(y),
            ASSETS.TILES.PLANTS,
            PLANT_TILES.LEAVES
          )
          .setInteractive()
          .setData('type', 'plot')
          .setData('pos', { x, y });
      }

      plot.marker = this.add
        .sprite(plotPos(x), plotPos(y), ASSETS.TILES.PLANTS, PLANT_TILES.TAG)
        .setVisible(false);
    });
    this.garden.updateLeafEdges();
  }

  private tileSelect(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject
  ) {
    if (!pointer.primaryDown) {
      return;
    }
    switch (gameObject.getData('type')) {
      case 'button':
        gameObject.getData('onclick')(pointer);
        break;
      case 'plot': {
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
        this.scores.found?.setText(this.garden.foundFlowers().toString());
        this.scores.dead?.setText(this.garden.killedFlowers().toString());
        this.scores.hidden?.setText(this.garden.hiddenFlowers().toString());
        break;
      }
    }
  }

  private createAnimations() {
    this.anims.create({
      key: ASSETS.ANIMATIONS.WEED_1,
      frames: this.anims.generateFrameNumbers(ASSETS.SPRITESHEETS.WEED_1, {}),
      frameRate: 2,
      repeat: -1,
    });

    this.anims.create({
      key: ASSETS.ANIMATIONS.WEED_2,
      frames: this.anims.generateFrameNumbers(ASSETS.SPRITESHEETS.WEED_2, {}),
      frameRate: 2,
      repeat: -1,
    });

    this.anims.create({
      key: ASSETS.ANIMATIONS.WEED_3,
      frames: this.anims.generateFrameNumbers(ASSETS.SPRITESHEETS.WEED_3, {
        end: 5,
      }),
      frameRate: 2,
      repeat: -1,
    });
  }

  createToolbarButton(mode: Mode, position: number, frame: number) {
    const button = this.add.sprite(
      32 + 48 * position,
      TILE_SIZE * GARDEN_HEIGHT + 24,
      ASSETS.TILES.PLANTS,
      frame
    );
    button
      .setInteractive({ useHandCursor: true })
      .setData('type', 'button')
      .setData('onclick', () => {
        this.sound.play('click');

        this.toolButtons[this.mode].setAlpha(0.5);
        this.mode = mode;
        this.toolButtons[this.mode].setAlpha(1);
      })
      .setAlpha(0.5);
    this.toolButtons[mode] = button;
  }

  private hideMessage() {
    if (this.messageBubble) {
      this.messageBubble.destroy();
      delete this.messageBubble;
    }
    if (this.messageText) {
      this.messageText.destroy();
      delete this.messageText;
    }
  }

  private onGnomeClick = () => {
    this.hideMessage();
    this.messageText = this.add.text(
      50,
      100,
      "Hi friend, I'm Norma, welcome to my garden",
      {
        font: '16px Coming Soon',
        fill: '#000',
      }
    );
    this.messageText.setDepth(1);
    this.messageText.setPosition(
      GARDEN_WIDTH * TILE_SIZE - this.messageText.width - 48,
      GARDEN_HEIGHT * TILE_SIZE - this.messageText.height + 8
    );

    this.messageBubble = this.add.rectangle(
      this.messageText.getBounds().left +
        this.messageText.getBounds().width / 2,
      this.messageText.getBounds().top +
        this.messageText.getBounds().height / 2 -
        2,
      this.messageText.getBounds().width + 24,
      this.messageText.getBounds().height + 12,
      0xffffff
    );
    this.messageBubble.setStrokeStyle(2, 0x00000);
    this.messageBubble.setInteractive();
    this.messageBubble.setData('type', 'button');
    this.messageBubble.setData('onclick', () => {
      this.hideMessage();
    });
  };

  createToolbar() {
    const toolbar = this.add.container(0, TILE_SIZE * GARDEN_HEIGHT + 32);
    toolbar.add(
      this.add.rectangle(
        (TILE_SIZE * GARDEN_WIDTH) / 2,
        0,
        TILE_SIZE * GARDEN_WIDTH,
        64,
        0x489551
      )
    );

    this.createToolbarButton('rake', 0, PLANT_TILES.TOOL_RAKE);
    this.createToolbarButton('mark', 1, PLANT_TILES.TOOL_MARK);
    this.createToolbarButton('dig', 2, PLANT_TILES.TOOL_DIG);
    this.toolButtons[this.mode].setAlpha(1);

    const scoreBox = this.add.container(
      this.gameWidth - 64 - 32 * 7,
      TILE_SIZE * GARDEN_HEIGHT + 32 - 8
    );
    this.scores.found = this.add.text(0, -8, '0', {
      font: '16px Coming Soon',
      fill: '#fff',
    });
    scoreBox.add(this.scores.found);
    scoreBox.add(
      this.add.sprite(32, 0, ASSETS.TILES.PLANTS, PLANT_TILES.PLANT_YELLOW)
    );

    this.scores.dead = this.add.text(64, -8, '0', {
      font: '16px Coming Soon',
      fill: '#fff',
    });
    scoreBox.add(this.scores.dead);
    scoreBox.add(
      this.add.sprite(96, 0, ASSETS.TILES.PLANTS, PLANT_TILES.DEAD_FLOWER)
    );

    this.scores.hidden = this.add.text(128, -8, '16', {
      font: '16px Coming Soon',
      fill: '#fff',
    });
    scoreBox.add(this.scores.hidden);
    scoreBox.add(
      this.add.sprite(160, 0, ASSETS.TILES.PLANTS, PLANT_TILES.WEED_3)
    );

    const gnome = this.add.container(
      TILE_SIZE * (GARDEN_WIDTH - 1) + 8,
      TILE_SIZE * GARDEN_HEIGHT - 8
    );
    gnome.add(
      this.add.sprite(0, TILE_SIZE, ASSETS.TILES.PLANTS, PLANT_TILES.GNOME_1)
    );
    gnome.add(this.add.sprite(0, 0, ASSETS.TILES.PLANTS, PLANT_TILES.GNOME_2));
    gnome.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(-16, -16, TILE_SIZE, TILE_SIZE * 2),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    gnome.setData('type', 'button');
    gnome.setData('onclick', this.onGnomeClick);
  }

  create() {
    this.createAnimations();
    this.createBackground();
    this.createGarden();
    this.createToolbar();

    this.input.on('gameobjectdown', this.tileSelect, this);
  }
}
