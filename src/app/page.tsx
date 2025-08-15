'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useHighScore } from '@/hooks/useHighScore';
import Player from '@/components/game/Player';
import Obstacle, { type ObstacleType } from '@/components/game/Obstacle';
import PowerUp, { type PowerUpType } from '@/components/game/PowerUp';
import GameOverScreen from '@/components/game/GameOverScreen';

// Game constants
const GRAVITY = 0.4;
const JUMP_VELOCITY = -8;
const OBSTACLE_SPEED = -3.5;
const OBSTACLE_WIDTH = 80;
const OBSTACLE_GAP = 220;
const OBSTACLE_INTERVAL = 2000;
const POWERUP_CHANCE = 0.25;
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 32;

type GameState = 'idle' | 'countdown' | 'playing' | 'gameOver';

const checkCollision = (rect1: DOMRect, rect2: DOMRect) => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
};

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const { highScore, updateHighScore } = useHighScore();
  const [countdown, setCountdown] = useState(3);

  // State for rendering
  const [renderPlayerY, setRenderPlayerY] = useState(300);
  const [renderObstacles, setRenderObstacles] = useState<ObstacleType[]>([]);
  const [renderPowerUps, setRenderPowerUps] = useState<PowerUpType[]>([]);

  // Refs for game logic
  const playerY = useRef(300);
  const playerVelocity = useRef(0);
  const obstacles = useRef<ObstacleType[]>([]);
  const powerUps = useRef<PowerUpType[]>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const obstacleTimer = useRef(0);
  const scoreTimer = useRef(0);
  const lastObstacleId = useRef(0);
  const lastPowerUpId = useRef(0);
  const gameAreaSize = useRef({ width: 800, height: 600 });
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateGameAreaSize = () => {
      if (gameAreaRef.current) {
        gameAreaSize.current = {
          width: gameAreaRef.current.clientWidth,
          height: gameAreaRef.current.clientHeight,
        };
        if (gameState === 'idle') {
          const newY = gameAreaSize.current.height / 2;
          playerY.current = newY;
          setRenderPlayerY(newY);
        }
      }
    };
    updateGameAreaSize();
    window.addEventListener('resize', updateGameAreaSize);
    return () => window.removeEventListener('resize', updateGameAreaSize);
  }, [gameState]);

  const resetGame = useCallback(() => {
    const { height } = gameAreaSize.current;
    playerY.current = height / 2;
    playerVelocity.current = 0;
    obstacles.current = [];
    powerUps.current = [];
    obstacleTimer.current = OBSTACLE_INTERVAL;
    scoreTimer.current = 0;
    setCountdown(3);

    if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
    }

    setScore(0);
    setRenderPlayerY(playerY.current);
    setRenderObstacles([]);
    setRenderPowerUps([]);
  }, []);

  const playGame = useCallback(() => {
    setGameState('playing');
  }, []);

  const startCountdown = useCallback(() => {
    resetGame();
    setGameState('countdown');
    countdownTimerRef.current = setInterval(() => {
        setCountdown(prev => {
            if (prev <= 1) {
                clearInterval(countdownTimerRef.current!);
                playGame();
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
  }, [resetGame, playGame]);

  const gameOver = useCallback(() => {
    setGameState('gameOver');
    updateHighScore(score);
  }, [score, updateHighScore]);

  const restartGame = useCallback(() => {
    startCountdown();
  }, [startCountdown]);

  const handleTap = useCallback(() => {
    if (gameState === 'playing') {
      playerVelocity.current = JUMP_VELOCITY;
    } else if (gameState === 'idle') {
      startCountdown();
    }
  }, [gameState, startCountdown]);

  const gameUpdateCallback = useCallback((deltaTime: number) => {
      const { width, height } = gameAreaSize.current;
      
      playerVelocity.current += GRAVITY;
      playerY.current += playerVelocity.current;

      if (playerY.current > height - PLAYER_HEIGHT / 2 || playerY.current < PLAYER_HEIGHT / 2) {
        gameOver();
        return;
      }
      
      scoreTimer.current += deltaTime;
      if (scoreTimer.current > 100) {
          scoreTimer.current = 0;
          setScore(s => s + 1);
      }

      obstacleTimer.current += deltaTime;
      if (obstacleTimer.current >= OBSTACLE_INTERVAL) {
        obstacleTimer.current = 0;
        lastObstacleId.current++;
        const gapY = Math.random() * (height - OBSTACLE_GAP - 200) + 100;
        obstacles.current.push({ id: lastObstacleId.current, x: width, gapY: gapY, gapHeight: OBSTACLE_GAP });

        if (Math.random() < POWERUP_CHANCE) {
          lastPowerUpId.current++;
          const powerUpY = gapY + Math.random() * (OBSTACLE_GAP - 40) + 20;
          powerUps.current.push({ id: lastPowerUpId.current, x: width + OBSTACLE_WIDTH / 2, y: powerUpY });
        }
      }
      
      obstacles.current.forEach(o => o.x += OBSTACLE_SPEED);
      powerUps.current.forEach(p => p.x += OBSTACLE_SPEED);
      
      const playerRect = { x: width * 0.2 - PLAYER_WIDTH / 2, y: playerY.current - PLAYER_HEIGHT / 2, width: PLAYER_WIDTH, height: PLAYER_HEIGHT } as DOMRect;
      
      for (const o of obstacles.current) {
          const topRect = { x: o.x, y: 0, width: OBSTACLE_WIDTH, height: o.gapY } as DOMRect;
          const bottomRect = { x: o.x, y: o.gapY + o.gapHeight, width: OBSTACLE_WIDTH, height: height - (o.gapY + o.gapHeight) } as DOMRect;
          if (checkCollision(playerRect, topRect) || checkCollision(playerRect, bottomRect)) {
              gameOver();
              return;
          }
      }

      const collectedPowerUpIds = new Set<number>();
      for (const p of powerUps.current) {
          const powerUpRect = { x: p.x - 10, y: p.y - 10, width: 20, height: 20 } as DOMRect;
          if (checkCollision(playerRect, powerUpRect)) {
              setScore(s => s + 100);
              collectedPowerUpIds.add(p.id);
          }
      }

      if(collectedPowerUpIds.size > 0) {
        powerUps.current = powerUps.current.filter(p => !collectedPowerUpIds.has(p.id));
      }

      obstacles.current = obstacles.current.filter(o => o.x > -OBSTACLE_WIDTH);
      powerUps.current = powerUps.current.filter(p => p.x > -20);
      
      setRenderPlayerY(playerY.current);
      setRenderObstacles([...obstacles.current]);
      setRenderPowerUps([...powerUps.current]);
    },
    [gameOver]
  );

  useGameLoop(gameUpdateCallback, gameState === 'playing');

  return (
    <main
      className="h-screen w-screen overflow-hidden bg-background flex flex-col items-center justify-center font-headline cursor-pointer select-none"
      onClick={handleTap}
      ref={gameAreaRef}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && handleTap()}
      aria-label="Game area, tap or press Space/Enter to play or jump"
    >
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none">
        <p className="text-xl text-muted-foreground uppercase tracking-widest">Score</p>
        <p className="text-6xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">{score}</p>
      </div>
      
      {gameState === 'idle' && (
        <div className="text-center z-20 animate-pulse">
            <h1 className="text-5xl md:text-7xl font-bold text-primary tracking-widest drop-shadow-[0_0_15px_hsl(var(--primary))]">NEON TAP ESCAPE</h1>
            <p className="text-2xl text-accent mt-4 drop-shadow-[0_0_10px_hsl(var(--accent))]">Tap or Press Space to Start</p>
        </div>
      )}

      {gameState === 'countdown' && (
         <div className="text-center z-20">
            <p className="text-9xl font-bold text-primary animate-ping" style={{animationDuration: '1s'}}>{countdown}</p>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'gameOver' || gameState === 'countdown') && (
        <>
          <Player y={renderPlayerY} />
          {renderObstacles.map(obstacle => (
            <Obstacle key={obstacle.id} obstacle={obstacle} />
          ))}
          {renderPowerUps.map(powerUp => (
            <PowerUp key={powerUp.id} {...powerUp} />
          ))}
        </>
      )}

      {gameState === 'gameOver' && (
        <GameOverScreen score={score} highScore={highScore} onRestart={restartGame} />
      )}
    </main>
  );
}
