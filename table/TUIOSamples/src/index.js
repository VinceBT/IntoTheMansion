import $ from 'jquery/dist/jquery.min';
import TUIOManager from 'tuiomanager/core/TUIOManager';
import io from "socket.io-client";
import SceneWidget from './widgets/SceneWidget';
import status from '../assets/status.json';


const tuioManager = new TUIOManager();
tuioManager.start();

const fullRemote = `http://${status.devRemote}:${status.port}`;
const socket = io(fullRemote);

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
  const sceneWidget = new SceneWidget(socket);
  addWidget(sceneWidget);
};

$(window).ready(() => {
  buildApp();
});
