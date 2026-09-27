/* ============================================================
   SWEPT PROJECTILE COLLISION

   The garbage is approximated as a sphere and swept between
   its previous and next positions. This prevents tunnelling
   through thin rims and the angled bin lids.
   ============================================================ */

function sweepSphereAgainstMesh(start, end, radius, mesh) {
  if (!mesh.geometry) {
    return null;
  }

  mesh.updateWorldMatrix(true, false);

  if (!mesh.geometry.boundingBox) {
    mesh.geometry.computeBoundingBox();
  }

  const inverseMatrix = new THREE.Matrix4()
    .copy(mesh.matrixWorld)
    .invert();

  const localStart = start.clone().applyMatrix4(inverseMatrix);

  const localEnd = end.clone().applyMatrix4(inverseMatrix);

  const localDelta = localEnd.clone().sub(localStart);

  const localLength = localDelta.length();

  if (localLength < 0.00001) {
    return null;
  }

  const worldScale = mesh.getWorldScale(new THREE.Vector3());

  const smallestScale = Math.max(
    0.001,
    Math.min(
      Math.abs(worldScale.x),
      Math.abs(worldScale.y),
      Math.abs(worldScale.z),
    ),
  );

  const expandedBox = mesh.geometry.boundingBox
    .clone()
    .expandByScalar(radius / smallestScale);

  const localNormal = new THREE.Vector3();

  let hitTime = 0;

  if (expandedBox.containsPoint(localStart)) {
    const absoluteDelta = [
      Math.abs(localDelta.x),
      Math.abs(localDelta.y),
      Math.abs(localDelta.z),
    ];

    const dominantAxis = absoluteDelta.indexOf(
      Math.max(...absoluteDelta),
    );

    localNormal.set(
      dominantAxis === 0 ? -Math.sign(localDelta.x) : 0,
      dominantAxis === 1 ? -Math.sign(localDelta.y) : 0,
      dominantAxis === 2 ? -Math.sign(localDelta.z) : 0,
    );
  } else {
    const ray = new THREE.Ray(
      localStart,

      localDelta.clone().normalize(),
    );

    const localHit = ray.intersectBox(
      expandedBox,

      new THREE.Vector3(),
    );

    if (!localHit) {
      return null;
    }

    const hitDistance = localHit.distanceTo(localStart);

    if (hitDistance > localLength) {
      return null;
    }

    hitTime = hitDistance / localLength;

    const faceDistances = [
      {
        value: Math.abs(localHit.x - expandedBox.min.x),
        normal: new THREE.Vector3(-1, 0, 0),
      },

      {
        value: Math.abs(localHit.x - expandedBox.max.x),
        normal: new THREE.Vector3(1, 0, 0),
      },

      {
        value: Math.abs(localHit.y - expandedBox.min.y),
        normal: new THREE.Vector3(0, -1, 0),
      },

      {
        value: Math.abs(localHit.y - expandedBox.max.y),
        normal: new THREE.Vector3(0, 1, 0),
      },

      {
        value: Math.abs(localHit.z - expandedBox.min.z),
        normal: new THREE.Vector3(0, 0, -1),
      },

      {
        value: Math.abs(localHit.z - expandedBox.max.z),
        normal: new THREE.Vector3(0, 0, 1),
      },
    ];

    faceDistances.sort((a, b) => a.value - b.value);

    localNormal.copy(faceDistances[0].normal);
  }

  const worldNormal = localNormal
    .transformDirection(mesh.matrixWorld)
    .normalize();

  return {
    time: hitTime,

    point: start.clone().lerp(end, hitTime),

    normal: worldNormal,

    mesh: mesh,
  };
}

function findPhysicalCollision(start, end, radius) {
  let earliest = null;

  const colliders = worldCollisionMeshes.slice();

  for (const bin of bins) {
    colliders.push(...bin.collisionMeshes);
  }

  for (const mesh of colliders) {
    const hit = sweepSphereAgainstMesh(start, end, radius, mesh);

    if (hit && (!earliest || hit.time < earliest.time)) {
      earliest = hit;
    }
  }

  if (end.y - radius <= 0 && end.y < start.y) {
    const floorTime = THREE.MathUtils.clamp(
      (start.y - radius) / (start.y - end.y),

      0,
      1,
    );

    if (!earliest || floorTime < earliest.time) {
      earliest = {
        time: floorTime,

        point: start.clone().lerp(end, floorTime),

        normal: new THREE.Vector3(0, 1, 0),

        mesh: floor,
      };
    }
  }

  return earliest;
}

/* Entering any part of the bin's usable interior scores. */

function findBinEntry(start, end, radius) {
  for (const bin of bins) {
    const interiorBox = new THREE.Box3(
      new THREE.Vector3(
        bin.center.x - bin.interiorHalfSize.x,
        bin.interiorMinY,
        bin.center.z - bin.interiorHalfSize.y,
      ),
      new THREE.Vector3(
        bin.center.x + bin.interiorHalfSize.x,
        bin.interiorMaxY,
        bin.center.z + bin.interiorHalfSize.y,
      ),
    );

    if (interiorBox.containsPoint(start)) {
      return {
        time: 0,
        bin: bin,
        point: start.clone(),
      };
    }

    const travel = end.clone().sub(start);

    const travelLength = travel.length();

    if (travelLength < 0.00001) {
      continue;
    }

    const entryPoint = new THREE.Ray(
      start,
      travel.clone().normalize(),
    ).intersectBox(interiorBox, new THREE.Vector3());

    if (!entryPoint) {
      continue;
    }

    const entryDistance = entryPoint.distanceTo(start);

    if (entryDistance > travelLength) {
      continue;
    }

    return {
      time: entryDistance / travelLength,
      bin: bin,
      point: entryPoint,
    };
  }

  return null;
}

/* ============================================================
   RESOLVE BIN
   ============================================================ */

function resolveBin(binType) {
  if (!thrownGarbageData) {
    return;
  }

  if (binType === thrownGarbageData.category) {
    combo++;

    const earnedScore = combo * 10;

    score += earnedScore;

    comboHudElement.classList.remove("combo-pop");

    void comboHudElement.offsetWidth;

    comboHudElement.classList.add("combo-pop");

    showMessage(
      "CORRECT! +" + earnedScore,

      "good",
    );
  } else {
    health--;

    combo = 0;

    showMessage(
      "WRONG BIN! -1 HP",

      "bad",
    );
  }

  wasteCount++;

  updateHUD();

  removeThrownGarbage();

  if (health <= 0) {
    gameOver();

    return;
  }

  setTimeout(
    () => {
      if (gameRunning) {
        if (!currentGarbage) {
          spawnGarbage();
        }
      }
    },

    450,
  );
}

/* ============================================================
   TIMEOUT
   ============================================================ */

function garbageTimeout() {
  if (!currentGarbage && !heldGarbage && !thrownGarbage) {
    return;
  }

  if (garbageTimeoutHandled) {
    return;
  }

  garbageTimeoutHandled = true;

  health--;

  combo = 0;

  wasteCount++;

  updateHUD();

  showMessage(
    "TOO SLOW! -1 HP",

    "bad",
  );

  if (currentGarbage && currentGarbage.parent) {
    currentGarbage.parent.remove(currentGarbage);
  }

  currentGarbage = null;

  currentGarbageData = null;

  garbageState = heldGarbage ? "held" : "none";

  if (health <= 0) {
    gameOver();

    return;
  }

  const nextSpawnDelay = heldGarbage ? 0 : 450;

  setTimeout(
    () => {
      if (gameRunning) {
        spawnGarbage();
      }
    },

    nextSpawnDelay,
  );
}

/* ============================================================
   HUD
   ============================================================ */

function updateHUD() {
  let hearts = "";

  for (let i = 0; i < health; i++) {
    hearts += "♥";
  }

  healthElement.textContent = hearts;

  scoreElement.textContent = score;

  wasteCountElement.textContent = wasteCount;

  comboElement.textContent = combo;
}

/* ============================================================
   MESSAGE
   ============================================================ */

function showMessage(
  text,

  type,
) {
  messageElement.textContent = text;

  messageElement.className = type;

  clearTimeout(messageTimeout);

  messageTimeout = setTimeout(
    () => {
      messageElement.textContent = "";
    },

    1100,
  );
}

/* ============================================================
   RESET CAMERA
   ============================================================ */

function resetPlayer() {
  camera.position.set(
    0,

    1.7,

    3,
  );

  camera.rotation.set(
    0,

    0,

    0,
  );

  playerVerticalVelocity = 0;

  playerGrounded = true;
}

/* ============================================================
   POINTER LOCK REQUEST
   ============================================================ */

let pointerLockRequestPending = false;

function showPointerLockUnavailable() {
  pointerLockRequestPending = false;

  cancelThrowCharge();

  if (!gameRunning) {
    return;
  }

  if (pauseStartedAt === null) {
    pauseStartedAt = performance.now();
  }

  pauseScreen.innerHTML =
    "MOUSE LOCK UNAVAILABLE" +
    "<small>OPEN IN CHROME, EDGE, OR SAFARI — OR CLICK TO RETRY</small>";
  pauseScreen.style.display = "flex";
}

function requestGamePointerLock() {
  pointerLockRequestPending = true;

  try {
    const lockRequest = document.body.requestPointerLock();

    if (lockRequest && typeof lockRequest.catch === "function") {
      lockRequest.catch(showPointerLockUnavailable);
    }
  } catch (error) {
    showPointerLockUnavailable();
  }
}

document.addEventListener("pointerlockerror", () => {
  if (pointerLockRequestPending) {
    showPointerLockUnavailable();
  }
});

/* ============================================================
   START GAME
   ============================================================ */

function startGame() {
  cancelThrowCharge();

  health = 5;

  score = 0;

  wasteCount = 0;

  combo = 0;

  gameRunning = true;

  pauseStartedAt = null;

  accumulatedPauseTime = 0;

  resetPlayer();

  updateHUD();

  removeCurrentGarbage();

  startScreen.style.display = "none";

  gameOverScreen.style.display = "none";

  pauseScreen.style.display = "none";

  spawnGarbage();

  requestGamePointerLock();
}

/* ============================================================
   GAME OVER
   ============================================================ */

function gameOver() {
  cancelThrowCharge();

  gameRunning = false;

  removeCurrentGarbage();

  finalScoreElement.textContent = score;

  finalCountElement.textContent = wasteCount;

  pauseScreen.style.display = "none";

  gameOverScreen.style.display = "flex";

  if (controls.isLocked) {
    controls.unlock();
  }
}

/* ============================================================
   KEY DOWN
   ============================================================ */

document.addEventListener(
  "keydown",

  (event) => {
    if (event.code in keys) {
      keys[event.code] = true;
    }

    if (event.code === "Space" && !event.repeat) {
      event.preventDefault();

      if (gameRunning && controls.isLocked && playerGrounded) {
        playerVerticalVelocity = PLAYER_JUMP_SPEED;

        playerGrounded = false;
      }
    }

  },
);

/* ============================================================
   KEY UP
   ============================================================ */

document.addEventListener(
  "keyup",

  (event) => {
    if (event.code in keys) {
      keys[event.code] = false;
    }

  },
);

/* ============================================================
   MOUSE CONTROLS
   ============================================================ */

document.addEventListener("mousedown", (event) => {
  if (event.button === 0) {
    interact();

    return;
  }

  if (event.button === 2) {
    inspectionKeyHeld = true;

    if (gameRunning && controls.isLocked && !throwCharging) {
      startInspection();
    }
  }
});

document.addEventListener("mouseup", (event) => {
  if (event.button === 0 && throwCharging) {
    releaseThrowCharge();
  }

  if (event.button === 2) {
    releaseInspectionHold();
  }
});

document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

/* ============================================================
   START BUTTON
   ============================================================ */

document.getElementById("start-button").addEventListener(
  "click",

  () => {
    startGame();
  },
);

/* ============================================================
   RESTART
   ============================================================ */

document.getElementById("restart-button").addEventListener(
  "click",

  () => {
    startGame();
  },
);

/* ============================================================
   PAUSE CLICK
   ============================================================ */

pauseScreen.addEventListener(
  "click",

  () => {
    if (gameRunning) {
      requestGamePointerLock();
    }
  },
);

/* ============================================================
   POINTER LOCK
   ============================================================ */

controls.addEventListener(
  "lock",

  () => {
    pointerLockRequestPending = false;

    pauseScreen.textContent = "CLICK TO CONTINUE";

    pauseScreen.style.display = "none";

    if (pauseStartedAt !== null) {
      accumulatedPauseTime += performance.now() - pauseStartedAt;

      pauseStartedAt = null;
    }
  },
);

controls.addEventListener(
  "unlock",

  () => {
    cancelThrowCharge();

    if (gameRunning) {
      pauseScreen.textContent = "CLICK TO CONTINUE";

      pauseStartedAt = performance.now();

      pauseScreen.style.display = "flex";
    }
  },
);

/* ============================================================
   MOVEMENT
   ============================================================ */

function isPlayerPositionBlocked(x, z) {
  if (
    x + PLAYER_RADIUS > conveyorPlayerBounds.min.x &&
    x - PLAYER_RADIUS < conveyorPlayerBounds.max.x &&
    z + PLAYER_RADIUS > conveyorPlayerBounds.min.z &&
    z - PLAYER_RADIUS < conveyorPlayerBounds.max.z
  ) {
    return true;
  }

  for (const bin of bins) {
    if (
      Math.abs(x - bin.center.x) < bin.halfSize.x + PLAYER_RADIUS &&
      Math.abs(z - bin.center.z) < bin.halfSize.z + PLAYER_RADIUS
    ) {
      return true;
    }
  }

  return false;
}

function updateMovement(delta) {
  if (!controls.isLocked) {
    return;
  }

  let forward = Number(keys.KeyW) - Number(keys.KeyS);

  let sideways = Number(keys.KeyD) - Number(keys.KeyA);

  if (forward !== 0 && sideways !== 0) {
    const diagonalScale = Math.SQRT1_2;

    forward *= diagonalScale;

    sideways *= diagonalScale;
  }

  const position = camera.position;

  const previousX = position.x;

  const previousZ = position.z;

  if (forward !== 0) {
    controls.moveForward(forward * moveSpeed * delta);
  }

  if (sideways !== 0) {
    controls.moveRight(sideways * moveSpeed * delta);
  }

  const desiredX = THREE.MathUtils.clamp(position.x, -8.5, 8.5);

  const desiredZ = THREE.MathUtils.clamp(position.z, -7.5, 7.5);

  /* Resolve each horizontal axis separately for wall sliding. */

  position.x = desiredX;

  position.z = previousZ;

  if (isPlayerPositionBlocked(position.x, position.z)) {
    position.x = previousX;
  }

  position.z = desiredZ;

  if (isPlayerPositionBlocked(position.x, position.z)) {
    position.z = previousZ;
  }

  playerVerticalVelocity -= PLAYER_GRAVITY * delta;

  position.y += playerVerticalVelocity * delta;

  if (position.y <= PLAYER_EYE_HEIGHT) {
    position.y = PLAYER_EYE_HEIGHT;

    playerVerticalVelocity = 0;

    playerGrounded = true;
  }
}

/* ============================================================
   CONVEYOR MOVEMENT
   ============================================================ */

function updateConveyorGarbage() {
  if (!currentGarbage || garbageState !== "conveyor") {
    return;
  }

  const elapsed = getGarbageElapsedSeconds();

  const progress = Math.min(
    elapsed / garbageTimeLimit,

    1,
  );

  currentGarbage.position.x = THREE.MathUtils.lerp(
    -5,

    5,

    progress,
  );
}

/* ============================================================
   THROW TRAJECTORY GUIDE
   ============================================================ */

function updateTrajectoryGuide() {
  if (
    !heldGarbage ||
    inspectionActive ||
    !gameRunning ||
    !controls.isLocked
  ) {
    trajectoryLine.visible = false;

    trajectoryEndMarker.visible = false;

    return;
  }

  const position = heldGarbage.getWorldPosition(new THREE.Vector3());

  const direction = camera.getWorldDirection(new THREE.Vector3());

  const velocity = direction.multiplyScalar(
    getThrowSpeed(throwChargeAmount),
  );

  velocity.y += getThrowLift();

  const points = [position.clone()];

  const step = 0.07;

  for (let index = 0; index < 42; index++) {
    velocity.y -= 9.8 * step;

    const next = position.clone().addScaledVector(velocity, step);

    const collision = findPhysicalCollision(
      position,
      next,
      projectileRadius,
    );

    const entry = findBinEntry(position, next, projectileRadius);

    if (entry && (!collision || entry.time < collision.time)) {
      points.push(entry.point);

      break;
    }

    if (collision) {
      points.push(collision.point);

      break;
    }

    position.copy(next);

    points.push(position.clone());
  }

  trajectoryGeometry.setFromPoints(points);

  trajectoryLine.computeLineDistances();

  trajectoryLine.visible = true;

  trajectoryEndMarker.position.copy(points[points.length - 1]);

  trajectoryEndMarker.visible = true;
}

function updateThrowTrail() {
  if (!thrownGarbage) {
    return;
  }

  const lastPoint = throwTrailPoints[throwTrailPoints.length - 1];

  if (
    !lastPoint ||
    lastPoint.distanceToSquared(thrownGarbage.position) > 0.01
  ) {
    throwTrailPoints.push(thrownGarbage.position.clone());

    if (throwTrailPoints.length > 72) {
      throwTrailPoints.shift();
    }

    throwTrailGeometry.setFromPoints(throwTrailPoints);

    throwTrail.visible = throwTrailPoints.length > 1;
  }
}

/* ============================================================
   PROJECTILE PHYSICS
   ============================================================ */

function updateThrownGarbage(delta) {
  if (!thrownGarbage || thrownGarbageState !== "thrown") {
    return;
  }

  const previousPosition = thrownGarbage.position.clone();

  projectileVelocity.y -= 9.8 * delta;

  const desiredPosition = previousPosition
    .clone()
    .addScaledVector(projectileVelocity, delta);

  const collision = findPhysicalCollision(
    previousPosition,
    desiredPosition,
    projectileRadius,
  );

  const entry = findBinEntry(
    previousPosition,
    desiredPosition,
    projectileRadius,
  );

  if (entry && (!collision || entry.time < collision.time)) {
    thrownGarbage.position.copy(entry.point);

    updateThrowTrail();

    resolveBin(entry.bin.type);

    return;
  }

  if (collision) {
    thrownGarbage.position
      .copy(collision.point)
      .addScaledVector(collision.normal, 0.025);

    const normalSpeed = projectileVelocity.dot(collision.normal);

    if (normalSpeed < 0) {
      const restitution = collision.normal.y > 0.65 ? 0.38 : 0.5;

      projectileVelocity.addScaledVector(
        collision.normal,

        -(1 + restitution) * normalSpeed,
      );
    }

    if (collision.normal.y > 0.65) {
      projectileVelocity.x *= 0.72;

      projectileVelocity.z *= 0.72;
    } else {
      projectileVelocity.multiplyScalar(0.86);
    }

    projectileAngularVelocity.multiplyScalar(0.68);

    const shouldSettle =
      collision.normal.y > 0.65 &&
      Math.abs(projectileVelocity.y) < 0.75 &&
      Math.hypot(projectileVelocity.x, projectileVelocity.z) < 1.15;

    if (shouldSettle) {
      projectileVelocity.set(0, 0, 0);

      projectileAngularVelocity.set(0, 0, 0);

      thrownGarbageState = "floor";

      showMessage("MISSED!", "bad");
    } else if (performance.now() - lastCollisionFeedback > 280) {
      showMessage("BOUNCE!", "bad");

      lastCollisionFeedback = performance.now();
    }
  } else {
    thrownGarbage.position.copy(desiredPosition);
  }

  thrownGarbage.rotation.x += projectileAngularVelocity.x * delta;

  thrownGarbage.rotation.y += projectileAngularVelocity.y * delta;

  thrownGarbage.rotation.z += projectileAngularVelocity.z * delta;

  updateThrowTrail();
}

/* ============================================================
   INTERACTION HINT
   ============================================================ */

function updateInteractionHint() {
  if (!gameRunning || !controls.isLocked) {
    interactionElement.textContent = "";

    return;
  }

  if (heldGarbage) {
    if (throwCharging) {
      const filledChargeBlocks = Math.round(throwChargeAmount * 10);

      interactionElement.textContent =
        "POWER [" +
        "█".repeat(filledChargeBlocks) +
        "░".repeat(10 - filledChargeBlocks) +
        "] " +
        Math.round(throwChargeAmount * 100) +
        "% — RELEASE LEFT MOUSE";
    } else {
      interactionElement.textContent = inspectionActive
        ? "INSPECTING..."
        : "[ HOLD LEFT MOUSE ] CHARGE THROW   [ HOLD RIGHT MOUSE ] LOOP INSPECT";
    }

    return;
  }

  const pickupTarget = getGarbageInCrosshair();

  if (!pickupTarget) {
    interactionElement.textContent = "";

    return;
  }

  interactionElement.textContent =
    "[ LEFT MOUSE ] PICK UP " + pickupTarget.data.name;
}

/* ============================================================
   TIMER
   ============================================================ */

function updateTimer() {
  if (
    !gameRunning ||
    (!currentGarbage && !heldGarbage && !thrownGarbage)
  ) {
    return;
  }

  const elapsed = getGarbageElapsedSeconds();

  const remaining = Math.max(
    0,

    garbageTimeLimit - elapsed,
  );

  timerElement.textContent = remaining.toFixed(1);

  if (remaining <= 0) {
    garbageTimeout();
  }
}

/* ============================================================
   ANIMATION
   ============================================================ */

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(
    clock.getDelta(),

    0.05,
  );

  if (gameRunning && controls.isLocked) {
    updateMovement(delta);

    updateConveyorGarbage();

    updateInspection();

    updateThrowChargeEffects();

    updateTrajectoryGuide();

    updateThrownGarbage(delta);

    updateTimer();

    updateInteractionHint();
  }

  renderer.render(
    scene,

    camera,
  );
}

animate();

/* ============================================================
   RESIZE
   ============================================================ */

window.addEventListener(
  "resize",

  () => {
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,

      window.innerHeight,
    );
  },
);
