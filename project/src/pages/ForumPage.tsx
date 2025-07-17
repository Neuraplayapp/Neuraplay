import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { usePost } from '../contexts/PostContext';
import { Link } from 'react-router-dom';
import { ChevronUp, ChevronDown, MessageCircle, Flag, UserPlus, Star } from 'lucide-react';

const ForumPage: React.FC = () => {
  const { user } = useUser();
  const { posts, channels, addPost, addReply, votePost } = usePost();
  const [selectedChannel, setSelectedChannel] = useState('What I Learned Today');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
  const [showReplyForm, setShowReplyForm] = useState<{ [key: string]: boolean }>({});

  const handleSubmitPost = () => {
    if (!user || !newPostTitle.trim() || !newPostContent.trim()) return;
    
    addPost({
      title: newPostTitle,
      content: newPostContent,
      author: user.username,
      authorAvatar: user.profile.avatar,
      channel: selectedChannel,
      votes: 1
    });
    
    setNewPostTitle('');
    setNewPostContent('');
  };

  const handleSubmitReply = (postId: string) => {
    if (!user || !replyContent[postId]?.trim()) return;
    
    addReply(postId, {
      content: replyContent[postId],
      author: user.username,
      authorAvatar: user.profile.avatar,
      votes: 1
    });
    
    setReplyContent({ ...replyContent, [postId]: '' });
    setShowReplyForm({ ...showReplyForm, [postId]: false });
  };

  const filteredPosts = posts.filter(post => post.channel === selectedChannel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 pt-8">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mb-4">
            Join the collective
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-slate-600">
            This is your space to share breakthroughs, ask for advice, and grow with a family that gets it. 
            The more you share, the more everyone learns!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* User Auth/Profile */}
              <div className="bg-white p-6 rounded-2xl border shadow-lg text-center">
                {user ? (
                  <div>
                    <img 
                      src={user.profile.avatar} 
                      alt={user.username}
                      className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-violet-200"
                    />
                    <h3 className="font-bold text-lg text-slate-900">{user.username}</h3>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <p className="text-violet-600 font-semibold">{user.profile.rank}</p>
                      <div className="flex gap-1">
                        {[...Array(Math.min(user.profile.stars, 5))].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-4">Welcome back!</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-bold text-xl mb-2 text-violet-600">Ready for adventure?</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Create an account to post, vote, and make friends!
                    </p>
                    <Link 
                      to="/forum-registration"
                      className="block bg-violet-600 text-white font-bold py-3 px-6 rounded-full hover:bg-violet-700 transition-all"
                    >
                      Join the fun now!
                    </Link>
                  </div>
                )}
              </div>

              {/* Channels */}
              <div className="bg-white p-6 rounded-2xl border shadow-lg">
                <h3 className="font-bold text-xl mb-4 text-violet-600">Channels</h3>
                <div className="space-y-2">
                  {channels.map(channel => (
                    <button
                      key={channel}
                      onClick={() => setSelectedChannel(channel)}
                      className={`w-full text-left py-3 px-4 rounded-lg font-semibold transition-all ${
                        selectedChannel === channel 
                          ? 'bg-violet-600 text-white shadow-lg' 
                          : 'text-slate-600 hover:bg-violet-50'
                      }`}
                    >
                      {channel}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-8">
            {/* New Post Form */}
            {user && (
              <div className="bg-white p-6 rounded-2xl border shadow-lg">
                <h2 className="text-2xl font-bold mb-4">
                  Share your spark in <span className="text-violet-600">{selectedChannel}</span>
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="A brilliant title..."
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full p-4 rounded-lg border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  />
                  <textarea
                    placeholder="Share your thoughts..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={4}
                    className="w-full p-4 rounded-lg border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  />
                  <button
                    onClick={handleSubmitPost}
                    className="bg-violet-600 text-white font-bold px-8 py-3 rounded-full hover:bg-violet-700 transition-all transform hover:scale-105"
                  >
                    Launch post
                  </button>
                </div>
              </div>
            )}

            {/* Posts */}
            <div className="space-y-6">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border shadow-lg">
                  <MessageCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">
                    No sparks in this channel yet. Be the first to ignite a conversation!
                  </p>
                </div>
              ) : (
                filteredPosts.map(post => (
                  <div key={post.id} className="bg-white rounded-2xl border shadow-lg overflow-hidden">
                    <div className="flex gap-4 p-6">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center space-y-2 text-slate-500">
                        <button
                          onClick={() => votePost(post.id, 1)}
                          className="p-2 rounded-full hover:bg-green-100 hover:text-green-600 transition-all hover:scale-110"
                        >
                          <ChevronUp className="w-6 h-6" />
                        </button>
                        <span className="font-bold text-lg text-slate-700">{post.votes}</span>
                        <button
                          onClick={() => votePost(post.id, -1)}
                          className="p-2 rounded-full hover:bg-red-100 hover:text-red-600 transition-all hover:scale-110"
                        >
                          <ChevronDown className="w-6 h-6" />
                        </button>
                      </div>

                      {/* Post Content */}
                      <div className="flex-1">
                        <p className="text-xs text-violet-600 font-bold mb-1">{post.channel}</p>
                        <h3 className="font-bold text-xl text-slate-900 mb-3">{post.title}</h3>
                        <p className="text-slate-600 mb-4 leading-relaxed">{post.content}</p>
                        
                        {/* Post Meta */}
                        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={post.authorAvatar} 
                              alt={post.author}
                              className="w-8 h-8 rounded-full"
                            />
                            <span>Posted by: <strong>{post.author}</strong></span>
                          </div>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => setShowReplyForm({ ...showReplyForm, [post.id]: !showReplyForm[post.id] })}
                              className="font-semibold hover:text-violet-600 transition-colors"
                            >
                              Reply
                            </button>
                            <button className="font-semibold hover:text-red-600 transition-colors">
                              <Flag className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Reply Form */}
                        {showReplyForm[post.id] && user && (
                          <div className="border-t pt-4 mb-4">
                            <textarea
                              placeholder={`Replying to @${post.author}...`}
                              value={replyContent[post.id] || ''}
                              onChange={(e) => setReplyContent({ ...replyContent, [post.id]: e.target.value })}
                              className="w-full p-3 rounded-lg border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 mb-2"
                              rows={3}
                            />
                            <button
                              onClick={() => handleSubmitReply(post.id)}
                              className="bg-violet-500 text-white font-bold px-6 py-2 rounded-full hover:bg-violet-600 transition-all"
                            >
                              Reply
                            </button>
                          </div>
                        )}

                        {/* Replies */}
                        {post.replies.length > 0 && (
                          <div className="space-y-4 border-t pt-4">
                            {post.replies.map(reply => (
                              <div key={reply.id} className="flex gap-3 ml-8 p-4 bg-slate-50 rounded-lg">
                                <img 
                                  src={reply.authorAvatar} 
                                  alt={reply.author}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <strong className="text-sm">{reply.author}</strong>
                                    <span className="text-xs text-slate-500">{reply.createdAt}</span>
                                  </div>
                                  <p className="text-slate-700">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ForumPage;