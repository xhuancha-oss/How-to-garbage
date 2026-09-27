/* ============================================================
   GAME CONFIG
   ============================================================ */

const INITIAL_TIME = 10;

const TIME_DECREASE = 0.2;

const MIN_TIME = 5;

const ITEM_LIFETIME = 20;

/* ============================================================
   GAME STATE
   ============================================================ */

let health = 5;

let score = 0;

let wasteCount = 0;

let combo = 0;

let gameRunning = false;

let currentGarbage = null;

let heldGarbage = null;

let heldGarbageData = null;

let thrownGarbage = null;

let thrownGarbageData = null;

let thrownGarbageState = "none";

const droppedGarbageItems = [];

const HELD_POSITION = new THREE.Vector3(0.52, -0.48, -1.35);

const HELD_ROTATION = new THREE.Euler(0.15, -0.25, 0);

const HORIZONTAL_INSPECTION_DURATION = 2800;

const VERTICAL_INSPECTION_DURATION = 2300;

const BUTTERFLY_INSPECTION_DURATION = 2200;

const horizontalInspectionKeyframes = [
  {
    time: 0,
    position: [0.52, -0.48, -1.35],
    rotation: [0.15, -0.25, 0],
    scale: 1,
  },

  {
    time: 0.14,
    position: [-0.03, -0.24, -1.05],
    rotation: [0.2, 0, 0.05],
    scale: 0.9,
  },

  {
    time: 0.3,
    position: [-0.08, -0.14, -1],
    rotation: [0.38, 1.05, -0.18],
    scale: 0.82,
  },

  {
    time: 0.46,
    position: [0, -0.14, -1],
    rotation: [-0.28, -0.9, 0.2],
    scale: 0.82,
  },

  {
    time: 0.56,
    position: [-0.06, -0.13, -0.99],
    rotation: [0.1, -0.25, 0],
    scale: 0.8,
  },

  {
    time: 0.73,
    position: [-0.07, -0.12, -0.99],
    rotation: [0.18, Math.PI * 2 - 0.25, 0.08],
    scale: 0.8,
  },

  {
    time: 0.9,
    position: [-0.05, -0.14, -1],
    rotation: [-0.08, Math.PI * 4 - 0.25, -0.05],
    scale: 0.82,
  },

  {
    time: 1,
    position: [0.52, -0.48, -1.35],
    rotation: [0.15, Math.PI * 4 - 0.25, 0],
    scale: 1,
  },
];

const verticalInspectionKeyframes = [
  {
    time: 0,
    position: [0.52, -0.48, -1.35],
    rotation: [0.15, -0.25, 0],
    scale: 1,
  },

  {
    time: 0.16,
    position: [0.12, -0.2, -1.08],
    rotation: [0.18, -0.2, -0.08],
    scale: 0.88,
  },

  {
    time: 0.34,
    position: [0, -0.07, -0.98],
    rotation: [0.15, -0.2, -0.08],
    scale: 0.8,
  },

  {
    time: 0.48,
    position: [0, -0.06, -0.96],
    rotation: [-0.72, -0.12, -0.12],
    scale: 0.8,
  },

  {
    time: 0.57,
    position: [0, -0.02, -0.96],
    rotation: [Math.PI * 2 + 0.58, -0.08, 0.12],
    scale: 0.78,
  },

  {
    time: 0.66,
    position: [0, -0.08, -0.99],
    rotation: [Math.PI * 2 + 0.15, -0.2, -0.05],
    scale: 0.8,
  },

  {
    time: 0.74,
    position: [0, -0.06, -0.97],
    rotation: [Math.PI * 2 - 0.62, -0.14, 0.1],
    scale: 0.8,
  },

  {
    time: 0.83,
    position: [0, -0.015, -0.96],
    rotation: [Math.PI * 4 + 0.58, -0.08, -0.12],
    scale: 0.78,
  },

  {
    time: 0.9,
    position: [0, -0.09, -1],
    rotation: [Math.PI * 4 + 0.15, -0.25, 0.04],
    scale: 0.82,
  },

  {
    time: 1,
    position: [0.52, -0.48, -1.35],
    rotation: [Math.PI * 4 + 0.15, -0.25, 0],
    scale: 1,
  },
];

let activeInspectionKeyframes = horizontalInspectionKeyframes;

let inspectionMode = "horizontal";

let inspectionActive = false;

let inspectionStartTime = 0;

let inspectionKeyHeld = false;

let inspectionLooping = false;

let inspectionLoopStartTime = 0;

let inspectionLoopProgress = 0;

let garbageTimeoutHandled = false;

let verticalInspectionPivotAttached = false;

let verticalInspectionReturning = false;

let butterflyInspectionPivotAttached = false;

let butterflyInspectionReturning = false;

const verticalInspectionStartPosition = new THREE.Vector3();

const verticalInspectionStartQuaternion = new THREE.Quaternion();

const verticalInspectionStartScale = new THREE.Vector3(1, 1, 1);

const verticalInspectionReturnPosition = new THREE.Vector3();

const verticalInspectionReturnQuaternion = new THREE.Quaternion();

const verticalInspectionReturnScale = new THREE.Vector3(1, 1, 1);

const heldGarbageQuaternion = new THREE.Quaternion().setFromEuler(
  HELD_ROTATION,
);

const verticalInspectionAttachedPosition = new THREE.Vector3(0, 0, 0);

const verticalInspectionAttachedQuaternion =
  new THREE.Quaternion().setFromEuler(
    new THREE.Euler(THREE.MathUtils.degToRad(60), 0, 0),
  );

const verticalInspectionPreviewEuler = new THREE.Euler(
  THREE.MathUtils.degToRad(60),
  0,
  0,
);

const verticalInspectionPreviewQuaternion = new THREE.Quaternion();

const verticalInspectionAttachedScale = new THREE.Vector3(
  0.62,
  0.62,
  0.62,
);

const butterflyInspectionAttachedPosition = new THREE.Vector3(0, 0, 0);

const butterflyInspectionAttachedQuaternion =
  new THREE.Quaternion().setFromEuler(
    new THREE.Euler(THREE.MathUtils.degToRad(65), 0, 0),
  );

const butterflyInspectionAttachedScale = new THREE.Vector3(
  0.58,
  0.58,
  0.58,
);

let currentGarbageData = null;

let garbageSpawnTime = 0;

let garbageTimeLimit = INITIAL_TIME;

let garbageState = "none";

/*
    none
    conveyor
    held
    thrown
    floor
*/

const projectileVelocity = new THREE.Vector3();

const projectileAngularVelocity = new THREE.Vector3();

const MIN_THROW_SPEED = 9;

const THROW_SPEED_GAIN = 9;

const THROW_CHARGE_REFERENCE_TIME = 750;

const MIN_THROW_LIFT = 1.5;

const MAX_THROW_CHARGE_TIME = 5000;

let throwCharging = false;

let throwChargeStartTime = 0;

let throwChargeAmount = 0;

let chargeViewOffsetActive = false;

let projectileRadius = 0.28;

let lastCollisionFeedback = 0;

const trajectoryGeometry = new THREE.BufferGeometry();

const trajectoryLine = new THREE.Line(
  trajectoryGeometry,

  new THREE.LineDashedMaterial({
    color: 0xffffff,

    transparent: true,

    opacity: 0.72,

    dashSize: 0.2,

    gapSize: 0.12,
  }),
);

trajectoryLine.visible = false;

trajectoryLine.frustumCulled = false;

scene.add(trajectoryLine);

const trajectoryEndMarker = new THREE.Mesh(
  new THREE.SphereGeometry(0.07, 8, 6),

  new THREE.MeshBasicMaterial({
    color: 0xffffff,

    transparent: true,

    opacity: 0.82,
  }),
);

trajectoryEndMarker.visible = false;

scene.add(trajectoryEndMarker);

const throwTrailGeometry = new THREE.BufferGeometry();

const throwTrail = new THREE.Line(
  throwTrailGeometry,

  new THREE.LineBasicMaterial({
    color: 0xf5f5f5,

    transparent: true,

    opacity: 0.5,
  }),
);

throwTrail.visible = false;

throwTrail.frustumCulled = false;

scene.add(throwTrail);

const throwTrailPoints = [];

let messageTimeout = null;

/* ============================================================
   PAUSE TIMER LOGIC
   ============================================================ */

let pauseStartedAt = null;

let accumulatedPauseTime = 0;

/* ============================================================
   MOVEMENT
   ============================================================ */

const keys = {
  KeyW: false,

  KeyA: false,

  KeyS: false,

  KeyD: false,
};

const moveSpeed = 5;

const PLAYER_EYE_HEIGHT = 1.7;

const PLAYER_RADIUS = 0.34;

const PLAYER_GRAVITY = 13;

const PLAYER_JUMP_SPEED = 5.4;

let playerVerticalVelocity = 0;

let playerGrounded = true;

/* ============================================================
   RAYCAST
   ============================================================ */

const raycaster = new THREE.Raycaster();

const PICKUP_RANGE = 5.5;

raycaster.far = PICKUP_RANGE;

const centerPoint = new THREE.Vector2(0, 0);

/* ============================================================
   CLOCK
   ============================================================ */

const clock = new THREE.Clock();

/* ============================================================
   REACTION TIME
   ============================================================ */

function getReactionTime() {
  return Math.max(
    MIN_TIME,

    INITIAL_TIME - wasteCount * TIME_DECREASE,
  );
}

/* ============================================================
   EFFECTIVE ELAPSED TIME
   ============================================================ */

function getGarbageElapsedSeconds() {
  let pausedExtra = 0;

  if (pauseStartedAt !== null) {
    pausedExtra = performance.now() - pauseStartedAt;
  }

  const elapsedMs =
    performance.now() -
    garbageSpawnTime -
    accumulatedPauseTime -
    pausedExtra;

  return Math.max(
    0,

    elapsedMs / 1000,
  );
}
