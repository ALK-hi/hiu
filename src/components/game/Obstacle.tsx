import type { FC } from 'react';

export interface ObstacleType {
  id: number;
  x: number;
  gapY: number;
  gapHeight: number;
}

interface ObstacleProps {
  obstacle: ObstacleType;
}

const OBSTACLE_WIDTH = 80;

const Obstacle: FC<ObstacleProps> = ({ obstacle }) => {
  const { x, gapY, gapHeight } = obstacle;

  return (
    <>
      {/* Top part */}
      <div
        className="absolute bg-accent rounded-md"
        style={{
          left: `${x}px`,
          top: 0,
          width: `${OBSTACLE_WIDTH}px`,
          height: `${gapY}px`,
          boxShadow: '0 0 15px 2px hsl(var(--accent)/0.7)',
        }}
        aria-hidden="true"
      />
      {/* Bottom part */}
      <div
        className="absolute bg-accent rounded-md"
        style={{
          left: `${x}px`,
          top: `${gapY + gapHeight}px`,
          width: `${OBSTACLE_WIDTH}px`,
          bottom: 0,
          boxShadow: '0 0 15px 2px hsl(var(--accent)/0.7)',
        }}
        aria-hidden="true"
      />
    </>
  );
};

export default Obstacle;
