import { ProgressionSystem } from "../progression/ProgressionSystem";
import { UIOverlay } from "../ui/UIOverlay";

interface QuizQuestion {
  prompt: string;
  answer: string;
  reward: string;
}

export class QuizSystem {
  private questions: QuizQuestion[] = [
    {
      prompt: "What planet is known as the Red Planet?",
      answer: "mars",
      reward: "Lucky Streak",
    },
    {
      prompt: "Which ocean is the largest on Earth?",
      answer: "pacific",
      reward: "Catch Speed",
    },
    {
      prompt: "What gas do plants breathe in?",
      answer: "carbon dioxide",
      reward: "Rare Fish Reveal",
    },
  ];
  private timer = 0;
  private currentQuestion = this.questions[0];
  private activeBoost = "None";
  private streak = 0;

  constructor(private ui: UIOverlay, private progression: ProgressionSystem) {}

  initialize() {
    this.ui.setBoost(this.activeBoost);
    this.rotateQuestion();
    window.addEventListener("keydown", (event) => {
      if (event.key.toLowerCase() === "q") {
        const response = window.prompt(this.currentQuestion.prompt) ?? "";
        this.submitAnswer(response);
      }
    });
  }

  update(delta: number) {
    this.timer += delta;
    if (this.timer > 18) {
      this.timer = 0;
      this.rotateQuestion();
    }
  }

  getActiveBoost() {
    return this.activeBoost;
  }

  private rotateQuestion() {
    const index = Math.floor(Math.random() * this.questions.length);
    this.currentQuestion = this.questions[index];
  }

  private submitAnswer(response: string) {
    if (response.trim().toLowerCase() === this.currentQuestion.answer) {
      this.streak += 1;
      this.activeBoost = `${this.currentQuestion.reward} x${this.streak}`;
      this.progression.addCurrency(6 + this.streak * 2);
    } else {
      this.streak = Math.max(0, this.streak - 1);
      this.activeBoost = this.streak > 0 ? `Focus x${this.streak}` : "None";
    }
    this.ui.setBoost(this.activeBoost);
  }
}
