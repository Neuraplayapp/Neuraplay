import React, { useState, useEffect } from 'react';
import { Star, RotateCcw, Trophy, Play, Square } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

interface InhibitionGameProps {
  onClose: () => void;
}

const InhibitionGame: React.FC<InhibitionGameProps> = ({ onClose }) => {
  const { user, addXP, addStars, updateGameProgress } = useUser();
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameOver' | 'success'>('ready');
  const [currentSymbol, setCurrentSymbol] = useState<'go' | 'stop' | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [symbolDisplayTime, setSymbolDisplayTime] = useState(2000);
  const [isWaiting, setIsWaiting] = useState(false);

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

  useEffect(() => {
    let symbolTimer: NodeJS.Timeout;
    if (gameState === 'playing' && !isWaiting) {
      const delay = Math.random() * 2000 + 1000; // 1-3 seconds
      symbolTimer = setTimeout(() => {
        showNewSymbol();
      }, delay);
    }
    return () => clearTimeout(symbolTimer);
  }, [gameState, isWaiting, score]);

  const showNewSymbol = () => {
    const isGoSymbol = Math.random() > 0.3; // 70% chance of "go", 30% chance of "stop"
    setCurrentSymbol(isGoSymbol ? 'go' : 'stop');
    setIsWaiting(true);
    
    setTimeout(() => {
      setCurrentSymbol(null);
      setIsWaiting(false);
    }, symbolDisplayTime);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setMistakes(0);
    setLevel(1);
    setTimeLeft(30);
    setCurrentSymbol(null);
    setIsWaiting(false);
  };

  const handleAction = (action: 'go' | 'stop') => {
    if (gameState !== 'playing' || !currentSymbol) return;

    if (action === currentSymbol) {
      // Correct action
      const points = currentSymbol === 'stop' ? 20 : 10; // Stopping correctly is worth more
      setScore(score + points);
      
      // Level up every 100 points
      if (score + points >= level * 100) {
        setLevel(level + 1);
        setSymbolDisplayTime(Math.max(1000, symbolDisplayTime - 100)); // Faster as level increases
      }
    } else {
      // Wrong action
      setMistakes(mistakes + 1);
      if (mistakes >= 2) {
        endGame();
        return;
      }
    }

    setCurrentSymbol(null);
    setIsWaiting(false);
  };

  const endGame = () => {
    setGameState(score >= 200 ? 'success' : 'gameOver');
    
    if (score >= 200) {
      const starsEarned = Math.floor(score / 50);
      addXP(30 + (level * 10));
      addStars(starsEarned);
      
      if (user) {
        const currentProgress = user.profile.gameProgress['inhibition'] || { level: 1, stars: 0, bestScore: 0, timesPlayed: 0 };
        updateGameProgress('inhibition', {
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
    setTimeLeft(30);
    setCurrentSymbol(null);
    setIsWaiting(false);
    setSymbolDisplayTime(2000);
  };

  return (
    <div className="text-center space-y-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Stop & Go Adventure</h3>
        <p className="text-slate-600">Press GO for green circles, but STOP for red squares!</p>
      </div>

      {/* Game Stats */}
      <div className="flex justify-center gap-8 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{score}</div>
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

      {/* Game Area */}
      <div className="bg-slate-100 rounded-2xl p-12 mb-6 min-h-[200px] flex items-center justify-center">
        {currentSymbol === 'go' && (
          <div className="w-24 h-24 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
        )}
        {currentSymbol === 'stop' && (
          <div className="w-24 h-24 bg-red-500 rounded-lg animate-pulse shadow-lg"></div>
        )}
        {!currentSymbol && gameState === 'playing' && (
          <div className="text-slate-500 text-lg">Get ready...</div>
        )}
        {gameState === 'ready' && (
          <div className="text-slate-500 text-lg">Press Start to begin!</div>
        )}
      </div>

      {/* Action Buttons */}
      {gameState === 'playing' && (
        <div className="flex justify-center gap-8">
          <button
            onClick={() => handleAction('go')}
            className="bg-green-500 text-white font-bold px-8 py-4 rounded-full hover:bg-green-600 transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <Play className="w-6 h-6" />
            GO!
          </button>
          <button
            onClick={() => handleAction('stop')}
            className="bg-red-500 text-white font-bold px-8 py-4 rounded-full hover:bg-red-600 transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <Square className="w-6 h-6" />
            STOP!
          </button>
        </div>
      )}

      {/* Game Status */}
      {gameState === 'ready' && (
        <div className="space-y-4">
          <p className="text-lg text-slate-700">
            Test your impulse control! Press GO for green circles, but resist pressing anything for red squares.
          </p>
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-green-500 to-red-500 text-white font-bold px-8 py-4 rounded-full hover:from-green-600 hover:to-red-600 transition-all transform hover:scale-105"
          >
            Start Game
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
            Great job practicing impulse control! Try to resist the red squares next time.
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
            <div className="text-3xl font-bold text-green-600">Excellent Control!</div>
            <div className="text-lg text-slate-700">
              You mastered impulse control! Final score: {score}
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

export default InhibitionGame;