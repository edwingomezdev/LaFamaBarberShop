import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const getToken = () => localStorage.getItem("barber_token");

const getImageUrl = (img) => {
  if (!img) return "";
  return img.startsWith("/") ? API.replace('/api', '') + img : img;
};



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



function ImageZoomModal({ item, onClose }) {
  const [zoom, setZoom] = useState({ x: 50, y: 50, scale: 1 });
  if (!item) return null;

  const moveZoom = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      scale: 2.35,
    });
  };

  return (
    <div className="zoom-modal" onClick={onClose}>
      <button className="zoom-close" onClick={onClose}>x</button>
      <div className="zoom-viewer" onClick={e => e.stopPropagation()}>
        <div
          className="zoom-image-area"
          onMouseMove={moveZoom}
          onMouseLeave={() => setZoom(z => ({ ...z, scale: 1 }))}
          style={{
            "--zoom-x": `${zoom.x}%`,
            "--zoom-y": `${zoom.y}%`,
            "--zoom-scale": zoom.scale,
          }}
        >
          <img src={item.img} alt={item.title} />
        </div>
        <div className="zoom-info">
          {item.sub && <div className="zoom-sub">{item.sub}</div>}
          <div className="zoom-title">{item.title}</div>
          {item.desc && <div className="zoom-desc">{item.desc}</div>}
        </div>
      </div>
    </div>
  );
}

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
      onLogin(data.barbero, data.token);
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

// ── MAIN ──
export default function BarberView() {
  const [barbero, setBarbero] = useState(() => {
    const b = localStorage.getItem("barbero");
    return b ? JSON.parse(b) : null;
  });
  const [citas, setCitas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [estilosCortes, setEstilosCortes] = useState([]);
  const [zoomItem, setZoomItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [sessionToast, setSessionToast] = useState(null);
  const [nuevasCitas, setNuevasCitas] = useState(new Set());
  const [notifPermission, setNotifPermission] = useState(Notification.permission);
  const [clock, setClock] = useState(new Date());
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("citas");
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

  // Cargar servicios
  useEffect(() => {
    fetch(`${API}/servicios`)
      .then(r => r.json())
      .then(setServicios)
      .catch(() => {});
  }, []);

  const loadEstilosCortes = useCallback(async () => {
    try {
      const data = await apiFetch("/estilos-cortes");
      setEstilosCortes(data);
    } catch (e) {
      setEstilosCortes([]);
    }
  }, []);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    if (!barbero) return;

    setLoading(true);
    loadCitas(barbero.id, true);
    loadEstilosCortes();

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
  }, [barbero, loadCitas, loadEstilosCortes]);

  const requestNotifPermission = async () => {
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
  };

 const cambiarEstado = async (citaId, estado) => {
  try {
    playAlertSound();
    await apiFetch(`/citas/barbero/${citaId}/estado`, {
      method: "PUT",
      body: JSON.stringify({ estado })
    });
    loadCitas(barbero.id, false);
  } catch (e) {
    addToast({ usuario: { nombre: e.error || "No se pudo actualizar la cita" }, hora: "", servicios: [] });
  }
};
  const logout = () => {
  setSessionToast({ msg: 'Sesión cerrada', icon: '👋' });
  localStorage.removeItem("barber_token");
  localStorage.removeItem("barbero");
  setTimeout(() => { setBarbero(null); setCitas([]); }, 700);
  clearInterval(intervalRef.current);
  clearInterval(progressRef.current);
};
if (!barbero) {
    return (
      <>
        {sessionToast && (
          <div className="session-toast">{sessionToast.icon} {sessionToast.msg}</div>
        )}
        <LoginScreen onLogin={(b, token) => {
          localStorage.setItem("barber_token", token);
          localStorage.setItem("barbero", JSON.stringify(b));
          setSessionToast({ msg: `Bienvenido, ${b.nombre.split(' ')[0]}`, icon: '✂️' });
          setTimeout(() => { setBarbero(b); window.location.reload(); }, 600);
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

        {/* TABS */}
        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === "citas" ? "active" : ""}`}
            onClick={() => setActiveTab("citas")}
          >
            📅 Mis Citas
          </button>
          <button
            className={`tab-btn ${activeTab === "catalogo" ? "active" : ""}`}
            onClick={() => setActiveTab("catalogo")}
          >
            ✂️ Catálogo de Cortes
          </button>
          <button
            className={`tab-btn ${activeTab === "estilos" ? "active" : ""}`}
            onClick={() => setActiveTab("estilos")}
          >
            Estilos
          </button>
        </div>

        {/* BANNER NOTIFICACIONES */}
        {activeTab === "citas" && notifPermission === "default" && (
          <div className="notif-banner">
            <span className="notif-banner-text">
              🔔 Activa las notificaciones del navegador para recibir alertas de nuevas citas aunque estés en otra pestaña
            </span>
            <button className="btn-allow" onClick={requestNotifPermission}>Activar notificaciones</button>
          </div>
        )}

        {/* STATS */}
        {activeTab === "citas" && (
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
        )}

        {/* CONTENT */}
        <div className="content">
          {activeTab === "citas" && (
            <>
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
              ) : citasActivas.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">✂️</div>
                  <div className="empty-title">Sin citas por ahora</div>
                  <p className="empty-sub">Las citas aparecerán aquí automáticamente cuando sean agendadas</p>
                </div>
              ) : (
                <div className="citas-tabla-wrap">
                  <table className="citas-tabla">
                    <thead>
                      <tr>
                        <th>Hora</th>
                        <th>Cliente</th>
                        <th>Servicios</th>
                        <th>Contacto</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citasActivas.map(c => {
                        const total = c.servicios?.reduce((s, x) => s + (x.servicio?.precio || 0), 0);
                        const esNueva = nuevasCitas.has(c.id);
                        return (
                          <tr key={c.id} className={esNueva ? "fila-nueva" : ""}>
                            <td className="td-hora">{c.hora}</td>
                            <td>
                              {c.usuario?.nombre}
                              {esNueva && <span className="badge-nueva" style={{ marginLeft: 8 }}>● Nueva</span>}
                              {c.nota && <div className="td-sub">📝 {c.nota}</div>}
                            </td>
                            <td>
                              <div className="td-servicios-tags">
                                {c.servicios?.map(s => (
                                  <span key={s.servicio?.id} className="servicio-tag">{s.servicio?.nombre}</span>
                                ))}
                              </div>
                            </td>
                            <td>{c.usuario?.telefono ? <>📞 {c.usuario.telefono}</> : "—"}</td>
                            <td className="td-total">${total?.toLocaleString("es-CO")}</td>
                            <td><span className={`badge badge-${c.estado}`}>{c.estado}</span></td>
                            <td>
                              {c.estado === "PENDIENTE" && (
                                <button className="btn-action btn-completar" onClick={() => cambiarEstado(c.id, "CONFIRMADA")}>Confirmar</button>
                              )}
                              {c.estado === "CONFIRMADA" && (
                                <button className="btn-action btn-completar" onClick={() => cambiarEstado(c.id, "COMPLETADA")}>✓ Completar</button>
                              )}
                              {c.estado === "COMPLETADA" && <span className="td-sub">—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeTab === "catalogo" && (
            <>
              <div className="content-header">
                <div className="content-title">Catálogo de Cortes</div>
              </div>

              {servicios.length === 0 ? (
                <div className="loading"><div className="spinner" />Cargando catálogo...</div>
              ) : (
                <div className="catalogo-grid">
                  {servicios.map(corte => (
                    <div key={corte.id} className="corte-card">
                      <div
                        className="corte-imagen"
                        onClick={() => corte.imagen && setZoomItem({
                          img: getImageUrl(corte.imagen),
                          title: corte.nombre,
                          sub: 'Catalogo de cortes',
                          desc: corte.descripcion,
                        })}
                        style={corte.imagen ? {
                          backgroundImage: `url(${getImageUrl(corte.imagen)})`
                        } : {}}
                      >
                        {!corte.imagen && '✂️'}
                      </div>

                      <div className="corte-content">
                        <h3 className="corte-nombre">{corte.nombre}</h3>
                        
                        {corte.descripcion && (
                          <p className="corte-descripcion">{corte.descripcion}</p>
                        )}

                        <div className="corte-detalles">
                          <div className="corte-duracion">
                            <span>⏱️</span>
                            <span>{corte.duracion} min</span>
                          </div>
                          <div className="corte-precio">
                            ${Number(corte.precio).toLocaleString('es-CO')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "estilos" && (
            <>
              <div className="content-header">
                <div className="content-title">Estilos de Cortes</div>
              </div>

              {estilosCortes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-title">Sin estilos publicados</div>
                  <p className="empty-sub">El admin puede agregarlos desde el panel de administracion</p>
                </div>
              ) : (
                <div className="catalogo-grid">
                  {estilosCortes.map(estilo => (
                    <div key={estilo.id} className="corte-card">
                      <div
                        className="corte-imagen"
                        onClick={() => estilo.imagen && setZoomItem({
                          img: getImageUrl(estilo.imagen),
                          title: estilo.nombre,
                          sub: estilo.categoria || 'Estilo de corte',
                          desc: estilo.descripcion,
                        })}
                        style={estilo.imagen ? {
                          backgroundImage: `url(${getImageUrl(estilo.imagen)})`
                        } : {}}
                      >
                        {!estilo.imagen && 'ESTILO'}
                      </div>

                      <div className="corte-content">
                        {estilo.categoria && (
                          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--rojo)", marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif" }}>
                            {estilo.categoria}
                          </div>
                        )}
                        <h3 className="corte-nombre">{estilo.nombre}</h3>
                        {estilo.descripcion && (
                          <p className="corte-descripcion">{estilo.descripcion}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
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

      <ImageZoomModal item={zoomItem} onClose={() => setZoomItem(null)} />
    </>
  );
}
