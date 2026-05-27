// ── src/services/api.js ──────────────────────────────────────────────────────
// Servicio centralizado para todas las llamadas al backend.
// Antes: const API = "http://localhost:3000/api" estaba copiado en 3 archivos.
// Ahora: se define una vez aquí y se importa desde cualquier componente.
//
// En producción, crea un archivo .env en lafama-frontend/ con:
//   VITE_API_URL=https://tu-dominio.com/api
// Y en tu hosting agrega la variable de entorno.
// ─────────────────────────────────────────────────────────────────────────────

export const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ── Helpers de token ──────────────────────────────────────────────────────────

/** Token del cliente normal */
export const getToken = () => localStorage.getItem("token");

/** Token del admin */
export const getAdminToken = () => localStorage.getItem("admin_token");

/** Token del barbero */
export const getBarberToken = () => localStorage.getItem("barber_token");

// ── Fetch genérico ────────────────────────────────────────────────────────────

/**
 * Wrapper sobre fetch que adjunta el token de autorización automáticamente.
 *
 * @param {string} path     - Ruta relativa, ej: "/citas"
 * @param {object} options  - Opciones de fetch (method, body, etc.)
 * @param {string} tokenKey - Qué token usar: "token" | "admin_token" | "barber_token"
 */
export const apiFetch = async (path, options = {}, tokenKey = "token") => {
  const token = localStorage.getItem(tokenKey);
  const res = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

/**
 * apiFetch especializado para el panel Admin.
 * Expulsa la sesión automáticamente si el token expira (401).
 */
export const apiFetchAdmin = async (path, options = {}) => {
  const token = getAdminToken();
  const res = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  const data = await res.json();

  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    window.location.reload();
  }

  if (!res.ok) throw data;
  return data;
};

/**
 * apiFetch especializado para la vista del Barbero.
 */
export const apiFetchBarber = async (path, options = {}) => {
  const token = getBarberToken();
  const res = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

/**
 * Construye la URL completa de una imagen del backend.
 * Si la ruta ya es absoluta (http/https) la devuelve sin cambios.
 *
 * @param {string} imgPath - Ruta como "/uploads/foto.jpg" o una URL completa
 * @returns {string}
 */
export const getImageUrl = (imgPath) => {
  if (!imgPath) return "";
  if (imgPath.startsWith("http")) return imgPath;
  // En desarrollo apunta a localhost; en producción usa la misma base
  const base = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace("/api", "")
    : "http://localhost:3000";
  return `${base}${imgPath}`;
};
