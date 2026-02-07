const startApp = () => {
  const canvas = document.getElementById("render-canvas");

  if (!canvas) {
    throw new Error("Render canvas not found");
  }

  if (!window.BABYLON) {
    const status = document.getElementById("status");
    if (status) status.textContent = "Babylon.js failed to load. Check your connection.";
    return;
  }

  const ui = {
    currency: document.getElementById("currency"),
    boost: document.getElementById("boost"),
    biome: document.getElementById("biome"),
    status: document.getElementById("status"),
    setCurrency(value) {
      if (this.currency) this.currency.textContent = value.toFixed(0);
    },
    setBoost(value) {
      if (this.boost) this.boost.textContent = value;
    },
    setBiome(value) {
      if (this.biome) this.biome.textContent = value;
    },
    setStatus(value) {
      if (this.status) this.status.textContent = value;
    },
  };

  const progression = {
  currency: 0,
  passiveIncomeTimer: 0,
  upgrades: [
    { id: "rod-speed", level: 1, effect: (level) => 1 + level * 0.12 },
    { id: "luck", level: 1, effect: (level) => 1 + level * 0.08 },
    { id: "boat-speed", level: 1, effect: (level) => 1 + level * 0.1 },
    { id: "depth-limit", level: 0, effect: (level) => level },
  ],
  update(delta) {
    this.passiveIncomeTimer += delta;
    if (this.passiveIncomeTimer >= 6) {
      this.passiveIncomeTimer = 0;
      this.addCurrency(4 + this.getUpgradeLevel("luck"));
    }
  },
  addCurrency(amount) {
    this.currency += amount;
    ui.setCurrency(this.currency);
  },
  getUpgradeLevel(id) {
    return this.upgrades.find((upgrade) => upgrade.id === id)?.level ?? 0;
  },
  getMovementStats() {
    return {
      speed: 6 + this.getUpgradeLevel("boat-speed") * 0.5,
      swimBoost: this.getUpgradeLevel("rod-speed") * 0.25,
    };
  },
  getLuckMultiplier() {
    const upgrade = this.upgrades.find((item) => item.id === "luck");
    return upgrade ? upgrade.effect(upgrade.level) : 1;
  },
};

  const quiz = {
  questions: [
    { prompt: "What planet is known as the Red Planet?", answer: "mars", reward: "Lucky Streak" },
    { prompt: "Which ocean is the largest on Earth?", answer: "pacific", reward: "Catch Speed" },
    { prompt: "What gas do plants breathe in?", answer: "carbon dioxide", reward: "Rare Fish Reveal" },
  ],
  timer: 0,
  current: null,
  streak: 0,
  activeBoost: "None",
  initialize() {
    this.rotate();
    ui.setBoost(this.activeBoost);
    window.addEventListener("keydown", (event) => {
      if (event.key.toLowerCase() === "q") {
        const response = window.prompt(this.current.prompt) ?? "";
        this.submit(response);
      }
    });
  },
  rotate() {
    const index = Math.floor(Math.random() * this.questions.length);
    this.current = this.questions[index];
  },
  update(delta) {
    this.timer += delta;
    if (this.timer > 18) {
      this.timer = 0;
      this.rotate();
    }
  },
  submit(response) {
    if (response.trim().toLowerCase() === this.current.answer) {
      this.streak += 1;
      this.activeBoost = `${this.current.reward} x${this.streak}`;
      progression.addCurrency(6 + this.streak * 2);
    } else {
      this.streak = Math.max(0, this.streak - 1);
      this.activeBoost = this.streak > 0 ? `Focus x${this.streak}` : "None";
    }
    ui.setBoost(this.activeBoost);
  },
};

  const world = {
  biomes: [
    { name: "Starter Shoals", color: new BABYLON.Color3(0.45, 0.83, 0.6), center: new BABYLON.Vector3(0, 0, 0) },
    { name: "Coral Reef", color: new BABYLON.Color3(0.9, 0.55, 0.65), center: new BABYLON.Vector3(40, 0, 20) },
    { name: "Riverfalls", color: new BABYLON.Color3(0.55, 0.75, 0.95), center: new BABYLON.Vector3(-35, 0, -15) },
    { name: "Open Ocean", color: new BABYLON.Color3(0.2, 0.5, 0.9), center: new BABYLON.Vector3(70, 0, -45) },
    { name: "Frostfront", color: new BABYLON.Color3(0.7, 0.85, 0.95), center: new BABYLON.Vector3(-70, 0, 60) },
    { name: "Abyssal Trench", color: new BABYLON.Color3(0.15, 0.2, 0.35), center: new BABYLON.Vector3(110, 0, 80) },
    { name: "Volcanic Vents", color: new BABYLON.Color3(0.9, 0.35, 0.2), center: new BABYLON.Vector3(-110, 0, -80) },
  ],
  activeBiome: null,
  build(scene) {
    this.activeBiome = this.biomes[0];
    this.biomes.forEach((biome, index) => {
      const island = BABYLON.MeshBuilder.CreateCylinder(
        `island-${index}`,
        { height: 6, diameterTop: 18, diameterBottom: 34, tessellation: 6 },
        scene,
      );
      island.position = biome.center.clone();
      island.position.y = -1;

      const material = new BABYLON.StandardMaterial(`island-mat-${index}`, scene);
      material.diffuseColor = biome.color;
      island.material = material;

      const dock = BABYLON.MeshBuilder.CreateBox(
        `dock-${index}`,
        { width: 6, height: 0.6, depth: 12 },
        scene,
      );
      dock.position = biome.center.add(new BABYLON.Vector3(0, 0.4, 16));
      const dockMaterial = new BABYLON.StandardMaterial(`dock-mat-${index}`, scene);
      dockMaterial.diffuseColor = new BABYLON.Color3(0.55, 0.35, 0.2);
      dock.material = dockMaterial;
    });
  },
  update(playerPosition) {
    const nearest = this.biomes
      .slice()
      .sort(
        (a, b) =>
          BABYLON.Vector3.DistanceSquared(playerPosition, a.center) -
          BABYLON.Vector3.DistanceSquared(playerPosition, b.center),
      )[0];

    if (nearest && nearest !== this.activeBiome) {
      this.activeBiome = nearest;
      ui.setBiome(nearest.name);
    }
  },
};

  const fishSystem = {
  fishTypes: [
    { name: "Sunny Sardine", rarity: "common", color: new BABYLON.Color3(0.95, 0.85, 0.35), value: 6, speed: 0.6 },
    { name: "Coral Snapper", rarity: "uncommon", color: new BABYLON.Color3(0.95, 0.5, 0.6), value: 12, speed: 0.7 },
    { name: "River Glider", rarity: "rare", color: new BABYLON.Color3(0.45, 0.8, 0.95), value: 24, speed: 0.8 },
    { name: "Abyss Lantern", rarity: "epic", color: new BABYLON.Color3(0.5, 0.35, 0.95), value: 48, speed: 1.0 },
    { name: "Mythic Emberfin", rarity: "mythic", color: new BABYLON.Color3(0.95, 0.3, 0.25), value: 100, speed: 1.2 },
  ],
  fish: [],
  build(scene) {
    world.biomes.forEach((biome, index) => {
      for (let i = 0; i < 8; i += 1) {
        const type = this.fishTypes[(index + i) % this.fishTypes.length];
        const mesh = BABYLON.MeshBuilder.CreateSphere(
          `fish-${index}-${i}`,
          { diameter: 0.8 },
          scene,
        );
        const material = new BABYLON.StandardMaterial(`fish-mat-${index}-${i}`, scene);
        material.diffuseColor = type.color;
        mesh.material = material;
        mesh.position = biome.center.add(
          new BABYLON.Vector3(4 + i * 1.5, 0.5 + (i % 3) * 0.4, 6 - i * 0.8),
        );

        this.fish.push({
          type,
          mesh,
          home: mesh.position.clone(),
          phase: Math.random() * Math.PI * 2,
        });
      }
    });
  },
  update(delta, playerPosition) {
    const luck = progression.getLuckMultiplier();
    this.fish.forEach((fish) => {
      fish.phase += delta * fish.type.speed;
      const offset = new BABYLON.Vector3(
        Math.cos(fish.phase) * 2,
        Math.sin(fish.phase) * 0.2,
        Math.sin(fish.phase) * 2,
      );
      fish.mesh.position = fish.home.add(offset);

      const distance = BABYLON.Vector3.Distance(playerPosition, fish.mesh.position);
      if (distance < 1.8) {
        const reward = Math.floor(fish.type.value * luck);
        progression.addCurrency(reward);
        fish.home = fish.home.add(
          new BABYLON.Vector3((Math.random() - 0.5) * 12, 0, (Math.random() - 0.5) * 12),
        );
      }
    });
  },
};

  const network = {
  peer: null,
  connections: new Map(),
  remotePlayers: new Map(),
  lastBroadcast: 0,
  initialize() {
    if (!window.Peer) return;
    this.peer = new window.Peer();
    this.peer.on("open", (id) => {
      console.info(`Peer ready: ${id}`);
    });
    this.peer.on("connection", (connection) => {
      this.registerConnection(connection);
    });
  },
  connect(peerId) {
    if (!this.peer) return;
    const connection = this.peer.connect(peerId, { reliable: true });
    this.registerConnection(connection);
  },
  update(delta, state) {
    this.lastBroadcast += delta;
    if (this.lastBroadcast < 0.1) return;
    this.lastBroadcast = 0;

    const payload = {
      x: state.position.x,
      y: state.position.y,
      z: state.position.z,
      vx: state.velocity.x,
      vy: state.velocity.y,
      vz: state.velocity.z,
    };

    this.connections.forEach((connection) => {
      if (connection.open) {
        connection.send(payload);
      }
    });
  },
  registerConnection(connection) {
    this.connections.set(connection.peer, connection);
    connection.on("data", (data) => {
      if (typeof data !== "object" || data === null) return;
      const payload = data;
      this.remotePlayers.set(connection.peer, {
        id: connection.peer,
        position: {
          x: payload.x ?? 0,
          y: payload.y ?? 0,
          z: payload.z ?? 0,
        },
        velocity: {
          x: payload.vx ?? 0,
          y: payload.vy ?? 0,
          z: payload.vz ?? 0,
        },
        lastSeen: performance.now(),
      });
    });
    connection.on("close", () => {
      this.connections.delete(connection.peer);
      this.remotePlayers.delete(connection.peer);
    });
  },
};

  const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.68, 0.88, 0.98).toColor4();

  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI * 0.25,
    Math.PI * 0.38,
    48,
    new BABYLON.Vector3(0, 4, 0),
    scene,
  );
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight(
    "skyLight",
    new BABYLON.Vector3(0.5, 1, 0.2),
    scene,
  );
  light.intensity = 0.8;

  const ocean = BABYLON.MeshBuilder.CreateGround("ocean", { width: 600, height: 600 }, scene);
  const waterMaterial = new BABYLON.StandardMaterial("water", scene);
  waterMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.65, 0.88);
  waterMaterial.specularColor = new BABYLON.Color3(0.6, 0.8, 0.9);
  ocean.material = waterMaterial;
  ocean.position.y = -2;

  const player = BABYLON.MeshBuilder.CreateCapsule("player", { height: 2, radius: 0.5 }, scene);
  const playerMaterial = new BABYLON.StandardMaterial("playerMat", scene);
  playerMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.7, 0.3);
  player.material = playerMaterial;
  player.position = new BABYLON.Vector3(0, 1, 0);

  const input = { forward: false, backward: false, left: false, right: false };
  scene.onKeyboardObservable.add(({ event, type }) => {
    const isDown = type === 1;
    switch (event.key.toLowerCase()) {
      case "w":
      case "arrowup":
        input.forward = isDown;
        break;
      case "s":
      case "arrowdown":
        input.backward = isDown;
        break;
      case "a":
      case "arrowleft":
        input.left = isDown;
        break;
      case "d":
      case "arrowright":
        input.right = isDown;
        break;
      default:
        break;
    }
  });

  if (typeof window.Ammo === "function") {
    window
      .Ammo()
      .then((ammo) => {
        window.Ammo = ammo;
        scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.AmmoJSPlugin(true, ammo));
        ui.setStatus("Physics online.");
      })
      .catch(() => {
        ui.setStatus("Physics unavailable, running without Ammo.");
      });
  } else {
    ui.setStatus("Physics unavailable, running without Ammo.");
  }

  world.build(scene);
  fishSystem.build(scene);
  quiz.initialize();
  network.initialize();
  ui.setCurrency(progression.currency);
  ui.setBoost("None");
  ui.setStatus("Exploring Starter Shoals.");

  engine.runRenderLoop(() => {
    const delta = engine.getDeltaTime() / 1000;
    const direction = new BABYLON.Vector3(0, 0, 0);
    if (input.forward) direction.z += 1;
    if (input.backward) direction.z -= 1;
    if (input.left) direction.x -= 1;
    if (input.right) direction.x += 1;

    if (direction.lengthSquared() > 0) {
      direction.normalize();
      const stats = progression.getMovementStats();
      const velocity = direction.scale(stats.speed + stats.swimBoost);
      player.position.addInPlace(velocity.scale(delta));
    }

    camera.target = player.position;
    world.update(player.position);
    fishSystem.update(delta, player.position);
    progression.update(delta);
    quiz.update(delta);
    network.update(delta, { position: player.position, velocity: direction });
    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp);
} else {
  startApp();
}
