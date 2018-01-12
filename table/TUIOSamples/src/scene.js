import * as THREE from 'three';
import WindowResize from 'three-window-resize';

import mapData from '../assets/map/Apartment.json';

function getRand(min, max) {
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

export function buildScene($container) {
  let scene, camera, renderer, walls, floors, doors;

  function animate() {
    requestAnimationFrame(animate);
    // camera.rotation.x += 0.01;
   // walls.rotation.x += 0.01;
    renderer.render(scene, camera);
  }

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true });


  const height = mapData.terrain.height;
  const width = mapData.terrain.width;

  const map = mapData.terrain.map;

  renderer.setSize(window.innerWidth, window.innerHeight);

  $container.empty();
  $container[0].appendChild(renderer.domElement);

  const windowResize = new WindowResize(renderer, camera);

  const wall_geometry = new THREE.BoxGeometry(1, 5, 1);
  const wall_material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const wall = new THREE.Mesh(wall_geometry, wall_material);

  const floor_geometry = new THREE.BoxGeometry(1, 1, 1);
  const floor_material = new THREE.MeshBasicMaterial({ color: 0xC5C5C5 });
  const floor = new THREE.Mesh(wall_geometry, wall_material);

  const door_geometry = new THREE.BoxGeometry(1, 5, 1);
  const door_material = new THREE.MeshBasicMaterial({ color: 0x703F00 });
  const door = new THREE.Mesh(wall_geometry, wall_material);

  camera.position.y = 100;
  camera.position.x = width / 2;
  camera.position.z = height / 2;

  camera.rotation.x = -Math.PI/2;

  console.log(camera);

  walls = new THREE.Group();
  floors = new THREE.Group();
  doors = new THREE.Group();


  map[0].forEach((elt, index) => {
    // Add walls, floor and doors

    if(elt == 'W'){
      const wall = new THREE.Mesh(wall_geometry, wall_material);
      wall.position.x = index % width * 1;
      wall.position.z = index / width * 1;
      walls.add(wall);
    }
    else if(elt == 'F'){
      const floor = new THREE.Mesh(floor_geometry, floor_material);
      floor.position.x = index % width * 1;
      floor.position.z = index / width * 1;
      floors.add(floor);
    }
    else if(elt == 'D'){
      console.log("porte");
      const door = new THREE.Mesh(door_geometry, door_material);
      door.position.x = index % width * 1;
      door.position.z = index / width * 1;
      doors.add(door);
    }
  });

  console.log(doors);
  scene.add(walls);
  scene.add(floors);
  scene.add(doors);

  animate();
}
