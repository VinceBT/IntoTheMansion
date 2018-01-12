/**
 * @author Christian Brel <ch.brel@gmail.com>
 * @author Vincent Forquet
 * @author Nicolas Forget
 */

import TUIOObject from './TUIOObject';

/**
 * Main class to manage TUIOTouch.
 *
 * @class TUIOTouch
 * @extends TUIOObject
 */
class TUIOTouch extends TUIOObject {

  /**
   * Update TUIOTouch.
   *
   * @method update
   * @param {string/number} x - New TUIOTouch's abscissa.
   * @param {string/number} y - New TUIOTouch's ordinate.
   */
  update(x, y) {
    super.update(x, y);
    this.notifyWidgets('onTouchUpdate');
  }
}

export default TUIOTouch;
