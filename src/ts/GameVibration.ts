import { IGameVibration, VibrationPatterns } from './interfaces';

export class GameVibration implements IGameVibration {
  private patterns: VibrationPatterns;
  private hasSound: boolean = true;

  constructor(patterns: VibrationPatterns) {
    this.patterns = patterns;
  }

  _vibrate(pattern: number[]) {
    console.log(pattern.length, this.hasSound);
    if (pattern.length && this.hasSound) {
      window.navigator.vibrate(pattern);
    }
  }

  eatFood() {
    this._vibrate(this.patterns.eatFood);
  }

  changeDirection() {
    this._vibrate(this.patterns.changeDirection);
  }

  gameOver() {
    this._vibrate(this.patterns.gameOver);
  }

  setPatterns(patterns: VibrationPatterns) {
    this.patterns = patterns;
  }

  toggleSound(): boolean {
    this.hasSound = !this.hasSound;
    return this.hasSound;
  }
}
