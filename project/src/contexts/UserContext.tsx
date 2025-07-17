import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'learner' | 'parent';
  age?: number;
  profile: {
    avatar: string;
    rank: string;
    xp: number;
    xpToNextLevel: number;
    stars: number;
    about: string;
    gameProgress: {
      [gameId: string]: {
        level: number;
        stars: number;
        bestScore: number;
        timesPlayed: number;
      };
    };
  };
  journeyLog: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
    xpEarned: number;
  }>;
  hasPosted: boolean;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  addXP: (amount: number) => void;
  addStars: (amount: number) => void;
  updateGameProgress: (gameId: string, progress: Partial<User['profile']['gameProgress'][string]>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize user from localStorage
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('neuraplay_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      return null;
    }
  });

  const ranks = [
    { name: "New Learner", xpThreshold: 0, stars: 1 },
    { name: "Distinguished Learner", xpThreshold: 100, stars: 2 },
    { name: "Master Learner", xpThreshold: 300, stars: 3 },
    { name: "Superhero Learner", xpThreshold: 1000, stars: 4 }
  ];

  // Custom setUser that also saves to localStorage
  const setUserWithPersistence = (newUser: User | null) => {
    setUser(newUser);
    try {
      if (newUser) {
        localStorage.setItem('neuraplay_user', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('neuraplay_user');
      }
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  };

  const addXP = (amount: number) => {
    if (!user) return;
    
    const newXP = user.profile.xp + amount;
    const currentRankIndex = ranks.findIndex(r => r.name === user.profile.rank);
    const nextRank = ranks[currentRankIndex + 1];
    
    let updatedUser = { ...user };
    updatedUser.profile.xp = newXP;
    
    if (nextRank && newXP >= nextRank.xpThreshold) {
      updatedUser.profile.rank = nextRank.name;
      updatedUser.profile.xpToNextLevel = ranks[currentRankIndex + 2]?.xpThreshold || 2000;
    }
    
    setUserWithPersistence(updatedUser);
  };

  const addStars = (amount: number) => {
    if (!user) return;
    
    const updatedUser = { ...user };
    updatedUser.profile.stars += amount;
    setUserWithPersistence(updatedUser);
  };

  const updateGameProgress = (gameId: string, progress: Partial<User['profile']['gameProgress'][string]>) => {
    if (!user) return;
    
    const updatedUser = { ...user };
    if (!updatedUser.profile.gameProgress[gameId]) {
      updatedUser.profile.gameProgress[gameId] = {
        level: 1,
        stars: 0,
        bestScore: 0,
        timesPlayed: 0
      };
    }
    
    updatedUser.profile.gameProgress[gameId] = {
      ...updatedUser.profile.gameProgress[gameId],
      ...progress
    };
    
    setUserWithPersistence(updatedUser);
  };

  return (
    <UserContext.Provider value={{ user, setUser: setUserWithPersistence, addXP, addStars, updateGameProgress }}>
      {children}
    </UserContext.Provider>
  );
};