/**
 * @author Kevin Duglue <kevin.duglue@gmail.com>
 * @author Rémy Kaloustian <remy.kaloustian@gmail.com>
 */


import TUIOWidget from '../../core/TUIOWidget';
import TUIOManager from '../../core/TUIOManager';
import { radToDeg } from '../../core/helpers';
import Point from '../../src/utils/Point';

/**
 * Abstract class
 *
 * @class ElementWidget
 * @extends TUIOWidget
 */
class ElementWidget extends TUIOWidget {
  /**
   * ElementWidget constructor.
   *
   * @constructor
   * @param {number} x - ElementWidget's upperleft coin abscissa.
   * @param {number} y - ElementWidget's upperleft coin ordinate.
   * @param {number} width - ElementWidget's width.
   * @param {number} height - ElementWidget's height.
   * @param {number} initialRotation - Initial Rotation of the Element. Set to 0 of no rotation
   * @param {number} initialScale - Initial Scale of the Element. Set to 1 of no rescale
   */
  constructor(x, y, width, height, initialRotation, initialScale) {
    if (new.target === ElementWidget) {
      throw new TypeError('ElementWidget is an abstract class. It cannot be instanciated');
    }
    super(x, y, width, height);
    this._width *= initialScale;
    this._height *= initialScale;
    this.idTagMove = '';
    this.idTagDelete = '';
    this.idTagZoom = '';
    this._currentAngle = initialRotation;
    this._lastTouchesValues = {};
    this._lastTagsValues = {};
    this.internX = x;
    this.internY = y;
    this.internWidth = this.width;
    this.internHeight = this.height;
    this.scale = 1;
    ElementWidget.zIndexGlobal += 1;
    this.zIndex = ElementWidget.zIndexGlobal;
    this.canMoveTactile = true;
    this.canZoomTactile = true;
    this.canRotateTactile = true;
    this.canDeleteTactile = true;

    this.canMoveTangible = true;
    this.canZoomTangible = true;
    this.canRotateTangible = true;
    this.canDeleteTangible = true;

    this.isDisabled = false;
    this.tagDuplicate = '';
  }// constructor

  /**
     * ImageWidget's domElem.
     *
     * @returns {JQuery Object} ImageWidget's domElem.
     */
  get domElem() { return this._domElem; }

  /**
   * Check if TUIOWidget is touched.
   *
   * @method isTouched
   * @param {number} x - Point's abscissa to test.
   * @param {number} y - Point's ordinate to test.
   */
  isTouched(x, y) {
    this._domElem.css('transform', `rotate(360deg) scale(${this.scale})`);
    const nx = this._domElem[0].getBoundingClientRect().left;
    const ny = this._domElem[0].getBoundingClientRect().top;
    const width = this._domElem.width();
    const height = this._domElem.height();
    const ox = (nx + (width / 2));
    const oy = (ny + (height / 2));
    const p = new Point(x, y);
    p.rotate((360 - this._currentAngle), ox, oy);
    this._domElem.css('transform', `rotate(${this._currentAngle}deg) scale(${this.scale})`);
    return (p.x >= nx && p.x <= nx + width && p.y >= ny && p.y <= ny + height) && !this.isDisabled;
  }

  /**
   * Call after a TUIOTouch creation.
   *
   * @method onTouchCreation
   * @param {TUIOTouch} tuioTouch - A TUIOTouch instance.
   */
  onTouchCreation(tuioTouch) {
    if (!this._isInStack) {
      super.onTouchCreation(tuioTouch);
      if (this.isTouched(tuioTouch.x, tuioTouch.y)) {
        this._lastTouchesValues = {
          ...this._lastTouchesValues,
          [tuioTouch.id]: {
            x: tuioTouch.x,
            y: tuioTouch.y,
          },
        };
        this._lastTouchesValues.pinchDistance = 0;
        if (this._lastTouchesValues.scale == null) {
          this._lastTouchesValues.scale = this.scale;
        }
      }
    }
  }

  /**
   * Move ImageWidget.
   *
   * @method moveTo
   * @param {string/number} x - New ImageWidget's abscissa.
   * @param {string/number} y - New ImageWidget's ordinate.
   * @param {number} angle - New ImageWidget's angle.
   */
  moveTo(x, y, angle = null) {
    this.internX = x;
    this.internY = y;
    this._domElem.css('left', `${x}px`);
    this._domElem.css('top', `${y}px`);
    if (angle !== null) {
      this._domElem.css('transform', `rotate(${angle}deg) scale(${this.scale})`);
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
      if (this.zIndex !== ElementWidget.zIndexGlobal) {
        ElementWidget.zIndexGlobal += 1;
        this.zIndex = ElementWidget.zIndexGlobal;
      }
      this._domElem.css('z-index', this.zIndex);
      const touchesWidgets = [];
      const currentTouches = this.touches;
      Object.keys(this.touches).forEach((key) => {
        touchesWidgets.push(currentTouches[key]);
      });

      if (touchesWidgets.length === 1 && this.canMoveTactile) {
        const lastTouchValue = this._lastTouchesValues[tuioTouch.id];
        const diffX = tuioTouch.x - lastTouchValue.x;
        const diffY = tuioTouch.y - lastTouchValue.y;

        const newX = this.internX + diffX;
        const newY = this.internY + diffY;
        this._x = this.x + diffX;
        this._y = this.y + diffY;

        this.moveTo(newX, newY);
        this._lastTouchesValues = {
          ...this._lastTouchesValues,
          [tuioTouch.id]: {
            x: tuioTouch.x,
            y: tuioTouch.y,
          },
        };
      } else if (touchesWidgets.length === 2) {
        const touch1 = new Point(touchesWidgets[0].x, touchesWidgets[0].y);
        const touch2 = new Point(touchesWidgets[1].x, touchesWidgets[1].y);
        let newscale = this._lastTouchesValues.scale;
        // Resize d'une image
        if (this.canZoomTactile) {
          const c = touch1.distanceTo(touch2);
          if (c > this._lastTouchesValues.pinchDistance) {
            newscale = this._lastTouchesValues.scale * 1.018; // new scale is 1.5 times the old scale
            this._lastTouchesValues.scale = newscale; //  We save the scale
          } else if (c < this._lastTouchesValues.pinchDistance) {
            newscale = this._lastTouchesValues.scale * 0.985; // new scale is 1.5 times the old scale
            this._lastTouchesValues.scale = newscale; //  We save the scale
          }
          this.scale = newscale;
          this._lastTouchesValues.pinchDistance = c;
        }

        // Rotation d'une image
        if (this.canRotateTactile) {
          if (!this.lastAngle) {
            this.lastAngle = touch1.angleWith(touch2);
          } else {
            if (this.lastAngle < touch1.angleWith(touch2)) {
              this._currentAngle += touch1.angleWith(touch2) - this.lastAngle;
            } else {
              this._currentAngle -= this.lastAngle - touch1.angleWith(touch2);
            }
            this._currentAngle = this._currentAngle % 360;
            this.lastAngle = touch1.angleWith(touch2);
          }
        }
        this._domElem.css('transform', `rotate(360deg) scale(${this.scale})`);
        this._width = this._domElem.width();
        this._height = this._domElem.height();
        this._domElem.css('transform', `rotate(${this._currentAngle}deg) scale(${this.scale})`);
        this._x = this._domElem.position().left;
        this._y = this._domElem.position().top;
      // } else if (touchesWidgets.length === 5 && this.canDeleteTactile) {
      //   this._domElem.remove();
      //   this.deleteWidget();
      }
    }
  }

  /**
   * Call after a TUIOTouch deletion.
   *
   * @method onTouchDeletion
   * @param {number/string} tuioTouchId - TUIOTouch's id to delete.
   */
  onTouchDeletion(tuioTouchId) {
    super.onTouchDeletion(tuioTouchId);
    if (typeof (this._lastTouchesValues[tuioTouchId]) !== 'undefined') {
      const lastTouchValue = this._lastTouchesValues[tuioTouchId];
      const x = lastTouchValue.x;
      const y = lastTouchValue.y;
      if (!this._isInStack) {
        Object.keys(TUIOManager.getInstance()._widgets).forEach((widgetId) => {
          if (TUIOManager.getInstance()._widgets[widgetId].constructor.name === 'LibraryStack') {
            if ( this.isInBounds(TUIOManager.getInstance()._widgets[widgetId], x, y) && !TUIOManager.getInstance()._widgets[widgetId].isDisabled && TUIOManager.getInstance()._widgets[widgetId].isAllowedElement(this)) {
              this._isInStack= true;
              TUIOManager.getInstance()._widgets[widgetId].addElementWidget(this);
              return;
            }
          }
        });
      }
    }
    ElementWidget.isAlreadyTouched = false;
    this.lastAngle = null;
  }

  /**
   * Call after a TUIOTag creation.
   *
   * @method onTagCreation
   * @param {TUIOTag} tuioTag - A TUIOTag instance.
   */
  onTagCreation(tuioTag) {
    if (!this._isInStack) {
      super.onTagCreation(tuioTag);
      if (this.isTouched(tuioTag.x, tuioTag.y)) {
        this._lastTagsValues = {
          ...this._lastTagsValues,
          [tuioTag.id]: {
            x: tuioTag.x,
            y: tuioTag.y,
            angle: tuioTag.angle,

          },
        };
        //  This will be used to save the last angle recorded and make a comparison in onTagUpdate
        this._lastTagsValues.angle = 0;
        //  Setting the scale only at the start
        if (this._lastTagsValues.scale == null) {
          this._lastTagsValues.scale = this.scale;
        }
      }
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
      if (tuioTag.id === this.idTagDelete && this.canDeleteTangible) {
        this._domElem.remove();
        this.deleteWidget();
      } else if (tuioTag.id === this.idTagMove && this.canMoveTangible) {
        if (this.zIndex !== ElementWidget.zIndexGlobal) {
          ElementWidget.zIndexGlobal += 1;
          this.zIndex = ElementWidget.zIndexGlobal;
        }
        this._domElem.css('z-index', this.zIndex);
        const lastTagValue = this._lastTagsValues[tuioTag.id];
        const diffX = tuioTag.x - lastTagValue.x;
        const diffY = tuioTag.y - lastTagValue.y;

        const newX = this.internX + diffX;
        const newY = this.internY + diffY;

        if (this.canRotateTangible) {
          this._currentAngle = radToDeg(tuioTag.angle);
          this.moveTo(newX, newY, this._currentAngle);
        } else {
          this.moveTo(newX, newY);
        }

        this._lastTagsValues = {
          ...this._lastTagsValues,
          [tuioTag.id]: {
            x: tuioTag.x,
            y: tuioTag.y,
          },
        };
        this._x = this._domElem.position().left;
        this._y = this._domElem.position().top;
        this._width = this._domElem.width();
        this._height = this._domElem.height();
      } else if (tuioTag.id === this.idTagZoom && this.canZoomTangible) { //  When the zoom tag is recognized
        let newscale;
        if (tuioTag.angle > this._lastTagsValues.angle) { // Increasing angle superior to last saved angle (clockwise)
          newscale = this._lastTagsValues.scale * 1.5; // new scale is 1.5 times the old scale
          this.scale = newscale;
          this._lastTagsValues.angle = tuioTag.angle;// We save the new angle
          this._domElem.css('transform', `rotate(${this._currentAngle}deg) scale(${newscale})`); // We set the dom element scale
          this._lastTagsValues.scale = newscale; //  We save the scale
        } else if (tuioTag.angle < this._lastTagsValues.angle) { //  Decreasing angle inferior to the last saved angle(counterclockwise)
          newscale = this._lastTagsValues.scale * 0.75;// new scale is 0.75 times the old scale
          this.scale = newscale;
          this._lastTagsValues.angle = tuioTag.angle;// We save the new angle
          this._domElem.css('transform', `rotate(${this._currentAngle}deg) scale(${newscale})`); // We set the dom element scale
          this._lastTagsValues.scale = newscale;// We save the scale
        }
        this._x = this._domElem.position().left;
        this._y = this._domElem.position().top;
        this._width = this._domElem.width();
        this._height = this._domElem.height();
      } //  else if
    }
  }

  /**
   * Call after a TUIOTag deletion.
   *
   * @method onTagDeletion
   * @param {number/string} tuioTagId - TUIOTag's id to delete.
   */
  onTagDeletion(tuioTagId) {
    super.onTagDeletion(tuioTagId);
  }

  /**
   * Call to enable/disable rotation
   *
   * @method canRotate
   * @param {boolean} canRotateTangible - Enable/disable tangible rotation
   * @param {boolean} canRotateTactile - Enable/disable tactile rotation
  */
  canRotate(canRotateTangible, canRotateTactile) {
    this.canRotateTangible = canRotateTangible;
    this.canRotateTactile = canRotateTactile;
  }

  /**
   * Call to enable/disable rotation
   *
   * @method canMove
   * @param {boolean} canMoveTangible - Enable/disable tangible movement
   * @param {boolean} canMoveTactile - Enable/disable tactile movement
  */
  canMove(canMoveTangible, canMoveTactile) {
    this.canMoveTangible = canMoveTangible;
    this.canMoveTactile = canMoveTactile;
  }

  /**
   * Call to enable/disable rotation
   *
   * @method canZoom
   * @param {boolean} canZoomTangible - Enable/disable tangible zoom
   * @param {boolean} canZoomTactile - Enable/disable tactile zoom
  */
  canZoom(canZoomTangible, canZoomTactile) {
    this.canZoomTangible = canZoomTangible;
    this.canZoomTactile = canZoomTactile;
  }

  /**
   * Call to enable/disable rotation
   *
   * @method canDelete
   * @param {boolean} canZoomTangible - Enable/disable tangible delete
   * @param {boolean} canZoomTactile - Enable/disable tactile delete
  */
  canDelete(canDeleteTangible, canDeleteTactile) {
    this.canDeleteTangible = canDeleteTangible;
    this.canDeleteTactile = canDeleteTactile;
  }

  /**
   * Call to enable/disable rotation
   *
   * @method disable
   * @param {boolean} isDisabled - Enable/disable interaction with the widget
  */
  disable(isDisabled) {
    this.isDisabled = isDisabled;
  }

  /**
   * Return if this ElementWidget position is in the bounding box of a LibraryStack
   *
   * @method isInBounds
   * @param {LibStack} libStack - Libstack to compare
   * @param {number} x - X coordinates of the touch deletion
   * @param {number} y - Y coordinates of the touch deletion
  */
  isInBounds(libStack, x, y) {
    if(x >= libStack._x && x <= (libStack._x + libStack._width) && y >= libStack._y && y <= (libStack._y + libStack._height) ) {
      return true;
    }
    return false;
  }

  /**
   * Set the move tag
   *
   * @method setTagMove
   * @param {string} tagMove - Move tag id
  */
  setTagMove(tagMove) {
    this.idTagMove = tagMove;
  }

  /**
   * Set the move tag
   *
   * @method setTagZoom
   * @param {string} tagZoom - Zoom tag id
  */
  setTagZoom(tagZoom) {
    this.idTagZoom = tagZoom;
  }

  /**
   * Set the move tag
   *
   * @method setTagDelete
   * @param {string} tagDelete - Delete tag id
  */
  setTagDelete(tagDelete) {
    this.idTagDelete = tagDelete;
  }

  /**
   * Set the move tag
   *
   * @method setTagDuplicate
   * @param {string} tagDuplicate - Duplicate tag id
  */
  setTagDuplicate(tagDuplicate) {
    this.tagDuplicate = tagDuplicate;
  }

}// class

ElementWidget.zIndexGlobal = 0;
export default ElementWidget;
