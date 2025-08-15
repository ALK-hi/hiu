'use client';

import { useState, useEffect, useCallback } from 'react';

const HIGH_SCORE_KEY = 'neonTapEscapeHighScore';

export const useHighScore = () => {
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    try {
      const storedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
      if (storedHighScore) {
        setHighScore(JSON.parse(storedHighScore));
      }
    } catch (error) {
      console.error("Could not retrieve high score from local storage", error);
    }
  }, []);

  const updateHighScore = useCallback((newScore: number) => {
    setHighScore(prevHighScore => {
        if (newScore > prevHighScore) {
            try {
                localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(newScore));
                return newScore;
            } catch (error) {
                console.error("Could not save high score to local storage", error);
            }
        }
        return prevHighScore;
    });
  }, []);

  return { highScore, updateHighScore };
};
