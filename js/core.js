/* ============================================================
   THREE.JS IS LOADED ABOVE AS CLASSIC SCRIPTS
   ============================================================ */

if (!window.THREE || !THREE.PointerLockControls) {
  const errorBox = document.getElementById("error");
  const missingFiles = window.gameDependencyErrors || [];
  errorBox.style.display = "block";
  errorBox.textContent = missingFiles.length
    ? "3D ENGINE FILE FAILED TO LOAD: " + missingFiles.join(", ")
    : "3D ENGINE FAILED TO INITIALIZE. Open the browser console for details.";
  throw new Error(
    missingFiles.length
      ? "Missing local game dependency: " + missingFiles.join(", ")
      : "Three.js or PointerLockControls failed to initialize.",
  );
}

/* ============================================================
   HTML
   ============================================================ */

const healthElement = document.getElementById("health");

const scoreElement = document.getElementById("score");

const timerElement = document.getElementById("timer");

const wasteCountElement = document.getElementById("waste-count");

const comboElement = document.getElementById("combo-count");

const comboHudElement = document.getElementById("combo-hud");

const interactionElement = document.getElementById("interaction");

const messageElement = document.getElementById("message");

const startScreen = document.getElementById("start-screen");

const gameOverScreen = document.getElementById("game-over-screen");

const pauseScreen = document.getElementById("pause-screen");

const finalScoreElement = document.getElementById("final-score");

const finalCountElement = document.getElementById("final-count");

/* ============================================================
   SCENE
   ============================================================ */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x17232a);

scene.fog = new THREE.Fog(0x17232a, 20, 45);

/* ============================================================
   CAMERA
   ============================================================ */

const camera = new THREE.PerspectiveCamera(
  75,

  window.innerWidth / window.innerHeight,

  0.1,

  100,
);

camera.position.set(0, 1.7, 3);

/*
    Important:

    We add camera directly.

    No controls.object.
*/

scene.add(camera);

/* ============================================================
   RENDERER
   ============================================================ */

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});

renderer.setSize(
  window.innerWidth,

  window.innerHeight,
);

renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio,

    1.5,
  ),
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputEncoding = THREE.sRGBEncoding;

renderer.toneMapping = THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.05;

document.body.appendChild(renderer.domElement);

/* ============================================================
   POINTER LOCK
   ============================================================ */

const controls = new THREE.PointerLockControls(
  camera,

  document.body,
);

/* ============================================================
   MATERIAL
   ============================================================ */

function createMaterial(color, roughness = 0.72, metalness = 0.06) {
  return new THREE.MeshStandardMaterial({
    color: color,

    roughness: roughness,

    metalness: metalness,
  });
}
