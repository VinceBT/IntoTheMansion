import $ from 'jquery/dist/jquery.min';
import TUIOWidget from 'tuiomanager/core/TUIOWidget';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from 'tuiomanager/core/constants';
import * as THREE from 'three';
import WindowResize from 'three-window-resize';
import debounce from 'throttle-debounce/debounce';

import Protocol from '../Protocol';
import { cunlerp } from '../utils';
import playerconfigs from '../../assets/playerconfigs.json';


const GHOST_RANGE_SIZE = 5;
const GHOST_NUMBER = 2;
const GHOST_COLORS = [0xff0000, 0x00ff00];

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
  return (`<div class="scoreValue" style="color:${scores.Hunter1.color}; background-color: rgba(255, 0, 0, 0.2)"><div class="avatar avatarHunter1"/><p>Ghost 1: ${scores.Hunter1.value}</p></div>
  <div class="scoreValue" style="color:${scores.Hunter2.color}; background-color: rgba(0, 255, 0, 0.2)"><div class="avatar avatarHunter2"/><p>Ghost 2: ${scores.Hunter2.value}</p></div>
  <div class="scoreValue" style="color:${scores.Explorer.color}; background-color: rgba(0, 255, 255, 0.2)"><div class="avatar avatarExplorer"/><p>Explorer: ${scores.Explorer.value}</p></div>`);
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
    this.doorsMap = new Map();
    this.trapTags = new Map();
    this.directionTags = new Map();
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
  }

  associateTag = (tuioTag) => {
    for (let i = 0; i < playerconfigs.length; i++) {
      const playerconfig = playerconfigs[i];
      for (const key of Object.keys(playerconfig)) {
        if (playerconfig[key].toString() === tuioTag.id.toString()) {
          return {
            player: i,
            type: key,
          };
        }
      }
    }
    return null;
  };

  tagToScenePosition = (tuioTag, floored = false) => {
    const viewPortCoord = new THREE.Vector2(
      ((tuioTag.x / this.width) * 2) - 1,
      -((tuioTag.y / this.height) * 2) + 1,
    );
    this.raycaster.setFromCamera(viewPortCoord, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);
    // console.log(intersects.length);
    if (intersects.length !== 0) {
      const intersect = intersects[0];
      if (!intersect.object.carpet) return null;
      if (!floored) return intersect.point.clone();
      const flooredPosition = new THREE.Vector3(
        Math.floor(intersect.point.x),
        Math.floor(intersect.point.y),
        Math.floor(intersect.point.z),
      );
      return flooredPosition;
    }
    return null;
  };

  handleTagMove = debounce(500, (tuioTag) => {
    console.log(`Tag released (id: ${tuioTag.id})`);
    const tagData = this.associateTag(tuioTag);
    console.log('Tag data', tagData);
    if (tagData !== null) {
      if (tagData.type === 'direction') {
        const intersectPosition = this.tagToScenePosition(tuioTag);
        if (intersectPosition === null) return;
        let ghostDirection;
        if (this.directionTags.has(tuioTag.id)) {
          ghostDirection = this.directionTags.get(tuioTag.id);
        } else {
          const ghostDirectionGeometry = new THREE.ConeGeometry(2, 5, 8);
          const ghostDirectionMaterial = new THREE.MeshBasicMaterial({ color: GHOST_COLORS[tagData.player] });
          ghostDirection = new THREE.Mesh(ghostDirectionGeometry, ghostDirectionMaterial);
          this.scene.add(ghostDirection);
          this.directionTags.set(tuioTag.id, ghostDirection);
        }
        ghostDirection.position.copy(intersectPosition);
        this.socket.emit(Protocol.REQUEST_GHOST_MOVEMENT, {
          name: tuioTag.id,
          player: tagData.player,
          position: {
            x: intersectPosition.x,
            y: intersectPosition.y,
            z: intersectPosition.z,
          },
        });
      } else if (tagData.type === 'trap') {
        const flooredIntersectPosition = this.tagToScenePosition(tuioTag, true);
        if (flooredIntersectPosition === null) return;
        let ghostTrap;
        if (this.trapTags.has(tuioTag.id)) {
          ghostTrap = this.trapTags.get(tuioTag.id);
        } else {
          const trapGeometry = new THREE.BoxGeometry(1, 2, 1);
          const trapMaterial = new THREE.MeshBasicMaterial({ color: GHOST_COLORS[tagData.player] });
          ghostTrap = new THREE.Mesh(trapGeometry, trapMaterial);
          this.scene.add(ghostTrap);
          this.trapTags.set(tuioTag.id, ghostTrap);
        }
        ghostTrap.position.copy(flooredIntersectPosition);
        this.socket.emit(Protocol.CREATE_TRAP, {
          name: tuioTag.id,
          player: tagData.player,
          position: {
            x: flooredIntersectPosition.x,
            y: flooredIntersectPosition.y,
            z: flooredIntersectPosition.z,
          },
          type: 'DeathTrap',
        });
      }
    }
  });

  buildScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0xffffff, 0);

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    new WindowResize(this.renderer, this.camera);

    this.camera.position.y = 100;
    this.camera.rotation.x = -Math.PI / 2;

    this.walls = [];
    this.carpets = [];
    this.doors = [];

    const playerGroup = new THREE.Group();
    const ghostGroups = new Array(GHOST_NUMBER).fill(null)
      .map(() => new THREE.Group());

    const jsonLoader = new THREE.JSONLoader();

    const playerConeGeometry = new THREE.ConeGeometry(0.3, 1.5, 8);
    const playerMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.7,
    });
    const conePlayer = new THREE.Mesh(playerConeGeometry, playerMaterial);
    conePlayer.position.x = 3;
    conePlayer.position.y = 3;
    conePlayer.rotation.z = -Math.PI / 2;

    playerGroup.conePlayer = conePlayer;
    playerGroup.add(conePlayer);

    jsonLoader.load('assets/models/player.json',
      (flashLightGeometry) => {
        const modelPlayer = new THREE.Mesh(flashLightGeometry, playerMaterial);
        modelPlayer.position.y = 3;
        modelPlayer.scale.set(1.2, 1.2, 1.2);
        playerGroup.add(modelPlayer);
      }, (xhr) => {
        console.log(`Loading player ${xhr.loaded / xhr.total * 100}% loaded`);
      }, (err) => {
        console.log('An error happened');
      },
    );

    this.scene.add(playerGroup);

    const ghostConeGeometry = new THREE.ConeGeometry(0.3, 1.5, 8);
    const ghostRangeGeometry = new THREE.CircleGeometry(GHOST_RANGE_SIZE, 32);

    for (const ghostGroup of ghostGroups) {
      const ghostColor = GHOST_COLORS[ghostGroups.indexOf(ghostGroup)];
      const ghostMaterial = new THREE.MeshBasicMaterial({
        color: ghostColor,
        transparent: true,
        opacity: 0.7,
      });
      const ghostCone = new THREE.Mesh(ghostConeGeometry, ghostMaterial);
      ghostCone.position.x = 3;
      ghostCone.position.y = 3;
      ghostCone.rotation.z = -Math.PI / 2;

      ghostGroup.ghostCone = ghostCone;
      ghostGroup.add(ghostCone);

      const ghostRangeMaterial = new THREE.MeshBasicMaterial({
        color: ghostColor,
        opacity: 0.1,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const ghostRange = new THREE.Mesh(ghostRangeGeometry, ghostRangeMaterial);
      ghostRange.position.y = 3;
      ghostRange.rotation.x = -Math.PI / 2;
      ghostGroup.ghostRange = ghostRange;
      ghostGroup.add(ghostRange);
      this.scene.add(ghostGroup);
      ghostGroup.position.x = (ghostGroups.indexOf(ghostGroup) + 1) * 3;
    }

    jsonLoader.load('assets/models/ghost.json',
      (ghostGeometry) => {
        for (const ghostGroup of ghostGroups) {
          const modelGhost = new THREE.Mesh(ghostGeometry, ghostGroup.ghostCone.material);
          modelGhost.position.y = 3;
          modelGhost.scale.set(1.2, 1.2, 1.2);
          ghostGroup.add(modelGhost);
        }
      }, (xhr) => {
        console.log(`Loading ghost ${xhr.loaded / xhr.total * 100}% loaded`);
      }, (err) => {
        console.log('An error happened');
      },
    );

    this.socket.emit(Protocol.REGISTER, 'TABLE');

    this.socket.emit(Protocol.GET_MAP_DEBUG, (mapData) => {
      const mapHeight = mapData.terrain.height;
      const mapWidth = mapData.terrain.width;

      const map = mapData.terrain.map;

      this.camera.position.x = mapWidth / 2;
      this.camera.position.z = mapHeight / 2;

      const wallGeometry = new THREE.BoxGeometry(1, 5, 1);
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
          wall.wall = true;
          this.scene.add(wall);
          this.walls.push(wall);
        } else if (elt === 'F' || elt === 'D') {
          const carpet = new THREE.Mesh(carpetGeometry, carpetMaterial);
          carpet.position.x = posX;
          carpet.position.z = posY;
          carpet.carpet = true;
          this.scene.add(carpet);
          this.carpets.push(carpet);
        }
      });

      mapData.objects.doors.forEach((doorData) => {
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.x = doorData.position[0];
        door.position.z = doorData.position[1];
        if (doorData.align === 'v') {
          door.rotation.y = Math.PI / 2;
        }
        this.doorsMap.set(doorData.id, door);
        this.scene.add(door);
        this.doors.push(door);
      });
    });

    this.socket.on(Protocol.PLAYER_POSITION_UPDATE, (data) => {
      playerGroup.position.x = data.position.x;
      playerGroup.position.z = data.position.z;
      playerGroup.rotation.y = -data.rotation.y;
    });

    this.socket.on(Protocol.GHOST_POSITION_UPDATE, (data) => {
      const id = data.id || 0;
      const ghostGroup = ghostGroups[id];
      ghostGroup.position.x = data.position.x;
      ghostGroup.position.z = data.position.z;
      ghostGroup.rotation.y = -data.rotation.y;
    });

    this.socket.on(Protocol.DOOR_UPDATE, (data) => {
      this.doors.get(data.name).visible = !open;
    });

    this.socket.on(Protocol.TRAP_TRIGGERED, (data) => {
      if (this.trapTags.has(data.trapId)) {
        const trap = this.trapTags.get(data.trapId);
        this.trapTags.delete(data.trapId);
        this.scene.remove(trap);
      }
    });

    this.socket.on(Protocol.GAME_OVER, (data) => {
      if (data.won === true) {
        $youlost.show();
        scores.Explorer.value++;
        $('.scoreValues')
          .html(printScore());
      } else {
        $youwin.show();
        scores.Hunter1.value++;
        $('.scoreValues')
          .html(printScore());
      }
    });

    this.socket.on(Protocol.RESTART, () => {
      Array.from(this.doorsMap.values())
        .forEach((door) => {
          door.visible = true;
        });
      Array.from(this.trapTags.keys())
        .forEach((trapId) => {
          const trap = this.trapTags.get(trapId);
          this.trapTags.delete(trapId);
          this.scene.remove(trap);
        });
      $youlost.hide();
      $youwin.hide();
    });

    const animate = () => {
      requestAnimationFrame(animate);
      let closestDistanceToPlayer = Infinity;
      for (const ghostGroup of ghostGroups) {
        closestDistanceToPlayer = Math.min(closestDistanceToPlayer, ghostGroup.position.distanceTo(playerGroup.position));
      }
      playerMaterial.opacity = 1 - cunlerp(GHOST_RANGE_SIZE - 2, GHOST_RANGE_SIZE, closestDistanceToPlayer);
      this.renderer.render(this.scene, this.camera);
    };

    animate();

    return $(this.renderer.domElement);
  }

}

export default SceneWidget;
