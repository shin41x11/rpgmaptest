import { create } from 'zustand';

interface GameState {
  game: Phaser.Game | null;
  health: number;
  maxHealth: number;
  score: number;
  setGame: (game: Phaser.Game) => void;
  setHealth: (health: number) => void;
  incrementScore: (amount?: number) => void;
  resetGame: () => void;
}

export const useGameState = create<GameState>((set) => ({
  game: null,
  health: 100,
  maxHealth: 100,
  score: 0,
  
  setGame: (game) => set({ game }),
  
  setHealth: (health) => set({ health }),
  
  incrementScore: (amount = 10) => set((state) => ({ 
    score: state.score + amount 
  })),
  
  resetGame: () => set({ 
    health: 100, 
    score: 0 
  }),
}));
