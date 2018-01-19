import $ from 'jquery/dist/jquery.min';
import TUIOWidget from 'tuiomanager/core/TUIOWidget';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from 'tuiomanager/core/constants';
import * as THREE from 'three';
import WindowResize from 'three-window-resize';
import debounce from 'throttle-debounce/debounce';

import Protocol from '../Protocol';
import { cunlerp } from '../utils';

const trapGeometry = new THREE.BoxGeometry(1, 2, 1);
const trapMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

const GHOST_RANGE_SIZE = 5;

const scores = {
  Hunter1: {
    color: 'red',
    value: 0,
  },
  Hunter2: {
    color: '#99ff66',
    value: 0,
  },
  Explorer: {
    color: '#00ffff',
    value: 0,
  },
};

function printScore() {
  return (`<div class="scoreValue" style="color:${scores.Hunter1.color}">Chasseur 1: ${scores.Hunter1.value}</div>
  <div class="scoreValue" style="color:${scores.Hunter2.color}">Chasseur 2: ${scores.Hunter2.value}</div>
  <div class="scoreValue" style="color:${scores.Explorer.color}">Explorateur: ${scores.Explorer.value}</div>`);
}

const $interactions = $('<div class="absolutefill interactions">');
const $hud = $(`
<div class="absolutefill hud">
  <div class="scoreInfo">
    <div class="scoreText">Score</div>
    <div class="scoreValues">
      ${printScore()}
    </div>
  </div>
  <div class="scoreInfo reversed bottomAbsolute">
    <div class="scoreText">Score</div>
    <div class="scoreValues">
      ${printScore()}
    </div>
  </div>
</div>
`);

const YOU_LOST = 'You lost';
const EXPLORER_ESCAPED = 'The explorer managed to escape';
const $youlost = $(`
<div class="absolutefill endscreen youlost">
  <div class="status reversed">
    <div class="title">${YOU_LOST}</div>
    <div class="message">${EXPLORER_ESCAPED}</div>
  </div>
  <div class="status">
    <div class="title">${YOU_LOST}</div>
    <div class="message">${EXPLORER_ESCAPED}</div>
  </div>
</div>
`);
$youlost.hide();

const YOU_WON = 'You won';
const GHOSTS_HAVE_KILLED = 'The ghosts have killed the explorer';
const $youwin = $(`
<div class="absolutefill endscreen youwin">
  <div class="status reversed">
    <div class="title">${YOU_WON}</div>
    <div class="message">${GHOSTS_HAVE_KILLED}</div>
  </div>
  <div class="status">
    <div class="title">${YOU_WON}</div>
    <div class="message">${GHOSTS_HAVE_KILLED}</div>
  </div>
</div>
`);
$youwin.hide();

class SceneWidget extends TUIOWidget {

  constructor(socket) {
    super(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
    this.socket = socket;
    this._lastTouchesValues = {};
    this._lastTagsValues = {};
    this.raycaster = new THREE.Raycaster();
    this.doors = new Map();
    this.trapTags = new Map();
    this.simplePressed = false;
    const $scene = this.buildScene();
    const $container = $('<div class="container">');
    $container.append($scene);
    $container.append($interactions);
    $container.append($hud);
    $container.append($youlost);
    $container.append($youwin);
    this._domElem = $container;
  }

  get domElem() {
    return this._domElem;
  }

  onTouchCreation(tuioTouch) {
    super.onTouchCreation(tuioTouch);
    /*
    const viewPortCoord = new THREE.Vector2(
      ((tuioTouch.x / this.width) * 2) - 1,
      -((tuioTouch.y / this.height) * 2) + 1,
    );
    this.raycaster.setFromCamera(viewPortCoord, this.camera);
    const intersects = this.raycaster.intersectObjects(this.walls.children);
    for (const intersect of intersects) {
      console.log(intersect)
      intersect.object.material.color.set(0xff0000);
    }
    */
    if (this.isTouched(tuioTouch.x, tuioTouch.y)) {
      this._lastTouchesValues = {
        ...this._lastTouchesValues,
        [tuioTouch.id]: {
          x: tuioTouch.x,
          y: tuioTouch.y,
        },
      };
    }
  }

  onTouchUpdate(tuioTouch) {
    if (typeof (this._lastTouchesValues[tuioTouch.id]) !== 'undefined') {
      /*
      const lastTouchValue = this._lastTouchesValues[tuioTouch.id];
      const diffX = tuioTouch.x - lastTouchValue.x;
      const diffY = tuioTouch.y - lastTouchValue.y;
      const newX = this.x + diffX;
      const newY = this.y + diffY;
      if (newX < 0) {
        newX = 0;
      }
      if (newX > (WINDOW_WIDTH - this.width)) {
        console.log(WINDOW_WIDTH, this.width)
        newX = WINDOW_WIDTH - this.width;
      }
      if (newY < 0) {
        newY = 0;
      }
      if (newY > (WINDOW_HEIGHT - this.height)) {
        newY = WINDOW_HEIGHT - this.height;
      }
      */
      this._lastTouchesValues = {
        ...this._lastTouchesValues,
        [tuioTouch.id]: {
          x: tuioTouch.x,
          y: tuioTouch.y,
        },
      };
    }
  }

  onTagCreation(tuioTag) {
    super.onTagCreation(tuioTag);
    this.handleTagMove(tuioTag);
    if (this.isTouched(tuioTag.x, tuioTag.y)) {
      this._lastTagsValues = {
        ...this._lastTagsValues,
        [tuioTag.id]: {
          x: tuioTag.x,
          y: tuioTag.y,
        },
      };
    }
  }

  onTagUpdate(tuioTag) {
    if (typeof (this._lastTagsValues[tuioTag.id]) !== 'undefined') {
      const lastTagValue = this._lastTagsValues[tuioTag.id];
      const diffX = tuioTag.x - lastTagValue.x;
      const diffY = tuioTag.y - lastTagValue.y;
      let newX = this.x + diffX;
      let newY = this.y + diffY;
      if (newX < 0) {
        newX = 0;
      }
      if (newX > (WINDOW_WIDTH - this.width)) {
        newX = WINDOW_WIDTH - this.width;
      }
      if (newY < 0) {
        newY = 0;
      }
      if (newY > (WINDOW_HEIGHT - this.height)) {
        newY = WINDOW_HEIGHT - this.height;
      }
      this.handleTagMove(tuioTag);
      this._lastTagsValues = {
        ...this._lastTagsValues,
        [tuioTag.id]: {
          x: tuioTag.x,
          y: tuioTag.y,
        },
      };
    }
  }

  onTagDeletion(tuioTagId) {
    super.onTagDeletion(tuioTagId);
    console.log(`Tag deleted (id: ${tuioTagId})`);
    if (this.trapTags.has(tuioTagId)) {
      const trap = this.trapTags.get(tuioTagId);
      this.trapTags.delete(tuioTagId);
      console.log(trap);
      this.scene.remove(trap);
    }
  }

  handleTagMove = debounce(500, (tuioTag) => {
    console.log(`Tag released (id: ${tuioTag.id})`);
    let trap;
    if (this.trapTags.has(tuioTag.id)) {
      trap = this.trapTags.get(tuioTag.id);
    } else {
      trap = new THREE.Mesh(trapGeometry, trapMaterial);
      this.scene.add(trap);
      this.trapTags.set(tuioTag.id, trap);
    }
    const viewPortCoord = new THREE.Vector2(
      ((tuioTag.x / this.width) * 2) - 1,
      -((tuioTag.y / this.height) * 2) + 1,
    );
    this.raycaster.setFromCamera(viewPortCoord, this.camera);
    const intersects = this.raycaster.intersectObjects(this.floorsGroup.children);
    console.log(intersects.length);
    if (intersects.length !== 0) {
      const intersect = intersects[0];
      const flooredPosition = new THREE.Vector3(
        Math.floor(intersect.point.x),
        Math.floor(intersect.point.y),
        Math.floor(intersect.point.z),
      );
      trap.position.copy(flooredPosition);
      this.socket.emit(Protocol.CREATE_TRAP, {
        position: {
          x: flooredPosition.x,
          y: flooredPosition.y,
          z: flooredPosition.z,
        },
        name: tuioTag.id,
        type: 'DeathTrap',
      });
    }
  });

  buildScene() {
    const playerGeometry = new THREE.ConeGeometry(0.65, 2.2, 8);
    const playerMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      opacity: 0,
      transparent: true,
    });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.y = 3;
    player.rotation.z = -Math.PI / 2;

    const ghostGeometry = new THREE.ConeGeometry(0.65, 2.2, 8);
    const ghostMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const ghost = new THREE.Mesh(ghostGeometry, ghostMaterial);
    ghost.position.y = 3;
    ghost.rotation.z = -Math.PI / 2;

    const ghostRangeGeometry = new THREE.CircleGeometry(GHOST_RANGE_SIZE, 32);
    const ghostRangeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      opacity: 0.1,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const ghostRange = new THREE.Mesh(ghostRangeGeometry, ghostRangeMaterial);
    ghostRange.rotation.x = -Math.PI / 2;

    this.socket.emit(Protocol.REGISTER, 'TABLE');

    this.socket.emit(Protocol.GET_MAP_DEBUG, (mapData) => {
      const mapHeight = mapData.terrain.height;
      const mapWidth = mapData.terrain.width;

      const map = mapData.terrain.map;

      this.camera.position.x = mapWidth / 2;
      this.camera.position.z = mapHeight / 2;

      this.floorOne = new THREE.Group();

      this.wallsGroup = new THREE.Group();
      this.floorsGroup = new THREE.Group();
      this.doorsGroup = new THREE.Group();

      const wallGeometry = new THREE.BoxGeometry(1, 5, 1);
      // const texture = new THREE.TextureLoader().load('assets/lava_brick.jpg');
      const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

      const carpetGeometry = new THREE.BoxGeometry(1, 1, 1);
      const carpetMaterial = new THREE.MeshBasicMaterial({ color: 0xC5C5C5 });

      const doorGeometry = new THREE.BoxGeometry(1, 5, 0.3);
      const doorMaterial = new THREE.MeshBasicMaterial({ color: 0x703F00 });

      map[0].forEach((elt, index) => {
        const posX = Math.floor(index % mapWidth);
        const posY = Math.floor(index / mapWidth);
        if (elt === 'W') {
          const wall = new THREE.Mesh(wallGeometry, wallMaterial.clone());
          wall.position.x = posX;
          wall.position.z = posY;
          this.wallsGroup.add(wall);
        } else if (elt === 'F' || elt === 'D') {
          const carpet = new THREE.Mesh(carpetGeometry, carpetMaterial);
          carpet.position.x = posX;
          carpet.position.z = posY;
          this.floorsGroup.add(carpet);
        }
      });

      mapData.objects.doors.forEach((doorData) => {
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.x = doorData.position[0];
        door.position.z = doorData.position[1];
        if (doorData.align === 'v') {
          door.rotation.y = Math.PI / 2;
        }
        this.doors.set(doorData.id, door);
        this.mansion.add(door);
      });

      this.floorOne.add(this.wallsGroup);
      this.floorOne.add(this.floorsGroup);
      this.floorOne.add(this.doorsGroup);
      this.mansion.add(this.floorOne);
    });

    this.socket.on(Protocol.PLAYER_POSITION_UPDATE, (data) => {
      player.position.x = data.position.x;
      player.position.z = data.position.z;
      player.rotation.y = -data.rotation.y;
      this.mansion.add(player);
    });

    this.socket.on(Protocol.GHOST_POSITION_UPDATE, (data) => {
      ghost.position.x = data.position.x;
      ghost.position.z = data.position.z;
      ghostRange.position.copy(ghost.position);
      ghost.rotation.y = -data.rotation.y;
      if (ghost.parent === null) {
        this.mansion.add(ghost);
        this.mansion.add(ghostRange);
      }
    });

    this.socket.on(Protocol.DOOR_UPDATE, (data) => {
      this.doors.get(data.name).visible = !open;
    });

    this.socket.on(Protocol.GAME_OVER, (data) => {
      if (data.won === true) {
        $youlost.show();
        scores.Hunter1.value = scores.Hunter1.value + 1;
        $('.scoreValues').html(printScore());
      } else {
        $youwin.show();
        scores.Explorer.value = scores.Explorer.value + 1;
        $('.scoreValues').html(printScore());
      }
    });

    this.socket.on(Protocol.RESTART, () => {
      Array.from(this.doors.values()).forEach(door => door.visible = true);
      $youlost.hide();
      $youwin.hide();
    });

    const animate = () => {
      requestAnimationFrame(animate);
      playerMaterial.opacity = 1 - cunlerp(GHOST_RANGE_SIZE - 2, GHOST_RANGE_SIZE, ghost.position.distanceTo(player.position));
      this.renderer.render(this.scene, this.camera);
    };

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0xffffff, 0);

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    new WindowResize(this.renderer, this.camera);

    this.camera.position.y = 100;
    this.camera.rotation.x = -Math.PI / 2;

    this.mansion = new THREE.Group();
    this.scene.add(this.mansion);

    animate();

    return $(this.renderer.domElement);
  }

}

export default SceneWidget;
