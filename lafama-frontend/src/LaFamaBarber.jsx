import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp, FaInstagram, FaPhoneAlt, FaCut } from "react-icons/fa";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ImageZoomModal from "./components/ImageZoomModal";
import Membresias from "./components/Membresias";
import ReservaModal from "./components/ReservaModal";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
gsap.registerPlugin(ScrollTrigger);


const SERVICIOS_IMGS = {
  'corte': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
  'barba': 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80',
  'fade': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80',
  'afeitado': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
  'tratamiento': 'https://plus.unsplash.com/premium_photo-1661596299880-8b888ad975f7?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'default': 'https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=800&q=80',
};

function getServicioImg(nombre) {
  const n = nombre.toLowerCase();
  if (n.includes('fade') || n.includes('degra')) return SERVICIOS_IMGS.fade;
  if (n.includes('barba')) return SERVICIOS_IMGS.barba;
  if (n.includes('afeitado')) return SERVICIOS_IMGS.afeitado;
  if (n.includes('tratamiento')) return SERVICIOS_IMGS.tratamiento;
  if (n.includes('corte')) return SERVICIOS_IMGS.corte;
  return SERVICIOS_IMGS.default;
}

function getImageUrl(img) {
  if (!img) return '';
  if (img.startsWith('/')) {
    const base = API.replace('/api', '');
    return `${base}${img}`;
  }
  return img;
}

function formatFechaLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getIcon(nombre) {
  const n = nombre.toLowerCase();
  if (n.includes('barba')) return '🪒';
  if (n.includes('fade') || n.includes('degra')) return '⚡';
  if (n.includes('tratamiento')) return '🌿';
  if (n.includes('afeitado')) return '💈';
  return '✂';
}
function formatPrecio(p) { return '$' + Number(p).toLocaleString('es-CO'); }
function formatFecha(d) { return new Date(d).toLocaleDateString('es-CO', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }); }

function Cursor() {
  const ref = useRef(null);
  useEffect(() => {
    const move = (e) => { if (ref.current) { ref.current.style.left = e.clientX - 5 + 'px'; ref.current.style.top = e.clientY - 5 + 'px'; } };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return <div ref={ref} className="cursor" />;
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return <div className={`toast ${type}`}>{msg}</div>;
}

function ModalAuth({ onClose, onLogin }) {
  const [modo, setModo] = useState('login');
  const [form, setForm] = useState({ nombre: '', email: '', password: '', telefono: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      const url = modo === 'login' ? `${API}/auth/login` : `${API}/auth/registro`;
      const body = modo === 'login' ? { email: form.email, password: form.password } : form;
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await r.json();
      if (!r.ok) { setError(data.error || data.errores?.[0]?.mensaje || 'Error'); }
      else { localStorage.setItem('token', data.token); localStorage.setItem('usuario', JSON.stringify(data.usuario)); onLogin(data.usuario, data.token); onClose(); }
    } catch { setError('Error de conexión con el servidor'); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-title">{modo === 'login' ? 'BIENVENIDO' : 'ÚNETE'}</div>
        <div className="modal-sub">{modo === 'login' ? 'Inicia sesión para agendar tu cita' : 'Crea tu cuenta en La Fama Barber'}</div>

        {/* Botón Google */}
        <button
          onClick={() => window.location.href = `${API.replace('/api', '')}/api/auth/google`}
          style={{
            width: '100%', background: 'none',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'var(--blanco)', padding: '13px',
            fontFamily: "'Oswald', sans-serif", fontSize: 13,
            letterSpacing: 2, textTransform: 'uppercase',
            cursor: 'pointer', marginBottom: 16,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10, transition: 'border-color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--rojo)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuar con Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: 11, color: 'var(--gris)', letterSpacing: 2 }}>O</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {error && <div className="alert">{error}</div>}
        {modo === 'registro' && <input className="form-input" placeholder="Nombre completo" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />}
        <input className="form-input" placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="form-input" placeholder="Contraseña" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        {modo === 'registro' && <input className="form-input" placeholder="Teléfono (opcional)" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />}
        <button className="btn-primary" style={{ width: '100%' }} onClick={submit} disabled={loading}>{loading ? 'PROCESANDO...' : modo === 'login' ? 'ENTRAR' : 'CREAR CUENTA'}</button>
        <div className="modal-toggle">
          {modo === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button onClick={() => { setModo(modo === 'login' ? 'registro' : 'login'); setError(''); }}>{modo === 'login' ? 'Regístrate' : 'Inicia sesión'}</button>
        </div>
      </div>
    </div>
  );
}

const CAROUSEL_SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1600&q=80',
    nombre: 'Fade Clásico',
    desc: 'El corte atemporal que nunca pasa de moda'
  },
  {
    img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1600&q=80',
    nombre: 'Degradado Alto',
    desc: 'Precisión milimétrica en cada línea'
  },
  {
    img: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1600&q=80',
    nombre: 'Barba Estilizada',
    desc: 'Perfilado y arreglo profesional de barba'
  },
  {
    img: 'https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=1600&q=80',
    nombre: 'Corte Texturizado',
    desc: 'Volumen y estilo para cabello grueso'
  },
  {
    img: 'https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?w=1600&q=80',
    nombre: 'Skin Fade',
    desc: 'Degradado hasta la piel con acabado impecable'
  }
];

function TimedVideoStack({ sources = [], interval = 5000, className = '' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef([]);

  useEffect(() => {
    if (sources.length < 2) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % sources.length);
    }, interval);
    return () => clearInterval(timer);
  }, [sources.length, interval]);

  useEffect(() => {
    const current = videoRefs.current[activeIndex];
    if (current) {
      current.currentTime = 0;
      current.play().catch(() => { });
    }
  }, [activeIndex]);

  return (
    <div className={`timed-video-stack ${className}`}>
      {sources.map((src, i) => (
        <video
          key={src}
          ref={(el) => (videoRefs.current[i] = el)}
          src={src}
          className={`timed-video ${i === activeIndex ? 'is-active' : ''}`}
          muted
          loop
          playsInline
          autoPlay
        />
      ))}
    </div>
  );
}

function BarberExperience() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.from('.experience-kicker, .experience-title, .experience-lead', {
        y: 28,
        opacity: 0,
        duration: 0.85,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 72%',
        },
      });

      gsap.from('.experience-hero-card, .experience-stack-card', {
        y: 54,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.experience-grid',
          start: 'top 78%',
        },
      });

      gsap.to('.experience-img', {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.fromTo('.experience-rule', { scaleX: 0 }, {
        scaleX: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.experience-rule',
          start: 'top 86%',
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className="experience-section" ref={sectionRef}>
      <div className="experience-inner">
        <div className="experience-head">
          <div>
            <div className="experience-kicker">Experiencia La Fama</div>
            <h2 className="experience-title">RITUAL DE<br /><span>PRECISION</span></h2>
          </div>
          <p className="experience-lead">
            En nuestra barbería te escuchamos primero: hablamos sobre tu estilo, tu rutina y lo que quieres proyectar. Con diagnóstico personalizado y técnica cuidadosa te damos un corte que te queda cómodo, auténtico y fácil de llevar. Ven como eres, sal con la confianza de verte exactamente como quieres.  </p>
        </div>

        <div className="experience-grid">
          <article className="experience-hero-card">
            <div className="experience-img primary" />
            <div className="experience-card-content">
              <div className="experience-card-num">01</div>
              <div className="experience-card-title">Diagnostico del estilo</div>
              <div className="experience-card-copy">Antes del corte se lee forma, textura y referencia para que el resultado tenga intencion.</div>
            </div>
          </article>

          <div className="experience-stack">
            <article className="experience-stack-card">
              <div className="experience-img secondary" />
              <div className="experience-card-content">
                <div className="experience-card-num">02</div>
                <div className="experience-card-title">Tecnica limpia</div>
                <div className="experience-card-copy">Degradado, lineas y simetria trabajadas por capas.</div>
              </div>
            </article>

            <article className="experience-stack-card">
              <div className="experience-img tertiary" />
              <div className="experience-card-content">
                <div className="experience-card-num">03</div>
                <div className="experience-card-title">Acabado final</div>
                <div className="experience-card-copy">Producto, peinado y detalle para salir listo.</div>
              </div>
            </article>

            {/* card de video */}
            <article className="experience-stack-card">
              <TimedVideoStack
                sources={['/src/assets/videos/Barber_cutting_hair_cinematic_202607222004.mp4', '/src/assets/videos/Barberia_La_Fama_commercial_202607241700.mp4']}
                interval={10000}
                className="experience-img quaternary"
              />
              <div className="experience-card-content">
                <div className="experience-card-num">04</div>
                <div className="experience-card-title">Resultado en movimiento</div>
                <div className="experience-card-copy">Mira el antes y despues en video, directo desde el sillon.</div>
              </div>
            </article>
          </div>
        </div>

        <div className="experience-rule" />
      </div>
    </section>
  );
}

function HeroCarousel({ onReservar, onServicios }) {
  const [slides, setSlides] = useState(CAROUSEL_SLIDES);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const progressRef = useRef(null);
  const DURATION = 15000;

  useEffect(() => {
    fetch(`${API}/imagenes/carrusel`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data.map(img => ({
            img: getImageUrl(img.url),
            nombre: img.nombre,
            desc: img.descripcion || ''
          })));
        }
      })
      .catch(() => { });
  }, []);

  const goTo = (idx) => {
    setCurrent((idx + slides.length) % slides.length);
    setProgress(0);
  };

  const startAuto = () => {
    clearInterval(intervalRef.current);
    clearInterval(progressRef.current);
    setProgress(0);
    let p = 0;
    progressRef.current = setInterval(() => {
      p += 100 / (DURATION / 100);
      if (p >= 100) p = 100;
      setProgress(p);
    }, 100);
    intervalRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % slides.length);
      setProgress(0);
      p = 0;
    }, DURATION);
  };

  useEffect(() => {
    startAuto();
    return () => { clearInterval(intervalRef.current); clearInterval(progressRef.current); };
  }, [slides]);

  const handleNav = (idx) => { goTo(idx); startAuto(); };

  return (
    <section className="hero">
      {slides.map((s, i) => (
        <div key={i} className={`carousel-slide ${i === current ? 'active' : ''}`}
          style={{ backgroundImage: `url(${s.img})` }} />
      ))}

      <div className="hero-content">
        <div className="hero-tag">Medellín · Est. 2025</div>
        <h1 className="hero-h1">EL ESTILO<br /><span className="red">NO SE</span><br />IMPROVISA</h1>
        <div className="hero-slogan">—LA FAMA BARBER<br /> All Stars —</div>
        <div className="hero-corte-label">
          Destacado: <span className="hero-corte-name">{slides[current]?.nombre}</span>
          <span style={{ color: 'var(--gris)', fontWeight: 300, fontSize: 12 }}>
            — {slides[current]?.desc}
          </span>
        </div>
        <div className="hero-actions">
          <button className="btn-primary" onClick={onReservar}>RESERVA AHORA</button>
          <button className="btn-secondary" onClick={onServicios}>VER SERVICIOS</button>
        </div>
      </div>

      <button className="carousel-arrow prev" onClick={() => handleNav(current - 1)}>‹</button>
      <button className="carousel-arrow next" onClick={() => handleNav(current + 1)}>›</button>

      <div className="carousel-counter">
        <div className="carousel-dots">
          {slides.map((_, i) => (
            <div key={i} className={`carousel-dot ${i === current ? 'active' : ''}`}
              onClick={() => handleNav(i)} />
          ))}
        </div>
      </div>

      <div className="hero-stats">
        <div className="stat"><div className="stat-num">10<span>+</span></div><div className="stat-label">Años de experiencia</div></div>
        <div className="stat"><div className="stat-num">5K<span>+</span></div><div className="stat-label">Clientes atendidos</div></div>
      </div>

      <div className="carousel-thumbs">
        {slides.map((s, i) => (
          <div key={i} className={`carousel-thumb ${i === current ? 'active' : ''}`}
            style={{ backgroundImage: `url(${s.img})` }}
            onClick={() => handleNav(i)} />
        ))}
      </div>

      <div className="carousel-progress" style={{ width: `${progress}%` }} />
    </section>
  );
}


export default function App() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState('');
  const [servicios, setServicios] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [misCitas, setMisCitas] = useState([]);
  const [loadingSvcs, setLoadingSvcs] = useState(true);
  const [loadingBarbs, setLoadingBarbs] = useState(true);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [selectedServicios, setSelectedServicios] = useState([]);
  const [selectedBarbero, setSelectedBarbero] = useState(null);
  const [selectedFecha, setSelectedFecha] = useState(null);
  const [selectedHora, setSelectedHora] = useState('');
  const [slotsDisponibles, setSlotsDisponibles] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [nota, setNota] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [toast, setToast] = useState(null);
  const [vista, setVista] = useState('home');
  const [miMembresia, setMiMembresia] = useState(null);
  const [planesMembresia, setPlanesMembresia] = useState([]);
  const [productos, setProductos] = useState([]);
  const [zoomItem, setZoomItem] = useState(null);
  const [showReservaModal, setShowReservaModal] = useState(false);
  const [flippedServicios, setFlippedServicios] = useState(() => new Set());

  useEffect(() => {
    // Capturar token de Google OAuth
    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get('token');
    const googleUsuario = params.get('usuario');
    if (googleToken && googleUsuario) {
      const usr = JSON.parse(decodeURIComponent(googleUsuario));
      localStorage.setItem('token', googleToken);
      localStorage.setItem('usuario', JSON.stringify(usr));
      setToken(googleToken);
      setUsuario(usr);
      window.history.replaceState({}, '', '/');
      sessionStorage.setItem('bienvenido', usr.nombre);
      if (usr.rol === 'ADMIN') navigate('/admin');
      else if (usr.rol === 'RECEPCION') navigate('/recepcion');
    } else {
      const t = localStorage.getItem('token');
      const u = localStorage.getItem('usuario');
      if (t && u) {
        const usr = JSON.parse(u);
        if (usr.rol !== 'ADMIN' && usr.rol !== 'RECEPCION') {
          setToken(t);
          setUsuario(usr);
        }
      }
      // Mostrar toast de bienvenida si viene de Google
      const nombre = sessionStorage.getItem('bienvenido');
      if (nombre) {
        setTimeout(() => showToast(`¡Bienvenido, ${nombre}! 👋`), 300);
        sessionStorage.removeItem('bienvenido');
      }
    }
    fetch(`${API}/servicios`).then(r => r.json()).then(d => setServicios(d)).finally(() => setLoadingSvcs(false));
    fetch(`${API}/barberos`).then(r => r.json()).then(d => setBarberos(d)).finally(() => setLoadingBarbs(false));
    fetch(`${API}/membresias`).then(r => r.json()).then(d => { if (Array.isArray(d)) setPlanesMembresia(d); }).catch(() => { });
    fetch(`${API}/productos`).then(r => r.json()).then(d => { if (Array.isArray(d)) setProductos(d); }).catch(() => { });

    // Señales que deja el Navbar cuando te trae de otra página (ej. /productos)
    const scrollTarget = sessionStorage.getItem('scrollTarget');
    const targetVista = sessionStorage.getItem('targetVista');
    const openAuth = sessionStorage.getItem('openAuth');
    if (scrollTarget) {
      sessionStorage.removeItem('scrollTarget');
      setTimeout(() => document.getElementById(scrollTarget)?.scrollIntoView({ behavior: 'smooth' }), 300);
    }
    if (targetVista) {
      sessionStorage.removeItem('targetVista');
      setVista(targetVista);
    }
    if (openAuth) {
      sessionStorage.removeItem('openAuth');
      setShowAuth(true);
    }
  }, []);

  useEffect(() => { if (token) { fetchMisCitas(); fetchMiMembresia(); } }, [token]);

  const fetchMiMembresia = async () => {
    try {
      const r = await fetch(`${API}/membresias/mi-membresia-detalle`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await r.json();
      setMiMembresia(data || null);
    } catch { }
  };

  const fetchMisCitas = async () => {
    setLoadingCitas(true);
    try {
      const r = await fetch(`${API}/citas/mis-citas`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setMisCitas(Array.isArray(d) ? d : []);
    } catch { }
    setLoadingCitas(false);
  };

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const toggleServicio = (s) => setSelectedServicios(prev => prev.find(x => x.id === s.id) ? prev.filter(x => x.id !== s.id) : [...prev, s]);

  const toggleFlip = (id) => setFlippedServicios(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const totalPrecio = selectedServicios.reduce((s, x) => s + x.precio, 0);

  const reservar = async () => {
    if (!usuario) { setShowAuth(true); return; }
    if (!selectedServicios.length) { showToast('Selecciona al menos un servicio', 'error'); return; }
    if (!selectedBarbero) { showToast('Elige un barbero', 'error'); return; }
    if (!selectedFecha) { showToast('Selecciona una fecha', 'error'); return; }
    if (!selectedHora) { showToast('Selecciona un horario', 'error'); return; }
    try {
      const r = await fetch(`${API}/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ barberoId: selectedBarbero.id, fecha: formatFechaLocal(selectedFecha), hora: selectedHora, servicioIds: selectedServicios.map(s => s.id), nota })
      });
      const data = await r.json();
      if (!r.ok) { showToast(data.error || 'Error al agendar', 'error'); }
      else { setConfirmData(data); setShowConfirm(true); setShowReservaModal(false); setSelectedServicios([]); setSelectedBarbero(null); setSelectedFecha(null); setSelectedHora(''); setNota(''); fetchMisCitas(); }
    } catch { showToast('Error de conexión', 'error'); }
  };

  const cancelarCita = async (id) => {
    try {
      const r = await fetch(`${API}/citas/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { showToast('Cita cancelada'); fetchMisCitas(); }
      else showToast('Error al cancelar', 'error');
    } catch { showToast('Error de conexión', 'error'); }
  };

  const fetchSlotsDisponibles = async () => {
    if (!selectedBarbero || !selectedFecha || !selectedServicios.length) { setSlotsDisponibles([]); return; }
    setLoadingSlots(true);
    try {
      const fecha = formatFechaLocal(selectedFecha);
      const servicioIds = selectedServicios.map(s => s.id).join(',');
      const r = await fetch(`${API}/citas/slots-disponibles?barberoId=${selectedBarbero.id}&fecha=${fecha}&servicioIds=${servicioIds}`);
      const data = await r.json();
      setSlotsDisponibles(Array.isArray(data) ? data : []);
    } catch { setSlotsDisponibles([]); }
    setLoadingSlots(false);
  };

  useEffect(() => {
    setSelectedHora('');
    fetchSlotsDisponibles();
  }, [selectedBarbero, selectedFecha, selectedServicios]);

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('usuario'); setUsuario(null); setToken(''); setMisCitas([]); setVista('home'); showToast('Sesión cerrada'); };

  const tickerText = '✦ LA FAMA BARBER ✦ ALL STARS ✦ MEDELLÍN ✦ EST. 2025 ✦ CORTES DE ÉLITE ✦ LA FAMA BARBER ✦ ALL STARS ✦ MEDELLÍN ✦ EST. 2025 ✦ CORTES DE ÉLITE ✦ ';


  return (
    <>

      <div className="noise" />
      <Cursor />

      <Navbar
        usuario={usuario}
        miMembresia={miMembresia}
        onMisCitas={() => setVista('citas')}
        onLogout={logout}
        onEntrar={() => setShowAuth(true)}
      />

      {vista === 'home' && (<>
        <HeroCarousel
          onReservar={() => setShowReservaModal(true)}
          onServicios={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
        />

        <section className="qs-section" id="nosotros">
          <div className="qs-img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=85')" }} />
          <div className="qs-text">
            <span className="section-tag">Bienvenido</span>
            <h2 className="section-title">QUIÉNES<br /><span style={{ color: 'var(--rojo)' }}>SOMOS</span></h2>
            <p className="qs-lead">
              La Fama Barber nació en Medellín con una idea simple: el estilo no se improvisa, se construye con técnica, tiempo y buena conversación. Somos un equipo de barberos —All Stars— que se especializó en fades, diseño de barba y cortes clásicos, para que cada visita se sienta menos como un trámite y más como un ritual.
            </p>
            <p className="qs-copy">
              No trabajamos en serie. Cada corte empieza escuchando qué quieres proyectar, y termina con un acabado que puedas mantener fácil en tu día a día. Por eso nuestros clientes vuelven.
            </p>
            <div className="qs-stats">
              <div className="qs-stat"><span className="qs-stat-num">10<b>+</b></span><span className="qs-stat-label">Años de oficio</span></div>
              <div className="qs-stat"><span className="qs-stat-num">5K<b>+</b></span><span className="qs-stat-label">Clientes atendidos</span></div>
              <div className="qs-stat"><span className="qs-stat-num">100<b>%</b></span><span className="qs-stat-label">A tu estilo</span></div>
            </div>
          </div>
        </section>

        <BarberExperience />

        <div className="ticker"><span className="ticker-inner">{tickerText}{tickerText}</span></div>

        <section className="section" id="servicios">
          <div className="section-header">
            <span className="section-tag">Lo que hacemos</span>
            <h2 className="section-title">NUESTROS<br /><span style={{ color: 'var(--rojo)' }}>SERVICIOS</span></h2>

          </div>
          {loadingSvcs ? <div className="loading"><div className="spinner" />Cargando servicios...</div> :
            <div className="servicios-grid">
              {servicios.map(s => {
                const sel = selectedServicios.find(x => x.id === s.id);
                const flipped = flippedServicios.has(s.id);
                return (
                  <div key={s.id} className="servicio-flip-wrap">
                    <div className={`servicio-card ${flipped ? 'flipped' : ''}`} onClick={() => toggleFlip(s.id)}>
                      <div className="servicio-face servicio-face-front">
                        <div className="servicio-card-bg" style={{ backgroundImage: `url(${s.imagen ? getImageUrl(s.imagen) : getServicioImg(s.nombre)})` }} />
                        <div className="servicio-tag-top">{getIcon(s.nombre)} {s.duracion} min</div>
                        {sel && <div className="servicio-check">✓</div>}
                        <div className="servicio-card-content">
                          <div className="servicio-nombre">{s.nombre}</div>
                          <div className="servicio-footer">
                            <div className="servicio-precio">{formatPrecio(s.precio)}</div>
                            <div className="servicio-flip-hint">Ver detalle ↻</div>
                          </div>
                        </div>
                      </div>
                      <div className="servicio-face servicio-face-back">
                        <div>
                          <div className="servicio-nombre">{s.nombre}</div>
                          <div className="servicio-duracion" style={{ marginBottom: 12 }}>{s.duracion} minutos</div>
                          <p className="servicio-desc-back">{s.descripcion}</p>
                        </div>
                        <div className="servicio-back-footer">
                          <div className="servicio-precio">{formatPrecio(s.precio)}</div>
                          <button
                            type="button"
                            className={`servicio-select-btn ${sel ? 'selected' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleServicio(s); }}
                          >
                            {sel ? '✓ Elegido' : 'Elegir'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </section>

        <section className="section" style={{ background: 'var(--negro2)' }}>
          <div className="section-header">
            <span className="section-tag">El equipo</span>
            <h2 className="section-title">NUESTROS<br /> <span style={{ color: 'var(--rojo)' }}>BARBEROS</span></h2>

          </div>
          {loadingBarbs ? <div className="loading"><div className="spinner" />Cargando barberos...</div> :
            <div className="barberos-grid">
              {barberos.map((b, i) => (
                <div key={b.id} className={`barbero-card ${selectedBarbero?.id === b.id ? 'selected' : ''}`} onClick={() => setSelectedBarbero(b)}>
                  {b.foto ? (
                    <div className="barbero-card-bg" style={{ backgroundImage: `url(${getImageUrl(b.foto)})` }} />
                  ) : (
                    <div className="barbero-card-placeholder">{['👨🏻', '👨🏽', '👨🏾'][i % 3]}</div>
                  )}
                  <div className="barbero-selected-badge">✓</div>
                  <div className="barbero-card-content">
                    <div className="barbero-esp-tag">{b.especialidad}</div>
                    <div className="barbero-nombre">{b.nombre}</div>
                    {b.descripcion && <div className="barbero-desc">{b.descripcion}</div>}
                  </div>
                </div>
              ))}
            </div>
          }
        </section>

        <section className="section booking-section booking-cta-section" id="booking">
          <div className="section-header">
            <span className="section-tag">Agenda tu turno</span>
            <h2 className="section-title">RESERVA<br /><span style={{ color: 'var(--rojo)' }}>TU CITA</span></h2>
          </div>

          <div className="booking-cta-box">
            {(selectedServicios.length > 0 || selectedBarbero) ? (
              <div className="booking-cta-resumen">
                {selectedServicios.length > 0 && <span>{selectedServicios.map(s => s.nombre).join(' + ')}</span>}
                {selectedBarbero && <span>con {selectedBarbero.nombre}</span>}
              </div>
            ) : (
              <p className="booking-cta-copy">Elige tus servicios y barbero arriba, o dale directo a reservar y lo eliges en el paso a paso.</p>
            )}
            <button className="btn-reservar" style={{ margin: 0 }} onClick={() => setShowReservaModal(true)}>
              CONTINUAR CON TU RESERVA →
            </button>
          </div>
        </section>
      </>)}

      {vista === 'citas' && (
        <section className="section" style={{ paddingTop: '120px' }}>
          <div className="section-header">
            <span className="section-tag">Tu historial</span>
            <h2 className="section-title">MIS<br />CITAS</h2>
          </div>

          {miMembresia && (
            <div style={{ background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.25)', padding: '20px 28px', marginBottom: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 28 }}>⭐</span>
                <div>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--blanco)' }}>
                    {miMembresia.membresia?.nombre}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gris)', marginTop: 3, letterSpacing: 1 }}>
                    {miMembresia.membresia?.cortesIncluidos} cortes incluidos · {miMembresia.membresia?.descuento}% descuento en servicios
                  </div>
                  {miMembresia.membresia?.descripcion && (
                    <div style={{ fontSize: 11, color: 'var(--gris)', marginTop: 2, fontStyle: 'italic' }}>{miMembresia.membresia.descripcion}</div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 28 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: 'var(--rojo)', lineHeight: 1 }}>{miMembresia.cortesUsados}</div>
                  <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gris)' }}>Usados</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: 'var(--blanco)', lineHeight: 1 }}>{Math.max(0, miMembresia.membresia?.cortesIncluidos - miMembresia.cortesUsados)}</div>
                  <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gris)' }}>Disponibles</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: 'var(--gris)', lineHeight: 1.2 }}>{new Date(miMembresia.fechaFin).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gris)' }}>Vence</div>
                </div>
              </div>
            </div>
          )}
          {loadingCitas ? <div className="loading"><div className="spinner" />Cargando...</div> :
            misCitas.length === 0 ? <div className="empty-state">No tienes citas agendadas aún.</div> :
              <div className="citas-grupos">
                {Object.entries(
                  misCitas.reduce((grupos, c) => {
                    const key = c.servicios?.map(s => s.servicio?.nombre).join(' + ') || 'Servicio';
                    (grupos[key] = grupos[key] || []).push(c);
                    return grupos;
                  }, {})
                ).map(([servicio, citasGrupo]) => (
                  <div key={servicio} className="cita-grupo">
                    <div className="cita-grupo-header">
                      <div className="cita-grupo-nombre">{servicio}</div>
                      <div className="cita-grupo-count">{citasGrupo.length}×</div>
                    </div>
                    <div className="cita-grupo-lista">
                      {citasGrupo.map(c => (
                        <div key={c.id} className="cita-item">
                          <span className={`cita-item-estado estado-${c.estado}`}>{c.estado}</span>
                          <div className="cita-item-info">
                            <span className="cita-item-detalle">👤 {c.barbero?.nombre}</span>
                            <span className="cita-item-detalle">📅 {formatFecha(c.fecha)}</span>
                            <span className="cita-item-detalle">🕐 {c.hora}</span>
                            {c.nota && <span className="cita-item-detalle">📝 {c.nota}</span>}
                          </div>
                          {c.estado === 'PENDIENTE' && <button className="cita-item-cancelar" onClick={() => cancelarCita(c.id)}>Cancelar</button>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
          }
        </section>
      )}



      {/* Sección de membresías trasladada a la ruta pública /membresias. */}
      {false && vista === 'home' && <Membresias planesMembresia={planesMembresia} />}

      {/* Catálogo trasladado a la ruta pública /productos. */}
      {false && vista === 'home' && (
        <section className="pf-section" id="productos">
          <div className="section-header">
            <span className="section-tag">Lo que usamos</span>
            <h2 className="section-title">NUESTROS<br /><span style={{ color: 'var(--rojo)' }}>PRODUCTOS</span></h2>
          </div>
          <div className="pf-grid">
            {productos.length > 0 ? productos.map((p, i) => (
              <div key={p.id} className="pf-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="pf-glow" />
                {p.badge && <span className="pf-badge">{p.badge}</span>}
                <button
                  type="button"
                  className="pf-img-wrap img-zoom-trigger"
                  onClick={() => setZoomItem({
                    img: getImageUrl(p.imagen) || 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1200&q=90&fit=crop',
                    title: p.nombre,
                    sub: p.categoria || 'Producto',
                    desc: p.descripcion,
                    price: `$${Number(p.precio).toLocaleString('es-CO')}`,
                  })}
                >
                  <img
                    src={getImageUrl(p.imagen) || 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=300&q=90&fit=crop'}
                    alt={p.nombre}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=300&q=90&fit=crop'; }}
                  />
                </button>
                <div className="pf-shadow" />
                <div className="pf-nombre">{p.nombre}</div>
                {p.categoria && <div className="pf-cat">{p.categoria}</div>}
                <div className="pf-divider" />
                {p.descripcion && <div className="pf-desc">{p.descripcion}</div>}
                <div className="pf-footer">
                  <div className="pf-precio">${Number(p.precio).toLocaleString('es-CO')}</div>
                  <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gris)', fontFamily: "'Oswald',sans-serif" }}>En tienda</div>
                </div>
              </div>
            )) : (
              /* Productos por defecto si no hay en la BD */
              <>
                <div className="pf-card">
                  <div className="pf-glow" />
                  <span className="pf-badge">Top seller</span>
                  <div className="pf-img-wrap">
                    <img src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=300&q=90&fit=crop" alt="Pomada" />
                  </div>
                  <div className="pf-shadow" />
                  <div className="pf-nombre">Pomada</div>
                  <div className="pf-cat">Fijación & Brillo</div>
                  <div className="pf-divider" />
                  <div className="pf-desc">Fijación fuerte con acabado brillante. Ideal para estilos clásicos y modernos.</div>
                  <div className="pf-footer">
                    <div className="pf-precio">$35.000</div>
                    <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gris)', fontFamily: "'Oswald',sans-serif" }}>En tienda</div>
                  </div>
                </div>
                <div className="pf-card">
                  <div className="pf-glow" />
                  <div className="pf-img-wrap">
                    <img src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=300&q=90&fit=crop" alt="Navaja" />
                  </div>
                  <div className="pf-shadow" />
                  <div className="pf-nombre">Navaja</div>
                  <div className="pf-cat">Afeitado Clásico</div>
                  <div className="pf-divider" />
                  <div className="pf-desc">Acero inoxidable de alta gama. Afeitado limpio y preciso.</div>
                  <div className="pf-footer">
                    <div className="pf-precio">$85.000</div>
                    <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gris)', fontFamily: "'Oswald',sans-serif" }}>En tienda</div>
                  </div>
                </div>
                <div className="pf-card">
                  <div className="pf-glow" />
                  <div className="pf-img-wrap">
                    <img src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&q=90&fit=crop" alt="Aftershave" />
                  </div>
                  <div className="pf-shadow" />
                  <div className="pf-nombre">Aftershave</div>
                  <div className="pf-cat">Cuidado & Fragancia</div>
                  <div className="pf-divider" />
                  <div className="pf-desc">Calma la piel tras el afeitado. Aroma amaderado con aloe y mentol.</div>
                  <div className="pf-footer">
                    <div className="pf-precio">$48.000</div>
                    <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gris)', fontFamily: "'Oswald',sans-serif" }}>En tienda</div>
                  </div>
                </div>
                <div className="pf-card">
                  <div className="pf-glow" />
                  <span className="pf-badge">Nuevo</span>
                  <div className="pf-img-wrap">
                    <img src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&q=90&fit=crop" alt="Cera" />
                  </div>
                  <div className="pf-shadow" />
                  <div className="pf-nombre">Cera Mat</div>
                  <div className="pf-cat">Control & Textura</div>
                  <div className="pf-divider" />
                  <div className="pf-desc">Acabado mate natural con fijación media. Perfecta para looks texturizados.</div>
                  <div className="pf-footer">
                    <div className="pf-precio">$32.000</div>
                    <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gris)', fontFamily: "'Oswald',sans-serif" }}>En tienda</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      )}


      {/* ── SECCIÓN DIRECCIÓN ── */}
      {vista === 'home' && <section className="direccion-section">
        <div className="direccion-info">
          <span className="direccion-tag">Encuéntranos</span>
          <h2 className="direccion-title">ESTAMOS<br /><span style={{ color: 'var(--rojo)' }}>UBICADOS</span></h2>

          <div className="direccion-item">
            <span className="direccion-icon">📍</span>
            <div>
              <div className="direccion-label">Dirección</div>
              <div className="direccion-valor">Calle 64B #95-26, Robledo <br />Medellín, Colombia</div>
            </div>
          </div>

          <div className="direccion-item">
            <span className="direccion-icon">🕐</span>
            <div>
              <div className="direccion-label">Horario</div>
              <div className="direccion-valor">Lun – Sáb · 9:00am – 9:00pm<br />Dom · 9:00am – 4:00pm</div>
            </div>
          </div>

          <div className="direccion-item">
            <span className="direccion-icon">📞</span>
            <div>
              <div className="direccion-label">Teléfono</div>
              <div className="direccion-valor">+57 301 309 0185</div>
            </div>
          </div>
        </div>

        <iframe
          className="direccion-mapa"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.8602896787675!2d-75.60575612742956!3d6.282090501833819!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4429930136ca0d%3A0x713dffa43f73edf1!2sLa%20Fama%20Barbershop%20All-Star!5e0!3m2!1ses-419!2sco!4v1775200227931!5m2!1ses-419!2sco"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="La Fama Barber"
        />
      </section>}

      <Footer />

      {showAuth && <ModalAuth onClose={() => setShowAuth(false)} onLogin={(u, t) => {
        setUsuario(u);
        setToken(t);
        setTimeout(() => showToast(`¡Bienvenido, ${u.nombre}! 👋`), 100);
        if (u.rol === 'ADMIN') navigate('/admin');
        else if (u.rol === 'RECEPCION') navigate('/recepcion');
      }} />}

      {showConfirm && confirmData && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">✓</div>
            <div className="confirm-title">¡CITA CONFIRMADA!</div>
            <div className="confirm-sub">Te esperamos en La Fama Barber. Llega 5 min antes.</div>
            <div className="confirm-details">
              <div className="confirm-row"><span className="confirm-row-key">Servicios</span><span className="confirm-row-val">{confirmData.servicios?.map(s => s.servicio?.nombre).join(', ')}</span></div>
              <div className="confirm-row"><span className="confirm-row-key">Barbero</span><span className="confirm-row-val">{confirmData.barbero?.nombre}</span></div>
              <div className="confirm-row"><span className="confirm-row-key">Fecha</span><span className="confirm-row-val">{formatFecha(confirmData.fecha)}</span></div>
              <div className="confirm-row"><span className="confirm-row-key">Hora</span><span className="confirm-row-val">{confirmData.hora}</span></div>
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowConfirm(false)}>PERFECTO</button>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <ImageZoomModal item={zoomItem} onClose={() => setZoomItem(null)} />

      <ReservaModal
        open={showReservaModal}
        onClose={() => setShowReservaModal(false)}
        servicios={servicios}
        barberos={barberos}
        selectedServicios={selectedServicios}
        onToggleServicio={toggleServicio}
        selectedBarbero={selectedBarbero}
        onSelectBarbero={setSelectedBarbero}
        selectedFecha={selectedFecha}
        onSelectFecha={setSelectedFecha}
        selectedHora={selectedHora}
        onSelectHora={setSelectedHora}
        slotsDisponibles={slotsDisponibles}
        loadingSlots={loadingSlots}
        nota={nota}
        onNotaChange={setNota}
        totalPrecio={totalPrecio}
        usuario={usuario}
        onConfirmar={reservar}
      />

      {/* Botones flotantes: WhatsApp + Instagram en un solo contenedor fijo */}
      <div className="floating-actions">
        <a
          href="https://www.instagram.com/TU_USUARIO"
          target="_blank"
          rel="noopener noreferrer"
          className="instagram-float"
        >
          <FaInstagram />
        </a>

        <a
          href="https://wa.me/573013090185?text=Hola%20quiero%20agendar%20un%20corte%20"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-float"
        >
          <FaWhatsapp />
        </a>
      </div>

      <div className="mobile-action-bar">
        <a href="https://www.instagram.com/TU_USUARIO" target="_blank" rel="noopener noreferrer" className="mab-item mab-instagram">
          <FaInstagram className="mab-icon" />
          <span className="mab-label">Instagram</span>
        </a>
        <a href="https://wa.me/573013090185?text=Hola%20quiero%20agendar%20un%20corte" target="_blank" rel="noopener noreferrer" className="mab-item mab-whatsapp">
          <FaWhatsapp className="mab-icon" />
          <span className="mab-label">WhatsApp</span>
        </a>
        <a href="tel:+573013090185" className="mab-item">
          <FaPhoneAlt className="mab-icon" />
          <span className="mab-label">Llamar</span>
        </a>
        <button className="mab-item mab-cta" onClick={() => setShowReservaModal(true)}>
          <FaCut className="mab-icon" />
          <span className="mab-label">Reservar</span>
        </button>
      </div>

    </>

  );
}
