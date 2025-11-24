import axios from "axios";
import { getAccessToken, getRefreshToken, saveTokens, logout } from "./utils/auth";

const API = axios.create({
  baseURL: "https://nextstop-app-u9cvd.ondigitalocean.app/api/",
});

// 🔹 INTERCEPTOR DE PETICIÓN: Agregar token automáticamente
API.interceptors.request.use(
  async (config) => {
    let token = getAccessToken();

    if (token) {
      try {
        // Verificar si el token está por expirar
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiration = payload.exp * 1000;

        // Si expira en menos de 10 segundos, renovarlo
        if (Date.now() >= expiration - 10000) {
          console.log("⚠️ Token expirando, renovando automáticamente...");
          const newToken = await refreshToken();
          if (newToken) {
            token = newToken;
          } else {
            console.warn("❌ No se pudo renovar el token");
            logout();
            window.location.href = "/";
            return Promise.reject(new Error("Token expirado"));
          }
        }

        // Agregar el token a los headers
        config.headers["Authorization"] = `Bearer ${token}`;
      } catch (error) {
        console.error("Error procesando token:", error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔹 INTERCEPTOR DE RESPUESTA: Manejar errores 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es 401 y no hemos reintentado aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("🔄 Detectado 401, intentando renovar token...");
        const newToken = await refreshToken();

        if (newToken) {
          // Actualizar el header de la petición original
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          // Reintentar la petición original
          return API(originalRequest);
        } else {
          console.warn("❌ No se pudo renovar el token, cerrando sesión");
          logout();
          window.location.href = "/";
        }
      } catch (refreshError) {
        console.error("Error renovando token:", refreshError);
        logout();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// 🔹 FUNCIÓN PARA RENOVAR TOKEN
async function refreshToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await axios.post(
      "https://nextstop-app-u9cvd.ondigitalocean.app/api/usuarios/token/refresh/",
      { refresh },
      { headers: { "Content-Type": "application/json" } }
    );

    if (res.data.access) {
      saveTokens(res.data.access, res.data.refresh || refresh);
      return res.data.access;
    }

    return null;
  } catch (error) {
    console.error("Error refrescando token:", error);
    return null;
  }
}

export default API;