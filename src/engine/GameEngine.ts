import {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import { AmmoJSPlugin } from "@babylonjs/core/Physics/Plugins/ammoJSPlugin";
import Ammo from "ammojs-typed";
import { PlayerController } from "./PlayerController";
import { FishSystem } from "../fishing/FishSystem";
import { ProgressionSystem } from "../progression/ProgressionSystem";
import { QuizSystem } from "../quiz/QuizSystem";
import { WorldSystem } from "../world/WorldSystem";
import { NetworkSystem } from "../network/NetworkSystem";

interface GameSystems {
  world: WorldSystem;
  fish: FishSystem;
  progression: ProgressionSystem;
  quiz: QuizSystem;
  network: NetworkSystem;
}

interface GameEngineOptions {
  canvas: HTMLCanvasElement;
  systems: GameSystems;
}

export class GameEngine {
  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera;
  private player: PlayerController;
  private systems: GameSystems;

  constructor({ canvas, systems }: GameEngineOptions) {
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color3(0.68, 0.88, 0.98).toColor4();
    this.systems = systems;

    this.camera = new ArcRotateCamera(
      "camera",
      Math.PI * 0.25,
      Math.PI * 0.38,
      48,
      new Vector3(0, 4, 0),
      this.scene,
    );
    this.camera.attachControl(canvas, true);
    this.camera.lowerRadiusLimit = 18;
    this.camera.upperRadiusLimit = 80;

    const light = new HemisphericLight(
      "skyLight",
      new Vector3(0.5, 1, 0.2),
      this.scene,
    );
    light.intensity = 0.8;

    const ocean = MeshBuilder.CreateGround(
      "ocean",
      { width: 600, height: 600 },
      this.scene,
    );
    const waterMaterial = new StandardMaterial("water", this.scene);
    waterMaterial.diffuseColor = new Color3(0.2, 0.65, 0.88);
    waterMaterial.specularColor = new Color3(0.6, 0.8, 0.9);
    ocean.material = waterMaterial;
    ocean.position.y = -2;

    this.player = new PlayerController(this.scene, this.camera);
  }

  async start() {
    await this.enablePhysics();
    this.systems.world.build(this.scene);
    this.systems.fish.build(this.scene);
    this.systems.network.initialize();
    this.systems.quiz.initialize();

    this.engine.runRenderLoop(() => {
      const delta = this.engine.getDeltaTime() / 1000;
      this.player.update(delta, this.systems.progression.getMovementStats());
      this.systems.world.update(delta, this.player.getPosition());
      this.systems.fish.update(delta, this.player.getPosition());
      this.systems.progression.update(delta);
      this.systems.quiz.update(delta);
      this.systems.network.update(delta, this.player.getState());
      this.scene.render();
    });

    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  private async enablePhysics() {
    const ammo = await Ammo();
    (globalThis as typeof globalThis & { Ammo?: typeof ammo }).Ammo = ammo;
    this.scene.enablePhysics(new Vector3(0, -9.81, 0), new AmmoJSPlugin(true, ammo));
  }
}
