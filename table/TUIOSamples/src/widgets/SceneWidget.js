import $ from 'jquery/dist/jquery.min';
import TUIOWidget from 'tuiomanager/core/TUIOWidget';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from 'tuiomanager/core/constants';
import * as THREE from 'three';
import TWEEN from 'tween.js';
import Color from 'color';
import WindowResize from 'three-window-resize';
import debounce from 'throttle-debounce/debounce';

import Protocol from '../Protocol';
import { cunlerp, randomHash } from '../utils';
import playerconfigs from '../../assets/playerconfigs.json';
import SoundService from '../services/SoundService';
import ModelServices from '../services/ModelServices';

const DEBUG_MAP_LOAD = false;

const GHOST_RANGE_SIZE = 6;
const GHOST_NUMBER = 2;
const GHOST_AVAILABLE_COLORS = [0xff0000, 0x00ff00, 0xffff00, 0xff00ff, 0x0000ff];
const GHOST_COLORS = GHOST_AVAILABLE_COLORS.slice(0, GHOST_NUMBER);
// const GHOST_COLORS = shuffleArray(GHOST_AVAILABLE_COLORS).slice(0, GHOST_NUMBER);
const EXPLORER_COLOR = 0x00ffff;

const DISTANCE_THRESHOLD = 0.1;

let ghostDirectionGeometry = new THREE.ConeGeometry(2, 5, 20);
let trapGeometry = new THREE.BoxGeometry(1, 2, 1);
let screamerGeometry = new THREE.BoxGeometry(1, 2, 1);

const lightGeometry = new THREE.SphereGeometry(0.35, 32, 32);
const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });

let explorerScore = 0;
const ghostScores = Array(GHOST_NUMBER)
  .fill(0);

const textureLoader = new THREE.TextureLoader();

function printScore($el) {
  $el.empty();
  const immExplorerColor = new Color(EXPLORER_COLOR);
  $el.append(`
    <div class="scoreValue" style="color: ${immExplorerColor.hex()}; background-color: ${immExplorerColor.alpha(0.2)
    .rgb()}">
        <div class="avatar avatarExplorer"/>
        <p>Explorer: ${explorerScore}</p>
    </div>
  `);
  ghostScores.forEach((score, i) => {
    const immGhostColor = new Color(GHOST_COLORS[i]);
    $el.append(`
      <div class="scoreValue" style="color: ${immGhostColor.hex()}; background-color: ${immGhostColor.alpha(0.2)
      .rgb()}">
          <div class="avatar avatarHunter1"/>
          <p>Ghost ${i + 1}: ${score}</p>
      </div>
    `);
  });
}

const $interactions = $('<div class="absolutefill interactions">');
const $hud = $(`
<div class="absolutefill hud">
  <div class="absolutefill hud-wrapper reversed"></div>
  <div class="absolutefill hud-wrapper"></div>
</div>
`);

$hud.find('.hud-wrapper')
  .append(`
  <div class="scoreInfo">
    <div class="scoreText">Score</div>
    <div class="scoreValues"></div>
  </div>
`)
  .append(`
  <div class="revealSpell">
    <div class="icon"></div>
    <div class="text">Scream ready</div>
  </div>
`);

printScore($hud.find('.scoreValues'));

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

const playerGroup = new THREE.Group();
const ghostGroups = new Array(GHOST_NUMBER).fill(null)
  .map(() => new THREE.Group());

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
    this.previousPosition = [0, 0];
    for (let i = 0; i < GHOST_NUMBER; i++) {
      this.playerEntities.push({
        traps: [],
        walls: [],
      });
    }
    this.previousAngle = 0;
    this.rotateProgress = 0;
    this.canRevealPlayer = true;
    this.revealPlayer = false;

    const $scene = this.buildScene();
    const $container = $('<div class="container">');
    $container.append($scene);
    // $container.append($interactions);
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
        const dist = Math.sqrt(
          Math.pow(closestIntersect.point.x - value.position.x, 2) +
          Math.pow(closestIntersect.point.z - value.position.z, 2),
        );
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
          id: lightId,
        });
        SoundService.play('switch_off');
        console.log(`[LIGHTS] Shutting off light ${lightId}`);
        const lightElement = this.lightsMap.get(lightId);
        lightElement.model.material.opacity = 0.2;
        lightElement.children.forEach((c) => {
          if (lightElement.model !== c) c.visible = false;
        });
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
          const ghostDirectionMaterial = new THREE.MeshBasicMaterial({ color: GHOST_COLORS[tagData.player] });
          ghostDirection = new THREE.Mesh(ghostDirectionGeometry, ghostDirectionMaterial);
          this.scene.add(ghostDirection);
          this.directionTags.set(tuioTag.id, ghostDirection);
        }
        ghostDirection.position.copy(intersectPosition);
        this.socket.emit(Protocol.REQUEST_GHOST_MOVEMENT, {
          id: tuioTag.id,
          player: tagData.player,
          position: [intersectPosition.x, intersectPosition.z],
        });
      } else if (tagData.type === 'reveal') {
        if (this.canRevealPlayer) {
          this.canRevealPlayer = false;
          $('.revealSpell')
            .addClass('disabled')
            .find('.text')
            .text('Scream charging');
          SoundService.play('reveal');
          for (const ghostGroup of ghostGroups) {
            const originalScale = ghostGroup.modelGhost.scale.clone();
            new TWEEN.Tween(ghostGroup.modelGhost.scale)
              .to({ x: 2, y: 2, z: 2 }, 200)
              .easing(TWEEN.Easing.Quadratic.Out)
              .chain(new TWEEN.Tween(ghostGroup.modelGhost.scale)
                .to(originalScale, 200)
                .easing(TWEEN.Easing.Quadratic.Out))
              .start();
          }
          setTimeout(() => {
            this.revealPlayer = true;
            SoundService.play('screamer_trigger');
            setTimeout(() => {
              this.revealPlayer = false;
              setTimeout(() => {
                this.canRevealPlayer = true;
                $('.revealSpell')
                  .removeClass('disabled')
                  .find('.text')
                  .text('Scream ready');
                SoundService.play('spell');
                this.socket.emit(Protocol.GHOST_SCREAM);
              }, 10000);
            }, 2000);
          }, 500);
        }
      } else if (tagData.type === 'wall') {
        const flooredIntersectPosition = this.tagToScenePosition(tuioTag, true);
        if (flooredIntersectPosition === null) return;
        flooredIntersectPosition.setY(1);
        const fakeWallGeometry = new THREE.BoxGeometry(1, 10, 1);
        const fakeWallMaterial = new THREE.MeshBasicMaterial({
          color: GHOST_COLORS[tagData.player],
          transparent: true,
          opacity: 0.7,
        });
        const fakeWall = new THREE.Mesh(fakeWallGeometry, fakeWallMaterial);
        this.scene.add(fakeWall);
        const currentPlayerEntities = this.playerEntities[tagData.player];
        currentPlayerEntities.walls.unshift({ id: hash, tagId: tuioTag.id, mesh: fakeWall });
        if (currentPlayerEntities.walls.length > 5) {
          const oldWall = currentPlayerEntities.walls.pop();
          this.scene.remove(oldWall.mesh);
        }
        fakeWall.position.copy(flooredIntersectPosition);
        this.socket.emit(Protocol.CREATE_WALL, {
          id: hash,
          position: [flooredIntersectPosition.x, flooredIntersectPosition.z],
          player: tagData.player,
        });
      } else if (tagData.type === 'trap') {
        const flooredIntersectPosition = this.tagToScenePosition(tuioTag, true);
        if (flooredIntersectPosition === null) return;
        flooredIntersectPosition.setY(1);
        const trapMaterial = new THREE.MeshBasicMaterial({ color: GHOST_COLORS[tagData.player], transparent: true, opacity: 1 });
        const ghostTrap = new THREE.Mesh(trapGeometry, trapMaterial);
        ghostTrap.position.copy(flooredIntersectPosition);
        ghostTrap.rotation.y = Math.PI / 4;
        this.scene.add(ghostTrap);
        const currentPlayerEntities = this.playerEntities[tagData.player];
        currentPlayerEntities.traps.unshift({ id: hash, tagId: tuioTag.id, mesh: ghostTrap, type: 'DeathTrap' });
        SoundService.play('trap_setup');
        if (currentPlayerEntities.traps.length > 3) {
          const oldTrap = currentPlayerEntities.traps.pop();
          if (oldTrap.type === 'ScreamerType') {
            oldTrap.mesh.material.color.setHex(0xFFFFFF);
            this.doorsMap.get(oldTrap.door).trapped = false;
          } else {
            new TWEEN.Tween(oldTrap.mesh.scale)
              .to({ x: 0, y: 0, z: 0 }, 400)
              .easing(TWEEN.Easing.Quadratic.Out)
              .onComplete(() => {
                this.scene.remove(oldTrap.mesh);
              })
              .start();
          }
          this.socket.emit(Protocol.REMOVE_TRAP, {
            id: oldTrap.id,
          });
        }
        currentPlayerEntities.traps.forEach((trap, i) => {
          if (i === 0) {
            trap.mesh.material.opacity = 1;
          } else if (i === 1) {
            trap.mesh.material.opacity = 0.75;
          } else {
            trap.mesh.material.opacity = 0.5;
          }
        });
        this.socket.emit(Protocol.CREATE_TRAP, {
          id: hash,
          player: tagData.player,
          position: [flooredIntersectPosition.x, flooredIntersectPosition.z],
          type: 'DeathTrap',
        });
      } else if (tagData.type === 'screamer') {
        const flooredIntersectPosition = this.tagToScenePosition(tuioTag, true);
        if (flooredIntersectPosition === null) return;
        flooredIntersectPosition.setY(1);

        const closestDoor = () => {
          const viewPortCoord = new THREE.Vector2(
            ((tuioTag.x / this.width) * 2) - 1,
            -((tuioTag.y / this.height) * 2) + 1,
          );
          this.raycaster.setFromCamera(viewPortCoord, this.camera);
          const intersects = this.raycaster.intersectObjects(this.scene.children);
          const closestIntersect = intersects[0];
          let minDistance = null;
          let closestDoorId;
          for (const [key, value] of this.doorsMap.entries()) {
            const dist = Math.sqrt(Math.pow(closestIntersect.point.x - value.mesh.position.x, 2) + Math.pow(closestIntersect.point.z - value.mesh.position.z, 2));
            if (minDistance == null || dist < minDistance) {
              minDistance = dist;
              closestDoorId = key;
            }
          }
          return closestDoorId;
        };


        const trappedDoorId = closestDoor();
        console.log('Creating door trap');
        console.log(this.doorsMap.get(trappedDoorId));
        if (!this.doorsMap.get(trappedDoorId).trapped) {
          this.doorsMap.get(trappedDoorId).trapped = true;
          this.doorsMap.get(trappedDoorId)
            .mesh
            .material
            .color
            .setHex(GHOST_COLORS[tagData.player]);


          const currentPlayerEntities = this.playerEntities[tagData.player];
          currentPlayerEntities.traps.unshift({
            id: hash,
            tagId: tuioTag.id,
            mesh: this.doorsMap.get(trappedDoorId).mesh,
            type: 'ScreamerType',
            door: trappedDoorId,
          });
          SoundManager.play('trap_trigger');
          if (currentPlayerEntities.traps.length > 3) {
            const oldTrap = currentPlayerEntities.traps.pop();
            if (oldTrap.type === 'ScreamerType') {
              oldTrap.mesh.material.color.setHex(0xFFFFFF);
              this.doorsMap.get(oldTrap.door).trapped = false;
            } else {
              this.scene.remove(oldTrap.mesh);
            }
            this.socket.emit(Protocol.REMOVE_TRAP, {
              id: oldTrap.id,
            });
          }
          this.socket.emit(Protocol.CREATE_TRAP, {
            name: hash,
            player: tagData.player,
            position: [flooredIntersectPosition.x, flooredIntersectPosition.z],
            type: 'ScreamerTrap',
            door: trappedDoorId,
          });
        }

        /*
        const flooredIntersectPosition = this.tagToScenePosition(tuioTag, true);
        if (flooredIntersectPosition === null) return;
        flooredIntersectPosition.setY(1);
        const trapMaterial = new THREE.MeshBasicMaterial({color: GHOST_COLORS[tagData.player]});
        const ghostTrap = new THREE.Mesh(screamerGeometry, trapMaterial);
        ghostTrap.position.copy(flooredIntersectPosition);
        this.scene.add(ghostTrap);
        const currentPlayerEntities = this.playerEntities[tagData.player];
        currentPlayerEntities.traps.unshift({id: hash, tagId: tuioTag.id, mesh: ghostTrap, type: 'ScreamerTrap'});
        SoundService.play('screamer_setup');
        if (currentPlayerEntities.traps.length > 3) {
          const oldTrap = currentPlayerEntities.traps.pop();
          this.scene.remove(oldTrap.mesh);
          this.socket.emit(Protocol.REMOVE_TRAP, {
            id: oldTrap.id,
          });
        }
        this.socket.emit(Protocol.CREATE_TRAP, {
          id: hash,
          player: tagData.player,
          position: [flooredIntersectPosition.x, flooredIntersectPosition.z],
          type: 'ScreamerTrap',
        });
        */
      }
    }
  });

  _handlePlayerMove = debounce(500, () => {
    SoundService.volume('player_move', 0);
  });

  buildScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0xffffff, 0);

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    new WindowResize(this.renderer, this.camera);

    this.camera.position.y = 90;
    this.camera.rotation.x = -Math.PI / 2;

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    /*
    $(document).on('input', '.zoomSlider', () => {
      const zoomValue = $('.zoomSlider').val();
      $(".zoomSlider").val(zoomValue)
     console.log("J'irai chercher ton coeur, si tu l'emportes ailleurs");
     console.log(zoomValue)
     this.camera.position.y = 100 - zoomValue;
    });
    */

    const playerConeGeometry = new THREE.ConeGeometry(0.3, 1.5, 8);
    this.playerMaterial = new THREE.MeshBasicMaterial({
      color: EXPLORER_COLOR,
      transparent: true,
      opacity: 0.7,
    });
    const conePlayer = new THREE.Mesh(playerConeGeometry, this.playerMaterial);
    conePlayer.position.x = 3;
    conePlayer.position.y = 3;
    conePlayer.rotation.z = -Math.PI / 2;

    playerGroup.conePlayer = conePlayer;
    playerGroup.add(conePlayer);

    ModelServices.load('player')
      .then((geometry) => {
        const modelPlayer = new THREE.Mesh(geometry, this.playerMaterial);
        modelPlayer.position.y = 3;
        modelPlayer.scale.set(1.1, 1.1, 1.1);
        playerGroup.modelPlayer = modelPlayer;
        playerGroup.add(modelPlayer);
      });

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
      const ghostCone = ghostGroup.ghostCone = new THREE.Mesh(ghostConeGeometry, ghostMaterial);
      ghostCone.position.x = 3;
      ghostCone.position.y = 3;
      ghostCone.rotation.z = -Math.PI / 2;
      ghostGroup.add(ghostCone);
      const ghostRangeMaterial = new THREE.MeshBasicMaterial({
        color: ghostColor,
        opacity: 0.1,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const ghostRange = ghostGroup.ghostRange = new THREE.Mesh(ghostRangeGeometry, ghostRangeMaterial);
      ghostRange.position.y = 1;
      ghostRange.rotation.x = -Math.PI / 2;
      ghostGroup.add(ghostRange);
      const pointLight = ghostGroup.pointLight = new THREE.PointLight(ghostColor, 1, 8, 1);
      pointLight.position.y = 1;
      ghostGroup.add(pointLight);
      this.scene.add(ghostGroup);
      ghostGroup.position.x = (ghostGroups.indexOf(ghostGroup) + 1) * 3;
    }

    ModelServices.load('ghost')
      .then((geometry) => {
        for (const ghostGroup of ghostGroups) {
          const modelGhost = new THREE.Mesh(geometry, ghostGroup.ghostCone.material);
          modelGhost.position.y = 3;
          modelGhost.scale.set(0.8, 0.8, 0.8);
          ghostGroup.modelGhost = modelGhost;
          ghostGroup.add(modelGhost);
        }
      });

    ModelServices.load('direction')
      .then((geometry) => {
        ghostDirectionGeometry = geometry;
      });

    ModelServices.load('trap')
      .then((geometry) => {
        trapGeometry = geometry;
      });

    ModelServices.load('screamer')
      .then((geometry) => {
        screamerGeometry = geometry;
      });

    this.socket.emit(Protocol.REGISTER, { type: 'TABLE' });

    const onMapLoad = (mapData) => {
      const mapHeight = mapData.terrain.height;
      const mapWidth = mapData.terrain.width;

      const map = mapData.terrain.map;

      this.camera.position.x = mapWidth / 2;
      this.camera.position.z = mapHeight / 2;

      playerGroup.position.x = mapData.player.spawn[0];
      playerGroup.position.z = mapData.player.spawn[1];

      mapData.ghosts.forEach((ghost, i) => {
        if (i >= ghostGroups.length) return;
        const ghostGroup = ghostGroups[i];
        ghostGroup.position.x = ghost.spawn[0];
        ghostGroup.position.z = ghost.spawn[1];
      });

      // console.log(playerGroup.position);

      const cameraWidthMinDistance = ((mapWidth / 2) + 0.5) / Math.tan(this.camera.fov * this.camera.aspect / 2 * Math.PI / 180);
      const cameraHeightMinDistance = ((mapHeight / 2) + 0.5) / Math.tan((this.camera.fov) / 2 * Math.PI / 180);
      this.camera.position.y = Math.max(cameraWidthMinDistance, cameraHeightMinDistance) + 10;
      // this.camera.position.y = 30;
      console.log(this.camera, 'CAMERA COMPUTED ', cameraWidthMinDistance, cameraHeightMinDistance);

      SoundService.play('player_move');
      SoundService.volume('player_move', 0);

      SoundService.play('radio');
      SoundService.volume('radio', 0.05);

      const wallGeometry = new THREE.BoxGeometry(1, 8, 1);
      const wallMaterial = new THREE.MeshLambertMaterial({
        color: 0x252525,
      });

      const floorGeometry = new THREE.BoxGeometry(1, 0.1, 1);
      const floorMaterial = new THREE.MeshLambertMaterial({
        color: 0x444444,
      });

      const doorGeometry = new THREE.BoxGeometry(1, 8, 0.3);
      const doorMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

      map.forEach((elt, index) => {
        const posX = Math.floor(index % mapWidth);
        const posY = Math.floor(index / mapWidth);
        if (elt === 'W') {
          const wallMat = wallMaterial.clone();
          const wall = new THREE.Mesh(wallGeometry, wallMat);
          wall.position.x = posX;
          wall.position.z = posY;
          wall.wall = true;
          this.scene.add(wall);
        } else if (elt === 'F') {
          const floor = new THREE.Mesh(floorGeometry, floorMaterial);
          floor.position.x = posX;
          floor.position.z = posY;
          floor.carpet = true;
          this.scene.add(floor);
        } else if (elt === 'D') {
          const floor = new THREE.Mesh(floorGeometry, floorMaterial.clone());
          floor.material.color.multiplyScalar(0.95);
          floor.position.x = posX;
          floor.position.z = posY;
          floor.carpet = true;
          this.scene.add(floor);
        }
      });

      mapData.objects.doors.forEach((doorData) => {
        const door = new THREE.Mesh(doorGeometry, doorMaterial.clone());
        door.position.x = doorData.position[0];
        door.position.z = doorData.position[1];
        if (doorData.align === 'v') {
          door.rotation.y = Math.PI / 2;
        }
        this.doorsMap.set(doorData.id, { mesh: door, trapped: false });
        this.scene.add(door);
      });

      mapData.objects.lights.forEach((lightData) => {
        const light = new THREE.Object3D();
        light.position.x = lightData.position[0];
        light.position.z = lightData.position[1];
        light.position.y = 8;
        const texLoader = new THREE.TextureLoader();
        const spriteMaterial = new THREE.SpriteMaterial({
          map: texLoader.load('../../assets/images/glow.png'),
          color: 0xaaaa00,
          transparent: false,
          blending: THREE.AdditiveBlending,
        });
        const sprite = light.sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(2, 2, 2);
        const pointLight = light.pointLight = new THREE.PointLight(0xffffff, 1, 13, 1);
        pointLight.position.y = -4;
        const lightModel = light.model = new THREE.Mesh(lightGeometry, lightMaterial.clone());
        light.add(lightModel);
        light.add(pointLight);
        light.add(sprite);
        this.lightsMap.set(lightData.id, light);
        this.scene.add(light);
      });
    };

    if (DEBUG_MAP_LOAD) {
      this.socket.emit(Protocol.GET_MAP_DEBUG, onMapLoad);
    } else {
      this.socket.emit(Protocol.GET_MAP, 'mansion1', onMapLoad);
    }

    this.socket.on(Protocol.PLAYER_POSITION_UPDATE, (playerPositionData) => {
      playerGroup.position.x = playerPositionData.position[0];
      playerGroup.position.z = playerPositionData.position[1];
      // console.log(playerGroup.position.distanceTo(new THREE.Vector3({ ...playerPositionData.position, y: 0 })));
      playerGroup.rotation.y = -playerPositionData.rotation.y;

      const distance = Math.sqrt(Math.pow(playerPositionData.position[0] - this.previousPosition[0], 2) + Math.pow(playerPositionData.position[1] - this.previousPosition[1], 2));
      // console.log(distance);
      if (distance > DISTANCE_THRESHOLD) {
        SoundService.volume('player_move', 0.7);
        this._handlePlayerMove();
      }
      this.previousPosition = [...playerPositionData.position];
    });

    this.socket.on(Protocol.GHOST_POSITION_UPDATE, (ghostData) => {
      const ghostId = ghostData.player || ghostData.id || 0;
      const ghostGroup = ghostGroups[ghostId];
      ghostGroup.position.x = ghostData.position[0];
      ghostGroup.position.z = ghostData.position[1];
      ghostGroup.rotation.y = -ghostData.rotation.y;
    });

    this.socket.on(Protocol.DOOR_UPDATE, (doorData) => {
      if (doorData.open) {
        SoundService.play('door_open');
      } else {
        SoundService.play('door_close');
      }
      this.doorsMap.get(doorData.id).mesh.visible = !doorData.open;
    });

    this.socket.on(Protocol.LIGHT_UPDATE, (lightData) => {
      if (lightData.open) {
        SoundService.play('switch_on');
      } else {
        SoundService.play('switch_off');
      }
      const lightElement = this.lightsMap.get(lightData.id);
      lightElement.model.material.opacity = 1;
      lightElement.children.forEach((c) => {
        if (lightElement.model !== c) c.visible = lightData.open;
      });
    });

    this.socket.on(Protocol.CREATE_TRAP, (trapData) => {
      const trapMaterial = new THREE.MeshBasicMaterial({ color: GHOST_COLORS[trapData.player] });
      const ghostTrap = new THREE.Mesh(trapData.type === 'DeathTrap' ? trapGeometry : screamerGeometry, trapMaterial);
      ghostTrap.position.x = trapData.position[0];
      ghostTrap.position.y = 1;
      ghostTrap.position.z = trapData.position[1];
      ghostTrap.rotation.y = Math.PI / 4;
      this.scene.add(ghostTrap);
      const currentPlayerEntities = this.playerEntities[trapData.player];
      currentPlayerEntities.traps.unshift({ id: trapData.name, tagId: '0', mesh: ghostTrap, type: trapData.type });
      SoundService.play(trapData.type === 'DeathTrap' ? 'trap_setup' : 'screamer_setup');
    });

    this.socket.on(Protocol.REMOVE_TRAP, (trapData) => {
      this.playerEntities.forEach((currPlayerEntities) => {
        const trapsToDelete = currPlayerEntities.traps.filter(trap => trap.id === trapData.id);
        if (trapsToDelete.length > 0) {
          trapsToDelete.forEach((trapToDelete) => {
            this.scene.remove(trapToDelete.mesh);
          });
          SoundService.play('trap_destroy');
        }
        currPlayerEntities.traps = currPlayerEntities.traps.filter(trap => trap.id !== trapData.id);
      });
    });

    this.socket.on(Protocol.TRAP_TRIGGERED, (trapData) => {
      if (!trapData) throw new Error('Trap data is undefined');
      if (!trapData.id) throw new Error('Trap id is undefined');
      let matched = this.playerEntities[0].traps.find(trap => trap.id === trapData.id);
      if (matched === undefined) matched = this.playerEntities[1].traps.find(trap => trap.id === trapData.id);
      console.log(matched);
      if (matched !== undefined) {
        if (matched.type === 'ScreamerTrap') {
          console.log('Revealing player');
          this.revealPlayer = true;
          setTimeout(() => {
            this.revealPlayer = false;
          }, 5000);
          SoundService.play('screamer_trigger');
        } else if (matched.type === 'DeathTrap') {
          SoundService.play('trap_trigger');
        }
      }
      this.playerEntities.forEach((currPlayerEntities) => {
        const trapsToDelete = currPlayerEntities.traps.filter(trap => trap.id === trapData.id);
        if (trapsToDelete.length > 0) {
          trapsToDelete.forEach((trapToDelete) => {
            this.scene.remove(trapToDelete.mesh);
          });
        }
        currPlayerEntities.traps = currPlayerEntities.traps.filter(trap => trap.id !== trapData.id);
      });
    });

    this.socket.on(Protocol.GAME_OVER, (gameOverData) => {
      const $scoreValues = $('.scoreValues');
      if (gameOverData.won === true) {
        SoundService.play('ghost_lose');
        explorerScore++;
        printScore($scoreValues);
        $youlost.show();
      } else {
        SoundService.play('ghost_win');
        const killerGhostId = gameOverData.killedBy || 0;
        ghostScores[killerGhostId] = (ghostScores[killerGhostId]) + 1;
        if (gameOverData.deathType === 'trap') {
          $youwin.find('.message')
            .text(`Ghost ${gameOverData.killedBy + 1} has killed the explorer with a trap`);
        } else {
          $youwin.find('.message')
            .text(`Ghost ${gameOverData.killedBy + 1} has eaten the explorer`);
        }
        printScore($scoreValues);
        $youwin.show();
      }
    });

    this.socket.on(Protocol.RESTART, () => {
      this.revealPlayer = false;
      Array.from(this.directionTags.values())
        .forEach((direction) => {
          this.scene.remove(direction);
        });
      this.directionTags.clear();
      Array.from(this.doorsMap.values())
        .forEach((door) => {
          door.mesh.visible = true;
        });
      Array.from(this.lightsMap.values())
        .forEach((lightElement) => {
          lightElement.model.material.opacity = 1;
          lightElement.children.forEach((c) => {
            if (lightElement.model !== c) c.visible = true;
          });
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

    const animate = (time) => {
      requestAnimationFrame(animate);
      TWEEN.update();
      let closestDistanceToPlayer = Infinity;
      for (let i = 0; i < ghostGroups.length; i++) {
        const ghostGroup = ghostGroups[i];
        if (ghostGroup.modelGhost) {
          ghostGroup.modelGhost.position.y = 5 + 0.3 * Math.sin(((Math.PI / 2) * i) + (time * 0.002));
        }
        closestDistanceToPlayer = Math.min(closestDistanceToPlayer, ghostGroup.position.distanceTo(playerGroup.position));
      }
      this.playerMaterial.opacity = 1 - cunlerp(GHOST_RANGE_SIZE - 3, GHOST_RANGE_SIZE, closestDistanceToPlayer);
      if (playerGroup.modelPlayer) {
        playerGroup.modelPlayer.position.y = 3 + 0.2 * Math.sin(time * 0.001);
        playerGroup.modelPlayer.position.z = 0.2 * Math.sin(time * 0.001);
      }
      const INTENSITY_DELTA = 0.12;
      Array.from(this.lightsMap.values())
        .forEach((light) => {
          light.pointLight.intensity = (1 - INTENSITY_DELTA) + (Math.random() * INTENSITY_DELTA);
          light.sprite.scale.copy(new THREE.Vector3(2, 2, 2).multiplyScalar((1 - INTENSITY_DELTA) + (Math.random() * 0.5 * INTENSITY_DELTA)));
        });
      if (this.revealPlayer) this.playerMaterial.opacity = 1;
      this.renderer.render(this.scene, this.camera);
    };

    animate();

    return $(this.renderer.domElement);
  }

}

export default SceneWidget;
