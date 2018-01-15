import Dungeon from 'dungeon-generator';

export default class Mansion {

  rawData = null;

  constructor(maxWidth = 40, maxHeight = 40) {
    const floor = this._generateFloor(maxWidth, maxHeight);
    this.rawData = {
      name: 'Mansion',
      terrain: {
        width: floor.size.width,
        height: floor.size.height,
        floors: 1,
        map: [
          floor.data,
        ],
      },
      player: {
        spawn: [floor.initial.x, 0, floor.initial.y],
      },
      ghost: {
        spawn: [0, 0, 0],
      },
    };
  }

  _generateFloor(maxWidth, maxHeight) {
    const floorDungeon = new Dungeon({
      size: [maxWidth, maxHeight],
      rooms: {
        initial: {
          min_size: [3, 3],
          max_size: [3, 3],
          max_exits: 1,
        },
        any: {
          min_size: [5, 5],
          max_size: [7, 6],
          max_exits: 4,
        },
      },
      max_corridor_length: 1,
      min_corridor_length: 1,
      corridor_density: 0,
      symmetric_rooms: true,
      interconnects: 1,
      max_interconnect_length: 1,
      room_count: 20,
    });
    try {
      floorDungeon.generate();
    } catch (e) {
      // Error
    }
    // floorDungeon.print();
    const floorData = [];
    const floorSize = {
      width: floorDungeon.size[0],
      height: floorDungeon.size[1],
    };
    for (let y = 0; y < floorSize.height; y++) {
      for (let x = 0; x < floorSize.width; x++) {
        if (floorDungeon.walls.get([x, y]))
          floorData.push('W');
        else
          floorData.push('F');
      }
    }
    return { data: floorData, size: floorSize, initial: floorDungeon.start_pos };
  }

}
