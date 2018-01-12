import $ from 'jquery/dist/jquery.min';
import TUIOWidget from 'tuiomanager/core/TUIOWidget';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from 'tuiomanager/core/constants';
import { radToDeg } from 'tuiomanager/core/helpers';
import * as THREE from 'three';
import WindowResize from 'three-window-resize';

import mapData from '../assets/map/Apartment.json';

import status from '../assets/status.json';

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
   * @param {number} x - SceneWidget's upperleft coin abscissa.
   * @param {number} y - SceneWidget's upperleft coin ordinate.
   * @param {number} width - SceneWidget's width.
   * @param {number} height - SceneWidget's height.
   */
  constructor(x, y, width, height) {
    super(x, y, width, height);

    this._lastTouchesValues = {};
    this._lastTagsValues = {};

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
      const lastTouchValue = this._lastTouchesValues[tuioTouch.id];
      const diffX = tuioTouch.x - lastTouchValue.x;
      const diffY = tuioTouch.y - lastTouchValue.y;

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

      this.moveTo(newX, newY);
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

      this.moveTo(newX, newY, radToDeg(tuioTag.angle));
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
   * Move SceneWidget.
   *
   * @method moveTo
   * @param {string/number} x - New SceneWidget's abscissa.
   * @param {string/number} y - New SceneWidget's ordinate.
   * @param {number} angle - New SceneWidget's angle.
   */
  moveTo(x, y, angle = null) {
    this._x = x;
    this._y = y;
    this._domElem.css('left', `${x}px`);
    this._domElem.css('top', `${y}px`);
    if (angle !== null) {
      this._domElem.css('transform', `rotate(${angle}deg)`);
    }
  }

  buildScene() {
    let scene, camera, renderer, walls, floors, doors;
  
    function getRand(min, max) {
      return Math.floor(Math.random() * ((max - min) + 1)) + min;
    }

    let displayPlayer = false;
    var playerGeometry = new THREE.ConeGeometry( 2, 20, 8 );
    var playerMaterial = new THREE.MeshBasicMaterial( {color: 0x00ffff} );
    var player = new THREE.Mesh(playerGeometry, playerMaterial);

    const fullRemote = `http://${status.devRemote}:${status.port}`;
    const socket = require('socket.io-client')(fullRemote);
    socket.on('MAP_PLAYER_UPDATE', (content) => {
      player.position.x = content.x;
      player.position.z = content.y;

      if(!displayPlayer) {
        displayPlayer = true;
        scene.add(player);
      }
    });
    
    function animate() {
      
        
      requestAnimationFrame(animate);
      // camera.rotation.x += 0.01;
      // walls.rotation.x += 0.01;
      renderer.render(scene, camera);
    }

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });


    const height = mapData.terrain.height;
    const width = mapData.terrain.width;

    const map = mapData.terrain.map;

    renderer.setSize(window.innerWidth, window.innerHeight);

    this._domElem = $(renderer.domElement);

    const windowResize = new WindowResize(renderer, camera);

    const wall_geometry = new THREE.BoxGeometry(1, 5, 1);
    const wall_material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const wall = new THREE.Mesh(wall_geometry, wall_material);

    const floor_geometry = new THREE.BoxGeometry(1, 1, 1);
    const floor_material = new THREE.MeshBasicMaterial({ color: 0xC5C5C5 });
    const floor = new THREE.Mesh(wall_geometry, wall_material);

    const door_geometry = new THREE.BoxGeometry(1, 5, 1);
    const door_material = new THREE.MeshBasicMaterial({ color: 0x703F00 });
    const door = new THREE.Mesh(wall_geometry, wall_material);

    camera.position.y = 100;
    camera.position.x = width / 2;
    camera.position.z = height / 2;

    camera.rotation.x = -Math.PI / 2;

    console.log(camera);

    walls = new THREE.Group();
    floors = new THREE.Group();
    doors = new THREE.Group();


    map[0].forEach((elt, index) => {
      // Add walls, floor and doors

      if (elt == 'W') {
        const wall = new THREE.Mesh(wall_geometry, wall_material);
        wall.position.x = index % width * 1;
        wall.position.z = index / width * 1;
        walls.add(wall);
      } else if (elt == 'F') {
        const floor = new THREE.Mesh(floor_geometry, floor_material);
        floor.position.x = index % width * 1;
        floor.position.z = index / width * 1;
        floors.add(floor);
      } else if (elt == 'D') {
        console.log('porte');
        const door = new THREE.Mesh(door_geometry, door_material);
        door.position.x = index % width * 1;
        door.position.z = index / width * 1;
        doors.add(door);
      }
    });

    console.log(doors);
    scene.add(walls);
    scene.add(floors);
    scene.add(doors);

    animate();
  }
  
}

export default SceneWidget;
