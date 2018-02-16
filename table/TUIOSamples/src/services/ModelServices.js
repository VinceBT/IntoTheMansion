import * as THREE from "three";

const modelUriMap = new Map();
const modelMap = new Map();

const registerModelKey = (key, src) => {
  modelUriMap.set(key, src);
};

registerModelKey('player', 'assets/models/player.json');
registerModelKey('ghost', 'assets/models/ghost.json');
registerModelKey('direction', 'assets/models/direction.json');
registerModelKey('screamer', 'assets/models/screamer.json');
registerModelKey('trap', 'assets/models/trap.json');

export default class ModelServices {

  static load(key) {
    return new Promise((resolve, reject) => {
      if (!modelUriMap.has(key)) reject(`Key ${key} not found`);
      if (modelMap.has(key)) resolve(modelMap.get(key));
      const assetSrc = modelUriMap.get(key);
      const jsonLoader = new THREE.JSONLoader();
      jsonLoader.load(assetSrc, (geometry) => {
        console.log(`[MODEL] Loaded ${key} -> ${assetSrc}`);
        modelMap.set(key, geometry);
        resolve(geometry);
      }, (xhr) => {
        // console.log(`[MODEL] Loading ${key} -> ${assetSrc} ${xhr.loaded / xhr.total * 100}% loaded`);
      }, (err) => {
        console.log(`[MODEL] An error happened: ${err}`);
      });
    });
  }

}
