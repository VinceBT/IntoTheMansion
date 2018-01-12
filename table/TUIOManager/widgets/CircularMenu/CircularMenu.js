/**
 * @author Kevin Duglue <kevin.duglue@gmail.com>
 * @author Rémy Kaloustian <remy.kaloustian@gmail.com>
 */

import $ from 'jquery/dist/jquery.min';
import TUIOWidget from '../../core/TUIOWidget';
import { radToDeg } from '../../core/helpers';

/**
 * Class for a circular menu.
 *
 * @class CircularMenu
 * @extends TUIOWidget
 */
class CircularMenu extends TUIOWidget {

  constructor(tagMenu, rootTree) {
    super(300, 300, 300, 300);
    this.tree = rootTree;
    this.root = rootTree;
    this.rootName = this.tree.name;
    this._domElem = $('<div>').attr('class', 'selector');
    this._domElem.append(
      $('<ul>')
        .attr('class', 'ulmenu'),
    ).css('z-index', 2147483647)
    .css('top', '300px')
    .css('left', '300px');
    this.zIndex = 2147483647;
    this.angleStart = -360;
    this.menuItemCoord = [];
    this._lastTagsValues = {};
    this.nbItems = 0;
    this.idTagMenu = tagMenu;
    this.backItem = $('<li>')
      .attr('class', 'limenu')
      .append(
        $('<input>').attr('id', `c ${this.nbItems}`).attr('type', 'checkbox'),
        $('<label>')
          .attr('for', `c ${this.nbItems}`)
          .append(
            $('<img>')
              .attr('src', 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/PjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDI2LjY3NiAyNi42NzYiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI2LjY3NiAyNi42NzY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj48Zz48cGF0aCBkPSJNMjYuMTA1LDIxLjg5MWMtMC4yMjksMC0wLjQzOS0wLjEzMS0wLjUyOS0wLjM0NmwwLDBjLTAuMDY2LTAuMTU2LTEuNzE2LTMuODU3LTcuODg1LTQuNTljLTEuMjg1LTAuMTU2LTIuODI0LTAuMjM2LTQuNjkzLTAuMjV2NC42MTNjMCwwLjIxMy0wLjExNSwwLjQwNi0wLjMwNCwwLjUwOGMtMC4xODgsMC4wOTgtMC40MTMsMC4wODQtMC41ODgtMC4wMzNMMC4yNTQsMTMuODE1QzAuMDk0LDEzLjcwOCwwLDEzLjUyOCwwLDEzLjMzOWMwLTAuMTkxLDAuMDk0LTAuMzY1LDAuMjU0LTAuNDc3bDExLjg1Ny03Ljk3OWMwLjE3NS0wLjEyMSwwLjM5OC0wLjEyOSwwLjU4OC0wLjAyOWMwLjE5LDAuMTAyLDAuMzAzLDAuMjk1LDAuMzAzLDAuNTAydjQuMjkzYzIuNTc4LDAuMzM2LDEzLjY3NCwyLjMzLDEzLjY3NCwxMS42NzRjMCwwLjI3MS0wLjE5MSwwLjUwOC0wLjQ1OSwwLjU2MkMyNi4xOCwyMS44OTEsMjYuMTQxLDIxLjg5MSwyNi4xMDUsMjEuODkxeiIvPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48L3N2Zz4=')
              .css('position', 'absolute')
              .css('top', '0')
              .css('bottom', '0')
              .css('right', '0')
              .css('left', '0')
              .css('width', '50%')
              .css('height', '50%')
              .css('color', this.backIconColor)
              .css('margin', 'auto'),
            )
          .css('color', this.backIconColor)
          .css('background-color', this.backBackgroundColor),
      );
    this.isHide = false;
    // this._domElem.hide();
  }

  /**
   * Rotate an item of the menu through an angle.
   *
   * @method rotate
   * @param {HTML Dom element} li - item of the menu.
   * @param {number} angle - Angle in degrees.
   */
  rotate(li, d) {
    $({ d: this.angleStart }).animate({ d: d }, {
      step: (now) => {
        $(li).css({ transform: `rotate( ${now}deg)` });
      },
      duration: 1,
    });
  }

  /**
   * Rotate an item of the menu through an angle.
   *
   * @method toggleOptions
   * @param {DOM} s - Root of the Dom of the menu.
   */
  toggleOptions(s) {
    $(s).toggleClass('open');
    const li = $(s).find('li');
    const deg = $(s).hasClass('half') ? 180 / (li.length - 1) : 360 / li.length;
    for (let i = 0; i < li.length; i += 1) {
      const d = $(s).hasClass('half') ? (i * deg) - 90 : i * deg;
      $(s).hasClass('open') ? this.rotate(li[i], d) : this.rotate(li[i], this.angleStart);
    }
  }

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
    if (!this.isHide) {
      for (let i = 0; i < this.menuItemCoord.length; i += 1) {
        if (x >= this.menuItemCoord[i].xmin && x <= this.menuItemCoord[i].xmax && y >= this.menuItemCoord[i].ymin && y <= this.menuItemCoord[i].ymax) {
          return true;
        }
      }
    }
    return false;
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
      for (let i = 0; i < this.menuItemCoord.length; i += 1) {
        if (tuioTouch.x >= this.menuItemCoord[i].xmin && tuioTouch.x <= this.menuItemCoord[i].xmax && tuioTouch.y >= this.menuItemCoord[i].ymin && tuioTouch.y <= this.menuItemCoord[i].ymax) {
          if (this.tree.name === this.rootName) {
            this.menuItemTouch(i);
          } else if (i === 0) {
            this.tree = this.tree.parent;
            this.nbItems = 0;
            this.toggleOptions(this.domElem);
            this._domElem.find('ul').empty();
            this.constructMenu();
          } else {
            this.menuItemTouch(i - 1);
          }
          break;
        }
      }
    }
  }

  /**
   * Add a text item to the menu
   *
   * @method addTextItem
   * @param {string} itemName - Item name
   * @param {string} textColor - Text color in hexadecimal
   * @param {string} backgroundColor - Background color in hexadecimal
   */
  addTextItem(itemName, textColor, backgroundColor) {
    this._domElem.find('ul').append(
      $('<li>').attr('class', 'limenu').append(
        $('<input>').attr('id', `c ${this.nbItems}`).attr('type', 'checkbox'),
        $('<label>')
          .attr('for', `c ${this.nbItems}`)
          .append($('<div>')
            .text(itemName)
            .css('display', 'table-cell')
            .css('vertical-align', 'middle')
            .css('color', textColor)
            .css('background-color', backgroundColor)
            .css('max-width', '80px'),
          )
          .css('display', 'table'),
      ),
    );
    this.nbItems += 1;
  }

  /**
   * Add a icon item to the menu
   *
   * @method addIconItem
   * @param {string} iconClass - Icon class
   * @param {string} iconColor - Icon color in hexadecimal
   * @param {string} backgroundColor - Background color in hexadecimal
   */
  addIconItem(iconClass, iconColor, backgroundColor) {
    this.domElem.find('ul').append(
      $('<li>').attr('class', 'limenu').append(
        $('<input>').attr('id', `c ${this.nbItems}`).attr('type', 'checkbox'),
        $('<label>')
          .attr('for', `c ${this.nbItems}`)
          .append(
            $('<i>')
              .attr('class', iconClass),
          )
          .css('color', iconColor)
          .css('line-height', '80px')
          .css('background-color', backgroundColor),
      ),
    );
  }

  /**
   * Add back item to the menu
   *
   * @method addBackItem
   */
  addBackItem() {
    this.domElem.find('ul').append(
      this.backItem,
    );
  }

   /**
   * Set back menu item to an icon
   *
   * @method setBackMenuItemIcon
   * @param {string} iconClass - Icon class
   * @param {string} iconColor - Icon color in hexadecimal
   * @param {string} backgroundColor - Background color in hexadecimal
   */
  setBackMenuItemIcon(iconClass, iconColor, backgroundColor) {
    this.backItem = $('<li>').append(
      $('<input>').attr('id', `c ${this.nbItems}`).attr('type', 'checkbox'),
      $('<label>')
        .attr('for', `c ${this.nbItems}`)
        .append(
          $('<i>')
            .attr('class', iconClass),
        )
        .css('color', iconColor)
        .css('background-color', backgroundColor),
    );
  }

  /**
   * Set back menu item to a text
   *
   * @method setBackMenuItemIcon
   * @param {string} text - Back text
   * @param {string} textColor - Text color in hexadecimal
   * @param {string} backgroundColor - Background color in hexadecimal
   */
  setBackMenuItemText(text, textColor, backgroundColor) {
    this.backItem = $('<li>').append(
      $('<input>').attr('id', `c ${this.nbItems}`).attr('type', 'checkbox'),
      $('<label>')
        .attr('for', `c ${this.nbItems}`)
        .text(text)
        .css('color', textColor)
        .css('background-color', backgroundColor),
    );
  }

  /**
   * Called to construct the menu
   *
   * @method constructMenu
   */
  constructMenu() {
    if (this.tree.name !== this.rootName) {
      this.addBackItem();
    }
    for (let i = 0; i < this.tree.childs.length; i += 1) {
      if (this.tree.childs[i].isIcon) {
        this.addIconItem(this.tree.childs[i].icon, this.tree.childs[i].color, this.tree.childs[i].backgroundcolor);
      } else {
        this.addTextItem(this.tree.childs[i].name, this.tree.childs[i].color, this.tree.childs[i].backgroundcolor);
      }
    }
    this.toggleOptions(this.domElem);
    const li = this.domElem.find('li');
    this.menuItemCoord = [];
    for (let i = 0; i < li.length; i += 1) {
      const x = $(li[i]).find('label')[0].getBoundingClientRect().left;
      const y = $(li[i]).find('label')[0].getBoundingClientRect().top;
      const width = $(li[i]).find('label').width();
      const height = $(li[i]).find('label').height();
      this.menuItemCoord.push({ xmin: x, ymin: y, xmax: x + width, ymax: y + height });
    }
  }

  /**
   * Called when an item of the menu is touched
   *
   * @method menuItemTouch
   */
  menuItemTouch(index) {
    if (this.tree.childs[index].isLeaf()) {
      this.tree.childs[index].callback();
    } else {
      this.tree = this.tree.childs[index];
      this.nbItems = 0;
      this.toggleOptions(this.domElem);
      this._domElem.find('ul').empty();
      this.constructMenu();
    }
  }


  /**
   * Call after a TUIOTag creation.
   *
   * @method onTagCreation
   * @param {TUIOTag} tuioTag - A TUIOTag instance.
   */
  onTagCreation(tuioTag) {
    if (tuioTag.id === this.idTagMenu) {
      this._tags = {
        ...this._tags,
        [tuioTag.id]: tuioTag,
      };
      this._tags[tuioTag.id].addWidget(this);

      this._lastTagsValues = {
        ...this._lastTagsValues,
        [tuioTag.id]: {
          x: tuioTag.x,
          y: tuioTag.y,
        },
      };
      this.nbItems = 0;
      this._domElem.find('ul').empty();
      this.constructMenu();
      this.topSelector = tuioTag.y - (this.domElem.height() / 2);
      this.leftSelector = tuioTag.x - (this.domElem.width() / 2);
      this.domElem.css('top', this.topSelector);
      this.domElem.css('left', this.leftSelector);
      this._domElem.show();
      this.isHide = false;
      const li = this.domElem.find('li');
      this.menuItemCoord = [];
      for (let i = 0; i < li.length; i += 1) {
        const x = $(li[i]).find('label')[0].getBoundingClientRect().left;
        const y = $(li[i]).find('label')[0].getBoundingClientRect().top;
        const width = $(li[i]).find('label').width();
        const height = $(li[i]).find('label').height();
        this.menuItemCoord.push({ xmin: x, ymin: y, xmax: x + width, ymax: y + height });
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
      if (tuioTag.id === this.idTagMenu) {
        const lastTagValue = this._lastTagsValues[tuioTag.id];
        const diffX = tuioTag.x - lastTagValue.x;
        const diffY = tuioTag.y - lastTagValue.y;

        this.topSelector = this.topSelector + diffY;
        this.leftSelector = this.leftSelector + diffX;
        this.domElem.css('top', this.topSelector);
        this.domElem.css('left', this.leftSelector);
        this._domElem.css('transform', `rotate(${radToDeg(tuioTag.angle)}deg)`);
        const li = this.domElem.find('li');
        this.menuItemCoord = [];
        for (let i = 0; i < li.length; i += 1) {
          const x = $(li[i]).find('label')[0].getBoundingClientRect().left;
          const y = $(li[i]).find('label')[0].getBoundingClientRect().top;
          const width = $(li[i]).find('label').width();
          const height = $(li[i]).find('label').height();
          this.menuItemCoord.push({ xmin: x, ymin: y, xmax: x + width, ymax: y + height });
        }

        this._lastTagsValues = {
          ...this._lastTagsValues,
          [tuioTag.id]: {
            x: tuioTag.x,
            y: tuioTag.y,
          },
        };
      }
    }
  }

  /**
   * Call after a TUIOTag deletion.
   *
   * @method onTagDeletion
   * @param {number/string} tuioTagId - TUIOTag's id to delete.
   */
  onTagDeletion(tuioTagId) {
    if (typeof (this._lastTagsValues[tuioTagId]) !== 'undefined') {
      super.onTagDeletion(tuioTagId);
      this._domElem.hide();
      this.toggleOptions(this.domElem);
      this.isHide = true;
      this.tree = this.root;
    }
  }


}

export default CircularMenu;
