/* src/utils/auth.js */

const API_URL = "https://nextstop-app-u9cvd.ondigitalocean.app/api/usuarios";

export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

export function saveTokens(access, refresh) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("usuario");
  // Opcional: Si quieres forzar la recarga para limpiar estados de React
  // window.location.reload(); 
}

/* ---------------------------------------------------------
   🔄 REFRESCAR ACCESS TOKEN SI ES NECESARIO
--------------------------------------------------------- */
export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh })
    });

    if (!res.ok) {
      console.warn("El refresh token también expiró. Cerrando sesión...");
      logout();
      return null;
    }

    const data = await res.json();
    // Guardamos el nuevo access token (y el refresh si el backend lo rota)
    saveTokens(data.access, data.refresh || refresh);
    return data.access;

  } catch (err) {
    console.error("Error intentando refrescar token:", err);
    return null;
  }
}

/* ---------------------------------------------------------
   🛡 VALIDAR TOKEN (VERSIÓN MEJORADA 🌟)
   Revisa la fecha localmente antes de preguntar al backend.
--------------------------------------------------------- */
export async function validateToken() {
  let token = getAccessToken();
  if (!token) return false;

  // 1. CHEQUEO LOCAL DE EXPIRACIÓN
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiration = payload.exp * 1000; // Convertir a milisegundos

    // Si ya expiró o le faltan menos de 10 segundos para expirar
    if (Date.now() >= expiration - 10000) {
      console.log("⚠ Token expirado o por expirar. Intentando auto-renovación...");
      token = await refreshAccessToken();

      // Si falló la renovación, la sesión murió.
      if (!token) {
        return false;
      }
    }
  } catch (e) {
    console.error("Error al analizar fecha del token:", e);
    return false;
  }

  // 2. VALIDACIÓN CON EL BACKEND (Con token fresco)
  try {
    const res = await fetch(`${API_URL}/validar-token/`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });

    if (!res.ok) return false;

    const data = await res.json();
    return data.usuario;

  } catch (err) {
    console.error("Error de conexión validando token:", err);
    return false;
  }
}

/* ---------------------------------------------------------
   🧾 HEADERS AUTOMÁTICOS
--------------------------------------------------------- */
export async function getAuthHeaders() {
  let token = getAccessToken();

  if (!token) {
    console.warn("No se encontró token en getAuthHeaders");
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiration = payload.exp * 1000;

    // Si venció, lo refrescamos al vuelo
    if (Date.now() >= expiration) {
      token = await refreshAccessToken();
      if (!token) return null;
    }

    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  } catch (error) {
    console.error("Error procesando el token:", error);
    return null;
  }
}