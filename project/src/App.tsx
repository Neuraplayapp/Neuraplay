import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import PlaygroundPage from './pages/PlaygroundPage';
import ForumPage from './pages/ForumPage';
import RegistrationPage from './pages/RegistrationPage';
import ForumRegistrationPage from './pages/ForumRegistrationPage';
import AIReportPage from './pages/AIReportPage';
import { UserProvider } from './contexts/UserContext';
import { PostProvider } from './contexts/PostContext';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <h1 className="text-4xl font-black text-white tracking-tighter">NEURAPLAY</h1>
          <p className="text-white/80 mt-2">Loading the future...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <UserProvider>
        <PostProvider>
          <Router>
            <div className="min-h-screen bg-slate-50">
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/playground" element={<PlaygroundPage />} />
                  <Route path="/forum" element={<ForumPage />} />
                  <Route path="/registration" element={<RegistrationPage />} />
                  <Route path="/forum-registration" element={<ForumRegistrationPage />} />
                  <Route path="/ai-report" element={<AIReportPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </PostProvider>
      </UserProvider>
    </ErrorBoundary>
  );
}

export default App;