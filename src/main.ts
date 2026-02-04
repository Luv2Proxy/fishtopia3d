import { GameEngine } from "./engine/GameEngine";
import { NetworkSystem } from "./network/NetworkSystem";
import { ProgressionSystem } from "./progression/ProgressionSystem";
import { QuizSystem } from "./quiz/QuizSystem";
import { WorldSystem } from "./world/WorldSystem";
import { FishSystem } from "./fishing/FishSystem";
import { UIOverlay } from "./ui/UIOverlay";

const canvas = document.querySelector<HTMLCanvasElement>("#render-canvas");

if (typeof window !== "undefined") {
  (window as typeof window & { global?: typeof window }).global = window;
}

if (!canvas) {
  throw new Error("Render canvas not found");
}

const ui = new UIOverlay();
const progression = new ProgressionSystem(ui);
const quiz = new QuizSystem(ui, progression);
const network = new NetworkSystem();
const world = new WorldSystem();
const fish = new FishSystem(world, progression, ui);

const engine = new GameEngine({
  canvas,
  systems: {
    world,
    fish,
    progression,
    quiz,
    network,
  },
});

engine.start();
