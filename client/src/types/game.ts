export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}

export interface PlayerState {
  direction: Direction;
  isMoving: boolean;
}

export interface GameOptions {
  width: number;
  height: number;
  parent: HTMLElement;
}

export enum GamePhase {
  BOOT = 'boot',
  PRELOAD = 'preload',
  TITLE = 'title',
  WORLD = 'world',
  BATTLE = 'battle',
  GAME_OVER = 'gameOver'
}

export interface TileProperties {
  collides?: boolean;
  encounter?: number;
  warp?: {
    map: string;
    x: number;
    y: number;
  };
}
