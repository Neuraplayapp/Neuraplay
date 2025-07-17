import React, { useState, useEffect } from 'react';
import { Star, RotateCcw, Trophy, Hash } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

interface CountingAdventureGameProps {
  onClose: () => void;
}

const CountingAdventureGame: React.FC<CountingAdventureGameProps> = ({ onClose }) => {
  const { user, addXP, addStars, updateGameProgress } = useUser();
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameOver' | 'success'>('ready');
  const [currentNumber, setCurrentNumber] = useState(1);
  const [targetNumber, setTargetNumber] = useState(5);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [items, setItems] = useState<string[]>([]);

  const emojis = ['🐻', '🎈', '🍎', '⭐', '🌻', '🚗', '🎁', '🦋', '🍓', '🐸'];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft]);

  const generateCountingChallenge = () => {
    const maxCount = Math.min(level + 4, 10);
    const count = Math.floor(Math.random() * maxCount) + 1;
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    const itemArray = Array(count).fill(emoji);
    setItems(itemArray);
    setTargetNumber(count);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setMistakes(0);
    setLevel(1);
    setTimeLeft(45);
    generateCountingChallenge();
  };

  const handleNumberClick = (number: number) => {
    if (gameState !== 'playing') return;
    
    if (number === targetNumber) {
      // Correct answer
      const points = level * 10;
      setScore(score + points);
      
      if (score + points >= level * 50) {
        setLevel(level + 1);
      }
      
      setTimeout(() => {
        generateCountingChallenge();
      }, 1000);
      
    } else {
      // Wrong answer
      setMistakes(mistakes + 1);
      if (mistakes >= 2) {
        endGame();
        return;
      }
    }
  };

  const endGame = () => {
    setGameState(score >= 100 ? 'success' : 'gameOver');
    
    if (score >= 100) {
      const starsEarned = Math.floor(score / 25);
      addXP(20 + (level * 5));
      addStars(starsEarned);
      
      if (user) {
        const currentProgress = user.profile.gameProgress['counting-adventure'] || { level: 1, stars: 0, bestScore: 0, timesPlayed: 0 };
        updateGameProgress('counting-adventure', {
          level: Math.max(currentProgress.level, level),
          stars: currentProgress.stars + starsEarned,
          bestScore: Math.max(currentProgress.bestScore, score),
          timesPlayed: currentProgress.timesPlayed + 1
        });
      }
    }
  };

  const resetGame = () => {
    setGameState('ready');
    setScore(0);
    setLevel(1);
    setMistakes(0);
    setTimeLeft(45);
    setItems([]);
    setTargetNumber(5);
  };

  return (
    <div className="text-center space-y-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Number Quest</h3>
        <p className="text-slate-600">Count the items and choose the right number!</p>
      </div>

      {/* Game Stats */}
      <div className="flex justify-center gap-8 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{score}</div>
          <div className="text-sm text-slate-500">Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{level}</div>
          <div className="text-sm text-slate-500">Level</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{mistakes}/3</div>
          <div className="text-sm text-slate-500">Mistakes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{timeLeft}s</div>
          <div className="text-sm text-slate-500">Time</div>
        </div>
      </div>

      {/* Counting Area */}
      {gameState === 'playing' && (
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-8 mb-6">
          <div className="text-lg font-semibold text-slate-700 mb-4">
            How many items do you see?
          </div>
          
          <div className="grid grid-cols-5 gap-4 max-w-md mx-auto mb-6">
            {items.map((item, index) => (
              <div
                key={index}
                className="w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center text-2xl border-2 border-orange-200 animate-bounce"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {item}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
            {Array.from({ length: Math.min(level + 4, 10) }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => handleNumberClick(number)}
                className="w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center text-xl font-bold border-2 border-orange-200 hover:border-orange-400 transition-all transform hover:scale-105 hover:bg-orange-50"
              >
                {number}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Game Status */}
      {gameState === 'ready' && (
        <div className="space-y-4">
          <p className="text-lg text-slate-700">
            Let's practice counting! Look at the items and choose the correct number.
          </p>
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold px-8 py-4 rounded-full hover:from-orange-600 hover:to-yellow-600 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <Hash className="w-5 h-5" />
            Start Counting
          </button>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="space-y-4">
          <div className="text-2xl font-bold text-red-600">Game Over!</div>
          <div className="text-lg text-slate-700">
            You reached level {level} with a score of {score}!
          </div>
          <p className="text-slate-600">
            Great job practicing your counting skills! Numbers are everywhere around us.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={resetGame}
              className="bg-blue-500 text-white font-bold px-6 py-3 rounded-full hover:bg-blue-600 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={onClose}
              className="bg-slate-500 text-white font-bold px-6 py-3 rounded-full hover:bg-slate-600 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {gameState === 'success' && (
        <div className="space-y-4">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <div className="text-3xl font-bold text-green-600">Counting Champion!</div>
            <div className="text-lg text-slate-700">
              You're a math superstar! Final score: {score}
            </div>
            <div className="flex justify-center items-center gap-2 mt-4">
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
              <span className="text-xl font-bold text-yellow-500">Stars earned this session!</span>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={resetGame}
              className="bg-green-500 text-white font-bold px-6 py-3 rounded-full hover:bg-green-600 transition-all"
            >
              Play Again
            </button>
            <button
              onClick={onClose}
              className="bg-slate-500 text-white font-bold px-6 py-3 rounded-full hover:bg-slate-600 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountingAdventureGame;