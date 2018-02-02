import $ from 'jquery/dist/jquery.min';
import TUIOWidget from 'tuiomanager/core/TUIOWidget';
import {WINDOW_HEIGHT, WINDOW_WIDTH} from 'tuiomanager/core/constants';
import * as THREE from 'three';
import WindowResize from 'three-window-resize';
import debounce from 'throttle-debounce/debounce';

import Protocol from '../Protocol';
import {cunlerp, randomHash} from '../utils';
import playerconfigs from '../../assets/playerconfigs.json';


const GHOST_RANGE_SIZE = 5;
const GHOST_NUMBER = 2;
const GHOST_COLORS = [0xff0000, 0x00ff00];

let ghostDirectionGeometry = new THREE.ConeGeometry(2, 5, 20);
let trapGeometry = new THREE.BoxGeometry(1, 2, 1);

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


function endScreenMessage(playerId, deathType) {
  if (deathType === 'trap') {
    return (`Hunter ${playerId} has killed the explorer with a trap`);
  } else {
    return (`Ghost ${playerId} has killed the explorer`);
  }
}


class SceneWidget extends TUIOWidget {

  constructor(socket) {
    super(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
    this.socket = socket;
    this._lastTouchesValues = {};
    this._lastTagsValues = {};
    this.raycaster = new THREE.Raycaster();
    this.doorsMap = new Map();
    this.lightsMap = new Map();
    this.directionTags = new Map();
    this.wallTags = new Map();
    this.playerEntities = [];
    for (let i = 0; i < GHOST_NUMBER; i++) {
      this.playerEntities.push({
        traps: [],
        walls: [],
      });
    }
    this.previousAngle = 0;
    this.rotateProgress = 0;

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
    console.log(tuioTag);
    if (tuioTag.id.toString() === playerconfigs[0].light || tuioTag.id.toString() === playerconfigs[1].light) {
      this.handleTagRotate(tuioTag);
    } else {
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
      if (tuioTag.id.toString() === playerconfigs[0].light || tuioTag.id.toString() === playerconfigs[1].light) {
        this.handleTagRotate(tuioTag);
      } else {
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


  handleTagRotate = debounce(500, (tuioTag) => {
    const ROTATE_POINTS = 1;

    const closestLight = () => {
      const viewPortCoord = new THREE.Vector2(
        ((tuioTag.x / this.width) * 2) - 1,
        -((tuioTag.y / this.height) * 2) + 1,
      );
      this.raycaster.setFromCamera(viewPortCoord, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children);
      const closestIntersect = intersects[0];
      console.log(closestIntersect);

      let minDistance = null;
      let closestLightId;
      for (const [key, value] of this.lightsMap.entries()) {
        const dist = Math.sqrt(Math.pow(closestIntersect.point.x - value.position.x, 2) + Math.pow(closestIntersect.point.z - value.position.z, 2));
        if (minDistance == null || dist < minDistance) {
          minDistance = dist;
          closestLightId = key;
        }
      }
      return closestLightId;
    };


    const angle = tuioTag.angle;
    if (angle !== this.previousAngle) {
      this.previousAngle = angle;
      this.rotateProgress++;
      console.log(this.rotateProgress);
      if (this.rotateProgress >= ROTATE_POINTS) {
        const lightId = closestLight();
        this.socket.emit(Protocol.LIGHT_UPDATE, {
          mode: 'off',
          lightId: lightId,

        });

        console.log(`Removing ${lightId}`);
        const lightElement = this.lightsMap.get(lightId);
        lightElement.material.opacity = 0.2;
        lightElement.children.forEach(c => c.visible = false);
        this.rotateProgress = 0;
      }
    }
  });

  handleTagMove = debounce(500, (tuioTag) => {
    console.log(`Tag released (id: ${tuioTag.id})`);
    const tagData = this.associateTag(tuioTag);
    console.log('Tag data', tagData);
    if (tagData !== null) {
      const hash = randomHash();
      if (tagData.type === 'direction') {
        const intersectPosition = this.tagToScenePosition(tuioTag);
        if (intersectPosition === null) return;
        intersectPosition.setY(1);
        let ghostDirection;
        if (this.directionTags.has(tuioTag.id)) {
          ghostDirection = this.directionTags.get(tuioTag.id);
        } else {
          const ghostDirectionMaterial = new THREE.MeshBasicMaterial({color: GHOST_COLORS[tagData.player]});
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
      } else if (tagData.type === 'reveal') {
        this.revealPlayer = true;
        setTimeout(() => {
          this.revealPlayer = false;
        }, 1000);
      } else if (tagData.type === 'wall') {
        const flooredIntersectPosition = this.tagToScenePosition(tuioTag, true);
        if (flooredIntersectPosition === null) return;
        flooredIntersectPosition.setY(1);
        const fakeWallGeometry = new THREE.BoxGeometry(1, 5, 1);
        const fakeWallMaterial = new THREE.MeshBasicMaterial({
          color: GHOST_COLORS[tagData.player],
          transparent: true,
          opacity: 0.7
        });
        const fakeWall = new THREE.Mesh(fakeWallGeometry, fakeWallMaterial);
        this.scene.add(fakeWall);
        const currentPlayerEntities = this.playerEntities[tagData.player];
        currentPlayerEntities.walls.unshift({id: hash, tagId: tuioTag.id, mesh: fakeWall});
        if (currentPlayerEntities.walls.length > 5) {
          const oldWall = currentPlayerEntities.walls.pop();
          this.scene.remove(oldWall.mesh);
        }
        fakeWall.position.copy(flooredIntersectPosition);
        this.socket.emit(Protocol.CREATE_WALL, {
          position: {
            x: flooredIntersectPosition.x,
            y: flooredIntersectPosition.y,
            z: flooredIntersectPosition.z,
          },
          player: tagData.player,
          name: hash,
        });
      } else if (tagData.type === 'trap') {
        const flooredIntersectPosition = this.tagToScenePosition(tuioTag, true);
        if (flooredIntersectPosition === null) return;
        flooredIntersectPosition.setY(1);
        const trapMaterial = new THREE.MeshBasicMaterial({color: GHOST_COLORS[tagData.player]});
        const ghostTrap = new THREE.Mesh(trapGeometry, trapMaterial);
        ghostTrap.position.copy(flooredIntersectPosition);
        this.scene.add(ghostTrap);
        const currentPlayerEntities = this.playerEntities[tagData.player];
        currentPlayerEntities.traps.unshift({id: hash, tagId: tuioTag.id, mesh: ghostTrap});
        if (currentPlayerEntities.traps.length > 3) {
          const oldTrap = currentPlayerEntities.traps.pop();
          this.scene.remove(oldTrap.mesh);
          this.socket.emit(Protocol.REMOVE_TRAP, {
            id: oldTrap.id,
          });
        }
        this.socket.emit(Protocol.CREATE_TRAP, {
          name: hash,
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
    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.setClearColor(0xffffff, 0);

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    new WindowResize(this.renderer, this.camera);

    this.camera.position.y = 50;
    this.camera.rotation.x = -Math.PI / 2;

    /*
        $(document).on('input', '.zoomSlider', () => {
          const zoomValue = $('.zoomSlider').val();
          $(".zoomSlider").val(zoomValue)
         console.log("J'irai chercher ton coeur, si tu l'emportes ailleurs");
         console.log(zoomValue)
         this.camera.position.y = 100 - zoomValue;
        });
        */

    this.walls = [];
    this.carpets = [];
    this.doors = [];
    this.lights = [];

    const playerGroup = new THREE.Group();
    const ghostGroups = new Array(GHOST_NUMBER).fill(null)
      .map(() => new THREE.Group());

    const jsonLoader = new THREE.JSONLoader();

    const playerConeGeometry = new THREE.ConeGeometry(0.3, 1.5, 8);
    this.playerMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.7,
    });
    const conePlayer = new THREE.Mesh(playerConeGeometry, this.playerMaterial);
    conePlayer.position.x = 3;
    conePlayer.position.y = 3;
    conePlayer.rotation.z = -Math.PI / 2;

    playerGroup.conePlayer = conePlayer;
    playerGroup.add(conePlayer);

    jsonLoader.load('assets/models/player.json',
      (geometry) => {
        const modelPlayer = new THREE.Mesh(geometry, this.playerMaterial);
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
      (geometry) => {
        for (const ghostGroup of ghostGroups) {
          const modelGhost = new THREE.Mesh(geometry, ghostGroup.ghostCone.material);
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

    jsonLoader.load('assets/models/direction.json',
      (geometry) => {
        ghostDirectionGeometry = geometry;
      }, (xhr) => {
        console.log(`Loading direction ${xhr.loaded / xhr.total * 100}% loaded`);
      }, (err) => {
        console.log('An error happened');
      },
    );

    jsonLoader.load('assets/models/trap.json',
      (geometry) => {
        trapGeometry = geometry;
      }, (xhr) => {
        console.log(`Loading direction ${xhr.loaded / xhr.total * 100}% loaded`);
      }, (err) => {
        console.log('An error happened');
      },
    );

    this.socket.emit(Protocol.REGISTER, {type: 'TABLE'});

    this.socket.emit(Protocol.GET_MAP_DEBUG, (mapData) => {
      const mapHeight = mapData.terrain.height;
      const mapWidth = mapData.terrain.width;

      const map = mapData.terrain.map;

      this.camera.position.x = mapWidth / 2;
      this.camera.position.z = mapHeight / 2;

      this.camera.position.y = 100;
      const computedCameraHeight = -(Math.max(mapWidth, mapHeight) / 2) * Math.tan(((this.camera.fov / 2) * this.camera.aspect * Math.PI / 180));
      console.log('CAMERA POSITION SET', this.camera.position.y, "could be", computedCameraHeight);

      const wallGeometry = new THREE.BoxGeometry(1, 5, 1);
      const wallMaterial = new THREE.MeshBasicMaterial({color: 0x252525});

      const carpetGeometry = new THREE.BoxGeometry(1, 1, 1);
      const carpetMaterial = new THREE.MeshBasicMaterial({color: 0x656565});

      const doorGeometry = new THREE.BoxGeometry(1, 5, 0.3);
      const doorMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});

      const lightGeometry = new THREE.SphereGeometry(0.5, 32, 32);
      const lightMaterial = new THREE.MeshBasicMaterial({color: 0xffff00, transparent: true});

      map[0].forEach((elt, index) => {
        const posX = Math.floor(index % mapWidth);
        const posY = Math.floor(index / mapWidth);
        if (elt === 'W') {
          let wallMat = wallMaterial.clone();
          const wall = new THREE.Mesh(wallGeometry, wallMat);
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

      mapData.objects.lights.forEach((lightData) => {
        const light = new THREE.Mesh(lightGeometry, lightMaterial.clone());
        light.position.x = lightData.position.x;
        light.position.z = lightData.position.z;
        light.position.y = 5;
        const spriteMaterial = new THREE.SpriteMaterial({
          map: new THREE.ImageUtils.loadTexture('../../assets/images/glow.png'),
          color: 0xaaaa00, transparent: false, blending: THREE.AdditiveBlending
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(3, 3, 3);
        light.add(sprite);
        this.lightsMap.set(lightData.id, light);
        this.scene.add(light);
        this.lights.push(light);
      });
    });

    this.socket.on(Protocol.PLAYER_POSITION_UPDATE, (data) => {
      playerGroup.position.x = data.position.x;
      playerGroup.position.z = data.position.z;
      playerGroup.rotation.y = -data.rotation.y;
    });

    this.socket.on(Protocol.GHOST_POSITION_UPDATE, (data) => {
      const ghostId = data.player || 0;
      const ghostGroup = ghostGroups[ghostId];
      ghostGroup.position.x = data.position.x;
      ghostGroup.position.z = data.position.z;
      ghostGroup.rotation.y = -data.rotation.y;
    });

    this.socket.on(Protocol.DOOR_UPDATE, (data) => {
      this.doors.get(data.name).visible = !open;
    });

    this.socket.on(Protocol.CREATE_TRAP, (data) => {
      const trapMaterial = new THREE.MeshBasicMaterial({color: GHOST_COLORS[data.player]});
      const ghostTrap = new THREE.Mesh(trapGeometry, trapMaterial);
      ghostTrap.position.copy(new THREE.Vector3(data.position.x, 1, data.position.z));
      this.scene.add(ghostTrap);
      const currentPlayerEntities = this.playerEntities[data.player];
      currentPlayerEntities.traps.unshift({id: data.name, tagId: '0', mesh: ghostTrap});
    });

    this.socket.on(Protocol.REMOVE_TRAP, (data) => {
      this.playerEntities.forEach((currPlayerEntities) => {
        const trapsToDelete = currPlayerEntities.traps.filter(trap => trap.id === data.id);
        trapsToDelete.forEach((trapToDelete) => {
          this.scene.remove(trapToDelete.mesh);
        });
        currPlayerEntities.traps = currPlayerEntities.traps.filter(trap => trap.id !== data.id);
      });
    });

    this.socket.on(Protocol.GAME_OVER, (data) => {
      if (data.won === true) {
        $youlost.show();
        scores.Explorer.value++;
        $('.scoreValues')
          .html(printScore());
      } else {
        if (data.killedBy === 0) {
          scores.Hunter1.value++;
        } else if (data.killedBy === 1) {
          scores.Hunter2.value++;
        }
        $youwin.find('.message').text(endScreenMessage(data.killedBy + 1, data.deathType));
        $youwin.show();

        $('.scoreValues')
          .html(printScore());
      }
    });

    this.socket.on(Protocol.RESTART, () => {
      this.revealPlayer = false;
      Array.from(this.directionTags.values()).forEach((direction) => {
        this.scene.remove(direction);
      });
      this.directionTags.clear();
      Array.from(this.doorsMap.values())
        .forEach((door) => {
          door.visible = true;
        });
      this.playerEntities.forEach((currPlayerEntities) => {
        currPlayerEntities.traps.forEach((trap) => {
          this.scene.remove(trap.mesh);
        });
        currPlayerEntities.traps = [];
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
      this.playerMaterial.opacity = 1 - cunlerp(GHOST_RANGE_SIZE - 2, GHOST_RANGE_SIZE, closestDistanceToPlayer);
      if (this.revealPlayer) this.playerMaterial.opacity = 1;
      this.renderer.render(this.scene, this.camera);
    };

    animate();

    return $(this.renderer.domElement);
  }

}

export default SceneWidget;
