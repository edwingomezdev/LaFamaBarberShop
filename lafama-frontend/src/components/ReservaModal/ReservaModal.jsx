import { useEffect, useState } from "react";
import Calendario from "../Calendario";
import { getImageUrl } from "../../services/api";
import "./ReservaModal.css";

const formatPrecio = (p) => '$' + Number(p).toLocaleString('es-CO');

const PASOS = ['Servicio', 'Barbero', 'Fecha y hora', 'Confirmar'];

/**
 * Wizard de 4 pasos para reservar cita. Es un componente controlado:
 * todo el estado (servicios/barbero/fecha/hora/nota elegidos) vive en
 * el padre (LaFamaBarber) — este modal solo lo lee y dispara callbacks.
 * Así reutiliza exactamente la misma lógica de disponibilidad y el
 * mismo `reservar()` que ya existía, sin duplicar nada.
 */
export default function ReservaModal({
  open,
  onClose,
  servicios,
  barberos,
  selectedServicios,
  onToggleServicio,
  selectedBarbero,
  onSelectBarbero,
  selectedFecha,
  onSelectFecha,
  selectedHora,
  onSelectHora,
  slotsDisponibles,
  loadingSlots,
  nota,
  onNotaChange,
  totalPrecio,
  usuario,
  onConfirmar,
}) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!open) return;
    // Si ya venías con servicio/barbero elegidos desde la página,
    // el modal arranca directo en el paso que corresponda.
    if (!selectedServicios.length) setStep(1);
    else if (!selectedBarbero) setStep(2);
    else setStep(3);
  }, [open]);

  if (!open) return null;

  const puedeAvanzar = {
    1: selectedServicios.length > 0,
    2: !!selectedBarbero,
    3: !!selectedFecha && !!selectedHora,
  };

  return (
    <div className="rm-overlay" onClick={onClose}>
      <div className="rm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="rm-close" onClick={onClose}>×</button>

        <div className="rm-stepper">
          {PASOS.map((label, i) => {
            const n = i + 1;
            return (
              <div key={label} className={`rm-step ${step === n ? "active" : ""} ${step > n ? "done" : ""}`}>
                <span className="rm-step-num">{step > n ? "✓" : n}</span>
                <span className="rm-step-label">{label}</span>
              </div>
            );
          })}
        </div>

        <div className="rm-body">
          {step === 1 && (
            <div className="rm-list">
              {servicios.map((s) => {
                const sel = selectedServicios.some((x) => x.id === s.id);
                return (
                  <button key={s.id} type="button" className={`rm-row ${sel ? "selected" : ""}`} onClick={() => onToggleServicio(s)}>
                    <span className="rm-row-check">{sel ? "✓" : ""}</span>
                    <span className="rm-row-main">
                      <span className="rm-row-title">{s.nombre}</span>
                      <span className="rm-row-sub">{s.duracion} min</span>
                    </span>
                    <span className="rm-row-price">{formatPrecio(s.precio)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="rm-list">
              {barberos.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`rm-row ${selectedBarbero?.id === b.id ? "selected" : ""}`}
                  onClick={() => onSelectBarbero(b)}
                >
                  <span
                    className="rm-row-avatar"
                    style={{ backgroundImage: b.foto ? `url(${getImageUrl(b.foto)})` : "none" }}
                  >
                    {!b.foto && b.nombre.charAt(0)}
                  </span>
                  <span className="rm-row-main">
                    <span className="rm-row-title">{b.nombre}</span>
                    <span className="rm-row-sub">{b.especialidad}</span>
                  </span>
                  <span className="rm-row-check">{selectedBarbero?.id === b.id ? "✓" : ""}</span>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="rm-fecha-hora">
              <Calendario selected={selectedFecha} onSelect={onSelectFecha} />
              <label className="form-label">Hora disponible</label>
              <div className="times-grid">
                {!selectedFecha && <p className="rm-empty">Elige una fecha en el calendario</p>}
                {selectedFecha && loadingSlots && <p className="rm-empty">Cargando horarios...</p>}
                {selectedFecha && !loadingSlots && slotsDisponibles.length === 0 && (
                  <p className="rm-empty">No hay horarios disponibles ese día</p>
                )}
                {slotsDisponibles.map((t) => (
                  <div key={t} className={`time-slot ${selectedHora === t ? "selected" : ""}`} onClick={() => onSelectHora(t)}>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="rm-resumen">
              <div className="summary-row"><span className="summary-key">Servicios</span><span className="summary-val">{selectedServicios.map((s) => s.nombre).join(", ")}</span></div>
              <div className="summary-row"><span className="summary-key">Barbero</span><span className="summary-val">{selectedBarbero?.nombre}</span></div>
              <div className="summary-row"><span className="summary-key">Fecha</span><span className="summary-val">{selectedFecha?.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}</span></div>
              <div className="summary-row"><span className="summary-key">Hora</span><span className="summary-val">{selectedHora}</span></div>
              <textarea
                className="form-input"
                placeholder="Nota para el barbero (opcional)"
                rows={3}
                value={nota}
                onChange={(e) => onNotaChange(e.target.value)}
                style={{ resize: "none", marginTop: 16 }}
              />
              <div className="summary-total">
                <span className="summary-total-label">Total</span>
                <span className="summary-total-val">{formatPrecio(totalPrecio)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="rm-actions">
          {step > 1 && <button className="rm-btn-back" onClick={() => setStep(step - 1)}>Atrás</button>}
          {step < 4 && (
            <button className="rm-btn-next" disabled={!puedeAvanzar[step]} onClick={() => setStep(step + 1)}>
              Siguiente
            </button>
          )}
          {step === 4 && (
            <button className="btn-reservar" style={{ marginTop: 0 }} onClick={onConfirmar}>
              {usuario ? "CONFIRMAR CITA" : "INICIA SESIÓN PARA RESERVAR"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
