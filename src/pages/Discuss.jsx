import React, { useState, useEffect, useRef } from 'react';
import './Discuss.css';
import Navbar from '../components/NavBar';
import { authAPI, postsAPI, commentsAPI } from '../services/api';

const Discuss = ({ activeTab, setActiveTab }) => {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState(['all']);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPost, setNewPost] = useState({
    content: '',
    tags: [],
    mediaType: 'text',
    mediaUrl: '',
    imageUrl: '',
    videoUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState({});
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs for file inputs
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const renderTagIcon = (tagId) => {
    switch (tagId) {
      case 'monuments':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18" />
            <path d="M5 21V7l8-4v18" />
            <path d="M19 21V11l-6-4" />
            <line x1="9" y1="9" x2="9" y2="9" />
            <line x1="9" y1="12" x2="9" y2="12" />
            <line x1="9" y1="15" x2="9" y2="15" />
            <line x1="9" y1="18" x2="9" y2="18" />
          </svg>
        );
      case 'art':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
          </svg>
        );
      case 'culture':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <line x1="12" y1="2" x2="12" y2="22" />
          </svg>
        );
      case 'heritage':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        );
      case 'traditions':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        );
      case 'architecture':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
        );
      default:
        return null;
    }
  };

  const availableTags = [
    { id: 'monuments', label: 'Monuments' },
    { id: 'art', label: 'Art' },
    { id: 'culture', label: 'Culture' },
    { id: 'heritage', label: 'Heritage Sites' },
    { id: 'traditions', label: 'Traditions' },
    { id: 'architecture', label: 'Architecture' }
  ];

  // Load user data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Fetch posts from dharohar_backend API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const fetchedPosts = await postsAPI.getAll();
        // Convert timestamp strings to Date objects
        const postsWithDates = fetchedPosts.map(post => ({
          ...post,
          timestamp: new Date(post.timestamp)
        }));
        setPosts(postsWithDates);
      } catch (err) {
        setError(err.message || 'Failed to load posts. Please try again.');
        console.error('Error fetching posts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Fetch comments when a post is selected
  useEffect(() => {
    const fetchComments = async () => {
      if (selectedPost && selectedPost.id) {
        try {
          const fetchedComments = await commentsAPI.getByPostId(selectedPost.id);
          // Convert timestamp strings to Date objects
          const commentsWithDates = fetchedComments.map(comment => ({
            ...comment,
            timestamp: new Date(comment.timestamp)
          }));
          setComments(prev => ({
            ...prev,
            [selectedPost.id]: commentsWithDates
          }));
        } catch (err) {
          console.error('Error fetching comments:', err);
        }
      }
    };

    fetchComments();
  }, [selectedPost]);

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) return;
    if (!user) {
      setError('Please log in to create a post');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let imageUrl = newPost.imageUrl || '';
      let videoUrl = newPost.videoUrl || '';

      // Upload image file if selected
      if (imageFile) {
        try {
          const uploadResult = await postsAPI.uploadImage(imageFile);
          imageUrl = uploadResult.imageUrl;
        } catch (uploadErr) {
          setError('Failed to upload image: ' + uploadErr.message);
          setIsLoading(false);
          return;
        }
      }

      // Upload video file if selected
      if (videoFile) {
        try {
          const uploadResult = await postsAPI.uploadVideo(videoFile);
          videoUrl = uploadResult.videoUrl;
        } catch (uploadErr) {
          setError('Failed to upload video: ' + uploadErr.message);
          setIsLoading(false);
          return;
        }
      }

      // Create post
      const createdPost = await postsAPI.create(
        newPost.content,
        newPost.tags,
        newPost.mediaType,
        imageUrl,
        videoUrl
      );

      // Convert timestamp to Date object
      const postWithDate = {
        ...createdPost,
        timestamp: new Date(createdPost.timestamp)
      };

      // Add to posts list
      setPosts([postWithDate, ...posts]);
      
      // Reset form
    setNewPost({
      content: '',
      tags: [],
      mediaType: 'text',
      mediaUrl: '',
      imageUrl: '',
      videoUrl: ''
    });
      setImageFile(null);
      setImagePreview(null);
      setVideoFile(null);
      setVideoPreview(null);
    setShowCreatePost(false);
    } catch (err) {
      setError(err.message || 'Failed to create post. Please try again.');
      console.error('Error creating post:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTag = (tagId) => {
    if (newPost.tags.includes(tagId)) {
      setNewPost({ ...newPost, tags: newPost.tags.filter(t => t !== tagId) });
    } else {
      setNewPost({ ...newPost, tags: [...newPost.tags, tagId] });
    }
  };

  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return;
    if (!user) {
      setError('Please log in to add a comment');
      return;
    }

    try {
      setError(null);
      const comment = await commentsAPI.create(postId, newComment);
      
      // Convert timestamp to Date object
      const commentWithDate = {
        ...comment,
        timestamp: new Date(comment.timestamp)
      };

      // Add comment to local state
    setComments({
      ...comments,
        [postId]: [...(comments[postId] || []), commentWithDate]
    });

      // Update post comment count
    setPosts(posts.map(post =>
      post.id === postId
          ? { ...post, comments: (post.comments || 0) + 1 }
        : post
    ));

    setNewComment('');
    } catch (err) {
      setError(err.message || 'Failed to add comment. Please try again.');
      console.error('Error adding comment:', err);
    }
  };

  const handleUserClick = (userId) => {
    const userPosts = posts.filter(p => p.userId === userId);
    const user = posts.find(p => p.userId === userId);
    setSelectedUser({
      userId,
      username: user?.username || 'Unknown',
      posts: userPosts
    });
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    // If "all" is selected, show all posts
    // Otherwise, only show posts that have ALL selected tags
    const matchesTags = selectedTags.includes('all') ||
                       selectedTags.every(tag => post.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  return (
    <div className="discuss-page">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="discuss-container">
        {/* Header */}
        <div className="discuss-header">
          <h1 className="discuss-title">Community Discussions</h1>
          <p className="discuss-subtitle">Share, discover, and discuss heritage sites, art, and culture</p>
        </div>

        {/* Search and Filters */}
        <div className="discuss-controls">
          <div className="discuss-search-wrapper">
            <svg className="discuss-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="discuss-search"
              placeholder="Search posts, people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="discuss-tags-filter">
            <button
              className={`discuss-tag-filter ${selectedTags.includes('all') ? 'active' : ''}`}
              onClick={() => setSelectedTags(['all'])}
            >
              All
            </button>
            {availableTags.map(tag => (
              <button
                key={tag.id}
                className={`discuss-tag-filter ${selectedTags.includes(tag.id) ? 'active' : ''}`}
                onClick={() => {
                  if (selectedTags.includes('all')) {
                    setSelectedTags([tag.id]);
                  } else if (selectedTags.includes(tag.id)) {
                    const newTags = selectedTags.filter(t => t !== tag.id);
                    setSelectedTags(newTags.length === 0 ? ['all'] : newTags);
                  } else {
                    setSelectedTags([...selectedTags.filter(t => t !== 'all'), tag.id]);
                  }
                }}
              >
                <span className="discuss-tag-icon">{renderTagIcon(tag.id)}</span>
                <span>{tag.label}</span>
              </button>
            ))}
          </div>

          <button className="discuss-create-btn" onClick={() => setShowCreatePost(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Post
          </button>
        </div>

        {/* Posts Grid */}
        <div className="discuss-posts-grid">
          {filteredPosts.map((post) => (
            <article 
              key={post.id} 
              className="discuss-post-card"
            >
                <div className="discuss-post-header">
                  <div
                    className="discuss-post-author"
                    onClick={() => handleUserClick(post.userId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="discuss-post-avatar">
                      {post.avatar ? (
                        <img src={post.avatar} alt={post.username} />
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      )}
                    </div>
                    <div className="discuss-post-author-info">
                      <div className="discuss-post-username">@{post.username}</div>
                      <div className="discuss-post-time">{formatTimeAgo(post.timestamp)}</div>
                    </div>
                  </div>
                </div>

                <div className="discuss-post-content">
                  <p>{post.content}</p>
                  
                  {post.tags.length > 0 && (
                    <div className="discuss-post-tags">
                      {post.tags.map(tagId => {
                        const tag = availableTags.find(t => t.id === tagId);
                        return tag ? (
                          <span key={tagId} className="discuss-post-tag">
                            <span className="discuss-tag-icon">{renderTagIcon(tagId)}</span>
                            <span>{tag.label}</span>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}

                  {post.mediaType === 'image' && post.imageUrl && (
                    <div className="discuss-post-media">
                      <img src={post.imageUrl} alt="Post" />
                    </div>
                  )}

                  {post.mediaType === 'video' && post.videoUrl && (
                    <div className="discuss-post-media">
                      <video controls>
                        <source src={post.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>

                <div className="discuss-post-actions">
                  <button
                    className="discuss-action-btn"
                    onClick={() => setSelectedPost(post)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>{post.comments}</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="discuss-empty">
            <p>No posts found. Be the first to share!</p>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="discuss-modal-overlay" onClick={() => {
          setShowCreatePost(false);
          setImageFile(null);
          setImagePreview(null);
          setVideoFile(null);
          setVideoPreview(null);
        }}>
          <div className="discuss-modal" onClick={(e) => e.stopPropagation()}>
            <div className="discuss-modal-header">
              <h2>Create New Post</h2>
              <button className="discuss-modal-close" onClick={() => {
                setShowCreatePost(false);
                setImageFile(null);
                setImagePreview(null);
                setVideoFile(null);
                setVideoPreview(null);
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="discuss-modal-body">
              <div className="discuss-form-group">
                <label>Media Type</label>
                <div className="discuss-form-options">
                  <button
                    className={`discuss-form-option ${newPost.mediaType === 'text' ? 'active' : ''}`}
                    onClick={() => {
                      setNewPost({ ...newPost, mediaType: 'text', imageUrl: '', videoUrl: '' });
                      setImageFile(null);
                      setImagePreview(null);
                      setVideoFile(null);
                      setVideoPreview(null);
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <span>Text Only</span>
                  </button>
                  <button
                    className={`discuss-form-option ${newPost.mediaType === 'image' ? 'active' : ''}`}
                    onClick={() => {
                      setNewPost({ ...newPost, mediaType: 'image', videoUrl: '' });
                      setImageFile(null);
                      setImagePreview(null);
                      setVideoFile(null);
                      setVideoPreview(null);
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Image</span>
                  </button>
                  <button
                    className={`discuss-form-option ${newPost.mediaType === 'video' ? 'active' : ''}`}
                    onClick={() => {
                      setNewPost({ ...newPost, mediaType: 'video', imageUrl: '' });
                      setImageFile(null);
                      setImagePreview(null);
                      setVideoFile(null);
                      setVideoPreview(null);
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                    <span>Video</span>
                  </button>
                </div>
              </div>

              {newPost.mediaType === 'image' && (
                <div className="discuss-form-group">
                  <label>Add Image</label>
                  
                  {!imageFile && (
                    <>
                      {/* File Upload Option */}
                      <div style={{ marginBottom: '1rem' }}>
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          id="image-upload"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              // Validate file size (5MB)
                              if (file.size > 5 * 1024 * 1024) {
                                setError('Image size must be less than 5MB');
                                return;
                              }
                              
                              // Create preview
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setImageFile(file);
                                setImagePreview(reader.result);
                                setNewPost({ ...newPost, imageUrl: '' }); // Clear URL if file is selected
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (imageInputRef.current) {
                              imageInputRef.current.click();
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '1rem',
                            backgroundColor: '#f8f9fa',
                            border: '2px dashed #dee2e6',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontSize: '0.95rem',
                            color: '#495057',
                            transition: 'all 0.2s ease',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#e9ecef';
                            e.currentTarget.style.borderColor = '#adb5bd';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                            e.currentTarget.style.borderColor = '#dee2e6';
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          Choose from Device
                        </button>
                      </div>
                      
                      {/* OR divider */}
                      {newPost.imageUrl && (
                        <div style={{ textAlign: 'center', margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>OR</div>
                      )}
                      
                      {/* URL Input Option */}
                      {!imageFile && (
                  <input
                    type="text"
                    className="discuss-form-input"
                          placeholder="Or paste image URL"
                    value={newPost.imageUrl}
                          onChange={(e) => {
                            setNewPost({ ...newPost, imageUrl: e.target.value });
                          }}
                        />
                      )}
                    </>
                  )}
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div style={{ marginBottom: '1rem', position: 'relative', display: 'inline-block', width: '100%' }}>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{ 
                          width: '100%',
                          maxHeight: '300px', 
                          borderRadius: '8px',
                          objectFit: 'contain',
                          display: 'block',
                          backgroundColor: '#f8f9fa'
                        }} 
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          cursor: 'pointer',
                          fontSize: '18px',
                          lineHeight: '1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.9)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )}

              {newPost.mediaType === 'video' && (
                <div className="discuss-form-group">
                  <label>Add Video</label>
                  
                  {!videoFile && (
                    <>
                      {/* File Upload Option */}
                      <div style={{ marginBottom: '1rem' }}>
                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          id="video-upload"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              // Validate file size (50MB)
                              if (file.size > 50 * 1024 * 1024) {
                                setError('Video size must be less than 50MB');
                                return;
                              }
                              
                              // Create preview
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setVideoFile(file);
                                setVideoPreview(reader.result);
                                setNewPost({ ...newPost, videoUrl: '' }); // Clear URL if file is selected
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (videoInputRef.current) {
                              videoInputRef.current.click();
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '1rem',
                            backgroundColor: '#f8f9fa',
                            border: '2px dashed #dee2e6',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontSize: '0.95rem',
                            color: '#495057',
                            transition: 'all 0.2s ease',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#e9ecef';
                            e.currentTarget.style.borderColor = '#adb5bd';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                            e.currentTarget.style.borderColor = '#dee2e6';
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          Choose from Device
                        </button>
                      </div>
                      
                      {/* OR divider */}
                      {newPost.videoUrl && (
                        <div style={{ textAlign: 'center', margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>OR</div>
                      )}
                      
                      {/* URL Input Option */}
                      {!videoFile && (
                  <input
                    type="text"
                    className="discuss-form-input"
                          placeholder="Or paste video URL"
                    value={newPost.videoUrl}
                          onChange={(e) => {
                            setNewPost({ ...newPost, videoUrl: e.target.value });
                          }}
                        />
                      )}
                    </>
                  )}
                  
                  {/* Video Preview */}
                  {videoPreview && (
                    <div style={{ marginBottom: '1rem', position: 'relative', display: 'inline-block', width: '100%' }}>
                      <video 
                        src={videoPreview} 
                        controls
                        style={{ 
                          width: '100%',
                          maxHeight: '300px', 
                          borderRadius: '8px',
                          display: 'block',
                          backgroundColor: '#000'
                        }} 
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setVideoFile(null);
                          setVideoPreview(null);
                        }}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          cursor: 'pointer',
                          fontSize: '18px',
                          lineHeight: '1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.9)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="discuss-form-group">
                <label>Tags</label>
                <div className="discuss-form-tags">
                  {availableTags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      className={`discuss-form-tag ${newPost.tags.includes(tag.id) ? 'active' : ''}`}
                      onClick={() => handleToggleTag(tag.id)}
                    >
                      <span className="discuss-tag-icon">{renderTagIcon(tag.id)}</span>
                      <span>{tag.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="discuss-form-group">
                <label>Your Thoughts</label>
                <textarea
                  className="discuss-form-textarea"
                  placeholder="Share your thoughts about heritage, art, culture..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={6}
                />
              </div>

              {error && (
                <div className="discuss-error-message" style={{ color: '#ff6b7a', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(220, 53, 69, 0.1)', borderRadius: '8px', border: '1px solid rgba(220, 53, 69, 0.3)' }}>
                  {error}
                </div>
              )}
              {isLoading && (
                <div style={{ marginBottom: '1rem', color: '#f7d9a3', textAlign: 'center' }}>Uploading and posting...</div>
              )}
              <button
                className="discuss-form-submit"
                onClick={handleCreatePost}
                disabled={!newPost.content.trim() || isLoading}
              >
                {isLoading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal with Comments */}
      {selectedPost && (
        <div className="discuss-modal-overlay" onClick={() => { setSelectedPost(null); setNewComment(''); }}>
          <div className="discuss-post-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="discuss-post-detail-header">
              <div
                className="discuss-post-author"
                onClick={() => handleUserClick(selectedPost.userId)}
                style={{ cursor: 'pointer' }}
              >
                <div className="discuss-post-avatar">
                  {selectedPost.avatar ? (
                    <img src={selectedPost.avatar} alt={selectedPost.username} />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>
                <div className="discuss-post-author-info">
                  <div className="discuss-post-username">@{selectedPost.username}</div>
                  <div className="discuss-post-time">{formatTimeAgo(selectedPost.timestamp)}</div>
                </div>
              </div>
              <button className="discuss-modal-close" onClick={() => { setSelectedPost(null); setNewComment(''); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="discuss-post-detail-content">
              <p>{selectedPost.content}</p>

              {selectedPost.tags.length > 0 && (
                <div className="discuss-post-tags">
                  {selectedPost.tags.map(tagId => {
                    const tag = availableTags.find(t => t.id === tagId);
                    return tag ? (
                      <span key={tagId} className="discuss-post-tag">
                        <span className="discuss-tag-icon">{renderTagIcon(tagId)}</span>
                        <span>{tag.label}</span>
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {selectedPost.mediaType === 'image' && selectedPost.imageUrl && (
                <div className="discuss-post-media">
                  <img src={selectedPost.imageUrl} alt="Post" />
                </div>
              )}

              {selectedPost.mediaType === 'video' && selectedPost.videoUrl && (
                <div className="discuss-post-media">
                  <video controls>
                    <source src={selectedPost.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>


            <div className="discuss-comments-section">
              <h3>Comments ({comments[selectedPost.id]?.length || 0})</h3>
              <div className="discuss-comments-list">
                {comments[selectedPost.id]?.map(comment => (
                  <div key={comment.id} className="discuss-comment-item">
                    <div
                      className="discuss-comment-avatar"
                      onClick={() => handleUserClick(comment.userId)}
                      style={{ cursor: 'pointer' }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="discuss-comment-content">
                      <div className="discuss-comment-header">
                        <span
                          className="discuss-comment-username"
                          onClick={() => handleUserClick(comment.userId)}
                          style={{ cursor: 'pointer' }}
                        >
                          @{comment.username}
                        </span>
                        <span className="discuss-comment-time">{formatTimeAgo(comment.timestamp)}</span>
                      </div>
                      <p>{comment.content}</p>
                    </div>
                  </div>
                ))}
                {(!comments[selectedPost.id] || comments[selectedPost.id].length === 0) && (
                  <div className="discuss-comments-empty">No comments yet. Be the first to comment!</div>
                )}
              </div>

              <div className="discuss-comment-input">
                <input
                  type="text"
                  className="discuss-comment-field"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newComment.trim()) {
                      handleAddComment(selectedPost.id);
                    }
                  }}
                />
                <button
                  className="discuss-comment-submit"
                  onClick={() => handleAddComment(selectedPost.id)}
                  disabled={!newComment.trim()}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {selectedUser && (
        <div className="discuss-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="discuss-user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="discuss-user-modal-header">
              <h2>@{selectedUser.username}</h2>
              <button className="discuss-modal-close" onClick={() => setSelectedUser(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="discuss-user-stats">
              <div className="discuss-user-stat">
                <span className="discuss-user-stat-value">{selectedUser.posts.length}</span>
                <span className="discuss-user-stat-label">Posts</span>
              </div>
            </div>

            <div className="discuss-user-posts">
              <h3>Posts by @{selectedUser.username}</h3>
              {selectedUser.posts.length === 0 ? (
                <div className="discuss-empty">No posts yet.</div>
              ) : (
                selectedUser.posts.map(post => (
                  <div
                    key={post.id}
                    className="discuss-user-post-item"
                    onClick={() => {
                      setSelectedUser(null);
                      setSelectedPost(post);
                    }}
                  >
                    <p>{post.content.substring(0, 150)}{post.content.length > 150 ? '...' : ''}</p>
                    <div className="discuss-user-post-meta">
                      <span>{formatTimeAgo(post.timestamp)}</span>
                      <span>•</span>
                      <span>{post.comments} comments</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discuss;

