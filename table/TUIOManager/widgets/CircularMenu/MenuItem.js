/**
 * @author Kevin Duglue <kevin.duglue@gmail.com>
 * @author Rémy Kaloustian <remy.kaloustian@gmail.com>
 */

/**
 * Class for a circular menu.
 *
 * @class CircularMenu
 * @extends TUIOWidget
 */
class MenuItem {
  constructor(item, backgroundcolor, color, isIcon) {
    this._isIcon = isIcon;
    if (isIcon) {
      this._icon = item;
    } else {
      this._name = item;
    }
    this._backgroundcolor = backgroundcolor;
    this._color = color;

    this._childs = [];
  }

  addChild(child) {
    child.setParent(this);
    this._childs.push(child);
  }

  get name() {
    return this._name;
  }

  get isIcon() {
    return this._isIcon;
  }
  get icon() {
    return this._icon;
  }

  get backgroundcolor() {
    return this._backgroundcolor;
  }

  get color() {
    return this._color;
  }

  get parent() {
    return this._parent;
  }

  get childs() {
    return this._childs;
  }

  get callback() {
    return this._callback;
  }

  getChild(position) {
    return this._childs[position];
  }

  setParent(parent) {
    this._parent = parent;
  }

  isLeaf() {
    return this._childs.length === 0;
  }

  setTouchCallback(callback) {
    this._callback = callback;
  }
}

export default MenuItem;
