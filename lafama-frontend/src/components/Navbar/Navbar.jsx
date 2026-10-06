import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API } from "../../services/api";
import "./Navbar.css";

/**
 * Nav compartido entre LaFamaBarber (home) y cualquier página pública
 * nueva (ej. PublicProducts). Si te llaman desde otra ruta, primero
 * navega a "/" y le dice a LaFamaBarber a dónde hacer scroll una vez
 * cargue, usando sessionStorage como puente entre páginas.
 *
 * Props:
 *  - usuario, miMembresia: estado de sesión (null si no hay login)
 *  - onMisCitas, onLogout, onEntrar: opcionales. Si no se pasan,
 *    el nav resuelve un comportamiento razonable por su cuenta
 *    (navegar a "/" y dejar la señal en sessionStorage).
 */
export default function Navbar({ usuario, miMembresia, onMisCitas, onLogout, onEntrar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [config, setConfig] = useState({ mostrarProductos: true, mostrarMembresias: true });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch(`${API}/configuracion`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setConfig(data); })
      .catch(() => {});
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const goHomeAndScroll = (sectionId) => {
    setMenuOpen(false);
    if (location.pathname !== "/") {
      if (sectionId) sessionStorage.setItem("scrollTarget", sectionId);
      navigate("/");
      return;
    }
    if (!sectionId) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleMisCitas = () => {
    setMenuOpen(false);
    if (onMisCitas) { onMisCitas(); return; }
    sessionStorage.setItem("targetVista", "citas");
    navigate("/");
  };

  const handleEntrar = () => {
    setMenuOpen(false);
    if (onEntrar) { onEntrar(); return; }
    sessionStorage.setItem("openAuth", "1");
    navigate("/");
  };

  const irA = (ruta) => { setMenuOpen(false); navigate(ruta); };

  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => goHomeAndScroll(null)}>LA <span>FAMA</span> BARBER</div>

      <button className="nav-toggle" onClick={() => setMenuOpen(o => !o)} aria-label="Abrir menú">
        {menuOpen ? "✕" : "☰"}
      </button>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <button className="nav-link" onClick={() => goHomeAndScroll(null)}>Inicio</button>
        <button className="nav-link" onClick={() => goHomeAndScroll("nosotros")}>Nosotros</button>
        <button className="nav-link" onClick={() => goHomeAndScroll("servicios")}>Servicios</button>
        {config.mostrarMembresias && <button className="nav-link" onClick={() => irA("/membresias")}>Membresías</button>}
        {config.mostrarProductos && <button className="nav-link" onClick={() => irA("/productos")}>Productos</button>}
        <button className="nav-link" onClick={() => goHomeAndScroll("booking")}>Reservar</button>
        {usuario && <button className="nav-link" onClick={handleMisCitas}>Mis Citas</button>}
        {usuario ? (
          <div className="nav-usuario-wrap">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {usuario.foto ? (
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  backgroundImage: `url(${usuario.foto})`,
                  backgroundSize: "cover", backgroundPosition: "center",
                  border: "2px solid var(--rojo)"
                }} />
              ) : (
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "var(--rojo)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: "var(--blanco)"
                }}>
                  {usuario.nombre?.charAt(0).toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: 12, letterSpacing: 1, color: "var(--blanco)", fontFamily: "'Oswald', sans-serif" }}>
                {usuario.nombre?.toUpperCase()}
              </span>
              {miMembresia && (
                <span style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", background: "var(--rojo)", color: "var(--blanco)", padding: "2px 8px", fontFamily: "'Oswald', sans-serif" }}>
                  ⭐ {miMembresia.membresia?.nombre}
                </span>
              )}
              {miMembresia?.alertaVencimiento && (
                <div style={{ background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.4)", padding: "12px 20px", marginBottom: 12, fontSize: 12, color: "#d4a843", letterSpacing: 1, display: "flex", alignItems: "center", gap: 10 }}>
                  ⚠️ Tu membresía <strong>{miMembresia.membresia?.nombre}</strong> vence en {miMembresia.diasRestantes} día(s)
                </div>
              )}
              {miMembresia?.alertaConsumo && (
                <div style={{ background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)", padding: "12px 20px", marginBottom: 12, fontSize: 12, color: "var(--rojo)", letterSpacing: 1, display: "flex", alignItems: "center", gap: 10 }}>
                  🔔 Te queda solo <strong>1 corte</strong> disponible en tu membresía
                </div>
              )}
            </div>
            <button className="nav-btn" onClick={() => { setMenuOpen(false); (onLogout ? onLogout() : navigate("/")); }}>SALIR</button>
          </div>
        ) : (
          <button className="nav-btn" onClick={handleEntrar}>ENTRAR</button>
        )}
      </div>

      {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)} />}
    </nav>
  );
}
