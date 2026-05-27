// ── main.jsx ──────────────────────────────────────────────────────────────────
// Entry point de la app. Aquí se importa el CSS global UNA SOLA VEZ.
// Antes: cada componente inyectaba su propio <style> con cientos de líneas.
// ─────────────────────────────────────────────────────────────────────────────

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ── CSS global (importar aquí, no dentro de los componentes) ──────────────────
import './styles/global.css';

// ── Páginas ───────────────────────────────────────────────────────────────────
// NOTA: Renombrar los archivos quitando el sufijo _prd2 antes de importar.
//   mv LaFamaBarber_prd2.jsx LaFamaBarber.jsx
//   mv AdminPanel_prd2.jsx AdminPanel.jsx
import LaFamaBarber from './LaFamaBarber.jsx';
import AdminPanel   from './AdminPanel.jsx';
import BarberView   from './BarberView.jsx';

// ── Render ────────────────────────────────────────────────────────────────────
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<LaFamaBarber />} />
        <Route path="/admin"   element={<AdminPanel />} />
        <Route path="/barbero" element={<BarberView />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
