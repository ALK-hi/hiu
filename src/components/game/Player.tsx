import type { FC } from 'react';

interface PlayerProps {
  y: number;
}

const PLAYER_WIDTH = 32;

const Player: FC<PlayerProps> = ({ y }) => {
  return (
    <div
      className="absolute bg-primary rounded-full"
      style={{
        left: '20%',
        top: `${y}px`,
        width: `${PLAYER_WIDTH}px`,
        height: `${PLAYER_WIDTH}px`,
        transform: `translate(-50%, -50%)`,
        boxShadow: '0 0 20px 5px hsl(var(--primary)/0.7)',
        transition: 'top 0.05s linear',
      }}
      aria-label="Player character"
    />
  );
};

export default Player;
