import Dungeon from 'dungeon-generator';

export default class Mansion {

  rawData = null;

  constructor(maxWidth = 50, maxHeight = 50) {
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
        spawn: [floor.initial[0], 0, floor.initial[1]],
      },
      ghost: {
        spawn: [0, 0, 0],
      },
      objects: floor.objects,
    };
  }

  _generateFloor(maxWidth, maxHeight) {
    const floorDungeon = new Dungeon({
      size: [maxWidth, maxHeight],
      rooms: {
        initial: {
          min_size: [3, 3],
          max_size: [5, 5],
          max_exits: 2,
        },
        any: {
          min_size: [5, 5],
          max_size: [20, 20],
          max_exits: 4,
        },
      },
      max_corridor_length: 1,
      min_corridor_length: 1,
      corridor_density: 0,
      symmetric_rooms: true,
      interconnects: 1,
      max_interconnect_length: 1,
      room_count: 30,
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
    const floorObjects = {
      doors: [],
      lights: [],
    };
    for (let piece of floorDungeon.children) {
      floorObjects.lights.push({
        id: piece.tag + "_light",
        position: {
          x: piece.position[0] + piece.size[0] / 2,
          y: 0,
          z: piece.position[1] + piece.size[1] / 2,
        },
        on: true,
      });
      // piece.position; //[x, y] position of top left corner of the piece within dungeon
      // piece.tag; // 'any', 'initial' or any other key of 'rooms' options property
      // piece.size; //[width, height]
      for (let exit of piece.exits) {
        let [[piece_exit_x, piece_exit_y], angle] = exit; // local position of exit and piece it exits to
        const [exit_x, exit_y] = piece.global_pos([piece_exit_x, piece_exit_y]); // [x, y] global pos of the exit
        const doorId = piece.tag + "_door_" + Math.floor(Math.random() * 1000000);
        /*
        floorObjects.doors.map((door) => {
          if (door) {
            console.log('azer');
          }
        });
        */
        floorObjects.doors.push({
          "id": doorId,
          "position": [exit_x, exit_y],
          "align": angle % 180 === 0 ? "h" : "v",
        });
      }
      piece.local_pos(floorDungeon.start_pos); //get local position within the piece of dungeon's global position
    }
    let randomExitIndex = Math.floor(Math.random() * floorObjects.doors.length);
    floorObjects.doors[randomExitIndex].exit = true;
    return {data: floorData, size: floorSize, initial: floorDungeon.start_pos, objects: floorObjects};
  }

}
