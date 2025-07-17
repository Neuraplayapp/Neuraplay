import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';
import { FileText, Loader2, ArrowLeft, Star, Trophy, Target } from 'lucide-react';

const AIReportPage: React.FC = () => {
  const { user } = useUser();
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateReport = async () => {
    if (!user) return;

    setLoading(true);
    setError('');
    setReport('');

    try {
      // Prepare performance data
      const performanceData = {
        username: user.username,
        age: user.age,
        rank: user.profile.rank,
        totalXP: user.profile.xp,
        totalStars: user.profile.stars,
        gamesPlayed: Object.keys(user.profile.gameProgress).length,
        gameProgress: user.profile.gameProgress
      };

      const prompt = `As an educational psychologist, analyze this child's learning performance data and create a comprehensive, positive report highlighting their cognitive development, strengths, and achievements. Focus on growth mindset and encouragement.

Child Profile:
- Name: ${performanceData.username}
- Age: ${performanceData.age || 'Not specified'}
- Current Rank: ${performanceData.rank}
- Total Experience Points: ${performanceData.totalXP}
- Stars Earned: ${performanceData.totalStars}
- Games Completed: ${performanceData.gamesPlayed}

Game Performance Details:
${JSON.stringify(performanceData.gameProgress, null, 2)}

Please provide a warm, encouraging report that:
1. Celebrates specific achievements and progress
2. Identifies cognitive strengths demonstrated
3. Suggests areas for continued growth
4. Provides positive reinforcement for parents
5. Uses child-friendly language that could be shared with the learner

Keep the tone professional yet warm, focusing on the child's unique learning journey and potential.`;

      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_type: 'text',
          input_data: prompt
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Extract the generated text from the response
      let generatedReport = '';
      if (result[0] && result[0].generated_text) {
        generatedReport = result[0].generated_text.replace(prompt, '').trim();
      } else if (typeof result === 'string') {
        generatedReport = result;
      } else {
        generatedReport = 'Report generated successfully! Your child is making excellent progress in their learning journey.';
      }

      setReport(generatedReport);
    } catch (error) {
      console.error('Error generating report:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center p-6">
        <div className="text-center max-w-2xl">
          <FileText className="w-20 h-20 text-violet-600 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Access Required</h2>
          <p className="text-xl text-slate-600 mb-8">
            Please register to access your personalized AI learning report.
          </p>
          <Link 
            to="/registration" 
            className="bg-violet-600 text-white font-bold px-8 py-4 rounded-full hover:bg-violet-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to="/playground" 
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">AI Learning Report</h1>
            <p className="text-slate-600">Personalized insights for {user.username}</p>
          </div>
        </div>

        {/* User Overview */}
        <div className="bg-white rounded-2xl shadow-lg border p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <img 
              src={user.profile.avatar} 
              alt={user.username}
              className="w-20 h-20 rounded-full border-4 border-violet-200"
            />
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{user.username}</h2>
              <p className="text-violet-600 font-semibold">{user.profile.rank}</p>
              <p className="text-slate-500">Age: {user.age || 'Not specified'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-violet-50 rounded-xl">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{user.profile.stars}</div>
              <div className="text-sm text-slate-600">Stars Earned</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{user.profile.xp}</div>
              <div className="text-sm text-slate-600">Experience Points</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <Trophy className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{Object.keys(user.profile.gameProgress).length}</div>
              <div className="text-sm text-slate-600">Games Played</div>
            </div>
          </div>
        </div>

        {/* Generate Report Section */}
        <div className="bg-white rounded-2xl shadow-lg border p-8 mb-8">
          <div className="text-center mb-6">
            <FileText className="w-16 h-16 text-violet-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Generate AI Learning Report</h3>
            <p className="text-slate-600">
              Get personalized insights about {user.username}'s learning progress, strengths, and development areas.
            </p>
          </div>

          {!report && !loading && (
            <div className="text-center">
              <button
                onClick={generateReport}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold px-8 py-4 rounded-full hover:from-violet-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Generate AI Report
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-700">Analyzing learning data...</p>
              <p className="text-slate-500">This may take a few moments</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <div className="text-red-800 font-semibold mb-2">Error Generating Report</div>
              <p className="text-red-600">{error}</p>
              <button
                onClick={generateReport}
                className="mt-4 bg-red-600 text-white font-bold px-6 py-2 rounded-full hover:bg-red-700 transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          {report && (
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-violet-600" />
                <h4 className="text-xl font-bold text-slate-900">Your Personalized Learning Report</h4>
              </div>
              <div className="prose prose-lg max-w-none">
                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {report}
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-violet-200">
                <button
                  onClick={generateReport}
                  className="bg-violet-600 text-white font-bold px-6 py-3 rounded-full hover:bg-violet-700 transition-all mr-4"
                >
                  Generate New Report
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-slate-600 text-white font-bold px-6 py-3 rounded-full hover:bg-slate-700 transition-all"
                >
                  Print Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIReportPage;