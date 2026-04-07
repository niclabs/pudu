/** * AuthService  
 * @description Manages authentication tokens and making authenticated requests.
 *
 * Checks authentication status, makes API requests that automatically handle token refresh when the access token expires.
 * It uses localStorage to persist tokens across sessions and provides functions to set, get, and clear tokens.
 *
 * @module AuthService
 */

const ACCESS_TOKEN_KEY = "app.auth.access";
const REFRESH_TOKEN_KEY = "app.auth.refresh";
// Base URL for API requests (this could be an environment variable in a future)
const BASE_URL = "http://127.0.0.1:8000"; 

export const AuthService = {
  // Token Storage (Token Getters and Setters)
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token) => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  
  // Token Removal at logout
  clearTokens: () => {
    //console.warn("Limpiando tokens");
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // Authentication Status
  isAuthenticated: () => !!localStorage.getItem(ACCESS_TOKEN_KEY),

  // Token Refresh
  /**
   * Makes an HTTP request automatically injecting the authorization token.
   * If the request fails due to an expired token (Error 401), it attempts to renew the access token 
   * using the refresh token and retries the original request.
   * @async
   */
  fetchWithAuth: async (url, options = {}) => {
    let token = localStorage.getItem(ACCESS_TOKEN_KEY);
    
    const headers = {
      ...options.headers,
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Original request
    let response = await fetch(url, { ...options, headers });

    // Fail due to expired token
    if (response.status === 401) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        console.error("No hay refresh token disponible. Logout forzado.");
        AuthService.clearTokens();
        window.location.href = "/";
        return response;
      }

      try {
        // Request to Django Simple JWT 
        const refreshResponse = await fetch(`${BASE_URL}/api/token/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();

          if (data.access) {
            AuthService.setAccessToken(data.access);
            headers["Authorization"] = `Bearer ${data.access}`;
            response = await fetch(url, { ...options, headers });
            
            if (data.refresh) {
                AuthService.setRefreshToken(data.refresh);
            }
          } else {
             console.error("La respuesta de refresco no traía 'access'. Estructura recibida:", data);
          }
        } else {
          console.error("Falló el refresco del token.", refreshResponse.status);
          AuthService.clearTokens();
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Error de red al refrescar token:", error);
        AuthService.clearTokens();
        window.location.href = "/";
      }
    }

    return response;
  }
};