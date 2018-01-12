/**
 * @author Christian Brel <ch.brel@gmail.com>
 * @author Vincent Forquet
 * @author Nicolas Forget
 */

import io from 'socket.io-client';

import TUIOTouch from './TUIOTouch';
import TUIOTag from './TUIOTag';

import {
  CREATE_SOCKETIO_ACTION, UPDATE_SOCKETIO_ACTION, DELETE_SOCKETIO_ACTION,
  TOUCH_SOCKETIO_TYPE, TAG_SOCKETIO_TYPE,
  WINDOW_WIDTH, WINDOW_HEIGHT,
} from './constants';

/**
 * Manage TUIOManager singleton class.
 *
 * @type TUIOManager
 * @private
 */
let tuioManagerInstance = null;

/**
 * Main class to manage TUIOManager.
 *
 * @class TUIOManager
 */
class TUIOManager {

  /**
   * TUIOManager constructor.
   *
   * @constructor
   */
  constructor() {
    if (tuioManagerInstance !== null) {
      return tuioManagerInstance;
    }
    this._touches = {};
    this._tags = {};

    this._widgets = {};

    tuioManagerInstance = this;

    return tuioManagerInstance;
  }

  /**
   * Init and start TUIOManager.
   *
   * @method getInstance
   * @static
   * @returns {TUIOManager} The TUIOManager instance.
   */
  static getInstance() {
    return new TUIOManager();
  }

  /**
   * Add a TUIOWidget as observer of TUIOManager.
   *
   * @method addWidget
   * @param {TUIOWidget} widget - TUIOWidget instance to add as observer of TUIOManager.
   */
  addWidget(widget) {
    if (typeof (this._widgets[widget.id]) === 'undefined') {
      this._widgets = {
        ...this._widgets,
        [widget.id]: widget,
      };
    }
  }

  /**
   * Remove TUIOWidget in param from TUIOManager's observers.
   *
   * @method removeWidget
   * @param {TUIOWidget} widget - TUIOWidget instance to remove from TUIOManager's observers.
   */
  removeWidget(widget) {
    if (typeof (this._widgets[widget.id]) !== 'undefined') {
      delete this._widgets[widget.id];
    }
  }

  /**
   * Notify all widgets/observers.
   *
   * @method notifyWidgets
   * @param {string} methodToCall - TUIOWidget method name to call.
   * @param {any} param - Param for method call.
   */
  notifyWidgets(methodToCall, param) {
    Object.keys(this._widgets).forEach((widgetId) => {
      const currentWidget = this._widgets[widgetId];
      currentWidget[methodToCall](param);
    });
  }

  /**
   * Init and start TUIOManager.
   *
   * @method start
   * @param {string} socketIOUrl - Socket IO Server's url. Default : 'http://localhost:9000/'
   */
  start(socketIOUrl = 'http://localhost:9000/') {
    const socketIOClient = io(socketIOUrl);
    socketIOClient.on(CREATE_SOCKETIO_ACTION, (data) => {
      this.handleCreate(data);
    });
    socketIOClient.on(UPDATE_SOCKETIO_ACTION, (data) => {
      this.handleUpdate(data);
    });
    socketIOClient.on(DELETE_SOCKETIO_ACTION, (data) => {
      this.handleDelete(data);
    });
  }

  /**
   * Handle CREATE Action from socket.
   *
   * @method handleCreate
   * @param {JSON} socketData - 'Create' data from TUIOClient.
   */
  handleCreate(socketData) {
    switch (socketData.type) {
      case TOUCH_SOCKETIO_TYPE: {
        this._touches[socketData.id] = new TUIOTouch(socketData.id, socketData.x * WINDOW_WIDTH, socketData.y * WINDOW_HEIGHT);
        this.notifyWidgets('onTouchCreation', this._touches[socketData.id]);
        this._touches[socketData.id].update(socketData.x * WINDOW_WIDTH, socketData.y * WINDOW_HEIGHT);
        break;
      }
      case TAG_SOCKETIO_TYPE: {
        this._tags[socketData.id] = new TUIOTag(socketData.id, socketData.x * WINDOW_WIDTH, socketData.y * WINDOW_HEIGHT, socketData.angle);
        this.notifyWidgets('onTagCreation', this._tags[socketData.id]);
        this._tags[socketData.id].update(socketData.x * WINDOW_WIDTH, socketData.y * WINDOW_HEIGHT, socketData.angle);
        break;
      }
      default:
        break;
    }
  }

  /**
   * Handle UPDATE Action from socket.
   *
   * @method handleUpdate
   * @param {JSON} socketData - 'Update' data from TUIOClient.
   */
  handleUpdate(socketData) {
    switch (socketData.type) {
      case TOUCH_SOCKETIO_TYPE: {
        if (typeof (this._touches[socketData.id]) !== 'undefined') {
          this._touches[socketData.id].update(socketData.x * WINDOW_WIDTH, socketData.y * WINDOW_HEIGHT);
        }
        break;
      }
      case TAG_SOCKETIO_TYPE: {
        if (typeof (this._tags[socketData.id]) !== 'undefined') {
          this._tags[socketData.id].update(socketData.x * WINDOW_WIDTH, socketData.y * WINDOW_HEIGHT, socketData.angle);
        }
        break;
      }
      default:
        break;
    }
  }

  /**
   * Handle DELETE Action from socket.
   *
   * @method handleDelete
   * @param {JSON} socketData - 'Delete' data from TUIOClient.
   */
  handleDelete(socketData) {
    switch (socketData.type) {
      case TOUCH_SOCKETIO_TYPE: {
        if (typeof (this._touches[socketData.id]) !== 'undefined') {
          this.notifyWidgets('onTouchDeletion', socketData.id);
          delete this._touches[socketData.id];
        }
        break;
      }
      case TAG_SOCKETIO_TYPE: {
        if (typeof (this._tags[socketData.id]) !== 'undefined') {
          this.notifyWidgets('onTagDeletion', socketData.id);
          delete this._tags[socketData.id];
        }
        break;
      }
      default:
        break;
    }
  }
}

export default TUIOManager;
