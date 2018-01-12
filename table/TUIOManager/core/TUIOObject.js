/**
 * @author Christian Brel <ch.brel@gmail.com>
 * @author Vincent Forquet
 * @author Nicolas Forget
 */

/**
 * Main class to manage TUIOObject.
 *
 * @class TUIOObject
 */
class TUIOObject {

  /**
   * TUIOObject constructor.
   *
   * @constructor
   * @param {string/number} id - TUIOObject's id.
   * @param {string/number} x - TUIOObject's abscissa.
   * @param {string/number} y - TUIOObject's ordinate.
   */
  constructor(id, x, y) {
    this._id = id;
    this._x = x;
    this._y = y;

    this._widgets = {};
  }

  /**
   * Add a TUIOWidget as observer of TUIOObject.
   *
   * @method addWidget
   * @param {TUIOWidget} widget - TUIOWidget instance to add as observer of TUIOObject.
   */
  addWidget(widget) {
    if (typeof (this._widgets[widget.id]) === 'undefined') {
      if (Object.keys(this._widgets).length === 0) {
        this._widgets = {
          // ...this._widgets,
          [widget.id]: widget,
        };
      } else if (this._widgets[Object.keys(this._widgets)[0]].zIndex < widget.zIndex) {
        this._widgets = {
          // ...this._widgets,
          [widget.id]: widget,
        };
      }
    }
  }


  /**
   * Remove TUIOWidget in param from TUIOObject's observers.
   *
   * @method removeWidget
   * @param {TUIOWidget} widget - TUIOWidget instance to remove from TUIOObject's observers.
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
   */
  notifyWidgets(methodToCall) {
    Object.keys(this._widgets).forEach((widgetId) => {
      const currentWidget = this._widgets[widgetId];
      currentWidget[methodToCall](this);
    });
  }

  /**
   * TUIOObject's id getter.
   *
   * @returns {string|number} TUIOObject's id.
   */
  get id() { return this._id; }

  /**
   * TUIOObject's abscissa getter.
   *
   * @returns {string|number} TUIOObject's abscissa.
   */
  get x() { return this._x; }

  /**
   * TUIOObject's ordinate getter.
   *
   * @returns {string|number} TUIOObject's ordinate.
   */
  get y() { return this._y; }

  /**
   * Update TUIOObject.
   *
   * @method update
   * @param {string/number} x - New TUIOObject's abscissa.
   * @param {string/number} y - New TUIOObject's ordinate.
   */
  update(x, y) {
    this._x = x;
    this._y = y;
  }
}

export default TUIOObject;
