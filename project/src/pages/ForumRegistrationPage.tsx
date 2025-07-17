import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';

const ForumRegistrationPage: React.FC = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: '',
    age: 5,
    username: '',
    email: '',
    avatar: 'https://placehold.co/100x100/c084fc/ffffff?text=NP'
  });

  const avatars = [
    'https://placehold.co/100x100/c084fc/ffffff?text=NP',
    'https://placehold.co/100x100/7dd3fc/ffffff?text=NP',
    'https://placehold.co/100x100/f472b6/ffffff?text=NP',
    'https://placehold.co/100x100/fbbf24/ffffff?text=NP',
    'https://placehold.co/100x100/4ade80/ffffff?text=NP',
    'https://placehold.co/100x100/f87171/ffffff?text=NP'
  ];

  const handleSubmit = () => {
    if (!formData.role || !formData.username.trim() || !formData.email.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      username: formData.username,
      email: formData.email,
      role: formData.role as 'learner' | 'parent',
      age: formData.role === 'learner' ? formData.age : undefined,
      profile: {
        avatar: formData.avatar,
        rank: 'New Learner',
        xp: 0,
        xpToNextLevel: 100,
        stars: 0,
        about: '',
        gameProgress: {}
      },
      journeyLog: [],
      hasPosted: false
    };

    setUser(newUser);
    navigate('/forum');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 py-24 px-6 flex items-center justify-center">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <Users className="w-16 h-16 text-violet-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Join the community forum</h1>
          <p className="text-slate-600">Create a free account to post, reply, and connect with others.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border">
          <div className="space-y-6">
            <div>
              <label className="block font-bold mb-3 text-slate-900">I am a...</label>
              <div className="grid grid-cols-2 gap-4">
                {['learner', 'parent'].map(role => (
                  <button
                    key={role}
                    onClick={() => setFormData({ ...formData, role })}
                    className={`p-4 rounded-xl font-semibold transition-all border-2 ${
                      formData.role === role
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-violet-300'
                    }`}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {formData.role === 'learner' && (
              <div>
                <label className="block font-bold mb-3 text-slate-900">Learner's age</label>
                <select
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  className="w-full p-4 rounded-xl border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                >
                  <option value={4}>3-5</option>
                  <option value={7}>6-8</option>
                  <option value={10}>9-12</option>
                </select>
              </div>
            )}

            <input
              type="text"
              placeholder="Create a username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full p-4 rounded-xl border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            />

            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-4 rounded-xl border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            />

            <div>
              <h4 className="font-bold mb-3 text-slate-900">Choose your hero avatar</h4>
              <div className="grid grid-cols-6 gap-3">
                {avatars.map(avatar => (
                  <button
                    key={avatar}
                    onClick={() => setFormData({ ...formData, avatar })}
                    className={`w-16 h-16 rounded-full transition-all ${
                      formData.avatar === avatar
                        ? 'ring-4 ring-violet-500 scale-110'
                        : 'hover:scale-105'
                    }`}
                  >
                    <img src={avatar} alt="Avatar" className="w-full h-full rounded-full" />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-violet-600 text-white font-bold py-4 rounded-full hover:bg-violet-700 transition-all transform hover:scale-105"
            >
              Create free account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumRegistrationPage;