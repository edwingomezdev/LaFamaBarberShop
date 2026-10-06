import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { API, getToken } from "./services/api";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Membresias from "./components/Membresias";

export default function PublicMembresias() {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState([]);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    fetch(`${API}/configuracion`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data && !data.mostrarMembresias) navigate("/", { replace: true }); })
      .catch(() => {});

    fetch(`${API}/membresias`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setPlanes(Array.isArray(data) ? data : []))
      .catch(() => setPlanes([]));

    const t = getToken();
    const u = localStorage.getItem("usuario");
    if (t && u) {
      try { setUsuario(JSON.parse(u)); } catch { /* ignore */ }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  return (
    <>
      <Navbar usuario={usuario} onLogout={logout} />

      <main>
        <Membresias planesMembresia={planes} style={{ paddingTop: 120 }} />
      </main>

      <Footer />

      <div className="floating-actions">
        <a href="https://www.instagram.com/TU_USUARIO" target="_blank" rel="noopener noreferrer" className="instagram-float">
          <FaInstagram />
        </a>
        <a href="https://wa.me/573013090185?text=Hola%20quiero%20saber%20de%20las%20membres%C3%ADas" target="_blank" rel="noopener noreferrer" className="whatsapp-float">
          <FaWhatsapp />
        </a>
      </div>
    </>
  );
}
