import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API, getImageUrl } from "./services/api";
import "./styles/PublicProducts.css";
import "./styles/PublicProductsFilters.css";

export default function PublicProducts() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState("TODOS");

  useEffect(() => {
    fetch(`${API}/productos`).then(res => res.ok ? res.json() : []).then(data => setProductos(Array.isArray(data) ? data : [])).catch(() => setProductos([])).finally(() => setLoading(false));
  }, []);

  const categorias = ["TODOS", ...new Set(productos.map(producto => producto.categoria).filter(Boolean))];
  const productosFiltrados = categoria === "TODOS" ? productos : productos.filter(producto => producto.categoria === categoria);

  return <main className="public-products-page">
    <header className="public-products-header">
      <button className="public-brand" onClick={() => navigate("/")}>LA <span>FAMA</span> BARBER</button>
      <button className="public-back" onClick={() => navigate("/")}>← Volver al inicio</button>
    </header>
    <section className="public-products-hero">
      <span className="public-products-kicker">Disponibles en nuestra tienda</span>
      <h1>PRODUCTOS<br /><span>LA FAMA</span></h1>
      <p>Productos seleccionados para cuidar tu estilo entre cada visita.</p>
    </section>
    {!loading && categorias.length > 1 && <nav className="public-products-filters" aria-label="Filtrar productos por categoría">
      {categorias.map(item => <button key={item} className={categoria === item ? "active" : ""} onClick={() => setCategoria(item)}>{item}</button>)}
    </nav>}
    <section className="public-products-grid" aria-label="Catálogo de productos">
      {loading && <div className="public-products-empty">Cargando productos…</div>}
      {!loading && productosFiltrados.map(producto => <article className="public-product-card" key={producto.id}>
        <div className="public-product-image">
          {producto.badge && <span>{producto.badge}</span>}
          {producto.imagen ? <img src={getImageUrl(producto.imagen)} alt={producto.nombre} onError={event => { event.currentTarget.style.display = "none"; }} /> : <div className="public-product-placeholder">✦</div>}
        </div>
        <div className="public-product-body">
          {producto.categoria && <div className="public-product-category">{producto.categoria}</div>}
          <h2>{producto.nombre}</h2>
          {producto.descripcion && <p>{producto.descripcion}</p>}
          <div className="public-product-footer"><strong>${Number(producto.precio).toLocaleString("es-CO")}</strong><span>Disponible en tienda</span></div>
        </div>
      </article>)}
      {!loading && productos.length === 0 && <div className="public-products-empty">Pronto encontrarás nuestros productos aquí.</div>}
      {!loading && productos.length > 0 && productosFiltrados.length === 0 && <div className="public-products-empty">No hay productos en esta categoría.</div>}
    </section>
    <section className="public-products-visit">
      <div><span>¿Quieres uno?</span><h2>VISÍTANOS EN LA TIENDA</h2></div>
      <a href="https://wa.me/573013090185?text=Hola%2C%20quiero%20consultar%20por%20un%20producto" target="_blank" rel="noreferrer">Consultar disponibilidad</a>
    </section>
  </main>;
}
