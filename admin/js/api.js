/* 
================================================================
SARAH YASEEN PORTFOLIO - ADMIN API CLIENT ENGINE
================================================================
Manages all requests from the Admin Panel to the Express backend.
Handles JWT token storage and authenticated request headers.
================================================================
*/

const API_BASE = window.location.origin.startsWith('http') ? window.location.origin : 'http://localhost:8080';
const TOKEN_KEY = 'sarah_portfolio_admin_token';

const AdminAPI = {
  // --- AUTH UTILS ---
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  // Dynamic request handler with auto auth injection
  async _request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    // Setup Headers
    const headers = options.headers || {};
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      
      // Auto logout on token expiration / unauthorized error
      if (response.status === 401 || response.status === 403) {
        this.clearToken();
        // Redirect to admin main route to prompt login if not already on it
        if (!window.location.pathname.endsWith('/admin')) {
          window.location.href = '/admin';
        }
        throw new Error('Your session has expired. Please log in again.');
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Server request failed');
        }
        return data;
      } else {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(text || 'Server request failed');
        }
        return text;
      }
    } catch (err) {
      console.error(`API Call failed to ${endpoint}:`, err);
      throw err;
    }
  },

  // --- AUTH SERVICES ---
  async login(email, password) {
    const result = await this._request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (result && result.token) {
      this.setToken(result.token);
    }
    return result;
  },

  async verifyToken() {
    return this._request('/api/auth/verify', { method: 'GET' });
  },

  async updatePassword(oldPassword, newPassword) {
    return this._request('/api/auth/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword })
    });
  },

  // --- HOME CONTENT ---
  async getHomeContent() {
    return this._request('/api/content/home', { method: 'GET' });
  },

  async updateHomeContent(data) {
    return this._request('/api/content/home', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  // --- PROJECT SERVICES (WORDPRESS & UI/UX) ---
  async getProjects(category = '') {
    const query = category ? `?category=${category}` : '';
    return this._request(`/api/projects${query}`, { method: 'GET' });
  },

  async createProject(projectData) {
    return this._request('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
  },

  async updateProject(id, projectData) {
    return this._request(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
  },

  async deleteProject(id) {
    return this._request(`/api/projects/${id}`, { method: 'DELETE' });
  },

  async reorderProjects(orderList) {
    return this._request('/api/projects/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderList })
    });
  },

  // --- GALLERY SERVICES (GRAPHIC-DESIGN & ETSY) ---
  async getGallery(category = '') {
    const query = category ? `?category=${category}` : '';
    return this._request(`/api/gallery${query}`, { method: 'GET' });
  },

  async createGalleryItem(itemData) {
    return this._request('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
  },

  async uploadBulkGallery(formData) {
    // Note: Do not set Content-Type header when sending FormData; Multer needs boundary markers.
    return this._request('/api/gallery/bulk', {
      method: 'POST',
      body: formData
    });
  },

  async deleteGalleryItem(id) {
    return this._request(`/api/gallery/${id}`, { method: 'DELETE' });
  },

  async updateGalleryItem(id, itemData) {
    return this._request(`/api/gallery/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
  },

  async reorderGallery(orderList) {
    return this._request('/api/gallery/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderList })
    });
  },

  // --- PAGE INTROS ---
  async getIntros() {
    return this._request('/api/intros', { method: 'GET' });
  },

  async updateIntros(data) {
    return this._request('/api/intros', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  // --- MESSAGES SERVICES (INBOX) ---
  async getMessages() {
    return this._request('/api/messages', { method: 'GET' });
  },

  async markMessageRead(id, isRead) {
    return this._request(`/api/messages/${id}/read`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_read: isRead })
    });
  },

  async deleteMessage(id) {
    return this._request(`/api/messages/${id}`, { method: 'DELETE' });
  },

  // --- SITE SETTINGS ---
  async getSettings() {
    return this._request('/api/settings', { method: 'GET' });
  },

  async updateSettings(data) {
    return this._request('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  // --- FILE UPLOAD SERVICE ---
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    return this._request('/api/upload', {
      method: 'POST',
      body: formData
    });
  }
};

window.AdminAPI = AdminAPI;
