import React, { useState } from 'react';
import { Sparkles, Image, Volume2, Loader2, Play, Pause, RotateCcw, Star, Trophy } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface AIGameProps {
  onClose: () => void;
}

const AIGame: React.FC<AIGameProps> = ({ onClose }) => {
  const { user, addXP, addStars, updateGameProgress } = useUser();
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameState, setGameState] = useState<'ready' | 'creating' | 'complete'>('ready');
  const [storiesCreated, setStoriesCreated] = useState(0);

  const callAPI = async (taskType: string, inputData: string) => {
    const response = await fetch('/.netlify/functions/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_type: taskType,
        input_data: inputData
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  };

  const generateStory = async () => {
    if (!prompt.trim()) {
      setError('Please enter a story idea!');
      return;
    }

    setLoading(true);
    setError('');
    setStory('');
    setImageUrl('');
    setGameState('creating');

    try {
      // Step 1: Generate story using summarization model (creative prompt)
      setCurrentStep('Creating your magical story...');
      
      const storyPrompt = `Create a short, engaging children's story about: "${prompt}". 

Make it educational and fun for ages 3-12. Include:
- A clear beginning, middle, and end
- A positive message or lesson
- Age-appropriate vocabulary
- Engaging characters
- A satisfying conclusion

Story about ${prompt}:

Once upon a time, there was a wonderful adventure involving ${prompt}. The story teaches us important lessons about friendship, courage, and discovery. Here's how it unfolds:

Beginning: Our hero discovers something amazing about ${prompt} and decides to explore further.

Middle: Through exciting challenges and with the help of friends, our hero learns valuable lessons about ${prompt}.

End: The adventure concludes with everyone learning something new and feeling proud of their accomplishments.

This story about ${prompt} shows us that with curiosity and kindness, we can overcome any challenge and make wonderful discoveries.`;
      
      const textResponse = await callAPI('summarization', storyPrompt);
      
      let generatedStory = '';
      if (textResponse[0] && textResponse[0].summary_text) {
        generatedStory = textResponse[0].summary_text;
      } else if (typeof textResponse === 'string') {
        generatedStory = textResponse;
      } else {
        generatedStory = `Once upon a time, there was an amazing adventure about ${prompt}. Our brave hero discovered that with curiosity and kindness, anything is possible. They learned valuable lessons about friendship and courage, and everyone lived happily ever after!`;
      }
      
      setStory(generatedStory);

      // Step 2: Generate illustration
      setCurrentStep('Drawing a beautiful picture...');
      
      try {
        const imagePrompt = `A colorful, child-friendly cartoon illustration of: ${prompt}. Bright colors, happy characters, suitable for children's storybook. Cartoon style, whimsical, educational, safe for kids.`;
        
        const imageResponse = await callAPI('image', imagePrompt);
        if (imageResponse.data) {
          const imageBlob = `data:${imageResponse.contentType};base64,${imageResponse.data}`;
          setImageUrl(imageBlob);
        }
      } catch (imageError) {
        console.warn('Image generation failed:', imageError);
        // Continue without image - not critical for the game
      }

      // Success! Award points and update progress
      const newStoriesCreated = storiesCreated + 1;
      setStoriesCreated(newStoriesCreated);
      
      if (user) {
        const xpEarned = 25;
        const starsEarned = 1;
        
        addXP(xpEarned);
        addStars(starsEarned);
        
        const currentProgress = user.profile.gameProgress['ai-story-creator'] || { 
          level: 1, 
          stars: 0, 
          bestScore: 0, 
          timesPlayed: 0 
        };
        
        updateGameProgress('ai-story-creator', {
          level: Math.max(currentProgress.level, Math.floor(newStoriesCreated / 3) + 1),
          stars: currentProgress.stars + starsEarned,
          bestScore: Math.max(currentProgress.bestScore, newStoriesCreated),
          timesPlayed: currentProgress.timesPlayed + 1
        });
      }

      setGameState('complete');
      setCurrentStep('');
      
    } catch (error) {
      console.error('Error generating story:', error);
      setError(error instanceof Error ? error.message : 'Something went wrong! Please try again.');
      setGameState('ready');
    } finally {
      setLoading(false);
      setCurrentStep('');
    }
  };

  const resetGame = () => {
    setPrompt('');
    setStory('');
    setImageUrl('');
    setError('');
    setGameState('ready');
    setCurrentStep('');
    setLoading(false);
    setIsPlaying(false);
  };

  const playStory = () => {
    if (!story) return;
    
    // Simple text-to-speech using browser API
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(story);
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Story Creator
          </h1>
          <Sparkles className="w-8 h-8 text-pink-600" />
        </div>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Tell me what you'd like a story about, and I'll create a magical tale just for you!
        </p>
        
        {/* Game Stats */}
        {user && (
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{storiesCreated}</div>
              <div className="text-sm text-slate-500">Stories Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{user.profile.gameProgress['ai-story-creator']?.stars || 0}</div>
              <div className="text-sm text-slate-500">Stars Earned</div>
            </div>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What would you like a story about? (e.g., a brave dragon, magical forest, space adventure...)"
            className="flex-1 px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-lg"
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && !loading && generateStory()}
          />
          <button
            onClick={generateStory}
            disabled={loading || !prompt.trim()}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center gap-2 min-w-[140px] justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Create Story
              </>
            )}
          </button>
        </div>
        
        {currentStep && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 font-semibold">
              <Loader2 className="w-4 h-4 animate-spin" />
              {currentStep}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700">
            <strong>Oops!</strong> {error}
          </div>
        )}
      </div>

      {/* Story Results */}
      {story && (
        <div className="space-y-6">
          {/* Story Text */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-slate-800">Your Magical Story</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={playStory}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Listen
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-slate-700 leading-relaxed text-lg font-medium">
                {story}
              </p>
            </div>
          </div>

          {/* Image */}
          {imageUrl && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border">
              <div className="flex items-center gap-2 mb-4">
                <Image className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-slate-800">Story Illustration</h2>
              </div>
              <div className="flex justify-center">
                <img
                  src={imageUrl}
                  alt="Story illustration"
                  className="max-w-full h-auto rounded-xl shadow-lg border-4 border-purple-100"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            </div>
          )}

          {/* Success Message & Actions */}
          {gameState === 'complete' && (
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200">
              <div className="text-center">
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-green-600 mb-2">Story Complete!</h3>
                <p className="text-slate-700 mb-4">
                  Amazing work! You've created story #{storiesCreated}
                </p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-bold text-yellow-500">+1 Star Earned!</span>
                  <span className="text-slate-500">+25 XP</span>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={resetGame}
                    className="bg-purple-600 text-white font-bold px-6 py-3 rounded-full hover:bg-purple-700 transition-all flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Create Another Story
                  </button>
                  <button
                    onClick={onClose}
                    className="bg-slate-500 text-white font-bold px-6 py-3 rounded-full hover:bg-slate-600 transition-all"
                  >
                    Close Game
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Example Prompts */}
      {!story && !loading && gameState === 'ready' && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Story Ideas to Get You Started:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "A friendly dragon who loves to bake cookies",
              "A magical forest where animals can talk",
              "A space adventure to find rainbow stars",
              "A brave little mouse who saves the day",
              "An underwater kingdom with singing fish",
              "A wizard's apprentice learning magic spells",
              "A robot who learns about friendship",
              "A princess who builds amazing inventions"
            ].map((idea, index) => (
              <button
                key={index}
                onClick={() => setPrompt(idea)}
                className="text-left p-3 rounded-lg border-2 border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-slate-700 hover:text-purple-700"
              >
                {idea}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIGame;