import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

const GameOverScreen: FC<GameOverScreenProps> = ({ score, highScore, onRestart }) => {
  return (
    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50 animate-in fade-in backdrop-blur-sm">
      <Card className="w-full max-w-md border-primary shadow-[0_0_30px_0px_hsl(var(--primary)/0.4)] animate-in zoom-in-90">
        <CardHeader className="text-center items-center">
          <CardTitle className="text-4xl font-bold text-primary tracking-widest drop-shadow-[0_0_10px_hsl(var(--primary))]">
            GAME OVER
          </CardTitle>
          <CardDescription className="text-base">
            You navigated the neon void!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="flex justify-around w-full">
            <div className="text-center">
              <p className="text-sm uppercase text-muted-foreground">Score</p>
              <p className="text-5xl font-bold text-accent drop-shadow-[0_0_10px_hsl(var(--accent))]">{score}</p>
            </div>
            <div className="text-center">
              <p className="text-sm uppercase text-muted-foreground">High Score</p>
              <p className="text-5xl font-bold">{highScore}</p>
            </div>
          </div>
          <Button onClick={onRestart} size="lg" className="w-full mt-4 group text-lg py-7">
            <RefreshCw className="mr-2 h-5 w-5 transition-transform group-hover:rotate-180" />
            Play Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameOverScreen;
