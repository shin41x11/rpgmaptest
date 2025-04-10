import React, { useState, useEffect } from 'react';
import Game from '@/components/game/Game';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import GameUI from '@/components/ui/GameUI';
import '@fontsource/inter';

const App: React.FC = () => {
  console.log('App component rendering');
  const [isGameStarted, setIsGameStarted] = useState(false);

  // Debug log to check state changes
  useEffect(() => {
    console.log('Game started state changed:', isGameStarted);
  }, [isGameStarted]);

  // Simple function to start the game
  const startGame = () => {
    console.log('Start game button clicked!');
    setIsGameStarted(true);
  };

  // Render based on game state
  if (isGameStarted) {
    console.log('Rendering game view');
    return (
      <QueryClientProvider client={queryClient}>
        <div className="relative w-full h-full">
          <Game />
          <GameUI />
        </div>
      </QueryClientProvider>
    );
  }

  console.log('Rendering start screen');
  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-background text-foreground w-full h-full flex flex-col items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold mb-4">Dragon Quest Adventure</h1>
          <p className="text-lg max-w-md mx-auto mb-6">
            Explore a world inspired by classic RPGs like Dragon Quest and Zelda.
            Navigate through different terrains and discover hidden treasures!
          </p>
          
          {/* Simple button with inline style and onClick handler */}
          <div 
            style={{
              display: 'inline-block',
              backgroundColor: 'blue',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
            onClick={startGame}
          >
            Start Adventure
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default App;
