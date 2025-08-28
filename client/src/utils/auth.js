// Token management utilities
const TOKEN_KEY = "income_expenses_token";
const USER_KEY = "income_expenses_user";

export const authService = {
  // Store token and user data
  setAuth(userData) {
    if (userData.token) {
      localStorage.setItem(TOKEN_KEY, userData.token);
    }
    if (userData.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData.user));
    }
  },

  // Get stored token
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get stored user data
  getUser() {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  // Clear auth data
  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Basic JWT expiration check (optional)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  },

  // Make authenticated API request
  async authenticatedFetch(url, options = {}) {
    const token = this.getToken();

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle token expiration
    if (response.status === 401) {
      this.clearAuth();
      window.location.href = "/";
      throw new Error("Session expired. Please login again.");
    }

    return response;
  },
};
