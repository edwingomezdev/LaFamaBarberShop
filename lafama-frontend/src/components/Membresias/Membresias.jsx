import "./Membresias.css";

const PLANES_DEFAULT = [
  {
    id: "default-vip",
    nombre: "VIP",
    tipo: "Solo Corte · 1 Mes",
    precio: 38000,
    periodo: "2 cortes",
    ahorro: "Ahorras $2.000",
    sinMembresia: 40000,
    conMembresia: "$19.000 / corte",
    validez: "Válido por 1 mes",
    beneficios: [
      "2 Cortes incluidos",
      "Reserva prioritaria",
      "20% dto. productos marca propia",
      "20% dto. servicios seleccionados",
    ],
    wa: "Hola, quiero el plan VIP 1 mes",
  },
  {
    id: "default-vip-plus",
    nombre: "VIP PLUS",
    tipo: "Corte + Barba · 1 Mes",
    precio: 58000,
    periodo: "2 servicios",
    ahorro: "Ahorras $2.000",
    sinMembresia: 60000,
    conMembresia: "$29.000 / servicio",
    validez: "Válido por 1 mes",
    beneficios: [
      "2 Cortes + Barba incluidos",
      "Reserva prioritaria",
      "20% dto. productos marca propia",
      "20% dto. servicios seleccionados",
    ],
    wa: "Hola, quiero el plan VIP PLUS 1 mes",
  },
  {
    id: "default-black",
    nombre: "BLACK",
    tipo: "Solo Corte · 2 Meses",
    precio: 72000,
    periodo: "4 cortes",
    ahorro: "Ahorras $8.000",
    sinMembresia: 80000,
    conMembresia: "$18.000 / corte",
    validez: "Válido por 2 meses",
    featured: true,
    badge: "Más Popular",
    beneficios: [
      "4 Cortes incluidos",
      "Reserva prioritaria",
      "20% dto. productos marca propia",
      "20% dto. servicios seleccionados",
    ],
    wa: "Hola, quiero el plan BLACK 2 meses",
  },
  {
    id: "default-black-plus",
    nombre: "BLACK PLUS",
    tipo: "Corte + Barba · 2 Meses",
    precio: 112000,
    periodo: "4 servicios",
    ahorro: "Ahorras $8.000",
    sinMembresia: 120000,
    conMembresia: "$28.000 / servicio",
    validez: "Válido por 2 meses",
    featured: true,
    badge: "Premium",
    beneficios: [
      "4 Cortes + Barba incluidos",
      "Reserva prioritaria",
      "20% dto. productos marca propia",
      "20% dto. servicios seleccionados",
    ],
    wa: "Hola, quiero el plan BLACK PLUS 2 meses",
  },
];

const abrirWhatsapp = (texto) =>
  window.open(`https://wa.me/573013090185?text=${encodeURIComponent(texto)}`, "_blank");

/**
 * Sección de planes de membresía. Si `planesMembresia` (de la BD) viene
 * vacío, muestra los 4 planes por defecto como respaldo.
 * Reusada por el home (LaFamaBarber) y por la página pública /membresias.
 */
export default function Membresias({ planesMembresia = [], style }) {
  const hayPlanesReales = planesMembresia.length > 0;
  const destacadoIndex = Math.floor(planesMembresia.length / 2);

  return (
    <section className="membresias-section" id="membresias" style={style}>
      <div className="section-header">
        <span className="section-tag">Planes exclusivos</span>
        <h2 className="section-title">ELIGE TU<br /><span style={{ color: "var(--rojo)" }}>MEMBRESÍA</span></h2>
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
        {hayPlanesReales
          ? planesMembresia.map((plan, i) => (
              <div key={plan.id} className={`plan-card ${i === destacadoIndex ? "featured" : ""}`}>
                {i === destacadoIndex && <div className="plan-badge">Más Popular</div>}
                <div className="plan-nombre">{plan.nombre}</div>
                {plan.descripcion && <div className="plan-tipo">{plan.descripcion}</div>}
                <div className="plan-precio-wrap">
                  <div className="plan-precio"><span className="currency">$</span>{Number(plan.precio).toLocaleString("es-CO")}</div>
                  <span className="plan-periodo">/ {plan.cortesIncluidos} cortes</span>
                </div>
                {plan.descuento > 0 && <div className="plan-con-membresia">{plan.descuento}% descuento en servicios</div>}
                <div className="plan-divider" />
                {plan.beneficios && (
                  <ul className="plan-beneficios">
                    {plan.beneficios.split("\n").filter((b) => b.trim()).map((b, j) => (
                      <li key={j}><span className="plan-check-yes">✓</span> {b.trim()}</li>
                    ))}
                  </ul>
                )}
                <button className="plan-btn" onClick={() => abrirWhatsapp(`Hola, quiero el plan ${plan.nombre}`)}>
                  SOLICITAR PLAN
                </button>
              </div>
            ))
          : PLANES_DEFAULT.map((plan) => (
              <div key={plan.id} className={`plan-card ${plan.featured ? "featured" : ""}`}>
                {plan.badge && <div className="plan-badge">{plan.badge}</div>}
                <div className="plan-nombre">{plan.nombre}</div>
                <div className="plan-tipo">{plan.tipo}</div>
                <div className="plan-precio-wrap">
                  <div className="plan-precio"><span className="currency">$</span>{plan.precio.toLocaleString("es-CO")}</div>
                  <span className="plan-periodo">/ {plan.periodo}</span>
                </div>
                <span className="plan-ahorro">{plan.ahorro}</span>
                <div className="plan-sin-membresia">Sin membresía: <span className="plan-tachado">${plan.sinMembresia.toLocaleString("es-CO")}</span></div>
                <div className="plan-con-membresia">Con membresía: <strong>{plan.conMembresia}</strong></div>
                <div className="plan-validez">{plan.validez}</div>
                <div className="plan-divider" />
                <ul className="plan-beneficios">
                  {plan.beneficios.map((b, j) => (
                    <li key={j}><span className="plan-check-yes">✓</span> {b}</li>
                  ))}
                </ul>
                <button className="plan-btn" onClick={() => abrirWhatsapp(plan.wa)}>SOLICITAR PLAN</button>
              </div>
            ))}
      </div>

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
  );
}
