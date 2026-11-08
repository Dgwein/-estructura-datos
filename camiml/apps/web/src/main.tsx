import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type View = "calendar" | "sales";

const demoOrders = [
  { id: "#MLC-8042", buyer: "Valentina R.", product: "Traje clásico · Azul marino", size: "M", date: 8, status: "listo" },
  { id: "#MLC-8043", buyer: "Nicolás P.", product: "Traje slim · Grafito", size: "L", date: 8, status: "preparando" },
  { id: "#MLC-8044", buyer: "Camila M.", product: "Traje clásico · Negro", size: "S", date: 4, status: "por preparar" },
  { id: "#MLC-8045", buyer: "Andrés G.", product: "Traje slim · Azul marino", size: "XL", date: 5, status: "por preparar" },
  { id: "#MLC-8046", buyer: "Josefina T.", product: "Traje clásico · Grafito", size: "M", date: 6, status: "por preparar" },
  { id: "#MLC-8047", buyer: "Diego C.", product: "Traje slim · Negro", size: "L", date: 9, status: "por preparar" },
  { id: "#MLC-8048", buyer: "Fernanda S.", product: "Traje clásico · Azul marino", size: "M", date: 11, status: "por preparar" },
  { id: "#MLC-8049", buyer: "Tomás V.", product: "Traje slim · Grafito", size: "XL", date: 12, status: "por preparar" },
  { id: "#MLC-8050", buyer: "María J.", product: "Traje clásico · Negro", size: "S", date: 13, status: "por preparar" },
  { id: "#MLC-8051", buyer: "Pablo L.", product: "Traje slim · Azul marino", size: "M", date: 16, status: "por preparar" },
  { id: "#MLC-8052", buyer: "Antonia F.", product: "Traje clásico · Grafito", size: "L", date: 18, status: "por preparar" },
  { id: "#MLC-8053", buyer: "Sebastián B.", product: "Traje slim · Negro", size: "M", date: 20, status: "por preparar" },
  { id: "#MLC-8054", buyer: "Isidora N.", product: "Traje clásico · Azul marino", size: "XL", date: 23, status: "por preparar" },
  { id: "#MLC-8055", buyer: "Matías D.", product: "Traje slim · Grafito", size: "L", date: 25, status: "por preparar" },
  { id: "#MLC-8056", buyer: "Emilia O.", product: "Traje clásico · Negro", size: "M", date: 27, status: "por preparar" },
];

const monthlySales = [
  { month: "Nov", amount: 84 }, { month: "Dic", amount: 100 }, { month: "Ene", amount: 89 },
  { month: "Feb", amount: 100 }, { month: "Mar", amount: 115 }, { month: "Abr", amount: 110 },
  { month: "May", amount: 125 }, { month: "Jun", amount: 120 }, { month: "Jul", amount: 143 },
  { month: "Ago", amount: 137 }, { month: "Sep", amount: 159 }, { month: "Oct", amount: 184 },
];

const productMix = [
  { name: "Traje clásico", units: 618, share: 42, color: "lime" },
  { name: "Traje slim", units: 492, share: 34, color: "blue" },
  { name: "Traje casual", units: 356, share: 24, color: "orange" },
];

const sizeMix = [
  { size: "S", units: 218, share: 15 }, { size: "M", units: 493, share: 34 },
  { size: "L", units: 431, share: 29 }, { size: "XL", units: 214, share: 15 },
  { size: "XXL", units: 110, share: 8 },
];

const money = (n: number) => `$${n.toLocaleString("es-CL")}`;
const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function App() {
  const [view, setView] = useState<View>("calendar");
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const today = new Date(2026, 10, 8);
  const shownDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const daysInMonth = new Date(shownDate.getFullYear(), shownDate.getMonth() + 1, 0).getDate();
  const mondayStart = (shownDate.getDay() + 6) % 7;
  const monthOrders = monthOffset === 0 ? demoOrders : [];
  const chosenOrders = selectedDay ? monthOrders.filter((order) => order.date === selectedDay) : monthOrders.filter((order) => order.date >= 8).slice(0, 7);
  const orderDays = useMemo(() => new Set(monthOrders.map((order) => order.date)), [monthOrders]);
  const maxSales = Math.max(...monthlySales.map((item) => item.amount));

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <a className="brand" href="#inicio"><span className="brand-mark">c</span><span>camiml</span></a>
        <div className="store-switch"><span className="store-avatar">V</span><span><b>Vestuario Norte</b><small>Tienda principal</small></span><span className="chevron">⌄</span></div>
        <p className="nav-label">ESPACIO DE TRABAJO</p>
        <nav aria-label="Navegación principal">
          <button className={`nav-item ${view === "calendar" ? "active" : ""}`} onClick={() => { setView("calendar"); setSelectedDay(null); }}><span className="nav-icon">▦</span>Calendario de despacho<span className="nav-count">15</span></button>
          <button className={`nav-item ${view === "sales" ? "active" : ""}`} onClick={() => setView("sales")}><span className="nav-icon">▥</span>Historial de ventas</button>
        </nav>
        <div className="sidebar-bottom"><div className="demo-tag"><span className="demo-dot" /> MODO DEMOSTRACIÓN</div><div className="profile"><span className="profile-avatar">MG</span><span><b>María González</b><small>Administradora</small></span><span className="more">···</span></div></div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="breadcrumb">Operaciones <span>/</span> <b>{view === "calendar" ? "Calendario de despacho" : "Historial de ventas"}</b></div><div className="top-actions"><span className="sync-label"><i /> Datos de ejemplo</span><button className="help-button" aria-label="Ayuda">?</button></div></header>

        {view === "calendar" ? <>
          <section className="page-heading"><div><p className="eyebrow">OPERACIÓN DIARIA</p><h1>Calendario de despacho</h1><p className="page-subtitle">Organiza los pedidos y prepara cada despacho a tiempo.</p></div><button className="primary-button" onClick={() => setSelectedDay(null)}><span>＋</span> Ver todos los pedidos</button></section>
          <section className="metrics-row" aria-label="Resumen de despachos">
            <Metric label="Pedidos por preparar" value="15" note="En los próximos 30 días" icon="▤" tone="lime" />
            <Metric label="Despachan hoy" value="2" note="Domingo, 8 de noviembre" icon="↗" tone="blue" />
            <Metric label="Listos para despacho" value="1" note="Pendiente de recolección" icon="✓" tone="orange" />
          </section>
          <section className="calendar-layout">
            <div className="panel calendar-panel">
              <div className="panel-header"><div><h2>Calendario</h2><p>Selecciona un día para ver sus pedidos</p></div><div className="calendar-controls"><button aria-label="Mes anterior" onClick={() => { setMonthOffset(monthOffset - 1); setSelectedDay(null); }}>‹</button><b>{monthNames[shownDate.getMonth()]} {shownDate.getFullYear()}</b><button aria-label="Mes siguiente" onClick={() => { setMonthOffset(monthOffset + 1); setSelectedDay(null); }}>›</button><button className="today-button" onClick={() => { setMonthOffset(0); setSelectedDay(null); }}>Hoy</button></div></div>
              <div className="calendar-grid"><div className="weekday-row">{["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => <span key={day}>{day}</span>)}</div><div className="days-grid">{Array.from({ length: 42 }, (_, index) => {
                const day = index - mondayStart + 1;
                const inMonth = day > 0 && day <= daysInMonth;
                const orderCount = inMonth ? monthOrders.filter((order) => order.date === day).length : 0;
                const isToday = monthOffset === 0 && day === today.getDate();
                return <button key={index} disabled={!inMonth} className={`day-cell ${inMonth ? "" : "outside"} ${isToday ? "today" : ""} ${selectedDay === day ? "selected" : ""}`} onClick={() => setSelectedDay(day)}><span className="day-number">{inMonth ? day : day <= 0 ? new Date(shownDate.getFullYear(), shownDate.getMonth(), day).getDate() : day - daysInMonth}</span>{orderCount > 0 && <span className="day-orders"><i />{orderCount} {orderCount === 1 ? "pedido" : "pedidos"}</span>}</button>;
              })}</div></div>
              <div className="calendar-legend"><span><i className="legend-today" /> Hoy</span><span><i className="legend-order" /> Día con despachos</span><span className="legend-muted">Las fechas son referenciales en esta demo</span></div>
            </div>
            <div className="panel agenda-panel"><div className="panel-header"><div><h2>{selectedDay ? `${selectedDay} de ${monthNames[shownDate.getMonth()]}` : "Próximos despachos"}</h2><p>{selectedDay ? "Pedidos programados para este día" : "Pedidos que requieren preparación"}</p></div><button className="text-button" onClick={() => setSelectedDay(null)}>Ver todos <span>→</span></button></div>
              <div className="order-list">{chosenOrders.length ? chosenOrders.map((order) => <article className="order-row" key={order.id}><div className="order-date"><b>{String(order.date).padStart(2, "0")}</b><span>nov</span></div><div className="order-info"><div><b>{order.buyer}</b><span className="order-id">{order.id}</span></div><p>{order.product}</p><div className="order-bottom"><span>Talla <b>{order.size}</b></span><span className={`order-status ${order.status.replaceAll(" ", "-")}`}><i />{order.status}</span></div></div></article>) : <div className="empty-state"><span>▦</span><b>Sin pedidos programados</b><p>Prueba otro día o vuelve al mes actual.</p></div>}</div>
              <div className="agenda-footer"><span className="avatar-stack"><i>V</i><i>M</i><i>+</i></span><span>Pedidos de ejemplo para visualizar el flujo</span></div>
            </div>
          </section>
        </> : <>
          <section className="page-heading sales-heading"><div><p className="eyebrow">ANÁLISIS DE VENTAS</p><h1>Lo que más se vende</h1><p className="page-subtitle">Un año de actividad para ayudarte a planificar lo que viene.</p></div><button className="select-button">Últimos 12 meses <span>⌄</span></button></section>
          <section className="metrics-row sales-metrics" aria-label="Resumen de ventas"><Metric label="Unidades vendidas" value="1.466" note="Nov 2025 — Oct 2026" icon="▤" tone="lime" /><Metric label="Venta total" value={money(58_640_000)} note="Promedio de $40.000 por unidad" icon="$" tone="blue" /><Metric label="Mes más fuerte" value="Octubre" note="184 unidades vendidas" icon="↗" tone="orange" /></section>
          <section className="sales-layout">
            <div className="panel trend-panel"><div className="panel-header"><div><h2>Ventas por mes</h2><p>Unidades vendidas en los últimos 12 meses</p></div><span className="chart-legend"><i /> Unidades</span></div><div className="chart-area"><div className="y-axis"><span>200</span><span>150</span><span>100</span><span>50</span><span>0</span></div><div className="bar-chart">{monthlySales.map((item, i) => <div className="bar-column" key={item.month}><div className={`bar ${i === monthlySales.length - 1 ? "bar-current" : ""}`} style={{ height: `${(item.amount / maxSales) * 100}%` }} title={`${item.amount} unidades`}><span>{item.amount}</span></div><small>{item.month}</small></div>)}</div></div><div className="chart-insight"><span className="insight-icon">↗</span><p>Las ventas crecieron <b>119%</b> entre noviembre y octubre. <span>Los trajes clásicos lideran el período.</span></p></div></div>
            <div className="panel mix-panel"><div className="panel-header"><div><h2>Por tipo de traje</h2><p>Distribución de unidades</p></div><button className="dots-button" aria-label="Más opciones">···</button></div><div className="donut-wrap"><div className="donut"><div><b>1.466</b><span>unidades</span></div></div><div className="mix-legend">{productMix.map((item) => <div className="mix-row" key={item.name}><i className={item.color} /><span>{item.name}</span><b>{item.share}%</b></div>)}</div></div><div className="mix-footnote">Sobre el total vendido en el último año</div></div>
          </section>
          <section className="panel size-panel"><div className="panel-header"><div><h2>Ventas por talla</h2><p>Unidades vendidas para planificar tu próxima preparación</p></div><span className="small-tag">ÚLTIMO AÑO</span></div><div className="size-grid">{sizeMix.map((item) => <div className="size-item" key={item.size}><div className="size-top"><span>Talla <b>{item.size}</b></span><span>{item.share}%</span></div><div className="size-track"><i style={{ width: `${item.share * 2.4}%` }} /></div><div className="size-units">{item.units} <span>unidades</span></div></div>)}</div></section>
          <p className="data-note"><span>ⓘ</span> Datos ficticios de demostración. La conexión con Mercado Libre permitirá reemplazarlos con tu historial real.</p>
        </>}
        <footer><span>camiml <span className="muted">· CRM para tu operación</span></span><span>Prototipo funcional · Datos de ejemplo</span></footer>
      </main>
    </div>
  );
}

function Metric({ label, value, note, icon, tone }: { label: string; value: string; note: string; icon: string; tone: string }) {
  return <article className="metric-card"><span className={`metric-icon ${tone}`}>{icon}</span><span className="metric-label">{label}</span><strong>{value}</strong><span className="metric-note">{note}</span></article>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
