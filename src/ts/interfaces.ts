export interface Pixel {
  x: number;
  y: number;
}

export interface Direction {
  dx: number;
  dy: number;
}

export interface IDisplay {
  width(): number;
  height(): number;
  drawPixels(color: string, ...pixels: Pixel[]): void;
  drawSnake(snake: ISnake): void;
  drawFood(food: Food): void;
  clear(): void;
}

export interface IDisplayImages {
  snakeHead: HTMLImageElement;
  snakeBodyCorner: HTMLImageElement;
  snakeBody: HTMLImageElement;
  snakeTail: HTMLImageElement;
  food: {
    [key: string]: HTMLImageElement;
  };
}

export interface ISnake {
  pixels: Pixel[];
  direction: Direction;

  nextPixel(): Pixel;
  changeDirection(direction: Direction): void;
  goTo(pixel: Pixel): void;
  eatFrom(pixel: Pixel): void;
}

export interface Food {
  name: string;
  pixel: Pixel;
  energy: number;
}

export interface IFoodFactory {
  getFood(): Food;
}

export interface ISnakeFactory {
  getSnake(): ISnake;
}

export interface VibrationPatterns {
  eatFoodNegative: number[];
  eatFoodPositive: number[];
  changeDirection: number[];
  gameOver: number[];
}

export interface IGameVibration {
  toggleSound(): boolean;
  eatFoodPositive(): void;
  eatFoodNegative(): void;
  changeDirection(): void;
  gameOver(): void;
  setPatterns(patterns: VibrationPatterns): void;
}
