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
    console.log('Game component mount effect running');
    if (containerRef.current && !gameRef.current) {
      try {
        console.log('Creating Phaser game instance');
        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: window.innerWidth,
          height: window.innerHeight,
          parent: containerRef.current,
          pixelArt: true,
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { x: 0, y: 0 },
              debug: false // Disable debug in production
            }
          },
          scene: [BootScene, PreloadScene, WorldScene],
          scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH
          },
          // Add safe fallbacks
          render: {
            antialias: false,
            pixelArt: true,
            roundPixels: true
          },
          // Add more debug info to help
          banner: { hidePhaser: false }
        };

        // Create the game instance with error handling
        console.log('About to create Phaser.Game with config:', config);
        gameRef.current = new Phaser.Game(config);
        
        // Store the game instance in our global state
        setGame(gameRef.current);

        // Log that the game has been initialized
        console.log('Phaser game successfully initialized');
      } catch (error) {
        console.error('Error initializing Phaser game:', error);
      }
    } else {
      console.log('Container or game not ready:', 
        'Container exists:', !!containerRef.current,
        'Game exists:', !!gameRef.current);
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
