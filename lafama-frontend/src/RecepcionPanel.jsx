import { useState, useEffect, useRef } from "react";
import { API } from "./services/api";

const formatPrecio = (p) => '$' + Number(p).toLocaleString('es-CO');

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

const IconTijeras = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

export default function RecepcionPanel() {
  const [token, setToken] = useState(localStorage.getItem('recepcion_token') || null);
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('recepcion_usuario');
    return guardado ? JSON.parse(guardado) : null;
  });
  const [tab, setTab] = useState('agenda');

  useEffect(() => {
    document.querySelector('.rp-content')?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [tab]);
  const [agenda, setAgenda] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [caja, setCaja] = useState(null);
  const [productos, setProductos] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [cobrandoId, setCobrandoId] = useState(null);
  const [extras, setExtras] = useState([]);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkInData, setWalkInData] = useState({ clienteNombre: '', clienteTelefono: '', barberoId: '', servicioIds: [] });
  const [cambiandoEstadoId, setCambiandoEstadoId] = useState(null);
  const [fechaAgenda, setFechaAgenda] = useState(() => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  });
  const prevAgendaRef = useRef([]);
  const primeraCargaRef = useRef(true);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const mostrarToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resAgenda, resPendientes, resCaja, resProductos, resBarberos, resServicios] = await Promise.all([
        fetch(`${API}/citas/hoy?fecha=${fechaAgenda}`, { headers }),
        fetch(`${API}/ventas/pendientes`, { headers }),
        fetch(`${API}/ventas/caja-del-dia`, { headers }),
        fetch(`${API}/productos`),
        fetch(`${API}/barberos`),
        fetch(`${API}/servicios`),
      ]);
      if (resAgenda.status === 401 || resAgenda.status === 403) {
        localStorage.removeItem('recepcion_token');
        localStorage.removeItem('recepcion_usuario');
        setToken(null);
        return;
      }
      const dataAgenda = await resAgenda.json();

      // Solo avisamos de citas nuevas cuando estamos viendo el día de hoy,
      // ya que es el único día donde "nueva cita" tiene sentido operativo.
      const esHoy = fechaAgenda === new Date().toISOString().split('T')[0];
      if (esHoy && !primeraCargaRef.current) {
        const prevIds = new Set(prevAgendaRef.current.map(c => c.id));
        const nuevas = dataAgenda.filter(c => !prevIds.has(c.id));
        if (nuevas.length > 0) {
          playNotificationSound();
          nuevas.forEach(c => mostrarToast(`Nueva cita: ${c.usuario?.nombre} · ${c.hora} · ${c.barbero?.nombre}`));
        }
      }
      prevAgendaRef.current = dataAgenda;
      primeraCargaRef.current = false;

      setAgenda(dataAgenda);
      setPendientes(await resPendientes.json());
      setCaja(await resCaja.json());
      setProductos(await resProductos.json());
      setBarberos(await resBarberos.json());
      setServicios(await resServicios.json());
    } catch (e) {
      mostrarToast('Error cargando datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    primeraCargaRef.current = true;
    if (token) cargarDatos();
    const intervalo = setInterval(() => { if (token) cargarDatos(); }, 15000);
    return () => clearInterval(intervalo);
  }, [token, fechaAgenda]);

  const cambiarEstadoCita = async (citaId, estado) => {
    setCambiandoEstadoId(citaId);
    try {
      const res = await fetch(`${API}/citas/${citaId}/estado`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ estado }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      mostrarToast(estado === 'CONFIRMADA' ? 'Cita confirmada' : 'Cita finalizada, ya está lista para cobrar');
      cargarDatos();
    } catch (e) {
      mostrarToast(e.message || 'Error al actualizar', 'error');
    } finally {
      setCambiandoEstadoId(null);
    }
  };

  const abrirCobro = (venta) => {
    setCobrandoId(venta.id);
    setExtras([]);
    setMetodoPago('EFECTIVO');
  };

  const agregarExtra = () => setExtras([...extras, { descripcion: '', precio: 0 }]);
  const actualizarExtra = (i, campo, valor) => {
    const copia = [...extras];
    copia[i][campo] = campo === 'precio' ? Number(valor) : valor;
    setExtras(copia);
  };
  const quitarExtra = (i) => setExtras(extras.filter((_, idx) => idx !== i));

  const confirmarCobro = async () => {
    try {
      const res = await fetch(`${API}/ventas/${cobrandoId}/cobrar`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ metodoPago, extras: extras.filter(e => e.descripcion && e.precio > 0) }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      mostrarToast('Cobro registrado');
      setCobrandoId(null);
      cargarDatos();
    } catch (e) {
      mostrarToast(e.message || 'Error al cobrar', 'error');
    }
  };

  const [carritoProductos, setCarritoProductos] = useState([]);
  const [metodoPagoProducto, setMetodoPagoProducto] = useState('EFECTIVO');

  const agregarAlCarrito = (producto) => {
    const existe = carritoProductos.find(p => p.productoId === producto.id);
    if (existe) {
      setCarritoProductos(carritoProductos.map(p =>
        p.productoId === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
      ));
    } else {
      setCarritoProductos([...carritoProductos, {
        productoId: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1
      }]);
    }
  };

  const quitarDelCarrito = (productoId) =>
    setCarritoProductos(carritoProductos.filter(p => p.productoId !== productoId));

  const totalCarrito = carritoProductos.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

  const confirmarVentaProductos = async () => {
    try {
      const res = await fetch(`${API}/ventas/productos`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          metodoPago: metodoPagoProducto,
          productos: carritoProductos.map(p => ({ productoId: p.productoId, cantidad: p.cantidad })),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      mostrarToast('Venta de producto registrada');
      setCarritoProductos([]);
      cargarDatos();
    } catch (e) {
      mostrarToast(e.message || 'Error al vender', 'error');
    }
  };

  const toggleServicioWalkIn = (id) => {
    setWalkInData(w => ({
      ...w,
      servicioIds: w.servicioIds.includes(id) ? w.servicioIds.filter(x => x !== id) : [...w.servicioIds, id],
    }));
  };

  const registrarWalkIn = async () => {
    if (!walkInData.clienteTelefono) { mostrarToast('El teléfono del cliente es requerido', 'error'); return; }
    if (!walkInData.barberoId) { mostrarToast('Elige un barbero', 'error'); return; }
    if (!walkInData.servicioIds.length) { mostrarToast('Elige al menos un servicio', 'error'); return; }
    try {
      const res = await fetch(`${API}/citas/walk-in`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...walkInData, barberoId: Number(walkInData.barberoId) }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      mostrarToast('Cliente registrado a la hora actual, ya aparece en la agenda del barbero');
      setShowWalkIn(false);
      setWalkInData({ clienteNombre: '', clienteTelefono: '', barberoId: '', servicioIds: [] });
      cargarDatos();
    } catch (e) {
      mostrarToast(e.message || 'Error al registrar', 'error');
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error de login');
      if (data.usuario.rol !== 'ADMIN' && data.usuario.rol !== 'RECEPCION') {
        throw new Error('Esta cuenta no tiene acceso al panel de recepción');
      }
      localStorage.setItem('recepcion_token', data.token);
      localStorage.setItem('recepcion_usuario', JSON.stringify(data.usuario));
      setToken(data.token);
      setUsuario(data.usuario);
      mostrarToast(`Bienvenido, ${data.usuario.nombre.split(' ')[0]}`);
    } catch (e) {
      mostrarToast(e.message, 'error');
    }
  };

  const salir = () => {
    mostrarToast('Sesión cerrada');
    localStorage.removeItem('recepcion_token');
    localStorage.removeItem('recepcion_usuario');
    setTimeout(() => { setToken(null); setUsuario(null); }, 600);
  };

  if (!token) {
    return <LoginRecepcion onLogin={login} />;
  }

  const cobrando = pendientes.find(v => v.id === cobrandoId);
  const totalExtras = extras.reduce((sum, e) => sum + (Number(e.precio) || 0), 0);

  return (
    <div className="rp-layout">
      <style>{estilos}</style>

      <header className="rp-topbar">
        <div className="rp-brand-wrap">
          <span className="rp-icon"><IconTijeras /></span>
          <div className="rp-brand">LA <span>FAMA</span> · RECEPCIÓN</div>
        </div>
        <div className="rp-topbar-right">
          <div className="rp-usuario">
            <span className="rp-usuario-avatar">{usuario?.nombre?.charAt(0).toUpperCase() || 'R'}</span>
            <span className="rp-usuario-nombre">{usuario?.nombre || 'Recepción'}</span>
          </div>
          <button className="rp-logout" onClick={salir}>SALIR</button>
        </div>
      </header>

      <div className="rp-stats">
        <div className="rp-stat">
          <span className="rp-stat-label">Citas del día</span>
          <span className="rp-stat-value">{agenda.length}</span>
        </div>
        <div className="rp-stat">
          <span className="rp-stat-label">Por cobrar</span>
          <span className="rp-stat-value rp-stat-warn">{pendientes.length}</span>
        </div>
        <div className="rp-stat">
          <span className="rp-stat-label">Caja de hoy</span>
          <span className="rp-stat-value rp-stat-ok">{caja ? formatPrecio(caja.totalGeneral) : '—'}</span>
        </div>
        <div className="rp-stat">
          <span className="rp-stat-label">Completadas</span>
          <span className="rp-stat-value">{agenda.filter(c => c.estado === 'COMPLETADA').length}/{agenda.length}</span>
        </div>
      </div>

      <nav className="rp-tabs">
        <button className={`rp-tab ${tab === 'agenda' ? 'active' : ''}`} onClick={() => setTab('agenda')}>
          Agenda de hoy {agenda.length > 0 && <span className="rp-badge">{agenda.length}</span>}
        </button>
        <button className={`rp-tab ${tab === 'pendientes' ? 'active' : ''}`} onClick={() => setTab('pendientes')}>
          Citas por cobrar {pendientes.length > 0 && <span className="rp-badge">{pendientes.length}</span>}
        </button>
        <button className={`rp-tab ${tab === 'productos' ? 'active' : ''}`} onClick={() => setTab('productos')}>Venta de productos</button>
        <button className={`rp-tab ${tab === 'caja' ? 'active' : ''}`} onClick={() => setTab('caja')}>Caja del día</button>
        <button className="rp-btn-cobrar rp-btn-walkin" onClick={() => setShowWalkIn(true)}>+ Cliente sin cita</button>
      </nav>

      <main className="rp-content">
        {tab === 'agenda' && (
          <div className="rp-agenda">
            <div className="rp-agenda-toolbar">
              <label>Viendo la agenda del:</label>
              <input type="date" value={fechaAgenda} onChange={e => setFechaAgenda(e.target.value)} />
              <button className="rp-btn-secundario" onClick={() => setFechaAgenda(new Date().toISOString().split('T')[0])}>Hoy</button>
            </div>
            {agenda.length === 0 && !loading && <p className="rp-empty">No hay citas agendadas para este día.</p>}

            {agenda.length > 0 && (
              <div className="rp-barbero-block">
                <table className="rp-tabla">
                  <thead>
                    <tr>
                      <th>Hora</th><th>Barbero</th><th>Cliente</th><th>Servicios</th><th>Estado</th><th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...agenda].sort((a, b) => a.hora.localeCompare(b.hora)).map(c => {
                      const barbero = barberos.find(b => b.id === c.barberoId);
                      return (
                        <tr key={c.id}>
                          <td className="rp-td-hora">{c.hora}</td>
                          <td>{barbero?.nombre || "Sin asignar"}</td>
                          <td>{c.usuario?.nombre}{c.usuario?.telefono && <div className="rp-td-sub">📞 {c.usuario.telefono}</div>}</td>
                          <td className="rp-td-servicios">{c.servicios.map(cs => cs.servicio.nombre).join(', ')}</td>
                          <td><span className={`rp-estado rp-estado-${c.estado.toLowerCase()}`}>{c.estado}</span></td>
                          <td>
                            {c.estado === 'PENDIENTE' && (
                              <button className="rp-btn-mini" disabled={cambiandoEstadoId === c.id} onClick={() => cambiarEstadoCita(c.id, 'CONFIRMADA')}>Confirmar</button>
                            )}
                            {c.estado === 'CONFIRMADA' && (
                              <button className="rp-btn-mini rp-btn-mini-ok" disabled={cambiandoEstadoId === c.id} onClick={() => cambiarEstadoCita(c.id, 'COMPLETADA')}>Finalizar</button>
                            )}
                            {(c.estado === 'COMPLETADA' || c.estado === 'CANCELADA') && <span className="rp-td-sub">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'pendientes' && (
          <div className="rp-grid">
            {pendientes.length === 0 && !loading && <p className="rp-empty">No hay citas pendientes de cobro.</p>}
            {pendientes.map(v => (
              <div key={v.id} className="rp-card">
                <div className="rp-card-head">
                  <strong>{v.cita?.usuario?.nombre}</strong>
                  <span>{v.cita?.barbero?.nombre}</span>
                </div>
                <ul className="rp-servicios">
                  {v.cita?.servicios.map(cs => (
                    <li key={cs.servicio.id}>{cs.servicio.nombre} — {formatPrecio(cs.servicio.precio)}</li>
                  ))}
                </ul>
                <div className="rp-total">{formatPrecio(v.subtotalServicios)}</div>
                <button className="rp-btn-cobrar" onClick={() => abrirCobro(v)}>Cobrar</button>
              </div>
            ))}
          </div>
        )}

        {tab === 'productos' && (
          <div className="rp-productos-layout">
            <div className="rp-productos-grid">
              {productos.map(p => (
                <button key={p.id} className="rp-producto-card" onClick={() => agregarAlCarrito(p)} disabled={p.stock <= 0}>
                  <span>{p.nombre}</span>
                  <span className="rp-producto-precio">{formatPrecio(p.precio)}</span>
                  <span className="rp-producto-stock">{p.stock > 0 ? `Stock: ${p.stock}` : 'Sin stock'}</span>
                </button>
              ))}
            </div>
            <aside className="rp-carrito">
              <h3>Carrito</h3>
              {carritoProductos.length === 0 && <p className="rp-empty">Agrega productos de la lista</p>}
              {carritoProductos.map(p => (
                <div key={p.productoId} className="rp-carrito-item">
                  <span>{p.nombre} x{p.cantidad}</span>
                  <span>{formatPrecio(p.precio * p.cantidad)}</span>
                  <button onClick={() => quitarDelCarrito(p.productoId)}>×</button>
                </div>
              ))}
              {carritoProductos.length > 0 && (
                <>
                  <div className="rp-carrito-total">Total: {formatPrecio(totalCarrito)}</div>
                  <select value={metodoPagoProducto} onChange={e => setMetodoPagoProducto(e.target.value)}>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TARJETA">Tarjeta</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                  </select>
                  <button className="rp-btn-cobrar" onClick={confirmarVentaProductos}>Confirmar venta</button>
                </>
              )}
            </aside>
          </div>
        )}

        {tab === 'caja' && caja && (
          <div className="rp-caja">
            <div className="rp-caja-total">
              <span>Total del día</span>
              <strong>{formatPrecio(caja.totalGeneral)}</strong>
            </div>
            <div className="rp-caja-desglose">
              <div>
                <h4>Por método de pago</h4>
                {Object.entries(caja.porMetodoPago).map(([metodo, monto]) => (
                  <div key={metodo} className="rp-caja-row"><span>{metodo}</span><span>{formatPrecio(monto)}</span></div>
                ))}
              </div>
              <div>
                <h4>Por barbero</h4>
                {Object.entries(caja.porBarbero).map(([nombre, monto]) => (
                  <div key={nombre} className="rp-caja-row"><span>{nombre}</span><span>{formatPrecio(monto)}</span></div>
                ))}
              </div>
            </div>
            <h4>Movimientos</h4>
            {caja.ventas.map(v => (
              <div key={v.id} className="rp-caja-row">
                <span>{v.cita ? v.cita.usuario?.nombre : 'Venta de producto'} · {v.metodoPago}</span>
                <span>{formatPrecio(v.total)}</span>
              </div>
            ))}
          </div>
        )}
      </main>

      {cobrando && (
        <div className="rp-modal-overlay" onClick={() => setCobrandoId(null)}>
          <div className="rp-modal" onClick={e => e.stopPropagation()}>
            <h3>Cobrar cita — {cobrando.cita?.usuario?.nombre}</h3>
            <div className="rp-modal-servicios">
              {cobrando.cita?.servicios.map(cs => (
                <div key={cs.servicio.id} className="rp-caja-row"><span>{cs.servicio.nombre}</span><span>{formatPrecio(cs.servicio.precio)}</span></div>
              ))}
            </div>

            <h4>Extras (anexados en el mostrador)</h4>
            {extras.map((extra, i) => (
              <div key={i} className="rp-extra-row">
                <input placeholder="Ej: Marcada de ceja" value={extra.descripcion} onChange={e => actualizarExtra(i, 'descripcion', e.target.value)} />
                <input type="number" placeholder="Precio" value={extra.precio || ''} onChange={e => actualizarExtra(i, 'precio', e.target.value)} />
                <button onClick={() => quitarExtra(i)}>×</button>
              </div>
            ))}
            <button className="rp-btn-secundario" onClick={agregarExtra}>+ Agregar extra</button>

            <div className="rp-modal-total">Total: {formatPrecio(cobrando.subtotalServicios + totalExtras)}</div>

            <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>

            <div className="rp-modal-actions">
              <button className="rp-btn-secundario" onClick={() => setCobrandoId(null)}>Cancelar</button>
              <button className="rp-btn-cobrar" onClick={confirmarCobro}>Confirmar cobro</button>
            </div>
          </div>
        </div>
      )}

      {showWalkIn && (
        <div className="rp-modal-overlay" onClick={() => setShowWalkIn(false)}>
          <div className="rp-modal" onClick={e => e.stopPropagation()}>
            <h3>Cliente sin cita</h3>
            <p className="rp-hint">Se registrará con la hora actual y quedará <strong>CONFIRMADA</strong> directo en la agenda del barbero elegido.</p>
            <input placeholder="Nombre del cliente" value={walkInData.clienteNombre}
              onChange={e => setWalkInData(w => ({ ...w, clienteNombre: e.target.value }))} />
            <input placeholder="Teléfono (obligatorio)" value={walkInData.clienteTelefono}
              onChange={e => setWalkInData(w => ({ ...w, clienteTelefono: e.target.value }))} />

            <label style={{ fontSize: 12, opacity: 0.7 }}>Barbero</label>
            <select value={walkInData.barberoId} onChange={e => setWalkInData(w => ({ ...w, barberoId: e.target.value }))}>
              <option value="">Selecciona un barbero</option>
              {barberos.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
            </select>

            <label style={{ fontSize: 12, opacity: 0.7 }}>Servicios</label>
            <div className="rp-servicios-check">
              {servicios.map(s => (
                <label key={s.id} className="rp-servicio-check">
                  <input type="checkbox" checked={walkInData.servicioIds.includes(s.id)} onChange={() => toggleServicioWalkIn(s.id)} />
                  {s.nombre} — {formatPrecio(s.precio)}
                </label>
              ))}
            </div>

            <div className="rp-modal-actions">
              <button className="rp-btn-secundario" onClick={() => setShowWalkIn(false)}>Cancelar</button>
              <button className="rp-btn-cobrar" onClick={registrarWalkIn}>Registrar cliente</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`rp-toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

function LoginRecepcion({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(email, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-login-page">
      <style>{estilos}</style>
      <div className="rp-login-bg" />
      <div className="rp-login-box">
        <div className="rp-login-logo">LA <span>FAMA</span> BARBER</div>
        <div className="rp-login-tag">Panel Recepción</div>
        <div className="rp-login-title">Acceso Recepción</div>
        <p className="rp-login-sub">Ingresa tus credenciales para continuar</p>
        <form onSubmit={submit}>
          <label className="rp-field-label">Email</label>
          <input className="rp-login-input" type="email" placeholder="recepcion@lafama.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <label className="rp-field-label">Contraseña</label>
          <input className="rp-login-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="rp-btn-cobrar" style={{ width: "100%", padding: 14, marginTop: 24, fontSize: 13 }} disabled={loading}>
            {loading ? "Verificando..." : "Ingresar al Panel"}
          </button>
        </form>
        <button className="rp-login-back" onClick={() => window.location.href = "/"}>
          ← Volver a la página principal
        </button>
      </div>
    </div>
  );
}

const estilos = `
  :root { --rojo: #c0392b; --negro: #0d0d0d; --negro2: #161616; --negro3: #1e1e1e; --blanco: #f5f5f5; --gris: #666; }
  .rp-layout { min-height: 100vh; background: var(--negro); color: var(--blanco); font-family: 'Oswald', sans-serif; }

  .rp-topbar { display: flex; justify-content: space-between; align-items: center; padding: 0 28px; height: 68px;
    background: linear-gradient(120deg, var(--negro2) 0%, #200a08 100%); border-bottom: 1px solid rgba(192,57,43,0.25); }
  .rp-brand-wrap { display: flex; align-items: center; gap: 12px; }
  .rp-icon { color: var(--rojo); display: flex; }
  .rp-brand { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 2px; }
  .rp-brand span { color: var(--rojo); }
  .rp-topbar-right { display: flex; align-items: center; gap: 16px; }
  .rp-usuario { display: flex; align-items: center; gap: 8px; }
  .rp-usuario-avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--rojo); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
  .rp-usuario-nombre { font-size: 12px; letter-spacing: 0.5px; color: rgba(255,255,255,0.85); }
  .rp-logout { background: none; border: 1px solid rgba(192,57,43,0.4); color: var(--blanco); padding: 8px 18px; font-size: 11px; letter-spacing: 1px; cursor: pointer; }

  .rp-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); }
  .rp-stat { background: var(--negro2); padding: 16px 24px; display: flex; flex-direction: column; gap: 4px; }
  .rp-stat-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.5); }
  .rp-stat-value { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 1px; }
  .rp-stat-warn { color: #d4a843; }
  .rp-stat-ok { color: #27ae60; }

  .rp-tabs { display: flex; gap: 8px; padding: 16px 28px; overflow-x: auto; align-items: center; }
  .rp-tab { background: var(--negro2); border: 1px solid rgba(255,255,255,0.08); color: var(--blanco); padding: 10px 20px; font-size: 12px; letter-spacing: 1px; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 8px; }
  .rp-tab.active { border-color: var(--rojo); color: var(--rojo); }
  .rp-badge { background: var(--rojo); color: var(--blanco); border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 10px; }
  .rp-btn-walkin { margin-left: auto; }

  .rp-content { padding: 24px 28px; }
  .rp-empty { color: rgba(255,255,255,0.4); }
  .rp-hint { font-size: 12px; color: rgba(255,255,255,0.55); margin: -4px 0 4px; }

  .rp-agenda { display: flex; flex-direction: column; gap: 20px; }
  .rp-agenda-toolbar { display: flex; align-items: center; gap: 10px; font-size: 12px; color: rgba(255,255,255,0.6); }
  .rp-agenda-toolbar input[type="date"] { background: var(--negro2); border: 1px solid rgba(255,255,255,0.15); color: var(--blanco); padding: 8px 10px; font-size: 12px; }
  .rp-barbero-block { background: var(--negro2); border: 1px solid rgba(255,255,255,0.08); overflow: hidden; }
  .rp-barbero-header { display: flex; align-items: center; gap: 12px; padding: 14px 18px; background: var(--negro3); border-bottom: 1px solid rgba(255,255,255,0.06); }
  .rp-barbero-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--rojo); display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 16px; }
  .rp-barbero-nombre { font-size: 14px; letter-spacing: 0.5px; }
  .rp-barbero-especialidad { font-size: 11px; color: rgba(255,255,255,0.5); }
  .rp-barbero-count { margin-left: auto; font-size: 11px; color: rgba(255,255,255,0.5); }
  .rp-tabla { width: 100%; border-collapse: collapse; font-size: 13px; }
  .rp-tabla th { text-align: left; padding: 10px 18px; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.4); border-bottom: 1px solid rgba(255,255,255,0.06); }
  .rp-tabla td { padding: 12px 18px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: top; }
  .rp-tabla tr:last-child td { border-bottom: none; }
  .rp-td-sub { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 2px; }
  .rp-td-hora { font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 1px; white-space: nowrap; }
  .rp-td-servicios { color: rgba(255,255,255,0.75); max-width: 220px; }
  .rp-btn-mini { background: none; border: 1px solid rgba(52,152,219,0.5); color: #3498db; padding: 6px 12px; font-size: 10px; letter-spacing: 0.5px; cursor: pointer; }
  .rp-btn-mini-ok { border-color: rgba(39,174,96,0.5); color: #27ae60; }
  .rp-btn-mini:disabled { opacity: 0.4; cursor: not-allowed; }

  .rp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
  .rp-card { background: var(--negro2); border: 1px solid rgba(255,255,255,0.08); padding: 18px; display: flex; flex-direction: column; gap: 10px; }
  .rp-card-head { display: flex; justify-content: space-between; font-size: 14px; }
  .rp-card-head span { color: rgba(255,255,255,0.5); }
  .rp-estado { font-size: 10px; letter-spacing: 1px; padding: 3px 8px; border: 1px solid rgba(255,255,255,0.2); white-space: nowrap; }
  .rp-estado-pendiente { color: #d4a843; border-color: rgba(212,168,67,0.4); }
  .rp-estado-confirmada { color: #3498db; border-color: rgba(52,152,219,0.4); }
  .rp-estado-completada { color: #27ae60; border-color: rgba(39,174,96,0.4); }
  .rp-estado-cancelada { color: #e74c3c; border-color: rgba(231,76,60,0.4); }
  .rp-servicios-check { display: flex; flex-direction: column; gap: 6px; max-height: 160px; overflow-y: auto; }
  .rp-servicio-check { display: flex; align-items: center; gap: 8px; font-size: 12px; }
  .rp-servicios { list-style: none; padding: 0; margin: 0; font-size: 12px; color: rgba(255,255,255,0.7); display: flex; flex-direction: column; gap: 4px; }
  .rp-total { font-size: 20px; font-weight: 700; }
  .rp-btn-cobrar { background: var(--rojo); color: var(--blanco); border: none; padding: 10px 16px; font-size: 12px; letter-spacing: 1px; cursor: pointer; }
  .rp-btn-secundario { background: none; border: 1px solid rgba(255,255,255,0.2); color: var(--blanco); padding: 10px 16px; font-size: 12px; cursor: pointer; }
  .rp-productos-layout { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
  .rp-productos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; align-content: start; }
  .rp-producto-card { background: var(--negro2); border: 1px solid rgba(255,255,255,0.08); padding: 14px; display: flex; flex-direction: column; gap: 6px; color: var(--blanco); cursor: pointer; text-align: left; }
  .rp-producto-card:disabled { opacity: 0.4; cursor: not-allowed; }
  .rp-producto-precio { color: var(--rojo); }
  .rp-producto-stock { font-size: 10px; color: rgba(255,255,255,0.4); }
  .rp-carrito { background: var(--negro2); border: 1px solid rgba(255,255,255,0.08); padding: 18px; display: flex; flex-direction: column; gap: 10px; align-self: start; }
  .rp-carrito-item { display: flex; justify-content: space-between; align-items: center; font-size: 12px; gap: 8px; }
  .rp-carrito-item button { background: none; border: none; color: var(--rojo); cursor: pointer; font-size: 16px; }
  .rp-carrito-total { font-size: 18px; font-weight: 700; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; }
  .rp-caja { display: flex; flex-direction: column; gap: 20px; max-width: 700px; }
  .rp-caja-total { display: flex; justify-content: space-between; align-items: center; font-size: 16px; background: var(--negro2); padding: 20px; }
  .rp-caja-total strong { font-size: 28px; color: var(--rojo); }
  .rp-caja-desglose { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .rp-caja-row { display: flex; justify-content: space-between; font-size: 13px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .rp-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 16px; }
  .rp-modal { background: var(--negro2); padding: 28px; width: 420px; max-width: 100%; display: flex; flex-direction: column; gap: 12px; max-height: 90vh; overflow-y: auto; }
  .rp-extra-row { display: grid; grid-template-columns: 1fr 100px 30px; gap: 6px; }
  .rp-extra-row input { background: var(--negro); border: 1px solid rgba(255,255,255,0.1); color: var(--blanco); padding: 8px; font-size: 12px; }
  .rp-extra-row button { background: none; border: none; color: var(--rojo); cursor: pointer; }
  .rp-modal-total { font-size: 20px; font-weight: 700; text-align: right; }
  .rp-modal select { background: var(--negro); border: 1px solid rgba(255,255,255,0.1); color: var(--blanco); padding: 10px; }
  .rp-modal input { background: var(--negro); border: 1px solid rgba(255,255,255,0.1); color: var(--blanco); padding: 10px; font-size: 13px; }
  .rp-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
  .rp-toast { position: fixed; bottom: 20px; right: 20px; background: var(--negro2); border-left: 4px solid var(--rojo); padding: 14px 20px; font-size: 13px; z-index: 300; }
  .rp-toast.error { border-left-color: #e74c3c; }
  .rp-login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--negro); position: relative; }
  .rp-login-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(192,57,43,0.08) 0%, transparent 70%); }
  .rp-login-box { background: var(--negro2); border: 1px solid rgba(192,57,43,0.2); padding: 52px 48px; width: 90%; max-width: 420px; position: relative; z-index: 2; }
  .rp-login-logo { font-family: 'Bebas Neue', sans-serif; font-size: 32px; letter-spacing: 3px; margin-bottom: 4px; }
  .rp-login-logo span { color: var(--rojo); }
  .rp-login-tag { font-family: 'Oswald', sans-serif; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: var(--rojo); margin-bottom: 32px; }
  .rp-login-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 2px; margin-bottom: 6px; }
  .rp-login-sub { color: var(--gris); font-size: 13px; margin-bottom: 28px; font-weight: 300; }
  .rp-field-label { font-family: 'Oswald', sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--rojo); margin-bottom: 8px; display: block; margin-top: 16px; }
  .rp-field-label:first-of-type { margin-top: 0; }
  .rp-login-input { width: 100%; background: var(--negro); border: 1px solid rgba(255,255,255,0.08); color: var(--blanco); padding: 12px 14px; font-family: 'Oswald', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s; margin-bottom: 4px; }
  .rp-login-input:focus { border-color: var(--rojo); }
  .rp-login-input::placeholder { color: rgba(255,255,255,0.2); }
  .rp-login-back { display: block; width: 100%; text-align: center; margin-top: 16px; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--gris); background: none; border: none; cursor: pointer; font-family: 'Oswald', sans-serif; padding: 8px 0; }
  .rp-login-back:hover { color: var(--blanco); }

  @media (max-width: 900px) {
    .rp-stats { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 768px) {
    .rp-productos-layout { grid-template-columns: 1fr; }
    .rp-caja-desglose { grid-template-columns: 1fr; }
    .rp-topbar { padding: 0 16px; }
    .rp-content { padding: 16px; }
    .rp-tabla { font-size: 12px; }
    .rp-tabla th, .rp-tabla td { padding: 8px 10px; }
    .rp-usuario-nombre { display: none; }
  }
`;