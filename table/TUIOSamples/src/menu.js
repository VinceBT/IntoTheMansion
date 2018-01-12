/**
 * @author Kevin Duglué
 * @author Rémy Kaloustian
 */
// Import JQuery
import $ from 'jquery/dist/jquery.min';
// Import ImageWidget
import ImageElementWidget from 'tuiomanager/widgets/ElementWidget/ImageElementWidget/ImageElementWidget';
import VideoElementWidget from 'tuiomanager/widgets/ElementWidget/VideoElementWidget/VideoElementWidget';
//import LibraryBar from 'tuiomanager/widgets/Library/LibraryBar/LibraryBar';
import CircularMenu from 'tuiomanager/widgets/CircularMenu/CircularMenu';
import LibraryStack from 'tuiomanager/widgets/Library/LibraryStack/LibraryStack'
import MenuItem from 'tuiomanager/widgets/CircularMenu/MenuItem';
import {buildNoobWork} from './dev-test';
import mapData from '../assets/map/Apartment.json';
import * as THREE from "three";

let widgets = [];

function AddWidgetToScreen(widget) {
//  $('#example-container').append(widget.domElem);
  widget.addTo('#example-container');
  widgets.push(widget);
}//AddWidgetToScreen()

function RemoveWidgets() {
  $('#example-container').empty();
  for (let i = 0; i < widgets.length; i += 1) {
    widgets[i].deleteWidget();
  }
  widgets = [];
}


function getRand(min, max) {
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

function buildBackButton() {
  $('#example-container').append('<button id="back-button">Back</button>');
  $('#back-button').on('click', () => {
    RemoveWidgets();
    buildMenu();
  });
}//  displayMenu()

function buildDevelopment() {
  $('#example-container').empty();
  buildBackButton();
  const imageWidget = new ImageElementWidget(0, 0, 250, 333, 0, 2, 'assets/IMG_20150304_201145.jpg', 'B3', 'C9', '38');
  //AddWidgetToScreen(imageWidget);
  const imageWidgetA = new ImageElementWidget(600, 50, 200, 210, 0, 2, 'assets/joy.png', 'B3', 'C9', '38');
  //AddWidgetToScreen(imageWidgetA);

  //const videoWidget = new VideoElementWidget(100, 100, 250, 140, 0, 1, 'assets/video/video.mp4', 'B3', 'C9', '38', '3');
  //AddWidgetToScreen(videoWidget);
  const videoWidget5 = new VideoElementWidget(100, 675, 250, 140, 0, 1, 'assets/user-test/somebody.mp4', 'B3', 'C9', '38', '6', '3');
  AddWidgetToScreen(videoWidget5);
  //test de LibraryStack
  const libstack = new LibraryStack(600, 300, 300, 300);
  //AddWidgetToScreen(libstack);
  const imageWidget2 = new ImageElementWidget(0, 0, 250, 333, 0, 2, 'assets/IMG_20150304_201145.jpg', 'B3', 'C9', '38');
  const imageWidget3 = new ImageElementWidget(0, 0, 250, 333, 0, 2, 'assets/IMG_20150304_201145.jpg', 'B3', 'C9', '38');
  const imageWidget4 = new ImageElementWidget(0, 0, 250, 333, 0, 2, 'assets/IMG_20150304_201145.jpg', 'B3', 'C9', '38');
  const imageWidget5 = new ImageElementWidget(0, 0, 250, 333, 0, 2, 'assets/IMG_20150304_201145.jpg', 'B3', 'C9', '38');
  const facile = new MenuItem('Facile', '#2E7D32', '#FFF', false);
  facile.setTouchCallback(() => {
    // Do something
  });

  libstack.addElementWidget(imageWidget2);
  libstack.addElementWidget(imageWidget3);
  libstack.addElementWidget(imageWidget4);
  libstack.addElementWidget(imageWidget5);
  const moyen = new MenuItem('Moyen', '#D84315', '#FFF', false);
  moyen.setTouchCallback(() => {
    // Do something
  });

  const cloud = new MenuItem('fa fa-2x fa-cloud', '#c62828', '#fff', true);
  cloud.setTouchCallback(() => {
    // Do something
  });
  const difficulties = new MenuItem('Difficultés', '#FFF', '#000', false);
  difficulties.addChild(facile);
  difficulties.addChild(moyen);
  const icones = new MenuItem('Icones', '#FFF', '#000', false);
  icones.addChild(cloud);
  const root = new MenuItem('root', '', '', false);
  root.addChild(difficulties);
  root.addChild(icones);
  const circularmenu = new CircularMenu('6D', root);
  AddWidgetToScreen(circularmenu);
}// buildDevelopment()

function buildHealth() {
  $('#example-container').empty();
  buildBackButton();
  $('#example-container').append('<div id="main-container"> </div>');
  $('#main-container').append('<div id="healthy-container">  <h1>Healthy</h1> <h1 class="title-bottom">Healthy</h1> </div>');
  $('#main-container').append('<div id="unhealthy-container">  <h1>Unhealthy</h1> <h1 class="title-bottom">Unhealthy</h1> </div>');
  const height = $('#main-container').height() - ($('#main-container h1').height() * 3);

  $('.title-bottom').css('marginTop', `${height}px`);

  const candiesImage = new ImageElementWidget(100, 150, 110, 110, 0, 1, 'assets/example-health/candies.png', 'B3', 'C9', '38');
  AddWidgetToScreen(candiesImage);
  const appleImage = new ImageElementWidget(850, 20, 110, 110, 0, 1, 'assets/example-health/apple.png', 'B3', 'C9', '38');
  AddWidgetToScreen(appleImage);
  const bananaImage = new ImageElementWidget(1700, 500, 110, 110, 0, 1, 'assets/example-health/banana.png', 'B3', 'C9', '38');
  AddWidgetToScreen(bananaImage);
  const chipsImage = new ImageElementWidget(1500, 20, 110, 110, 0, 1, 'assets/example-health/chips.png', 'B3', 'C9', '38');
  AddWidgetToScreen(chipsImage);
  const broccoliImage = new ImageElementWidget(200, 700, 110, 110, 0, 1, 'assets/example-health/broccoli.png', 'B3', 'C9', '38');
  AddWidgetToScreen(broccoliImage);
  const tomatoImage = new ImageElementWidget(1000, 850, 110, 110, 90, 1, 'assets/example-health/tomato.png', 'B3', 'C9', '38');
  AddWidgetToScreen(tomatoImage);
}// buildHealth()

function SpawnRotation(difficulty) {
  if (difficulty === 'medium' || difficulty === 'difficult') {
    return getRand(0, 360);
  }
  return 0;
}//  SpawnRotation()

function SpawnScale(difficulty) {
  if (difficulty === 'difficult') {
    return getRand(0.5, 1.4);
  }
  return 1;
}// SpawnRotation()

function buildPuzzle(difficulty) {
  const pieces = [];
  RemoveWidgets();
  buildBackButton();

  const puz1 = new ImageElementWidget(10, 100, 505, 414, SpawnRotation(difficulty), SpawnScale(difficulty), 'assets/example-puzzle/1.png', 'B3', 'C9', '38');
  pieces.push(puz1);
  const puz2 = new ImageElementWidget(600, 40, 539, 305, SpawnRotation(difficulty), SpawnScale(difficulty), 'assets/example-puzzle/2.png', 'B3', 'C9', '38');
  pieces.push(puz2);
  const puz3 = new ImageElementWidget(200, 10, 574, 655, SpawnRotation(difficulty), SpawnScale(difficulty), 'assets/example-puzzle/3.png', 'B3', 'C9', '38');
  pieces.push(puz3);
  const puz4 = new ImageElementWidget(500, 250, 524, 482, SpawnRotation(difficulty), SpawnScale(difficulty), 'assets/example-puzzle/4.png', 'B3', 'C9', '38');
  pieces.push(puz4);
  const puz5 = new ImageElementWidget(800, 500, 558, 420, SpawnRotation(difficulty), SpawnScale(difficulty), 'assets/example-puzzle/5.png', 'B3', 'C9', '38');
  pieces.push(puz5);
  const puz6 = new ImageElementWidget(850, 150, 429, 475, SpawnRotation(difficulty), SpawnScale(difficulty), 'assets/example-puzzle/6.png', 'B3', 'C9', '38');
  pieces.push(puz6);
  const puz7 = new ImageElementWidget(200, 500, 340, 338, SpawnRotation(difficulty), SpawnScale(difficulty), 'assets/example-puzzle/7.png', 'B3', 'C9', '38');
  pieces.push(puz7);
  const puz8 = new ImageElementWidget(50, 400, 340, 558, SpawnRotation(difficulty), SpawnScale(difficulty), 'assets/example-puzzle/8.png', 'B3', 'C9', '38');
  pieces.push(puz8);

  for (let i = 0; i < pieces.length; i += 1) {
    AddWidgetToScreen(pieces[i]);

    if (difficulty === 'easy') {
      pieces[i].canZoom(false, false);
      pieces[i].canDelete(false, false);
      pieces[i].canRotate(false, false);
    } else if (difficulty === 'medium') {
      pieces[i].canZoom(false, false);
      pieces[i].canDelete(false, false);
      pieces[i].canRotate(true, true);
    }
  }
}// buildPuzzle()

function buildMusic() {
  $('#example-container').empty();
  buildBackButton();
  $('#example-container').append('<div id="music-container"> </div>');
  $('#music-container').append('<div class="music-subcontainer"><img src="assets/example-music/guitar.png" > <div class="music-target"></div> </div>');
  $('#music-container').append('<div class="music-subcontainer"><img src="assets/example-music/piano.png" ><div class="music-target"></div> </div>');
  $('#music-container').append('<div class="music-subcontainer"><img src="assets/example-music/saxophone.png" ><div class="music-target"></div> </div>');

  const fluteVid = new VideoElementWidget(250, 800, 150, 84, SpawnRotation('medium'), 1, 'assets/example-music/flute.mp4', 'B3', 'C9', '38', '3');
  AddWidgetToScreen(fluteVid);
  const pianoVid = new VideoElementWidget(450, 100, 150, 84, SpawnRotation('medium'), 1, 'assets/example-music/piano.mp4', 'B3', 'C9', '38', '3');
  AddWidgetToScreen(pianoVid);
  const drumsVid = new VideoElementWidget(650, 800, 150, 84, SpawnRotation('medium'), 1, 'assets/example-music/drums.mp4', 'B3', 'C9', '38', '3');
  AddWidgetToScreen(drumsVid);
  const guitarVid = new VideoElementWidget(850, 100, 150, 84, SpawnRotation('medium'), 1, 'assets/example-music/guitar.mp4', 'B3', 'C9', '38', '3');
  AddWidgetToScreen(guitarVid);
  const saxophoneVid = new VideoElementWidget(1050, 800, 150, 84, SpawnRotation('medium'), 1, 'assets/example-music/saxophone.mp4', 'B3', 'C9', '38', '3');
  AddWidgetToScreen(saxophoneVid);
} // buildMusic()

function buildCircularMenuPuzzles() {
  const facile = new MenuItem('Facile', '#2E7D32', '#FFF', false);
  facile.setTouchCallback(() => {
    buildPuzzle('easy');
  });
  const moyen = new MenuItem('Moyen', '#D84315', '#FFF', false);
  moyen.setTouchCallback(() => {
    buildPuzzle('medium');
  });
  const difficile = new MenuItem('Difficile', '#c62828', '#fff', false);
  difficile.setTouchCallback(() => {
    buildPuzzle('difficult');
  });
  const puzzle1 = new MenuItem('L\'école d\'Athènes', '#3F51B5', '#fff', false);
  puzzle1.setTouchCallback(() => {
    buildPuzzle('easy');
  });
  const puzzle2 = new MenuItem('La Joconde', '#009688', '#fff', false);
  puzzle2.setTouchCallback(() => {
    console.log('NOUVEAU PUZZLE');
  });

  const difficulties = new MenuItem('Difficultés', '#FFF', '#000', false);
  difficulties.addChild(facile);
  difficulties.addChild(moyen);
  difficulties.addChild(difficile);
  const puzzles = new MenuItem('Puzzles', '#FFF', '#000', false);
  puzzles.addChild(puzzle1);
  puzzles.addChild(puzzle2);
  const root = new MenuItem('root', '#0F0', '#0FF', false);
  root.addChild(difficulties);
  root.addChild(puzzles);
  const circularmenu = new CircularMenu('6D', root);
  console.log(root);
  $('#app').append(circularmenu.domElem);
}// buildMusic

function buildDevelopmentTest() {
  RemoveWidgets();
  buildNoobWork();

}//  buildDevelopmentTest()

function buildUserTest() {
  RemoveWidgets();
  const imageWidget1 = new ImageElementWidget(10, 10, 640, 960, 10, 0.1, 'assets/user-test/1.jpg', 'B3', 'C9', '38', '6');
  AddWidgetToScreen(imageWidget1);
  const imageWidget2 = new ImageElementWidget(400, 50, 2048, 1365, 300, 0.1, 'assets/user-test/2.jpg', 'B3', 'C9', '38', '6');
  AddWidgetToScreen(imageWidget2);
  const imageWidget3 = new ImageElementWidget(550, 10, 2048, 1365, 40, 0.1, 'assets/user-test/3.jpg', 'B3', 'C9', '38', '6');
  AddWidgetToScreen(imageWidget3);
  const imageWidget4 = new ImageElementWidget(700, 150, 2048, 1365, 260, 0.1, 'assets/user-test/4.jpg', 'B3', 'C9', '38', '6');
  AddWidgetToScreen(imageWidget4);
  const imageWidget5 = new ImageElementWidget(900, 20, 2048, 1365, 60, 0.1, 'assets/user-test/5.jpg', 'B3', 'C9', '38', '6');
  AddWidgetToScreen(imageWidget5);
  const imageWidget6 = new ImageElementWidget(1400, 50, 2048, 1365, 190, 0.1, 'assets/user-test/6.jpg', 'B3', 'C9', '38', '6');
  AddWidgetToScreen(imageWidget6);
  const imageWidget7 = new ImageElementWidget(40, 800, 2048, 1365, 80, 0.1, 'assets/user-test/7.jpg', 'B3', 'C9', '38', '6');
  AddWidgetToScreen(imageWidget7);
  const imageWidget8 = new ImageElementWidget(300, 700, 2048, 1365, 170, 0.1, 'assets/user-test/8.jpg', 'B3', 'C9', '38', '6');
  AddWidgetToScreen(imageWidget8);
  const imageWidget9 = new ImageElementWidget(700, 750, 2048, 1365, 100, 0.1, 'assets/user-test/9.jpg', 'B3', 'C9', '38', '6');
  AddWidgetToScreen(imageWidget9);
  const imageWidget10 = new ImageElementWidget(900, 820, 2048, 1365, 130, 0.1, 'assets/user-test/10.jpg', 'B3', 'C9', '38', '6');
  AddWidgetToScreen(imageWidget10);
  const imageWidget11 = new ImageElementWidget(1270, 470, 640, 960, 120, 0.1, 'assets/user-test/11.jpg', 'B3', 'C9', '38', '6');
  AddWidgetToScreen(imageWidget11);
  const imageWidget12 = new ImageElementWidget(1400, 840, 2048, 1365, 110, 0.1, 'assets/user-test/12.jpg', 'B3', 'C9', '38', '6');
  AddWidgetToScreen(imageWidget12);
  const imageWidget13 = new ImageElementWidget(1600, 800, 2048, 1365, 140, 0.1, 'assets/user-test/13.jpg', 'B3', 'C9', '38', '6');
  AddWidgetToScreen(imageWidget13);
  const imageWidget14 = new ImageElementWidget(40, 400, 640, 960, 50, 0.1, 'assets/user-test/14.jpg', 'B3', 'C9', '38', '6');
  AddWidgetToScreen(imageWidget14);
//
  const videoWidget1 = new VideoElementWidget(200, 50, 250, 140, 180, 1, 'assets/user-test/boi.mp4', 'B3', 'C9', '38', '6', '3');
  AddWidgetToScreen(videoWidget1);
  const videoWidget2 = new VideoElementWidget(1100, 20, 250, 140, 70, 1, 'assets/user-test/crash.mp4', 'B3', 'C9', '38', '6', '3');
  AddWidgetToScreen(videoWidget2);
  const videoWidget3 = new VideoElementWidget(40, 600, 250, 140, 200, 1, 'assets/user-test/hey.mp4', 'B3', 'C9', '38', '6', '3');
  AddWidgetToScreen(videoWidget3);
  const videoWidget4 = new VideoElementWidget(1700, 100, 250, 140, 30, 1, 'assets/user-test/kazoo.mp4', 'B3', 'C9', '38', '6', '3');
  AddWidgetToScreen(videoWidget4);
  const videoWidget5 = new VideoElementWidget(1700, 675, 250, 140, 250, 1, 'assets/user-test/somebody.mp4', 'B3', 'C9', '38', '6', '3');
  AddWidgetToScreen(videoWidget5);


  //Stack site web
  const websitestack = new LibraryStack(400, 300, 300, 'Site Web', '#2196f3', false, ['ImageElementWidget']);
  const youtubestack = new LibraryStack(900, 300, 300, 'Youtube', '#f44336', false, ['VideoElementWidget']);
  const trashstack = new LibraryStack(1400, 300, 300, 'Corbeille', '#C9C9C9', false, ['ImageElementWidget', 'VideoElementWidget']);

  AddWidgetToScreen(websitestack);
  AddWidgetToScreen(youtubestack);
  AddWidgetToScreen(trashstack);

  //Stack vidéo
  //Stack poubelle


}// buildUserTest

export function buildMenu() {
  $('#example-container').append('<h1> TUIO Showcase </h1>');
  $('#example-container').append('<button id="development" class="menu-button"> Development </button> </br>');
  $('#example-container').append('<button id="health" class="menu-button"> Health (using ImageElementWidget) </button></br>');
  $('#example-container').append('<button class="menu-button puzzle" data-difficulty="easy"> Puzzle (using ImageElementWidget) </button></br>');
  $('#example-container').append('<button id="music" class="menu-button"> Music (using VideoElementWidget) </button></br>');
  $('#example-container').append('<button id="development-test" class="menu-button"> Development test </button></br>');
  $('#example-container').append('<button id="user-test" class="menu-button"> User test </button></br>');
  $('#example-container').append('<button id="map-test" class="menu-button"> Je suis la carte </button></br>');



  $('#development').on('click', () => {
    buildDevelopment();
  });
  $('#health').on('click', () => {
    buildHealth();
  });
  $('.puzzle').on('click', (elem) => {
    buildCircularMenuPuzzles();
    buildPuzzle($(elem.target).data('difficulty'));
  });
  $('#music').on('click', () => {
    buildMusic();
  });

  $('#development-test').on('click', () => {
    buildDevelopmentTest();
  });

  $('#user-test').on('click', () => {
    buildUserTest();
  });

  $('#map-test').on('click', () => {
    buildMap();
  });
}// buildMenu()

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();

function buildMap(){
  let height = mapData.terrain.height;
  let width = mapData.terrain.width;
  let map = mapData.terrain.map;


  $('#example-container').empty();
  let $three = $('<div id="three"></div>');
  $('#example-container').append($three);


  renderer.setSize( window.innerWidth, window.innerHeight );
  $three[0].appendChild( renderer.domElement );

  var geometry = new THREE.BoxGeometry( 1, 1, 0.2 );
  var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
  var wall = new THREE.Mesh(geometry, material);
  scene.add( wall );

  camera.y = 5;
  camera.rotateX(-Math.PI/2);
  map.forEach(function(elt, index) {
    //ajouter tous les murs
  });
  console.log(mapData);

  animate();
}

function animate() {

  requestAnimationFrame( animate );

  renderer.render( scene, camera );

}
