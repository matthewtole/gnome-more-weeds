interface BasePlot {
  type: 'weed' | 'plant' | 'dirt';
  isDugUp: boolean;
}

interface WeedPlot extends BasePlot {
  type: 'weed';
  weedStrength: number;
}

interface PlantPlot extends BasePlot {
  type: 'plant';
}

interface DirtPlot extends BasePlot {
  type: 'dirt';
}

export type Plot = WeedPlot | PlantPlot | DirtPlot;

export default class Garden {
  private grid: Plot[][];

  constructor(width: number, height: number, numPlants: number) {
    this.grid = [];
    for (let y = 0; y < height; y += 1) {
      const row: Plot[] = [];
      for (let x = 0; x < width; x += 1) {
        row.push({ type: 'dirt', isDugUp: false });
      }
      this.grid.push(row);
    }

    for (let p = 0; p < numPlants; p += 1) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      this.grid[y][x].type = 'plant';
    }

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (this.grid[y][x].type === 'plant') {
          continue;
        }
        const plantNeighbors = this.countPlantNeighbors(x, y);
        if (plantNeighbors > 0) {
          this.grid[y][x] = {
            type: 'weed',
            weedStrength: plantNeighbors,
            isDugUp: false,
          };
        }
      }
    }
  }

  countPlantNeighbors(x: number, y: number): number {
    let plants = 0;
    [-1, 0, 1].forEach((dx) => {
      [-1, 0, 1].forEach((dy) => {
        if (
          this.isValidPlot(x + dx, y + dy) &&
          this.getPlot(x + dx, y + dy).type === 'plant'
        ) {
          plants += 1;
        }
      });
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
}
