import {
  Color3,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
  ArcRotateCamera,
} from "@babylonjs/core";

interface MovementStats {
  speed: number;
  swimBoost: number;
}

export class PlayerController {
  private mesh;
  private velocity = new Vector3(0, 0, 0);
  private input = {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };

  constructor(private scene: Scene, private camera: ArcRotateCamera) {
    this.mesh = MeshBuilder.CreateCapsule("player", { height: 2, radius: 0.5 }, scene);
    const material = new StandardMaterial("playerMat", scene);
    material.diffuseColor = new Color3(0.9, 0.7, 0.3);
    this.mesh.material = material;
    this.mesh.position = new Vector3(0, 1, 0);

    this.registerInput();
  }

  update(delta: number, stats: MovementStats) {
    const direction = new Vector3(0, 0, 0);
    if (this.input.forward) direction.z += 1;
    if (this.input.backward) direction.z -= 1;
    if (this.input.left) direction.x -= 1;
    if (this.input.right) direction.x += 1;

    if (direction.lengthSquared() > 0) {
      direction.normalize();
      this.velocity = direction.scale(stats.speed + stats.swimBoost);
    } else {
      this.velocity = this.velocity.scale(0.9);
    }

    this.mesh.position.addInPlace(this.velocity.scale(delta));
    this.camera.target = this.mesh.position;
  }

  getPosition() {
    return this.mesh.position.clone();
  }

  getState() {
    return {
      position: this.mesh.position.clone(),
      velocity: this.velocity.clone(),
    };
  }

  private registerInput() {
    this.scene.onKeyboardObservable.add(({ event, type }) => {
      const isDown = type === 1;
      switch (event.key.toLowerCase()) {
        case "w":
        case "arrowup":
          this.input.forward = isDown;
          break;
        case "s":
        case "arrowdown":
          this.input.backward = isDown;
          break;
        case "a":
        case "arrowleft":
          this.input.left = isDown;
          break;
        case "d":
        case "arrowright":
          this.input.right = isDown;
          break;
        default:
          break;
      }
    });
  }
}
