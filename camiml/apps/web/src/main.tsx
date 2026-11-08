import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type View = "calendar" | "sales";
type OrderStatus = "to_prepare" | "preparing" | "ready";
type OrderFilter = "upcoming" | "to_prepare" | "today" | "tomorrow" | "ready";
interface DispatchOrder {
  id: string;
  buyer: string;
  product: string;
  size: string;
  dispatchDate: string;
  status: OrderStatus;
}

const demoToday = "2026-11-08";
const demoTomorrow = "2026-11-09";
const statusLabel: Record<OrderStatus, string> = {
  to_prepare: "por preparar",
  preparing: "preparando",
  ready: "listo para despacho",
};

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
  { size: "0-3 Meses", units: 80 }, { size: "3-6 Meses", units: 105 },
  { size: "6-9 Meses", units: 129 }, { size: "9-12 Meses", units: 138 },
  { size: "12-18 Meses", units: 168 }, { size: "2A", units: 192 },
  { size: "3A", units: 206 }, { size: "4A", units: 232 }, { size: "5A", units: 216 },
];

const money = (n: number) => `$${n.toLocaleString("es-CL")}`;
const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const formatLongDate = (isoDate: string) => new Date(`${isoDate}T12:00:00`).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });

function App() {
  const [view, setView] = useState<View>("calendar");
  const [orders, setOrders] = useState<DispatchOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("upcoming");
  const [selectedOrder, setSelectedOrder] = useState<DispatchOrder | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    fetch("/api/v1/orders")
      .then(async (response) => {
        if (!response.ok) throw new Error("No fue posible leer los pedidos.");
        return response.json() as Promise<DispatchOrder[]>;
      })
      .then((data) => { setOrders(data); setLoadError(""); })
      .catch(() => setLoadError("No se pudo conectar con la base de datos. Inicia PostgreSQL con `docker compose up -d db` y vuelve a cargar."))
      .finally(() => setLoadingOrders(false));
  }, []);

  const today = new Date(`${demoToday}T12:00:00`);
  const shownDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const daysInMonth = new Date(shownDate.getFullYear(), shownDate.getMonth() + 1, 0).getDate();
  const mondayStart = (shownDate.getDay() + 6) % 7;
  const monthKey = `${shownDate.getFullYear()}-${String(shownDate.getMonth() + 1).padStart(2, "0")}`;
  const monthOrders = orders.filter((order) => order.dispatchDate.startsWith(monthKey));
  const preparingCount = orders.filter((order) => order.status !== "ready").length;
  const todayCount = orders.filter((order) => order.dispatchDate === demoToday).length;
  const tomorrowCount = orders.filter((order) => order.dispatchDate === demoTomorrow).length;
  const readyCount = orders.filter((order) => order.status === "ready").length;
  const visibleOrders = useMemo(() => {
    if (selectedDay) {
      const date = `${monthKey}-${String(selectedDay).padStart(2, "0")}`;
      return orders.filter((order) => order.dispatchDate === date);
    }
    switch (orderFilter) {
      case "to_prepare": return orders.filter((order) => order.status !== "ready");
      case "today": return orders.filter((order) => order.dispatchDate === demoToday);
      case "tomorrow": return orders.filter((order) => order.dispatchDate === demoTomorrow);
      case "ready": return orders.filter((order) => order.status === "ready");
      default: return orders.filter((order) => order.dispatchDate >= demoToday).slice(0, 7);
    }
  }, [orders, orderFilter, selectedDay, monthKey]);
  const maxSales = Math.max(...monthlySales.map((item) => item.amount));

  const chooseFilter = (filter: OrderFilter) => {
    setOrderFilter(filter);
    setSelectedDay(null);
  };

  const updateStatus = async (order: DispatchOrder, nextStatus: OrderStatus) => {
    setSavingOrder(true);
    setUpdateError("");
    try {
      const response = await fetch(`/api/v1/orders/${encodeURIComponent(order.id)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message ?? "No se pudo actualizar el estado.");
      }
      const updated = await response.json() as DispatchOrder;
      setOrders((current) => current.map((item) => item.id === updated.id ? updated : item));
      setSelectedOrder(updated);
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : "No se pudo actualizar el estado.");
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <a className="brand" href="#inicio" aria-label="La Tiendita de Camille"><img className="brand-logo" src="/brand/la-tiendita-de-camille.png" alt="La Tiendita de Camille" /></a>
        <div className="store-switch"><span className="store-avatar">ML</span><span><b>Mercado Libre</b><small>Canal de venta</small></span><span className="chevron">⌄</span></div>
        <p className="nav-label">ESPACIO DE TRABAJO</p>
        <nav aria-label="Navegación principal">
          <button className={`nav-item ${view === "calendar" ? "active" : ""}`} onClick={() => { setView("calendar"); setSelectedDay(null); }}><span className="nav-icon">▦</span>Calendario de despacho<span className="nav-count">{preparingCount}</span></button>
          <button className={`nav-item ${view === "sales" ? "active" : ""}`} onClick={() => setView("sales")}><span className="nav-icon">▥</span>Historial de ventas</button>
        </nav>
        <div className="sidebar-bottom"><div className="demo-tag"><span className="demo-dot" /> MODO DEMOSTRACIÓN</div><div className="profile"><span className="profile-avatar">CB</span><span><b>Catalina Benítez</b><small>Administradora</small></span><span className="more">···</span></div></div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="breadcrumb">Operaciones <span>/</span> <b>{view === "calendar" ? "Calendario de despacho" : "Historial de ventas"}</b></div><div className="top-actions"><span className="sync-label"><i /> Base de datos demo</span><button className="help-button" aria-label="Ayuda">?</button></div></header>

        {view === "calendar" ? <>
          <section className="page-heading"><div><p className="eyebrow">OPERACIÓN DIARIA</p><h1>Calendario de despacho</h1><p className="page-subtitle">Organiza los pedidos y prepara cada despacho a tiempo.</p></div><button className="primary-button" onClick={() => chooseFilter("upcoming")}><span>＋</span> Ver próximos pedidos</button></section>
          {loadError && <div className="connection-error" role="alert">{loadError}</div>}
          <section className="metrics-row" aria-label="Resumen de despachos">
            <Metric label="Pedidos por preparar" value={loadingOrders ? "—" : String(preparingCount)} note="Preparando o pendientes" icon="▤" tone="lime" active={orderFilter === "to_prepare" && !selectedDay} onClick={() => chooseFilter("to_prepare")} />
            <Metric label="Despachan hoy" value={loadingOrders ? "—" : String(todayCount)} note={formatLongDate(demoToday)} icon="↗" tone="blue" active={orderFilter === "today" && !selectedDay} onClick={() => chooseFilter("today")} />
            <Metric label="Despachan mañana" value={loadingOrders ? "—" : String(tomorrowCount)} note={formatLongDate(demoTomorrow)} icon="→" tone="orange" active={orderFilter === "tomorrow" && !selectedDay} onClick={() => chooseFilter("tomorrow")} />
            <Metric label="Listos para despacho" value={loadingOrders ? "—" : String(readyCount)} note="Pendientes de recolección" icon="✓" tone="lime" active={orderFilter === "ready" && !selectedDay} onClick={() => chooseFilter("ready")} />
          </section>
          <section className="calendar-layout">
            <div className="panel calendar-panel">
              <div className="panel-header"><div><h2>Calendario</h2><p>Selecciona un día para ver sus pedidos</p></div><div className="calendar-controls"><button aria-label="Mes anterior" onClick={() => { setMonthOffset(monthOffset - 1); setSelectedDay(null); }}>‹</button><b>{monthNames[shownDate.getMonth()]} {shownDate.getFullYear()}</b><button aria-label="Mes siguiente" onClick={() => { setMonthOffset(monthOffset + 1); setSelectedDay(null); }}>›</button><button className="today-button" onClick={() => { setMonthOffset(0); setSelectedDay(null); }}>Hoy</button></div></div>
              <div className="calendar-grid"><div className="weekday-row">{["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => <span key={day}>{day}</span>)}</div><div className="days-grid">{Array.from({ length: 42 }, (_, index) => {
                const day = index - mondayStart + 1;
                const inMonth = day > 0 && day <= daysInMonth;
                const isoDate = inMonth ? `${monthKey}-${String(day).padStart(2, "0")}` : "";
                const orderCount = inMonth ? monthOrders.filter((order) => order.dispatchDate === isoDate).length : 0;
                const isToday = monthOffset === 0 && day === today.getDate();
                return <button key={index} disabled={!inMonth} className={`day-cell ${inMonth ? "" : "outside"} ${isToday ? "today" : ""} ${selectedDay === day ? "selected" : ""}`} onClick={() => { setSelectedDay(day); setOrderFilter("upcoming"); }}><span className="day-number">{inMonth ? day : day <= 0 ? new Date(shownDate.getFullYear(), shownDate.getMonth(), day).getDate() : day - daysInMonth}</span>{orderCount > 0 && <span className="day-orders"><i />{orderCount} {orderCount === 1 ? "pedido" : "pedidos"}</span>}</button>;
              })}</div></div>
              <div className="calendar-legend"><span><i className="legend-today" /> Hoy</span><span><i className="legend-order" /> Día con despachos</span><span className="legend-muted">Las fechas son referenciales en esta demo</span></div>
            </div>
            <div className="panel agenda-panel"><div className="panel-header"><div><h2>{selectedDay ? `${selectedDay} de ${monthNames[shownDate.getMonth()]}` : filterTitle(orderFilter)}</h2><p>{selectedDay ? "Pedidos programados para este día" : "Selecciona un pedido para revisar o actualizar su preparación"}</p></div>{(selectedDay || orderFilter !== "upcoming") && <button className="text-button" onClick={() => { setSelectedDay(null); chooseFilter("upcoming"); }}>Ver próximos <span>→</span></button>}</div>
              <div className="order-list">{loadingOrders ? <div className="empty-state"><span>◌</span><b>Cargando pedidos…</b><p>Leyendo datos guardados.</p></div> : visibleOrders.length ? visibleOrders.map((order) => <button className="order-row" key={order.id} onClick={() => { setSelectedOrder(order); setUpdateError(""); }}><span className="order-date"><b>{order.dispatchDate.slice(8, 10)}</b><span>{monthNames[Number(order.dispatchDate.slice(5, 7)) - 1].slice(0, 3)}</span></span><span className="order-info"><span className="order-title-line"><b>{order.buyer}</b><span className="order-id">#{order.id}</span></span><span className="order-product">{order.product}</span><span className="order-bottom"><span>Talla <b>{order.size}</b></span><span className={`order-status ${order.status}`}><i />{statusLabel[order.status]}</span></span></span><span className="order-open">›</span></button>) : <div className="empty-state"><span>▦</span><b>Sin pedidos en este grupo</b><p>Prueba otra tarjeta o selecciona otro día.</p></div>}</div>
              <div className="agenda-footer"><span className="avatar-stack"><i>V</i><i>M</i><i>+</i></span><span>Los cambios de estado se guardan en PostgreSQL</span></div>
            </div>
          </section>
        </> : <>
          <section className="page-heading sales-heading"><div><p className="eyebrow">ANÁLISIS DE VENTAS</p><h1>Lo que más se vende</h1><p className="page-subtitle">Un año de actividad para ayudarte a planificar lo que viene.</p></div><button className="select-button">Últimos 12 meses <span>⌄</span></button></section>
          <section className="metrics-row sales-metrics" aria-label="Resumen de ventas"><Metric label="Unidades vendidas" value="1.466" note="Nov 2025 — Oct 2026" icon="▤" tone="lime" /><Metric label="Venta total" value={money(58_640_000)} note="Promedio de $40.000 por unidad" icon="$" tone="blue" /><Metric label="Mes más fuerte" value="Octubre" note="184 unidades vendidas" icon="↗" tone="orange" /></section>
          <section className="sales-layout">
            <div className="panel trend-panel"><div className="panel-header"><div><h2>Ventas por mes</h2><p>Unidades vendidas en los últimos 12 meses</p></div><span className="chart-legend"><i /> Unidades</span></div><div className="chart-area"><div className="y-axis"><span>200</span><span>150</span><span>100</span><span>50</span><span>0</span></div><div className="bar-chart">{monthlySales.map((item, i) => <div className="bar-column" key={item.month}><div className={`bar ${i === monthlySales.length - 1 ? "bar-current" : ""}`} style={{ height: `${(item.amount / maxSales) * 100}%` }} title={`${item.amount} unidades`}><span>{item.amount}</span></div><small>{item.month}</small></div>)}</div></div><div className="chart-insight"><span className="insight-icon">↗</span><p>Las ventas crecieron <b>119%</b> entre noviembre y octubre. <span>Los trajes clásicos lideran el período.</span></p></div></div>
            <div className="panel mix-panel"><div className="panel-header"><div><h2>Por tipo de traje</h2><p>Distribución de unidades</p></div><button className="dots-button" aria-label="Más opciones">···</button></div><div className="donut-wrap"><div className="donut"><div><b>1.466</b><span>unidades</span></div></div><div className="mix-legend">{productMix.map((item) => <div className="mix-row" key={item.name}><i className={item.color} /><span>{item.name}</span><b>{item.share}%</b></div>)}</div></div><div className="mix-footnote">Sobre el total vendido en el último año</div></div>
          </section>
          <section className="panel size-panel"><div className="panel-header"><div><h2>Ventas por talla</h2><p>Unidades vendidas para planificar tu próxima preparación</p></div><span className="small-tag">ÚLTIMO AÑO</span></div><div className="size-grid age-size-grid">{sizeMix.map((item) => <div className="size-item" key={item.size}><div className="size-top"><span>{item.size}</span><span>{Math.round(item.units / 1466 * 100)}%</span></div><div className="size-track"><i style={{ width: `${item.units / 2.32}%` }} /></div><div className="size-units">{item.units} <span>unidades</span></div></div>)}</div></section>
          <p className="data-note"><span>ⓘ</span> Datos ficticios de demostración. La conexión con Mercado Libre permitirá reemplazarlos con tu historial real.</p>
        </>}
        <footer><span>camiml <span className="muted">· CRM para tu operación</span></span><span>Prototipo funcional · Datos de ejemplo</span></footer>
      </main>

      {selectedOrder && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedOrder(null); }}><section className="order-modal" role="dialog" aria-modal="true" aria-labelledby="order-modal-title"><header className="modal-header"><div><p className="eyebrow">DETALLE DEL PEDIDO</p><h2 id="order-modal-title">#{selectedOrder.id}</h2></div><button className="modal-close" aria-label="Cerrar detalle" onClick={() => setSelectedOrder(null)}>×</button></header><div className="modal-buyer"><span className="profile-avatar">{selectedOrder.buyer.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span><b>{selectedOrder.buyer}</b><small>Despacho: {formatLongDate(selectedOrder.dispatchDate)}</small></span></div><div className="modal-section"><span>PRODUCTO</span><b>{selectedOrder.product}</b></div><div className="modal-details"><div><span>Talla</span><b>{selectedOrder.size}</b></div><div><span>Unidades</span><b>1</b></div><div><span>Canal</span><b>Mercado Libre</b></div></div><div className="modal-status"><span>Estado de preparación</span><span className={`order-status ${selectedOrder.status}`}><i />{statusLabel[selectedOrder.status]}</span></div>{updateError && <p className="update-error" role="alert">{updateError}</p>}{selectedOrder.status === "to_prepare" ? <button className="modal-action secondary-action" disabled={savingOrder} onClick={() => updateStatus(selectedOrder, "preparing")}>{savingOrder ? "Guardando…" : "Comenzar preparación"}</button> : selectedOrder.status === "preparing" ? <button className="modal-action" disabled={savingOrder} onClick={() => updateStatus(selectedOrder, "ready")}>{savingOrder ? "Guardando…" : "Marcar como listo para despacho"}</button> : <div className="ready-confirmation"><span>✓</span> Pedido listo para despacho</div>}<p className="modal-footnote">El estado se guarda en la base de datos y se conserva al volver a abrir la maqueta.</p></section></div>}
    </div>
  );
}

function filterTitle(filter: OrderFilter) {
  switch (filter) {
    case "to_prepare": return "Pedidos por preparar";
    case "today": return "Despachan hoy";
    case "tomorrow": return "Despachan mañana";
    case "ready": return "Listos para despacho";
    default: return "Próximos despachos";
  }
}

function Metric({ label, value, note, icon, tone, onClick, active = false }: { label: string; value: string; note: string; icon: string; tone: string; onClick?: () => void; active?: boolean }) {
  const className = `metric-card ${onClick ? "metric-action" : ""} ${active ? "metric-selected" : ""}`;
  const content = <><span className={`metric-icon ${tone}`}>{icon}</span><span className="metric-label">{label}</span><strong>{value}</strong><span className="metric-note">{note}</span>{onClick && <span className="metric-hint">Ver detalle →</span>}</>;
  return onClick ? <button className={className} onClick={onClick} aria-pressed={active}>{content}</button> : <article className={className}>{content}</article>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
