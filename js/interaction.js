/* ============================================================
   SPAWN
   ============================================================ */

function spawnGarbage() {
  if (!gameRunning) {
    return;
  }

  garbageTimeoutHandled = false;

  if (currentGarbage && currentGarbage.parent) {
    currentGarbage.parent.remove(currentGarbage);
  }

  currentGarbage = null;

  currentGarbageData = null;

  const randomIndex = Math.floor(Math.random() * garbageTypes.length);

  const info = garbageTypes[randomIndex];

  const model = createGarbageModel(info);

  model.position.set(
    -5,

    1.25,

    -5,
  );

  model.userData.isGarbage = true;

  scene.add(model);

  currentGarbage = model;

  currentGarbageData = info;

  garbageState = "conveyor";

  garbageTimeLimit = ITEM_LIFETIME;

  garbageSpawnTime = performance.now();

  accumulatedPauseTime = 0;

  pauseStartedAt = null;

  if (!thrownGarbage) {
    projectileVelocity.set(0, 0, 0);

    projectileAngularVelocity.set(0, 0, 0);
  }

  trajectoryLine.visible = false;

  trajectoryEndMarker.visible = false;

  if (!thrownGarbage) {
    throwTrail.visible = false;

    throwTrailPoints.length = 0;
  }

  timerElement.textContent = garbageTimeLimit.toFixed(1);
}

/* ============================================================
   REMOVE CURRENT GARBAGE
   ============================================================ */

function removeCurrentGarbage() {
  inspectionActive = false;

  heldHand.visible = true;

  if (currentGarbage) {
    if (currentGarbage.parent) {
      currentGarbage.parent.remove(currentGarbage);
    }

    currentGarbage = null;
  }

  if (heldGarbage && heldGarbage.parent) {
    heldGarbage.parent.remove(heldGarbage);
  }

  if (thrownGarbage && thrownGarbage.parent) {
    thrownGarbage.parent.remove(thrownGarbage);
  }

  for (const droppedItem of droppedGarbageItems) {
    if (droppedItem.garbage.parent) {
      droppedItem.garbage.parent.remove(droppedItem.garbage);
    }
  }

  droppedGarbageItems.length = 0;

  heldGarbage = null;

  heldGarbageData = null;

  thrownGarbage = null;

  thrownGarbageData = null;

  thrownGarbageState = "none";

  currentGarbageData = null;

  garbageState = "none";

  interactionElement.textContent = "";

  trajectoryLine.visible = false;

  trajectoryEndMarker.visible = false;

  throwTrail.visible = false;

  throwTrailPoints.length = 0;
}

function removeThrownGarbage() {
  if (thrownGarbage && thrownGarbage.parent) {
    thrownGarbage.parent.remove(thrownGarbage);
  }

  thrownGarbage = null;

  thrownGarbageData = null;

  thrownGarbageState = "none";

  throwTrail.visible = false;

  throwTrailPoints.length = 0;
}

/* ============================================================
   GET GARBAGE MESHES
   ============================================================ */

function getGarbageMeshes(garbage = currentGarbage) {
  const meshes = [];

  if (!garbage) {
    return meshes;
  }

  garbage.traverse((child) => {
    if (child.isMesh) {
      meshes.push(child);
    }
  });

  return meshes;
}

/* ============================================================
   PROJECTILE COLLISION SIZE
   ============================================================ */

function updateProjectileRadius() {
  const bounds = new THREE.Box3();

  for (const mesh of getGarbageMeshes(
    heldGarbage || currentGarbage || thrownGarbage,
  )) {
    bounds.union(new THREE.Box3().setFromObject(mesh));
  }

  if (!bounds.isEmpty()) {
    const sphere = bounds.getBoundingSphere(new THREE.Sphere());

    projectileRadius = THREE.MathUtils.clamp(sphere.radius, 0.18, 0.3);
  }
}

/* ============================================================
   CAN PICK UP
   ============================================================ */

function getGarbageInCrosshair() {
  const pickupCandidates = [];

  if (currentGarbage) {
    pickupCandidates.push({
      garbage: currentGarbage,
      data: currentGarbageData,
      source: "current",
    });
  }

  if (thrownGarbage && thrownGarbageState === "floor") {
    pickupCandidates.push({
      garbage: thrownGarbage,
      data: thrownGarbageData,
      source: "floor",
    });
  }

  for (const droppedItem of droppedGarbageItems) {
    pickupCandidates.push({
      garbage: droppedItem.garbage,
      data: droppedItem.data,
      source: "dropped",
      droppedItem: droppedItem,
    });
  }

  if (pickupCandidates.length === 0) {
    return null;
  }

  raycaster.setFromCamera(
    centerPoint,

    camera,
  );

  const meshes = pickupCandidates.flatMap((candidate) =>
    getGarbageMeshes(candidate.garbage),
  );

  const hits = raycaster.intersectObjects(
    meshes,

    true,
  );

  if (hits.length === 0) {
    return null;
  }

  return (
    pickupCandidates.find((candidate) => {
      let object = hits[0].object;

      while (object) {
        if (object === candidate.garbage) {
          return true;
        }

        object = object.parent;
      }

      return false;
    }) || null
  );
}

function isGarbageInCrosshair() {
  return Boolean(getGarbageInCrosshair());
}

/* ============================================================
   PICK UP
   ============================================================ */

function tryPickup() {
  if (heldGarbage || (thrownGarbage && thrownGarbageState === "thrown")) {
    return;
  }

  const pickupTarget = getGarbageInCrosshair();

  if (!pickupTarget) {
    showMessage(
      "AIM AT THE WASTE",

      "bad",
    );

    return;
  }

  /*
  Use camera.attach().

  This preserves the
  world transform properly.
    */

  const pickedGarbage = pickupTarget.garbage;

  const pickedGarbageData = pickupTarget.data;

  camera.attach(pickedGarbage);

  if (pickedGarbage.userData.garbageLabel) {
    pickedGarbage.userData.garbageLabel.visible = false;
  }

  pickedGarbage.position.copy(HELD_POSITION);

  pickedGarbage.rotation.copy(HELD_ROTATION);

  pickedGarbage.scale.setScalar(1);

  inspectionActive = false;

  heldHand.position.copy(HAND_REST_POSITION);

  heldHand.rotation.copy(HAND_REST_ROTATION);

  heldHand.visible = true;

  heldGarbage = pickedGarbage;

  heldGarbageData = pickedGarbageData;

  updateProjectileRadius();

  if (pickupTarget.source === "floor") {
    thrownGarbage = null;

    thrownGarbageData = null;

    thrownGarbageState = "none";

    throwTrail.visible = false;

    throwTrailPoints.length = 0;
  } else if (pickupTarget.source === "dropped") {
    const droppedIndex = droppedGarbageItems.indexOf(
      pickupTarget.droppedItem,
    );

    if (droppedIndex !== -1) {
      droppedGarbageItems.splice(droppedIndex, 1);
    }
  } else {
    currentGarbage = null;

    currentGarbageData = null;
  }

  garbageState = "held";

  throwTrail.visible = false;

  throwTrailPoints.length = 0;

  showMessage(
    heldGarbageData.name + " PICKED UP",

    "good",
  );
}

/* ============================================================
   HELD ITEM INSPECTION
   ============================================================ */

function finishInspection() {
  inspectionActive = false;

  inspectionLooping = false;

  if (heldGarbage) {
    if (heldGarbage.parent !== camera) {
      camera.attach(heldGarbage);
    }

    heldGarbage.position.copy(HELD_POSITION);

    heldGarbage.rotation.copy(HELD_ROTATION);

    heldGarbage.scale.setScalar(1);
  }

  heldHand.position.copy(HAND_REST_POSITION);

  heldHand.rotation.copy(HAND_REST_ROTATION);

  inspectionThumbPivot.rotation.set(0, 0, 0);

  verticalInspectionPivotAttached = false;

  verticalInspectionReturning = false;

  butterflyInspectionPivotAttached = false;

  butterflyInspectionReturning = false;

  applyHandPose(HAND_POSE_REST);
}

function startInspection() {
  if (!heldGarbage) {
    return;
  }

  if (inspectionActive) {
    finishInspection();
  }

  inspectionActive = true;

  inspectionLooping = false;

  inspectionLoopProgress = 0;

  const inspectionModes = ["horizontal", "vertical", "butterfly"];

  inspectionMode =
    inspectionModes[Math.floor(Math.random() * inspectionModes.length)];

  activeInspectionKeyframes =
    inspectionMode === "horizontal"
      ? horizontalInspectionKeyframes
      : verticalInspectionKeyframes;

  if (inspectionMode === "vertical" || inspectionMode === "butterfly") {
    inspectionThumbPivot.rotation.set(0, 0, 0);

    verticalInspectionPivotAttached = false;

    verticalInspectionReturning = false;

    butterflyInspectionPivotAttached = false;

    butterflyInspectionReturning = false;
  }

  inspectionStartTime = performance.now();

  trajectoryLine.visible = false;

  trajectoryEndMarker.visible = false;

  showMessage(
    inspectionMode === "horizontal"
      ? "INSPECT: HORIZONTAL SPIN"
      : inspectionMode === "vertical"
        ? "INSPECT: VERTICAL FLIP"
        : "INSPECT: BUTTERFLY FLOURISH",
    "good",
  );
}

function getInspectionDuration() {
  return inspectionMode === "vertical"
    ? VERTICAL_INSPECTION_DURATION
    : inspectionMode === "butterfly"
      ? BUTTERFLY_INSPECTION_DURATION
      : HORIZONTAL_INSPECTION_DURATION;
}

function getInspectionSpinRange() {
  if (inspectionMode === "vertical") {
    return {
      start: 1000 / VERTICAL_INSPECTION_DURATION,
      end: 1820 / VERTICAL_INSPECTION_DURATION,
    };
  }

  if (inspectionMode === "butterfly") {
    return {
      start: 500 / BUTTERFLY_INSPECTION_DURATION,
      end: 1650 / BUTTERFLY_INSPECTION_DURATION,
    };
  }

  return {
    start: 0.56,
    end: 0.9,
  };
}

function releaseInspectionHold() {
  inspectionKeyHeld = false;

  if (!inspectionActive || !inspectionLooping) {
    return;
  }

  inspectionStartTime =
    performance.now() - inspectionLoopProgress * getInspectionDuration();

  inspectionLooping = false;
}

function updateVerticalInspection(progress) {
  const sideEnd = 700 / VERTICAL_INSPECTION_DURATION;

  const turnEnd = 1000 / VERTICAL_INSPECTION_DURATION;

  const spinEnd = 1820 / VERTICAL_INSPECTION_DURATION;

  if (progress < sideEnd) {
    const sideProgress = progress / sideEnd;

    const horizontalProgress = sideProgress * 0.56;

    const rawHandBlend = THREE.MathUtils.clamp(
      horizontalProgress / 0.16,
      0,
      1,
    );

    const handBlend =
      rawHandBlend * rawHandBlend * (3 - 2 * rawHandBlend);

    heldHand.position.lerpVectors(
      HAND_REST_POSITION,
      HAND_INSPECT_POSITION,
      handBlend,
    );

    heldHand.position.y +=
      Math.sin(horizontalProgress * Math.PI * 8) * 0.012 * handBlend;

    heldHand.rotation.set(
      THREE.MathUtils.lerp(
        HAND_REST_ROTATION.x,
        HAND_INSPECT_ROTATION.x,
        handBlend,
      ),
      THREE.MathUtils.lerp(
        HAND_REST_ROTATION.y,
        HAND_INSPECT_ROTATION.y,
        handBlend,
      ),
      THREE.MathUtils.lerp(
        HAND_REST_ROTATION.z,
        HAND_INSPECT_ROTATION.z,
        handBlend,
      ),
    );

    blendHandPoses(HAND_POSE_REST, HAND_POSE_DISPLAY, handBlend);

    let nextIndex = 1;

    while (
      nextIndex < horizontalInspectionKeyframes.length - 1 &&
      horizontalProgress > horizontalInspectionKeyframes[nextIndex].time
    ) {
      nextIndex++;
    }

    const previousFrame = horizontalInspectionKeyframes[nextIndex - 1];

    const nextFrame = horizontalInspectionKeyframes[nextIndex];

    const frameProgress =
      (horizontalProgress - previousFrame.time) /
      (nextFrame.time - previousFrame.time);

    const frameEase =
      frameProgress * frameProgress * (3 - 2 * frameProgress);

    heldGarbage.position.set(
      THREE.MathUtils.lerp(
        previousFrame.position[0],
        nextFrame.position[0],
        frameEase,
      ),
      THREE.MathUtils.lerp(
        previousFrame.position[1],
        nextFrame.position[1],
        frameEase,
      ),
      THREE.MathUtils.lerp(
        previousFrame.position[2],
        nextFrame.position[2],
        frameEase,
      ),
    );

    heldGarbage.rotation.set(
      THREE.MathUtils.lerp(
        previousFrame.rotation[0],
        nextFrame.rotation[0],
        frameEase,
      ),
      THREE.MathUtils.lerp(
        previousFrame.rotation[1],
        nextFrame.rotation[1],
        frameEase,
      ),
      THREE.MathUtils.lerp(
        previousFrame.rotation[2],
        nextFrame.rotation[2],
        frameEase,
      ),
    );

    heldGarbage.scale.setScalar(
      THREE.MathUtils.lerp(
        previousFrame.scale,
        nextFrame.scale,
        frameEase,
      ),
    );

    return;
  }

  if (!verticalInspectionPivotAttached && !verticalInspectionReturning) {
    const sideFinalFrame = horizontalInspectionKeyframes[4];

    heldHand.position.copy(HAND_INSPECT_POSITION);

    heldHand.rotation.copy(HAND_INSPECT_ROTATION);

    heldGarbage.position.set(
      sideFinalFrame.position[0],
      sideFinalFrame.position[1],
      sideFinalFrame.position[2],
    );

    heldGarbage.rotation.set(
      sideFinalFrame.rotation[0],
      sideFinalFrame.rotation[1],
      sideFinalFrame.rotation[2],
    );

    heldGarbage.scale.setScalar(sideFinalFrame.scale);

    camera.updateMatrixWorld(true);

    inspectionThumbPivot.attach(heldGarbage);

    verticalInspectionStartPosition.copy(heldGarbage.position);

    verticalInspectionStartQuaternion.copy(heldGarbage.quaternion);

    verticalInspectionStartScale.copy(heldGarbage.scale);

    verticalInspectionPivotAttached = true;
  }

  if (progress < turnEnd) {
    const turnProgress = THREE.MathUtils.clamp(
      (progress - sideEnd) / (turnEnd - sideEnd),
      0,
      1,
    );

    const turnEase = turnProgress * turnProgress * (3 - 2 * turnProgress);

    heldHand.position.lerpVectors(
      HAND_INSPECT_POSITION,
      HAND_VERTICAL_INSPECT_POSITION,
      turnEase,
    );

    heldHand.rotation.set(
      THREE.MathUtils.lerp(
        HAND_INSPECT_ROTATION.x,
        HAND_VERTICAL_INSPECT_ROTATION.x,
        turnEase,
      ),
      THREE.MathUtils.lerp(
        HAND_INSPECT_ROTATION.y,
        HAND_VERTICAL_INSPECT_ROTATION.y,
        turnEase,
      ),
      THREE.MathUtils.lerp(
        HAND_INSPECT_ROTATION.z,
        HAND_VERTICAL_INSPECT_ROTATION.z,
        turnEase,
      ),
    );

    blendHandPoses(HAND_POSE_DISPLAY, HAND_POSE_VERTICAL_GRIP, turnEase);

    heldGarbage.position.lerpVectors(
      verticalInspectionStartPosition,
      verticalInspectionAttachedPosition,
      turnEase,
    );

    heldGarbage.quaternion.slerpQuaternions(
      verticalInspectionStartQuaternion,
      verticalInspectionAttachedQuaternion,
      turnEase,
    );

    heldGarbage.scale.lerpVectors(
      verticalInspectionStartScale,
      verticalInspectionAttachedScale,
      turnEase,
    );

    return;
  }

  if (progress < spinEnd) {
    heldHand.position.copy(HAND_VERTICAL_INSPECT_POSITION);

    heldHand.rotation.copy(HAND_VERTICAL_INSPECT_ROTATION);

    heldGarbage.position.copy(verticalInspectionAttachedPosition);

    heldGarbage.quaternion.copy(verticalInspectionAttachedQuaternion);

    heldGarbage.scale.copy(verticalInspectionAttachedScale);

    const spinProgress = (progress - turnEnd) / (spinEnd - turnEnd);

    const gripPhase = spinProgress * Math.PI * 4;

    setHandFingerPose(
      [
        0.2 + Math.sin(gripPhase) * 0.1,
        0.6 + Math.sin(gripPhase + 0.7) * 0.12,
        0.75 + Math.sin(gripPhase + 1.35) * 0.08,
        0.84 + Math.sin(gripPhase + 1.9) * 0.05,
      ],
      0.05,
    );

    setHandThumbPose(
      0.78 + Math.sin(gripPhase) * 0.04,
      0.64 + Math.sin(gripPhase + 0.5) * 0.06,
    );

    const variableSpinProgress =
      spinProgress + Math.sin(spinProgress * Math.PI * 4) * 0.055;

    /*
      A small inward wrist roll follows the thumb spin,
      giving the motion the quick hooked-knife flourish
      and catch instead of a mechanical turntable feel.
  */
    const wristRoll =
      Math.sin(spinProgress * Math.PI) * THREE.MathUtils.degToRad(8) +
      Math.sin(spinProgress * Math.PI * 4) * THREE.MathUtils.degToRad(3);

    heldHand.rotation.x =
      HAND_VERTICAL_INSPECT_ROTATION.x - wristRoll * 0.45;

    heldHand.rotation.z = HAND_VERTICAL_INSPECT_ROTATION.z - wristRoll;

    heldHand.position.y =
      HAND_VERTICAL_INSPECT_POSITION.y +
      Math.sin(spinProgress * Math.PI) * 0.025;

    inspectionThumbPivot.rotation.x = variableSpinProgress * Math.PI * 4;

    return;
  }

  if (!verticalInspectionReturning) {
    inspectionThumbPivot.rotation.x = Math.PI * 4;

    camera.attach(heldGarbage);

    verticalInspectionReturnPosition.copy(heldGarbage.position);

    verticalInspectionReturnQuaternion.copy(heldGarbage.quaternion);

    verticalInspectionReturnScale.copy(heldGarbage.scale);

    verticalInspectionPivotAttached = false;

    verticalInspectionReturning = true;
  }

  const returnProgress = THREE.MathUtils.clamp(
    (progress - spinEnd) / (1 - spinEnd),
    0,
    1,
  );

  const returnEase =
    returnProgress * returnProgress * (3 - 2 * returnProgress);

  heldHand.position.lerpVectors(
    HAND_VERTICAL_INSPECT_POSITION,
    HAND_REST_POSITION,
    returnEase,
  );

  heldHand.rotation.set(
    THREE.MathUtils.lerp(
      HAND_VERTICAL_INSPECT_ROTATION.x,
      HAND_REST_ROTATION.x,
      returnEase,
    ),
    THREE.MathUtils.lerp(
      HAND_VERTICAL_INSPECT_ROTATION.y,
      HAND_REST_ROTATION.y,
      returnEase,
    ),
    THREE.MathUtils.lerp(
      HAND_VERTICAL_INSPECT_ROTATION.z,
      HAND_REST_ROTATION.z,
      returnEase,
    ),
  );

  blendHandPoses(HAND_POSE_VERTICAL_GRIP, HAND_POSE_REST, returnEase);

  const catchProgress = THREE.MathUtils.clamp(
    returnProgress / 0.45,
    0,
    1,
  );

  const catchRecoil = Math.sin(catchProgress * Math.PI);

  heldHand.rotation.z += catchRecoil * THREE.MathUtils.degToRad(6);

  heldHand.position.x -= catchRecoil * 0.025;

  heldGarbage.position.lerpVectors(
    verticalInspectionReturnPosition,
    HELD_POSITION,
    returnEase,
  );

  heldGarbage.quaternion.slerpQuaternions(
    verticalInspectionReturnQuaternion,
    heldGarbageQuaternion,
    returnEase,
  );

  heldGarbage.scale.set(
    THREE.MathUtils.lerp(verticalInspectionReturnScale.x, 1, returnEase),
    THREE.MathUtils.lerp(verticalInspectionReturnScale.y, 1, returnEase),
    THREE.MathUtils.lerp(verticalInspectionReturnScale.z, 1, returnEase),
  );
}

function updateButterflyInspection(progress) {
  const attachStart = 300 / BUTTERFLY_INSPECTION_DURATION;

  const flourishStart = 500 / BUTTERFLY_INSPECTION_DURATION;

  const flourishEnd = 1650 / BUTTERFLY_INSPECTION_DURATION;

  const returnStart = 1800 / BUTTERFLY_INSPECTION_DURATION;

  if (progress < attachStart) {
    const prepareProgress = progress / attachStart;

    const prepareEase =
      prepareProgress * prepareProgress * (3 - 2 * prepareProgress);

    heldHand.position.lerpVectors(
      HAND_REST_POSITION,
      HAND_BUTTERFLY_INSPECT_POSITION,
      prepareEase,
    );

    heldHand.rotation.set(
      THREE.MathUtils.lerp(
        HAND_REST_ROTATION.x,
        HAND_BUTTERFLY_INSPECT_ROTATION.x,
        prepareEase,
      ),
      THREE.MathUtils.lerp(
        HAND_REST_ROTATION.y,
        HAND_BUTTERFLY_INSPECT_ROTATION.y,
        prepareEase,
      ),
      THREE.MathUtils.lerp(
        HAND_REST_ROTATION.z,
        HAND_BUTTERFLY_INSPECT_ROTATION.z,
        prepareEase,
      ),
    );

    blendHandPoses(HAND_POSE_REST, HAND_POSE_BUTTERFLY_OPEN, prepareEase);

    heldGarbage.position.set(
      THREE.MathUtils.lerp(HELD_POSITION.x, 0, prepareEase),
      THREE.MathUtils.lerp(HELD_POSITION.y, -0.1, prepareEase),
      THREE.MathUtils.lerp(HELD_POSITION.z, -1.15, prepareEase),
    );

    heldGarbage.rotation.set(
      THREE.MathUtils.lerp(HELD_ROTATION.x, 0.35, prepareEase),
      THREE.MathUtils.lerp(HELD_ROTATION.y, -0.8, prepareEase),
      THREE.MathUtils.lerp(HELD_ROTATION.z, 0.25, prepareEase),
    );

    heldGarbage.scale.setScalar(
      THREE.MathUtils.lerp(1, 0.66, prepareEase),
    );

    return;
  }

  if (
    !butterflyInspectionPivotAttached &&
    !butterflyInspectionReturning
  ) {
    heldHand.position.copy(HAND_BUTTERFLY_INSPECT_POSITION);

    heldHand.rotation.copy(HAND_BUTTERFLY_INSPECT_ROTATION);

    applyHandPose(HAND_POSE_BUTTERFLY_OPEN);

    heldGarbage.position.set(0, -0.1, -1.15);

    heldGarbage.rotation.set(0.35, -0.8, 0.25);

    heldGarbage.scale.setScalar(0.66);

    camera.updateMatrixWorld(true);

    inspectionThumbPivot.attach(heldGarbage);

    verticalInspectionStartPosition.copy(heldGarbage.position);

    verticalInspectionStartQuaternion.copy(heldGarbage.quaternion);

    verticalInspectionStartScale.copy(heldGarbage.scale);

    butterflyInspectionPivotAttached = true;
  }

  if (progress < flourishStart) {
    const connectProgress =
      (progress - attachStart) / (flourishStart - attachStart);

    const connectEase =
      connectProgress * connectProgress * (3 - 2 * connectProgress);

    heldGarbage.position.lerpVectors(
      verticalInspectionStartPosition,
      butterflyInspectionAttachedPosition,
      connectEase,
    );

    heldGarbage.quaternion.slerpQuaternions(
      verticalInspectionStartQuaternion,
      butterflyInspectionAttachedQuaternion,
      connectEase,
    );

    heldGarbage.scale.lerpVectors(
      verticalInspectionStartScale,
      butterflyInspectionAttachedScale,
      connectEase,
    );

    blendHandPoses(
      HAND_POSE_BUTTERFLY_OPEN,
      HAND_POSE_BUTTERFLY_INDEX_GUIDE,
      connectEase,
    );

    return;
  }

  if (progress < flourishEnd) {
    const flourishProgress =
      (progress - flourishStart) / (flourishEnd - flourishStart);

    const variableFlourishProgress =
      flourishProgress + Math.sin(flourishProgress * Math.PI * 8) * 0.025;

    const flourishAngle = variableFlourishProgress * Math.PI * 8;

    const indexWave = (Math.sin(flourishAngle) + 1) / 2;

    const middleWave = (Math.sin(flourishAngle + Math.PI / 2) + 1) / 2;

    const ringWave = (Math.sin(flourishAngle + Math.PI) + 1) / 2;

    const pinkyWave = (Math.sin(flourishAngle + Math.PI * 1.5) + 1) / 2;

    setHandFingerPose(
      [
        THREE.MathUtils.lerp(0.12, 0.72, indexWave),
        THREE.MathUtils.lerp(0.16, 0.76, middleWave),
        THREE.MathUtils.lerp(0.38, 0.84, ringWave),
        THREE.MathUtils.lerp(0.52, 0.9, pinkyWave),
      ],
      THREE.MathUtils.lerp(0.08, 0.32, 1 - indexWave),
    );

    setHandThumbPose(
      THREE.MathUtils.lerp(0.62, 0.9, middleWave),
      THREE.MathUtils.lerp(0.42, 0.8, indexWave),
    );

    heldHand.position.copy(HAND_BUTTERFLY_INSPECT_POSITION);

    heldHand.position.x += Math.sin(flourishAngle / 2) * 0.045;

    heldHand.position.y += Math.sin(flourishAngle) * 0.03;

    heldHand.rotation.copy(HAND_BUTTERFLY_INSPECT_ROTATION);

    heldHand.rotation.z +=
      Math.sin(flourishAngle / 2) * THREE.MathUtils.degToRad(22);

    heldHand.rotation.x +=
      Math.sin(flourishAngle) * THREE.MathUtils.degToRad(12);

    heldHand.rotation.y +=
      Math.sin(flourishAngle / 2 + Math.PI / 3) *
      THREE.MathUtils.degToRad(9);

    heldGarbage.position.copy(butterflyInspectionAttachedPosition);

    heldGarbage.quaternion.copy(butterflyInspectionAttachedQuaternion);

    heldGarbage.scale.copy(butterflyInspectionAttachedScale);

    /*
      The main thumb rotation is crossed by alternating
      side arcs, imitating a butterfly-knife handle weave.
      The time warp stays positive so no flip freezes.
  */
    inspectionThumbPivot.rotation.x = flourishAngle;

    inspectionThumbPivot.rotation.y =
      Math.sin(flourishAngle) * THREE.MathUtils.degToRad(28);

    inspectionThumbPivot.rotation.z =
      Math.sin(flourishAngle / 2) * THREE.MathUtils.degToRad(50);

    return;
  }

  if (progress < returnStart) {
    const catchProgress =
      (progress - flourishEnd) / (returnStart - flourishEnd);

    const catchRecoil = Math.sin(catchProgress * Math.PI);

    const catchEase =
      catchProgress * catchProgress * (3 - 2 * catchProgress);

    blendHandPoses(
      HAND_POSE_BUTTERFLY_TRANSITION,
      HAND_POSE_CATCH,
      catchEase,
    );

    inspectionThumbPivot.rotation.set(Math.PI * 8, 0, 0);

    heldHand.position.copy(HAND_BUTTERFLY_INSPECT_POSITION);

    heldHand.position.x -= catchRecoil * 0.035;

    heldHand.rotation.copy(HAND_BUTTERFLY_INSPECT_ROTATION);

    heldHand.rotation.z += catchRecoil * THREE.MathUtils.degToRad(18);

    return;
  }

  if (!butterflyInspectionReturning) {
    inspectionThumbPivot.rotation.set(Math.PI * 8, 0, 0);

    camera.attach(heldGarbage);

    verticalInspectionReturnPosition.copy(heldGarbage.position);

    verticalInspectionReturnQuaternion.copy(heldGarbage.quaternion);

    verticalInspectionReturnScale.copy(heldGarbage.scale);

    butterflyInspectionPivotAttached = false;

    butterflyInspectionReturning = true;
  }

  const returnProgress = THREE.MathUtils.clamp(
    (progress - returnStart) / (1 - returnStart),
    0,
    1,
  );

  const returnEase =
    returnProgress * returnProgress * (3 - 2 * returnProgress);

  heldHand.position.lerpVectors(
    HAND_BUTTERFLY_INSPECT_POSITION,
    HAND_REST_POSITION,
    returnEase,
  );

  heldHand.rotation.set(
    THREE.MathUtils.lerp(
      HAND_BUTTERFLY_INSPECT_ROTATION.x,
      HAND_REST_ROTATION.x,
      returnEase,
    ),
    THREE.MathUtils.lerp(
      HAND_BUTTERFLY_INSPECT_ROTATION.y,
      HAND_REST_ROTATION.y,
      returnEase,
    ),
    THREE.MathUtils.lerp(
      HAND_BUTTERFLY_INSPECT_ROTATION.z,
      HAND_REST_ROTATION.z,
      returnEase,
    ),
  );

  blendHandPoses(HAND_POSE_CATCH, HAND_POSE_REST, returnEase);

  heldGarbage.position.lerpVectors(
    verticalInspectionReturnPosition,
    HELD_POSITION,
    returnEase,
  );

  heldGarbage.quaternion.slerpQuaternions(
    verticalInspectionReturnQuaternion,
    heldGarbageQuaternion,
    returnEase,
  );

  heldGarbage.scale.set(
    THREE.MathUtils.lerp(verticalInspectionReturnScale.x, 1, returnEase),
    THREE.MathUtils.lerp(verticalInspectionReturnScale.y, 1, returnEase),
    THREE.MathUtils.lerp(verticalInspectionReturnScale.z, 1, returnEase),
  );
}

function updateInspection() {
  if (!inspectionActive) {
    return;
  }

  if (!heldGarbage) {
    inspectionActive = false;

    return;
  }

  const now = performance.now();

  const inspectionDuration = getInspectionDuration();

  const spinRange = getInspectionSpinRange();

  let progress = THREE.MathUtils.clamp(
    (now - inspectionStartTime) / inspectionDuration,
    0,
    1,
  );

  if (inspectionKeyHeld && progress >= spinRange.start) {
    if (!inspectionLooping) {
      inspectionLooping = true;

      inspectionLoopStartTime =
        now -
        (Math.min(progress, spinRange.end) - spinRange.start) *
          inspectionDuration;
    }

    const loopDuration =
      (spinRange.end - spinRange.start) * inspectionDuration;

    progress =
      spinRange.start +
      ((now - inspectionLoopStartTime) % loopDuration) /
        inspectionDuration;

    inspectionLoopProgress = progress;
  }

  if (progress >= 1) {
    finishInspection();

    return;
  }

  if (inspectionMode === "vertical") {
    updateVerticalInspection(progress);

    return;
  }

  if (inspectionMode === "butterfly") {
    updateButterflyInspection(progress);

    return;
  }

  const rawHandBlend =
    progress < (inspectionMode === "vertical" ? 0.14 : 0.16)
      ? progress / (inspectionMode === "vertical" ? 0.14 : 0.16)
      : progress > (inspectionMode === "vertical" ? 0.86 : 0.9)
        ? (1 - progress) / (inspectionMode === "vertical" ? 0.14 : 0.1)
        : 1;

  const clampedHandBlend = THREE.MathUtils.clamp(rawHandBlend, 0, 1);

  const handBlend =
    clampedHandBlend * clampedHandBlend * (3 - 2 * clampedHandBlend);

  heldHand.position.lerpVectors(
    HAND_REST_POSITION,
    inspectionMode === "vertical"
      ? HAND_VERTICAL_INSPECT_POSITION
      : HAND_INSPECT_POSITION,
    handBlend,
  );

  if (inspectionMode === "horizontal") {
    heldHand.position.y +=
      Math.sin(progress * Math.PI * 8) * 0.012 * handBlend;
  }

  const targetHandRotation =
    inspectionMode === "vertical"
      ? HAND_VERTICAL_INSPECT_ROTATION
      : HAND_INSPECT_ROTATION;

  heldHand.rotation.set(
    THREE.MathUtils.lerp(
      HAND_REST_ROTATION.x,
      targetHandRotation.x,
      handBlend,
    ),

    THREE.MathUtils.lerp(
      HAND_REST_ROTATION.y,
      targetHandRotation.y,
      handBlend,
    ),

    THREE.MathUtils.lerp(
      HAND_REST_ROTATION.z,
      targetHandRotation.z,
      handBlend,
    ),
  );

  blendHandPoses(HAND_POSE_REST, HAND_POSE_DISPLAY, handBlend);

  if (progress >= 0.56 && progress <= 0.9) {
    const horizontalSpinProgress = (progress - 0.56) / 0.34;

    const horizontalFingerEnvelope = Math.sin(
      horizontalSpinProgress * Math.PI,
    );

    const horizontalFingerPhase = horizontalSpinProgress * Math.PI * 4;

    setHandFingerPose(
      [
        0.18 +
          (Math.sin(horizontalFingerPhase) + 1) *
            0.14 *
            horizontalFingerEnvelope,
        0.28 +
          (Math.sin(horizontalFingerPhase + 0.8) + 1) *
            0.1 *
            horizontalFingerEnvelope,
        0.42 +
          (Math.sin(horizontalFingerPhase + 1.5) + 1) *
            0.07 *
            horizontalFingerEnvelope,
        0.56 +
          (Math.sin(horizontalFingerPhase + 2.1) + 1) *
            0.045 *
            horizontalFingerEnvelope,
      ],
      0.2,
    );

    setHandThumbPose(
      0.3 + horizontalFingerEnvelope * 0.18,
      0.24 +
        (Math.sin(horizontalFingerPhase + 0.4) + 1) *
          0.08 *
          horizontalFingerEnvelope,
    );
  }

  if (inspectionMode === "vertical") {
    const attachProgress = THREE.MathUtils.clamp(progress / 0.14, 0, 1);

    const attachEase =
      attachProgress * attachProgress * (3 - 2 * attachProgress);

    const releaseProgress = THREE.MathUtils.clamp(
      (progress - 0.86) / 0.14,
      0,
      1,
    );

    const releaseEase =
      releaseProgress * releaseProgress * (3 - 2 * releaseProgress);

    const connectionBlend =
      progress < 0.86 ? attachEase : 1 - releaseEase;

    heldGarbage.position.lerpVectors(
      verticalInspectionStartPosition,
      verticalInspectionAttachedPosition,
      connectionBlend,
    );

    let previewYaw = 0;

    if (progress >= 0.14 && progress < 0.2) {
      const sideProgress = (progress - 0.14) / 0.06;

      const sideEase =
        sideProgress * sideProgress * (3 - 2 * sideProgress);

      previewYaw = THREE.MathUtils.lerp(
        0,
        THREE.MathUtils.degToRad(50),
        sideEase,
      );
    } else if (progress >= 0.2 && progress < 0.26) {
      previewYaw = THREE.MathUtils.degToRad(50);
    } else if (progress >= 0.26 && progress < 0.34) {
      const sideProgress = (progress - 0.26) / 0.08;

      const sideEase =
        sideProgress * sideProgress * (3 - 2 * sideProgress);

      previewYaw = THREE.MathUtils.lerp(
        THREE.MathUtils.degToRad(50),
        THREE.MathUtils.degToRad(-45),
        sideEase,
      );
    } else if (progress >= 0.34 && progress < 0.4) {
      previewYaw = THREE.MathUtils.degToRad(-45);
    } else if (progress >= 0.4 && progress < 0.44) {
      const sideProgress = (progress - 0.4) / 0.04;

      const sideEase =
        sideProgress * sideProgress * (3 - 2 * sideProgress);

      previewYaw = THREE.MathUtils.lerp(
        THREE.MathUtils.degToRad(-45),
        0,
        sideEase,
      );
    }

    verticalInspectionPreviewEuler.y = previewYaw;

    verticalInspectionPreviewQuaternion.setFromEuler(
      verticalInspectionPreviewEuler,
    );

    heldGarbage.quaternion.slerpQuaternions(
      verticalInspectionStartQuaternion,
      verticalInspectionPreviewQuaternion,
      connectionBlend,
    );

    heldGarbage.scale.lerpVectors(
      verticalInspectionStartScale,
      verticalInspectionAttachedScale,
      connectionBlend,
    );

    const spinProgress = THREE.MathUtils.clamp(
      (progress - 0.44) / 0.42,
      0,
      1,
    );

    /*
      Two speed surges make this feel like a wrist flick.
      The first-turn boundary is the fastest point rather
      than a keyframe, so the two turns stay uninterrupted.
  */
    const variableSpinProgress =
      spinProgress + Math.sin(spinProgress * Math.PI * 4) * 0.04;

    inspectionThumbPivot.rotation.x = variableSpinProgress * Math.PI * 4;

    return;
  }

  let nextIndex = 1;

  while (
    nextIndex < activeInspectionKeyframes.length - 1 &&
    progress > activeInspectionKeyframes[nextIndex].time
  ) {
    nextIndex++;
  }

  const previousFrame = activeInspectionKeyframes[nextIndex - 1];

  const nextFrame = activeInspectionKeyframes[nextIndex];

  const segmentProgress =
    (progress - previousFrame.time) /
    (nextFrame.time - previousFrame.time);

  const eased =
    segmentProgress * segmentProgress * (3 - 2 * segmentProgress);

  heldGarbage.position.set(
    THREE.MathUtils.lerp(
      previousFrame.position[0],
      nextFrame.position[0],
      eased,
    ),

    THREE.MathUtils.lerp(
      previousFrame.position[1],
      nextFrame.position[1],
      eased,
    ),

    THREE.MathUtils.lerp(
      previousFrame.position[2],
      nextFrame.position[2],
      eased,
    ),
  );

  heldGarbage.rotation.set(
    THREE.MathUtils.lerp(
      previousFrame.rotation[0],
      nextFrame.rotation[0],
      eased,
    ),

    THREE.MathUtils.lerp(
      previousFrame.rotation[1],
      nextFrame.rotation[1],
      eased,
    ),

    THREE.MathUtils.lerp(
      previousFrame.rotation[2],
      nextFrame.rotation[2],
      eased,
    ),
  );

  const scale = THREE.MathUtils.lerp(
    previousFrame.scale,
    nextFrame.scale,
    eased,
  );

  heldGarbage.scale.setScalar(scale);
}

/* ============================================================
   THROW
   ============================================================ */

function getThrowSpeed(chargeAmount) {
  const chargeUnits =
    (chargeAmount * MAX_THROW_CHARGE_TIME) / THROW_CHARGE_REFERENCE_TIME;

  return MIN_THROW_SPEED + THROW_SPEED_GAIN * Math.pow(chargeUnits, 0.85);
}

function getThrowLift() {
  return MIN_THROW_LIFT;
}

function clearChargeViewOffset() {
  if (chargeViewOffsetActive) {
    camera.clearViewOffset();

    chargeViewOffsetActive = false;
  }
}

function cancelThrowCharge() {
  throwCharging = false;

  throwChargeAmount = 0;

  clearChargeViewOffset();

  if (heldGarbage) {
    heldHand.position.copy(HAND_REST_POSITION);

    heldHand.rotation.copy(HAND_REST_ROTATION);

    heldGarbage.position.copy(HELD_POSITION);
  }
}

function beginThrowCharge() {
  if (!heldGarbage || throwCharging) {
    return;
  }

  finishInspection();

  throwCharging = true;

  throwChargeStartTime = performance.now();

  throwChargeAmount = 0;
}

function updateThrowChargeEffects() {
  if (
    !throwCharging ||
    !heldGarbage ||
    !gameRunning ||
    !controls.isLocked
  ) {
    if (throwCharging) {
      cancelThrowCharge();
    }

    return;
  }

  throwChargeAmount = THREE.MathUtils.clamp(
    (performance.now() - throwChargeStartTime) / MAX_THROW_CHARGE_TIME,
    0,
    1,
  );

  const chargeTimeUnits =
    (throwChargeAmount * MAX_THROW_CHARGE_TIME) /
    THROW_CHARGE_REFERENCE_TIME;

  const shakeStrength = Math.pow(chargeTimeUnits, 0.9);

  const shakeTime = performance.now() * 0.001;

  const shakeX =
    (Math.sin(shakeTime * (71 + chargeTimeUnits * 2.5)) +
      Math.sin(shakeTime * 43) * 0.45) *
    8 *
    shakeStrength;

  const shakeY =
    (Math.cos(shakeTime * (67 + chargeTimeUnits * 2.2)) +
      Math.sin(shakeTime * 37) * 0.4) *
    7 *
    shakeStrength;

  camera.setViewOffset(
    window.innerWidth,
    window.innerHeight,
    shakeX,
    shakeY,
    window.innerWidth,
    window.innerHeight,
  );

  chargeViewOffsetActive = true;

  heldHand.position.copy(HAND_REST_POSITION);

  heldHand.position.z += throwChargeAmount * 0.07;

  heldHand.rotation.copy(HAND_REST_ROTATION);

  heldHand.rotation.x -= throwChargeAmount * 0.08;

  heldGarbage.position.copy(HELD_POSITION);

  heldGarbage.position.z += throwChargeAmount * 0.055;
}

function releaseThrowCharge() {
  if (!throwCharging || !heldGarbage) {
    cancelThrowCharge();

    return;
  }

  const releasedCharge = throwChargeAmount;

  throwCharging = false;

  throwChargeAmount = 0;

  clearChargeViewOffset();

  throwGarbage(releasedCharge);
}

function throwGarbage(chargeAmount = 0) {
  if (!heldGarbage) {
    return;
  }

  throwCharging = false;

  throwChargeAmount = 0;

  clearChargeViewOffset();

  finishInspection();

  heldHand.visible = true;

  /*
  scene.attach preserves
  world transform when moving
  object from camera to scene.
    */

  scene.attach(heldGarbage);

  const direction = new THREE.Vector3();

  camera.getWorldDirection(direction);

  projectileVelocity

    .copy(direction)

    .multiplyScalar(getThrowSpeed(chargeAmount));

  /*
  Slight upward force.
    */

  projectileVelocity.y += getThrowLift();

  projectileAngularVelocity.set(
    THREE.MathUtils.lerp(5.2, 9, chargeAmount),
    direction.x * THREE.MathUtils.lerp(3.5, 6, chargeAmount),
    THREE.MathUtils.lerp(3.2, 6.5, chargeAmount) - direction.x * 2,
  );

  trajectoryLine.visible = false;

  trajectoryEndMarker.visible = false;

  throwTrailPoints.length = 0;

  throwTrailPoints.push(heldGarbage.position.clone());

  throwTrailGeometry.setFromPoints(throwTrailPoints);

  throwTrail.visible = true;

  if (thrownGarbage && thrownGarbageState === "floor") {
    droppedGarbageItems.push({
      garbage: thrownGarbage,
      data: thrownGarbageData,
    });
  }

  thrownGarbage = heldGarbage;

  thrownGarbageData = heldGarbageData;

  thrownGarbageState = "thrown";

  heldGarbage = null;

  heldGarbageData = null;

  showMessage(
    chargeAmount > 0.92
      ? "MAX POWER THROW!"
      : chargeAmount > 0.45
        ? "POWER THROW!"
        : "THROW!",

    "good",
  );
}

/* ============================================================
   F INTERACTION
   ============================================================ */

function interact() {
  if (!gameRunning || !controls.isLocked) {
    return;
  }

  if (heldGarbage) {
    beginThrowCharge();
  } else {
    tryPickup();
  }
}
