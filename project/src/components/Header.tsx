import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, LogOut } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const Header: React.FC = () => {
  const { user, setUser } = useUser();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-slate-200">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-3xl font-black text-violet-600 tracking-tighter flex items-center gap-2">
          <Brain className="w-8 h-8" />
          NEURAPLAY
        </Link>
        
        <div className="hidden md:flex items-center space-x-8 font-semibold text-slate-600">
          <Link 
            to="/" 
            className={`hover:text-violet-600 transition-colors ${isActive('/') ? 'text-violet-600' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/playground" 
            className={`hover:text-violet-600 transition-colors ${isActive('/playground') ? 'text-violet-600' : ''}`}
          >
            The Playground
          </Link>
          <Link 
            to="/forum" 
            className={`hover:text-violet-600 transition-colors ${isActive('/forum') ? 'text-violet-600' : ''}`}
          >
            Community Forum
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src={user.profile.avatar} 
                  alt={user.username}
                  className="w-10 h-10 rounded-full border-2 border-violet-200"
                />
                <div className="hidden sm:block">
                  <p className="font-semibold text-slate-800">{user.username}</p>
                  <p className="text-xs text-violet-600">{user.profile.rank}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link 
              to="/registration" 
              className="bg-violet-600 text-white font-bold px-6 py-3 rounded-full hover:bg-violet-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Begin the Journey
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;