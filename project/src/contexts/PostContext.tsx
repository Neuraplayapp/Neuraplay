import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  channel: string;
  votes: number;
  createdAt: string;
  replies: Reply[];
}

export interface Reply {
  id: string;
  content: string;
  author: string;
  authorAvatar: string;
  votes: number;
  createdAt: string;
}

interface PostContextType {
  posts: Post[];
  channels: string[];
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'replies'>) => void;
  addReply: (postId: string, reply: Omit<Reply, 'id' | 'createdAt'>) => void;
  votePost: (postId: string, increment: number) => void;
  voteReply: (postId: string, replyId: string, increment: number) => void;
  addChannel: (channel: string) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const usePost = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
};

export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize posts from localStorage
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const savedPosts = localStorage.getItem('neuraplay_posts');
      if (savedPosts) {
        return JSON.parse(savedPosts);
      }
    } catch (error) {
      console.error('Error loading posts from localStorage:', error);
    }
    
    // Default posts if nothing in localStorage
    return [
      {
        id: '1',
        title: 'My son finally understood sharing!',
        content: 'We used the "two baskets" game from the app, and something just clicked. He shared his toys without any prompting for the first time!',
        author: 'Sarah J.',
        authorAvatar: 'https://placehold.co/100x100/c084fc/ffffff?text=S',
        channel: 'What I Learned Today',
        votes: 15,
        createdAt: '2025-01-02',
        replies: [
          {
            id: '101',
            content: 'That\'s amazing! We are going to try that tonight.',
            author: 'Mike R.',
            authorAvatar: 'https://placehold.co/100x100/7dd3fc/ffffff?text=M',
            votes: 5,
            createdAt: '2025-01-02'
          }
        ]
      },
      {
        id: '2',
        title: 'The AI storyteller is incredible',
        content: 'It wove my daughter\'s favorite animal (a penguin) into a story about emotional regulation. She was captivated!',
        author: 'Mike R.',
        authorAvatar: 'https://placehold.co/100x100/7dd3fc/ffffff?text=M',
        channel: 'Amazing Discoveries',
        votes: 22,
        createdAt: '2025-01-01',
        replies: []
      }
    ];
  });

  const [channels] = useState([
    "What I Learned Today",
    "Insights", 
    "Amazing Discoveries",
    "Parenting Hacks",
    "Emotional Wins",
    "Cognitive Leaps",
    "Creative Sparks",
    "Ask the Experts",
    "Success Stories",
    "Resource Share"
  ]);

  // Save posts to localStorage whenever posts change
  const setPostsWithPersistence = (newPosts: Post[] | ((prev: Post[]) => Post[])) => {
    const updatedPosts = typeof newPosts === 'function' ? newPosts(posts) : newPosts;
    setPosts(updatedPosts);
    try {
      localStorage.setItem('neuraplay_posts', JSON.stringify(updatedPosts));
    } catch (error) {
      console.error('Error saving posts to localStorage:', error);
    }
  };

  const addPost = (postData: Omit<Post, 'id' | 'createdAt' | 'replies'>) => {
    const newPost: Post = {
      ...postData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      replies: []
    };
    setPostsWithPersistence(prev => [newPost, ...prev]);
  };

  const addReply = (postId: string, replyData: Omit<Reply, 'id' | 'createdAt'>) => {
    const newReply: Reply = {
      ...replyData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setPostsWithPersistence(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, replies: [...post.replies, newReply] }
        : post
    ));
  };

  const votePost = (postId: string, increment: number) => {
    setPostsWithPersistence(prev => prev.map(post =>
      post.id === postId
        ? { ...post, votes: post.votes + increment }
        : post
    ));
  };

  const voteReply = (postId: string, replyId: string, increment: number) => {
    setPostsWithPersistence(prev => prev.map(post =>
      post.id === postId
        ? {
            ...post,
            replies: post.replies.map(reply =>
              reply.id === replyId
                ? { ...reply, votes: reply.votes + increment }
                : reply
            )
          }
        : post
    ));
  };

  const addChannel = (channel: string) => {
    // Implementation for adding channels would go here
  };

  return (
    <PostContext.Provider value={{ 
      posts, 
      channels, 
      addPost, 
      addReply, 
      votePost, 
      voteReply, 
      addChannel 
    }}>
      {children}
    </PostContext.Provider>
  );
};