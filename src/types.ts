export const TILE_SIZE = 32;
export const GARDEN_HEIGHT = 16;
export const GARDEN_WIDTH = 16;

export const enum PLANT_TILES {
  WEED_1 = 0,
  WEED_2 = 1,
  WEED_3 = 2,
  PLANT_ORANGE = 3,
  ROCK = 4,
  MUSHROOMS = 5,
  LEAVES = 6,
  LEAF_EDGE_UP = 7,
  LEAF_EDGE_RIGHT = 8,
  LEAF_EDGE_DOWN = 9,
  LEAF_EDGE_LEFT = 10,
  PLANT_PURPLE = 11,
  PLANT_BLUE = 12,
  TAG = 13,
  DIRT_1 = 14,
  DIRT_2 = 15,
  TOOL_DIG = 16,
  ROCK_2 = 17,
  TOOL_RAKE = 18,
  _1 = 19,
  _2 = 20,
  _3 = 21,
  HOUSE_1 = 23,
  HOUSE_2 = 24,
  HOUSE_3 = 22,
  HOUSE_4 = 25,
  TOOL_MARK = 26,
  DEAD_FLOWER = 27,
  DUG_UP_1 = 28,
  DUG_UP_2 = 29,
  _4 = 30,
  _5 = 31,
  _6 = 32,
  GNOME_1 = 33,
  GNOME_2 = 34,
}

export type Mode = 'dig' | 'rake' | 'mark';

export const ASSET_TAGS = {
  TILES: {
    BACKGROUND: 'tiles/background',
    PLANTS: 'tiles/plants',
  },
  SPRITESHEETS: {
    WEED_1: 'spritesheets/weed1',
    WEED_2: 'spritesheets/weed2',
    WEED_3: 'spritesheets/weed3',
  },
  ANIMATIONS: {
    WEED_1: 'animations/weed/1',
    WEED_2: 'animations/weed/2',
    WEED_3: 'animations/weed/3',
  },
};
