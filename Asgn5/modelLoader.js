import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";

function getFolderPath(filePath) {
  return filePath.substring(0, filePath.lastIndexOf("/") + 1);
}

function getFileName(filePath) {
  return filePath.substring(filePath.lastIndexOf("/") + 1);
}

export async function loadObjModel(scene, options) {
  const {
    objPath,
    mtlPath = null,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 1,
  } = options;

  const objLoader = new OBJLoader();

  if (mtlPath !== null) {
    const modelFolder = getFolderPath(mtlPath);
    const mtlFileName = getFileName(mtlPath);

    const mtlLoader = new MTLLoader();
    mtlLoader.setPath(modelFolder);
    mtlLoader.setResourcePath(modelFolder);

    const materials = await mtlLoader.loadAsync(mtlFileName);
    materials.preload();

    objLoader.setMaterials(materials);
  }

  const objFolder = getFolderPath(objPath);
  const objFileName = getFileName(objPath);

  objLoader.setPath(objFolder);

  const model = await objLoader.loadAsync(objFileName);

  model.position.set(position[0], position[1], position[2]);
  model.rotation.set(rotation[0], rotation[1], rotation[2]);
  model.scale.set(scale, scale, scale);

  if (mtlPath === null) {
    model.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xaaaaaa,
        });
      }
    });
  }

  scene.add(model);
  return model;
}