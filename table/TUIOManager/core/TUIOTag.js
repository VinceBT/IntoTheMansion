/**
 * @author Christian Brel <ch.brel@gmail.com>
 * @author Vincent Forquet
 * @author Nicolas Forget
 */

import TUIOObject from './TUIOObject';

/**
 * Main class to manage TUIOTag.
 *
 * @class TUIOTag
 * @extends TUIOObject
 */
class TUIOTag extends TUIOObject {

  /**
   * TUIOTag constructor.
   *
   * @constructor
   * @param {string/number} id - TUIOTag's id.
   * @param {string/number} x - TUIOTag's abscissa.
   * @param {string/number} y - TUIOTag's ordinate.
   * @param {string/number} angle - TUIOTag's angle.
   */
  constructor(id, x, y, angle) {
    super(id, x, y);
    this._angle = angle;
  }

  /**
   * TUIOTag's angle getter.
   *
   * @returns {string|number} TUIOTag's angle.
   */
  get angle() { return this._angle; }

  /**
   * Update TUIOTag.
   *
   * @method update
   * @param {string/number} x - New TUIOTag's abscissa.
   * @param {string/number} y - New TUIOTag's ordinate.
   * @param {string/number} angle - New TUIOTag's angle.
   */
  update(x, y, angle) {
    super.update(x, y);
    this._angle = angle;
    this.notifyWidgets('onTagUpdate');
  }
}

export default TUIOTag;
