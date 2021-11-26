import vibrationToPattern from './sig-transformations';
import { GameVibration } from './game-vibration';
import { io } from 'socket.io-client';

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
  console.log(pattern, "<<<<");
  return vibrationToPattern(pattern, 40);
}

/* -------------------------------------------------------------------------- */

class Server {
  private socket;
  private obj: PaternsItems[] = [];

  constructor() {
    const u = document.location;
    let code = u.pathname.split('/').pop();
    if (!code || !/^[a-z0-9]{12}$/.test(code)) {
      code = '';
    }
    if (code) {
      this.socket = io(`${u.protocol}//${u.hostname}:3002`, {
        transports: ['websocket'],
        forceNew: true,
        upgrade: false,
      });
      this.socket.on(`update:${code}`, (data) => {
        console.log('recieved', data);
        for (let i = 0; i < this.obj.length; i++) {
          getVibroPatterns(this.obj[i], data);
        }
      });
    } else {
      // console.log("No live connection to server");
    }
  }

  bind(o: PaternsItems) {
    this.obj.push(o);
  }
}

function emptyVibroPatterns(): PaternsItems {
  return {
    eatFoodPositive: [],
    eatFoodNegative: [],
    changeDirection: [],
    gameOver:        [],
  };
}

function getVibroPatterns(ret: PaternsItems, patterns: PaternsItems) {
  ret.eatFoodPositive = patterns.eatFoodPositive ? navigatorParam(patterns.eatFoodPositive.vibration) : [];
  ret.eatFoodNegative = patterns.eatFoodNegative ? navigatorParam(patterns.eatFoodNegative.vibration) : [];
  ret.changeDirection = patterns.changeDirection ? navigatorParam(patterns.changeDirection.vibration) : [];
  ret.gameOver        = patterns.gameOver        ? navigatorParam(patterns.gameOver.vibration)        : [];
  return ret;
}

export function getGameVibrations() {
  const patterns = getVibroPatterns(emptyVibroPatterns(), expPaterns || {});
  new Server().bind(patterns);
  return new GameVibration(patterns);
}
