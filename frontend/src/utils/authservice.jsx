const ACCESS_TOKEN_KEY = "app.auth.access";
const REFRESH_TOKEN_KEY = "app.auth.refresh";
const BASE_URL = "http://127.0.0.1:8000"; 

export const AuthService = {
  // Token Storage
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token) => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  
  // Token Removal
  clearTokens: () => {
    //console.warn("Limpiando tokens");
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // Authentication Status
  isAuthenticated: () => !!localStorage.getItem(ACCESS_TOKEN_KEY),

  // Token Refresh
  fetchWithAuth: async (url, options = {}) => {
    let token = localStorage.getItem(ACCESS_TOKEN_KEY);
    
    const headers = {
      ...options.headers,
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Peticion original
    let response = await fetch(url, { ...options, headers });

    // falla por token expirado
    if (response.status === 401) {
      console.log("Token expirado (401). Intentando refrescar...");
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        console.error("No hay refresh token disponible. Logout forzado.");
        AuthService.clearTokens();
        window.location.href = "/";
        return response;
      }

      try {
        const refreshResponse = await fetch(`${BASE_URL}/api/token/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          console.log("Respuesta de refresco exitosa:", data);

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