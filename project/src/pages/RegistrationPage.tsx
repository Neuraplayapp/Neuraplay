import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { Check, Star } from 'lucide-react';

const RegistrationPage: React.FC = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: '',
    age: 5,
    username: '',
    email: '',
    avatar: 'https://placehold.co/100x100/c084fc/ffffff?text=NP',
    agreeToTerms: false
  });

  const avatars = [
    'https://placehold.co/100x100/c084fc/ffffff?text=NP',
    'https://placehold.co/100x100/7dd3fc/ffffff?text=NP',
    'https://placehold.co/100x100/f472b6/ffffff?text=NP',
    'https://placehold.co/100x100/fbbf24/ffffff?text=NP',
    'https://placehold.co/100x100/4ade80/ffffff?text=NP',
    'https://placehold.co/100x100/f87171/ffffff?text=NP'
  ];

  const handleStepOne = () => {
    if (!formData.role || !formData.username.trim() || !formData.email.trim() || !formData.agreeToTerms) {
      alert('Please fill out all fields and agree to the terms.');
      return;
    }
    setStep(2);
  };

  const handleComplete = () => {
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
    setStep(3);
    
    setTimeout(() => {
      navigate(formData.role === 'learner' ? '/playground' : '/forum');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 to-purple-600 text-white py-24 px-6">
      <div className="container mx-auto max-w-2xl">
        {step === 1 && (
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">
              The best investment you will ever make is your child
            </h1>
            <p className="text-xl text-violet-200">
              Their education is priceless. Seriously.
            </p>
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20">
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-bold mb-8 text-center">Create your account</h2>
              <div className="space-y-6">
                <div>
                  <label className="block font-bold mb-3">I am a...</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['learner', 'parent'].map(role => (
                      <button
                        key={role}
                        onClick={() => setFormData({ ...formData, role })}
                        className={`p-4 rounded-xl font-semibold transition-all ${
                          formData.role === role
                            ? 'bg-white text-violet-600 shadow-lg'
                            : 'bg-white/20 hover:bg-white/30'
                        }`}
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.role === 'learner' && (
                  <div>
                    <label className="block font-bold mb-3">Learner's age</label>
                    <select
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                      className="w-full p-4 rounded-xl bg-white/20 border border-white/30 text-white"
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
                  className="w-full p-4 rounded-xl bg-white/20 border border-white/30 placeholder-white/70 text-white"
                />

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-4 rounded-xl bg-white/20 border border-white/30 placeholder-white/70 text-white"
                />

                <div>
                  <h4 className="font-bold mb-3">Choose your hero avatar</h4>
                  <div className="grid grid-cols-6 gap-3">
                    {avatars.map(avatar => (
                      <button
                        key={avatar}
                        onClick={() => setFormData({ ...formData, avatar })}
                        className={`w-16 h-16 rounded-full transition-all ${
                          formData.avatar === avatar
                            ? 'ring-4 ring-white scale-110'
                            : 'hover:scale-105'
                        }`}
                      >
                        <img src={avatar} alt="Avatar" className="w-full h-full rounded-full" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <label htmlFor="terms" className="text-sm">
                    I have read and agree to the terms of service
                  </label>
                </div>

                <button
                  onClick={handleStepOne}
                  disabled={!formData.agreeToTerms}
                  className="w-full bg-white text-violet-600 font-bold py-4 rounded-full hover:bg-slate-100 transition-all disabled:opacity-50"
                >
                  Next: Address & payment
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-3xl font-bold mb-8 text-center">Billing information</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-full p-4 rounded-xl bg-white/20 border border-white/30 placeholder-white/70 text-white"
                />
                <input
                  type="text"
                  placeholder="Address"
                  className="w-full p-4 rounded-xl bg-white/20 border border-white/30 placeholder-white/70 text-white"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    className="w-full p-4 rounded-xl bg-white/20 border border-white/30 placeholder-white/70 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Postal code"
                    className="w-full p-4 rounded-xl bg-white/20 border border-white/30 placeholder-white/70 text-white"
                  />
                </div>
                <div className="bg-white/20 p-6 rounded-xl border border-white/30">
                  <h4 className="font-bold mb-4">Credit card information (Demo)</h4>
                  <input
                    type="text"
                    placeholder="Card number (e.g., 4242 4242 4242 4242)"
                    className="w-full p-4 rounded-xl bg-white/20 border border-white/30 placeholder-white/70 text-white mb-4"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full p-4 rounded-xl bg-white/20 border border-white/30 placeholder-white/70 text-white"
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      className="w-full p-4 rounded-xl bg-white/20 border border-white/30 placeholder-white/70 text-white"
                    />
                  </div>
                </div>
                <button
                  onClick={handleComplete}
                  className="w-full bg-white text-violet-600 font-bold py-4 rounded-full hover:bg-slate-100 transition-all"
                >
                  Complete purchase ($10)
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-green-400 mb-4">Success!</h2>
              <p className="text-xl">
                Your journey begins now. Welcome to the family!
              </p>
              <div className="flex justify-center mt-6">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;