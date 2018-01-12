/**
 * @author Christian Brel <ch.brel@gmail.com>
 * @author Vincent Forquet
 * @author Nicolas Forget
 */
import $ from 'jquery/dist/jquery.min';
import uuidV4 from 'uuid/v4';

import TUIOManager from './TUIOManager';

/**
 * Main class to manage TUIOWidget.
 *
 * @class TUIOWidget
 */
class TUIOWidget {

  /**
   * TUIOWidget constructor.
   *
   * @constructor
   * @param {number} x - TUIOWidget's upperleft corner abscissa.
   * @param {number} y - TUIOWidget's upperleft corner ordinate.
   * @param {number} width - TUIOWidget's width.
   * @param {number} height - TUIOWidget's height.
   */
  constructor(x, y, width, height) {
    this._id = uuidV4();
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;

    this._touches = {};
    this._tags = {};
    TUIOManager.getInstance().addWidget(this);
  }

  /**
   * TUIOWidget's id.
   *
   * @returns {string} TUIOWidget's id.
   */
  get id() { return this._id; }

  /**
   * TUIOWidget's upperleft corner abscissa getter.
   *
   * @returns {number} TUIOWidget's upperleft corner abscissa.
   */
  get x() { return this._x; }

  /**
   * TUIOWidget's upperleft corner ordinate getter.
   *
   * @returns {number} TUIOWidget's upperleft corner ordinate.
   */
  get y() { return this._y; }

  /**
   * TUIOWidget's width.
   *
   * @returns {number} TUIOWidget's width.
   */
  get width() { return this._width; }

  /**
   * TUIOWidget's height.
   *
   * @returns {number} TUIOWidget's height.
   */
  get height() { return this._height; }

  /**
   * TUIOWidget's touches.
   *
   * @returns {Object} TUIOWidget's touches.
   */
  get touches() { return this._touches; }

  /**
   * TUIOWidget's tags.
   *
   * @returns {Object} TUIOWidget's tags.
   */
  get tags() { return this._tags; }

  /**
   * Check if TUIOWidget is touched.
   *
   * @method isTouched
   * @param {number} x - Point's abscissa to test.
   * @param {number} y - Point's ordinate to test.
   */
  isTouched(x, y) {
    return (x >= this._x && x <= this._x + this._width && y >= this._y && y <= this._y + this._height);
  }

  /**
   * Call after a TUIOTouch creation.
   *
   * @method onTouchCreation
   * @param {TUIOTouch} tuioTouch - A TUIOTouch instance.
   */
  onTouchCreation(tuioTouch) {
    if (this.isTouched(tuioTouch.x, tuioTouch.y)) {
      this._touches = {
        ...this._touches,
        [tuioTouch.id]: tuioTouch,
      };
      this._touches[tuioTouch.id].addWidget(this);
    }
  }

  /**
   * Call after a TUIOTag creation.
   *
   * @method onTagCreation
   * @param {TUIOTag} tuioTag - A TUIOTag instance.
   */
  onTagCreation(tuioTag) {
    if (this.isTouched(tuioTag.x, tuioTag.y)) {
      this._tags = {
        ...this._tags,
        [tuioTag.id]: tuioTag,
      };
      this._tags[tuioTag.id].addWidget(this);
    }
  }

  /**
   * Call after a TUIOTouch deletion.
   *
   * @method onTouchDeletion
   * @param {number/string} tuioTouchId - TUIOTouch's id to delete.
   */
  onTouchDeletion(tuioTouchId) {
    if (typeof (this._touches[tuioTouchId]) !== 'undefined') {
      delete this._touches[tuioTouchId];
    }
  }

  /**
   * Call after a TUIOTag deletion.
   *
   * @method onTagDeletion
   * @param {number/string} tuioTagId - TUIOTag's id to delete.
   */
  onTagDeletion(tuioTagId) {
    if (typeof (this._tags[tuioTagId]) !== 'undefined') {
      delete this._tags[tuioTagId];
    }
  }

/* eslint-disable no-unused-vars,class-methods-use-this */
  /**
   * Call after a TUIOTouch update.
   *
   * @method onTouchUpdate
   * @param {TUIOTouch} tuioTouch - A TUIOTouch instance.
   */
  onTouchUpdate(tuioTouch) {
    // To override if needed.
  }

  /**
   * Call after a TUIOTag update.
   *
   * @method onTagUpdate
   * @param {TUIOTag} tuioTag - A TUIOTag instance.
   */
  onTagUpdate(tuioTag) {
    // To override if needed.
  }

  /**
   * Call to delete a widget
   *
   * @method deleteWidget
   */
  deleteWidget() {
    TUIOManager.getInstance().removeWidget(this);
  }

  /**
   * Call to add the widget to a DOM element
   *
   * @method addTo
   * @param {DOM-Elem} element - A TUIOTag instance.
   */
  addTo(element) {
    $(element).append(this._domElem);
  }

/* eslint-enable no-unused-vars,class-methods-use-this */
}

export default TUIOWidget;
