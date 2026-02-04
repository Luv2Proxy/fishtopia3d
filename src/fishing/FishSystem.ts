import {
  Color3,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import { ProgressionSystem } from "../progression/ProgressionSystem";
import { WorldSystem } from "../world/WorldSystem";
import { UIOverlay } from "../ui/UIOverlay";

interface FishType {
  name: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "mythic";
  color: Color3;
  value: number;
  speed: number;
}

interface FishEntity {
  type: FishType;
  mesh: ReturnType<typeof MeshBuilder.CreateSphere>;
  home: Vector3;
  phase: number;
}

export class FishSystem {
  private fishTypes: FishType[] = [
    {
      name: "Sunny Sardine",
      rarity: "common",
      color: new Color3(0.95, 0.85, 0.35),
      value: 6,
      speed: 0.6,
    },
    {
      name: "Coral Snapper",
      rarity: "uncommon",
      color: new Color3(0.95, 0.5, 0.6),
      value: 12,
      speed: 0.7,
    },
    {
      name: "River Glider",
      rarity: "rare",
      color: new Color3(0.45, 0.8, 0.95),
      value: 24,
      speed: 0.8,
    },
    {
      name: "Abyss Lantern",
      rarity: "epic",
      color: new Color3(0.5, 0.35, 0.95),
      value: 48,
      speed: 1,
    },
    {
      name: "Mythic Emberfin",
      rarity: "mythic",
      color: new Color3(0.95, 0.3, 0.25),
      value: 100,
      speed: 1.2,
    },
  ];
  private fish: FishEntity[] = [];

  constructor(
    private world: WorldSystem,
    private progression: ProgressionSystem,
    private ui: UIOverlay,
  ) {}

  build(scene: Scene) {
    const biomes = this.world.getBiomes();
    biomes.forEach((biome, index) => {
      for (let i = 0; i < 8; i += 1) {
        const type = this.fishTypes[(index + i) % this.fishTypes.length];
        const mesh = MeshBuilder.CreateSphere(
          `fish-${index}-${i}`,
          { diameter: 0.8 },
          scene,
        );
        const material = new StandardMaterial(`fish-mat-${index}-${i}`, scene);
        material.diffuseColor = type.color;
        mesh.material = material;
        mesh.position = biome.center.add(
          new Vector3(4 + i * 1.5, 0.5 + (i % 3) * 0.4, 6 - i * 0.8),
        );

        this.fish.push({
          type,
          mesh,
          home: mesh.position.clone(),
          phase: Math.random() * Math.PI * 2,
        });
      }
    });
  }

  update(delta: number, playerPosition: Vector3) {
    this.ui.setBiome(this.world.getActiveBiome().name);
    const luck = this.progression.getLuckMultiplier();

    this.fish.forEach((fish) => {
      fish.phase += delta * fish.type.speed;
      const offset = new Vector3(
        Math.cos(fish.phase) * 2,
        Math.sin(fish.phase) * 0.2,
        Math.sin(fish.phase) * 2,
      );
      fish.mesh.position = fish.home.add(offset);

      const distance = Vector3.Distance(playerPosition, fish.mesh.position);
      if (distance < 1.8) {
        const reward = Math.floor(fish.type.value * luck);
        this.progression.addCurrency(reward);
        fish.home = fish.home.add(
          new Vector3(
            (Math.random() - 0.5) * 12,
            0,
            (Math.random() - 0.5) * 12,
          ),
        );
      }
    });
  }
}
