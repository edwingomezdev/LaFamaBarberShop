import { useState, useEffect } from "react";

const API = "http://localhost:3000/api";
/* const getToken = () => localStorage.getItem("token"); */
const getToken = () => localStorage.getItem("admin_token");

const apiFetch = async (path, options = {}) => {
  const token = getToken();
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

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;500;600;700&family=Barlow:wght@300;400;500&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --rojo: #c0392b;
    --rojo-vivo: #e74c3c;
    --negro: #080808;
    --negro2: #111111;
    --negro3: #1a1a1a;
    --negro4: #222222;
    --blanco: #f0ece4;
    --gris: #666;
    --gris2: #444;
    --oro: #d4a843;
    --verde: #27ae60;
    --azul: #2980b9;
  }

  body { background: var(--negro); color: var(--blanco); font-family: 'Barlow', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--negro2); }
  ::-webkit-scrollbar-thumb { background: var(--rojo); }

  /* LAYOUT */
  .admin-layout { display: flex; min-height: 100vh; }

  /* SIDEBAR */
/*   .sidebar {
    width: 260px;
    background: var(--negro2);
    border-right: 1px solid rgba(192,57,43,0.15);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 50;
  } */

    .sidebar {
    width: 260px;
    background: var(--negro2);
    border-right: 1px solid rgba(192,57,43,0.15);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 50;
    overflow-y: auto;
  }

  .sidebar-logo {
    padding: 28px 24px;
    border-bottom: 1px solid rgba(192,57,43,0.15);
  }

  .sidebar-logo-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 3px;
  }

  .sidebar-logo-text span { color: var(--rojo); }

  .sidebar-tag {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--rojo);
    margin-top: 4px;
  }

  .sidebar-nav { flex: 1; padding: 20px 0; }

  .sidebar-section {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--gris);
    padding: 16px 24px 8px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 24px;
    cursor: pointer;
    transition: all 0.2s;
    border-left: 3px solid transparent;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px;
    letter-spacing: 1px;
    color: var(--gris);
    background: none;
    border-right: none;
    border-top: none;
    border-bottom: none;
    width: 100%;
    text-align: left;
    text-transform: uppercase;
  }

  .nav-item:hover { color: var(--blanco); background: rgba(255,255,255,0.03); }

  .nav-item.active {
    color: var(--blanco);
    border-left-color: var(--rojo);
    background: rgba(192,57,43,0.08);
  }

  .nav-item-icon { font-size: 16px; width: 20px; text-align: center; }

  .sidebar-footer {
    padding: 20px 24px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  .sidebar-user {
    font-size: 12px;
    color: var(--gris);
    margin-bottom: 12px;
  }

  .sidebar-user strong { color: var(--blanco); display: block; font-size: 14px; margin-bottom: 2px; }

  .btn-logout {
    width: 100%;
    background: none;
    border: 1px solid rgba(192,57,43,0.3);
    color: var(--rojo);
    padding: 10px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-logout:hover { background: rgba(192,57,43,0.1); }

  /* MAIN */
  .main-content {
    margin-left: 260px;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .topbar {
    background: var(--negro2);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 0 40px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 40;
  }

  .topbar-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 24px;
    letter-spacing: 2px;
  }

  .topbar-date {
    font-size: 12px;
    color: var(--gris);
    font-family: 'Barlow Condensed', sans-serif;
    letter-spacing: 1px;
  }

  .page-content { padding: 40px; }

  /* STATS */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2px;
    margin-bottom: 40px;
  }

  .stat-card {
    background: var(--negro2);
    padding: 28px 24px;
    border: 1px solid rgba(255,255,255,0.04);
    position: relative;
    overflow: hidden;
  }

  .stat-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 2px;
  }

  .stat-card.red::after { background: var(--rojo); }
  .stat-card.gold::after { background: var(--oro); }
  .stat-card.green::after { background: var(--verde); }
  .stat-card.blue::after { background: var(--azul); }

  .stat-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--gris);
    margin-bottom: 12px;
  }

  .stat-value {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 48px;
    line-height: 1;
    margin-bottom: 8px;
  }

  .stat-card.red .stat-value { color: var(--rojo); }
  .stat-card.gold .stat-value { color: var(--oro); }
  .stat-card.green .stat-value { color: var(--verde); }
  .stat-card.blue .stat-value { color: var(--azul); }

  .stat-sub { font-size: 12px; color: var(--gris); font-weight: 300; }

  /* SECTION HEADER */
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 2px;
  }

  /* BUTTONS */
  .btn-primary {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    background: var(--rojo);
    color: var(--blanco);
    border: none;
    padding: 10px 24px;
    cursor: pointer;
    transition: background 0.2s;
    font-weight: 600;
  }

  .btn-primary:hover { background: var(--rojo-vivo); }

  .btn-sm {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 6px 14px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid;
    background: none;
  }

  .btn-confirm { color: var(--verde); border-color: rgba(39,174,96,0.4); }
  .btn-confirm:hover { background: rgba(39,174,96,0.1); }
  .btn-complete { color: var(--azul); border-color: rgba(41,128,185,0.4); }
  .btn-complete:hover { background: rgba(41,128,185,0.1); }
  .btn-cancel { color: var(--rojo); border-color: rgba(192,57,43,0.4); }
  .btn-cancel:hover { background: rgba(192,57,43,0.1); }
  .btn-edit { color: var(--oro); border-color: rgba(212,168,67,0.4); }
  .btn-edit:hover { background: rgba(212,168,67,0.1); }
  .btn-delete { color: var(--rojo); border-color: rgba(192,57,43,0.3); }
  .btn-delete:hover { background: rgba(192,57,43,0.08); }

  /* TABLE */
  .table-wrap {
    background: var(--negro2);
    border: 1px solid rgba(255,255,255,0.04);
    overflow-x: auto;
  }

  table { width: 100%; border-collapse: collapse; }

  thead tr {
    border-bottom: 1px solid rgba(192,57,43,0.2);
    background: rgba(192,57,43,0.05);
  }

  th {
    padding: 14px 20px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--rojo);
    text-align: left;
    font-weight: 600;
  }

  tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.03);
    transition: background 0.15s;
  }

  tbody tr:hover { background: rgba(255,255,255,0.02); }

  td {
    padding: 14px 20px;
    font-size: 13px;
    vertical-align: middle;
  }

  .td-actions { display: flex; gap: 8px; flex-wrap: wrap; }

  /* ESTADO BADGE */
  .badge {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 4px 10px;
    border: 1px solid;
    display: inline-block;
  }

  .badge-PENDIENTE { color: var(--oro); border-color: rgba(212,168,67,0.4); }
  .badge-CONFIRMADA { color: var(--verde); border-color: rgba(39,174,96,0.4); }
  .badge-CANCELADA { color: var(--gris); border-color: rgba(100,100,100,0.3); }
  .badge-COMPLETADA { color: var(--azul); border-color: rgba(41,128,185,0.4); }

  /* CARDS GRID */
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2px;
  }

  .item-card {
    background: var(--negro2);
    padding: 28px 24px;
    border: 1px solid rgba(255,255,255,0.04);
    position: relative;
    transition: border-color 0.2s;
  }

  .item-card:hover { border-color: rgba(192,57,43,0.3); }

  .item-card-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 20px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 6px;
  }

  .item-card-sub { font-size: 13px; color: var(--gris); margin-bottom: 16px; font-weight: 300; }
  .item-card-price { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--rojo); margin-bottom: 16px; }
  .item-card-actions { display: flex; gap: 8px; }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.9);
    z-index: 200;
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal {
    background: var(--negro2);
    border: 1px solid rgba(192,57,43,0.3);
    padding: 36px;
    width: 90%;
    max-width: 480px;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
    position: relative;
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .modal-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 2px;
    margin-bottom: 24px;
  }

  .modal-close {
    position: absolute; top: 16px; right: 16px;
    background: none; border: none;
    color: var(--gris); font-size: 18px; cursor: pointer;
  }

  .modal-close:hover { color: var(--blanco); }

  .field-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--rojo);
    margin-bottom: 8px;
    display: block;
    margin-top: 16px;
  }

  .field-label:first-of-type { margin-top: 0; }

  .input {
    width: 100%;
    background: var(--negro);
    border: 1px solid rgba(255,255,255,0.08);
    color: var(--blanco);
    padding: 12px 14px;
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
    margin-bottom: 4px;
  }

  .input:focus { border-color: var(--rojo); }
  .input::placeholder { color: rgba(255,255,255,0.2); }

  .modal-actions {
    display: flex; gap: 12px; margin-top: 24px;
  }

  .btn-full {
    flex: 1;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 600;
  }

  .btn-full.primary { background: var(--rojo); color: var(--blanco); border: none; }
  .btn-full.primary:hover { background: var(--rojo-vivo); }
  .btn-full.secondary { background: none; border: 1px solid rgba(255,255,255,0.1); color: var(--gris); }
  .btn-full.secondary:hover { border-color: var(--blanco); color: var(--blanco); }

  .error-msg {
    background: rgba(192,57,43,0.1);
    border: 1px solid rgba(192,57,43,0.3);
    color: var(--rojo-vivo);
    padding: 10px 14px;
    font-size: 13px;
    margin-top: 12px;
  }

  .success-msg {
    background: rgba(39,174,96,0.1);
    border: 1px solid rgba(39,174,96,0.3);
    color: var(--verde);
    padding: 10px 14px;
    font-size: 13px;
    margin-bottom: 16px;
  }

  /* LOADING */
  .loading {
    display: flex; align-items: center; justify-content: center;
    padding: 60px; color: var(--gris);
    font-family: 'Barlow Condensed', sans-serif;
    letter-spacing: 3px; text-transform: uppercase; font-size: 12px;
  }

  .spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(192,57,43,0.3);
    border-top-color: var(--rojo);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 12px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .empty {
    text-align: center; padding: 60px; color: var(--gris);
    font-size: 14px; border: 1px dashed rgba(255,255,255,0.06); font-weight: 300;
  }

  /* WHATSAPP */
  .wa-card {
    background: var(--negro2);
    border: 1px solid rgba(255,255,255,0.04);
    padding: 32px;
    margin-bottom: 24px;
  }

  .wa-header {
    display: flex; align-items: center; gap: 16px; margin-bottom: 20px;
  }

  .wa-icon {
    width: 52px; height: 52px;
    background: rgba(37,211,102,0.1);
    border: 1px solid rgba(37,211,102,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 24px;
  }

  .wa-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px; letter-spacing: 2px;
  }

  .wa-sub { font-size: 13px; color: var(--gris); font-weight: 300; }

  .wa-steps { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-top: 24px; }

  .wa-step {
    background: var(--negro);
    border: 1px solid rgba(255,255,255,0.04);
    padding: 20px;
  }

  .wa-step-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36px; color: rgba(37,211,102,0.3); line-height: 1; margin-bottom: 8px;
  }

  .wa-step-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1px; margin-bottom: 6px;
  }

  .wa-step-desc { font-size: 12px; color: var(--gris); line-height: 1.6; font-weight: 300; }

  .wa-code {
    background: var(--negro);
    border: 1px solid rgba(37,211,102,0.2);
    padding: 20px 24px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #2ecc71;
    margin-top: 20px;
    overflow-x: auto;
    white-space: pre;
    line-height: 1.6;
  }

  .wa-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: #25d366;
    color: #000;
    border: none;
    padding: 12px 28px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px; letter-spacing: 2px; text-transform: uppercase;
    cursor: pointer; font-weight: 700; margin-top: 20px;
    transition: background 0.2s; text-decoration: none;
  }

  .wa-btn:hover { background: #20b95a; }

  /* LOGIN */
  .login-page {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    background: var(--negro);
    position: relative;
  }

  .login-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(192,57,43,0.08) 0%, transparent 70%);
  }

  .login-box {
    background: var(--negro2);
    border: 1px solid rgba(192,57,43,0.2);
    padding: 52px 48px;
    width: 90%; max-width: 420px;
    position: relative; z-index: 2;
  }

  .login-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 32px; letter-spacing: 3px;
    margin-bottom: 4px;
  }

  .login-logo span { color: var(--rojo); }
  .login-tag { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: var(--rojo); margin-bottom: 32px; }
  .login-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 2px; margin-bottom: 6px; }
  .login-sub { color: var(--gris); font-size: 13px; margin-bottom: 28px; font-weight: 300; }

  /* FILTER BAR */
  .filter-bar {
    display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;
  }

  .filter-btn {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
    padding: 8px 16px; cursor: pointer;
    border: 1px solid rgba(255,255,255,0.08);
    background: none; color: var(--gris);
    transition: all 0.2s;
  }

  .filter-btn:hover { color: var(--blanco); border-color: rgba(255,255,255,0.2); }
  .filter-btn.active { color: var(--blanco); border-color: var(--rojo); background: rgba(192,57,43,0.1); }

  /* ── RESPONSIVE ── */

  @media (max-width: 1024px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .cards-grid { grid-template-columns: repeat(2, 1fr); }
    .page-content { padding: 24px; }
  }

  @media (max-width: 768px) {
    .sidebar { display: none; }
    .sidebar.sidebar-open { display: flex; }
    .main-content { margin-left: 0; }
    .page-content { padding: 16px; }
    .topbar { padding: 0 16px; height: 56px; }
    .topbar-title { font-size: 18px; }
    .topbar-date { display: none; }
    .stats-grid { grid-template-columns: 1fr 1fr; gap: 2px; }
    .stat-value { font-size: 36px; }
    .cards-grid { grid-template-columns: 1fr 1fr; gap: 2px; }
    .modal { padding: 24px 16px; width: 95%; max-width: 95%; }
    .modal-title { font-size: 22px; }
    .table-wrap { font-size: 12px; }
    th { padding: 10px 12px; font-size: 9px; }
    td { padding: 10px 12px; font-size: 12px; }
  }

  @media (max-width: 480px) {
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .stat-value { font-size: 28px; }
    .stat-label { font-size: 9px; }
    .cards-grid { grid-template-columns: 1fr; }
    .modal-actions { flex-direction: column; }
    .btn-full { width: 100%; }
    .topbar-title { font-size: 16px; }
    .filter-bar { gap: 4px; }
    .filter-btn { padding: 6px 10px; font-size: 10px; }
    .td-actions { flex-direction: column; gap: 4px; }
    .btn-sm { font-size: 10px; padding: 5px 10px; }
  }


  .hamburger {
    display: none;
    background: none;
    border: 1px solid rgba(192,57,43,0.3);
    color: var(--blanco);
    width: 36px; height: 36px;
    font-size: 16px;
    cursor: pointer;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 768px) {
    .hamburger { display: flex; }
    .sidebar {
      display: flex;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      z-index: 100;
    }
    .sidebar-open {
      transform: translateX(0);
    }
  }
`;

// ── LOGIN ──
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      if (data.usuario.rol !== "ADMIN") {
        setError("Acceso denegado. Se requiere rol de administrador.");
        setLoading(false); return;
      }
      /*  localStorage.setItem("token", data.token);
       localStorage.setItem("user", JSON.stringify(data.usuario)); */
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.usuario));
      onLogin(data.usuario);
    } catch (e) {
      setError(e.error || "Credenciales incorrectas");
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-box">
        <div className="login-logo">LA <span>FAMA</span> BARBER</div>
        <div className="login-tag">Panel Administrativo</div>
        <div className="login-title">Acceso Admin</div>
        <p className="login-sub">Ingresa tus credenciales de administrador</p>
        {error && <div className="error-msg">{error}</div>}
        <label className="field-label">Email</label>
        <input className="input" type="email" placeholder="admin@lafama.com" value={email}
          onChange={e => setEmail(e.target.value)} />
        <label className="field-label">Contraseña</label>
        <input className="input" type="password" placeholder="••••••••" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()} />
        <button className="btn-primary" style={{ width: "100%", padding: 14, marginTop: 24, fontSize: 13 }}
          onClick={submit} disabled={loading}>
          {loading ? "Verificando..." : "Ingresar al Panel"}
        </button>
        <button
          onClick={() => window.location.href = "/"}
          style={{
            display: "block",
            width: "100%",
            textAlign: "center",
            marginTop: 16,
            fontSize: 11,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "var(--gris)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Barlow Condensed', sans-serif",
            padding: "8px 0"
          }}
        >
          ← Volver a la página principal
        </button>
      </div>
    </div>
  );
}

// ── DASHBOARD ──
function Dashboard({ citas, servicios, barberos }) {
  const total = citas.length;
  const pendientes = citas.filter(c => c.estado === "PENDIENTE").length;
  const confirmadas = citas.filter(c => c.estado === "CONFIRMADA").length;
  const ingresos = citas
    .filter(c => c.estado === "COMPLETADA")
    .reduce((sum, c) => sum + c.servicios.reduce((s, x) => s + (x.servicio?.precio || 0), 0), 0);

  const recientes = [...citas].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card red">
          <div className="stat-label">Total Citas</div>
          <div className="stat-value">{total}</div>
          <div className="stat-sub">Todas las reservas</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Pendientes</div>
          <div className="stat-value">{pendientes}</div>
          <div className="stat-sub">Por confirmar</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Confirmadas</div>
          <div className="stat-value">{confirmadas}</div>
          <div className="stat-sub">Listas para atender</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Ingresos</div>
          <div className="stat-value" style={{ fontSize: 32 }}>${ingresos.toLocaleString("es-CO")}</div>
          <div className="stat-sub">De citas completadas</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        <div style={{ background: "var(--negro2)", border: "1px solid rgba(255,255,255,0.04)", padding: 24 }}>
          <div className="section-title" style={{ fontSize: 18, marginBottom: 16 }}>Servicios activos</div>
          {servicios.map(s => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 13 }}>
              <span>{s.nombre}</span>
              <span style={{ color: "var(--rojo)", fontFamily: "'Bebas Neue', sans-serif", fontSize: 16 }}>${s.precio.toLocaleString("es-CO")}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--negro2)", border: "1px solid rgba(255,255,255,0.04)", padding: 24 }}>
          <div className="section-title" style={{ fontSize: 18, marginBottom: 16 }}>Barberos activos</div>
          {barberos.map((b, i) => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize: 22 }}>{["👨🏻", "👨🏽", "👨🏾"][i] || "💈"}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{b.nombre}</div>
                <div style={{ fontSize: 11, color: "var(--rojo)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>{b.especialidad}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="section-header">
          <div className="section-title">Últimas Citas</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Barbero</th>
                <th>Servicio</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {recientes.map(c => (
                <tr key={c.id}>
                  <td>{c.usuario?.nombre}</td>
                  <td>{c.barbero?.nombre}</td>
                  <td style={{ color: "var(--gris)" }}>{c.servicios?.map(s => s.servicio?.nombre).join(", ")}</td>
                  <td style={{ color: "var(--gris)" }}>{new Date(c.fecha).toLocaleDateString("es-CO")} · {c.hora}</td>
                  <td><span className={`badge badge-${c.estado}`}>{c.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── CITAS ──
function CitasPanel({ citas, onRefresh }) {
  const [filtro, setFiltro] = useState("TODAS");
  const [loading, setLoading] = useState(false);

  const filtradas = filtro === "TODAS" ? citas : citas.filter(c => c.estado === filtro);

  const cambiarEstado = async (id, estado) => {
    setLoading(true);
    try {
      await apiFetch(`/citas/${id}/estado`, { method: "PUT", body: JSON.stringify({ estado }) });
      onRefresh();
    } catch (e) { }
    setLoading(false);
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Gestión de Citas</div>
        <span style={{ color: "var(--gris)", fontSize: 13 }}>{filtradas.length} citas</span>
      </div>

      <div className="filter-bar">
        {["TODAS", "PENDIENTE", "CONFIRMADA", "COMPLETADA", "CANCELADA"].map(f => (
          <button key={f} className={`filter-btn ${filtro === f ? "active" : ""}`} onClick={() => setFiltro(f)}>{f}</button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Barbero</th>
              <th>Servicios</th>
              <th>Fecha & Hora</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map(c => {
              const total = c.servicios?.reduce((s, x) => s + (x.servicio?.precio || 0), 0);
              return (
                <tr key={c.id}>
                  <td style={{ color: "var(--gris)", fontSize: 11 }}>#{c.id}</td>
                  <td style={{ fontWeight: 600 }}>{c.usuario?.nombre}</td>
                  <td style={{ color: "var(--gris)" }}>{c.usuario?.telefono || "—"}</td>
                  <td>{c.barbero?.nombre}</td>
                  <td style={{ color: "var(--gris)", fontSize: 12 }}>{c.servicios?.map(s => s.servicio?.nombre).join(", ")}</td>
                  <td style={{ color: "var(--gris)", fontSize: 12 }}>
                    {new Date(c.fecha).toLocaleDateString("es-CO", { day: "numeric", month: "short" })} · {c.hora}
                  </td>
                  <td style={{ color: "var(--rojo)", fontFamily: "'Bebas Neue', sans-serif", fontSize: 16 }}>
                    ${total?.toLocaleString("es-CO")}
                  </td>
                  <td><span className={`badge badge-${c.estado}`}>{c.estado}</span></td>
                  <td>
                    <div className="td-actions">
                      {c.estado === "PENDIENTE" && (
                        <button className="btn-sm btn-confirm" onClick={() => cambiarEstado(c.id, "CONFIRMADA")}>Confirmar</button>
                      )}
                      {c.estado === "CONFIRMADA" && (
                        <button className="btn-sm btn-complete" onClick={() => cambiarEstado(c.id, "COMPLETADA")}>Completar</button>
                      )}
                      {c.estado !== "CANCELADA" && c.estado !== "COMPLETADA" && (
                        <button className="btn-sm btn-cancel" onClick={() => cambiarEstado(c.id, "CANCELADA")}>Cancelar</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtradas.length === 0 && <div className="empty">No hay citas con este filtro.</div>}
      </div>
    </div>
  );
}

// ── SERVICIOS ──
// ── SERVICIOS ──
function ServiciosPanel({ servicios, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", precio: "", duracion: "", imagen: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ FUNCIÓN BIEN UBICADA (FUERA DEL RETURN)
  const getImageUrl = (img) => {
    if (!img) return "";
    return img.startsWith("/")
      ? "http://localhost:3000" + img
      : img;
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: "", descripcion: "", precio: "", duracion: "", imagen: "" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      nombre: s.nombre,
      descripcion: s.descripcion || "",
      precio: s.precio,
      duracion: s.duracion,
      imagen: s.imagen || ""
    });
    setError("");
    setShowModal(true);
  };

  const save = async () => {
    setError("");
    setLoading(true);
    try {
      const body = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        duracion: Number(form.duracion),
        imagen: form.imagen || null
      };

      if (editing) {
        await apiFetch(`/servicios/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(body)
        });
      } else {
        await apiFetch("/servicios", {
          method: "POST",
          body: JSON.stringify(body)
        });
      }

      setShowModal(false);
      onRefresh();
    } catch (e) {
      setError(
        e.error ||
        (e.errores ? e.errores.map(x => x.mensaje).join(", ") : "Error")
      );
    }
    setLoading(false);
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este servicio?")) return;
    try {
      await apiFetch(`/servicios/${id}`, { method: "DELETE" });
      onRefresh();
    } catch (e) { }
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Servicios</div>
        <button className="btn-primary" onClick={openCreate}>
          + Nuevo Servicio
        </button>
      </div>

      <div className="cards-grid">
        {servicios.map((s, i) => (
          <div key={`${s.id}-${s.imagen || "noimg"}`} className="item-card">

            {/* ✅ IMAGEN */}
            {s.imagen && (
              <div
                style={{
                  width: "100%",
                  height: 160,
                  backgroundImage: `url(${getImageUrl(s.imagen)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  marginBottom: 12,
                  border: "1px solid rgba(255,255,255,0.08)"
                }}
              />
            )}

            {/* INFO */}
            <div
              style={{
                fontSize: 11,
                color: "var(--gris)",
                fontFamily: "'Barlow Condensed'",
                letterSpacing: 2,
                marginBottom: 8
              }}
            >
              0{i + 1}
            </div>

            <div className="item-card-name">{s.nombre}</div>

            <div className="item-card-sub">
              {s.descripcion} · {s.duracion} min
            </div>

            <div className="item-card-price">
              ${s.precio.toLocaleString("es-CO")}
            </div>

            <div className="item-card-actions">
              <button className="btn-sm btn-edit" onClick={() => openEdit(s)}>
                Editar
              </button>
              <button className="btn-sm btn-delete" onClick={() => eliminar(s.id)}>
                Eliminar
              </button>
            </div>

          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>

            <div className="modal-title">
              {editing ? "Editar Servicio" : "Nuevo Servicio"}
            </div>

            <label className="field-label">Nombre</label>
            <input
              className="input"
              value={form.nombre}
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
            />

            <label className="field-label">Descripción</label>
            <input
              className="input"
              value={form.descripcion}
              onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
            />

            <label className="field-label">Precio</label>
            <input
              className="input"
              type="number"
              value={form.precio}
              onChange={e => setForm(p => ({ ...p, precio: e.target.value }))}
            />

            <label className="field-label">Duración</label>
            <input
              className="input"
              type="number"
              value={form.duracion}
              onChange={e => setForm(p => ({ ...p, duracion: e.target.value }))}
            />

            <label className="field-label">Imagen (URL)</label>
            <input
              className="input"
              value={form.imagen}
              onChange={e => setForm(p => ({ ...p, imagen: e.target.value }))}
            />

            {form.imagen && (
              <div
                style={{
                  width: "100%",
                  height: 120,
                  backgroundImage: `url(${getImageUrl(form.imagen)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  marginTop: 8
                }}
              />
            )}

            {error && <div className="error-msg">{error}</div>}

            <div className="modal-actions">
              <button className="btn-full secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="btn-full primary" onClick={save} disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── BARBEROS ──
/* function BarberosPanel({ barberos, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: "", especialidad: "", foto: "", pin: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const openCreate = () => { setEditing(null); setForm({ nombre: "", especialidad: "", foto: "", pin: "" }); setError(""); setShowModal(true); };
  const openEdit = (b) => { setEditing(b); setForm({ nombre: b.nombre, especialidad: b.especialidad, foto: b.foto || "", pin: b.pin || "" }); setError(""); setShowModal(true); };

  const save = async () => {
    setError(""); setLoading(true);
    if (form.pin && (form.pin.length !== 4 || !/^\d+$/.test(form.pin))) {
      setError("El PIN debe ser exactamente 4 dígitos numéricos");
      setLoading(false); return;
    }
    try {
      const body = { nombre: form.nombre, especialidad: form.especialidad, foto: form.foto, pin: form.pin };
      if (editing) {
        await apiFetch(`/barberos/${editing.id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await apiFetch("/barberos", { method: "POST", body: JSON.stringify(body) });
      }
      setShowModal(false); onRefresh();
    } catch (e) {
      setError(e.error || "Error al guardar");
    }
    setLoading(false);
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este barbero?")) return;
    try { await apiFetch(`/barberos/${id}`, { method: "DELETE" }); onRefresh(); } catch (e) {}
  };

  const avatares = ["👨🏻","👨🏽","👨🏾","👨🏿","👨"];

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Barberos</div>
        <button className="btn-primary" onClick={openCreate}>+ Nuevo Barbero</button>
      </div>

      <div className="cards-grid">
        {barberos.map((b, i) => (
          <div key={b.id} className="item-card">
            <div style={{ fontSize: 36, marginBottom: 14 }}>{avatares[i] || "💈"}</div>
            <div className="item-card-name">{b.nombre}</div>
            <div className="item-card-sub" style={{ color: "var(--rojo)" }}>{b.especialidad}</div>
            <div style={{ fontSize: 11, color: "var(--gris)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 2, marginTop: 4, marginBottom: 16 }}>
              PIN: {b.pin ? "••••" : <span style={{ color: "var(--rojo-vivo)" }}>Sin asignar</span>}
            </div>
            <div className="item-card-actions">
              <button className="btn-sm btn-edit" onClick={() => openEdit(b)}>Editar</button>
              <button className="btn-sm btn-delete" onClick={() => eliminar(b.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <div className="modal-title">{editing ? "Editar Barbero" : "Nuevo Barbero"}</div>
            <label className="field-label">Nombre completo</label>
            <input className="input" placeholder="Ej: Carlos Mendoza" value={form.nombre} onChange={e => setForm(p => ({...p, nombre: e.target.value}))} />
            <label className="field-label">Especialidad</label>
            <input className="input" placeholder="Ej: Fade y Clásico" value={form.especialidad} onChange={e => setForm(p => ({...p, especialidad: e.target.value}))} />
            <label className="field-label">PIN de acceso (4 dígitos)</label>
            <input
              className="input"
              type="password"
              maxLength={4}
              placeholder="••••"
              value={form.pin}
              onChange={e => setForm(p => ({...p, pin: e.target.value.replace(/\D/g, "")}))}
              style={{ fontSize: 24, letterSpacing: 8, textAlign: "center" }}
            />
            {error && <div className="error-msg">{error}</div>}
            <div className="modal-actions">
              <button className="btn-full secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-full primary" onClick={save} disabled={loading}>{loading ? "Guardando..." : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 */
function BarberosPanel({ barberos, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: "", especialidad: "", descripcion: "", foto: "", pin: "" });
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const openCreate = () => { setEditing(null); setForm({ nombre: "", especialidad: "", descripcion: "", foto: "", pin: "" }); setPreview(""); setArchivo(null); setError(""); setShowModal(true); };
  const openEdit = (b) => { setEditing(b); setForm({ nombre: b.nombre, especialidad: b.especialidad, descripcion: b.descripcion || "", foto: b.foto || "", pin: "" }); setPreview(b.foto || ""); setArchivo(null); setError(""); setShowModal(true); };

  const save = async () => {
    setError(""); setLoading(true);
    if (form.pin && (form.pin.length !== 4 || !/^\d+$/.test(form.pin))) {
      setError("El PIN debe ser exactamente 4 dígitos numéricos");
      setLoading(false); return;
    }
    try {
      const body = { nombre: form.nombre, especialidad: form.especialidad, descripcion: form.descripcion, pin: form.pin };

      if (editing) {
        await apiFetch(`/barberos/${editing.id}`, { method: "PUT", body: JSON.stringify(body) });
        // Subir foto si hay
        if (archivo || (form.foto && form.foto !== editing.foto)) {
          const token = getToken();
          const fd = new FormData();
          if (archivo) fd.append("imagen", archivo);
          else fd.append("url", form.foto);
          await fetch(`${API}/imagenes/barberos/${editing.id}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: fd
          });
        }
      } else {
        const nuevo = await apiFetch("/barberos", { method: "POST", body: JSON.stringify(body) });
        if (archivo || form.foto) {
          const token = getToken();
          const fd = new FormData();
          if (archivo) fd.append("imagen", archivo);
          else fd.append("url", form.foto);
          await fetch(`${API}/imagenes/barberos/${nuevo.id}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: fd
          });
        }
      }
      setShowModal(false); onRefresh();
    } catch (e) {
      setError(e.error || "Error al guardar");
    }
    setLoading(false);
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este barbero?")) return;
    try { await apiFetch(`/barberos/${id}`, { method: "DELETE" }); onRefresh(); } catch (e) { }
  };

  const avatares = ["👨🏻", "👨🏽", "👨🏾", "👨🏿", "👨"];

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Barberos</div>
        <button className="btn-primary" onClick={openCreate}>+ Nuevo Barbero</button>
      </div>

      <div className="cards-grid">
        {barberos.map((b, i) => (
          <div key={b.id} className="item-card">
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              backgroundImage: b.foto ? `url(${b.foto.startsWith('/') ? 'http://localhost:3000' + b.foto : b.foto})` : "none",
              backgroundSize: "cover", backgroundPosition: "center",
              background: b.foto ? undefined : "var(--negro3)",
              border: "2px solid rgba(192,57,43,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, margin: "0 auto 14px"
            }}>
              {!b.foto && (avatares[i] || "💈")}
            </div>
            <div className="item-card-name">{b.nombre}</div>
            <div className="item-card-sub" style={{ color: "var(--rojo)" }}>{b.especialidad}</div>
            {b.descripcion && <div style={{ fontSize: 12, color: "var(--gris)", marginTop: 6, fontStyle: "italic", textAlign: "center" }}>{b.descripcion}</div>}
            <div style={{ fontSize: 11, color: "var(--gris)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 2, marginTop: 8 }}>
              PIN: {b.pin ? "••••" : <span style={{ color: "var(--rojo-vivo)" }}>Sin asignar</span>}
            </div>
            <div style={{ marginTop: 16 }} className="item-card-actions">
              <button className="btn-sm btn-edit" onClick={() => openEdit(b)}>Editar</button>
              <button className="btn-sm btn-delete" onClick={() => eliminar(b.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <div className="modal-title">{editing ? "Editar Barbero" : "Nuevo Barbero"}</div>

            <label className="field-label">Nombre completo</label>
            <input className="input" placeholder="Ej: Carlos Mendoza" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />

            <label className="field-label">Especialidad</label>
            <input className="input" placeholder="Ej: Fade y Clásico" value={form.especialidad} onChange={e => setForm(p => ({ ...p, especialidad: e.target.value }))} />

            <label className="field-label">Descripción corta</label>
            <input className="input" placeholder="Ej: 5 años de experiencia en cortes modernos" value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} />

            <label className="field-label">PIN de acceso (4 dígitos)</label>
            <input className="input" type="password" maxLength={4} placeholder="••••"
              value={form.pin} onChange={e => setForm(p => ({ ...p, pin: e.target.value.replace(/\D/g, "") }))}
              style={{ fontSize: 24, letterSpacing: 8, textAlign: "center" }} />

            <label className="field-label">Foto — URL de internet</label>
            <input className="input" placeholder="https://..." value={form.foto}
              onChange={e => { setForm(p => ({ ...p, foto: e.target.value })); setPreview(e.target.value); setArchivo(null); }} />

            <label className="field-label" style={{ marginTop: 12 }}>O subir desde computador</label>
            <input type="file" accept="image/*"
              onChange={e => { const f = e.target.files[0]; if (f) { setArchivo(f); setPreview(URL.createObjectURL(f)); setForm(p => ({ ...p, foto: "" })); } }}
              style={{ color: "var(--gris)", fontSize: 12, marginTop: 8, marginBottom: 12 }} />

            {preview && (
              <div style={{
                width: 100, height: 100, borderRadius: "50%",
                backgroundImage: `url(${preview})`, backgroundSize: "cover", backgroundPosition: "center",
                border: "2px solid var(--rojo)", margin: "0 auto 16px"
              }} />
            )}

            {error && <div className="error-msg">{error}</div>}
            <div className="modal-actions">
              <button className="btn-full secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-full primary" onClick={save} disabled={loading}>{loading ? "Guardando..." : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




// ── WHATSAPP ──
function WhatsAppPanel() {
  return (
    <div>
      <div className="section-header">
        <div className="section-title">WhatsApp Integration</div>
      </div>

      <div className="wa-card">
        <div className="wa-header">
          <div className="wa-icon">📱</div>
          <div>
            <div className="wa-title">Twilio WhatsApp API</div>
            <div className="wa-sub">Envía mensajes automáticos a tus clientes al confirmar, recordar o cancelar citas</div>
          </div>
        </div>

        <div className="wa-steps">
          <div className="wa-step">
            <div className="wa-step-num">01</div>
            <div className="wa-step-title">Crear cuenta Twilio</div>
            <div className="wa-step-desc">Ve a twilio.com, crea tu cuenta gratuita y activa el sandbox de WhatsApp.</div>
          </div>
          <div className="wa-step">
            <div className="wa-step-num">02</div>
            <div className="wa-step-title">Instalar el paquete</div>
            <div className="wa-step-desc">En tu proyecto backend ejecuta el comando de instalación de Twilio.</div>
          </div>
          <div className="wa-step">
            <div className="wa-step-num">03</div>
            <div className="wa-step-title">Agregar credenciales</div>
            <div className="wa-step-desc">Copia tu Account SID y Auth Token al archivo .env de tu proyecto.</div>
          </div>
          <div className="wa-step">
            <div className="wa-step-num">04</div>
            <div className="wa-step-title">Integrar al backend</div>
            <div className="wa-step-desc">Agrega la función de envío en los controladores de citas.</div>
          </div>
        </div>
      </div>

      <div className="wa-card">
        <div className="section-title" style={{ fontSize: 20, marginBottom: 16 }}>Paso 1 — Instalar Twilio</div>
        <p style={{ color: "var(--gris)", fontSize: 13, marginBottom: 12 }}>En la terminal de tu proyecto backend:</p>
        <div className="wa-code">npm install twilio</div>
      </div>

      <div className="wa-card">
        <div className="section-title" style={{ fontSize: 20, marginBottom: 16 }}>Paso 2 — Agregar al .env</div>
        <div className="wa-code">{`TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886`}</div>
      </div>

      <div className="wa-card">
        <div className="section-title" style={{ fontSize: 20, marginBottom: 16 }}>Paso 3 — Crear el servicio</div>
        <p style={{ color: "var(--gris)", fontSize: 13, marginBottom: 4 }}>Crea el archivo <code style={{ color: "var(--rojo)" }}>src/services/whatsapp.service.js</code></p>
        <div className="wa-code">{`const twilio = require('twilio')

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const enviarConfirmacion = async (telefono, cita) => {
  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: \`whatsapp:+57\${telefono}\`,
    body: \`✂️ *La Fama Barber — ALL STARS*\\n\\n
¡Hola! Tu cita ha sido *confirmada*.\\n
📅 Fecha: \${new Date(cita.fecha).toLocaleDateString('es-CO')}\\n
🕐 Hora: \${cita.hora}\\n
💈 Barbero: \${cita.barbero.nombre}\\n
\\nTe esperamos. ¡Hasta pronto!\`
  })
}

const enviarRecordatorio = async (telefono, cita) => {
  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: \`whatsapp:+57\${telefono}\`,
    body: \`⏰ *Recordatorio — La Fama Barber*\\n\\n
Tu cita es *mañana*:\\n
📅 \${new Date(cita.fecha).toLocaleDateString('es-CO')} a las \${cita.hora}\\n
💈 Con: \${cita.barbero.nombre}\\n
\\nSi necesitas cancelar, hazlo con anticipación.\`
  })
}

module.exports = { enviarConfirmacion, enviarRecordatorio }`}</div>
      </div>

      <div className="wa-card">
        <div className="section-title" style={{ fontSize: 20, marginBottom: 16 }}>Paso 4 — Usarlo en el controlador de citas</div>
        <p style={{ color: "var(--gris)", fontSize: 13, marginBottom: 4 }}>En <code style={{ color: "var(--rojo)" }}>src/controllers/citas.controller.js</code> agrega esto al cambiar estado a CONFIRMADA:</p>
        <div className="wa-code">{`const { enviarConfirmacion } = require('../services/whatsapp.service')

// Dentro de cambiarEstado, cuando estado === 'CONFIRMADA':
if (estado === 'CONFIRMADA' && cita.usuario?.telefono) {
  await enviarConfirmacion(cita.usuario.telefono, cita)
}`}</div>

        <a className="wa-btn" href="https://www.twilio.com/try-twilio" target="_blank" rel="noreferrer">
          📱 Crear cuenta Twilio gratis
        </a>
      </div>
    </div>
  );
}


function GaleriaPanel({ servicios, onRefresh }) {
  const [tab, setTab] = useState("carrusel");
  const [carrusel, setCarrusel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nombre: "", descripcion: "", url: "", orden: 0 });
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCarrusel = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/imagenes/carrusel");
      setCarrusel(data);
    } catch (e) { }
    setLoading(false);
  };

  useEffect(() => { loadCarrusel(); }, []);

  const handleArchivo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivo(file);
    setPreview(URL.createObjectURL(file));
    setForm(p => ({ ...p, url: "" }));
  };

  const handleUrl = (e) => {
    setForm(p => ({ ...p, url: e.target.value }));
    setPreview(e.target.value);
    setArchivo(null);
  };

  const guardarCarrusel = async () => {
    if (!archivo && !form.url) { setError("Sube una imagen o pega una URL"); return; }
    setSaving(true); setError("");
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("nombre", form.nombre || "Sin nombre");
      fd.append("descripcion", form.descripcion);
      fd.append("orden", form.orden);
      if (archivo) fd.append("imagen", archivo);
      else fd.append("url", form.url);

      const res = await fetch(`${API}/imagenes/carrusel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw data;
      setForm({ nombre: "", descripcion: "", url: "", orden: 0 });
      setArchivo(null); setPreview("");
      loadCarrusel();
    } catch (e) {
      setError(e.error || "Error al guardar");
    }
    setSaving(false);
  };

  const eliminarCarrusel = async (id) => {
    if (!confirm("¿Eliminar esta imagen?")) return;
    try {
      await apiFetch(`/imagenes/carrusel/${id}`, { method: "DELETE" });
      loadCarrusel();
    } catch (e) { }
  };

  const actualizarImagenServicio = async (servicioId, archivo, url) => {
    try {
      const token = getToken();
      const fd = new FormData();
      if (archivo) fd.append("imagen", archivo);
      else fd.append("url", url);
      await fetch(`${API}/imagenes/servicios/${servicioId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      onRefresh();
    } catch (e) { }
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Galería & Imágenes</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={`btn-sm ${tab === "carrusel" ? "btn-edit" : ""}`}
            onClick={() => setTab("carrusel")}
            style={{ padding: "8px 20px", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 2 }}>
            Carrusel
          </button>
          <button className={`btn-sm ${tab === "servicios" ? "btn-edit" : ""}`}
            onClick={() => setTab("servicios")}
            style={{ padding: "8px 20px", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 2 }}>
            Servicios
          </button>
        </div>
      </div>

      {tab === "carrusel" && (
        <div>
          {/* Formulario agregar */}
          <div style={{ background: "var(--negro2)", border: "1px solid rgba(255,255,255,0.06)", padding: 28, marginBottom: 24 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: "var(--rojo)", marginBottom: 16 }}>
              Agregar imagen al carrusel
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label className="field-label">Nombre del corte</label>
                <input className="input" placeholder="Ej: Fade Clásico" value={form.nombre}
                  onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
                <label className="field-label">Descripción</label>
                <input className="input" placeholder="Ej: El corte atemporal" value={form.descripcion}
                  onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} />
                <label className="field-label">Orden</label>
                <input className="input" type="number" value={form.orden}
                  onChange={e => setForm(p => ({ ...p, orden: e.target.value }))} />
                <label className="field-label">URL de imagen (internet)</label>
                <input className="input" placeholder="https://..." value={form.url} onChange={handleUrl} />
                <label className="field-label" style={{ marginTop: 12 }}>O subir desde computador</label>
                <input type="file" accept="image/*" onChange={handleArchivo}
                  style={{ color: "var(--gris)", fontSize: 12, marginTop: 8 }} />
              </div>
              <div>
                {preview && (
                  <div style={{ width: "100%", height: 220, backgroundImage: `url(${preview})`, backgroundSize: "cover", backgroundPosition: "center", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 12 }} />
                )}
                {!preview && (
                  <div style={{ width: "100%", height: 220, background: "var(--negro3)", border: "1px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gris)", fontSize: 12, letterSpacing: 2, fontFamily: "'Barlow Condensed', sans-serif" }}>
                    VISTA PREVIA
                  </div>
                )}
                {error && <div className="error-msg">{error}</div>}
                <button className="btn-primary" onClick={guardarCarrusel} disabled={saving}
                  style={{ width: "100%", marginTop: 8 }}>
                  {saving ? "Guardando..." : "Agregar al carrusel"}
                </button>
              </div>
            </div>
          </div>

          {/* Lista de imágenes */}
          {loading ? <div className="loading"><div className="spinner" />Cargando...</div> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {carrusel.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "var(--gris)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 2 }}>
                  No hay imágenes en el carrusel aún
                </div>
              )}
              {carrusel.map(img => (
                <div key={img.id} style={{ position: "relative", background: "var(--negro2)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ height: 140, backgroundImage: `url(${img.url.startsWith('/') ? 'http://localhost:3000' + img.url : img.url})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                  <div style={{ padding: "10px 12px" }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{img.nombre}</div>
                    <div style={{ fontSize: 11, color: "var(--gris)", marginTop: 2 }}>{img.descripcion}</div>
                  </div>
                  <button className="btn-sm btn-delete" onClick={() => eliminarCarrusel(img.id)}
                    style={{ position: "absolute", top: 8, right: 8 }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "servicios" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {servicios.map(s => (
            <ServicioImagenCard key={s.id} servicio={s} onActualizar={actualizarImagenServicio} />
          ))}
        </div>
      )}
    </div>
  );
}

function ServicioImagenCard({ servicio, onActualizar }) {
  const [url, setUrl] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(servicio.imagen || "");
  const [saving, setSaving] = useState(false);

  const guardar = async () => {
    if (!archivo && !url) return;
    setSaving(true);
    await onActualizar(servicio.id, archivo, url);
    setSaving(false);
  };

  return (
    <div style={{ background: "var(--negro2)", border: "1px solid rgba(255,255,255,0.06)", padding: 16 }}>
      <div style={{ height: 160, backgroundImage: preview ? `url(${preview.startsWith('/') ? 'http://localhost:3000' + preview : preview})` : "none", backgroundSize: "cover", backgroundPosition: "center", background: preview ? undefined : "var(--negro3)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {!preview && <span style={{ color: "var(--gris)", fontSize: 11, letterSpacing: 2, fontFamily: "'Barlow Condensed', sans-serif" }}>SIN IMAGEN</span>}
      </div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{servicio.nombre}</div>
      <label className="field-label">URL de imagen</label>
      <input className="input" placeholder="https://..." value={url}
        onChange={e => { setUrl(e.target.value); setPreview(e.target.value); setArchivo(null); }}
        style={{ marginBottom: 8 }} />
      <label className="field-label">O subir archivo</label>
      <input type="file" accept="image/*"
        onChange={e => { const f = e.target.files[0]; if (f) { setArchivo(f); setPreview(URL.createObjectURL(f)); setUrl(""); } }}
        style={{ color: "var(--gris)", fontSize: 11, marginBottom: 12 }} />
      <button className="btn-sm btn-edit" onClick={guardar} disabled={saving}
        style={{ width: "100%", padding: "10px", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 2 }}>
        {saving ? "Guardando..." : "Actualizar imagen"}
      </button>
    </div>
  );
}


// ── PRODUCTOS ──
function ProductosPanel({ onRefresh }) {
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", precio: "", categoria: "", badge: "", imagen: "", stock: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadProductos = async () => {
    try { const data = await apiFetch("/productos"); setProductos(data); } catch (e) {}
  };

  useEffect(() => { loadProductos(); }, []);

  const openCreate = () => { setEditing(null); setForm({ nombre: "", descripcion: "", precio: "", categoria: "", badge: "", imagen: "", stock: "" }); setError(""); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ nombre: p.nombre, descripcion: p.descripcion || "", precio: p.precio, categoria: p.categoria || "", badge: p.badge || "", imagen: p.imagen || "", stock: p.stock || 0 }); setError(""); setShowModal(true); };

  const save = async () => {
    if (!form.nombre || !form.precio) { setError("Nombre y precio son obligatorios"); return; }
    setError(""); setLoading(true);
    try {
      const body = { nombre: form.nombre, descripcion: form.descripcion, precio: Number(form.precio), categoria: form.categoria, badge: form.badge, imagen: form.imagen, stock: Number(form.stock) || 0 };
      if (editing) {
        await apiFetch(`/productos/${editing.id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await apiFetch("/productos", { method: "POST", body: JSON.stringify(body) });
      }
      setShowModal(false); loadProductos();
    } catch (e) { setError(e.error || "Error al guardar"); }
    setLoading(false);
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try { await apiFetch(`/productos/${id}`, { method: "DELETE" }); loadProductos(); } catch (e) {}
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Productos</div>
        <button className="btn-primary" onClick={openCreate}>+ Nuevo Producto</button>
      </div>
      <div className="cards-grid">
        {productos.map(p => (
          <div key={p.id} className="item-card">
            {p.imagen && (
              <div style={{ width: "100%", height: 140, backgroundImage: `url(${p.imagen.startsWith('/') ? 'http://localhost:3000' + p.imagen : p.imagen})`, backgroundSize: "cover", backgroundPosition: "center", marginBottom: 16, border: "1px solid rgba(255,255,255,0.06)" }} />
            )}
            {p.badge && <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", background: "var(--rojo)", color: "var(--blanco)", padding: "3px 10px", display: "inline-block", marginBottom: 8 }}>{p.badge}</div>}
            <div className="item-card-name">{p.nombre}</div>
            <div className="item-card-sub">{p.categoria} {p.descripcion ? `· ${p.descripcion}` : ""}</div>
            <div className="item-card-price">${Number(p.precio).toLocaleString("es-CO")}</div>
            <div style={{ fontSize: 11, color: "var(--gris)", marginBottom: 12, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>
              Stock: <strong style={{ color: p.stock > 0 ? "var(--verde)" : "var(--rojo)" }}>{p.stock}</strong>
            </div>
            <div className="item-card-actions">
              <button className="btn-sm btn-edit" onClick={() => openEdit(p)}>Editar</button>
              <button className="btn-sm btn-delete" onClick={() => eliminar(p.id)}>Eliminar</button>
            </div>
          </div>
        ))}
        {productos.length === 0 && <div className="empty" style={{ gridColumn: "1/-1" }}>No hay productos aún. Crea el primero.</div>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <div className="modal-title">{editing ? "Editar Producto" : "Nuevo Producto"}</div>
            <label className="field-label">Nombre</label>
            <input className="input" placeholder="Ej: Pomada Clásica" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
            <label className="field-label">Descripción</label>
            <input className="input" placeholder="Ej: Fijación fuerte con brillo" value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} />
            <label className="field-label">Precio (COP)</label>
            <input className="input" type="number" placeholder="35000" value={form.precio} onChange={e => setForm(p => ({ ...p, precio: e.target.value }))} />
            <label className="field-label">Categoría</label>
            <input className="input" placeholder="Ej: Fijación & Brillo" value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))} />
            <label className="field-label">Badge (opcional)</label>
            <input className="input" placeholder="Ej: Top Seller, Nuevo" value={form.badge} onChange={e => setForm(p => ({ ...p, badge: e.target.value }))} />
            <label className="field-label">URL de imagen</label>
            <input className="input" placeholder="https://..." value={form.imagen} onChange={e => setForm(p => ({ ...p, imagen: e.target.value }))} />
            {form.imagen && <div style={{ width: "100%", height: 100, backgroundImage: `url(${form.imagen})`, backgroundSize: "cover", backgroundPosition: "center", marginTop: 8, border: "1px solid rgba(255,255,255,0.08)" }} />}
            <label className="field-label">Stock</label>
            <input className="input" type="number" placeholder="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
            {error && <div className="error-msg">{error}</div>}
            <div className="modal-actions">
              <button className="btn-full secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-full primary" onClick={save} disabled={loading}>{loading ? "Guardando..." : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MEMBRESÍAS ──
function MembresiasPanel({ usuarios, onRefresh }) {
  const [membresias, setMembresias] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [tab, setTab] = useState("planes");
  const [showModal, setShowModal] = useState(false);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: "", precio: "", cortesIncluidos: "", descripcion: "", beneficios: "", descuento: "" });
  const [formAsignar, setFormAsignar] = useState({ usuarioId: "", membresiaId: "", fechaFin: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [m, a] = await Promise.all([apiFetch("/membresias"), apiFetch("/membresias/asignaciones")]);
      setMembresias(m); setAsignaciones(a);
    } catch (e) {}
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => { setEditing(null); setForm({ nombre: "", precio: "", cortesIncluidos: "", descripcion: "", beneficios: "", descuento: "" }); setError(""); setShowModal(true); };
  const openEdit = (m) => { setEditing(m); setForm({ nombre: m.nombre, precio: m.precio, cortesIncluidos: m.cortesIncluidos, descripcion: m.descripcion || "", beneficios: m.beneficios || "", descuento: m.descuento || 0 }); setError(""); setShowModal(true); };

  const save = async () => {
    if (!form.nombre || !form.precio || !form.cortesIncluidos) { setError("Nombre, precio y cortes son obligatorios"); return; }
    setError(""); setLoading(true);
    try {
      const body = { nombre: form.nombre, precio: Number(form.precio), cortesIncluidos: Number(form.cortesIncluidos), descripcion: form.descripcion, beneficios: form.beneficios, descuento: Number(form.descuento) || 0 };
      if (editing) {
        await apiFetch(`/membresias/${editing.id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await apiFetch("/membresias", { method: "POST", body: JSON.stringify(body) });
      }
      setShowModal(false); loadData();
    } catch (e) { setError(e.error || "Error al guardar"); }
    setLoading(false);
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar esta membresía?")) return;
    try { await apiFetch(`/membresias/${id}`, { method: "DELETE" }); loadData(); } catch (e) {}
  };

  const asignar = async () => {
    if (!formAsignar.usuarioId || !formAsignar.membresiaId || !formAsignar.fechaFin) { setError("Todos los campos son obligatorios"); return; }
    setError(""); setLoading(true);
    try {
      await apiFetch("/membresias/asignar", { method: "POST", body: JSON.stringify({ usuarioId: Number(formAsignar.usuarioId), membresiaId: Number(formAsignar.membresiaId), fechaFin: formAsignar.fechaFin }) });
      setShowAsignarModal(false); setFormAsignar({ usuarioId: "", membresiaId: "", fechaFin: "" }); loadData();
    } catch (e) { setError(e.error || "Error al asignar"); }
    setLoading(false);
  };

  const estadoColor = { ACTIVA: "var(--verde)", VENCIDA: "var(--gris)", CANCELADA: "var(--rojo)" };

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Membresías</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-primary" onClick={() => { setShowAsignarModal(true); setError(""); }}>+ Asignar</button>
          <button className="btn-primary" style={{ background: "var(--negro3)", border: "1px solid rgba(192,57,43,0.3)" }} onClick={openCreate}>+ Nuevo Plan</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["planes", "asignaciones"].map(t => (
          <button key={t} className={`filter-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "planes" ? "Planes" : "Usuarios con Membresía"}
          </button>
        ))}
      </div>

      {tab === "planes" && (
        <div className="cards-grid">
          {membresias.map(m => (
            <div key={m.id} className="item-card">
              <div className="item-card-name">{m.nombre}</div>
              <div className="item-card-price">${Number(m.precio).toLocaleString("es-CO")}<span style={{ fontSize: 13, color: "var(--gris)", fontFamily: "'Barlow', sans-serif" }}>/mes</span></div>
              <div className="item-card-sub">{m.cortesIncluidos} cortes incluidos · {m.descuento}% descuento</div>
              {m.descripcion && <div style={{ fontSize: 12, color: "var(--gris)", marginBottom: 8 }}>{m.descripcion}</div>}
              {m.beneficios && (
                <div style={{ fontSize: 11, color: "var(--gris)", marginBottom: 16, lineHeight: 1.6 }}>
                  {m.beneficios.split('\n').map((b, i) => <div key={i}>✓ {b}</div>)}
                </div>
              )}
              <div className="item-card-actions">
                <button className="btn-sm btn-edit" onClick={() => openEdit(m)}>Editar</button>
                <button className="btn-sm btn-delete" onClick={() => eliminar(m.id)}>Eliminar</button>
              </div>
            </div>
          ))}
          {membresias.length === 0 && <div className="empty" style={{ gridColumn: "1/-1" }}>No hay planes aún.</div>}
        </div>
      )}

      {tab === "asignaciones" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Cortes usados</th>
                <th>Vence</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {asignaciones.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.usuario?.nombre}</td>
                  <td style={{ color: "var(--gris)", fontSize: 12 }}>{a.usuario?.email}</td>
                  <td>{a.membresia?.nombre}</td>
                  <td style={{ textAlign: "center" }}>{a.cortesUsados} / {a.membresia?.cortesIncluidos}</td>
                  <td style={{ color: "var(--gris)", fontSize: 12 }}>{new Date(a.fechaFin).toLocaleDateString("es-CO")}</td>
                  <td><span style={{ color: estadoColor[a.estado], fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 2 }}>{a.estado}</span></td>
                </tr>
              ))}
              {asignaciones.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--gris)" }}>No hay asignaciones aún.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal nuevo plan */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <div className="modal-title">{editing ? "Editar Plan" : "Nuevo Plan"}</div>
            <label className="field-label">Nombre</label>
            <input className="input" placeholder="Ej: Plan Básico" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
            <label className="field-label">Precio mensual (COP)</label>
            <input className="input" type="number" placeholder="80000" value={form.precio} onChange={e => setForm(p => ({ ...p, precio: e.target.value }))} />
            <label className="field-label">Cortes incluidos por mes</label>
            <input className="input" type="number" placeholder="4" value={form.cortesIncluidos} onChange={e => setForm(p => ({ ...p, cortesIncluidos: e.target.value }))} />
            <label className="field-label">Descuento % en servicios</label>
            <input className="input" type="number" placeholder="20" value={form.descuento} onChange={e => setForm(p => ({ ...p, descuento: e.target.value }))} />
            <label className="field-label">Descripción corta</label>
            <input className="input" placeholder="Ej: Ideal para corte semanal" value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} />
            <label className="field-label">Beneficios (uno por línea)</label>
            <textarea className="input" rows={4} placeholder={"Corte incluido sin costo\nDescuento en productos\nPrioridad de agenda"} value={form.beneficios} onChange={e => setForm(p => ({ ...p, beneficios: e.target.value }))} style={{ resize: "none" }} />
            {error && <div className="error-msg">{error}</div>}
            <div className="modal-actions">
              <button className="btn-full secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-full primary" onClick={save} disabled={loading}>{loading ? "Guardando..." : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal asignar membresía */}
      {showAsignarModal && (
        <div className="modal-overlay" onClick={() => setShowAsignarModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAsignarModal(false)}>✕</button>
            <div className="modal-title">Asignar Membresía</div>
            <label className="field-label">Usuario</label>
            <select className="input" value={formAsignar.usuarioId} onChange={e => setFormAsignar(p => ({ ...p, usuarioId: e.target.value }))} style={{ cursor: "pointer" }}>
              <option value="">— Selecciona un usuario —</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>{u.nombre} · {u.email}</option>
              ))}
            </select>
            <label className="field-label">Plan de membresía</label>
            <select className="input" value={formAsignar.membresiaId} onChange={e => setFormAsignar(p => ({ ...p, membresiaId: e.target.value }))} style={{ cursor: "pointer" }}>
              <option value="">— Selecciona un plan —</option>
              {membresias.map(m => (
                <option key={m.id} value={m.id}>{m.nombre} · ${Number(m.precio).toLocaleString("es-CO")}/mes</option>
              ))}
            </select>
            <label className="field-label">Fecha de vencimiento</label>
            <input className="input" type="date" value={formAsignar.fechaFin} onChange={e => setFormAsignar(p => ({ ...p, fechaFin: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
            {error && <div className="error-msg">{error}</div>}
            <div className="modal-actions">
              <button className="btn-full secondary" onClick={() => setShowAsignarModal(false)}>Cancelar</button>
              <button className="btn-full primary" onClick={asignar} disabled={loading}>{loading ? "Asignando..." : "Asignar Membresía"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──
export default function AdminPanel() {
  /* const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null")); */
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("admin_user") || "null"));
  const [page, setPage] = useState("dashboard");
  const [citas, setCitas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [usuarios, setUsuarios] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, s, b] = await Promise.all([
        apiFetch("/citas"),
        apiFetch("/servicios"),
        apiFetch("/barberos"),
      ]);
      setCitas(c); setServicios(s); setBarberos(b);
    } catch (e) {
      if (e.error === 'Token inválido' || e.error === 'No autorizado') {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        setUser(null);
      }
    }
    // Cargar usuarios por separado para no bloquear el resto
    try {
      const u = await apiFetch("/auth/usuarios");
      setUsuarios(u);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { if (user?.rol === "ADMIN") loadData(); }, [user]);

  /* const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }; */

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setUser(null);
  };
  if (!user || user.rol !== "ADMIN") {
    return (
      <>
        <style>{styles}</style>
        <LoginPage onLogin={u => setUser(u)} />
      </>
    );
  }

  const navItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "citas", icon: "📅", label: "Citas" },
    { id: "servicios", icon: "✂", label: "Servicios" },
    { id: "barberos", icon: "💈", label: "Barberos" },
    { id: "productos", icon: "🛍", label: "Productos" },
    { id: "membresias", icon: "⭐", label: "Membresías" },
    { id: "galeria", icon: "🖼", label: "Galería" },
    { id: "whatsapp", icon: "📱", label: "WhatsApp" },
  ];

  const titles = {
    dashboard: "Dashboard",
    citas: "Gestión de Citas",
    servicios: "Servicios",
    barberos: "Barberos",
    productos: "Productos",
    membresias: "Membresías",
    galeria: "Galería & Imágenes",
    whatsapp: "WhatsApp"
  };
  return (
    <>
      <style>{styles}</style>
      <div className="admin-layout">
        <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-logo">
            <div className="sidebar-logo-text">LA <span>FAMA</span></div>
            <div className="sidebar-tag">Panel Admin</div>
          </div>
          <nav className="sidebar-nav">
            <div className="sidebar-section">Principal</div>
            {navItems.map(item => (
              <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`}
                onClick={() => { setPage(item.id); setMenuOpen(false); }}>
                <span className="nav-item-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="sidebar-user">
              <strong>{user.nombre}</strong>
              {user.email}
            </div>
            <button className="btn-logout" onClick={logout}>Cerrar Sesión</button>
          </div>
        </aside>

        {menuOpen && (
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.6)",
              zIndex: 40,
              display: "block"
            }}
          />
        )}

        <main className="main-content">
          <div className="topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button
                className="hamburger"
                onClick={() => setMenuOpen(p => !p)}
              >
                ☰
              </button>
              <div className="topbar-title">{titles[page]}</div>
            </div>
            <div className="topbar-date">
              {new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>

          <div className="page-content">
            {loading ? (
              <div className="loading"><div className="spinner" />Cargando datos...</div>
            ) : (
              <>
                {page === "dashboard" && <Dashboard citas={citas} servicios={servicios} barberos={barberos} />}
                {page === "citas" && <CitasPanel citas={citas} onRefresh={loadData} />}
                {page === "servicios" && <ServiciosPanel servicios={servicios} onRefresh={loadData} />}
                {page === "barberos" && <BarberosPanel barberos={barberos} onRefresh={loadData} />}
                {page === "productos" && <ProductosPanel onRefresh={loadData} />}
                {page === "membresias" && <MembresiasPanel usuarios={usuarios} onRefresh={loadData} />}
                {page === "galeria" && <GaleriaPanel servicios={servicios} onRefresh={loadData} />}
                {page === "whatsapp" && <WhatsAppPanel />}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
