// ── main.jsx ──────────────────────────────────────────────────────────────────
// Entry point de la app. Aquí se importa el CSS global UNA SOLA VEZ.
// Antes: cada componente inyectaba su propio <style> con cientos de líneas.
// ─────────────────────────────────────────────────────────────────────────────

import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// ── CSS global (importar aquí, no dentro de los componentes) ──────────────────
import './styles/global.css';
import './styles/App.css'
import './styles/LaFamaBarber.css';
import './styles/Barberview.css';



// ── Páginas ───────────────────────────────────────────────────────────────────

import LaFamaBarber from './LaFamaBarber.jsx';
import AdminPanel from './AdminPanel.jsx';
import RecepcionPanel from './RecepcionPanel.jsx';
import BarberView from './BarberView.jsx';
import PublicProducts from './PublicProducts.jsx';
import PublicMembresias from './PublicMembresias.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// ── Render ────────────────────────────────────────────────────────────────────
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LaFamaBarber />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/recepcion" element={<RecepcionPanel />} />
        <Route path="/productos" element={<PublicProducts />} />
        <Route path="/membresias" element={<PublicMembresias />} />
        <Route path="/inventario" element={<AdminPanel panel="productos" />} />
        <Route path="/barbero" element={<BarberView />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
