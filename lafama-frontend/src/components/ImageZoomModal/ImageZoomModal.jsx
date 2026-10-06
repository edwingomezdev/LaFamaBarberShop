import { useState } from "react";
import "./ImageZoomModal.css";

/**
 * Modal de zoom con lupa (sigue el mouse sobre la imagen).
 * item: { img, title, sub, desc, price }
 */
export default function ImageZoomModal({ item, onClose }) {
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
      <div className="zoom-viewer" onClick={(e) => e.stopPropagation()}>
        <div
          className="zoom-image-area"
          onMouseMove={moveZoom}
          onMouseLeave={() => setZoom((z) => ({ ...z, scale: 1 }))}
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
