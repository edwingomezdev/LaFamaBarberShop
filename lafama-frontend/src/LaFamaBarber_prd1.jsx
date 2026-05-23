import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";

const API = "http://localhost:3000/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@300;400;500;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --rojo: #c0392b;
    --rojo-vivo: #e74c3c;
    --negro: #080808;
    --negro2: #111111;
    --negro3: #1a1a1a;
    --blanco: #f0ece4;
    --gris: #888;
    --gris2: #444;
  }

  body {
    background: var(--negro);
    color: var(--blanco);
    font-family: 'Oswald', sans-serif;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--negro); }
  ::-webkit-scrollbar-thumb { background: var(--rojo); }

  .cursor {
    width: 10px; height: 10px;
    background: var(--rojo);
    border-radius: 50%;
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    transition: transform 0.1s;
    mix-blend-mode: difference;
  }

  .noise {
    position: fixed; inset: 0;
    opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 1000;
  }

  .nav {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 100;
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px 60px;
    background: linear-gradient(to bottom, rgba(8,8,8,0.95), transparent);
    backdrop-filter: blur(10px);
  }

  .nav-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px; letter-spacing: 4px;
    color: var(--blanco); cursor: pointer;
  }

  .nav-logo span { color: var(--rojo); }

  .nav-links { display: flex; gap: 32px; align-items: center; }

  .nav-link {
    font-size: 12px; letter-spacing: 3px;
    text-transform: uppercase; color: var(--gris);
    cursor: pointer; transition: color 0.2s;
    background: none; border: none;
    font-family: 'Oswald', sans-serif; font-weight: 400;
  }

  .nav-link:hover { color: var(--blanco); }

  .nav-btn {
    background: var(--rojo); color: var(--blanco);
    border: none; padding: 10px 24px;
    font-family: 'Oswald', sans-serif;
    font-size: 12px; letter-spacing: 3px;
    text-transform: uppercase; cursor: pointer;
    transition: background 0.2s; font-weight: 500;
  }

  .nav-btn:hover { background: var(--rojo-vivo); }

  /* ── CARRUSEL HERO ── */
  .hero {
    min-height: 100vh;
    position: relative; overflow: hidden;
  }

  .carousel-slide {
    position: absolute; inset: 0;
    background-size: cover; background-position: center;
    opacity: 0;
    transition: opacity 1.2s ease;
    transform: scale(1.05);
    transition: opacity 1.2s ease, transform 6s ease;
  }

  .carousel-slide.active {
    opacity: 1;
    transform: scale(1);
  }

  .carousel-slide::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(
      105deg,
      rgba(0,0,0,0.92) 0%,
      rgba(0,0,0,0.6) 45%,
      rgba(0,0,0,0.2) 100%
    );
  }

  .hero-content {
    position: relative; z-index: 10;
    height: 100vh;
    display: flex; flex-direction: column;
    justify-content: center;
    padding: 0 60px;
    max-width: 780px;
  }

  .hero-tag {
    display: inline-flex; align-items: center; gap: 10px;
    font-size: 11px; letter-spacing: 5px; text-transform: uppercase;
    color: var(--rojo); margin-bottom: 24px;
    animation: fadeSlideUp 0.8s ease forwards;
  }

  .hero-tag::before { content: ''; width: 30px; height: 1px; background: var(--rojo); }

  .hero-h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(80px, 12vw, 160px);
    line-height: 0.9; letter-spacing: 2px; margin-bottom: 8px;
    animation: fadeSlideUp 0.8s ease 0.1s both;
  }

  .hero-h1 .red { color: var(--rojo); }

  .hero-slogan {
    font-family: 'Crimson Pro', serif;
    font-style: italic;
    font-size: clamp(20px, 3vw, 32px);
    color: var(--gris); letter-spacing: 3px; margin-bottom: 16px;
    animation: fadeSlideUp 0.8s ease 0.2s both;
  }

  .hero-corte-label {
    font-family: 'Oswald', sans-serif;
    font-size: 13px; letter-spacing: 4px; text-transform: uppercase;
    color: rgba(255,255,255,0.5); margin-bottom: 48px;
    animation: fadeSlideUp 0.8s ease 0.3s both;
    display: flex; align-items: center; gap: 12px;
  }

  .hero-corte-label::before {
    content: ''; width: 24px; height: 1px;
    background: var(--rojo);
  }

  .hero-corte-name {
    color: var(--blanco);
    transition: opacity 0.5s ease;
  }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .hero-actions {
    display: flex; gap: 16px; align-items: center;
    animation: fadeSlideUp 0.8s ease 0.4s both;
  }

  .btn-primary {
    background: var(--rojo); color: var(--blanco);
    border: none; padding: 16px 40px;
    font-family: 'Oswald', sans-serif;
    font-size: 13px; letter-spacing: 3px;
    text-transform: uppercase; cursor: pointer;
    transition: all 0.2s; font-weight: 600;
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
  }

  .btn-primary:hover { background: var(--rojo-vivo); transform: translateY(-2px); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .btn-secondary {
    background: none; color: var(--blanco);
    border: 1px solid rgba(255,255,255,0.2);
    padding: 16px 40px;
    font-family: 'Oswald', sans-serif;
    font-size: 13px; letter-spacing: 3px;
    text-transform: uppercase; cursor: pointer;
    transition: all 0.2s; font-weight: 400;
  }

  .btn-secondary:hover { border-color: var(--rojo); color: var(--rojo); }

  /* FLECHAS */
  .carousel-arrow {
    position: absolute; top: 50%; z-index: 20;
    transform: translateY(-50%);
    background: rgba(0,0,0,0.4);
    border: 1px solid rgba(255,255,255,0.15);
    color: var(--blanco); width: 52px; height: 52px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; cursor: pointer;
    transition: all 0.2s; backdrop-filter: blur(4px);
  }

  .carousel-arrow:hover { background: var(--rojo); border-color: var(--rojo); }
  .carousel-arrow.prev { left: 24px; }
  .carousel-arrow.next { right: 24px; }

  /* MINIATURAS */
.carousel-thumbs {
    /*  position: absolute; bottom: 32px; right: 36px;*/
    opacity: 0;
  pointer-events: none;
    z-index: 20;
    display: flex; gap: 10px; align-items: center;
    
  }

  .carousel-thumb {
    width: 80px; height: 52px;
    background-size: cover; background-position: center;
    border: 2px solid rgba(255,255,255,0.15);
    cursor: pointer; transition: all 0.3s;
    position: relative; overflow: hidden;
    opacity: 0;
    pointer-events: none;
  }

  .carousel-thumb::after {
    content: ''; position: absolute; inset: 0;
    background: rgba(0,0,0,0.3);
  }

  .carousel-thumb:hover { opacity: 0.8; border-color: rgba(255,255,255,0.4); }
  .carousel-thumb.active { border-color: var(--rojo); opacity: 1; }

  /* PROGRESS BAR */
  .carousel-progress {
    position: absolute; bottom: 0; left: 0;
    height: 3px; background: var(--rojo);
    z-index: 20; transition: width 0.1s linear;
  }

  /* COUNTER */
  .carousel-counter {
    position: absolute; top: 50%; right: 36px;
    transform: translateY(-50%);
    z-index: 20;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }

  .carousel-dots {
    display: flex; flex-direction: column; gap: 8px;
  }

  .carousel-dot {
    width: 4px; height: 24px;
    background: rgba(255,255,255,0.2);
    cursor: pointer; transition: all 0.3s;
  }

  .carousel-dot.active {
    background: var(--rojo); height: 40px;
  }

  /* STATS */
  .hero-stats {
    position: absolute; bottom: 100px; right: 60px;
    display: flex; gap: 48px; z-index: 10;
  }

  .stat { text-align: right; }
  .stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 48px; color: var(--blanco); line-height: 1; }
  .stat-num span { color: var(--rojo); }
  .stat-label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--gris); }

  .ticker { background: var(--rojo); padding: 12px 0; overflow: hidden; white-space: nowrap; }
  .ticker-inner {
    display: inline-block;
    animation: ticker 20s linear infinite;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 14px; letter-spacing: 6px; color: rgba(255,255,255,0.9);
  }

  @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  .section { padding: 100px 60px; position: relative; }
  .section-header { margin-bottom: 60px; }
  .section-tag { font-size: 11px; letter-spacing: 5px; text-transform: uppercase; color: var(--rojo); margin-bottom: 12px; display: block; }
  .section-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(48px, 6vw, 80px); line-height: 1; letter-spacing: 2px; }

  /* ── SERVICIOS GRID (estilo tarjeta flotante igual que productos) ── */
  .servicios-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }

  .servicio-card {
    position: relative; overflow: hidden;
    background: var(--negro3);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    padding: 0 0 0 0;
    cursor: pointer;
    transition: border-color 0.3s, background 0.3s;
    display: flex; flex-direction: column;
  }
  .servicio-card::before {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0;
    height: 3px; background: var(--rojo);
    transform: scaleX(0); transition: transform 0.4s cubic-bezier(.23,1,.32,1);
    z-index: 5; border-radius: 0 0 16px 16px;
  }
  .servicio-card:hover { border-color: rgba(192,57,43,0.3); background: #161616; }
  .servicio-card:hover::before { transform: scaleX(1); }
  .servicio-card.selected { border-color: rgba(192,57,43,0.6); }
  .servicio-card.selected::before { transform: scaleX(1); }
  .servicio-card::after { display: none; }

  .servicio-card-bg {
    width: 100%; height: 200px;
    background-size: cover; background-position: center;
    border-radius: 16px 16px 0 0;
    transition: transform 0.6s ease;
    flex-shrink: 0;
  }
  .servicio-card:hover .servicio-card-bg { transform: scale(1.04); }

  .servicio-card-content {
    padding: 20px 22px 24px;
    display: flex; flex-direction: column; flex: 1;
    position: relative; z-index: 2;
  }

  .servicio-check {
    position: absolute; top: 12px; right: 12px;
    width: 26px; height: 26px;
    background: var(--rojo); z-index: 10;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; opacity: 0; transition: opacity 0.2s;
    border-radius: 4px;
  }
  .servicio-card.selected .servicio-check { opacity: 1; }

  .servicio-tag-top {
    position: absolute; top: 12px; left: 12px;
    z-index: 10;
    font-family: 'Oswald', sans-serif;
    font-size: 8px; letter-spacing: 3px; text-transform: uppercase;
    background: var(--rojo); color: var(--blanco);
    padding: 4px 10px;
  }

  .servicio-nombre {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 24px; letter-spacing: 2px;
    text-transform: uppercase; margin-bottom: 4px;
    color: var(--blanco);
  }

  .servicio-desc {
    font-size: 12px; color: var(--gris);
    font-family: 'Crimson Pro', serif; font-style: italic;
    margin-bottom: 14px; line-height: 1.6; flex: 1;
  }

  .servicio-footer {
    display: flex; justify-content: space-between; align-items: center;
    border-top: 1px solid rgba(255,255,255,0.06);
    padding-top: 12px; margin-top: 4px;
  }

  .servicio-precio {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 30px; color: var(--rojo); letter-spacing: 1px;
  }

  .servicio-duracion {
    font-size: 10px; letter-spacing: 2px;
    text-transform: uppercase; color: rgba(255,255,255,0.35);
    font-family: 'Oswald', sans-serif;
  }

  .servicio-icon { display: none; }


  /* SECCION DE BARBEROS FRONT DESING */
 /*  .barberos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }

  .barbero-card {
    background: var(--negro2); padding: 32px 24px;
    text-align: center; border: 1px solid rgba(255,255,255,0.05);
    cursor: pointer; transition: all 0.3s; position: relative;
  }

  .barbero-card:hover, .barbero-card.selected { border-color: var(--rojo); background: var(--negro3); }

  .barbero-avatar {
    width: 80px; height: 80px; border-radius: 50%;
    background: var(--negro3); border: 2px solid rgba(192,57,43,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 36px; margin: 0 auto 16px; transition: border-color 0.3s;
  }

  .barbero-card.selected .barbero-avatar, .barbero-card:hover .barbero-avatar { border-color: var(--rojo); }
  .barbero-nombre { font-family: 'Oswald', sans-serif; font-size: 18px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; }
  .barbero-esp { font-size: 12px; color: var(--gris); letter-spacing: 1px; font-weight: 300; font-family: 'Crimson Pro', serif; font-style: italic; }
  .barbero-selected-badge { position: absolute; top: 12px; right: 12px; background: var(--rojo); width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 10px; opacity: 0; transition: opacity 0.2s; }
  .barbero-card.selected .barbero-selected-badge { opacity: 1; } */
/* SECCION DE BARBEROS FRONT DESING */
/* -------------------------------- */
  .barberos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }

  .barbero-card {
    background: var(--negro2); padding: 36px 24px 28px;
    text-align: center; border: 1px solid rgba(255,255,255,0.05);
    cursor: pointer; transition: all 0.3s; position: relative;
    overflow: hidden;
  }

  .barbero-card::before {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0;
    height: 3px; background: var(--rojo);
    transform: scaleX(0); transition: transform 0.3s;
  }

  .barbero-card:hover::before, .barbero-card.selected::before { transform: scaleX(1); }
  .barbero-card:hover, .barbero-card.selected { border-color: rgba(192,57,43,0.3); background: var(--negro3); }

  .barbero-avatar {
    width: 110px; height: 110px; border-radius: 50%;
    background: var(--negro3);
    border: 3px solid rgba(192,57,43,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 48px; margin: 0 auto 20px;
    transition: border-color 0.3s, transform 0.3s;
    background-size: cover; background-position: center;
    overflow: hidden;
  }

  .barbero-card:hover .barbero-avatar, .barbero-card.selected .barbero-avatar {
    border-color: var(--rojo);
    transform: scale(1.05);
  }

  .barbero-nombre { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
  .barbero-esp { font-size: 12px; color: var(--rojo); letter-spacing: 2px; text-transform: uppercase; font-family: 'Oswald', sans-serif; font-weight: 400; margin-bottom: 12px; }
  .barbero-desc { font-size: 13px; color: var(--gris); font-family: 'Crimson Pro', serif; font-style: italic; line-height: 1.5; }
  .barbero-selected-badge { position: absolute; top: 12px; right: 12px; background: var(--rojo); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 11px; opacity: 0; transition: opacity 0.2s; }
  .barbero-card.selected .barbero-selected-badge { opacity: 1; }
/* -------------------------------- */

  .booking-section { background: var(--negro2); }
  .booking-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }

  .form-label { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: var(--rojo); display: block; margin-bottom: 12px; }

  .form-input {
    width: 100%; background: var(--negro3);
    border: 1px solid rgba(255,255,255,0.08);
    color: var(--blanco); padding: 14px 16px;
    font-family: 'Oswald', sans-serif; font-size: 14px;
    font-weight: 300; outline: none; transition: border-color 0.2s;
    margin-bottom: 16px; letter-spacing: 1px;
  }

  .form-input:focus { border-color: var(--rojo); }
  .form-input::placeholder { color: var(--gris2); }

  .cal { background: var(--negro3); border: 1px solid rgba(255,255,255,0.06); padding: 24px; margin-bottom: 24px; }
  .cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .cal-month { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 3px; }
  .cal-nav-btn { background: none; border: 1px solid rgba(255,255,255,0.1); color: var(--blanco); width: 30px; height: 30px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .cal-nav-btn:hover { border-color: var(--rojo); color: var(--rojo); }
  .cal-days-header { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 8px; }
  .cal-day-name { text-align: center; font-size: 10px; letter-spacing: 1px; color: var(--gris2); text-transform: uppercase; padding: 4px 0; }
  .cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
  .cal-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 13px; cursor: pointer; border: 1px solid transparent; transition: all 0.15s; font-weight: 300; font-family: 'Oswald', sans-serif; }
  .cal-day:hover:not(.disabled):not(.empty) { border-color: rgba(192,57,43,0.5); color: var(--rojo); }
  .cal-day.selected { background: var(--rojo); color: var(--blanco); font-weight: 600; }
  .cal-day.today { border-color: rgba(192,57,43,0.4); color: #e74c3c; }
  .cal-day.disabled { opacity: 0.2; cursor: not-allowed; }
  .cal-day.empty { cursor: default; }

  .times-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 24px; }
  .time-slot { padding: 10px 4px; border: 1px solid rgba(255,255,255,0.07); text-align: center; font-size: 12px; cursor: pointer; transition: all 0.15s; letter-spacing: 1px; font-weight: 300; font-family: 'Oswald', sans-serif; }
  .time-slot:hover:not(.taken) { border-color: var(--rojo); color: var(--rojo); }
  .time-slot.selected { background: var(--rojo); color: var(--blanco); border-color: var(--rojo); font-weight: 500; }
  .time-slot.taken { opacity: 0.2; cursor: not-allowed; text-decoration: line-through; }

  .booking-summary { background: var(--negro3); border: 1px solid rgba(192,57,43,0.2); padding: 32px; position: sticky; top: 100px; }
  .summary-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 3px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .summary-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; }
  .summary-row:last-of-type { border-bottom: none; }
  .summary-key { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--gris); flex-shrink: 0; margin-right: 16px; }
  .summary-val { color: var(--blanco); font-weight: 400; text-align: right; font-size: 13px; }
  .summary-total { margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(192,57,43,0.3); display: flex; justify-content: space-between; align-items: center; }
  .summary-total-label { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--gris); }
  .summary-total-val { font-family: 'Bebas Neue', sans-serif; font-size: 40px; color: var(--rojo); letter-spacing: 2px; }

  .btn-reservar { width: 100%; margin-top: 24px; background: var(--rojo); color: var(--blanco); border: none; padding: 18px; font-family: 'Oswald', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 5px; text-transform: uppercase; cursor: pointer; transition: all 0.2s; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)); }
  .btn-reservar:hover { background: var(--rojo-vivo); }
  .btn-reservar:disabled { opacity: 0.4; cursor: not-allowed; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 200; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal { background: var(--negro2); border: 1px solid rgba(192,57,43,0.3); padding: 48px; width: 100%; max-width: 440px; animation: slideUp 0.3s ease; position: relative; }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  .modal-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--gris); font-size: 20px; cursor: pointer; transition: color 0.2s; }
  .modal-close:hover { color: var(--rojo); }
  .modal-title { font-family: 'Bebas Neue', sans-serif; font-size: 40px; letter-spacing: 3px; margin-bottom: 8px; }
  .modal-sub { font-size: 13px; color: var(--gris); margin-bottom: 32px; font-weight: 300; }
  .modal-toggle { text-align: center; margin-top: 20px; font-size: 13px; color: var(--gris); }
  .modal-toggle button { background: none; border: none; color: var(--rojo); cursor: pointer; font-family: 'Oswald', sans-serif; font-size: 13px; letter-spacing: 1px; text-decoration: underline; }

  .confirm-modal { background: var(--negro2); border: 1px solid var(--rojo); padding: 52px 48px; width: 100%; max-width: 480px; text-align: center; animation: slideUp 0.3s ease; }
  .confirm-icon { width: 70px; height: 70px; border: 2px solid var(--rojo); display: flex; align-items: center; justify-content: center; font-size: 30px; margin: 0 auto 24px; background: rgba(192,57,43,0.1); color: var(--rojo); }
  .confirm-title { font-family: 'Bebas Neue', sans-serif; font-size: 42px; letter-spacing: 3px; margin-bottom: 8px; }
  .confirm-sub { font-size: 14px; color: var(--gris); font-family: 'Crimson Pro', serif; font-style: italic; margin-bottom: 28px; }
  .confirm-details { background: var(--negro3); border: 1px solid rgba(192,57,43,0.15); padding: 20px 24px; text-align: left; margin-bottom: 28px; }
  .confirm-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; }
  .confirm-row:last-child { border-bottom: none; }
  .confirm-row-key { color: var(--gris); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; }
  .confirm-row-val { color: var(--blanco); font-weight: 400; }

  .citas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
  .cita-card { background: var(--negro2); border: 1px solid rgba(255,255,255,0.05); padding: 24px; position: relative; border-left: 3px solid var(--rojo); animation: slideUp 0.4s ease; }
  .cita-estado { display: inline-block; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; padding: 4px 10px; margin-bottom: 14px; }
  .estado-PENDIENTE { background: rgba(255,165,0,0.15); color: orange; border: 1px solid rgba(255,165,0,0.3); }
  .estado-CONFIRMADA { background: rgba(0,200,100,0.15); color: #00c864; border: 1px solid rgba(0,200,100,0.3); }
  .estado-CANCELADA { background: rgba(192,57,43,0.15); color: var(--rojo); border: 1px solid rgba(192,57,43,0.3); }
  .estado-COMPLETADA { background: rgba(100,100,255,0.15); color: #8888ff; border: 1px solid rgba(100,100,255,0.3); }
  .cita-servicio { font-family: 'Oswald', sans-serif; font-size: 18px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
  .cita-detail { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--gris); margin-bottom: 6px; font-weight: 300; }
  .cita-detail span:first-child { color: var(--rojo); font-size: 14px; }
  .cita-cancelar { margin-top: 16px; background: none; border: 1px solid rgba(192,57,43,0.3); color: var(--rojo); padding: 8px 20px; font-family: 'Oswald', sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
  .cita-cancelar:hover { background: rgba(192,57,43,0.1); }

  .toast { position: fixed; bottom: 32px; right: 32px; background: var(--negro2); border: 1px solid; padding: 16px 24px; z-index: 500; font-size: 13px; letter-spacing: 1px; animation: slideUp 0.3s ease; max-width: 320px; }
  .toast.success { border-color: #00c864; color: #00c864; }
  .toast.error { border-color: var(--rojo); color: var(--rojo); }

  .footer { background: var(--negro2); border-top: 1px solid rgba(192,57,43,0.2); padding: 40px 60px; display: flex; justify-content: space-between; align-items: center; }
  .footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 4px; }
  .footer-logo span { color: var(--rojo); }
  .footer-text { font-size: 12px; color: var(--gris); letter-spacing: 1px; }

  .loading { display: flex; align-items: center; justify-content: center; padding: 60px; color: var(--gris); font-size: 12px; letter-spacing: 3px; text-transform: uppercase; }
  .spinner { width: 20px; height: 20px; border: 2px solid rgba(192,57,43,0.3); border-top-color: var(--rojo); border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 12px; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .empty-state { text-align: center; padding: 60px; color: var(--gris); font-size: 13px; border: 1px dashed rgba(255,255,255,0.06); font-family: 'Crimson Pro', serif; font-style: italic; }
  .alert { padding: 12px 16px; margin-bottom: 16px; font-size: 12px; letter-spacing: 1px; border: 1px solid rgba(192,57,43,0.4); color: var(--rojo); background: rgba(192,57,43,0.08); }

 
  /* ── RESPONSIVE ── */

  /* Tablet grande */
  @media (max-width: 1024px) {
    .nav { padding: 16px 32px; }
    .hero-content { padding: 0 32px; max-width: 600px; }
    .hero-stats { right: 32px; bottom: 80px; gap: 32px; }
    .section { padding: 80px 32px; }
    .booking-grid { gap: 40px; }
    .servicios-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
    .barberos-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
    .footer { padding: 32px 32px; }
  }

  /* Tablet */
  @media (max-width: 768px) {
    /* Nav */
    .nav { padding: 14px 20px; }
    .nav-links { gap: 16px; }
    .nav-link { display: none; }
    .nav-logo { font-size: 22px; }

    /* Hero */
    .hero-content { padding: 100px 20px 40px; max-width: 100%; }
    .hero-h1 { font-size: clamp(60px, 18vw, 100px); }
    .hero-slogan { font-size: clamp(16px, 4vw, 24px); margin-bottom: 12px; }
    .hero-corte-label { font-size: 11px; flex-wrap: wrap; gap: 6px; margin-bottom: 32px; }
    .hero-actions { flex-direction: column; align-items: flex-start; gap: 12px; }
    .btn-primary { padding: 14px 32px; font-size: 12px; }
    .btn-secondary { padding: 14px 32px; font-size: 12px; }
    .hero-stats { display: none; }
    .carousel-thumbs { display: none; }
    .carousel-counter { right: 12px; }
    .carousel-arrow { width: 40px; height: 40px; font-size: 16px; }
    .carousel-arrow.prev { left: 12px; }
    .carousel-arrow.next { right: 12px; }

    /* Sections */
    .section { padding: 60px 20px; }
    .section-title { font-size: clamp(36px, 8vw, 60px); }

    /* Servicios */
    .servicios-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }

    /* Barberos */
    .barberos-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .barbero-avatar { width: 90px; height: 90px; font-size: 40px; }
    .barbero-nombre { font-size: 18px; }

    /* Booking */
    .booking-grid { grid-template-columns: 1fr; gap: 32px; }
    .booking-summary { position: static; }
    .times-grid { grid-template-columns: repeat(3, 1fr); }

    /* Modal */
    .modal { padding: 32px 20px; width: 95%; max-width: 95%; }
    .modal-title { font-size: 28px; }
    .confirm-modal { padding: 36px 24px; }
    .confirm-title { font-size: 32px; }

    /* Citas */
    .citas-grid { grid-template-columns: 1fr; }

    /* Footer */
    .footer { flex-direction: column; gap: 16px; text-align: center; padding: 32px 20px; }

    /* Toast */
    .toast { bottom: 80px; right: 16px; left: 16px; max-width: none; }
  }

  /* Móvil */
  @media (max-width: 480px) {
    /* Nav */
    .nav { padding: 12px 16px; }
    .nav-logo { font-size: 20px; letter-spacing: 3px; }

    /* Hero */
    .hero-content { padding: 90px 16px 32px; }
    .hero-h1 { font-size: clamp(52px, 18vw, 80px); line-height: 0.85; }
    .hero-tag { font-size: 10px; letter-spacing: 3px; }
    .hero-corte-label { display: none; }
    .hero-actions { width: 100%; }
    .btn-primary { width: 100%; text-align: center; padding: 16px; }
    .btn-secondary { width: 100%; text-align: center; padding: 14px; }
    .carousel-arrow { display: none; }

    /* Sections */
    .section { padding: 48px 16px; }
    .section-header { margin-bottom: 32px; }

    /* Servicios */
    .servicios-grid { grid-template-columns: 1fr; }
    .servicio-nombre { font-size: 24px; }
    .servicio-precio { font-size: 28px; }

    /* Barberos */
    .barberos-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
    .barbero-card { padding: 24px 16px 20px; }
    .barbero-avatar { width: 80px; height: 80px; font-size: 36px; }
    .barbero-nombre { font-size: 16px; }
    .barbero-esp { font-size: 11px; }
    .barbero-desc { font-size: 12px; }

    /* Booking */
    .times-grid { grid-template-columns: repeat(3, 1fr); gap: 4px; }
    .time-slot { font-size: 11px; padding: 8px 2px; }
    .summary-total-val { font-size: 32px; }

    /* Modal */
    .modal { padding: 24px 16px; }
    .modal-title { font-size: 26px; }

    /* Footer */
    .footer { padding: 24px 16px; gap: 12px; }
    .footer-logo { font-size: 20px; }
  }

  /* Móvil pequeño */
  @media (max-width: 360px) {
    .barberos-grid { grid-template-columns: 1fr; }
    .servicios-grid { grid-template-columns: 1fr; }
  }


  .whatsapp-float {
  position: fixed;
  bottom: 13px;
  right: 13px;
  width: 50px;
  height: 50px;
  background: #25D366;
  color: white;
  font-size: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  text-decoration: none;
  box-shadow: 0 10px 25px rgba(0,0,0,0.4);
  z-index: 9999;
  transition: all 0.3s ease;
}

.whatsapp-float:hover {
  transform: scale(1.1);
}
  .whatsapp-float {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); }
  100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
}
  .whatsapp-float {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); }
  100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
}

/* ── SECCIÓN DIRECCIÓN ── */
  .direccion-section {
    background: var(--negro);
    border-top: 1px solid rgba(192,57,43,0.15);
    padding: 80px 60px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
  }

  .direccion-info {}

  .direccion-tag {
    font-size: 11px; letter-spacing: 5px;
    text-transform: uppercase; color: var(--rojo);
    display: block; margin-bottom: 12px;
  }

  .direccion-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(40px, 5vw, 64px);
    line-height: 1; letter-spacing: 2px;
    margin-bottom: 32px;
  }

  .direccion-item {
    display: flex; align-items: flex-start; gap: 16px;
    margin-bottom: 20px;
  }

  .direccion-icon {
    color: var(--rojo); font-size: 16px;
    margin-top: 2px; flex-shrink: 0;
  }

  .direccion-label {
    font-size: 10px; letter-spacing: 3px;
    text-transform: uppercase; color: var(--gris);
    margin-bottom: 4px;
  }

  .direccion-valor {
    font-size: 14px; color: var(--blanco);
    font-weight: 300; letter-spacing: 1px;
    line-height: 1.5;
  }

  .direccion-mapa {
    width: 100%; aspect-ratio: 4/3;
    border: 1px solid rgba(255,255,255,0.06);
    filter: grayscale(1) contrast(1.1) brightness(0.7);
    transition: filter 0.4s;
  }

  .direccion-mapa:hover { filter: grayscale(0.3) contrast(1.1) brightness(0.8); }

  @media (max-width: 768px) {
    .direccion-section { grid-template-columns: 1fr; gap: 32px; padding: 60px 20px; }
  }

  /* ── BOTÓN FLOTANTE INSTAGRAM ── */
  .instagram-float {
    position: fixed;
    bottom: 73px;
    right: 13px;
    width: 50px; height: 50px;
    background: radial-gradient(circle at 30% 110%, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
    color: white;
    font-size: 24px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 50%;
    text-decoration: none;
    box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    z-index: 9998;
    transition: all 0.3s ease;
  }

  .instagram-float:hover { transform: scale(1.1); }

 /*  .instagram-float {
  animation: pulse-ig 2s infinite;
}

@keyframes pulse-ig {
  0%   { box-shadow: 0 0 0 0 rgba(188, 24, 136, 0.7); }
  70%  { box-shadow: 0 0 0 15px rgba(188, 24, 136, 0); }
  100% { box-shadow: 0 0 0 0 rgba(188, 24, 136, 0); }
} */

.whatsapp-float, .instagram-float {
  background: var(--negro2);
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
}

.whatsapp-float:hover {
  background: #25D366;
  border-color: #25D366;
}

.instagram-float:hover {
background: radial-gradient(circle at 30% 110%, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
}


  /* ── SECCIÓN PRODUCTOS FLOTANTES ── */
  .pf-section { background: var(--negro2); padding: 100px 60px; }
  .pf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; }

  .pf-card {
    position: relative;
    background: var(--negro3);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    padding: 32px 24px 28px;
    display: flex; flex-direction: column; align-items: center;
    cursor: pointer;
    transition: border-color 0.3s, background 0.3s;
    overflow: hidden;
  }
  .pf-card::before {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0;
    height: 3px; background: var(--rojo);
    transform: scaleX(0); transition: transform 0.4s cubic-bezier(.23,1,.32,1);
  }
  .pf-card:hover { border-color: rgba(192,57,43,0.3); background: #161616; }
  .pf-card:hover::before { transform: scaleX(1); }

  .pf-glow {
    position: absolute; width: 160px; height: 160px; border-radius: 50%;
    background: radial-gradient(circle, rgba(192,57,43,0.12) 0%, transparent 70%);
    top: 20px; left: 50%; transform: translateX(-50%);
    pointer-events: none; opacity: 0; transition: opacity 0.4s;
  }
  .pf-card:hover .pf-glow { opacity: 1; }

  .pf-badge {
    position: absolute; top: 16px; left: 16px;
    background: var(--rojo); color: var(--blanco);
    font-size: 8px; letter-spacing: 2px; text-transform: uppercase;
    padding: 4px 10px; font-family: 'Oswald', sans-serif;
  }

  .pf-img-wrap {
    width: 160px; height: 160px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 8px; position: relative;
    animation: pf-float 3.5s ease-in-out infinite;
  }
  .pf-card:nth-child(2) .pf-img-wrap { animation-delay: -0.8s; }
  .pf-card:nth-child(3) .pf-img-wrap { animation-delay: -1.6s; }
  .pf-card:nth-child(4) .pf-img-wrap { animation-delay: -0.4s; }
  .pf-card:nth-child(5) .pf-img-wrap { animation-delay: -1.2s; }
  .pf-card:nth-child(6) .pf-img-wrap { animation-delay: -2.0s; }

  @keyframes pf-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }

  .pf-img-wrap img {
    width: 140px; height: 140px; object-fit: contain;
    filter: drop-shadow(0 20px 40px rgba(0,0,0,0.8)) drop-shadow(0 4px 16px rgba(192,57,43,0.2));
    transition: filter 0.4s, transform 0.4s;
  }
  .pf-card:hover .pf-img-wrap img {
    filter: drop-shadow(0 28px 48px rgba(0,0,0,0.9)) drop-shadow(0 8px 24px rgba(192,57,43,0.45));
    transform: scale(1.06);
  }

  .pf-shadow {
    width: 80px; height: 12px;
    background: radial-gradient(ellipse, rgba(192,57,43,0.3) 0%, transparent 70%);
    border-radius: 50%; margin-bottom: 4px;
    animation: pf-shadow-pulse 3.5s ease-in-out infinite;
  }
  .pf-card:nth-child(2) .pf-shadow { animation-delay: -0.8s; }
  .pf-card:nth-child(3) .pf-shadow { animation-delay: -1.6s; }
  .pf-card:nth-child(4) .pf-shadow { animation-delay: -0.4s; }
  .pf-card:nth-child(5) .pf-shadow { animation-delay: -1.2s; }
  .pf-card:nth-child(6) .pf-shadow { animation-delay: -2.0s; }

  @keyframes pf-shadow-pulse {
    0%, 100% { transform: scaleX(1); opacity: 0.4; }
    50% { transform: scaleX(0.6); opacity: 0.15; }
  }

  .pf-nombre { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 3px; color: var(--blanco); text-transform: uppercase; text-align: center; margin-top: 16px; margin-bottom: 4px; }
  .pf-cat { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--rojo); text-align: center; margin-bottom: 14px; }
  .pf-divider { width: 32px; height: 1px; background: rgba(192,57,43,0.4); margin: 0 auto 14px; }
  .pf-desc { font-size: 12px; color: var(--gris); font-weight: 300; text-align: center; line-height: 1.7; letter-spacing: 0.3px; margin-bottom: 20px; font-family: 'Crimson Pro', serif; font-style: italic; }

  .pf-footer { display: flex; justify-content: space-between; align-items: center; width: 100%; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px; margin-top: auto; }
  .pf-precio { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--rojo); letter-spacing: 1px; }
  .pf-btn { background: none; border: 1px solid rgba(192,57,43,0.4); color: var(--rojo); font-family: 'Oswald', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; padding: 8px 18px; cursor: pointer; transition: all 0.2s; }
  .pf-btn:hover { background: var(--rojo); color: var(--blanco); border-color: var(--rojo); }

  @media (max-width: 768px) {
    .pf-section { padding: 60px 20px; }
    .pf-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .pf-img-wrap { width: 110px; height: 110px; }
    .pf-img-wrap img { width: 100px; height: 100px; }
  }
  @media (max-width: 480px) {
    .pf-grid { grid-template-columns: 1fr; }
  }

  /* ── SECCIÓN MEMBRESÍAS ── */
  .membresias-section { background: var(--negro); padding: 100px 60px; }
  .membresias-intro { max-width: 700px; margin-bottom: 16px; }
  .membresias-intro-text { font-family: 'Crimson Pro', serif; font-style: italic; font-size: 16px; color: var(--gris); line-height: 1.7; margin-bottom: 40px; }
  .membresias-aviso { display: inline-flex; align-items: flex-start; gap: 12px; background: rgba(192,57,43,0.07); border: 1px solid rgba(192,57,43,0.2); padding: 14px 20px; margin-bottom: 48px; }
  .membresias-aviso-txt { font-size: 11px; color: rgba(240,236,228,0.6); letter-spacing: 0.5px; line-height: 1.6; }
  .membresias-aviso-txt strong { color: var(--rojo); font-weight: 500; }

  .planes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 3px; }

  .plan-card {
    position: relative; background: var(--negro2);
    border: 1px solid rgba(255,255,255,0.05);
    padding: 36px 28px 32px;
    display: flex; flex-direction: column;
    transition: border-color 0.3s, background 0.3s;
  }
  .plan-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0;
    height: 3px; background: transparent;
    transition: background 0.3s;
  }
  .plan-card:hover { border-color: rgba(192,57,43,0.2); background: #141414; }
  .plan-card.featured { border-color: rgba(192,57,43,0.4); background: #131313; }
  .plan-card.featured::before { background: var(--rojo); }

  .plan-badge {
    position: absolute; top: 0; right: 28px;
    background: var(--rojo); color: var(--blanco);
    font-size: 8px; letter-spacing: 3px; text-transform: uppercase;
    padding: 6px 12px; font-family: 'Oswald', sans-serif;
  }

  .plan-nombre { font-family: 'Bebas Neue', sans-serif; font-size: 30px; letter-spacing: 3px; color: var(--blanco); margin-bottom: 6px; }
  .plan-tipo { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--rojo); margin-bottom: 24px; }

  .plan-precio-wrap { margin-bottom: 8px; }
  .plan-precio { font-family: 'Bebas Neue', sans-serif; font-size: 52px; line-height: 1; color: var(--blanco); letter-spacing: 1px; }
  .plan-precio .currency { font-size: 22px; color: var(--rojo); vertical-align: super; margin-right: 2px; }
  .plan-periodo { font-size: 11px; color: var(--gris); letter-spacing: 2px; font-family: 'Oswald', sans-serif; font-weight: 300; display: block; margin-top: 2px; }
  .plan-precio .periodo { font-size: 12px; color: var(--gris); letter-spacing: 2px; font-family: 'Oswald', sans-serif; font-weight: 300; display: block; margin-top: 2px; }
  .plan-ahorro { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--rojo); margin-bottom: 6px; display: block; }

  .plan-sin-membresia { font-size: 11px; color: var(--gris); letter-spacing: 1px; margin-bottom: 4px; }
  .plan-con-membresia { font-size: 11px; color: var(--blanco); letter-spacing: 1px; margin-bottom: 20px; }
  .plan-tachado { text-decoration: line-through; color: var(--gris2); }

  .plan-divider { width: 100%; height: 1px; background: rgba(255,255,255,0.05); margin: 20px 0; }

  .plan-beneficios { list-style: none; padding: 0; margin: 0 0 28px; flex: 1; }
  .plan-beneficios li {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
    font-size: 12px; color: var(--blanco); font-weight: 300; letter-spacing: 0.5px; line-height: 1.4;
  }
  .plan-beneficios li:last-child { border-bottom: none; }
  .plan-check-yes { color: var(--rojo); font-size: 13px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }

  .plan-validez { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--gris); margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
  .plan-validez::before { content: ''; width: 20px; height: 1px; background: var(--rojo); }

  .plan-btn {
    background: none; border: 1px solid rgba(255,255,255,0.12); color: var(--blanco);
    font-family: 'Oswald', sans-serif; font-size: 11px; letter-spacing: 3px;
    text-transform: uppercase; padding: 14px; cursor: pointer; width: 100%;
    transition: all 0.2s;
    clip-path: polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));
  }
  .plan-btn:hover { border-color: rgba(192,57,43,0.5); color: var(--rojo); }
  .plan-card.featured .plan-btn { background: var(--rojo); border-color: var(--rojo); }
  .plan-card.featured .plan-btn:hover { background: var(--rojo-vivo); }

  .terminos-section { background: var(--negro3); border: 1px solid rgba(255,255,255,0.04); padding: 28px 32px; margin-top: 40px; }
  .terminos-title { font-family: 'Oswald', sans-serif; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: var(--rojo); margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
  .terminos-title::before { content: ''; width: 20px; height: 1px; background: var(--rojo); }
  .terminos-list { list-style: none; padding: 0; margin: 0; }
  .terminos-list li { font-size: 11px; color: rgba(240,236,228,0.45); letter-spacing: 0.5px; line-height: 1.7; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.03); display: flex; gap: 8px; }
  .terminos-list li:last-child { border-bottom: none; }
  .terminos-list li::before { content: '·'; color: var(--rojo); flex-shrink: 0; }

  .membresias-footer { display: flex; align-items: center; gap: 32px; flex-wrap: wrap; margin-top: 32px; }
  .membresias-footer-item { display: flex; align-items: center; gap: 8px; }
  .membresias-footer-dot { width: 5px; height: 5px; background: var(--rojo); border-radius: 50%; flex-shrink: 0; }
  .membresias-footer-txt { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--gris2); }

  @media (max-width: 900px) { .planes-grid { grid-template-columns: repeat(2,1fr); } .membresias-section { padding: 60px 20px; } }
  @media (max-width: 580px) { .planes-grid { grid-template-columns: 1fr; gap: 16px; } }
`;

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

function HeroCarousel({ onReservar, onServicios }) {
  const [slides, setSlides] = useState(CAROUSEL_SLIDES);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const progressRef = useRef(null);
  const DURATION = 5000;

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
        <h1 className="hero-h1">LA<br /><span className="red">FAMA</span><br />BARBER</h1>
        <div className="hero-slogan">— All Stars —</div>
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
  }, []);

  useEffect(() => { if (token) { fetchMisCitas(); fetchMiMembresia(); } }, [token]);
  /* 
    const fetchMiMembresia = async () => {
      try {
        const r = await fetch(`${API}/membresias/mi-membresia`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await r.json();
        setMiMembresia(data || null);
      } catch { }
    }; */

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

  const tickerText = '✦ LA FAMA BARBER ✦ ALL STARS ✦ MEDELLÍN ✦ EST. 2015 ✦ CORTES DE ÉLITE ✦ LA FAMA BARBER ✦ ALL STARS ✦ MEDELLÍN ✦ EST. 2015 ✦ CORTES DE ÉLITE ✦ ';


  return (
    <>
      <style>{styles}</style>
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

        <div className="ticker"><span className="ticker-inner">{tickerText}{tickerText}</span></div>

        <section className="section" id="servicios">
          <div className="section-header">
            <span className="section-tag">Lo que hacemos</span>
            <h2 className="section-title">NUESTROS<br />SERVICIOS</h2>
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
            <h2 className="section-title">NUESTROS<br />BARBEROS</h2>
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
            <h2 className="section-title">RESERVA<br />TU CITA</h2>
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

            <div className="pf-card">
              <div className="pf-glow" />
              <span className="pf-badge">Top seller</span>
              <div className="pf-img-wrap">
                {/* Reemplaza src con tu imagen: /productos/pomada.png */}
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
                {/* Reemplaza src con tu imagen: /productos/navaja.png */}
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
                {/* Reemplaza src con tu imagen: /productos/aftershave.png */}
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
                {/* Reemplaza src con tu imagen: /productos/cera.png */}
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
        href="https://wa.me/573183453071?text=Hola%20quiero%20agendar%20un%20corte%20"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
      >
        <FaWhatsapp />
      </a>


    </>

  );
}
