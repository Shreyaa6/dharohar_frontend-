const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  signup: async (username, email, password) => {
    const response = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  login: async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  verify: async () => {
    return await apiRequest('/auth/verify');
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Helper function for image uploads
const uploadImageFile = async (file) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Please log in to upload images');
  }
  
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch(`${API_BASE_URL}/upload/image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type - let browser set it with boundary for FormData
    },
    body: formData
  });
  
  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    if (response.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Upload failed');
  }
  
  return data;
};

// Helper function for video uploads
const uploadVideoFile = async (file) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Please log in to upload videos');
  }
  
  const formData = new FormData();
  formData.append('video', file);
  
  const response = await fetch(`${API_BASE_URL}/upload/video`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type - let browser set it with boundary for FormData
    },
    body: formData
  });
  
  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    if (response.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Upload failed');
  }
  
  return data;
};

// Posts API functions
export const postsAPI = {
  getAll: async (search = '', tags = 'all') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tags && tags !== 'all') {
      if (Array.isArray(tags)) {
        tags.forEach(tag => params.append('tags', tag));
      } else {
        params.append('tags', tags);
      }
    }
    
    const queryString = params.toString();
    const endpoint = `/posts${queryString ? `?${queryString}` : ''}`;
    return await apiRequest(endpoint);
  },

  getById: async (id) => {
    return await apiRequest(`/posts/${id}`);
  },

  create: async (content, tags = [], mediaType = 'text', imageUrl = '', videoUrl = '') => {
    return await apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify({ content, tags, mediaType, imageUrl, videoUrl }),
    });
  },

  uploadImage: async (file) => {
    return await uploadImageFile(file);
  },

  uploadVideo: async (file) => {
    return await uploadVideoFile(file);
  },
};

// Comments API functions
export const commentsAPI = {
  getByPostId: async (postId) => {
    return await apiRequest(`/posts/${postId}/comments`);
  },

  create: async (postId, content) => {
    return await apiRequest(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
};

// User API functions
export const userAPI = {
  getProfile: async () => {
    return await apiRequest('/user/profile');
  },

  updateProfile: async (data) => {
    return await apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  uploadProfilePhoto: async (file) => {
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await fetch(`${API_BASE_URL}/upload/profile-photo`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }
    
    return data;
  },

  getMyPosts: async () => {
    return await apiRequest('/user/posts');
  },
};

// Update postsAPI to include delete
postsAPI.delete = async (postId) => {
  return await apiRequest(`/posts/${postId}`, {
    method: 'DELETE',
  });
};

export default authAPI;

