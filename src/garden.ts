import { PLANT_TILES } from './types';

type PlantColor = 'orange' | 'purple' | 'blue';

interface BasePlot {
  type: 'weed' | 'plant' | 'dirt' | 'edge';
  isDugUp?: boolean;
  sprite?: Phaser.GameObjects.Sprite;
  leafEdges?: Array<Phaser.GameObjects.Sprite>;
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

interface EdgePlot extends BasePlot {
  type: 'edge';
  isDugUp: true;
}

export type Plot = WeedPlot | PlantPlot | DirtPlot | EdgePlot;

export default class Garden {
  private grid: Plot[][];

  constructor(width: number, height: number, numPlants: number) {
    this.grid = [];
    for (let y = 0; y < height; y += 1) {
      const row: Plot[] = [];
      for (let x = 0; x < width; x += 1) {
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
          row.push({ type: 'edge', isDugUp: true });
        } else {
          row.push({ type: 'dirt' });
        }
      }
      this.grid.push(row);
    }

    for (let p = 0; p < numPlants; p += 1) {
      const x = Math.floor(1 + Math.random() * (width - 2));
      const y = Math.floor(1 + Math.random() * (height - 2));
      this.grid[y][x] = {
        type: 'plant',
        plantColor: randomPlantColor(),
      };
    }

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (
          this.grid[y][x].type === 'plant' ||
          this.grid[y][x].type === 'edge'
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
      if (this.isValidPlot(x, y + 1) && !this.getPlot(x, y + 1).isDugUp) {
        plot.leafEdges![0].setVisible(true);
      }
      if (this.isValidPlot(x + 1, y) && !this.getPlot(x + 1, y).isDugUp) {
        plot.leafEdges![2].setVisible(true);
      }
      if (this.isValidPlot(x - 1, y) && !this.getPlot(x - 1, y).isDugUp) {
        plot.leafEdges![1].setVisible(true);
      }
      if (this.isValidPlot(x, y - 1) && !this.getPlot(x, y - 1).isDugUp) {
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

  revealPlot(x: number, y: number) {
    const plot = this.getPlot(x, y);
    if (plot.isDugUp) {
      return;
    }
    plot.isDugUp = true;
    switch (plot.type) {
      case 'dirt':
        this.forEachNeighborPlot(x, y, (neighbor, nx, ny) => {
          if (!neighbor.isDugUp && neighbor.type !== 'plant') {
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
        this.getPlot(x, y).sprite?.setFrame(
          Math.min(this.getWeedStrength(x, y) - 1, 2)
        );
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
