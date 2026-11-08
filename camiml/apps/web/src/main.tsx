import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#inicio"><span className="brand-mark">c</span> camiml</a>
        <span className="connection"><i /> Base del proyecto</span>
      </header>
      <section className="welcome" id="inicio">
        <p className="eyebrow">OPERACIONES · MERCADO LIBRE</p>
        <h1>Todo listo para<br /><span>vestir el futuro.</span></h1>
        <p className="intro">Tu centro de ventas, despachos y preparación. Conecta Mercado Libre para empezar a convertir pedidos en un plan claro para tu equipo.</p>
        <a className="button" href="https://www.mercadolibre.com/developers" target="_blank" rel="noreferrer">Preparar conexión <span>↗</span></a>
      </section>
      <section className="cards" aria-label="Módulos del CRM">
        <article className="card"><span className="number">01</span><div className="icon">↗</div><h2>Ventas</h2><p>Pedidos sincronizados, estados y detalle por producto.</p><span className="status">EN PREPARACIÓN</span></article>
        <article className="card"><span className="number">02</span><div className="icon">▦</div><h2>Despachos</h2><p>Calendario operativo para anticipar qué sale y cuándo.</p><span className="status">EN PREPARACIÓN</span></article>
        <article className="card"><span className="number">03</span><div className="icon">◒</div><h2>Proyecciones</h2><p>Necesidades estimadas por talla, traje y período.</p><span className="status">EN PREPARACIÓN</span></article>
      </section>
      <footer><span>camiml <span className="muted">· CRM de operaciones</span></span><span>La base para planificar mejor.</span></footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
