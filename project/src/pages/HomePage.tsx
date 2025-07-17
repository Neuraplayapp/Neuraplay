import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, Users, Target, Bot, Send, Loader2, MessageCircle } from 'lucide-react';

const HomePage: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const features = [
    {
      id: 0,
      title: "Neuro-psychological teaching methods",
      description: "Every game, story, and challenge is built upon proven neuropsychological principles like CBT, IPT, and Family Therapy, adapted by experts to be engaging and effective for young minds.",
      icon: <Brain className="w-8 h-8 text-violet-600" />
    },
    {
      id: 1,
      title: "Tailor-made for the learner",
      description: "Our Synaptic AI™ analyzes your child's unique learning style and emotional responses to create a truly bespoke educational journey, ensuring they are always perfectly challenged and supported.",
      icon: <Target className="w-8 h-8 text-violet-600" />
    },
    {
      id: 2,
      title: "The Montessori approach",
      description: "We embrace the Montessori philosophy of self-directed discovery. Our app provides the tools and the prepared environment; your child leads the way, fostering independence and a true love of learning.",
      icon: <Sparkles className="w-8 h-8 text-violet-600" />
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAIDemo = async () => {
    if (!aiInput.trim() || aiLoading) return;

    setAiLoading(true);
    setAiError('');
    setAiResponse('');

    try {
      const prompt = `You are a friendly, knowledgeable AI assistant for Neuraplay, an educational platform for children ages 3-12. You help parents and educators understand child development, learning strategies, and educational psychology.

User question: "${aiInput}"

Please provide a helpful, encouraging response that:
- Is warm and supportive
- Uses educational psychology principles
- Offers practical advice when appropriate
- Keeps responses concise but informative (2-3 sentences max)
- Focuses on positive child development

Response:`;

      const response = await fetch('/api/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_type: 'summarization',
          input_data: aiInput
        })
      });

      // Read the response body as text ONCE.
      const responseBody = await response.text();

      // Now, check if the response was successful.
      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        // Try to parse the text as JSON to get a more specific error.
        try {
          const errorJson = JSON.parse(responseBody);
          if (errorJson.error) {
            errorMessage = errorJson.error;
          }
        } catch (e) {
          // If it's not JSON, use the raw text as the error.
          errorMessage = responseBody || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // If the response was successful, parse the text to get the result.
      const result = JSON.parse(responseBody);

      let generatedResponse = '';
      if (result[0] && result[0].summary_text) {
        generatedResponse = result[0].summary_text;
      } else if (typeof result === 'string') {
        generatedResponse = result;
      } else {
        generatedResponse = "I'm here to help! Could you please provide some text to summarize?";
      }

      setAiResponse(generatedResponse);
    } catch (error) {
      console.error('Error with AI demo:', error);
      setAiError(error instanceof Error ? error.message : 'An unknown error occurred. Please try again!');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center text-center p-6 bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-tight tracking-tighter mb-8 animate-fade-in">
            Your Child is a
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600"> Genius</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-slate-600 mb-12 animate-fade-in-delay">
            Unlock the potential with scientifically-backed neuropsychological games designed for ages 3-12.
          </p>

          {/* AI Demo Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-12 max-w-2xl mx-auto shadow-2xl border border-white/50">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Bot className="w-8 h-8 text-violet-600" />
              <h2 className="text-2xl font-bold text-slate-900">Try Our AI Assistant</h2>
            </div>
            <p className="text-slate-600 mb-6">Ask me anything about child development, learning strategies, or education!</p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="e.g., How can I help my 5-year-old with focus?"
                  className="flex-1 px-4 py-3 rounded-full border-2 border-violet-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  disabled={aiLoading}
                  onKeyPress={(e) => e.key === 'Enter' && !aiLoading && handleAIDemo()}
                />
                <button
                  onClick={handleAIDemo}
                  disabled={!aiInput.trim() || aiLoading}
                  className="bg-violet-600 text-white px-6 py-3 rounded-full hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Ask
                    </>
                  )}
                </button>
              </div>

              {aiError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                  {aiError}
                </div>
              )}

              {aiResponse && (
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <Bot className="w-6 h-6 text-violet-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-slate-700 leading-relaxed">{aiResponse}</p>
                      <div className="mt-4 pt-4 border-t border-violet-200">
                        <p className="text-sm text-violet-600 font-semibold mb-2">Want more personalized insights?</p>
                        <Link
                          to="/registration"
                          className="inline-block bg-violet-600 text-white font-bold px-4 py-2 rounded-full hover:bg-violet-700 transition-all text-sm"
                        >
                          Sign Up for Full Access
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-2">
            <Link
              to="/registration"
              className="bg-violet-600 text-white font-bold px-10 py-4 rounded-full hover:bg-violet-700 transition-all duration-300 transform hover:scale-105 shadow-2xl text-lg"
            >
              Start the transformation
            </Link>
            <Link
              to="/playground"
              className="bg-white text-violet-600 font-bold px-10 py-4 rounded-full hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg border-2 border-violet-200"
            >
              Try the games
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="bg-white py-24 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6">
            An investment in their future is priceless
          </h2>
          <p className="text-xl max-w-3xl mx-auto text-slate-500">
            For less than the cost of a single tutor session, you can provide a lifetime of advantage.
            Our experts have curated decades of science into one revolutionary psychoeducational tool.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-24 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-8">
                A whole new way to learn
              </h2>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <button
                    key={feature.id}
                    onClick={() => setActiveFeature(index)}
                    className={`w-full p-6 rounded-xl text-left transition-all duration-300 ${
                      activeFeature === index
                        ? 'bg-violet-600 text-white shadow-lg scale-105'
                        : 'bg-white border border-slate-200 hover:border-violet-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {feature.icon}
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-2xl border min-h-[400px] flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-6">
                {features[activeFeature].icon}
                <h3 className="font-bold text-2xl text-violet-600">
                  {features[activeFeature].title}
                </h3>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed">
                {features[activeFeature].description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-violet-600 to-purple-600 text-white py-24 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to unlock your child's potential?
          </h2>
          <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
            Join thousands of families who have already discovered the power of neuropsychological learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/registration"
              className="bg-white text-violet-600 font-bold px-8 py-4 rounded-full hover:bg-slate-100 transition-all duration-300 transform hover:scale-105"
            >
              Start Full Journey ($10)
            </Link>
            <Link
              to="/forum-registration"
              className="bg-violet-700 text-white font-bold px-8 py-4 rounded-full hover:bg-violet-800 transition-all duration-300 transform hover:scale-105"
            >
              Join Community (Free)
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;