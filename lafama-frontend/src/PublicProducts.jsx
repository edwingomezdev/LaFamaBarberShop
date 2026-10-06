import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { API, getImageUrl, getToken } from "./services/api";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ImageZoomModal from "./components/ImageZoomModal";
import "./styles/PublicProducts.css";
import "./styles/PublicProductsFilters.css";

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80&fit=crop";

export default function PublicProducts() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState("TODOS");
  const [usuario, setUsuario] = useState(null);
  const [zoomItem, setZoomItem] = useState(null);

  useEffect(() => {
    fetch(`${API}/configuracion`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data && !data.mostrarProductos) navigate("/", { replace: true }); })
      .catch(() => {});

    fetch(`${API}/productos`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .catch(() => setProductos([]))
      .finally(() => setLoading(false));

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

  const abrirZoom = (producto) => {
    setZoomItem({
      img: getImageUrl(producto.imagen) || PLACEHOLDER_IMG,
      title: producto.nombre,
      sub: producto.categoria || "Producto",
      desc: producto.descripcion,
      price: `$${Number(producto.precio).toLocaleString("es-CO")}`,
    });
  };

  const categorias = ["TODOS", ...new Set(productos.map((producto) => producto.categoria).filter(Boolean))];
  const productosFiltrados = categoria === "TODOS" ? productos : productos.filter((producto) => producto.categoria === categoria);

  return (
    <>
      <Navbar usuario={usuario} onLogout={logout} />

      <main className="public-products-page">
        <section className="section" style={{ paddingTop: 120, paddingBottom: 0 }}>
          <div className="section-header">
            <span className="section-tag">Lo que usamos</span>
            <h2 className="section-title">NUESTROS<br /><span style={{ color: 'var(--rojo)' }}>PRODUCTOS</span></h2>
          </div>
        </section>

        {!loading && categorias.length > 1 && (
          <nav className="public-products-filters" aria-label="Filtrar productos por categoría">
            {categorias.map((item) => (
              <button key={item} className={categoria === item ? "active" : ""} onClick={() => setCategoria(item)}>{item}</button>
            ))}
          </nav>
        )}

        <section className="public-products-grid" aria-label="Catálogo de productos">
          {loading && <div className="public-products-empty">Cargando productos…</div>}
          {!loading && productosFiltrados.map((producto) => {
            const agotado = Number(producto.stock) <= 0;
            return (
              <article className={`public-product-card ${agotado ? "agotado" : ""}`} key={producto.id}>
                <button
                  type="button"
                  className="public-product-image img-zoom-trigger"
                  onClick={() => abrirZoom(producto)}
                  aria-label={`Ver ${producto.nombre} en detalle`}
                >
                  {agotado && <span className="public-product-agotado-badge">Agotado</span>}
                  {!agotado && producto.badge && <span className="public-product-badge">{producto.badge}</span>}
                  <img
                    src={getImageUrl(producto.imagen) || PLACEHOLDER_IMG}
                    alt={producto.nombre}
                    loading="lazy"
                    onError={(event) => { event.currentTarget.src = PLACEHOLDER_IMG; }}
                  />
                  <span className="public-product-zoom-icon">🔍</span>
                </button>
                <div className="public-product-body">
                  {producto.categoria && <div className="public-product-category">{producto.categoria}</div>}
                  <h2>{producto.nombre}</h2>
                  <div className="public-product-footer">
                    <strong>${Number(producto.precio).toLocaleString("es-CO")}</strong>
                    <span>{agotado ? "Sin stock" : "En tienda"}</span>
                  </div>
                </div>
              </article>
            );
          })}
          {!loading && productos.length === 0 && <div className="public-products-empty">Pronto encontrarás nuestros productos aquí.</div>}
          {!loading && productos.length > 0 && productosFiltrados.length === 0 && <div className="public-products-empty">No hay productos en esta categoría.</div>}
        </section>

        <section className="public-products-visit">
          <div><span>¿Quieres uno?</span><h2>VISÍTANOS EN LA TIENDA</h2></div>
          <a href="https://wa.me/573013090185?text=Hola%2C%20quiero%20consultar%20por%20un%20producto" target="_blank" rel="noreferrer">Consultar disponibilidad</a>
        </section>
      </main>

      <Footer />

      <ImageZoomModal item={zoomItem} onClose={() => setZoomItem(null)} />

      <div className="floating-actions">
        <a href="https://www.instagram.com/TU_USUARIO" target="_blank" rel="noopener noreferrer" className="instagram-float">
          <FaInstagram />
        </a>
        <a href="https://wa.me/573013090185?text=Hola%20quiero%20consultar%20por%20un%20producto" target="_blank" rel="noopener noreferrer" className="whatsapp-float">
          <FaWhatsapp />
        </a>
      </div>
    </>
  );
}
