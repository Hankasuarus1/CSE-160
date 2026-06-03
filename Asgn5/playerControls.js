import * as THREE from "three";

export function setupPlayerControls(player, camera) {
  const keys = {};
  const moveSpeed = 5;

  const cameraOffset = new THREE.Vector3(0, 6, 8);
  const lookOffset = new THREE.Vector3(0, 0.75, 0);

  window.addEventListener("keydown", (event) => {
    keys[event.code] = true;
  });

  window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
  });

  function update(deltaTime) {
    const moveDirection = new THREE.Vector3(0, 0, 0);

    if (keys["KeyW"]) {
      moveDirection.z -= 1;
    }

    if (keys["KeyS"]) {
      moveDirection.z += 1;
    }

    if (keys["KeyA"]) {
      moveDirection.x -= 1;
    }

    if (keys["KeyD"]) {
      moveDirection.x += 1;
    }

    if (moveDirection.lengthSq() > 0) {
      moveDirection.normalize();

      player.position.x += moveDirection.x * moveSpeed * deltaTime;
      player.position.z += moveDirection.z * moveSpeed * deltaTime;

      player.rotation.y = Math.atan2(moveDirection.x, moveDirection.z);
    }

    camera.position.copy(player.position).add(cameraOffset);
    camera.lookAt(player.position.clone().add(lookOffset));
  }

  return { update };
}