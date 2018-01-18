import $ from 'jquery/dist/jquery.min';
import TUIOWidget from 'tuiomanager/core/TUIOWidget';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from 'tuiomanager/core/constants';
import * as THREE from 'three';
import WindowResize from 'three-window-resize';
import debounce from 'throttle-debounce/debounce';

import Protocol from '../Protocol';

/**
 * Main class to manage SceneWidget.
 *
 * @class SceneWidget
 * @extends TUIOWidget
 */
class SceneWidget extends TUIOWidget {
  /**
   * SceneWidget constructor.
   *
   * @constructor
   */
  constructor(socket) {
    super(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
    this.socket = socket;
    this._lastTouchesValues = {};
    this._lastTagsValues = {};
    this.raycaster = new THREE.Raycaster();
    this.trapTags = new Map();
    this.simplePressed = false;
    this.buildScene();
  }

  /**
   * SceneWidget's domElem.
   *
   * @returns {JQuery Object} SceneWidget's domElem.
   */
  get domElem() {
    return this._domElem;
  }

  /**
   * Call after a TUIOTouch creation.
   *
   * @method onTouchCreation
   * @param {TUIOTouch} tuioTouch - A TUIOTouch instance.
   */
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

  /**
   * Call after a TUIOTouch update.
   *
   * @method onTouchUpdate
   * @param {TUIOTouch} tuioTouch - A TUIOTouch instance.
   */
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

  /**
   * Call after a TUIOTag creation.
   *
   * @method onTagCreation
   * @param {TUIOTag} tuioTag - A TUIOTag instance.
   */
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

  /**
   * Call after a TUIOTag update.
   *
   * @method onTagUpdate
   * @param {TUIOTag} tuioTag - A TUIOTag instance.
   */
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

  handleTagMove = debounce(500, (tuioTag) => {
    console.log('Tag released');
    const viewPortCoord = new THREE.Vector2(
      ((tuioTag.x / this.width) * 2) - 1,
      -((tuioTag.y / this.height) * 2) + 1,
    );
    this.raycaster.setFromCamera(viewPortCoord, this.camera);
    const intersects = this.raycaster.intersectObjects(this.floors.children);
    console.log(intersects.length);
    if (intersects.length !== 0) {
      console.log(3);
      const intersect = intersects[0];
      const trapGeometry = new THREE.BoxGeometry(1, 2, 1);
      const trapMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const trap = new THREE.Mesh(trapGeometry, trapMaterial);
      const flooredPosition = new THREE.Vector3(
        Math.floor(intersect.point.x),
        Math.floor(intersect.point.y),
        Math.floor(intersect.point.z),
      );
      trap.position.copy(flooredPosition);
      console.log(flooredPosition);
      this.scene.add(trap);
      console.log(trap);
      this.socket.emit(Protocol.CREATE_TRAP, {
        x: flooredPosition.x,
        y: flooredPosition.y,
        z: flooredPosition.z,
      }, 'DeathTrap');
    }
  });

  buildScene() {
    let displayPlayer = false;
    let displayGhost = false;
    const playerGeometry = new THREE.ConeGeometry(0.5, 2, 8);
    const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.y = 3;
    player.rotation.z = Math.PI / 2;

    const ghostGeometry = new THREE.ConeGeometry(0.5, 2, 8);
    const ghostMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const ghost = new THREE.Mesh(ghostGeometry, ghostMaterial);
    ghost.position.y = 3;
    ghost.rotation.z = Math.PI / 2;

    this.socket.emit(Protocol.REGISTER, 'TABLE');

    this.socket.emit(Protocol.GET_MAP_DEBUG, (mapData) => {
      const mapHeight = mapData.terrain.height;
      const mapWidth = mapData.terrain.width;

      const map = mapData.terrain.map;

      this.mansion.position.x = -mapWidth / 2;
      this.mansion.position.z = -mapHeight / 2;

      this.floorOne = new THREE.Group();

      this.walls = new THREE.Group();
      this.floors = new THREE.Group();
      this.doors = new THREE.Group();

      const wallGeometry = new THREE.BoxGeometry(1, 5, 1);
      const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

      const carpetGeometry = new THREE.BoxGeometry(1, 1, 1);
      const carpetMaterial = new THREE.MeshBasicMaterial({ color: 0xC5C5C5 });

      const doorGeometry = new THREE.BoxGeometry(1, 5, 1);
      const doorMaterial = new THREE.MeshBasicMaterial({ color: 0x703F00 });

      map[0].forEach((elt, index) => {
        const posX = Math.floor(index % mapWidth);
        const posY = Math.floor(index / mapWidth);
        if (elt === 'W') {
          const wall = new THREE.Mesh(wallGeometry, wallMaterial.clone());
          wall.position.x = posX;
          wall.position.z = posY;
          this.walls.add(wall);
        } else if (elt === 'F') {
          const carpet = new THREE.Mesh(carpetGeometry, carpetMaterial);
          carpet.position.x = posX;
          carpet.position.z = posY;
          this.floors.add(carpet);
        } else if (elt === 'D') {
          const door = new THREE.Mesh(doorGeometry, doorMaterial);
          door.position.x = posX;
          door.position.z = posY;
          this.doors.add(door);
        }
      });
      this.floorOne.add(this.walls);
      this.floorOne.add(this.floors);
      this.floorOne.add(this.doors);
      this.mansion.add(this.floorOne);
    });

    this.socket.on(Protocol.PLAYER_POSITION_UPDATE, (data) => {
      player.position.x = data.position.x;
      player.position.z = data.position.z;
      player.rotation.y = -data.rotation.y;
      if (!displayPlayer) {
        displayPlayer = true;
        this.mansion.add(player);
      }
    });

    this.socket.on(Protocol.GHOST_POSITION_UPDATE, (data) => {
      ghost.position.x = data.position.x;
      ghost.position.z = data.position.z;
      ghost.rotation.y = -data.rotation.y;
      if (!displayGhost) {
        displayGhost = true;
        this.mansion.add(ghost);
      }
    });

    const animate = () => {
      requestAnimationFrame(animate);
      // this.camera.position.y += 0.02;
      // this.floorOne.rotation.y += 0.01;
      this.renderer.render(this.scene, this.camera);
    };

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0xffffff, 0);

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this._domElem = $(this.renderer.domElement);

    new WindowResize(this.renderer, this.camera);

    this.camera.position.y = 100;
    this.camera.rotation.x = -Math.PI / 2;

    this.mansion = new THREE.Group();
    this.scene.add(this.mansion);

    animate();
  }

}

export default SceneWidget;
