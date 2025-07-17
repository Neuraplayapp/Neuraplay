import React from 'react';
import { X } from 'lucide-react';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: {
    id: string;
    title: string;
    description: string;
    component: React.ComponentType<any>;
    color: string;
    difficulty: string;
    skills: string[];
  };
}

const GameModal: React.FC<GameModalProps> = ({ isOpen, onClose, game }) => {
  if (!isOpen) return null;

  const GameComponent = game.component;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${game.color} text-white p-6`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2">{game.title}</h2>
              <p className="text-white/90">{game.description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Game Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <GameComponent onClose={onClose} />
        </div>
      </div>
    </div>
  );
};

export default GameModal;