export class UIOverlay {
  private currencyEl = document.querySelector<HTMLSpanElement>("#currency");
  private boostEl = document.querySelector<HTMLSpanElement>("#boost");
  private biomeEl = document.querySelector<HTMLSpanElement>("#biome");

  setCurrency(value: number) {
    if (this.currencyEl) {
      this.currencyEl.textContent = value.toFixed(0);
    }
  }

  setBoost(value: string) {
    if (this.boostEl) {
      this.boostEl.textContent = value;
    }
  }

  setBiome(value: string) {
    if (this.biomeEl) {
      this.biomeEl.textContent = value;
    }
  }
}
