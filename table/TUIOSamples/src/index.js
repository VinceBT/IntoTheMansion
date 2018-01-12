import $ from 'jquery/dist/jquery.min';
import TUIOManager from 'tuiomanager/core/TUIOManager';
import SceneWidget from './SceneWidget';

const tuioManager = new TUIOManager();
tuioManager.start();

const $app = $('#app');

let widgets = [];

const addWidget = (widget) => {
  $app.append(widget.domElem);
  widgets.push(widget);
};

const removeWidgets = () => {
  $app.empty();
  for (let i = 0; i < widgets.length; i += 1) {
    widgets[i].deleteWidget();
  }
  widgets = [];
};

const buildApp = () => {
  const sceneWidget = new SceneWidget();
  addWidget(sceneWidget);
};

$(window).ready(() => {
  buildApp();
});
