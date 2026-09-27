/* ============================================================
   FIRST-PERSON LOW-POLY HAND
   ============================================================ */

const heldHand = new THREE.Group();

const handMaterial = createMaterial(0xd6a177, 0.78, 0);

const sleeveMaterial = createMaterial(0x263e63, 0.72, 0.02);

const nailMaterial = createMaterial(0xf0c7a9, 0.5, 0);

const cuffMaterial = createMaterial(0x182a47, 0.8, 0.01);

const handPalm = new THREE.Mesh(
  new THREE.BoxGeometry(0.3, 0.18, 0.36),

  handMaterial,
);

heldHand.add(handPalm);

const handPalmHeel = new THREE.Mesh(
  new THREE.BoxGeometry(0.27, 0.19, 0.15),
  handMaterial,
);

handPalmHeel.position.z = 0.2;

heldHand.add(handPalmHeel);

const palmPad = new THREE.Mesh(
  new THREE.BoxGeometry(0.23, 0.025, 0.22),
  handMaterial,
);

palmPad.position.set(0, -0.1, -0.03);

heldHand.add(palmPad);

const handFingerJoints = [];

const fingerSpecifications = [
  {
    x: -0.105,
    width: 0.055,
    lengths: [0.105, 0.085, 0.07],
    spread: -1.5,
  },
  {
    x: -0.035,
    width: 0.06,
    lengths: [0.125, 0.1, 0.075],
    spread: -0.5,
  },
  {
    x: 0.035,
    width: 0.06,
    lengths: [0.12, 0.095, 0.073],
    spread: 0.5,
  },
  {
    x: 0.105,
    width: 0.052,
    lengths: [0.095, 0.078, 0.064],
    spread: 1.5,
  },
];

for (const specification of fingerSpecifications) {
  const fingerRoot = new THREE.Group();

  fingerRoot.position.set(specification.x, 0, -0.17);

  const middleJoint = new THREE.Group();

  const tipJoint = new THREE.Group();

  const proximal = new THREE.Mesh(
    new THREE.BoxGeometry(
      specification.width,
      0.105,
      specification.lengths[0],
    ),
    handMaterial,
  );

  proximal.position.z = -specification.lengths[0] / 2;

  fingerRoot.add(proximal);

  middleJoint.position.z = -specification.lengths[0];

  const middle = new THREE.Mesh(
    new THREE.BoxGeometry(
      specification.width * 0.94,
      0.098,
      specification.lengths[1],
    ),
    handMaterial,
  );

  middle.position.z = -specification.lengths[1] / 2;

  middleJoint.add(middle);

  tipJoint.position.z = -specification.lengths[1];

  const distal = new THREE.Mesh(
    new THREE.BoxGeometry(
      specification.width * 0.88,
      0.09,
      specification.lengths[2],
    ),
    handMaterial,
  );

  distal.position.z = -specification.lengths[2] / 2;

  tipJoint.add(distal);

  const nail = new THREE.Mesh(
    new THREE.BoxGeometry(
      specification.width * 0.66,
      0.008,
      specification.lengths[2] * 0.55,
    ),
    nailMaterial,
  );

  nail.position.set(0, 0.049, -specification.lengths[2] * 0.58);

  tipJoint.add(nail);

  middleJoint.add(tipJoint);

  fingerRoot.add(middleJoint);

  heldHand.add(fingerRoot);

  handFingerJoints.push({
    root: fingerRoot,
    middle: middleJoint,
    tip: tipJoint,
    spread: specification.spread,
  });
}

const handThumb = new THREE.Group();

handThumb.position.set(-0.145, -0.005, -0.03);

handThumb.rotation.z = -0.38;

handThumb.rotation.y = 0.78;

const thumbProximal = new THREE.Mesh(
  new THREE.BoxGeometry(0.105, 0.115, 0.15),
  handMaterial,
);

thumbProximal.position.z = -0.065;

handThumb.add(thumbProximal);

const thumbDistalJoint = new THREE.Group();

thumbDistalJoint.position.z = -0.13;

thumbDistalJoint.rotation.x = -0.18;

const thumbDistal = new THREE.Mesh(
  new THREE.BoxGeometry(0.095, 0.105, 0.13),
  handMaterial,
);

thumbDistal.position.z = -0.06;

thumbDistalJoint.add(thumbDistal);

const thumbNail = new THREE.Mesh(
  new THREE.BoxGeometry(0.06, 0.008, 0.07),
  nailMaterial,
);

thumbNail.position.set(0, 0.057, -0.075);

thumbDistalJoint.add(thumbNail);

handThumb.add(thumbDistalJoint);

heldHand.add(handThumb);

/*
    The vertical inspection uses the thumb as a real pivot.
    Keeping this pivot inside the hand makes the waste follow
    every sideways movement of the wrist without visually
    separating from the thumb.
*/
const inspectionThumbPivot = new THREE.Group();

inspectionThumbPivot.position.copy(
  new THREE.Vector3(-0.285, 0.055, -0.13),
);

heldHand.add(inspectionThumbPivot);

const handWrist = new THREE.Mesh(
  new THREE.BoxGeometry(0.235, 0.17, 0.18),
  handMaterial,
);

handWrist.position.z = 0.3;

heldHand.add(handWrist);

const handCuff = new THREE.Mesh(
  new THREE.BoxGeometry(0.31, 0.235, 0.14),
  cuffMaterial,
);

handCuff.position.z = 0.43;

heldHand.add(handCuff);

const handSleeve = new THREE.Mesh(
  new THREE.BoxGeometry(0.3, 0.23, 0.52),

  sleeveMaterial,
);

handSleeve.position.z = 0.72;

heldHand.add(handSleeve);

const sleeveSeam = new THREE.Mesh(
  new THREE.BoxGeometry(0.305, 0.012, 0.35),
  cuffMaterial,
);

sleeveSeam.position.set(0, 0.12, 0.72);

heldHand.add(sleeveSeam);

function setHandFingerPose(curl, spread = 0) {
  for (
    let fingerIndex = 0;
    fingerIndex < handFingerJoints.length;
    fingerIndex++
  ) {
    const finger = handFingerJoints[fingerIndex];

    const fingerCurl = Array.isArray(curl) ? curl[fingerIndex] : curl;

    finger.root.rotation.x = -0.06 - fingerCurl * 0.58;

    finger.root.rotation.y = finger.spread * spread * 0.22;

    finger.middle.rotation.x = -fingerCurl * 0.95;

    finger.tip.rotation.x = -fingerCurl * 0.82;
  }
}

const thumbTipLocalPosition = new THREE.Vector3(0, 0.045, -0.13);

const thumbTipWorldPosition = new THREE.Vector3();

function syncInspectionPivotToThumb() {
  inspectionThumbPivot.position.set(-0.17, 0.08, -0.01);
}

function setHandThumbPose(opposition, bend) {
  handThumb.rotation.z = -0.22 - opposition * 0.36;

  handThumb.rotation.y = 0.5 + opposition * 0.36;

  thumbDistalJoint.rotation.x = -0.05 - bend * 0.72;

  syncInspectionPivotToThumb();
}

const HAND_POSE_REST = {
  curls: [0.4, 0.48, 0.55, 0.62],
  spread: 0.06,
  thumbOpposition: 0.36,
  thumbBend: 0.42,
};

const HAND_POSE_DISPLAY = {
  curls: [0.18, 0.28, 0.42, 0.56],
  spread: 0.2,
  thumbOpposition: 0.3,
  thumbBend: 0.24,
};

const HAND_POSE_VERTICAL_GRIP = {
  curls: [0.24, 0.58, 0.74, 0.82],
  spread: 0.04,
  thumbOpposition: 0.78,
  thumbBend: 0.62,
};

const HAND_POSE_BUTTERFLY_OPEN = {
  curls: [0.12, 0.2, 0.38, 0.52],
  spread: 0.3,
  thumbOpposition: 0.52,
  thumbBend: 0.32,
};

const HAND_POSE_BUTTERFLY_INDEX_GUIDE = {
  curls: [0.16, 0.6, 0.78, 0.86],
  spread: 0.12,
  thumbOpposition: 0.72,
  thumbBend: 0.58,
};

const HAND_POSE_BUTTERFLY_MIDDLE_GUIDE = {
  curls: [0.64, 0.18, 0.48, 0.7],
  spread: 0.22,
  thumbOpposition: 0.84,
  thumbBend: 0.7,
};

const HAND_POSE_BUTTERFLY_TRANSITION = {
  curls: [0.4, 0.39, 0.63, 0.78],
  spread: 0.17,
  thumbOpposition: 0.78,
  thumbBend: 0.64,
};

const HAND_POSE_CATCH = {
  curls: [0.5, 0.72, 0.86, 0.92],
  spread: 0.02,
  thumbOpposition: 0.88,
  thumbBend: 0.8,
};

const blendedHandCurls = [0, 0, 0, 0];

function applyHandPose(pose) {
  setHandFingerPose(pose.curls, pose.spread);

  setHandThumbPose(pose.thumbOpposition, pose.thumbBend);
}

function blendHandPoses(fromPose, toPose, amount) {
  for (let fingerIndex = 0; fingerIndex < 4; fingerIndex++) {
    blendedHandCurls[fingerIndex] = THREE.MathUtils.lerp(
      fromPose.curls[fingerIndex],
      toPose.curls[fingerIndex],
      amount,
    );
  }

  setHandFingerPose(
    blendedHandCurls,
    THREE.MathUtils.lerp(fromPose.spread, toPose.spread, amount),
  );

  setHandThumbPose(
    THREE.MathUtils.lerp(
      fromPose.thumbOpposition,
      toPose.thumbOpposition,
      amount,
    ),
    THREE.MathUtils.lerp(fromPose.thumbBend, toPose.thumbBend, amount),
  );
}

applyHandPose(HAND_POSE_REST);

/*
    Keep the inspection rig, but restore the original visible
    three-block first-person hand requested by the player.
*/
handPalm.visible = false;

handPalmHeel.visible = false;

palmPad.visible = false;

for (const finger of handFingerJoints) {
  finger.root.visible = false;
}

handThumb.visible = false;

handWrist.visible = false;

handCuff.visible = false;

handSleeve.visible = false;

sleeveSeam.visible = false;

const blockHandPalm = new THREE.Mesh(
  new THREE.BoxGeometry(0.28, 0.2, 0.34),
  handMaterial,
);

heldHand.add(blockHandPalm);

const blockHandThumb = new THREE.Mesh(
  new THREE.BoxGeometry(0.11, 0.12, 0.18),
  handMaterial,
);

blockHandThumb.position.set(-0.17, 0.01, -0.02);

blockHandThumb.rotation.z = -0.32;

heldHand.add(blockHandThumb);

const blockHandSleeve = new THREE.Mesh(
  new THREE.BoxGeometry(0.24, 0.2, 0.48),
  sleeveMaterial,
);

blockHandSleeve.position.z = 0.38;

heldHand.add(blockHandSleeve);

syncInspectionPivotToThumb();

const HAND_REST_POSITION = new THREE.Vector3(0.43, -0.58, -1.02);

const HAND_INSPECT_POSITION = new THREE.Vector3(0, -0.31, -0.9);

const HAND_VERTICAL_INSPECT_POSITION = new THREE.Vector3(0, -0.16, -1.12);

const HAND_BUTTERFLY_INSPECT_POSITION = new THREE.Vector3(
  0.02,
  -0.2,
  -1.1,
);

const HAND_REST_ROTATION = new THREE.Euler(-0.15, -0.2, 0.08);

const HAND_INSPECT_ROTATION = new THREE.Euler(-0.08, 0, 0);

const HAND_VERTICAL_INSPECT_ROTATION = new THREE.Euler(
  0,
  THREE.MathUtils.degToRad(80),
  -0.15,
);

const HAND_BUTTERFLY_INSPECT_ROTATION = new THREE.Euler(
  THREE.MathUtils.degToRad(-8),
  THREE.MathUtils.degToRad(38),
  THREE.MathUtils.degToRad(-22),
);

heldHand.position.copy(HAND_REST_POSITION);

heldHand.rotation.copy(HAND_REST_ROTATION);

heldHand.visible = true;

camera.add(heldHand);

/* ============================================================
   LIGHTS
   ============================================================ */

const ambientLight = new THREE.AmbientLight(
  0xffffff,

  0.72,
);

scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(
  0xffffff,

  1.65,
);

mainLight.position.set(-5, 10, 3);

mainLight.castShadow = true;

mainLight.shadow.mapSize.set(
  2048,

  2048,
);

scene.add(mainLight);

const factoryFillLight = new THREE.HemisphereLight(
  0xd9efff,

  0x293136,

  0.62,
);

scene.add(factoryFillLight);

/* ============================================================
   FLOOR
   ============================================================ */

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(
    40,

    40,
  ),

  createMaterial(0x343b3e, 0.94, 0.02),
);

floor.rotation.x = -Math.PI / 2;

floor.receiveShadow = true;

scene.add(floor);

/* ============================================================
   FLOOR GRID
   ============================================================ */

const grid = new THREE.GridHelper(
  40,

  40,

  0x59696e,

  0x3b474c,
);

grid.position.y = 0.01;

scene.add(grid);

/* ============================================================
   WALL HELPER
   ============================================================ */

const worldCollisionMeshes = [];

function createWall(
  width,

  height,

  depth,

  x,

  y,

  z,
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(
      width,

      height,

      depth,
    ),

    createMaterial(0x46545b),
  );

  mesh.position.set(
    x,

    y,

    z,
  );

  mesh.receiveShadow = true;

  scene.add(mesh);

  worldCollisionMeshes.push(mesh);

  return mesh;
}

/* ============================================================
   WALLS
   ============================================================ */

createWall(
  20,

  5,

  0.4,

  0,

  2.5,

  -9,
);

createWall(
  20,

  5,

  0.4,

  0,

  2.5,

  9,
);

createWall(
  0.4,

  5,

  18,

  -10,

  2.5,

  0,
);

/* structural wall columns and safety skirting */

const structuralMetal = createMaterial(0x778389, 0.34, 0.66);

for (let x = -8; x <= 8; x += 4) {
  for (const z of [-8.72, 8.72]) {
    const column = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 5, 0.18),

      structuralMetal,
    );

    column.position.set(x, 2.5, z);

    column.castShadow = true;

    scene.add(column);

    worldCollisionMeshes.push(column);
  }
}

for (const z of [-8.75, 8.75]) {
  const skirting = new THREE.Mesh(
    new THREE.BoxGeometry(19.4, 0.28, 0.12),

    createMaterial(0xd0a735, 0.55, 0.18),
  );

  skirting.position.set(0, 0.16, z);

  scene.add(skirting);

  worldCollisionMeshes.push(skirting);
}

createWall(
  0.4,

  5,

  18,

  10,

  2.5,

  0,
);

/* ============================================================
   CEILING LIGHTS
   ============================================================ */

const ceiling = new THREE.Mesh(
  new THREE.BoxGeometry(20, 0.32, 18),

  new THREE.MeshStandardMaterial({
    color: 0x3b454a,

    roughness: 0.88,

    metalness: 0.08,

    side: THREE.DoubleSide,
  }),
);

ceiling.position.y = 5.08;

ceiling.receiveShadow = true;

scene.add(ceiling);

worldCollisionMeshes.push(ceiling);

/* Recessed ceiling panels make the roof read as a solid build. */
for (let panelX = -8; panelX <= 8; panelX += 4) {
  for (let panelZ = -7.5; panelZ <= 7.5; panelZ += 3) {
    const ceilingPanel = new THREE.Mesh(
      new THREE.BoxGeometry(3.72, 0.08, 2.72),
      createMaterial(
        (panelX + panelZ) % 2 === 0 ? 0x58636a : 0x505b61,
        0.9,
        0.04,
      ),
    );

    ceilingPanel.position.set(panelX, 4.86, panelZ);

    ceilingPanel.receiveShadow = true;

    scene.add(ceilingPanel);

    worldCollisionMeshes.push(ceilingPanel);
  }
}

for (const z of [-6, -2, 2, 6]) {
  const ceilingBeam = new THREE.Mesh(
    new THREE.BoxGeometry(19.5, 0.2, 0.22),

    structuralMetal,
  );

  ceilingBeam.position.set(0, 4.78, z);

  ceilingBeam.castShadow = true;

  scene.add(ceilingBeam);

  worldCollisionMeshes.push(ceilingBeam);
}

/* Longitudinal steel rails complete the structural grid. */
for (const x of [-8, -4, 0, 4, 8]) {
  const ceilingRail = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.24, 17.6),
    structuralMetal,
  );

  ceilingRail.position.set(x, 4.74, 0);

  ceilingRail.castShadow = true;

  scene.add(ceilingRail);

  worldCollisionMeshes.push(ceilingRail);
}

for (let x = -6; x <= 6; x += 4) {
  const lightHousing = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.18, 0.72),
    structuralMetal,
  );

  lightHousing.position.set(x, 4.6, 0);

  lightHousing.castShadow = true;

  scene.add(lightHousing);

  worldCollisionMeshes.push(lightHousing);

  const lightPanel = new THREE.Mesh(
    new THREE.BoxGeometry(
      2.2,

      0.12,

      0.45,
    ),

    new THREE.MeshBasicMaterial({
      color: 0xcdeeff,
    }),
  );

  lightPanel.position.set(
    x,

    4.49,

    0,
  );

  scene.add(lightPanel);

  const ceilingGlow = new THREE.PointLight(
    0xdff4ff,

    0.34,

    8,

    2,
  );

  ceilingGlow.position.set(x, 4.45, 0);

  scene.add(ceilingGlow);
}

/* Suspended ventilation duct with visible modular joints. */
const ceilingDuct = new THREE.Mesh(
  new THREE.BoxGeometry(1.15, 0.56, 13.5),
  createMaterial(0x778188, 0.48, 0.52),
);

ceilingDuct.position.set(7.2, 4.43, 0);

ceilingDuct.castShadow = true;

ceilingDuct.receiveShadow = true;

scene.add(ceilingDuct);

worldCollisionMeshes.push(ceilingDuct);

for (let ductZ = -6; ductZ <= 6; ductZ += 1.5) {
  const ductJoint = new THREE.Mesh(
    new THREE.BoxGeometry(1.22, 0.62, 0.08),
    structuralMetal,
  );

  ductJoint.position.set(7.2, 4.43, ductZ);

  scene.add(ductJoint);

  worldCollisionMeshes.push(ductJoint);
}

/* Exposed utility pipes reinforce the industrial ceiling. */
for (const pipeX of [-7.5, -6.95]) {
  const ceilingPipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 15.5, 10),
    createMaterial(pipeX < -7.2 ? 0xb64538 : 0x4f7185, 0.5, 0.34),
  );

  ceilingPipe.rotation.x = Math.PI / 2;

  ceilingPipe.position.set(pipeX, 4.48, 0);

  ceilingPipe.castShadow = true;

  scene.add(ceilingPipe);

  worldCollisionMeshes.push(ceilingPipe);
}

/* ============================================================
   CONVEYOR GROUP
   ============================================================ */

const conveyor = new THREE.Group();

/* belt */

const belt = new THREE.Mesh(
  new THREE.BoxGeometry(
    11.5,

    0.22,

    1.9,
  ),

  createMaterial(0x171b1d, 0.9, 0.02),
);

belt.position.y = 0.92;

belt.receiveShadow = true;

conveyor.add(belt);

worldCollisionMeshes.push(belt);

/* conveyor strips */

for (let x = -5.2; x <= 5.2; x += 0.65) {
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.045,

      0.018,

      1.85,
    ),

    createMaterial(0x56646a),
  );

  strip.position.set(
    x,

    1.04,

    0,
  );

  conveyor.add(strip);
}

/* rails */

const railMaterial = createMaterial(0x8a969b, 0.3, 0.72);

const rail1 = new THREE.Mesh(
  new THREE.BoxGeometry(
    11.8,

    0.35,

    0.14,
  ),

  railMaterial,
);

rail1.position.set(
  0,

  1.2,

  1.05,
);

conveyor.add(rail1);

worldCollisionMeshes.push(rail1);

const rail2 = rail1.clone();

rail2.position.z = -1.05;

conveyor.add(rail2);

worldCollisionMeshes.push(rail2);

/* end rollers */

for (const x of [-5.55, 5.55]) {
  const roller = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 1.94, 16),

    createMaterial(0x7b8589, 0.26, 0.8),
  );

  roller.rotation.x = Math.PI / 2;

  roller.position.set(x, 0.92, 0);

  roller.castShadow = true;

  conveyor.add(roller);

  worldCollisionMeshes.push(roller);
}

/* legs */

for (const x of [
  -4.5,

  -1.5,

  1.5,

  4.5,
]) {
  for (const z of [
    -0.75,

    0.75,
  ]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(
        0.22,

        0.85,

        0.22,
      ),

      createMaterial(0x68757a),
    );

    leg.position.set(
      x,

      0.42,

      z,
    );

    conveyor.add(leg);

    worldCollisionMeshes.push(leg);

    const foot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.24, 0.08, 12),

      railMaterial,
    );

    foot.position.set(x, 0.04, z);

    conveyor.add(foot);

    worldCollisionMeshes.push(foot);
  }
}

/* conveyor motor */

const conveyorMotor = new THREE.Mesh(
  new THREE.CylinderGeometry(0.34, 0.34, 0.65, 16),

  createMaterial(0x46555c, 0.38, 0.58),
);

conveyorMotor.rotation.x = Math.PI / 2;

conveyorMotor.position.set(4.5, 0.48, 1.02);

conveyorMotor.castShadow = true;

conveyor.add(conveyorMotor);

worldCollisionMeshes.push(conveyorMotor);

conveyor.traverse((object) => {
  if (object.isMesh) {
    object.castShadow = true;

    object.receiveShadow = true;
  }
});

/*
    Conveyor is in front
    of starting player.
*/

conveyor.position.z = -5;

scene.add(conveyor);

const conveyorPlayerBounds = new THREE.Box3().setFromObject(conveyor);

/* ============================================================
   TEXT SPRITE
   ============================================================ */

function createTextSprite(
  text,

  background,
) {
  const canvas = document.createElement("canvas");

  canvas.width = 512;

  canvas.height = 128;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = background;

  ctx.fillRect(
    0,

    0,

    512,

    128,
  );

  ctx.strokeStyle = "#111111";

  ctx.lineWidth = 14;

  ctx.strokeRect(
    7,

    7,

    498,

    114,
  );

  ctx.font = "bold 40px Courier New";

  ctx.fillStyle = "white";

  ctx.textAlign = "center";

  ctx.textBaseline = "middle";

  ctx.fillText(
    text,

    256,

    64,
  );

  const texture = new THREE.CanvasTexture(canvas);

  texture.magFilter = THREE.NearestFilter;

  texture.minFilter = THREE.NearestFilter;

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,

      transparent: true,
    }),
  );

  sprite.scale.set(
    2.6,

    0.65,

    1,
  );

  return sprite;
}

/* ============================================================
   BINS
   ============================================================ */

const bins = [];

function createBin(
  x,

  color,

  type,

  label,
) {
  const group = new THREE.Group();

  const collisionMeshes = [];

  const binMaterial = createMaterial(color, 0.64, 0.025);

  const binAccentMaterial = createMaterial(
    new THREE.Color(color).multiplyScalar(0.72).getHex(),

    0.7,

    0.02,
  );

  /*
  Back
    */

  const back = new THREE.Mesh(
    new THREE.BoxGeometry(
      1.98,

      1.8,

      0.18,
    ),

    binMaterial,
  );

  back.position.set(
    0,

    0.9,

    0.82,
  );

  group.add(back);

  collisionMeshes.push(back);

  /*
  Left
    */

  const left = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.18,

      1.8,

      1.64,
    ),

    binMaterial,
  );

  left.position.set(
    -0.91,

    0.9,

    0,
  );

  group.add(left);

  collisionMeshes.push(left);

  /*
  Right
    */

  const right = left.clone();

  right.position.x = 0.91;

  group.add(right);

  collisionMeshes.push(right);

  /*
  Front wall
    */

  const front = new THREE.Mesh(
    new THREE.BoxGeometry(
      1.98,

      1.35,

      0.18,
    ),

    binMaterial,
  );

  front.position.set(
    0,

    0.675,

    -0.82,
  );

  group.add(front);

  collisionMeshes.push(front);

  /* molded strengthening ribs on the front */

  for (const ribX of [-0.52, 0, 0.52]) {
    const frontRib = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.86, 0.035),

      binAccentMaterial,
    );

    frontRib.position.set(ribX, 0.78, -0.925);

    group.add(frontRib);
  }

  /*
  Bottom
    */

  const bottom = new THREE.Mesh(
    new THREE.BoxGeometry(
      1.84,

      0.14,

      1.54,
    ),

    createMaterial(0x20262a),
  );

  bottom.position.y = 0.08;

  group.add(bottom);

  collisionMeshes.push(bottom);

  /* reinforced top rim */

  for (const z of [-0.84, 0.84]) {
    const rimBar = new THREE.Mesh(
      new THREE.BoxGeometry(2.08, 0.13, 0.14),

      binMaterial,
    );

    rimBar.position.set(0, 1.82, z);

    group.add(rimBar);

    collisionMeshes.push(rimBar);
  }

  for (const sideX of [-0.98, 0.98]) {
    const sideRim = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.13, 1.7),

      binMaterial,
    );

    sideRim.position.set(sideX, 1.82, 0);

    group.add(sideRim);

    collisionMeshes.push(sideRim);
  }

  const binOpening = new THREE.Mesh(
    new THREE.PlaneGeometry(1.78, 1.48),

    createMaterial(0x111416, 1, 0),
  );

  binOpening.rotation.x = -Math.PI / 2;

  binOpening.position.set(0, 1.74, 0);

  group.add(binOpening);

  /* hinged lid, held open for throwing */

  const lidPivot = new THREE.Group();

  lidPivot.position.set(0, 1.86, 0.82);

  lidPivot.rotation.x = 1.48;

  const lid = new THREE.Mesh(
    new THREE.BoxGeometry(2.08, 0.11, 1.72),

    binMaterial,
  );

  lid.position.set(0, 0, -0.82);

  lidPivot.add(lid);

  const lidGrip = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.09, 0.12),

    binAccentMaterial,
  );

  lidGrip.position.set(0, -0.08, -1.65);

  lidPivot.add(lidGrip);

  group.add(lidPivot);

  collisionMeshes.push(lid, lidGrip);

  for (const wheelX of [-0.62, 0.62]) {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.13, 12),

      createMaterial(0x171a1c, 0.84, 0.03),
    );

    wheel.rotation.z = Math.PI / 2;

    wheel.position.set(wheelX, 0.15, 0.87);

    group.add(wheel);
  }

  const wheelAxle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 1.58, 10),

    createMaterial(0x555e62, 0.3, 0.72),
  );

  wheelAxle.rotation.z = Math.PI / 2;

  wheelAxle.position.set(0, 0.15, 0.87);

  group.add(wheelAxle);

  const rearHandle = new THREE.Mesh(
    new THREE.BoxGeometry(0.82, 0.1, 0.12),

    createMaterial(0x252b2e, 0.72, 0.08),
  );

  rearHandle.position.set(0, 1.58, 0.96);

  group.add(rearHandle);

  group.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true;

      object.receiveShadow = true;
    }
  });

  /*
  Position behind player
    */

  group.position.set(
    x,

    0,

    5.5,
  );

  /*
  Label
    */

  const hex = "#" + color.toString(16).padStart(6, "0");

  const sign = createTextSprite(
    label,

    hex,
  );

  sign.position.set(
    0,

    3.55,

    0,
  );

  group.add(sign);

  scene.add(group);

  bins.push({
    group: group,

    type: type,

    center: new THREE.Vector3(
      x,

      0.9,

      5.5,
    ),

    halfSize: new THREE.Vector3(
      1.02,

      1,

      0.89,
    ),

    openingHeight: 1.76,

    openingHalfSize: new THREE.Vector2(0.82, 0.68),

    interiorHalfSize: new THREE.Vector2(0.81, 0.72),

    interiorMinY: 0.16,

    interiorMaxY: 1.76,

    collisionMeshes: collisionMeshes,
  });
}

/* ============================================================
   CREATE FOUR BINS
   ============================================================ */

createBin(
  -3.6,

  0x347ccd,

  "recyclable",

  "RECYCLABLE",
);

createBin(
  -1.2,

  0x4b9d47,

  "food",

  "FOOD",
);

createBin(
  1.2,

  0xc64747,

  "hazardous",

  "HAZARDOUS",
);

createBin(
  3.6,

  0x626b70,

  "other",

  "OTHER",
);
