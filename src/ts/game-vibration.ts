import { IGameVibration, VibrationPatterns } from './interfaces';

export class GameVibration implements IGameVibration {
  private patterns: VibrationPatterns;
  private hasSound: boolean = true;

  constructor(patterns: VibrationPatterns) {
    this.patterns = patterns;
  }

  _vibrate(pattern: number[]) {
    if (pattern.length && this.hasSound) {
      window.navigator.vibrate(pattern);
    }
  }

  eatFoodPositive() {
    this._vibrate(this.patterns.eatFoodPositive);
  }

  eatFoodNegative() {
    this._vibrate(this.patterns.eatFoodNegative);
  }

  changeDirection() {
    this._vibrate(this.patterns.changeDirection);
  }

  gameOver() {
    this._vibrate(this.patterns.gameOver);
  }

  toggleSound(): boolean {
    this.hasSound = !this.hasSound;
    return this.hasSound;
  }

  setPatterns(patterns: Object) {
    Object.keys(patterns).forEach(key => {
      if (this.patterns[key]) {
        this.patterns[key] = patterns[key];
      }
    });
  }
}
