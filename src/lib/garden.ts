import { PLANT_TILES, ASSETS } from '../types';

type PlantColor = 'yellow' | 'purple' | 'blue';
type PlotType = 'weed' | 'plant' | 'dirt' | 'edge' | 'house';

interface BasePlot {
  type: PlotType;
  isRevealed?: boolean;
  isDugUp?: boolean;
  sprite?: Phaser.GameObjects.Sprite;
  leafEdges?: Array<Phaser.GameObjects.Sprite>;
  isMarked?: boolean;
  marker?: Phaser.GameObjects.Sprite;
}

interface WeedPlot extends BasePlot {
  type: 'weed';
  weedStrength: number;
}

interface PlantPlot extends BasePlot {
  type: 'plant';
  plantColor: PlantColor;
  isDead?: boolean;
}

interface DirtPlot extends BasePlot {
  type: 'dirt';
  hasMound?: boolean;
}

interface HousePlot extends BasePlot {
  type: 'house';
  houseSegment: number;
}

interface EdgePlot extends BasePlot {
  type: 'edge';
  isRevealed: true;
  isDugUp: true;
}

interface GardenLayout {
  width: number;
  height: number;
  plots: PlotType[][];
}

export type Plot = WeedPlot | PlantPlot | DirtPlot | EdgePlot | HousePlot;

export default class Garden {
  private grid: Plot[][];

  static generateLayout(
    width: number,
    height: number,
    numPlants: number
  ): GardenLayout {
    const layout: GardenLayout = { width, height, plots: [] };

    // Construct the base layout of dirt and edges
    for (let y = 0; y < height; y += 1) {
      const row: PlotType[] = [];
      for (let x = 0; x < width; x += 1) {
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
          row.push('edge');
        } else {
          row.push('dirt');
        }
      }
      layout.plots.push(row);
    }

    // Place the house somewhere near the middle of the garden
    const houseX = Math.floor(width / 2) - 1;
    const houseY = Math.floor(height / 2) - 1;
    layout.plots[houseY][houseX] = 'house';
    layout.plots[houseY][houseX + 1] = 'house';
    layout.plots[houseY + 1][houseX] = 'house';
    layout.plots[houseY + 1][houseX + 1] = 'house';

    // Grow some plants
    let plantsToPlace = numPlants;
    while (plantsToPlace > 0) {
      const x = Math.floor(1 + Math.random() * (width - 2));
      const y = Math.floor(1 + Math.random() * (height - 2));
      if (layout.plots[y][x] === 'dirt') {
        layout.plots[y][x] = 'plant';
        plantsToPlace -= 1;
      }
    }

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (layout.plots[y][x] === 'dirt') {
          Garden.forEachNeighbor(x, y, (nx, ny) => {
            if (layout.plots[ny][nx] === 'plant') {
              layout.plots[y][x] = 'weed';
            }
          });
        }
      }
    }

    return layout;
  }

  constructor(layout: GardenLayout) {
    const houseSegments = [
      PLANT_TILES.HOUSE_2,
      PLANT_TILES.HOUSE_3,
      PLANT_TILES.HOUSE_1,
      PLANT_TILES.HOUSE_4,
    ];
    this.grid = layout.plots.map((row, y) =>
      row.map((type, x) => {
        switch (type) {
          case 'dirt':
            return { type };
          case 'weed':
            return {
              type,
              weedStrength: Garden.countPlantNeighbors(x, y, layout.plots),
            };
          case 'edge':
            return { type, isRevealed: true, isDugUp: true };
          case 'house':
            return { type, houseSegment: houseSegments.shift()! };
          case 'plant':
            return { type, plantColor: Garden.randomPlantColor() };
        }
      })
    );
  }

  private forEachNeighborPlot(
    x: number,
    y: number,
    callback: (plot: Plot, nx: number, ny: number) => void
  ) {
    Garden.forEachNeighbor(x, y, (nx, ny) => {
      if (this.isValidPlot(nx, ny)) {
        callback(this.getPlot(nx, ny), nx, ny);
      }
    });
  }

  updateLeafEdges() {
    this.forEachPlot((x, y, plot) => {
      plot.leafEdges?.forEach((s) => s.setVisible(false));
      if (this.isValidPlot(x, y + 1) && !this.getPlot(x, y + 1).isRevealed) {
        plot.leafEdges![0].setVisible(true);
      }
      if (this.isValidPlot(x + 1, y) && !this.getPlot(x + 1, y).isRevealed) {
        plot.leafEdges![2].setVisible(true);
      }
      if (this.isValidPlot(x - 1, y) && !this.getPlot(x - 1, y).isRevealed) {
        plot.leafEdges![1].setVisible(true);
      }
      if (this.isValidPlot(x, y - 1) && !this.getPlot(x, y - 1).isRevealed) {
        plot.leafEdges![3].setVisible(true);
      }
    });
  }

  static countPlantNeighbors(
    x: number,
    y: number,
    plots: PlotType[][]
  ): number {
    let plants = 0;
    Garden.forEachNeighbor(x, y, (nx, ny) => {
      if (plots[ny][nx] === 'plant') {
        plants += 1;
      }
    });
    return plants;
  }

  isValidPlot(x: number, y: number) {
    return y >= 0 && x >= 0 && y < this.grid.length && x < this.grid[y].length;
  }

  getPlot(x: number, y: number): Plot {
    return this.grid[y][x];
  }

  getWeedStrength(x: number, y: number) {
    const plot = this.getPlot(x, y);
    return plot.type === 'weed' ? plot.weedStrength : 0;
  }

  markPlot(x: number, y: number) {
    const plot = this.getPlot(x, y);
    if (plot.isRevealed || plot.isDugUp) {
      return;
    }
    if (plot.isMarked) {
      plot.isMarked = false;
      plot.marker?.setVisible(false);
    } else {
      plot.isMarked = true;
      plot.marker?.setVisible(true);
    }
  }

  digPlot(x: number, y: number) {
    const plot = this.getPlot(x, y);
    if (!plot.isRevealed) {
      return;
    }
    if (plot.isDugUp) {
      return;
    }
    if (plot.isMarked) {
      return;
    }
    switch (plot.type) {
      case 'weed':
        plot.isDugUp = true;
        plot.sprite?.anims.stop();
        plot.sprite?.setTexture(ASSETS.TILES.PLANTS);
        plot.sprite?.setFrame(PLANT_TILES.DUG_UP_1);
        this.forEachNeighborPlot(x, y, (neighbor, nx, ny) => {
          if (neighbor.type !== 'plant') {
            return;
          }
          if (neighbor.isDead) {
            return;
          }
          let allWeedsDugUp = true;
          this.forEachNeighborPlot(nx, ny, (plantNeighbor) => {
            if (plantNeighbor.type === 'weed' && !plantNeighbor.isDugUp) {
              allWeedsDugUp = false;
            }
          });
          if (allWeedsDugUp) {
            neighbor.sprite?.setFrame(
              Garden.plantColorToFrame(neighbor.plantColor)
            );
            neighbor.isDead = false;
            neighbor.isRevealed = true;
            this.updateLeafEdges();
          }
        });
        break;
      case 'plant':
        plot.isDugUp = true;
        plot.sprite?.destroy();
        break;
    }
  }

  revealPlot(x: number, y: number) {
    const plot = this.getPlot(x, y);
    if (plot.isRevealed) {
      return;
    }
    if (plot.isMarked) {
      return;
    }
    plot.isRevealed = true;
    switch (plot.type) {
      case 'house':
        plot.sprite?.setFrame(plot.houseSegment);
        this.forEachNeighborPlot(x, y, (neighbor, nx, ny) => {
          if (!neighbor.isRevealed && neighbor.type !== 'plant') {
            this.revealPlot(nx, ny);
          }
        });
        break;
      case 'dirt':
        {
          this.forEachNeighborPlot(x, y, (neighbor, nx, ny) => {
            if (!neighbor.isRevealed && neighbor.type !== 'plant') {
              this.revealPlot(nx, ny);
            }
          });
          let isSurroundedByDirt = true;
          this.forEachNeighborPlot(x, y, (neighbor) => {
            if (!isSurroundedByDirt) {
              return;
            }
            if (
              !['dirt', 'edge'].includes(neighbor.type) ||
              (neighbor.type === 'dirt' && neighbor.hasMound)
            ) {
              isSurroundedByDirt = false;
            }
          });
          if (isSurroundedByDirt && !!Math.round(Math.random())) {
            plot.hasMound = true;
            plot.sprite?.setFrame(
              Math.round(Math.random())
                ? PLANT_TILES.DIRT_1
                : PLANT_TILES.DIRT_2
            );
          } else {
            plot.sprite?.destroy();
          }
        }
        break;
      case 'plant':
        plot.sprite?.setFrame(PLANT_TILES.DEAD_FLOWER);
        plot.isDead = true;
        break;
      case 'weed':
        switch (this.getWeedStrength(x, y)) {
          case 1:
            plot.sprite?.play(ASSETS.ANIMATIONS.WEED_1);
            break;
          case 2:
            plot.sprite?.play(ASSETS.ANIMATIONS.WEED_2);
            break;
          default:
            plot.sprite?.play(ASSETS.ANIMATIONS.WEED_3);
        }
        break;
    }
    this.updateLeafEdges();
  }

  forEachPlot(callback: (x: number, y: number, plot: Plot) => void) {
    this.grid.forEach((row, y) => {
      row.forEach((plot, x) => {
        callback(x, y, plot);
      });
    });
  }

  static forEachNeighbor(
    x: number,
    y: number,
    callback: (x: number, y: number) => void
  ) {
    [-1, 0, 1].forEach((dx) => {
      [-1, 0, 1].forEach((dy) => {
        if (!(dx === 0 && dy === 0)) {
          callback(x + dx, y + dy);
        }
      });
    });
  }

  static plantColorToFrame(color: PlantColor): PLANT_TILES {
    switch (color) {
      case 'blue':
        return PLANT_TILES.PLANT_BLUE;
      case 'purple':
        return PLANT_TILES.PLANT_PURPLE;
      default:
        return PLANT_TILES.PLANT_YELLOW;
    }
  }

  public foundFlowers() {
    let f = 0;
    this.forEachPlot((x, y, plot) => {
      if (plot.type === 'plant' && plot.isRevealed && !plot.isDead) {
        f += 1;
      }
    });
    return f;
  }

  public killedFlowers() {
    let f = 0;
    this.forEachPlot((x, y, plot) => {
      if (plot.type === 'plant' && plot.isDead) {
        f += 1;
      }
    });
    return f;
  }

  public hiddenFlowers() {
    let f = 0;
    this.forEachPlot((x, y, plot) => {
      if (plot.type === 'plant' && !plot.isRevealed) {
        f += 1;
      }
    });
    return f;
  }

  static randomPlantColor(): PlantColor {
    const num = Math.floor(Math.random() * 3);
    switch (num) {
      case 0:
        return 'blue';
      case 1:
        return 'purple';
      default:
        return 'yellow';
    }
  }
}
