/* ============================================================
   GARBAGE DATABASE
   ============================================================ */

const garbageTypes = [
  {
    name: "PLASTIC BOTTLE",

    category: "recyclable",

    shape: "bottle",

    color: 0x67c8e8,
  },

  {
    name: "CARDBOARD BOX",

    category: "recyclable",

    shape: "box",

    color: 0xb97a3d,
  },

  {
    name: "CAN",

    category: "recyclable",

    shape: "can",

    color: 0xc5cdd1,
  },

  {
    name: "APPLE",

    category: "food",

    shape: "apple",

    color: 0xc63d3d,
  },

  {
    name: "BANANA PEEL",

    category: "food",

    shape: "banana",

    color: 0xe5c339,
  },

  {
    name: "FOOD BOX",

    category: "food",

    shape: "foodbox",

    color: 0xd97c48,
  },

  {
    name: "BATTERY",

    category: "hazardous",

    shape: "battery",

    color: 0xe0bb3e,
  },

  {
    name: "MEDICINE",

    category: "hazardous",

    shape: "medicine",

    color: 0xe8e8e8,
  },

  {
    name: "LIGHT BULB",

    category: "hazardous",

    shape: "bulb",

    color: 0xf6da45,
  },

  {
    name: "TISSUE",

    category: "other",

    shape: "tissue",

    color: 0xe8e8df,
  },

  {
    name: "CERAMIC CUP",

    category: "other",

    shape: "cup",

    color: 0xe4e1d4,
  },
];

/* ============================================================
   GARBAGE FLOATING LABEL
   ============================================================ */

function createGarbageLabel(info) {
  const canvas = document.createElement("canvas");

  canvas.width = 512;

  canvas.height = 160;

  const context = canvas.getContext("2d");

  context.imageSmoothingEnabled = false;

  context.fillStyle = "rgba(255, 255, 255, 0.98)";

  context.fillRect(8, 8, 496, 144);

  context.strokeStyle = "#111111";

  context.lineWidth = 8;

  context.strokeRect(8, 8, 496, 144);

  let fontSize = 46;

  do {
    context.font = "bold " + fontSize + "px monospace";

    fontSize -= 2;
  } while (context.measureText(info.name).width > 440 && fontSize > 28);

  context.fillStyle = "#111111";

  context.textAlign = "center";

  context.textBaseline = "middle";

  context.fillText(info.name, 256, 80);

  const texture = new THREE.CanvasTexture(canvas);

  texture.magFilter = THREE.NearestFilter;

  texture.minFilter = THREE.LinearFilter;

  const material = new THREE.SpriteMaterial({
    map: texture,

    transparent: true,

    alphaTest: 0.08,

    depthWrite: false,
  });

  const label = new THREE.Sprite(material);

  label.position.set(0, 1.55, 0);

  label.scale.set(2.4, 0.75, 1);

  label.renderOrder = 4;

  label.userData.isGarbageLabel = true;

  return label;
}

/* ============================================================
   CREATE GARBAGE
   ============================================================ */

function createGarbageModel(info) {
  const group = new THREE.Group();

  const basicMaterial = createMaterial(info.color);

  switch (info.shape) {
    /* ====================================================
     BOTTLE
     ==================================================== */

    case "bottle": {
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.25,

          0.29,

          0.62,

          12,
        ),

        basicMaterial,
      );

      body.position.y = 0.35;

      group.add(body);

      const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.13,

          0.16,

          0.22,

          12,
        ),

        basicMaterial,
      );

      neck.position.y = 0.78;

      group.add(neck);

      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.15,

          0.15,

          0.1,

          12,
        ),

        createMaterial(0x275e91),
      );

      cap.position.y = 0.93;

      group.add(cap);

      const shoulder = new THREE.Mesh(
        new THREE.SphereGeometry(
          0.28,

          12,

          8,
        ),

        basicMaterial,
      );

      shoulder.scale.y = 0.45;

      shoulder.position.y = 0.67;

      group.add(shoulder);

      break;
    }

    /* ====================================================
     BOX
     ==================================================== */

    case "box": {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(
          0.7,

          0.6,

          0.6,
        ),

        basicMaterial,
      );

      box.position.y = 0.3;

      group.add(box);

      const packingTape = new THREE.Mesh(
        new THREE.BoxGeometry(
          0.13,

          0.018,

          0.61,
        ),

        createMaterial(0xd7b274, 0.62, 0.02),
      );

      packingTape.position.y = 0.61;

      group.add(packingTape);

      break;
    }

    /* ====================================================
     CAN
     ==================================================== */

    case "can": {
      const can = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.27,

          0.27,

          0.65,

          16,
        ),

        basicMaterial,
      );

      can.position.y = 0.33;

      group.add(can);

      for (const y of [0.02, 0.65]) {
        const rim = new THREE.Mesh(
          new THREE.TorusGeometry(
            0.27,

            0.025,

            6,

            16,
          ),

          createMaterial(0xdce2e4, 0.22, 0.86),
        );

        rim.rotation.x = Math.PI / 2;

        rim.position.y = y;

        group.add(rim);
      }

      break;
    }

    /* ====================================================
     APPLE
     ==================================================== */

    case "apple": {
      const apple = new THREE.Mesh(
        new THREE.SphereGeometry(
          0.38,

          12,

          8,
        ),

        basicMaterial,
      );

      apple.position.y = 0.4;

      apple.scale.y = 0.92;

      group.add(apple);

      const stem = new THREE.Mesh(
        new THREE.BoxGeometry(
          0.08,

          0.22,

          0.08,
        ),

        createMaterial(0x63411f),
      );

      stem.position.y = 0.78;

      group.add(stem);

      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(
          0.14,

          8,

          5,
        ),

        createMaterial(0x4f853c),
      );

      leaf.scale.set(1.5, 0.25, 0.65);

      leaf.position.set(0.12, 0.78, 0);

      leaf.rotation.z = -0.35;

      group.add(leaf);

      break;
    }

    /* ====================================================
     BANANA
     ==================================================== */

    case "banana": {
      const peelMaterial = new THREE.MeshStandardMaterial({
        color: info.color,

        roughness: 0.78,

        metalness: 0,

        side: THREE.DoubleSide,
      });

      const peelAngles = [-0.2, 1.35, 2.95, 4.55];

      peelAngles.forEach((angle, peelIndex) => {
        const direction = new THREE.Vector3(
          Math.cos(angle),
          0,
          Math.sin(angle),
        );

        const side = new THREE.Vector3(
          -Math.sin(angle),
          0,
          Math.cos(angle),
        );

        const length = 0.58 + peelIndex * 0.025;

        const centers = [
          new THREE.Vector3(0, 0.5, 0),

          direction.clone().multiplyScalar(0.16).setY(0.34),

          direction.clone().multiplyScalar(0.4).setY(0.16),

          direction.clone().multiplyScalar(length).setY(0.07),
        ];

        const widths = [0.065, 0.105, 0.12, 0.035];

        const vertices = [];

        centers.forEach((center, centerIndex) => {
          const offset = side.clone().multiplyScalar(widths[centerIndex]);

          const leftEdge = center.clone().add(offset);

          const rightEdge = center.clone().sub(offset);

          vertices.push(
            leftEdge.x,
            leftEdge.y,
            leftEdge.z,
            rightEdge.x,
            rightEdge.y,
            rightEdge.z,
          );
        });

        const peelGeometry = new THREE.BufferGeometry();

        peelGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(vertices, 3),
        );

        peelGeometry.setIndex([
          0, 2, 1, 1, 2, 3, 2, 4, 3, 3, 4, 5, 4, 6, 5, 5, 6, 7,
        ]);

        peelGeometry.computeVertexNormals();

        const peel = new THREE.Mesh(peelGeometry, peelMaterial);

        group.add(peel);

        const darkTip = new THREE.Mesh(
          new THREE.SphereGeometry(0.055, 7, 5),

          createMaterial(0x6a4a22, 0.9, 0),
        );

        darkTip.position.copy(centers[3]);

        group.add(darkTip);
      });

      const peelStem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.13, 0.46, 9),

        createMaterial(0xf1d56a, 0.82, 0),
      );

      peelStem.position.y = 0.3;

      group.add(peelStem);

      const stemTip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.075, 0.09, 8),

        createMaterial(0x705027, 0.88, 0),
      );

      stemTip.position.y = 0.575;

      group.add(stemTip);

      break;
    }

    /* ====================================================
     FOOD BOX
     ==================================================== */

    case "foodbox": {
      const bowl = new THREE.Mesh(
        new THREE.BoxGeometry(
          0.65,

          0.3,

          0.65,
        ),

        basicMaterial,
      );

      bowl.position.y = 0.18;

      group.add(bowl);

      const food = new THREE.Mesh(
        new THREE.BoxGeometry(
          0.45,

          0.18,

          0.45,
        ),

        createMaterial(0xf0e2aa),
      );

      food.position.y = 0.42;

      group.add(food);

      const lid = new THREE.Mesh(
        new THREE.BoxGeometry(
          0.68,

          0.035,

          0.68,
        ),

        new THREE.MeshStandardMaterial({
          color: 0xf3eee0,

          roughness: 0.35,

          transparent: true,

          opacity: 0.78,
        }),
      );

      lid.position.y = 0.53;

      group.add(lid);

      break;
    }

    /* ====================================================
     BATTERY
     ==================================================== */

    case "battery": {
      const battery = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.2,

          0.2,

          0.72,

          12,
        ),

        basicMaterial,
      );

      battery.position.y = 0.38;

      group.add(battery);

      const terminal = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.08,

          0.08,

          0.08,

          12,
        ),

        createMaterial(0x91999c),
      );

      terminal.position.y = 0.81;

      group.add(terminal);

      const batteryBottom = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.205,

          0.205,

          0.035,

          12,
        ),

        createMaterial(0x91999c, 0.24, 0.82),
      );

      batteryBottom.position.y = 0.02;

      group.add(batteryBottom);

      break;
    }

    /* ====================================================
     MEDICINE
     ==================================================== */

    case "medicine": {
      const bottle = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.23,

          0.25,

          0.6,

          14,
        ),

        basicMaterial,
      );

      bottle.position.y = 0.33;

      group.add(bottle);

      const medicineCap = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.2,

          0.2,

          0.14,

          14,
        ),

        createMaterial(0xe1e4e5, 0.55, 0.12),
      );

      medicineCap.position.y = 0.7;

      group.add(medicineCap);

      const red = createMaterial(0xd84646);

      const crossV = new THREE.Mesh(
        new THREE.BoxGeometry(
          0.08,

          0.3,

          0.025,
        ),

        red,
      );

      crossV.position.set(
        0,

        0.35,

        0.235,
      );

      group.add(crossV);

      const crossH = new THREE.Mesh(
        new THREE.BoxGeometry(
          0.3,

          0.08,

          0.025,
        ),

        red,
      );

      crossH.position.set(
        0,

        0.35,

        0.235,
      );

      group.add(crossH);

      break;
    }

    /* ====================================================
     BULB
     ==================================================== */

    case "bulb": {
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(
          0.35,

          14,

          10,
        ),

        new THREE.MeshStandardMaterial({
          color: info.color,

          roughness: 0.18,

          metalness: 0,

          transparent: true,

          opacity: 0.76,

          emissive: 0x5a4b0b,

          emissiveIntensity: 0.18,
        }),
      );

      bulb.position.y = 0.55;

      bulb.scale.y = 1.08;

      group.add(bulb);

      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.17,

          0.2,

          0.25,

          8,
        ),

        createMaterial(0x70787c),
      );

      base.position.y = 0.15;

      group.add(base);

      for (const y of [0.08, 0.14, 0.2]) {
        const thread = new THREE.Mesh(
          new THREE.TorusGeometry(
            0.18,

            0.018,

            5,

            12,
          ),

          createMaterial(0x9ca3a5, 0.26, 0.82),
        );

        thread.rotation.x = Math.PI / 2;

        thread.position.y = y;

        group.add(thread);
      }

      break;
    }

    /* ====================================================
     TISSUE
     ==================================================== */

    case "tissue": {
      const box = new THREE.Mesh(
        new THREE.DodecahedronGeometry(
          0.38,

          1,
        ),

        basicMaterial,
      );

      box.position.y = 0.24;

      box.scale.set(1.15, 0.62, 0.9);

      group.add(box);

      const paper = new THREE.Mesh(
        new THREE.DodecahedronGeometry(
          0.25,

          1,
        ),

        createMaterial(0xffffff),
      );

      paper.position.y = 0.47;

      paper.scale.set(0.75, 1.25, 0.35);

      paper.rotation.z = 0.15;

      group.add(paper);

      break;
    }

    /* ====================================================
     CUP
     ==================================================== */

    case "cup": {
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.3,

          0.27,

          0.55,

          16,

          1,

          true,
        ),

        basicMaterial,
      );

      cup.position.y = 0.3;

      group.add(cup);

      const cupRim = new THREE.Mesh(
        new THREE.TorusGeometry(
          0.3,

          0.025,

          6,

          18,
        ),

        basicMaterial,
      );

      cupRim.rotation.x = Math.PI / 2;

      cupRim.position.y = 0.575;

      group.add(cupRim);

      const cupBase = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.27,

          0.27,

          0.035,

          16,
        ),

        basicMaterial,
      );

      cupBase.position.y = 0.025;

      group.add(cupBase);

      const handle = new THREE.Mesh(
        new THREE.TorusGeometry(
          0.22,

          0.06,

          8,

          16,

          Math.PI,
        ),

        basicMaterial,
      );

      handle.position.set(
        0.29,

        0.32,

        0,
      );

      handle.rotation.z = -Math.PI / 2;

      group.add(handle);

      for (const connectorY of [0.1, 0.54]) {
        const handleConnector = new THREE.Mesh(
          new THREE.BoxGeometry(0.13, 0.09, 0.11),

          basicMaterial,
        );

        handleConnector.position.set(0.31, connectorY, 0);

        group.add(handleConnector);
      }

      break;
    }
  }

  group.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true;

      object.receiveShadow = true;
    }
  });

  const label = createGarbageLabel(info);

  group.add(label);

  group.userData.garbageLabel = label;

  return group;
}
