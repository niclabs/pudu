const ACCESS_TOKEN_KEY = "app.auth.access";
const REFRESH_TOKEN_KEY = "app.auth.refresh";

export const AuthService = {
  // Token Storage
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token) => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  
  // Token Removal
  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // Authentication Status
  isAuthenticated: () => !!localStorage.getItem(ACCESS_TOKEN_KEY)
};