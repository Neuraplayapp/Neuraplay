import React, { useState, useEffect } from 'react';
import { Star, RotateCcw, Trophy, Search } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

interface LetterHuntGameProps {
  onClose: () => void;
}

const LetterHuntGame: React.FC<LetterHuntGameProps> = ({ onClose }) => {
  const { user, addXP, addStars, updateGameProgress } = useUser();
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameOver' | 'success'>('ready');
  const [targetLetter, setTargetLetter] = useState('A');
  const [gridLetters, setGridLetters] = useState<string[]>([]);
  const [foundLetters, setFoundLetters] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targetCount, setTargetCount] = useState(3);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

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

  const generateLetterGrid = () => {
    const gridSize = Math.min(level + 15, 25); // 4x4 to 5x5 grid
    const target = alphabet[Math.floor(Math.random() * (Math.min(level + 5, 26)))];
    const count = Math.min(level + 2, 6);
    
    setTargetLetter(target);
    setTargetCount(count);
    setFoundLetters([]);
    
    const grid = [];
    const targetPositions = [];
    
    // Place target letters
    for (let i = 0; i < count; i++) {
      let position;
      do {
        position = Math.floor(Math.random() * gridSize);
      } while (targetPositions.includes(position));
      
      targetPositions.push(position);
      grid[position] = target;
    }
    
    // Fill remaining positions with random letters
    for (let i = 0; i < gridSize; i++) {
      if (!grid[i]) {
        let randomLetter;
        do {
          randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
        } while (randomLetter === target);
        grid[i] = randomLetter;
      }
    }
    
    setGridLetters(grid);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setMistakes(0);
    setLevel(1);
    setTimeLeft(30);
    generateLetterGrid();
  };

  const handleLetterClick = (index: number) => {
    if (gameState !== 'playing' || foundLetters.includes(index)) return;
    
    const clickedLetter = gridLetters[index];
    
    if (clickedLetter === targetLetter) {
      // Correct letter found
      const newFoundLetters = [...foundLetters, index];
      setFoundLetters(newFoundLetters);
      
      if (newFoundLetters.length === targetCount) {
        // All letters found!
        const points = level * 15;
        setScore(score + points);
        
        if (score + points >= level * 60) {
          setLevel(level + 1);
        }
        
        setTimeout(() => {
          generateLetterGrid();
        }, 1500);
      }
      
    } else {
      // Wrong letter
      setMistakes(mistakes + 1);
      if (mistakes >= 2) {
        endGame();
        return;
      }
    }
  };

  const endGame = () => {
    setGameState(score >= 120 ? 'success' : 'gameOver');
    
    if (score >= 120) {
      const starsEarned = Math.floor(score / 30);
      addXP(25 + (level * 5));
      addStars(starsEarned);
      
      if (user) {
        const currentProgress = user.profile.gameProgress['letter-hunt'] || { level: 1, stars: 0, bestScore: 0, timesPlayed: 0 };
        updateGameProgress('letter-hunt', {
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
    setGridLetters([]);
    setFoundLetters([]);
    setTargetLetter('A');
    setTargetCount(3);
  };

  const getGridCols = () => {
    const size = gridLetters.length;
    if (size <= 16) return 'grid-cols-4';
    if (size <= 25) return 'grid-cols-5';
    return 'grid-cols-6';
  };

  return (
    <div className="text-center space-y-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Letter Safari</h3>
        <p className="text-slate-600">Find all the hidden letters in the grid!</p>
      </div>

      {/* Game Stats */}
      <div className="flex justify-center gap-8 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-pink-600">{score}</div>
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

      {/* Target Letter Display */}
      {gameState === 'playing' && (
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 mb-6">
          <div className="text-lg font-semibold text-slate-700 mb-4">
            Find all the letter <span className="text-3xl font-bold text-pink-600">"{targetLetter}"</span>
          </div>
          <div className="text-sm text-slate-600 mb-4">
            Found: {foundLetters.length} / {targetCount}
          </div>
          
          <div className={`grid ${getGridCols()} gap-2 max-w-md mx-auto`}>
            {gridLetters.map((letter, index) => (
              <button
                key={index}
                onClick={() => handleLetterClick(index)}
                className={`w-12 h-12 rounded-lg font-bold text-lg transition-all transform hover:scale-105 ${
                  foundLetters.includes(index)
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-white text-slate-700 border-2 border-pink-200 hover:border-pink-400 shadow-md'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Game Status */}
      {gameState === 'ready' && (
        <div className="space-y-4">
          <p className="text-lg text-slate-700">
            Let's go on a letter safari! Find all the matching letters in the grid.
          </p>
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold px-8 py-4 rounded-full hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <Search className="w-5 h-5" />
            Start Safari
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
            Great job hunting for letters! Keep practicing to improve your letter recognition.
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
            <div className="text-3xl font-bold text-green-600">Letter Explorer!</div>
            <div className="text-lg text-slate-700">
              You're amazing at finding letters! Final score: {score}
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

export default LetterHuntGame;