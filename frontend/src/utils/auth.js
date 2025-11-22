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
}

/* ---------------------------------------------------------
   🔄 REFRESCAR ACCESS TOKEN SI ES NECESARIO
--------------------------------------------------------- */
export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_URL}/token/refresh/`,{
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh })
    });

    if (!res.ok) {
      console.warn("No se pudo refrescar el token.");
      logout();
      return null;
    }

    const data = await res.json();
    saveTokens(data.access, refresh);
    return data.access;

  } catch (err) {
    console.error("Error refrescando token:", err);
    return null;
  }
}

/* ---------------------------------------------------------
   🛡 VALIDAR ACCESS TOKEN CON EL BACKEND
--------------------------------------------------------- */
export async function validateToken() {
  const token = getAccessToken();
  if (!token) return false;

  try {
    const res = await fetch(`${API_URL}/validar-token/`, {
      method: "GET",
      headers: {
        "Authorization":`Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });

    if (!res.ok) return false;

    const data = await res.json();
    return data.usuario;

  } catch (err) {
    console.error("Error validando token:", err);
    return false;
  }
}

/* ---------------------------------------------------------
   🧾 HEADERS AUTOMÁTICOS PARA PETICIONES PROTEGIDAS
--------------------------------------------------------- */
export async function getAuthHeaders() {
  let token = getAccessToken();

  const payload = JSON.parse(atob(token.split(".")[1]));
  const expiration = payload.exp * 1000;

  if (Date.now() >= expiration) {
    token = await refreshAccessToken();
    if (!token) return null;
  }

  return {
    "Authorization":`Bearer ${token}`,
    "Content-Type": "application/json"
  };
}