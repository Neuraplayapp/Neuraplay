import React, { useState, useEffect } from 'react';
import { Star, RotateCcw, Trophy } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

interface MemorySequenceGameProps {
  onClose: () => void;
}

const MemorySequenceGame: React.FC<MemorySequenceGameProps> = ({ onClose }) => {
  const { user, addXP, addStars, updateGameProgress } = useUser();
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameOver' | 'success'>('ready');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [activeButton, setActiveButton] = useState<number | null>(null);

  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];

  useEffect(() => {
    if (isShowingSequence) {
      let index = 0;
      const interval = setInterval(() => {
        if (index < sequence.length) {
          setActiveButton(sequence[index]);
          setTimeout(() => setActiveButton(null), 400);
          index++;
        } else {
          setIsShowingSequence(false);
          clearInterval(interval);
        }
      }, 600);
      return () => clearInterval(interval);
    }
  }, [isShowingSequence, sequence]);

  const generateSequence = () => {
    const newSequence = [];
    const sequenceLength = Math.min(level + 2, 8);
    for (let i = 0; i < sequenceLength; i++) {
      newSequence.push(Math.floor(Math.random() * 4));
    }
    setSequence(newSequence);
    setPlayerSequence([]);
    setIsShowingSequence(true);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    generateSequence();
  };

  const handleButtonClick = (buttonIndex: number) => {
    if (isShowingSequence || gameState !== 'playing') return;

    const newPlayerSequence = [...playerSequence, buttonIndex];
    setPlayerSequence(newPlayerSequence);

    // Check if the player's sequence matches the current position in the target sequence
    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      setGameState('gameOver');
      return;
    }

    // If the player has completed the sequence correctly
    if (newPlayerSequence.length === sequence.length) {
      const newScore = score + (level * 10);
      const starsEarned = Math.floor(level / 2) + 1;
      
      setScore(newScore);
      setLevel(level + 1);
      
      // Add rewards
      addXP(20 + (level * 5));
      addStars(starsEarned);
      
      // Update game progress
      if (user) {
        const currentProgress = user.profile.gameProgress['memory-sequence'] || { level: 1, stars: 0, bestScore: 0, timesPlayed: 0 };
        updateGameProgress('memory-sequence', {
          level: Math.max(currentProgress.level, level),
          stars: currentProgress.stars + starsEarned,
          bestScore: Math.max(currentProgress.bestScore, newScore),
          timesPlayed: currentProgress.timesPlayed + 1
        });
      }

      if (level >= 5) {
        setGameState('success');
      } else {
        setTimeout(() => {
          generateSequence();
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setIsShowingSequence(false);
    setGameState('ready');
    setScore(0);
    setLevel(1);
    setActiveButton(null);
  };

  return (
    <div className="text-center space-y-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Memory Galaxy</h3>
        <p className="text-slate-600">Watch the sequence, then repeat it back!</p>
      </div>

      {/* Game Stats */}
      <div className="flex justify-center gap-8 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{score}</div>
          <div className="text-sm text-slate-500">Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{level}</div>
          <div className="text-sm text-slate-500">Level</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{sequence.length}</div>
          <div className="text-sm text-slate-500">Sequence</div>
        </div>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
        {colors.map((color, index) => (
          <button
            key={index}
            onClick={() => handleButtonClick(index)}
            disabled={isShowingSequence || gameState !== 'playing'}
            className={`w-24 h-24 rounded-xl transition-all duration-200 ${color} ${
              activeButton === index ? 'scale-110 brightness-125' : ''
            } ${
              isShowingSequence || gameState !== 'playing' 
                ? 'opacity-70 cursor-not-allowed' 
                : 'hover:scale-105 active:scale-95'
            }`}
          />
        ))}
      </div>

      {/* Game Status */}
      {gameState === 'ready' && (
        <div className="space-y-4">
          <p className="text-lg text-slate-700">
            Ready to test your memory? Watch the sequence and repeat it!
          </p>
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold px-8 py-4 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            Start Game
          </button>
        </div>
      )}

      {isShowingSequence && (
        <div className="space-y-2">
          <div className="text-lg font-semibold text-blue-600">Watch carefully!</div>
          <div className="text-sm text-slate-500">Level {level} - {sequence.length} colors</div>
        </div>
      )}

      {gameState === 'playing' && !isShowingSequence && (
        <div className="space-y-2">
          <div className="text-lg font-semibold text-green-600">Your turn!</div>
          <div className="text-sm text-slate-500">
            Progress: {playerSequence.length} / {sequence.length}
          </div>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="space-y-4">
          <div className="text-2xl font-bold text-red-600">Game Over!</div>
          <div className="text-lg text-slate-700">
            You reached level {level} with a score of {score}!
          </div>
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
            <div className="text-3xl font-bold text-green-600">Amazing!</div>
            <div className="text-lg text-slate-700">
              You completed 5 levels! Final score: {score}
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

export default MemorySequenceGame;