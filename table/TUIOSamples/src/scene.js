/* eslint-disable one-var-declaration-per-line */
import * as THREE from 'three';

import mapData from '../assets/map/Apartment.json';

const WindowResize = require('three-window-resize');

function getRand(min, max) {
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

export function buildScene($container) {
  let scene, camera, renderer;

  function animate() {
    requestAnimationFrame(animate);
    camera.rotation.x += 0.1;
    renderer.render(scene, camera);
  }

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();

  const height = mapData.terrain.height;
  const width = mapData.terrain.width;

  const map = mapData.terrain.map;

  renderer.setSize(window.innerWidth, window.innerHeight);

  $container.empty();
  $container[0].appendChild(renderer.domElement);

  const windowResize = new WindowResize(renderer, camera);

  const geometry = new THREE.BoxGeometry(1, 1, 0.2);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const wall = new THREE.Mesh(geometry, material);
  scene.add(wall);

  camera.position.y = 5;
  camera.rotateX(-Math.PI / 2);
  map.forEach((elt, index) => {
    // ajouter tous les murs
  });

  animate();
}
