import Garden from './garden';

describe('Garden', () => {
  describe('#isValidPlot', () => {
    it.each([
      [0, 0],
      [1, 1],
    ])('should return true for valid plot location (%p, %p)', (x, y) => {
      const garden = new Garden(2, 2, 1);
      expect(garden.isValidPlot(x, y)).toBeTruthy();
    });

    it.each([
      [-1, 0],
      [0, -1],
      [2, 0],
      [0, 2],
    ])('should return false for invalid plot location (%p, %p)', (x, y) => {
      const garden = new Garden(2, 2, 1);
      expect(garden.isValidPlot(x, y)).toBeFalsy();
    });
  });
});
