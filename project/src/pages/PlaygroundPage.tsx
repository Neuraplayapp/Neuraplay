import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';
import { Star, Trophy, Target, Brain, Gamepad2, Sparkles, FileText, Volume2 } from 'lucide-react';
import GameModal from '../components/GameModal';
import MemorySequenceGame from '../components/games/MemorySequenceGame';
import InhibitionGame from '../components/games/InhibitionGame';
import PatternMatchingGame from '../components/games/PatternMatchingGame';
import CountingAdventureGame from '../components/games/CountingAdventureGame';
import LetterHuntGame from '../components/games/LetterHuntGame';
import AIGame from '../components/AIGame';
import AIAssistant from '../components/AIAssistant';

const PlaygroundPage: React.FC = () => {
  const { user } = useUser();
  const [activeView, setActiveView] = useState('modules');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  if (!user || user.role !== 'learner') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center p-6">
        <div className="text-center max-w-2xl">
          <Brain className="w-20 h-20 text-violet-600 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Welcome, Explorer!</h2>
          <p className="text-xl text-slate-600 mb-8">
            Please register as a learner to access our amazing neuropsychological games and activities.
          </p>
          <Link 
            to="/registration" 
            className="bg-violet-600 text-white font-bold px-8 py-4 rounded-full hover:bg-violet-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Join the Adventure!
          </Link>
        </div>
      </div>
    );
  }

  const games = [
    {
      id: 'memory-sequence',
      title: 'Memory Galaxy',
      description: 'Test your working memory with colorful sequences!',
      icon: <Star className="w-8 h-8" />,
      color: 'from-blue-400 to-blue-600',
      difficulty: 'Easy',
      skills: ['Working Memory', 'Attention'],
      component: MemorySequenceGame
    },
    {
      id: 'inhibition',
      title: 'Stop & Go Adventure',
      description: 'Practice impulse control with fun challenges!',
      icon: <Target className="w-8 h-8" />,
      color: 'from-green-400 to-green-600',
      difficulty: 'Medium',
      skills: ['Inhibitory Control', 'Focus'],
      component: InhibitionGame
    },
    {
      id: 'pattern-matching',
      title: 'Pattern Detective',
      description: 'Solve puzzles and find hidden patterns!',
      icon: <Brain className="w-8 h-8" />,
      color: 'from-purple-400 to-purple-600',
      difficulty: 'Medium',
      skills: ['Cognitive Flexibility', 'Pattern Recognition'],
      component: PatternMatchingGame
    },
    {
      id: 'counting-adventure',
      title: 'Number Quest',
      description: 'Embark on counting adventures!',
      icon: <Trophy className="w-8 h-8" />,
      color: 'from-orange-400 to-orange-600',
      difficulty: 'Easy',
      skills: ['Numerical Skills', 'Problem Solving'],
      component: CountingAdventureGame
    },
    {
      id: 'letter-hunt',
      title: 'Letter Safari',
      description: 'Hunt for letters in exciting environments!',
      icon: <Gamepad2 className="w-8 h-8" />,
      color: 'from-pink-400 to-pink-600',
      difficulty: 'Easy',
      skills: ['Letter Recognition', 'Visual Processing'],
      component: LetterHuntGame
    },
    {
      id: 'ai-story-creator',
      title: 'AI Story Creator',
      description: 'Create magical stories with AI-generated text, images, and voice!',
      icon: <Sparkles className="w-8 h-8" />,
      color: 'from-purple-400 to-pink-600',
      difficulty: 'Easy',
      skills: ['Creativity', 'Language', 'Imagination'],
      component: AIGame
    }
  ];

  const playDescription = async (description: string, gameId: string) => {
    if (playingAudio === gameId) {
      // Stop current audio
      const audio = document.getElementById(`audio-${gameId}`) as HTMLAudioElement;
      if (audio) {
        audio.pause();
        audio.remove();
      }
      setPlayingAudio(null);
      return;
    }

    try {
      setPlayingAudio(gameId);
      const response = await fetch('/.netlify/functions/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_type: 'voice',
          input_data: description
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const result = await response.json();
      
      if (result.data) {
        const audioBlob = `data:${result.contentType};base64,${result.data}`;
        const audio = new Audio(audioBlob);
        audio.id = `audio-${gameId}`;
        audio.onended = () => setPlayingAudio(null);
        audio.play();
      }
    } catch (error) {
      console.error('Error playing description:', error);
      setPlayingAudio(null);
    }
  };

  const getAgeBracket = () => {
    if (!user.age) return '3-5';
    if (user.age >= 6 && user.age <= 8) return '6-8';
    if (user.age >= 9 && user.age <= 12) return '9-12';
    return '3-5';
  };

  const renderDashboard = () => {
    const { rank, xp, xpToNextLevel, stars } = user.profile;
    const progressPercent = (xp / xpToNextLevel) * 100;
    
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg border text-center">
        <img 
          src={user.profile.avatar} 
          alt={user.username}
          className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-violet-200 shadow-lg"
        />
        <h3 className="font-bold text-2xl text-slate-900 mb-2">{user.username}</h3>
        <div className="flex items-center justify-center gap-2 mb-4">
          <p className="text-violet-600 font-semibold">{rank}</p>
          <div className="flex gap-1">
            {[...Array(Math.min(stars, 5))].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
            ))}
          </div>
        </div>
        <div className="mb-4">
          <div className="bg-slate-300 w-full h-3 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-violet-500 to-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-slate-500 mt-2">{xp} / {xpToNextLevel} XP</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-yellow-500 mb-1">{stars}</p>
          <p className="text-sm text-slate-500">Total Stars</p>
        </div>
      </div>
    );
  };

  const renderModules = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Hey {user.username}! 🎮
        </h1>
        <p className="text-xl text-slate-600 mb-2">
          Since you're age {getAgeBracket()}, here are the perfect games for you:
        </p>
        <p className="text-lg text-violet-600 font-semibold">
          Let's start a new adventure and earn some stars!
        </p>
        
        {/* AI Report Button */}
        <div className="mt-6">
          <Link 
            to="/ai-report"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-6 py-3 rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <FileText className="w-5 h-5" />
            View AI Learning Report
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => {
          const gameProgress = user.profile.gameProgress[game.id] || { level: 1, stars: 0, bestScore: 0, timesPlayed: 0 };
          
          return (
            <div 
              key={game.id} 
              className="bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              onClick={() => setSelectedGame(game.id)}
            >
              <div className={`h-32 bg-gradient-to-br ${game.color} flex items-center justify-center text-white`}>
                {game.icon}
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-slate-900 mb-2">{game.title}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-slate-600 text-sm flex-1">{game.description}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playDescription(game.description, game.id);
                    }}
                    className={`p-2 rounded-full transition-all ${
                      playingAudio === game.id 
                        ? 'bg-green-500 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Listen to description"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">DIFFICULTY</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      game.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      game.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {game.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">LEVEL</span>
                    <span className="text-sm font-bold text-violet-600">{gameProgress.level}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">STARS</span>
                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(gameProgress.stars, 5))].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                      <span className="text-sm font-bold text-yellow-500 ml-1">{gameProgress.stars}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-slate-500 mb-2">SKILLS DEVELOPED:</p>
                    <div className="flex flex-wrap gap-1">
                      {game.skills.map((skill, idx) => (
                        <span key={idx} className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-slate-900 mb-6">My Achievements</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(user.profile.gameProgress).map(([gameId, progress]) => {
          const game = games.find(g => g.id === gameId);
          if (!game) return null;
          
          return (
            <div key={gameId} className="bg-white p-6 rounded-2xl shadow-lg border">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${game.color} flex items-center justify-center text-white mb-4`}>
                {game.icon}
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">{game.title}</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Level Reached:</span>
                  <span className="font-bold text-violet-600">{progress.level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Stars Earned:</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-bold text-yellow-500">{progress.stars}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Best Score:</span>
                  <span className="font-bold text-green-600">{progress.bestScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Times Played:</span>
                  <span className="font-bold text-blue-600">{progress.timesPlayed}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {Object.keys(user.profile.gameProgress).length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">
            No achievements yet! Play some games to start earning stars and leveling up!
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 pt-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-80">
            <div className="sticky top-24 space-y-6">
              {renderDashboard()}
              
              <nav className="bg-white rounded-2xl shadow-lg border p-6">
                <h3 className="font-bold text-lg text-slate-900 mb-4">Navigation</h3>
                <div className="space-y-2">
                  {[
                    { id: 'modules', label: 'Learning Games', icon: <Gamepad2 className="w-5 h-5" /> },
                    { id: 'achievements', label: 'My Achievements', icon: <Trophy className="w-5 h-5" /> }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg font-semibold transition-all ${
                        activeView === item.id 
                          ? 'bg-violet-600 text-white shadow-lg' 
                          : 'text-slate-600 hover:bg-violet-50'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeView === 'modules' && renderModules()}
            {activeView === 'achievements' && renderAchievements()}
          </main>
        </div>
        
        {/* AI Assistant */}
        <AIAssistant />
      </div>

      {/* Game Modal */}
      {selectedGame && (
        <GameModal
          isOpen={!!selectedGame}
          onClose={() => setSelectedGame(null)}
          game={games.find(g => g.id === selectedGame)!}
        />
      )}
    </div>
  );
};

export default PlaygroundPage;