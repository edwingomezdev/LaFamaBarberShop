import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const API = "http://localhost:3000/api";
gsap.registerPlugin(ScrollTrigger);


const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const TIMES = ['8:00', '9:00', '10:00', '11:00', '12:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00'];

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
  return img.startsWith('/') ? `http://localhost:3000${img}` : img;
}

function ImageZoomModal({ item, onClose }) {
  const [zoom, setZoom] = useState({ x: 50, y: 50, scale: 1 });
  if (!item) return null;

  const moveZoom = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ x, y, scale: 2.35 });
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
          {item.price && <div className="zoom-price">{item.price}</div>}
        </div>
      </div>
    </div>
  );
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

function Calendario({ selected, onSelect }) {
  const [view, setView] = useState({ y: new Date().getFullYear(), m: new Date().getMonth() });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const changeMonth = (d) => setView(v => { let m = v.m + d, y = v.y; if (m > 11) { m = 0; y++; } if (m < 0) { m = 11; y--; } return { y, m }; });
  const first = new Date(view.y, view.m, 1).getDay();
  const days = new Date(view.y, view.m + 1, 0).getDate();
  return (
    <div className="cal">
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={() => changeMonth(-1)}>‹</button>
        <div className="cal-month">{MONTHS[view.m]} {view.y}</div>
        <button className="cal-nav-btn" onClick={() => changeMonth(1)}>›</button>
      </div>
      <div className="cal-days-header">
        {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(d => <div key={d} className="cal-day-name">{d}</div>)}
      </div>
      <div className="cal-days">
        {Array(first).fill(null).map((_, i) => <div key={`e${i}`} className="cal-day empty" />)}
        {Array(days).fill(null).map((_, i) => {
          const d = i + 1;
          const date = new Date(view.y, view.m, d);
          const isPast = date < today;
          const isToday = date.toDateString() === today.toDateString();
          const isSel = selected && date.toDateString() === selected.toDateString();
          let cls = 'cal-day';
          if (isPast) cls += ' disabled';
          else if (isSel) cls += ' selected';
          else if (isToday) cls += ' today';
          return <div key={d} className={cls} onClick={() => !isPast && onSelect(date)}>{d}</div>;
        })}
      </div>
    </div>
  );
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
          onClick={() => window.location.href = 'http://localhost:3000/api/auth/google'}
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
                sources={['/src/assets/videos/Barber_cutting_hair_cinematic_202607222004.mp4','/src/assets/videos/Barberia_La_Fama_commercial_202607241700.mp4']}
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
            img: img.url.startsWith('/') ? `http://localhost:3000${img.url}` : img.url,
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
        <div className="hero-tag">Medellín · Est. 2015</div>
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
  const [horasOcupadas, setHorasOcupadas] = useState([]);
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
    } else {
      const t = localStorage.getItem('token');
      const u = localStorage.getItem('usuario');
      if (t && u) {
        const usr = JSON.parse(u);
        if (usr.rol !== 'ADMIN') {
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
        body: JSON.stringify({ barberoId: selectedBarbero.id, fecha: selectedFecha.toISOString().split('T')[0], hora: selectedHora, servicioIds: selectedServicios.map(s => s.id), nota })
      });
      const data = await r.json();
      if (!r.ok) { showToast(data.error || 'Error al agendar', 'error'); }
      else { setConfirmData(data); setShowConfirm(true); setSelectedServicios([]); setSelectedBarbero(null); setSelectedFecha(null); setSelectedHora(''); setNota(''); fetchMisCitas(); }
    } catch { showToast('Error de conexión', 'error'); }
  };

  const cancelarCita = async (id) => {
    try {
      const r = await fetch(`${API}/citas/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { showToast('Cita cancelada'); fetchMisCitas(); }
      else showToast('Error al cancelar', 'error');
    } catch { showToast('Error de conexión', 'error'); }
  };

  const fetchHorasOcupadas = async () => {
    if (!selectedBarbero || !selectedFecha) return;
    try {
      const fecha = selectedFecha.toISOString().split('T')[0];
      const r = await fetch(`${API}/citas/horas-ocupadas?barberoId=${selectedBarbero.id}&fecha=${fecha}`);
      const data = await r.json();
      setHorasOcupadas(Array.isArray(data) ? data : []);
    } catch { }
  };

  useEffect(() => { fetchHorasOcupadas(); }, [selectedBarbero, selectedFecha]);

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('usuario'); setUsuario(null); setToken(''); setMisCitas([]); setVista('home'); showToast('Sesión cerrada'); };

  const tickerText = '✦ LA FAMA BARBER ✦ ALL STARS ✦ MEDELLÍN ✦ EST. 2012 ✦ CORTES DE ÉLITE ✦ LA FAMA BARBER ✦ ALL STARS ✦ MEDELLÍN ✦ EST. 2012 ✦ CORTES DE ÉLITE ✦ ';


  return (
    <>
      
      <div className="noise" />
      <Cursor />

      <nav className="nav">
        <div className="nav-logo" onClick={() => setVista('home')}>LA <span>FAMA</span> BARBER</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => { setVista('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Inicio</button>
          <button className="nav-link" onClick={() => { setVista('home'); setTimeout(() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Servicios</button>
          <button className="nav-link" onClick={() => { setVista('home'); setTimeout(() => document.getElementById('membresias')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Membresías</button>
          <button className="nav-link" onClick={() => { setVista('home'); setTimeout(() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Reservar</button>
          {usuario && <button className="nav-link" onClick={() => setVista('citas')}>Mis Citas</button>}
          {usuario ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {usuario.foto ? (
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    backgroundImage: `url(${usuario.foto})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    border: '2px solid var(--rojo)'
                  }} />
                ) : (
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--rojo)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: 'var(--blanco)'
                  }}>
                    {usuario.nombre?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span style={{ fontSize: 12, letterSpacing: 1, color: 'var(--blanco)', fontFamily: "'Oswald', sans-serif" }}>
                  {usuario.nombre?.toUpperCase()}
                </span>
                {miMembresia && (
                  <span style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', background: 'var(--rojo)', color: 'var(--blanco)', padding: '2px 8px', fontFamily: "'Oswald', sans-serif" }}>
                    ⭐ {miMembresia.membresia?.nombre}
                  </span>
                )}
                {miMembresia?.alertaVencimiento && (
                  <div style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.4)', padding: '12px 20px', marginBottom: 12, fontSize: 12, color: '#d4a843', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                    ⚠️ Tu membresía <strong>{miMembresia.membresia?.nombre}</strong> vence en {miMembresia.diasRestantes} día(s)
                  </div>
                )}
                {miMembresia?.alertaConsumo && (
                  <div style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', padding: '12px 20px', marginBottom: 12, fontSize: 12, color: 'var(--rojo)', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                    🔔 Te queda solo <strong>1 corte</strong> disponible en tu membresía
                  </div>
                )}
              </div>
              <button className="nav-btn" onClick={logout}>SALIR</button>
            </div>
          ) : (
            <button className="nav-btn" onClick={() => setShowAuth(true)}>ENTRAR</button>
          )}
        </div>
      </nav>

      {vista === 'home' && (<>
        <HeroCarousel
          onReservar={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
          onServicios={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
        />

        <BarberExperience />

        <div className="ticker"><span className="ticker-inner">{tickerText}{tickerText}</span></div>

        <section className="section" id="servicios">
          <div className="section-header">
            <span className="section-tag">Lo que hacemos</span>
            <h2 className="section-title">NUESTROS<br /><span style={{ color: 'var(--rojo)' }}>SERVICIOS</span></h2>
             
          </div>
          {loadingSvcs ? <div className="loading"><div className="spinner" />Cargando servicios...</div> :
            <div className="servicios-grid">
              {servicios.map(s => (
                <div key={s.id} className={`servicio-card ${selectedServicios.find(x => x.id === s.id) ? 'selected' : ''}`} onClick={() => toggleServicio(s)}>
                  <div className="servicio-card-bg" style={{ backgroundImage: `url(${s.imagen ? (s.imagen.startsWith('/') ? `http://localhost:3000${s.imagen}` : s.imagen) : getServicioImg(s.nombre)})` }} />
                  <div className="servicio-tag-top">{getIcon(s.nombre)} {s.duracion} min</div>
                  <div className="servicio-check">✓</div>
                  <div className="servicio-card-content">
                    <div className="servicio-nombre">{s.nombre}</div>
                    <div className="servicio-desc">{s.descripcion}</div>
                    <div className="servicio-footer">
                      <div className="servicio-precio">{formatPrecio(s.precio)}</div>
                      <div className="servicio-duracion">{s.duracion} minutos</div>
                    </div>
                  </div>
                </div>
              ))}
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
                  <div className="barbero-selected-badge">✓</div>
                  <div className="barbero-avatar" style={{
                    backgroundImage: b.foto ? `url(${b.foto.startsWith('/') ? 'http://localhost:3000' + b.foto : b.foto})` : 'none',
                  }}>
                    {!b.foto && ['👨🏻', '👨🏽', '👨🏾'][i % 3]}
                  </div>
                  <div className="barbero-nombre">{b.nombre}</div>
                  <div className="barbero-esp">{b.especialidad}</div>
                  {b.descripcion && <div className="barbero-desc">{b.descripcion}</div>}
                </div>
              ))}
            </div>
          }
        </section>

        <section className="section booking-section" id="booking">
          <div className="section-header">
            <span className="section-tag">Agenda tu turno</span>
            <h2 className="section-title">RESERVA<br /><span style={{ color: 'var(--rojo)' }}>TU CITA</span></h2>
          </div>
          
          <div className="booking-grid">
            <div>
              <label className="form-label">Fecha</label>
              <Calendario selected={selectedFecha} onSelect={setSelectedFecha} />
              <label className="form-label">Hora disponible</label>
              <div className="times-grid">
                {TIMES.map(t => {
                  const ocupada = horasOcupadas.includes(t);
                  return (
                    <div key={t}
                      className={`time-slot ${selectedHora === t ? 'selected' : ''} ${ocupada ? 'taken' : ''}`}
                      onClick={() => !ocupada && setSelectedHora(t)}
                      title={ocupada ? 'Hora no disponible' : ''}>
                      {t}
                    </div>
                  );
                })}
              </div>
              <label className="form-label">Nota para el barbero (opcional)</label>
              <textarea className="form-input" placeholder="Ej: Quiero el degradado bajo..." rows={3} value={nota} onChange={e => setNota(e.target.value)} style={{ resize: 'none' }} />
            </div>
            <div className="booking-summary">
              <div className="summary-title">TU RESERVA</div>
              <div className="summary-row"><span className="summary-key">Servicios</span><span className="summary-val">{selectedServicios.length ? selectedServicios.map(s => s.nombre).join(', ') : '—'}</span></div>
              <div className="summary-row"><span className="summary-key">Barbero</span><span className="summary-val">{selectedBarbero?.nombre || '—'}</span></div>
              <div className="summary-row"><span className="summary-key">Fecha</span><span className="summary-val">{selectedFecha ? selectedFecha.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }) : '—'}</span></div>
              <div className="summary-row"><span className="summary-key">Hora</span><span className="summary-val">{selectedHora || '—'}</span></div>
              <div className="summary-row"><span className="summary-key">Cliente</span><span className="summary-val">{usuario?.nombre || '—'}</span></div>
              <div className="summary-total">
                <span className="summary-total-label">Total</span>
                <span className="summary-total-val">{formatPrecio(totalPrecio)}</span>
              </div>
              <button className="btn-reservar" onClick={reservar} disabled={!selectedServicios.length || !selectedBarbero || !selectedFecha || !selectedHora}>
                {usuario ? 'CONFIRMAR CITA' : 'INICIA SESIÓN PARA RESERVAR'}
              </button>
            </div>
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
              <div className="citas-grid">
                {misCitas.map(c => (
                  <div key={c.id} className="cita-card">
                    <div className={`cita-estado estado-${c.estado}`}>{c.estado}</div>
                    <div className="cita-servicio">{c.servicios?.map(s => s.servicio?.nombre).join(' + ')}</div>
                    <div className="cita-detail"><span>👤</span> {c.barbero?.nombre}</div>
                    <div className="cita-detail"><span>📅</span> {formatFecha(c.fecha)}</div>
                    <div className="cita-detail"><span>🕐</span> {c.hora}</div>
                    {c.nota && <div className="cita-detail"><span>📝</span> {c.nota}</div>}
                    {c.estado === 'PENDIENTE' && <button className="cita-cancelar" onClick={() => cancelarCita(c.id)}>CANCELAR CITA</button>}
                  </div>
                ))}
              </div>
          }
        </section>
      )}



      {/* ── SECCIÓN MEMBRESÍAS ── */}
      {vista === 'home' && (
        <section className="membresias-section" id="membresias">
          <div className="section-header">
            <span className="section-tag">Planes exclusivos</span>
            <h2 className="section-title">ELIGE TU<br /><span style={{ color: 'var(--rojo)' }}>MEMBRESÍA</span></h2>
          </div>

          <div className="membresias-intro">
            <p className="membresias-intro-text">
              Cada una de nuestras membresías está diseñada para que siempre seas nuestra máxima prioridad.
              El número de cupos es limitado para garantizarte la mejor atención.
            </p>
            <div className="membresias-aviso">
              <div className="membresias-aviso-txt">
                <strong>Corte sin membresía: $20.000 &nbsp;·&nbsp; Corte + Barba sin membresía: $30.000</strong><br />
                Con membresía aplica descuento según plan. Válidos por el periodo contratado.
              </div>
            </div>
          </div>
          <div className="planes-grid">
            {planesMembresia.length > 0 ? planesMembresia.map((plan, i) => (
              <div key={plan.id} className={`plan-card ${i === Math.floor(planesMembresia.length / 2) ? 'featured' : ''}`}>
                {i === Math.floor(planesMembresia.length / 2) && <div className="plan-badge">Más Popular</div>}
                <div className="plan-nombre">{plan.nombre}</div>
                {plan.descripcion && <div className="plan-tipo">{plan.descripcion}</div>}
                <div className="plan-precio-wrap">
                  <div className="plan-precio"><span className="currency">$</span>{Number(plan.precio).toLocaleString('es-CO')}</div>
                  <span className="plan-periodo">/ {plan.cortesIncluidos} cortes</span>
                </div>
                {plan.descuento > 0 && <div className="plan-con-membresia">{plan.descuento}% descuento en servicios</div>}
                <div className="plan-divider" />
                {plan.beneficios && (
                  <ul className="plan-beneficios">
                    {plan.beneficios.split('\n').filter(b => b.trim()).map((b, j) => (
                      <li key={j}><span className="plan-check-yes">✓</span> {b.trim()}</li>
                    ))}
                  </ul>
                )}
                <button className="plan-btn" onClick={() => window.open(`https://wa.me/573013090185?text=Hola%2C%20quiero%20el%20plan%20${encodeURIComponent(plan.nombre)}`, '_blank')}>
                  SOLICITAR PLAN
                </button>
              </div>
            )) : (
              <>
                <div className="plan-card">
                  <div className="plan-nombre">VIP</div>
                  <div className="plan-tipo">Solo Corte · 1 Mes</div>
                  <div className="plan-precio-wrap">
                    <div className="plan-precio"><span className="currency">$</span>38.000</div>
                    <span className="plan-periodo">/ 2 cortes</span>
                  </div>
                  <span className="plan-ahorro">Ahorras $2.000</span>
                  <div className="plan-sin-membresia">Sin membresía: <span className="plan-tachado">$40.000</span></div>
                  <div className="plan-con-membresia">Con membresía: <strong>$19.000 / corte</strong></div>
                  <div className="plan-validez">Válido por 1 mes</div>
                  <div className="plan-divider" />
                  <ul className="plan-beneficios">
                    <li><span className="plan-check-yes">✓</span> 2 Cortes incluidos</li>
                    <li><span className="plan-check-yes">✓</span> Reserva prioritaria</li>
                    <li><span className="plan-check-yes">✓</span> 20% dto. productos marca propia</li>
                    <li><span className="plan-check-yes">✓</span> 20% dto. servicios seleccionados</li>
                  </ul>
                  <button className="plan-btn" onClick={() => window.open('https://wa.me/573013090185?text=Hola%2C%20quiero%20el%20plan%20VIP%201%20mes', '_blank')}>SOLICITAR PLAN</button>
                </div>

                <div className="plan-card">
                  <div className="plan-nombre">VIP PLUS</div>
                  <div className="plan-tipo">Corte + Barba · 1 Mes</div>
                  <div className="plan-precio-wrap">
                    <div className="plan-precio"><span className="currency">$</span>58.000</div>
                    <span className="plan-periodo">/ 2 servicios</span>
                  </div>
                  <span className="plan-ahorro">Ahorras $2.000</span>
                  <div className="plan-sin-membresia">Sin membresía: <span className="plan-tachado">$60.000</span></div>
                  <div className="plan-con-membresia">Con membresía: <strong>$29.000 / servicio</strong></div>
                  <div className="plan-validez">Válido por 1 mes</div>
                  <div className="plan-divider" />
                  <ul className="plan-beneficios">
                    <li><span className="plan-check-yes">✓</span> 2 Cortes + Barba incluidos</li>
                    <li><span className="plan-check-yes">✓</span> Reserva prioritaria</li>
                    <li><span className="plan-check-yes">✓</span> 20% dto. productos marca propia</li>
                    <li><span className="plan-check-yes">✓</span> 20% dto. servicios seleccionados</li>
                  </ul>
                  <button className="plan-btn" onClick={() => window.open('https://wa.me/573013090185?text=Hola%2C%20quiero%20el%20plan%20VIP%20PLUS%201%20mes', '_blank')}>SOLICITAR PLAN</button>
                </div>

                <div className="plan-card featured">
                  <div className="plan-badge">Más Popular</div>
                  <div className="plan-nombre">BLACK</div>
                  <div className="plan-tipo">Solo Corte · 2 Meses</div>
                  <div className="plan-precio-wrap">
                    <div className="plan-precio"><span className="currency">$</span>72.000</div>
                    <span className="plan-periodo">/ 4 cortes</span>
                  </div>
                  <span className="plan-ahorro">Ahorras $8.000</span>
                  <div className="plan-sin-membresia">Sin membresía: <span className="plan-tachado">$80.000</span></div>
                  <div className="plan-con-membresia">Con membresía: <strong>$18.000 / corte</strong></div>
                  <div className="plan-validez">Válido por 2 meses</div>
                  <div className="plan-divider" />
                  <ul className="plan-beneficios">
                    <li><span className="plan-check-yes">✓</span> 4 Cortes incluidos</li>
                    <li><span className="plan-check-yes">✓</span> Reserva prioritaria</li>
                    <li><span className="plan-check-yes">✓</span> 20% dto. productos marca propia</li>
                    <li><span className="plan-check-yes">✓</span> 20% dto. servicios seleccionados</li>
                  </ul>
                  <button className="plan-btn" onClick={() => window.open('https://wa.me/573013090185?text=Hola%2C%20quiero%20el%20plan%20BLACK%202%20meses', '_blank')}>SOLICITAR PLAN</button>
                </div>

                <div className="plan-card featured">
                  <div className="plan-badge">Premium</div>
                  <div className="plan-nombre">BLACK PLUS</div>
                  <div className="plan-tipo">Corte + Barba · 2 Meses</div>
                  <div className="plan-precio-wrap">
                    <div className="plan-precio"><span className="currency">$</span>112.000</div>
                    <span className="plan-periodo">/ 4 servicios</span>
                  </div>
                  <span className="plan-ahorro">Ahorras $8.000</span>
                  <div className="plan-sin-membresia">Sin membresía: <span className="plan-tachado">$120.000</span></div>
                  <div className="plan-con-membresia">Con membresía: <strong>$28.000 / servicio</strong></div>
                  <div className="plan-validez">Válido por 2 meses</div>
                  <div className="plan-divider" />
                  <ul className="plan-beneficios">
                    <li><span className="plan-check-yes">✓</span> 4 Cortes + Barba incluidos</li>
                    <li><span className="plan-check-yes">✓</span> Reserva prioritaria</li>
                    <li><span className="plan-check-yes">✓</span> 20% dto. productos marca propia</li>
                    <li><span className="plan-check-yes">✓</span> 20% dto. servicios seleccionados</li>
                  </ul>
                  <button className="plan-btn" onClick={() => window.open('https://wa.me/573013090185?text=Hola%2C%20quiero%20el%20plan%20BLACK%20PLUS%202%20meses', '_blank')}>SOLICITAR PLAN</button>
                </div>
              </>
            )}
          </div> {/* ← cierre planes-grid AQUÍ, fuera del ternario */}

          {/* Términos y condiciones */}
          <div className="terminos-section">
            <div className="terminos-title">Términos y Condiciones</div>
            <ul className="terminos-list">
              <li>Las reservas están sujetas a la disponibilidad de la agenda.</li>
              <li>Límite máximo de uso según la vigencia del plan (1 o 2 meses).</li>
              <li>20% de descuento en productos de marca propia y servicios seleccionados: Cejas, Mascarillas Faciales y servicios adicionales. No aplica para químicos (keratinas, tintes, decoloraciones, entre otros).</li>
              <li>Las membresías pueden transferirse a familiares o amigos con autorización del titular y reserva desde el perfil asociado.</li>
              <li>La cancelación de la reserva debe realizarse con mínimo 40 minutos de antelación; de lo contrario, el servicio será descontado del plan.</li>
              <li>Los servicios solo pueden reservarse en la sede correspondiente al plan adquirido.</li>
              <li>No existe compromiso a largo plazo y no se ofrece devolución del dinero.</li>
              <li>Se aplican condiciones y restricciones adicionales.</li>
            </ul>
          </div>

          <div className="membresias-footer">
            <div className="membresias-footer-item"><div className="membresias-footer-dot"></div><span className="membresias-footer-txt">Cupos limitados</span></div>
            <div className="membresias-footer-item"><div className="membresias-footer-dot"></div><span className="membresias-footer-txt">Sin compromiso largo plazo</span></div>
            <div className="membresias-footer-item"><div className="membresias-footer-dot"></div><span className="membresias-footer-txt">Transferible a familiares</span></div>
            <div className="membresias-footer-item"><div className="membresias-footer-dot"></div><span className="membresias-footer-txt">Solicitar por WhatsApp</span></div>
          </div>

        </section>
      )}

      {/* ── SECCIÓN PRODUCTOS FLOTANTES ── */}
      {vista === 'home' && (
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

      <footer className="footer">
        <div className="footer-logo">LA <span>FAMA</span> BARBER</div>
        <div className="footer-text">© 2025 La Fama Barber · All Stars · Medellín, Colombia</div>
        <div className="footer-text" style={{ color: 'var(--rojo)' }}>✦ All Stars</div>
        <button
          onClick={() => navigate('/barbero')}
          style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--gris)", background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 2, cursor: "pointer", fontFamily: "'Oswald', sans-serif" }}
          onMouseEnter={e => e.target.style.color = "var(--rojo)"}
          onMouseLeave={e => e.target.style.color = "var(--gris)"}
        >✂ Acceso Barberos</button>



      </footer>

      {showAuth && <ModalAuth onClose={() => setShowAuth(false)} onLogin={(u, t) => {
        setUsuario(u);
        setToken(t);
        setTimeout(() => showToast(`¡Bienvenido, ${u.nombre}! 👋`), 100);
        if (u.rol === 'ADMIN') navigate('/admin');
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

      {/* 📸 BOTÓN FLOTANTE INSTAGRAM */}
      <a
        href="https://www.instagram.com/TU_USUARIO"
        target="_blank"
        rel="noopener noreferrer"
        className="instagram-float"
      >
        <FaInstagram />
      </a>

      {/* 🔥 BOTÓN FLOTANTE WHATSAPP */}
      <a
        href="https://wa.me/573013090185?text=Hola%20quiero%20agendar%20un%20corte%20"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
      >
        <FaWhatsapp />
      </a>


    </>

  );
}
