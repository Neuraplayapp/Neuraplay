import React, { useState, useEffect } from 'react';
import { Star, RotateCcw, Trophy, Shuffle } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

interface PatternMatchingGameProps {
  onClose: () => void;
}

const PatternMatchingGame: React.FC<PatternMatchingGameProps> = ({ onClose }) => {
  const { user, addXP, addStars, updateGameProgress } = useUser();
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameOver' | 'success'>('ready');
  const [currentPattern, setCurrentPattern] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const shapes = ['🔴', '🟦', '🟢', '🟡', '🟣', '🟤'];
  const patternTypes = ['sequence', 'missing', 'matching'];

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

  const generatePattern = () => {
    const patternType = patternTypes[Math.floor(Math.random() * patternTypes.length)];
    const patternLength = Math.min(level + 2, 6);
    
    if (patternType === 'sequence') {
      // Generate a repeating pattern
      const basePattern = shapes.slice(0, Math.min(level + 1, 3));
      const pattern = [];
      for (let i = 0; i < patternLength; i++) {
        pattern.push(basePattern[i % basePattern.length]);
      }
      
      setCurrentPattern(pattern);
      
      // Create options including the correct next item
      const correctAnswer = basePattern[patternLength % basePattern.length];
      const wrongAnswers = shapes.filter(s => s !== correctAnswer).slice(0, 3);
      const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      setOptions(allOptions);
      
    } else if (patternType === 'missing') {
      // Generate pattern with missing element
      const basePattern = shapes.slice(0, Math.min(level + 1, 3));
      const fullPattern = [];
      for (let i = 0; i < patternLength; i++) {
        fullPattern.push(basePattern[i % basePattern.length]);
      }
      
      const missingIndex = Math.floor(Math.random() * fullPattern.length);
      const correctAnswer = fullPattern[missingIndex];
      fullPattern[missingIndex] = '❓';
      
      setCurrentPattern(fullPattern);
      
      const wrongAnswers = shapes.filter(s => s !== correctAnswer).slice(0, 3);
      const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      setOptions(allOptions);
      
    } else {
      // Matching pairs
      const selectedShapes = shapes.slice(0, Math.min(level + 1, 4));
      const pairs = [...selectedShapes, ...selectedShapes];
      const shuffled = pairs.sort(() => Math.random() - 0.5);
      
      setCurrentPattern(shuffled.slice(0, 6));
      setOptions(selectedShapes);
    }
    
    setSelectedAnswers([]);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setMistakes(0);
    setLevel(1);
    setTimeLeft(60);
    generatePattern();
  };

  const handleOptionClick = (option: string) => {
    if (gameState !== 'playing') return;
    
    const newSelected = [...selectedAnswers, option];
    setSelectedAnswers(newSelected);
    
    // Check if answer is correct (simplified logic)
    const isCorrect = currentPattern.includes('❓') ? 
      currentPattern.find(item => item === '❓') !== undefined :
      true; // Simplified for demo
    
    if (isCorrect) {
      const points = level * 10;
      setScore(score + points);
      
      if (score + points >= level * 50) {
        setLevel(level + 1);
      }
      
      setTimeout(() => {
        generatePattern();
      }, 1000);
      
    } else {
      setMistakes(mistakes + 1);
      if (mistakes >= 2) {
        endGame();
        return;
      }
    }
  };

  const endGame = () => {
    setGameState(score >= 150 ? 'success' : 'gameOver');
    
    if (score >= 150) {
      const starsEarned = Math.floor(score / 30);
      addXP(25 + (level * 8));
      addStars(starsEarned);
      
      if (user) {
        const currentProgress = user.profile.gameProgress['pattern-matching'] || { level: 1, stars: 0, bestScore: 0, timesPlayed: 0 };
        updateGameProgress('pattern-matching', {
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
    setTimeLeft(60);
    setCurrentPattern([]);
    setOptions([]);
    setSelectedAnswers([]);
  };

  return (
    <div className="text-center space-y-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Pattern Detective</h3>
        <p className="text-slate-600">Find the pattern and complete the sequence!</p>
      </div>

      {/* Game Stats */}
      <div className="flex justify-center gap-8 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{score}</div>
          <div className="text-sm text-slate-500">Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{level}</div>
          <div className="text-sm text-slate-500">Level</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{mistakes}/3</div>
          <div className="text-sm text-slate-500">Mistakes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{timeLeft}s</div>
          <div className="text-sm text-slate-500">Time</div>
        </div>
      </div>

      {/* Pattern Display */}
      {gameState === 'playing' && (
        <div className="bg-slate-100 rounded-2xl p-8 mb-6">
          <div className="text-lg font-semibold text-slate-700 mb-4">
            What comes next in this pattern?
          </div>
          <div className="flex justify-center gap-4 mb-6">
            {currentPattern.map((item, index) => (
              <div
                key={index}
                className="w-16 h-16 bg-white rounded-lg shadow-md flex items-center justify-center text-3xl border-2 border-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
          
          <div className="flex justify-center gap-4">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className="w-16 h-16 bg-white rounded-lg shadow-md flex items-center justify-center text-3xl border-2 border-purple-200 hover:border-purple-400 transition-all transform hover:scale-105"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Game Status */}
      {gameState === 'ready' && (
        <div className="space-y-4">
          <p className="text-lg text-slate-700">
            Exercise your pattern recognition skills! Find the missing pieces and complete sequences.
          </p>
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-8 py-4 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <Shuffle className="w-5 h-5" />
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
            Great job working on pattern recognition! Keep practicing to improve your cognitive flexibility.
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
            <div className="text-3xl font-bold text-green-600">Pattern Master!</div>
            <div className="text-lg text-slate-700">
              You're amazing at finding patterns! Final score: {score}
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

export default PatternMatchingGame;