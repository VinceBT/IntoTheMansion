import $ from 'jquery/dist/jquery.min';
import TUIOWidget from 'tuiomanager/core/TUIOWidget';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from 'tuiomanager/core/constants';
import { radToDeg } from 'tuiomanager/core/helpers';
import * as THREE from 'three';
import WindowResize from 'three-window-resize';

import mapData from '../assets/map/Apartment.json';

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
    let scene, camera, renderer;

    function animate() {
      requestAnimationFrame(animate);
      camera.rotation.x += 0.1;
      renderer.render(scene, camera);
    }

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();

    const height = mapData.terrain.height;
    const width = mapData.terrain.width;

    const map = mapData.terrain.map;

    renderer.setSize(window.innerWidth, window.innerHeight);

    this._domElem = $(renderer.domElement);

    const windowResize = new WindowResize(renderer, camera);

    const geometry = new THREE.BoxGeometry(1, 1, 0.2);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const wall = new THREE.Mesh(geometry, material);
    scene.add(wall);

    camera.position.y = 5;
    camera.rotateX(-Math.PI / 2);

    map.forEach((elt, index) => {
      // Add walls
    });

    animate();
  }
}

export default SceneWidget;
