import { UIOverlay } from "../ui/UIOverlay";

interface Upgrade {
  id: string;
  name: string;
  level: number;
  baseCost: number;
  costMultiplier: number;
  effect: (level: number) => number;
}

export class ProgressionSystem {
  private currency = 0;
  private passiveIncomeTimer = 0;
  private upgrades: Upgrade[] = [
    {
      id: "rod-speed",
      name: "Rod Speed",
      level: 1,
      baseCost: 12,
      costMultiplier: 1.35,
      effect: (level) => 1 + level * 0.12,
    },
    {
      id: "luck",
      name: "Lucky Charm",
      level: 1,
      baseCost: 18,
      costMultiplier: 1.42,
      effect: (level) => 1 + level * 0.08,
    },
    {
      id: "boat-speed",
      name: "Boat Speed",
      level: 1,
      baseCost: 15,
      costMultiplier: 1.3,
      effect: (level) => 1 + level * 0.1,
    },
    {
      id: "depth-limit",
      name: "Depth Limit",
      level: 0,
      baseCost: 25,
      costMultiplier: 1.5,
      effect: (level) => level,
    },
  ];

  constructor(private ui: UIOverlay) {
    this.ui.setCurrency(this.currency);
  }

  update(delta: number) {
    this.passiveIncomeTimer += delta;
    if (this.passiveIncomeTimer >= 6) {
      this.passiveIncomeTimer = 0;
      this.addCurrency(4 + this.getUpgradeLevel("luck"));
    }
  }

  addCurrency(amount: number) {
    this.currency += amount;
    this.ui.setCurrency(this.currency);
  }

  spendCurrency(amount: number): boolean {
    if (this.currency < amount) return false;
    this.currency -= amount;
    this.ui.setCurrency(this.currency);
    return true;
  }

  getUpgradeLevel(id: string) {
    return this.upgrades.find((upgrade) => upgrade.id === id)?.level ?? 0;
  }

  getMovementStats() {
    return {
      speed: 6 + this.getUpgradeLevel("boat-speed") * 0.5,
      swimBoost: this.getUpgradeLevel("rod-speed") * 0.25,
    };
  }

  getLuckMultiplier() {
    return this.upgrades.find((upgrade) => upgrade.id === "luck")?.effect(
      this.getUpgradeLevel("luck"),
    ) ?? 1;
  }

  getDepthLimit() {
    return this.getUpgradeLevel("depth-limit");
  }

  getUpgradePreview() {
    return this.upgrades.map((upgrade) => ({
      id: upgrade.id,
      name: upgrade.name,
      level: upgrade.level,
      cost: Math.floor(upgrade.baseCost * upgrade.costMultiplier ** upgrade.level),
    }));
  }
}
