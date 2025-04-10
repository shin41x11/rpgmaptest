import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BootScene } from './BootScene';
import { PreloadScene } from './PreloadScene';
import { WorldScene } from './WorldScene';
import { useGameState } from '@/lib/stores/useGameState';

const Game: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const setGame = useGameState(state => state.setGame);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: containerRef.current,
        pixelArt: true,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: process.env.NODE_ENV === 'development'
          }
        },
        scene: [BootScene, PreloadScene, WorldScene],
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      // Create the game instance
      gameRef.current = new Phaser.Game(config);
      
      // Store the game instance in our global state
      setGame(gameRef.current);

      // Log that the game has been initialized
      console.log('Phaser game initialized');
    }

    // Cleanup function to destroy the game when component unmounts
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        console.log('Phaser game destroyed');
      }
    };
  }, [setGame]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (gameRef.current) {
        gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div ref={containerRef} className="game-container w-full h-full" />;
};

export default Game;
