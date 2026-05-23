import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000/api";
const getToken = () => localStorage.getItem("barber_token");



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

// ── SONIDO con Web Audio API (sin archivos externos) ──
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const notas = [523.25, 659.25, 783.99, 1046.50]; // Do Mi Sol Do
    notas.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
      gain.gain.linearRampToValueAtTime(0, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  } catch (e) {}
};

const playAlertSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.3].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "square";
      const t = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  } catch (e) {}
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;500;600;700;800&family=Barlow:wght@300;400;500&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --rojo: #c0392b;
    --rojo-vivo: #e74c3c;
    --negro: #060606;
    --negro2: #0f0f0f;
    --negro3: #181818;
    --blanco: #f0ece4;
    --gris: #555;
    --gris2: #333;
    --oro: #d4a843;
    --verde: #27ae60;
    --verde-claro: #2ecc71;
    --azul: #2980b9;
  }

  body {
    background: var(--negro);
    color: var(--blanco);
    font-family: 'Barlow', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: var(--negro2); }
  ::-webkit-scrollbar-thumb { background: var(--rojo); }

  /* ── LOGIN ── */
  .login-wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--negro);
    position: relative;
  }

  .login-wrap::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 50% 50% at 50% 50%, rgba(192,57,43,0.1) 0%, transparent 70%);
  }

  .login-box {
    background: var(--negro2);
    border: 1px solid rgba(192,57,43,0.25);
    padding: 52px 44px;
    width: 90%; max-width: 400px;
    position: relative; z-index: 2;
  }

  .brand {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 30px;
    letter-spacing: 3px;
    margin-bottom: 4px;
  }

  .brand span { color: var(--rojo); }

  .brand-tag {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 10px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--rojo);
    margin-bottom: 36px;
  }

  .login-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px;
    letter-spacing: 2px;
    margin-bottom: 6px;
  }

  .login-sub {
    color: var(--gris);
    font-size: 13px;
    margin-bottom: 28px;
    font-weight: 300;
  }

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
    border: 1px solid rgba(255,255,255,0.07);
    color: var(--blanco);
    padding: 13px 16px;
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }

  .input:focus { border-color: var(--rojo); }
  .input::placeholder { color: rgba(255,255,255,0.15); }

  .btn-login {
    width: 100%;
    background: var(--rojo);
    color: var(--blanco);
    border: none;
    padding: 15px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px;
    letter-spacing: 3px;
    text-transform: uppercase;
    font-weight: 700;
    cursor: pointer;
    margin-top: 24px;
    transition: background 0.2s;
  }

  .btn-login:hover { background: var(--rojo-vivo); }

  .error-msg {
    background: rgba(192,57,43,0.1);
    border: 1px solid rgba(192,57,43,0.3);
    color: var(--rojo-vivo);
    padding: 10px 14px;
    font-size: 13px;
    margin-top: 14px;
  }

  /* ── MAIN SCREEN ── */
  .screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* TOPBAR */
  .topbar {
    background: var(--negro2);
    border-bottom: 1px solid rgba(192,57,43,0.2);
    padding: 0 36px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0; z-index: 50;
  }

  .topbar-left { display: flex; align-items: center; gap: 20px; }

  .topbar-brand {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    letter-spacing: 3px;
  }

  .topbar-brand span { color: var(--rojo); }

  .topbar-divider {
    width: 1px; height: 28px;
    background: rgba(255,255,255,0.08);
  }

  .topbar-barbero {
    display: flex; flex-direction: column;
  }

  .topbar-barbero-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 16px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .topbar-barbero-esp {
    font-size: 11px;
    color: var(--rojo);
    font-family: 'Barlow Condensed', sans-serif;
    letter-spacing: 1px;
  }

  .topbar-right { display: flex; align-items: center; gap: 20px; }

  .topbar-clock {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 2px;
    color: var(--blanco);
  }

  .topbar-date {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--gris);
    text-align: right;
  }

  .status-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--verde-claro);
    box-shadow: 0 0 8px var(--verde-claro);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .btn-logout {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    background: none;
    border: 1px solid rgba(192,57,43,0.3);
    color: var(--gris);
    padding: 8px 16px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-logout:hover { border-color: var(--rojo); color: var(--rojo); }

  /* STATS BAR */
  .stats-bar {
    background: var(--negro2);
    border-bottom: 1px solid rgba(255,255,255,0.04);
    padding: 0 36px;
    display: flex;
    gap: 0;
  }

  .stat-item {
    padding: 16px 32px 16px 0;
    margin-right: 32px;
    border-right: 1px solid rgba(255,255,255,0.04);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-item:last-child { border-right: none; }

  .stat-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 32px;
    line-height: 1;
  }

  .stat-num.red { color: var(--rojo); }
  .stat-num.gold { color: var(--oro); }
  .stat-num.green { color: var(--verde-claro); }
  .stat-num.blue { color: var(--azul); }

  .stat-lbl {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--gris);
  }

  /* CONTENT */
  .content { flex: 1; padding: 32px 36px; }

  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .content-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 2px;
    color: var(--gris);
    text-transform: uppercase;
  }

  .refresh-info {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px;
    letter-spacing: 1px;
    color: var(--gris);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .refresh-bar {
    width: 80px; height: 2px;
    background: var(--gris2);
    position: relative;
    overflow: hidden;
  }

  .refresh-bar-fill {
    position: absolute;
    top: 0; left: 0; height: 100%;
    background: var(--rojo);
    transition: width 1s linear;
  }

  /* CITAS GRID */
  .citas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 12px;
  }

  /* CITA CARD */
  .cita-card {
    background: var(--negro2);
    border: 1px solid rgba(255,255,255,0.05);
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s;
    animation: cardIn 0.4s ease;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .cita-card.nueva {
    border-color: var(--rojo);
    box-shadow: 0 0 20px rgba(192,57,43,0.2);
    animation: cardIn 0.4s ease, glow 1.5s ease 3;
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(192,57,43,0.2); }
    50% { box-shadow: 0 0 40px rgba(192,57,43,0.5); }
  }

  .cita-card:hover { border-color: rgba(192,57,43,0.3); }

  .cita-card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20px 20px 0;
  }

  .cita-hora {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 52px;
    line-height: 1;
    color: var(--blanco);
    letter-spacing: 1px;
  }

  .cita-estado-wrap { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }

  .badge {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 5px 12px;
    border: 1px solid;
    display: inline-block;
  }

  .badge-PENDIENTE { color: var(--oro); border-color: rgba(212,168,67,0.4); background: rgba(212,168,67,0.06); }
  .badge-CONFIRMADA { color: var(--verde-claro); border-color: rgba(46,204,113,0.4); background: rgba(46,204,113,0.06); }
  .badge-COMPLETADA { color: var(--azul); border-color: rgba(41,128,185,0.4); background: rgba(41,128,185,0.06); }
  .badge-CANCELADA { color: var(--gris); border-color: rgba(100,100,100,0.3); background: rgba(100,100,100,0.04); }

  .badge-nueva {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 4px 10px;
    background: var(--rojo);
    color: var(--blanco);
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .cita-card-body { padding: 12px 20px 20px; }

  .cita-cliente {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 22px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
  }

  .cita-servicios {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 14px;
  }

  .servicio-tag {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 4px 10px;
    background: rgba(192,57,43,0.1);
    border: 1px solid rgba(192,57,43,0.2);
    color: var(--blanco);
  }

  .cita-info {
    font-size: 12px;
    color: var(--gris);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .cita-info strong { color: rgba(240,236,228,0.7); }

  .cita-total {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    color: var(--rojo);
    margin-top: 10px;
    letter-spacing: 1px;
  }

  .cita-card-footer {
    border-top: 1px solid rgba(255,255,255,0.04);
    padding: 14px 20px;
    display: flex;
    gap: 8px;
  }

  .btn-action {
    flex: 1;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 10px;
    cursor: pointer;
    border: 1px solid;
    background: none;
    transition: all 0.2s;
    font-weight: 600;
  }

  .btn-completar {
    color: var(--verde-claro);
    border-color: rgba(46,204,113,0.4);
  }

  .btn-completar:hover {
    background: rgba(46,204,113,0.1);
    border-color: var(--verde-claro);
  }

  /* EMPTY */
  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 80px 40px;
    border: 1px dashed rgba(255,255,255,0.05);
  }

  .empty-icon {
    font-size: 60px;
    margin-bottom: 20px;
    opacity: 0.3;
  }

  .empty-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 2px;
    color: var(--gris);
    margin-bottom: 8px;
  }

  .empty-sub {
    font-size: 13px;
    color: var(--gris);
    font-weight: 300;
  }

  /* NOTIFICACIÓN TOAST */
  .toast-container {
    position: fixed;
    top: 90px; right: 24px;
    z-index: 200;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .toast {
    background: var(--negro2);
    border: 1px solid var(--rojo);
    border-left: 4px solid var(--rojo);
    padding: 16px 20px;
    min-width: 300px;
    max-width: 380px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    animation: toastIn 0.4s ease;
    position: relative;
  }

  @keyframes toastIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  .toast-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .toast-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--rojo);
  }

  .toast-close {
    background: none; border: none;
    color: var(--gris); font-size: 14px;
    cursor: pointer; padding: 0;
  }

  .toast-body {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .toast-sub { font-size: 12px; color: var(--gris); }

  /* LOADING */
  .loading {
    display: flex; align-items: center; justify-content: center;
    padding: 80px; color: var(--gris);
    font-family: 'Barlow Condensed', sans-serif;
    letter-spacing: 3px; text-transform: uppercase; font-size: 12px;
  }

  .spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(192,57,43,0.2);
    border-top-color: var(--rojo);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 12px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* NOTIF PERMISSION */
  .notif-banner {
    background: rgba(212,168,67,0.08);
    border: 1px solid rgba(212,168,67,0.2);
    padding: 12px 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .notif-banner-text {
    font-size: 13px;
    color: var(--oro);
    font-family: 'Barlow Condensed', sans-serif;
    letter-spacing: 1px;
  }

  .btn-allow {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    background: rgba(212,168,67,0.15);
    border: 1px solid rgba(212,168,67,0.4);
    color: var(--oro);
    padding: 8px 20px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-allow:hover { background: rgba(212,168,67,0.25); }

  @media (max-width: 768px) {
    .topbar { padding: 0 16px; }
    .stats-bar { padding: 0 16px; overflow-x: auto; }
    .content { padding: 20px 16px; }
    .citas-grid { grid-template-columns: 1fr; }
    .topbar-clock { font-size: 22px; }
  }
`;

// ── LOGIN new──
function LoginScreen({ onLogin }) {
  const navigate = useNavigate();
  const [barberos, setBarberos] = useState([]);
  const [selectedBarbero, setSelectedBarbero] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/barberos`)
      .then(r => r.json())
      .then(setBarberos)
      .catch(() => {});
  }, []);

  const submit = async () => {
    if (!selectedBarbero) { setError("Selecciona tu nombre"); return; }
    if (!pin || pin.length !== 4) { setError("El PIN debe tener 4 dígitos"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/barberos/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barberoId: Number(selectedBarbero), pin })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "PIN incorrecto"); setLoading(false); return; }
      onLogin(data.barbero);
    /*   const data = await res.json();
      if (!res.ok) { setError(data.error || "PIN incorrecto"); setLoading(false); return; }
      const barbero = barberos.find(b => b.id === Number(selectedBarbero));
      onLogin(barbero); */
    } catch (e) {
      setError("Error de conexión");
    }
    setLoading(false);
  };

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="brand">LA <span>FAMA</span> BARBER</div>
        <div className="brand-tag">Pantalla de Barbero</div>
        <div className="login-title">Acceso Barbero</div>
        <p className="login-sub">Selecciona tu nombre e ingresa tu PIN</p>

        <label className="field-label">Tu nombre</label>
        <select
          className="input"
          value={selectedBarbero}
          onChange={e => setSelectedBarbero(e.target.value)}
          style={{ cursor: "pointer" }}
        >
          <option value="">— Elige tu nombre —</option>
          {barberos.map(b => (
            <option key={b.id} value={b.id}>{b.nombre} · {b.especialidad}</option>
          ))}
        </select>

        <label className="field-label">PIN de acceso</label>
        <input
          className="input"
          type="password"
          maxLength={4}
          placeholder="••••"
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
          onKeyDown={e => e.key === "Enter" && submit()}
          style={{ fontSize: 28, letterSpacing: 12, textAlign: "center" }}
        />

        {error && <div className="error-msg">{error}</div>}

       <button className="btn-login" onClick={submit} disabled={loading}>
  {loading ? "Verificando..." : "Ver mis citas"}
</button>

<button
  onClick={() => navigate("/")}
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
// ── LOGIN old──
/* function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [barberos, setBarberos] = useState([]);
  const [selectedBarbero, setSelectedBarbero] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/barberos`)
      .then(r => r.json())
      .then(setBarberos)
      .catch(() => {});
  }, []);

  const submit = async () => {
    if (!selectedBarbero) { setError("Selecciona tu nombre de la lista"); return; }
    setError(""); setLoading(true);
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem("barber_token", data.token);
      const barbero = barberos.find(b => b.id === Number(selectedBarbero));
      onLogin(data.usuario, barbero);
    } catch (e) {
      setError(e.error || "Credenciales incorrectas");
    }
    setLoading(false);
  };

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="brand">LA <span>FAMA</span> BARBER</div>
        <div className="brand-tag">Pantalla de Barbero</div>
        <div className="login-title">Acceso Barbero</div>
        <p className="login-sub">Ingresa para ver tus citas del día</p>

        <label className="field-label">Selecciona tu nombre</label>
        <select className="input" value={selectedBarbero} onChange={e => setSelectedBarbero(e.target.value)}
          style={{ cursor: "pointer" }}>
          <option value="">— Elige tu nombre —</option>
          {barberos.map(b => (
            <option key={b.id} value={b.id}>{b.nombre} · {b.especialidad}</option>
          ))}
        </select>

        <label className="field-label">Email</label>
        <input className="input" type="email" placeholder="tu@email.com"
          value={email} onChange={e => setEmail(e.target.value)} />

        <label className="field-label">Contraseña</label>
        <input className="input" type="password" placeholder="••••••••"
          value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()} />

        {error && <div className="error-msg">{error}</div>}

        <button className="btn-login" onClick={submit} disabled={loading}>
          {loading ? "Verificando..." : "Ver mis citas"}
        </button>
      </div>
    </div>
  );
} */

// ── MAIN ──
export default function BarberView() {
  const [barbero, setBarbero] = useState(() => {
    const b = localStorage.getItem("barbero");
    return b ? JSON.parse(b) : null;
  });
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [nuevasCitas, setNuevasCitas] = useState(new Set());
  const [notifPermission, setNotifPermission] = useState(Notification.permission);
  const [clock, setClock] = useState(new Date());
  const [refreshProgress, setRefreshProgress] = useState(0);
  const prevCitasRef = useRef([]);
  const intervalRef = useRef(null);
  const progressRef = useRef(null);

  // Reloj
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const addToast = (cita) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, cita }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 6000);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const loadCitas = useCallback(async (barberoId, isFirst = false) => {
    if (!isFirst) setLoading(false);
    try {
      const data = await apiFetch(`/citas/barbero/${barberoId}`);

      // Detectar citas nuevas
      if (!isFirst && prevCitasRef.current.length > 0) {
        const prevIds = new Set(prevCitasRef.current.map(c => c.id));
        const nuevas = data.filter(c => !prevIds.has(c.id));

        if (nuevas.length > 0) {
          playNotificationSound();
          nuevas.forEach(c => {
            addToast(c);
            setNuevasCitas(prev => new Set([...prev, c.id]));

            // Notificación del navegador
            if (Notification.permission === "granted") {
              new Notification("✂️ Nueva cita — La Fama Barber", {
                body: `${c.usuario?.nombre} · ${c.hora} · ${c.servicios?.map(s => s.servicio?.nombre).join(", ")}`,
                icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✂️</text></svg>"
              });
            }

            // Quitar el badge "nueva" después de 10s
            setTimeout(() => {
              setNuevasCitas(prev => { const s = new Set(prev); s.delete(c.id); return s; });
            }, 10000);
          });
        }
      }

      prevCitasRef.current = data;
      setCitas(data);
      if (isFirst) setLoading(false);
    } catch (e) {
      if (isFirst) setLoading(false);
    }
  }, []);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    if (!barbero) return;

    setLoading(true);
    loadCitas(barbero.id, true);

    // Barra de progreso
    let progress = 0;
    progressRef.current = setInterval(() => {
      progress += 100 / 30;
      if (progress >= 100) progress = 0;
      setRefreshProgress(progress);
    }, 1000);

    // Refresh
    intervalRef.current = setInterval(() => {
      loadCitas(barbero.id, false);
    }, 30000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(progressRef.current);
    };
  }, [barbero, loadCitas]);

  const requestNotifPermission = async () => {
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
  };

 const cambiarEstado = async (citaId, estado) => {
  try {
    playAlertSound();
    await fetch(`${API}/citas/barbero/${citaId}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado })
    });
    loadCitas(barbero.id, false);
  } catch (e) {}
};
  const logout = () => {
  localStorage.removeItem("barber_token");
  localStorage.removeItem("barbero");
  setBarbero(null); setCitas([]);
  clearInterval(intervalRef.current);
  clearInterval(progressRef.current);
};
if (!barbero) {
    return (
      <>
        <style>{styles}</style>
        <LoginScreen onLogin={(b) => {
          localStorage.setItem("barbero", JSON.stringify(b));
          setBarbero(b);
          setTimeout(() => window.location.reload(), 100);
        }} />
      </>
    );
  }

  const pendientes = citas.filter(c => c.estado === "PENDIENTE").length;
  const confirmadas = citas.filter(c => c.estado === "CONFIRMADA").length;
  const completadas = citas.filter(c => c.estado === "COMPLETADA").length;
  const ingresos = citas.filter(c => c.estado === "COMPLETADA")
    .reduce((s, c) => s + c.servicios.reduce((x, sv) => x + (sv.servicio?.precio || 0), 0), 0);

  const citasActivas = citas.filter(c => c.estado !== "CANCELADA");

  return (
    <>
      <style>{styles}</style>

      {/* TOPBAR */}
      <div className="screen">
        <div className="topbar">
          <div className="topbar-left">
            <div className="topbar-brand">LA <span>FAMA</span></div>
            <div className="topbar-divider" />
            <div className="topbar-barbero">
              <div className="topbar-barbero-name">✂ {barbero.nombre}</div>
              <div className="topbar-barbero-esp">{barbero.especialidad}</div>
            </div>
            <div className="status-dot" title="Actualizando cada 30s" />
          </div>
          <div className="topbar-right">
            <div>
              <div className="topbar-clock">
                {clock.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
              <div className="topbar-date">
                {clock.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
              </div>
            </div>
            <button className="btn-logout" onClick={logout}>Salir</button>
          </div>
        </div>

        {/* BANNER NOTIFICACIONES */}
        {notifPermission === "default" && (
          <div className="notif-banner">
            <span className="notif-banner-text">
              🔔 Activa las notificaciones del navegador para recibir alertas de nuevas citas aunque estés en otra pestaña
            </span>
            <button className="btn-allow" onClick={requestNotifPermission}>Activar notificaciones</button>
          </div>
        )}

        {/* STATS */}
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-num red">{citasActivas.length}</div>
            <div className="stat-lbl">Total hoy</div>
          </div>
          <div className="stat-item">
            <div className="stat-num gold">{pendientes}</div>
            <div className="stat-lbl">Pendientes</div>
          </div>
          <div className="stat-item">
            <div className="stat-num" style={{ color: "var(--verde-claro)" }}>{confirmadas}</div>
            <div className="stat-lbl">Confirmadas</div>
          </div>
          <div className="stat-item">
            <div className="stat-num blue">{completadas}</div>
            <div className="stat-lbl">Completadas</div>
          </div>
          <div className="stat-item">
            <div className="stat-num" style={{ fontSize: 22, color: "var(--verde-claro)" }}>
              ${ingresos.toLocaleString("es-CO")}
            </div>
            <div className="stat-lbl">Ingresos del día</div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="content">
          <div className="content-header">
            <div className="content-title">Citas de hoy</div>
            <div className="refresh-info">
              <span>Actualiza en {30 - Math.floor(refreshProgress * 30 / 100)}s</span>
              <div className="refresh-bar">
                <div className="refresh-bar-fill" style={{ width: `${refreshProgress}%` }} />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner" />Cargando citas...</div>
          ) : (
            <div className="citas-grid">
              {citasActivas.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">✂️</div>
                  <div className="empty-title">Sin citas por ahora</div>
                  <p className="empty-sub">Las citas aparecerán aquí automáticamente cuando sean agendadas</p>
                </div>
              ) : (
                citasActivas.map(c => {
                  const total = c.servicios?.reduce((s, x) => s + (x.servicio?.precio || 0), 0);
                  const esNueva = nuevasCitas.has(c.id);
                  return (
                    <div key={c.id} className={`cita-card ${esNueva ? "nueva" : ""}`}>
                      <div className="cita-card-top">
                        <div className="cita-hora">{c.hora}</div>
                        <div className="cita-estado-wrap">
                          {esNueva && <span className="badge-nueva">● Nueva</span>}
                          <span className={`badge badge-${c.estado}`}>{c.estado}</span>
                        </div>
                      </div>
                      <div className="cita-card-body">
                        <div className="cita-cliente">{c.usuario?.nombre}</div>
                        <div className="cita-servicios">
                          {c.servicios?.map(s => (
                            <span key={s.servicio?.id} className="servicio-tag">{s.servicio?.nombre}</span>
                          ))}
                        </div>
                        {c.usuario?.telefono && (
                          <div className="cita-info">📞 <strong>{c.usuario.telefono}</strong></div>
                        )}
                        {c.nota && (
                          <div className="cita-info">📝 {c.nota}</div>
                        )}
                        <div className="cita-total">${total?.toLocaleString("es-CO")}</div>
                      </div>
                      {(c.estado === "PENDIENTE" || c.estado === "CONFIRMADA") && (
                        <div className="cita-card-footer">
                          {c.estado === "PENDIENTE" && (
                            <button className="btn-action btn-completar"
                              onClick={() => cambiarEstado(c.id, "CONFIRMADA")}>
                              Confirmar
                            </button>
                          )}
                          {c.estado === "CONFIRMADA" && (
                            <button className="btn-action btn-completar"
                              onClick={() => cambiarEstado(c.id, "COMPLETADA")}>
                              ✓ Marcar completada
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* TOASTS */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <div className="toast-header">
              <span className="toast-title">✂ Nueva cita</span>
              <button className="toast-close" onClick={() => removeToast(t.id)}>✕</button>
            </div>
            <div className="toast-body">{t.cita.usuario?.nombre}</div>
            <div className="toast-sub">
              {t.cita.hora} · {t.cita.servicios?.map(s => s.servicio?.nombre).join(", ")}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
