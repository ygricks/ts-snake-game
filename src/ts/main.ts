import { Display } from './display';
import { FoodFactory, SnakeFactory } from './factories';
import { Game } from './game';
import { GameVibration } from './GameVibration';
import { UserMControler } from './UserMControler';

const DISPLAY_HEIGHT = 25;
const DISPLAY_WIDTH = 25;

const VIBRATION_PATTERN = {
  eatFood: [100],
  changeDirection: [50],
  gameOver: [250, 100, 250],
};

class GameModal {
  private $window: HTMLElement;
  private _isOpened: boolean;

  constructor($window: HTMLElement) {
    this.$window = $window;

    const { classList } = this.$window;
    this._isOpened = classList.contains('modal-instructions') ||
      classList.contains('modal-game-over') ||
      classList.contains('modal-resume')
    ;
  }

  public isOpened() {
    return this._isOpened;
  }

  public close() {
    const { classList } = this.$window;
    classList.remove('modal-instructions');
    classList.remove('modal-game-over');
    classList.remove('modal-resume');
    this._isOpened = false;
  }

  public gameOver() {
    this._openType('modal-game-over');
  }

  public resume() {
    this._openType('modal-resume');
  }

  public instructions() {
    this._openType('modal-instructions');
  }

  private _openType(type: string) {
    if (!this.$window.classList.contains(type)) {
      this.close()
      this.$window.classList.add(type);
      this._isOpened = true;
    }
  }
}

class App {
  private game: Game;
  private modal: GameModal;

  constructor(game: Game, modal: GameModal, ) {
    this.game = game;
    this.modal = modal;
  }

  closeModal() {
    const { modal, game } = this;
    modal.close();
    if (game.isFinished()) {
      game.reset();
    } else if (!game.isRunning()) {
      game.exec('play');
    }
  }

  userInput(eventCode: string) {
    switch (eventCode) {
      case 'Top':
      case 'ArrowUp':
      case 'KeyW':
        this.game.exec('changeDirection', 'top');
        break;
      case 'Bottom':
      case 'ArrowDown':
      case 'KeyS':
        this.game.exec('changeDirection', 'bottom');
        break;
      case 'Left':
      case 'ArrowLeft':
      case 'KeyA':
        this.game.exec('changeDirection', 'left');
        break;
      case 'Right':
      case 'ArrowRight':
      case 'KeyD':
        this.game.exec('changeDirection', 'right');
        break;
      case 'Space':
        if (this.modal.isOpened()) {
          this.closeModal();
        } else {
          if (this.game.isRunning()) {
            this.game.exec('pause');
            this.modal.resume();
          } else {
            this.game.exec('play');
          }
        }
        break;
    }
  }
}

function createGame($canvas: HTMLCanvasElement) {
  const display = new Display($canvas.getContext('2d'), $canvas.width / DISPLAY_WIDTH);

  const snakeFactory = new SnakeFactory([
    {x: 2, y: 12}, {x: 1, y: 12}, {x: 0, y: 12}
  ], {dx: 1, dy: 0}, 256);

  const foodFactory = new FoodFactory(DISPLAY_HEIGHT, DISPLAY_WIDTH, 5);
  const vibrations = new GameVibration(VIBRATION_PATTERN);
  const game = new Game(display, snakeFactory, foodFactory, vibrations, {
    colors: {
      snakeHead: '#1c469d',
      snake: '#4875eb',
      food: '#e7471d',
    },
    displayHasWall: true,
  });

  return {game, vibrations};
}

function main() {
  const $closeModal = document.querySelector('.close-modal');
  const $bestScore = document.querySelectorAll('.game-best-score span');
  const $bestScoreWrapper = document.querySelectorAll('.game-best-score');
  const $gameScore = document.querySelectorAll('.game-score span');
  const $gameSound = document.querySelector('.game-sound');

  const modal = new GameModal(
    document.querySelector('.game-modal')
  );

  const $canvas = document.getElementById('display') as HTMLCanvasElement;
  const {game, vibrations} = createGame($canvas);
  const app = new App(game, modal);
  game
  .on('scoreUpdated', function(score: number) {
    const strScore = score.toString();
    for (let i = 0; i < $gameScore.length; i++) {
      $gameScore[i].innerHTML = strScore;
    }
  })
  .on('bestscoreUpdated', function(score: number) {
    const strScore = score.toString();
    for (let i = 0; i < $bestScore.length; i++) {
      $bestScore[i].innerHTML = strScore;
    }
    if (score > 0) {
      for (let i = 0; i < $bestScoreWrapper.length; i++) {
        $bestScoreWrapper[i].classList.remove('invisible')
      }
    }
  })
  .on('gameOver', function() {
    modal.gameOver();
  })
  ;

  $closeModal.addEventListener('click', function() {
    app.closeModal();
  });

  document.addEventListener('keydown', function(event: KeyboardEvent) {
    app.userInput(event.code);
  })
  ;

  const control = new UserMControler('control-buttons', 'free-control');
  control.onChange((n: string, o: string) => {
    if (!game.isFinished() && n) {
      if (!game.isRunning()) {
        app.userInput('Space');
      }
      app.userInput(n);
    }
  });

  $gameSound.addEventListener('click', function() {
    const mutedClass = 'muted';
    const hasSound = vibrations.toggleSound();
    if (hasSound) {
      $gameSound.classList.remove(mutedClass);
    } else {
      $gameSound.classList.add(mutedClass);
    }
  });
}

main();
