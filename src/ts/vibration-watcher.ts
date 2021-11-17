import { GameVibration } from './game-vibration';

interface IExportedItem {
  intensity: number;
  duration: number;
}

interface PatternItem {
  vibration: IExportedItem[];
}

type PaternsItems = {
  [key: string]: PatternItem;
};

declare var expPaterns: PaternsItems;

/* -------------------------------------------------------------------------- */

function pwm(item: IExportedItem, vmax: number): number[] {
  const ret = [];
  const t = Math.round(item.intensity * vmax / 100);
  if (t > 0) {
    while (t <= item.duration) {
      ret.push(t, 0);
      item.duration -= t;
    }
    // @FIXME: how should we handle duration % t which remain
    //  after above loop time???
  } else {
    ret.push(0, item.duration);
  }
  return ret;
}

function navigatorParam(pattern: IExportedItem[]): number[] {
  const intervals = [];
  for (let i = 0; i < pattern.length; i++) {
    intervals.push(
      ...pwm(pattern[i], 40)
    );
  }
  return intervals;
};

/* -------------------------------------------------------------------------- */

function getVibroPatterns(patterns: PaternsItems) {
  const ret = {
    eatFoodPositive: [100],
    eatFoodNegative: [100],
    changeDirection: [100],
    gameOver: [50],
  };
  if (patterns.eatFoodPositive) {
    ret.eatFoodPositive = navigatorParam(patterns.eatFoodPositive.vibration)
  }
  if (patterns.eatFoodNegative) {
    ret.eatFoodNegative = navigatorParam(patterns.eatFoodNegative.vibration)
  }
  if (patterns.changeDirection) {
    ret.changeDirection = navigatorParam(patterns.changeDirection.vibration)
  }
  if (patterns.gameOver) {
    ret.gameOver = navigatorParam(patterns.gameOver.vibration)
  }
  return ret;
}

export function getGameVibrations() {
  const patterns = getVibroPatterns(expPaterns || {});
  return new GameVibration(patterns);
}