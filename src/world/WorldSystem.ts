import {
  Color3,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";

interface Biome {
  name: string;
  color: Color3;
  unlockDepth: number;
  center: Vector3;
}

export class WorldSystem {
  private biomes: Biome[] = [
    {
      name: "Starter Shoals",
      color: new Color3(0.45, 0.83, 0.6),
      unlockDepth: 0,
      center: new Vector3(0, 0, 0),
    },
    {
      name: "Coral Reef",
      color: new Color3(0.9, 0.55, 0.65),
      unlockDepth: 1,
      center: new Vector3(40, 0, 20),
    },
    {
      name: "Riverfalls",
      color: new Color3(0.55, 0.75, 0.95),
      unlockDepth: 2,
      center: new Vector3(-35, 0, -15),
    },
    {
      name: "Open Ocean",
      color: new Color3(0.2, 0.5, 0.9),
      unlockDepth: 3,
      center: new Vector3(70, 0, -45),
    },
    {
      name: "Frostfront",
      color: new Color3(0.7, 0.85, 0.95),
      unlockDepth: 4,
      center: new Vector3(-70, 0, 60),
    },
    {
      name: "Abyssal Trench",
      color: new Color3(0.15, 0.2, 0.35),
      unlockDepth: 5,
      center: new Vector3(110, 0, 80),
    },
    {
      name: "Volcanic Vents",
      color: new Color3(0.9, 0.35, 0.2),
      unlockDepth: 6,
      center: new Vector3(-110, 0, -80),
    },
  ];
  private activeBiome = this.biomes[0];

  build(scene: Scene) {
    this.biomes.forEach((biome, index) => {
      const island = MeshBuilder.CreateCylinder(
        `island-${index}`,
        { height: 6, diameterTop: 18, diameterBottom: 34, tessellation: 6 },
        scene,
      );
      island.position = biome.center.clone();
      island.position.y = -1;

      const material = new StandardMaterial(`island-mat-${index}`, scene);
      material.diffuseColor = biome.color;
      island.material = material;

      const dock = MeshBuilder.CreateBox(
        `dock-${index}`,
        { width: 6, height: 0.6, depth: 12 },
        scene,
      );
      dock.position = biome.center.add(new Vector3(0, 0.4, 16));
      const dockMaterial = new StandardMaterial(`dock-mat-${index}`, scene);
      dockMaterial.diffuseColor = new Color3(0.55, 0.35, 0.2);
      dock.material = dockMaterial;
    });
  }

  update(_delta: number, playerPosition: Vector3) {
    const nearest = this.biomes
      .slice()
      .sort(
        (a, b) =>
          Vector3.DistanceSquared(playerPosition, a.center) -
          Vector3.DistanceSquared(playerPosition, b.center),
      )[0];

    if (nearest && nearest !== this.activeBiome) {
      this.activeBiome = nearest;
    }
  }

  getActiveBiome() {
    return this.activeBiome;
  }

  getBiomes() {
    return this.biomes;
  }
}
