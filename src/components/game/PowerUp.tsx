import type { FC } from 'react';

export interface PowerUpType {
  id: number;
  x: number;
  y: number;
}

const POWERUP_SIZE = 24;

const PowerUp: FC<PowerUpType> = ({ x, y }) => {
  return (
    <div
      className="absolute bg-chart-4 rounded-md"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${POWERUP_SIZE}px`,
        height: `${POWERUP_SIZE}px`,
        transform: 'translate(-50%, -50%) rotate(45deg)',
        boxShadow: '0 0 15px 5px hsl(var(--chart-4)/0.7)'
      }}
      aria-label="Power-up"
    />
  );
};

export default PowerUp;
