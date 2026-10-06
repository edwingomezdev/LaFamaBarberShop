import { useNavigate } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-logo">LA <span>FAMA</span> BARBER</div>
      <div className="footer-text">© 2025 La Fama Barber · All Stars · Medellín, Colombia</div>
      <div className="footer-text" style={{ color: "var(--rojo)" }}>✦ All Stars</div>
      <button
        onClick={() => navigate("/barbero")}
        style={{
          fontSize: 11, letterSpacing: 3, textTransform: "uppercase",
          color: "var(--gris)", background: "none", border: "none",
          borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 2,
          cursor: "pointer", fontFamily: "'Oswald', sans-serif"
        }}
        onMouseEnter={(e) => (e.target.style.color = "var(--rojo)")}
        onMouseLeave={(e) => (e.target.style.color = "var(--gris)")}
      >
        ✂ Acceso Barberos
      </button>
    </footer>
  );
}
