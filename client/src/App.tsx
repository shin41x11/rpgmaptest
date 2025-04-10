import React, { useState } from 'react';
import Game from '@/components/game/Game';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import GameUI from '@/components/ui/GameUI';
import '@fontsource/inter';

const App: React.FC = () => {
  const [isGameStarted, setIsGameStarted] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-background text-foreground w-full h-full flex flex-col items-center justify-center">
        {!isGameStarted ? (
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold mb-4">Dragon Quest Adventure</h1>
            <p className="text-lg max-w-md mx-auto mb-6">
              Explore a world inspired by classic RPGs like Dragon Quest and Zelda.
              Navigate through different terrains and discover hidden treasures!
            </p>
            <Button 
              size="lg" 
              onClick={() => setIsGameStarted(true)}
              className="px-8 py-6 text-lg"
            >
              Start Adventure
            </Button>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <Game />
            <GameUI />
          </div>
        )}
      </div>
    </QueryClientProvider>
  );
};

export default App;
