import { useState } from "react";

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/**
 * Calendario mensual simple. `selected` es un Date o null.
 * `onSelect(date)` se llama al elegir un día habilitado (no pasado).
 * Usa las clases .cal* definidas globalmente en LaFamaBarber.css.
 */
export default function Calendario({ selected, onSelect }) {
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
