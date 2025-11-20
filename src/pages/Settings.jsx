import React, { useState, useEffect, useMemo, useRef } from 'react';
import './Settings.css';
import Navbar from '../components/NavBar';
import { authAPI, userAPI, postsAPI } from '../services/api';

const FilterDropdown = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`settings-dropdown ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
      <button
        className="settings-dropdown-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        <div className="settings-dropdown-trigger-text">
          <span className="settings-dropdown-label">{label}</span>
          <span className="settings-dropdown-value">{selectedOption?.label}</span>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div className="settings-dropdown-menu">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`settings-dropdown-item ${option.value === value ? 'active' : ''}`}
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
          >
            {option.icon && <span className="settings-dropdown-icon">{option.icon}</span>}
            <div className="settings-dropdown-item-text">
              <span className="settings-dropdown-item-label">{option.label}</span>
              {option.description && (
                <span className="settings-dropdown-item-desc">{option.description}</span>
              )}
            </div>
            {option.badge && <span className="settings-dropdown-badge">{option.badge}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

const sortOptions = [
  {
    value: 'newest',
    label: 'Newest first',
    description: 'Latest to oldest',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 3 3 9 9 9" />
        <path d="M21 21v-6h-6" />
        <path d="M3 21 21 3" />
      </svg>
    ),
  },
  {
    value: 'oldest',
    label: 'Oldest first',
    description: 'Start from the beginning',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="21 21 21 15 15 15" />
        <path d="M3 3v6h6" />
        <path d="M3 21 21 3" />
      </svg>
    ),
  },
];

const typeOptions = [
  {
    value: 'all',
    label: 'All types',
    description: 'Show every post',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    value: 'text',
    label: 'Text only',
    description: 'No media attached',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="12" x2="14" y2="12" />
        <line x1="4" y1="18" x2="12" y2="18" />
      </svg>
    ),
  },
  {
    value: 'photo',
    label: 'Photo posts',
    description: 'Images and galleries',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-4-4-3 3-4-4-4 4" />
      </svg>
    ),
  },
  {
    value: 'video',
    label: 'Video posts',
    description: 'Clips and recordings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="5" width="15" height="14" rx="2" />
        <polygon points="15 12 9 16 9 8 15 12" />
        <line x1="21" y1="7" x2="21" y2="17" />
      </svg>
    ),
  },
];

const Settings = ({ activeTab, setActiveTab }) => {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Profile editing
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  
  // Post management
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [postSort, setPostSort] = useState('newest');
  const [postTypeFilter, setPostTypeFilter] = useState('all');
  const [postCategoryFilter, setPostCategoryFilter] = useState('all');

  // Preferences
  const [preferences, setPreferences] = useState({
    emailUpdates: true,
    pushAlerts: false,
    privateProfile: false,
    showOnlineStatus: true,
    autoplayVideos: true,
  });
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  const postCategories = useMemo(() => {
    const categories = new Set();
    let hasUntagged = false;

    userPosts.forEach((post) => {
      if (Array.isArray(post.tags) && post.tags.length > 0) {
        post.tags.forEach((tag) => {
          if (typeof tag === 'string') {
            const normalized = tag.trim();
            if (normalized) {
              categories.add(normalized);
            }
          }
        });
      } else {
        hasUntagged = true;
      }
    });

    const ordered = ['all', ...Array.from(categories).sort((a, b) => a.localeCompare(b))];
    if (hasUntagged) {
      ordered.push('untagged');
    }
    return ordered;
  }, [userPosts]);

  const categoryOptions = useMemo(
    () =>
      postCategories.map((category) => {
        const isAll = category === 'all';
        const isUntagged = category === 'untagged';
        return {
          value: category,
          label: isAll ? 'All categories' : isUntagged ? 'No tags' : category,
          description: isAll
            ? 'Everything included'
            : isUntagged
            ? 'Posts without tags'
            : 'Filter by this tag',
          badge: isUntagged ? 'New' : null,
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 7 9 18l-5-5 11-11h5v5Z" />
            </svg>
          ),
        };
      }),
    [postCategories]
  );

  useEffect(() => {
    loadUserData();
    loadUserPosts();

    const storedPrefs = localStorage.getItem('heritage-settings-preferences');
    if (storedPrefs) {
      try {
        const parsed = JSON.parse(storedPrefs);
        setPreferences((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.warn('Failed to parse preferences', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('heritage-settings-preferences', JSON.stringify(preferences));
  }, [preferences]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await userAPI.getProfile();
      setUser(userData);
      setNewUsername(userData.username);
      if (userData.profilePhoto) {
        const photoUrl = userData.profilePhoto.startsWith('http') 
          ? userData.profilePhoto 
          : `http://localhost:3001${userData.profilePhoto}`;
        setProfilePhotoPreview(photoUrl);
      } else {
        setProfilePhotoPreview(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPosts = async () => {
    try {
      const posts = await userAPI.getMyPosts();
      setUserPosts(posts);
    } catch (err) {
      console.error('Failed to load posts:', err);
    }
  };

  const handleUpdateUsername = async () => {
    try {
      if (!newUsername.trim()) {
        setError('Username cannot be empty');
        return;
      }
      
      const updatedUser = await userAPI.updateProfile({ username: newUsername.trim() });
      setUser(updatedUser);
      setEditingUsername(false);
      setSuccess('Username updated successfully');
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.username = updatedUser.username;
      if (updatedUser.profilePhoto) {
        storedUser.profilePhoto = updatedUser.profilePhoto;
      }
      localStorage.setItem('user', JSON.stringify(storedUser));
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update username');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Profile photo must be less than 2MB');
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoFile(file);
        setProfilePhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProfilePhoto = async () => {
    try {
      if (!profilePhotoFile) {
        setError('Please select a photo');
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      const result = await userAPI.uploadProfilePhoto(profilePhotoFile);
      const updatedUser = await userAPI.getProfile();
      setUser(updatedUser);
      setProfilePhotoFile(null);
      
      // Update preview with new photo URL
      if (updatedUser.profilePhoto) {
        const photoUrl = updatedUser.profilePhoto.startsWith('http') 
          ? updatedUser.profilePhoto 
          : `http://localhost:3001${updatedUser.profilePhoto}`;
        setProfilePhotoPreview(photoUrl);
      }
      
      setSuccess('Profile photo updated successfully');
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.profilePhoto = updatedUser.profilePhoto;
      localStorage.setItem('user', JSON.stringify(storedUser));
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to upload profile photo');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteProfilePhoto = async () => {
    try {
      await userAPI.updateProfile({ profilePhoto: null });
      const updatedUser = await userAPI.getProfile();
      setUser(updatedUser);
      setProfilePhotoFile(null);
      setProfilePhotoPreview(null);

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      delete storedUser.profilePhoto;
      localStorage.setItem('user', JSON.stringify(storedUser));

      setSuccess('Profile photo removed');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to remove profile photo');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await postsAPI.delete(postId);
      setUserPosts(userPosts.filter(post => post.id !== postId));
      setShowDeleteConfirm(null);
      setSuccess('Post deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete post');
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handlePreferenceToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePreferences = () => {
    setIsSavingPreferences(true);
    setTimeout(() => {
      setIsSavingPreferences(false);
      setSuccess('Preferences saved');
      setTimeout(() => setSuccess(null), 3000);
    }, 600);
  };

  const filteredPosts = [...userPosts]
    .filter((post) => {
      if (postTypeFilter === 'all') return true;
      if (postTypeFilter === 'text') {
        return post.mediaType === 'text' || (!post.mediaType && !post.imageUrl && !post.videoUrl);
      }
      if (postTypeFilter === 'photo') {
        return post.mediaType === 'image' || (!!post.imageUrl && !post.videoUrl);
      }
      if (postTypeFilter === 'video') {
        return post.mediaType === 'video' || (!!post.videoUrl && !post.imageUrl);
      }
      return true;
    })
    .filter((post) => {
      if (postCategoryFilter === 'all') return true;
      if (postCategoryFilter === 'untagged') {
        return !post.tags || post.tags.length === 0;
      }
      const tags = Array.isArray(post.tags)
        ? post.tags
            .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
            .filter(Boolean)
        : [];
      return tags.includes(postCategoryFilter);
    })
    .sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return postSort === 'newest' ? timeB - timeA : timeA - timeB;
    });

  const handleLogout = () => {
    try {
      authAPI.logout();
      localStorage.removeItem('heritage-settings-preferences');
      setSuccess('You have been logged out');
      setTimeout(() => {
        window.location.href = '/';
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to log out');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="settings-page">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="settings-loading">
          <div className="settings-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Manage your profile and posts</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="settings-message settings-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="settings-message settings-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Profile Section */}
        <section className="settings-section settings-section-profile">
          <div className="settings-profile-card">
            <div className="settings-profile-avatar-block">
              <div className="settings-photo-container">
                {profilePhotoPreview ? (
                  <div className="settings-photo-preview">
                    <img src={profilePhotoPreview} alt="Profile" />
                    <button
                      className="settings-photo-remove"
                      onClick={() => {
                        setProfilePhotoFile(null);
                        if (user?.profilePhoto) {
                          const photoUrl = user.profilePhoto.startsWith('http')
                            ? user.profilePhoto
                            : `http://localhost:3001${user.profilePhoto}`;
                          setProfilePhotoPreview(photoUrl);
                        } else {
                          setProfilePhotoPreview(null);
                        }
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="settings-photo-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  id="profile-photo-upload"
                  style={{ display: 'none' }}
                  onChange={handleProfilePhotoChange}
                />
                <div className="settings-photo-actions">
                  <button
                    className="settings-photo-upload-btn"
                    onClick={() => document.getElementById('profile-photo-upload').click()}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Choose Photo
                  </button>
                  {profilePhotoFile && (
                    <button
                      className="settings-photo-save-btn"
                      onClick={handleUploadProfilePhoto}
                    >
                      Save Photo
                    </button>
                  )}
                  {(profilePhotoPreview || user?.profilePhoto) && (
                    <button
                      className="settings-photo-delete-btn"
                      onClick={handleDeleteProfilePhoto}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
              <div className="settings-profile-meta">
                <p className="settings-profile-name">@{user?.username}</p>
                <p className="settings-profile-tagline">Make it yours — update your info anytime.</p>
                <div className="settings-profile-stats">
                  <div>
                    <span className="settings-profile-stat-value">{userPosts.length}</span>
                    <span className="settings-profile-stat-label">Posts</span>
                  </div>
                  <div>
                    <span className="settings-profile-stat-value">
                      {filteredPosts.reduce((acc, post) => acc + (post.comments || 0), 0)}
                    </span>
                    <span className="settings-profile-stat-label">Comments</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="settings-profile-details">
              <div className="settings-username-section">
                <label className="settings-label">Username</label>
                {editingUsername ? (
                  <div className="settings-username-edit">
                    <input
                      type="text"
                      className="settings-input"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateUsername();
                        } else if (e.key === 'Escape') {
                          setEditingUsername(false);
                          setNewUsername(user?.username || '');
                        }
                      }}
                      autoFocus
                    />
                    <div className="settings-username-actions">
                      <button
                        className="settings-btn settings-btn-primary"
                        onClick={handleUpdateUsername}
                      >
                        Save
                      </button>
                      <button
                        className="settings-btn settings-btn-secondary"
                        onClick={() => {
                          setEditingUsername(false);
                          setNewUsername(user?.username || '');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="settings-username-display">
                    <span className="settings-username-value">@{user?.username}</span>
                    <button
                      className="settings-btn settings-btn-secondary"
                      onClick={() => setEditingUsername(true)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>
                  </div>
                )}
              </div>

              <div className="settings-email-section">
                <label className="settings-label">Email</label>
                <div className="settings-email-display">
                  <span className="settings-email-value">{user?.email}</span>
                  <span className="settings-email-note">Email cannot be changed</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Section */}
        <section className="settings-section">
          <h2 className="settings-section-title">Account</h2>
          <div className="settings-account-card">
            <div className="settings-account-info">
              <p>Sign out</p>
              <span>Log out of this device and clear your session.</span>
            </div>
            <button className="settings-btn settings-btn-danger settings-logout-btn" onClick={handleLogout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="settings-section">
          <h2 className="settings-section-title">Preferences</h2>
          <div className="settings-preferences-grid">
            <div className="settings-preference-card">
              <div>
                <p>Product updates</p>
                <span>Get release notes in your inbox</span>
              </div>
              <label className={`settings-toggle ${preferences.emailUpdates ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={preferences.emailUpdates}
                  onChange={() => handlePreferenceToggle('emailUpdates')}
                />
                <span></span>
              </label>
            </div>
            <div className="settings-preference-card">
              <div>
                <p>Push alerts</p>
                <span>Ping me when someone replies</span>
              </div>
              <label className={`settings-toggle ${preferences.pushAlerts ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={preferences.pushAlerts}
                  onChange={() => handlePreferenceToggle('pushAlerts')}
                />
                <span></span>
              </label>
            </div>
            <div className="settings-preference-card">
              <div>
                <p>Private profile</p>
                <span>Only followers can view your posts</span>
              </div>
              <label className={`settings-toggle ${preferences.privateProfile ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={preferences.privateProfile}
                  onChange={() => handlePreferenceToggle('privateProfile')}
                />
                <span></span>
              </label>
            </div>
            <div className="settings-preference-card">
              <div>
                <p>Online status</p>
                <span>Show when you were last seen</span>
              </div>
              <label className={`settings-toggle ${preferences.showOnlineStatus ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={preferences.showOnlineStatus}
                  onChange={() => handlePreferenceToggle('showOnlineStatus')}
                />
                <span></span>
              </label>
            </div>
            <div className="settings-preference-card">
              <div>
                <p>Autoplay videos</p>
                <span>Play clips automatically in posts</span>
              </div>
              <label className={`settings-toggle ${preferences.autoplayVideos ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={preferences.autoplayVideos}
                  onChange={() => handlePreferenceToggle('autoplayVideos')}
                />
                <span></span>
              </label>
            </div>
          </div>
          <div className="settings-preference-cta">
            <button
              className="settings-btn settings-btn-primary"
              onClick={handleSavePreferences}
              disabled={isSavingPreferences}
            >
              {isSavingPreferences ? 'Saving...' : 'Save preferences'}
            </button>
            <span>Preferences are stored on this device</span>
          </div>
        </section>

        {/* My Posts Section */}
        <section className="settings-section">
          <div className="settings-section-heading">
            <h2 className="settings-section-title">My Posts ({filteredPosts.length})</h2>
            <div className="settings-post-filters">
              <FilterDropdown
                label="Sort"
                value={postSort}
                options={sortOptions}
                onChange={setPostSort}
              />
              <FilterDropdown
                label="Type"
                value={postTypeFilter}
                options={typeOptions}
                onChange={setPostTypeFilter}
              />
              <FilterDropdown
                label="Category"
                value={postCategoryFilter}
                options={categoryOptions}
                onChange={setPostCategoryFilter}
              />
            </div>
          </div>
          
          {filteredPosts.length === 0 ? (
            <div className="settings-empty">
              <p>No posts found for this filter.</p>
              <button
                className="settings-btn settings-btn-primary"
                onClick={() => setActiveTab('discuss')}
              >
                Create a Post
              </button>
            </div>
          ) : (
            <div className="settings-posts-grid">
              {filteredPosts.map((post) => (
                <article key={post.id} className="settings-post-card">
                  <div className="settings-post-header">
                    <div className="settings-post-meta">
                      <span className="settings-post-time">{formatTimeAgo(post.timestamp)}</span>
                      <span className="settings-post-comments">
                        {post.comments} {post.comments === 1 ? 'comment' : 'comments'}
                      </span>
                    </div>
                    <div className="settings-post-actions">
                      <button
                        className="settings-post-action-btn"
                        onClick={() => setSelectedPost(post)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        View
                      </button>
                      <button
                        className="settings-post-action-btn settings-post-delete"
                        onClick={() => setShowDeleteConfirm(post.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="settings-post-content">
                    <p className="settings-post-text">{post.content}</p>
                    
                    {post.mediaType === 'image' && post.imageUrl && (
                      <div className="settings-post-media">
                        <img src={post.imageUrl} alt="Post" />
                      </div>
                    )}
                    
                    {post.mediaType === 'video' && post.videoUrl && (
                      <div className="settings-post-media">
                        <video controls>
                          <source src={post.videoUrl} type="video/mp4" />
                        </video>
                      </div>
                    )}
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="settings-post-tags">
                        {post.tags.map((tag, idx) => (
                          <span key={idx} className="settings-post-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="settings-modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <button className="settings-modal-close" onClick={() => setSelectedPost(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            
            <div className="settings-modal-header">
              <h3>Post Details</h3>
              <span className="settings-modal-time">{formatTimeAgo(selectedPost.timestamp)}</span>
            </div>
            
            <div className="settings-modal-content">
              <p>{selectedPost.content}</p>
              
              {selectedPost.mediaType === 'image' && selectedPost.imageUrl && (
                <div className="settings-modal-media">
                  <img src={selectedPost.imageUrl} alt="Post" />
                </div>
              )}
              
              {selectedPost.mediaType === 'video' && selectedPost.videoUrl && (
                <div className="settings-modal-media">
                  <video controls>
                    <source src={selectedPost.videoUrl} type="video/mp4" />
                  </video>
                </div>
              )}
              
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="settings-modal-tags">
                  {selectedPost.tags.map((tag, idx) => (
                    <span key={idx} className="settings-modal-tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="settings-modal-footer">
              <button
                className="settings-btn settings-btn-secondary"
                onClick={() => setSelectedPost(null)}
              >
                Close
              </button>
              <button
                className="settings-btn settings-btn-danger"
                onClick={() => {
                  setShowDeleteConfirm(selectedPost.id);
                  setSelectedPost(null);
                }}
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="settings-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="settings-modal settings-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h3>Delete Post</h3>
            </div>
            
            <div className="settings-modal-content">
              <p>Are you sure you want to delete this post? This action cannot be undone.</p>
            </div>
            
            <div className="settings-modal-footer">
              <button
                className="settings-btn settings-btn-secondary"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="settings-btn settings-btn-danger"
                onClick={() => handleDeletePost(showDeleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

