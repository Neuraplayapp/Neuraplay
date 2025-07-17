import React from 'react';
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100 border-t border-slate-200">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-slate-600">
          <div>
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              NEURAPLAY
            </h4>
            <Link to="/registration" className="block hover:text-violet-600">
              Begin Journey
            </Link>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Company</h4>
            <a href="#" className="block hover:text-violet-600 mb-2">About Us</a>
            <a href="#" className="block hover:text-violet-600">Contact</a>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Community</h4>
            <Link to="/playground" className="block hover:text-violet-600 mb-2">
              The Playground
            </Link>
            <Link to="/forum" className="block hover:text-violet-600">
              Forum
            </Link>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Legal</h4>
            <button className="text-left block hover:text-violet-600 mb-2">
              Privacy Policy
            </button>
            <button className="text-left block hover:text-violet-600">
              Terms of Service
            </button>
          </div>
        </div>
        
        <div className="mt-12 border-t border-slate-200 pt-8 text-center text-slate-500">
          <p>© 2025 Neuraplay. All rights reserved. Engineering the future of consciousness.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;