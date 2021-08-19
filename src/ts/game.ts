import {
  Direction, Food, IDisplay, ISnakeFactory, IFoodFactory, ISnake, IGameVibration
} from "./interfaces";

interface Settings {
  colors: {
    snakeHead: string;
    snake: string;
    food: string;
  };
  displayHasWall: boolean;
}

const DIRECTIONS: {[d: string]: Direction} = {
  left:   {dx: -1, dy: 0},
  right:  {dx: 1, dy: 0},
  top:    {dx: 0, dy: -1},
  bottom: {dx: 0, dy: 1},
};

export class Game {
  private display: IDisplay;
  private snake: ISnake;
  private snakeFactory: ISnakeFactory;
  private foodFactory: IFoodFactory;
  private food: Food;
  private vibration: IGameVibration;

  private _score: number = 0;
  private _bestScore: number = 0;
  private _runningTimer: any = false;
  private _delay: number = 100;
  private _finished: boolean = false;
  private _requestDirection: Direction[] = [];

  private _settings: Settings;

  private events: {[name: string]: Function[]} = {};

  constructor(display: IDisplay, snakeFactory: ISnakeFactory, foodFactory: IFoodFactory, vibration: IGameVibration, settings: Settings) {
    this.display = display;
    this.snakeFactory = snakeFactory;
    this.foodFactory = foodFactory;
    this.vibration = vibration;
    this._settings = settings;

    this.reset();
  }

  public isRunning() {
    return this._runningTimer !== false;
  }

  public isFinished() {
    return this._finished;
  }

  public score() {
    return this._score;
  }

  public reset() {
    this.snake = this.snakeFactory.getSnake();
    this.food = this.foodFactory.getFood(1);
    this._finished = false;
    if (this._score != 0) {
      this._score = 0;
      this.trigger('scoreUpdated', this._score);
    }
    this._draw();
  }

  public exec(action: string, ...args: any) {
    if (this.isFinished()) {
      return;
    }
    switch (action) {
      case 'play':
        this.play();
        break;
      case 'pause':
        this.pause();
        break;
      case 'changeDirection':
        if (this.isRunning()) {
          this._requestDirection.push( DIRECTIONS[args[0]] );
        }
        break;
    }
  }

  public on(action: string, callback: Function) {
    if (this.isFinished()) {
      return;
    }
    if (!this.events[action]) {
      this.events[action] = [];
    }
    this.events[action].push(callback);
    return this;
  }

  private trigger(action: string, ...args: any[]) {
    if (this.events[action]) {
      this.events[action].forEach((callback) => {
        callback.apply(this, args);
      });
    }
  }

  private play() {
    if (!this._runningTimer) {
      this._tic();
      this.trigger('resumed');
    }
  }

  private pause(trigger: boolean = true) {
    if (this._runningTimer) {
      clearTimeout(this._runningTimer);
      this._runningTimer = false;
      if (trigger) {
        this.trigger('stopped');
      }
    }
  }

  private _tic() {
    this.pause(false);

    this._update();
    this._checkCollisions();
    if (this.isFinished()) {
      const hasNewBestScore = this._bestScore < this._score;
      if (hasNewBestScore) {
        this._bestScore = this._score;
      }

      this.vibration.gameOver();
      this.trigger('gameOver');
      if (hasNewBestScore) {
        this.trigger('bestscoreUpdated', this._bestScore);
      }
      return;
    }

    this._draw();
    this._runningTimer = setTimeout(() => {
      this._tic();
    }, this._delay);
  }

  private _checkCollisions() {
    let gameOver = false;
    const head = this.snake.pixels[0];

    // Collison with walls
    const { display } = this;
    if (this._settings.displayHasWall &&
      (head.x < 0 || head.y < 0 || display.width() <= head.x || display.height() <= head.y)
    ) {
      gameOver = true;
    }

    // Collistions with snake
    if (!gameOver) {
      for (let i = 1; i < this.snake.pixels.length; i++) {
        const pixel = this.snake.pixels[i];
        if (pixel.x == head.x && pixel.y == head.y) {
          gameOver = true;
          break;
        }
      }
    }

    if (gameOver) {
      this.pause(false);
      this._finished = true;
    }
  }

  private _update() {
    if (this._requestDirection.length) {
      this.vibration.changeDirection();
      this.snake.changeDirection(this._requestDirection.shift());
    }
    const nextPixel = this.snake.nextPixel();
    const { snake, food } = this;
    if (nextPixel.x == food.pixel.x && nextPixel.y == food.pixel.y) {
      this.vibration.eatFood();
      snake.eatFrom(nextPixel);
      this._score += food.energy;
      this.trigger('scoreUpdated', this._score);
      this.food = this.foodFactory.getFood(1);
    } else {
      snake.goTo(nextPixel);
    }
  }

  private _draw() {
    const { display, snake, food } = this;
    const { colors } = this._settings;
    display.clear();
    display.drawSnake(colors, snake);
    display.drawFood(colors, food);
  }
}
