import $ from 'jquery/dist/jquery.min';
import TUIOWidget from 'tuiomanager/core/TUIOWidget';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from 'tuiomanager/core/constants';
import * as THREE from 'three';
import WindowResize from 'three-window-resize';
import debounce from 'throttle-debounce/debounce';

import Protocol from '../Protocol';
import { cunlerp, randomHash } from '../Utils';
import playerconfigs from '../../assets/playerconfigs.json';



const $zoom = $(`
<div class="absolutefill hud">
  <div class="scoreInfo">
    <div>
    <input class="zoomSlider" min="0" max="50" type="range"/>
    </div>

  </div>
  <div class="scoreInfo reversed bottomAbsolute">

    <div>
    <input class="zoomSlider" min="0" max="50" type="range"/>
    </div>

  </div>
</div>
`)




class ZoomWidget extends TUIOWidget {
    /**
   * ImageWidget constructor.
   *
   * @constructor
   * @param {number} x - ImageWidget's upperleft coin abscissa.
   * @param {number} y - ImageWidget's upperleft coin ordinate.
   * @param {number} width - ImageWidget's width.
   * @param {number} height - ImageWidget's height.
   */
  constructor(x, y, width, height) {
    super(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
    const $container = $('<div class="zoomContainer">');
    $container.append($zoom);
    this._domElem = $container;


  }

  /**
   * ImageWidget's domElem.
   *
   * @returns {JQuery Object} ImageWidget's domElem.
   */
  get domElem() { return this._domElem; }

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

      console.log(tuioTouch);
      if(tuioTouch.x < 300 && tuioTouch.x > 10){
        if(tuioTouch.y > 300 && tuioTouch.y < 800){
            console.log((tuioTouch.y - 300) / 10);
        }
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
}



export default ZoomWidget;
