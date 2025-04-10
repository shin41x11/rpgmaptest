import React, { useState } from 'react';
import { useAudio } from '@/lib/stores/useAudio';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const GameUI: React.FC = () => {
  const { isMuted, toggleMute } = useAudio();
  const [showControls, setShowControls] = useState(false);

  return (
    <div className="absolute top-0 left-0 w-full p-4 pointer-events-none">
      <div className="flex justify-between">
        <div>
          {/* Game controls button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="pointer-events-auto bg-background/80 backdrop-blur-sm"
              >
                <Info className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Game Controls</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold">Arrow Keys</div>
                  <div>Move the character</div>
                  
                  <div className="font-semibold">Z Key</div>
                  <div>Zoom in</div>
                  
                  <div className="font-semibold">X Key</div>
                  <div>Zoom out</div>
                  
                  <div className="font-semibold">D Key</div>
                  <div>Toggle debug mode</div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div>
          {/* Sound toggle button */}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleMute}
            className="pointer-events-auto bg-background/80 backdrop-blur-sm"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Controls (only shown on touch devices) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-48">
        <img 
          src="/assets/ui/controls.svg" 
          alt="D-Pad Controls" 
          className="w-full h-full opacity-50 pointer-events-auto"
          onTouchStart={() => setShowControls(true)}
          onTouchEnd={() => setShowControls(false)}
        />
      </div>
    </div>
  );
};

export default GameUI;
