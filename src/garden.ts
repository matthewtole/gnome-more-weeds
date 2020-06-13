import { PLANT_TILES, ASSET_TAGS, TILE_SIZE } from './types';

type PlantColor = 'orange' | 'purple' | 'blue';

interface BasePlot {
  type: 'weed' | 'plant' | 'dirt' | 'edge' | 'house';
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

export type Plot = WeedPlot | PlantPlot | DirtPlot | EdgePlot | HousePlot;

export default class Garden {
  private grid: Plot[][];

  constructor(width: number, height: number, numPlants: number) {
    // Construct the base garden of edges and dirt
    this.grid = [];
    for (let y = 0; y < height; y += 1) {
      const row: Plot[] = [];
      for (let x = 0; x < width; x += 1) {
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
          row.push({ type: 'edge', isRevealed: true, isDugUp: true });
        } else {
          row.push({ type: 'dirt' });
        }
      }
      this.grid.push(row);
    }

    const houseX = Math.floor(1 + Math.random() * (width - 3));
    const houseY = Math.floor(1 + Math.random() * (height - 3));
    this.grid[houseY][houseX] = {
      type: 'house',
      houseSegment: PLANT_TILES.HOUSE_1,
    };
    this.grid[houseY][houseX + 1] = {
      type: 'house',
      houseSegment: PLANT_TILES.HOUSE_2,
    };
    this.grid[houseY + 1][houseX] = {
      type: 'house',
      houseSegment: PLANT_TILES.HOUSE_3,
    };
    this.grid[houseY + 1][houseX + 1] = {
      type: 'house',
      houseSegment: PLANT_TILES.HOUSE_4,
    };

    // Randomly place `numPlants` plants in the garden
    for (let p = 0; p < numPlants; p += 1) {
      while (true) {
        const x = Math.floor(1 + Math.random() * (width - 2));
        const y = Math.floor(1 + Math.random() * (height - 2));
        if (this.getPlot(x, y).type === 'dirt') {
          this.grid[y][x] = {
            type: 'plant',
            plantColor: randomPlantColor(),
          };
          break;
        }
      }
    }

    // Grow the weeds around the plants based on the number of adjacent plants
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (
          this.grid[y][x].type === 'plant' ||
          this.grid[y][x].type === 'edge' ||
          this.grid[y][x].type === 'house'
        ) {
          continue;
        }
        const plantNeighbors = this.countPlantNeighbors(x, y);
        if (plantNeighbors > 0) {
          this.grid[y][x] = {
            type: 'weed',
            weedStrength: plantNeighbors,
          };
        }
      }
    }
  }

  private forEachNeighborPlot(
    x: number,
    y: number,
    callback: (plot: Plot, nx: number, ny: number) => void
  ) {
    forEachNeighbor(x, y, (nx, ny) => {
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

  countPlantNeighbors(x: number, y: number): number {
    let plants = 0;
    this.forEachNeighborPlot(x, y, (neighbor) => {
      if (neighbor.type === 'plant') {
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
    switch (plot.type) {
      case 'weed':
        plot.weedStrength -= 1;
        if (plot.weedStrength <= 0) {
          plot.isDugUp = true;
          plot.sprite?.destroy();
          this.forEachNeighborPlot(x, y, (neighbor, nx, ny) => {
            if (neighbor.type !== 'plant') {
              return;
            }
            let allWeedsDugUp = true;
            this.forEachNeighborPlot(nx, ny, (plantNeighbor) => {
              if (
                allWeedsDugUp &&
                plantNeighbor.type === 'weed' &&
                !plantNeighbor.isDugUp
              ) {
                allWeedsDugUp = false;
              }
            });
            if (allWeedsDugUp) {
              this.revealPlot(nx, ny);
            }
          });
        } else {
          switch (plot.weedStrength) {
            case 1:
              plot.sprite?.play(ASSET_TAGS.ANIMATIONS.WEED_1);
              break;
            case 2:
              plot.sprite?.play(ASSET_TAGS.ANIMATIONS.WEED_2);
              break;
            default:
              plot.sprite?.play(ASSET_TAGS.ANIMATIONS.WEED_3);
          }
          break;
        }
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
        break;
      case 'dirt':
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
            Math.round(Math.random()) ? PLANT_TILES.DIRT_1 : PLANT_TILES.DIRT_2
          );
        } else {
          plot.sprite?.destroy();
        }
        break;
      case 'plant':
        plot.sprite?.setFrame(plantColorToFrame(plot.plantColor));
        break;
      case 'weed':
        switch (this.getWeedStrength(x, y)) {
          case 1:
            plot.sprite?.play(ASSET_TAGS.ANIMATIONS.WEED_1);
            break;
          case 2:
            plot.sprite?.play(ASSET_TAGS.ANIMATIONS.WEED_2);
            break;
          default:
            plot.sprite?.play(ASSET_TAGS.ANIMATIONS.WEED_3);
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
}

function forEachNeighbor(
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

function plantColorToFrame(color: PlantColor): PLANT_TILES {
  switch (color) {
    case 'blue':
      return PLANT_TILES.PLANT_BLUE;
    case 'purple':
      return PLANT_TILES.PLANT_PURPLE;
    default:
      return PLANT_TILES.PLANT_ORANGE;
  }
}

function randomPlantColor(): PlantColor {
  const num = Math.floor(Math.random() * 3);
  switch (num) {
    case 0:
      return 'blue';
    case 1:
      return 'purple';
    default:
      return 'orange';
  }
}
