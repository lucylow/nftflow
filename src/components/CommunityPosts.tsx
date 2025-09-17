import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Post {
  id: number;
  author_address: string;
  title?: string;
  content: string;
  post_type: string;
  collection_address?: string;
  nft_token_id?: number;
  image_url?: string;
  tags?: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  featured: boolean;
  pinned: boolean;
  created_at: string;
  author_avatar?: string;
  author_reputation: number;
  author_verified: boolean;
}

interface CommunityPostsProps {
  collection?: string;
  type?: string;
  limit?: number;
  showCreateButton?: boolean;
}

const CommunityPosts: React.FC<CommunityPostsProps> = ({
  collection,
  type,
  limit = 20,
  showCreateButton = true
}) => {
  const { address } = useAccount();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    post_type: 'GENERAL',
    collection_address: collection || '',
    nft_token_id: '',
    image_url: '',
    tags: [] as string[]
  });

  useEffect(() => {
    fetchPosts();
  }, [collection, type, limit]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (collection) params.append('collection', collection);
      if (type) params.append('type', type);
      params.append('limit', limit.toString());
      
      const response = await fetch(`/api/community/posts?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setPosts(data);
      } else {
        console.error('Error fetching posts:', data.error);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.content.trim()) {
      alert('Content is required');
      return;
    }

    try {
      setIsCreating(true);
      
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newPost,
          nft_token_id: newPost.nft_token_id ? parseInt(newPost.nft_token_id) : undefined
        })
      });
      
      if (response.ok) {
        const createdPost = await response.json();
        setPosts([createdPost, ...posts]);
        setNewPost({
          title: '',
          content: '',
          post_type: 'GENERAL',
          collection_address: collection || '',
          nft_token_id: '',
          image_url: '',
          tags: []
        });
        setShowCreateForm(false);
      } else {
        const error = await response.json();
        alert(`Error creating post: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'COLLECTION_SHOWCASE': return '🖼️';
      case 'RENTAL_EXPERIENCE': return '🏠';
      case 'TUTORIAL': return '📚';
      case 'ANNOUNCEMENT': return '📢';
      default: return '💬';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-4 mb-4">
                <div className="avatar">
                  <div className="w-12 rounded-full skeleton"></div>
                </div>
                <div className="flex-1">
                  <div className="skeleton h-4 w-32 mb-2"></div>
                  <div className="skeleton h-3 w-20"></div>
                </div>
              </div>
              <div className="skeleton h-4 w-full mb-2"></div>
              <div className="skeleton h-4 w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showCreateButton && address && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {!showCreateForm ? (
              <button 
                className="btn btn-primary w-full"
                onClick={() => setShowCreateForm(true)}
              >
                Create New Post
              </button>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Create New Post</h3>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Title (optional)</span>
                  </label>
                  <input 
                    type="text" 
                    className="input input-bordered"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Post title..."
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Content *</span>
                  </label>
                  <textarea 
                    className="textarea textarea-bordered h-24"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="What's on your mind?"
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Post Type</span>
                  </label>
                  <select 
                    className="select select-bordered"
                    value={newPost.post_type}
                    onChange={(e) => setNewPost({ ...newPost, post_type: e.target.value })}
                  >
                    <option value="GENERAL">General</option>
                    <option value="COLLECTION_SHOWCASE">Collection Showcase</option>
                    <option value="RENTAL_EXPERIENCE">Rental Experience</option>
                    <option value="TUTORIAL">Tutorial</option>
                    <option value="ANNOUNCEMENT">Announcement</option>
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    className="btn btn-primary flex-1"
                    onClick={createPost}
                    disabled={isCreating || !newPost.content.trim()}
                  >
                    {isCreating ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      'Post'
                    )}
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {posts.length === 0 ? (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <h3 className="text-lg font-semibold">No posts yet</h3>
            <p className="text-gray-500">
              {collection ? 'No posts for this collection yet.' : 'Be the first to share something!'}
            </p>
          </div>
        </div>
      ) : (
        posts.map(post => (
          <div key={post.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-4 mb-4">
                <div className="avatar">
                  <div className="w-12 rounded-full">
                    <img 
                      src={post.author_avatar || '/default-avatar.png'} 
                      alt={post.author_address}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatAddress(post.author_address)}</span>
                    {post.author_verified && (
                      <div className="badge badge-primary badge-xs">Verified</div>
                    )}
                    <div className="badge badge-outline badge-xs">
                      Rep: {post.author_reputation}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{getPostTypeIcon(post.post_type)}</span>
                    <span>{post.post_type.replace('_', ' ').toLowerCase()}</span>
                    <span>•</span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </div>
                {post.featured && (
                  <div className="badge badge-warning">Featured</div>
                )}
                {post.pinned && (
                  <div className="badge badge-info">Pinned</div>
                )}
              </div>
              
              {post.title && (
                <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
              )}
              
              <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
              
              {post.image_url && (
                <div className="mb-4">
                  <img 
                    src={post.image_url} 
                    alt="Post image"
                    className="rounded-lg max-w-full h-auto"
                  />
                </div>
              )}
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.map((tag, index) => (
                    <div key={index} className="badge badge-outline badge-sm">
                      #{tag}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <button className="flex items-center gap-1 hover:text-primary">
                  <span>👍</span>
                  <span>{post.likes_count}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-primary">
                  <span>💬</span>
                  <span>{post.comments_count}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-primary">
                  <span>📤</span>
                  <span>{post.shares_count}</span>
                </button>
                <div className="flex items-center gap-1">
                  <span>👁️</span>
                  <span>{post.views_count}</span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CommunityPosts;
