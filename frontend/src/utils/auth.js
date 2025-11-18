export async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return null;

  try {
    const res = await fetch("https://nextstop-app-u9cvd.ondigitalocean.app/api/usuarios/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh })
    });

    if (!res.ok) {
      console.warn("No se pudo refrescar el token.");
      return null;
    }

    const data = await res.json();
    localStorage.setItem("access_token", data.access);
    return data.access;

  } catch (err) {
    console.error("Error refrescando token:", err);
    return null;
  }
}