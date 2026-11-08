import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type View = "calendar" | "sales" | "customers" | "profile";
type OrderStatus = "to_prepare" | "preparing" | "ready";
type StockSync = "not_sent" | "simulated" | "synced";
type Channel = "mercadolibre" | "amazon" | "tiktok" | "all";
type OrderFilter = "upcoming" | "to_prepare" | "today" | "tomorrow" | "ready";
interface DispatchOrder {
  id: string;
  buyer: string;
  product: string;
  size: string;
  dispatchDate: string;
  status: OrderStatus;
  stockSync: StockSync;
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

const channelOptions: { id: Channel; title: string; short: string; subtitle: string }[] = [
  { id: "mercadolibre", title: "Mercado Libre", short: "ML", subtitle: "Datos de demo" },
  { id: "amazon", title: "Amazon", short: "A", subtitle: "Sin conectar" },
  { id: "tiktok", title: "TikTok Shop", short: "T", subtitle: "Sin conectar" },
  { id: "all", title: "Ver todo", short: "•••", subtitle: "Todos los canales" },
];

interface AdminProfile {
  displayName: string;
  phone: string;
  timeZone: string;
  notifyDispatch: boolean;
  notifyWeekly: boolean;
}

const defaultProfile: AdminProfile = {
  displayName: "Catalina Benítez",
  phone: "",
  timeZone: "America/Mexico_City",
  notifyDispatch: true,
  notifyWeekly: true,
};

const demoCustomers = [
  { id: "CLI-1001", name: "Isidora Valdés", dates: ["2025-12-01", "2026-02-10", "2026-04-12", "2026-07-05", "2026-10-20"], favorite: "Trajes de ceremonia", size: "3A" },
  { id: "CLI-1002", name: "Nicolás Barría", dates: ["2025-11-20", "2026-02-20", "2026-06-20", "2026-10-05"], favorite: "Traje clásico", size: "4A" },
  { id: "CLI-1003", name: "Josefa Torres", dates: ["2026-01-15", "2026-05-16", "2026-10-12"], favorite: "Trajes de bautizo", size: "12-18 Meses" },
  { id: "CLI-1004", name: "Mateo Cárdenas", dates: ["2026-06-01", "2026-10-22"], favorite: "Traje slim", size: "5A" },
  { id: "CLI-1005", name: "Antonia Soto", dates: ["2026-10-18"], favorite: "Trajes de ceremonia", size: "2A" },
  { id: "CLI-1006", name: "Emilia Rojas", dates: ["2026-09-30"], favorite: "Traje clásico", size: "3-6 Meses" },
  { id: "CLI-1007", name: "Diego Muñoz", dates: ["2026-08-04"], favorite: "Traje slim", size: "4A" },
  { id: "CLI-1008", name: "Valentina Pino", dates: ["2026-10-26"], favorite: "Trajes de bautizo", size: "6-9 Meses" },
];

const money = (n: number) => `$${n.toLocaleString("es-MX")}`;
const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const formatLongDate = (isoDate: string) => new Date(`${isoDate}T12:00:00`).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
const formatShortDate = (isoDate: string) => new Date(`${isoDate}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short" });

function customerFrequency(dates: string[]) {
  if (dates.length < 2) return null;
  const totalDays = dates.slice(1).reduce((sum, date, index) => sum + (new Date(`${date}T12:00:00`).getTime() - new Date(`${dates[index]}T12:00:00`).getTime()) / 86_400_000, 0);
  return Math.round(totalDays / (dates.length - 1));
}

function customerBenefit(customer: (typeof demoCustomers)[number]) {
  const daysSinceLast = (new Date(`${demoToday}T12:00:00`).getTime() - new Date(`${customer.dates.at(-1)}T12:00:00`).getTime()) / 86_400_000;
  if (customer.dates.length >= 4) return { segment: "Cliente frecuente", idea: "Acceso anticipado o beneficio VIP", tone: "vip" };
  if (customer.dates.length >= 2) return { segment: "Cliente recurrente", idea: "Envío gratis en su próxima compra", tone: "repeat" };
  if (daysSinceLast > 60) return { segment: "Por reactivar", idea: "Cupón de regreso (por revisar)", tone: "sleeping" };
  return { segment: "Primera compra", idea: "Agradecimiento para segunda compra", tone: "new" };
}

function loadProfile(): AdminProfile {
  try {
    const stored = localStorage.getItem("camiml-admin-profile");
    return stored ? { ...defaultProfile, ...JSON.parse(stored) as Partial<AdminProfile> } : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

function App() {
  const [view, setView] = useState<View>("calendar");
  const [channel, setChannel] = useState<Channel>("mercadolibre");
  const [channelMenuOpen, setChannelMenuOpen] = useState(false);
  const [profile, setProfile] = useState<AdminProfile>(loadProfile);
  const [profileDraft, setProfileDraft] = useState<AdminProfile>(profile);
  const [profileMessage, setProfileMessage] = useState("");
  const [showValidationInfo, setShowValidationInfo] = useState(false);
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
      .catch(() => setLoadError("No se pudo cargar la simulación de Mercado Libre. Comprueba que la API esté iniciada con `npm run dev`."))
      .finally(() => setLoadingOrders(false));
  }, []);

  const today = new Date(`${demoToday}T12:00:00`);
  const selectedChannel = channelOptions.find((item) => item.id === channel) ?? channelOptions[0];
  const channelHasDemoData = channel === "mercadolibre" || channel === "all";
  const channelOrders = channelHasDemoData ? orders : [];
  const shownDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const daysInMonth = new Date(shownDate.getFullYear(), shownDate.getMonth() + 1, 0).getDate();
  const mondayStart = (shownDate.getDay() + 6) % 7;
  const monthKey = `${shownDate.getFullYear()}-${String(shownDate.getMonth() + 1).padStart(2, "0")}`;
  const monthOrders = channelOrders.filter((order) => order.dispatchDate.startsWith(monthKey));
  const preparingCount = channelOrders.filter((order) => order.status !== "ready").length;
  const todayCount = channelOrders.filter((order) => order.dispatchDate === demoToday).length;
  const tomorrowCount = channelOrders.filter((order) => order.dispatchDate === demoTomorrow).length;
  const readyCount = channelOrders.filter((order) => order.status === "ready").length;
  const visibleOrders = useMemo(() => {
    if (selectedDay) {
      const date = `${monthKey}-${String(selectedDay).padStart(2, "0")}`;
      return channelOrders.filter((order) => order.dispatchDate === date);
    }
    switch (orderFilter) {
      case "to_prepare": return channelOrders.filter((order) => order.status !== "ready");
      case "today": return channelOrders.filter((order) => order.dispatchDate === demoToday);
      case "tomorrow": return channelOrders.filter((order) => order.dispatchDate === demoTomorrow);
      case "ready": return channelOrders.filter((order) => order.status === "ready");
      default: return channelOrders.filter((order) => order.dispatchDate >= demoToday).slice(0, 7);
    }
  }, [channelOrders, orderFilter, selectedDay, monthKey]);
  const maxSales = Math.max(...monthlySales.map((item) => item.amount));

  const chooseFilter = (filter: OrderFilter) => {
    setOrderFilter(filter);
    setSelectedDay(null);
  };

  const chooseChannel = (nextChannel: Channel) => {
    setChannel(nextChannel);
    setChannelMenuOpen(false);
    setSelectedDay(null);
    setSelectedOrder(null);
  };

  const saveProfile = () => {
    localStorage.setItem("camiml-admin-profile", JSON.stringify(profileDraft));
    setProfile(profileDraft);
    setProfileMessage("Preferencias guardadas en este navegador.");
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
        <div className="channel-select"><button className="store-switch" aria-expanded={channelMenuOpen} onClick={() => setChannelMenuOpen(!channelMenuOpen)}><span className="store-avatar">{selectedChannel.short}</span><span><b>{selectedChannel.title}</b><small>{selectedChannel.subtitle}</small></span><span className="chevron">⌄</span></button>{channelMenuOpen && <div className="channel-menu" role="menu" aria-label="Seleccionar canal">{channelOptions.map((item) => <button key={item.id} role="menuitemradio" aria-checked={channel === item.id} className={`channel-option ${channel === item.id ? "current" : ""}`} onClick={() => chooseChannel(item.id)}><span className="channel-option-icon">{item.short}</span><span><b>{item.title}</b><small>{item.subtitle}</small></span>{channel === item.id && <span className="channel-check">✓</span>}</button>)}</div>}</div>
        <p className="nav-label">ESPACIO DE TRABAJO</p>
        <nav aria-label="Navegación principal">
          <button className={`nav-item ${view === "calendar" ? "active" : ""}`} onClick={() => { setView("calendar"); setSelectedDay(null); }}><span className="nav-icon">▦</span>Calendario de despacho<span className="nav-count">{preparingCount}</span></button>
          <button className={`nav-item ${view === "sales" ? "active" : ""}`} onClick={() => setView("sales")}><span className="nav-icon">▥</span>Historial de ventas</button>
          <button className={`nav-item ${view === "customers" ? "active" : ""}`} onClick={() => setView("customers")}><span className="nav-icon">♙</span>Clientes frecuentes</button>
        </nav>
        <div className="sidebar-bottom"><div className="demo-tag"><span className="demo-dot" /> MODO DEMOSTRACIÓN</div><button className={`profile profile-button ${view === "profile" ? "profile-active" : ""}`} onClick={() => { setProfileDraft(profile); setProfileMessage(""); setShowValidationInfo(false); setView("profile"); }}><span className="profile-avatar">{profile.displayName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span><b>{profile.displayName}</b><small>Administradora · Mi perfil</small></span><span className="more">···</span></button></div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="breadcrumb">Operaciones <span>/</span> <b>{view === "calendar" ? "Calendario de despacho" : view === "sales" ? "Historial de ventas" : view === "customers" ? "Clientes frecuentes" : "Perfil de administradora"}</b></div><div className="top-actions"><span className="sync-label"><i />{channel === "all" ? "Demo: solo Mercado Libre tiene datos" : channel === "mercadolibre" ? "Simulación de Mercado Libre" : `${selectedChannel.title} · Sin conectar`}</span><button className="help-button" aria-label="Ayuda">?</button></div></header>

        {view === "calendar" ? <>
          <section className="page-heading"><div><p className="eyebrow">OPERACIÓN DIARIA</p><h1>Calendario de despacho</h1><p className="page-subtitle">Organiza los pedidos y prepara cada despacho a tiempo.</p></div><button className="primary-button" onClick={() => chooseFilter("upcoming")}><span>＋</span> Ver próximos pedidos</button></section>
          {loadError && <div className="connection-error" role="alert">{loadError}</div>}
          {channel === "all" && <div className="channel-notice">En esta demo solo Mercado Libre tiene pedidos. Amazon y TikTok Shop aparecerán al conectar sus canales.</div>}
          {!channelHasDemoData && <div className="channel-notice">{selectedChannel.title} está agregado como canal, pero aún no tiene una fuente conectada ni pedidos de demostración.</div>}
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
            <div className="panel agenda-panel"><div className="panel-header"><div><h2>{selectedDay ? "Detalle del día" : filterTitle(orderFilter)}</h2><p>{selectedDay ? `${formatLongDate(`${monthKey}-${String(selectedDay).padStart(2, "0")}`)} · ${visibleOrders.length} ${visibleOrders.length === 1 ? "pedido" : "pedidos"}` : "Selecciona un pedido para revisar o actualizar su preparación"}</p></div>{(selectedDay || orderFilter !== "upcoming") && <button className="text-button" onClick={() => { setSelectedDay(null); chooseFilter("upcoming"); }}>Ver próximos <span>→</span></button>}</div>
              <div className="order-list">{loadingOrders ? <div className="empty-state"><span>◌</span><b>Cargando pedidos…</b><p>Leyendo datos guardados.</p></div> : visibleOrders.length ? visibleOrders.map((order) => <button className="order-row" key={order.id} onClick={() => { setSelectedOrder(order); setUpdateError(""); }}><span className="order-date"><b>{order.dispatchDate.slice(8, 10)}</b><span>{monthNames[Number(order.dispatchDate.slice(5, 7)) - 1].slice(0, 3)}</span></span><span className="order-info"><span className="order-title-line"><b>{order.buyer}</b><span className="order-id">#{order.id}</span></span><span className="order-product">{order.product}</span><span className="order-bottom"><span>Talla <b>{order.size}</b></span><span className={`order-status ${order.status}`}><i />{statusLabel[order.status]}</span></span></span><span className="order-open">›</span></button>) : <div className="empty-state"><span>▦</span><b>Sin pedidos en este grupo</b><p>Prueba otra tarjeta o selecciona otro día.</p></div>}</div>
              <div className="agenda-footer"><span className="avatar-stack"><i>V</i><i>M</i><i>+</i></span><span>Estados y avisos de stock simulados en memoria</span></div>
            </div>
          </section>
        </> : view === "sales" ? <>
          <section className="page-heading sales-heading"><div><p className="eyebrow">ANÁLISIS DE VENTAS</p><h1>Lo que más se vende</h1><p className="page-subtitle">Un año de actividad para ayudarte a planificar lo que viene.</p></div><button className="select-button">Últimos 12 meses <span>⌄</span></button></section>
          {!channelHasDemoData ? <ChannelEmptyState channelName={selectedChannel.title} onChooseMercadoLibre={() => chooseChannel("mercadolibre")} /> : <>
          {channel === "all" && <div className="channel-notice">Los datos ficticios disponibles en esta vista corresponden a Mercado Libre; Amazon y TikTok Shop aún no están conectados.</div>}
          <section className="metrics-row sales-metrics" aria-label="Resumen de ventas"><Metric label="Unidades vendidas" value="1.466" note="Nov 2025 — Oct 2026" icon="▤" tone="lime" /><Metric label="Venta total" value={money(58_640_000)} note="Promedio de $40.000 por unidad" icon="$" tone="blue" /><Metric label="Mes más fuerte" value="Octubre" note="184 unidades vendidas" icon="↗" tone="orange" /></section>
          <section className="sales-layout">
            <div className="panel trend-panel"><div className="panel-header"><div><h2>Ventas por mes</h2><p>Unidades vendidas en los últimos 12 meses</p></div><span className="chart-legend"><i /> Unidades</span></div><div className="chart-area"><div className="y-axis"><span>200</span><span>150</span><span>100</span><span>50</span><span>0</span></div><div className="bar-chart">{monthlySales.map((item, i) => <div className="bar-column" key={item.month}><div className={`bar ${i === monthlySales.length - 1 ? "bar-current" : ""}`} style={{ height: `${(item.amount / maxSales) * 100}%` }} title={`${item.amount} unidades`}><span>{item.amount}</span></div><small>{item.month}</small></div>)}</div></div><div className="chart-insight"><span className="insight-icon">↗</span><p>Las ventas crecieron <b>119%</b> entre noviembre y octubre. <span>Los trajes clásicos lideran el período.</span></p></div></div>
            <div className="panel mix-panel"><div className="panel-header"><div><h2>Por tipo de traje</h2><p>Distribución de unidades</p></div><button className="dots-button" aria-label="Más opciones">···</button></div><div className="donut-wrap"><div className="donut"><div><b>1.466</b><span>unidades</span></div></div><div className="mix-legend">{productMix.map((item) => <div className="mix-row" key={item.name}><i className={item.color} /><span>{item.name}</span><b>{item.share}%</b></div>)}</div></div><div className="mix-footnote">Sobre el total vendido en el último año</div></div>
          </section>
          <section className="panel size-panel"><div className="panel-header"><div><h2>Ventas por talla</h2><p>Unidades vendidas para planificar tu próxima preparación</p></div><span className="small-tag">ÚLTIMO AÑO</span></div><div className="size-grid age-size-grid">{sizeMix.map((item) => <div className="size-item" key={item.size}><div className="size-top"><span>{item.size}</span><span>{Math.round(item.units / 1466 * 100)}%</span></div><div className="size-track"><i style={{ width: `${item.units / 2.32}%` }} /></div><div className="size-units">{item.units} <span>unidades</span></div></div>)}</div></section>
          <p className="data-note"><span>ⓘ</span> Datos ficticios de demostración. La conexión con Mercado Libre permitirá reemplazarlos con tu historial real.</p>
          </>}
        </> : view === "customers" ? <CustomersModule channel={channel} onChooseMercadoLibre={() => chooseChannel("mercadolibre")} /> : <ProfileModule profile={profileDraft} setProfile={setProfileDraft} message={profileMessage} onSave={saveProfile} showValidationInfo={showValidationInfo} setShowValidationInfo={setShowValidationInfo} />}
        <footer><span>camiml <span className="muted">· CRM para tu operación</span></span><span>Prototipo funcional · Datos de ejemplo</span></footer>
      </main>

      {selectedOrder && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedOrder(null); }}><section className="order-modal" role="dialog" aria-modal="true" aria-labelledby="order-modal-title"><header className="modal-header"><div><p className="eyebrow">DETALLE DEL PEDIDO</p><h2 id="order-modal-title">#{selectedOrder.id}</h2></div><button className="modal-close" aria-label="Cerrar detalle" onClick={() => setSelectedOrder(null)}>×</button></header><div className="modal-buyer"><span className="profile-avatar">{selectedOrder.buyer.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span><b>{selectedOrder.buyer}</b><small>Despacho: {formatLongDate(selectedOrder.dispatchDate)}</small></span></div><div className="modal-section"><span>PRODUCTO</span><b>{selectedOrder.product}</b></div><div className="modal-details"><div><span>Talla</span><b>{selectedOrder.size}</b></div><div><span>Unidades</span><b>1</b></div><div><span>Canal</span><b>Mercado Libre</b></div></div><div className="modal-status"><span>Estado de preparación</span><span className={`order-status ${selectedOrder.status}`}><i />{statusLabel[selectedOrder.status]}</span></div>{updateError && <p className="update-error" role="alert">{updateError}</p>}{selectedOrder.status === "to_prepare" ? <button className="modal-action secondary-action" disabled={savingOrder} onClick={() => updateStatus(selectedOrder, "preparing")}>{savingOrder ? "Guardando…" : "Comenzar preparación"}</button> : selectedOrder.status === "preparing" ? <button className="modal-action" disabled={savingOrder} onClick={() => updateStatus(selectedOrder, "ready")}>{savingOrder ? "Simulando…" : "Marcar listo + simular aviso a ML"}</button> : <div className="ready-confirmation"><span>✓</span><div>Listo para despacho<small>{selectedOrder.stockSync === "synced" ? "Stock sincronizado con Mercado Libre" : "Aviso de stock simulado; Mercado Libre aún no está conectado"}</small></div></div>}<p className="modal-footnote">La demo simula la confirmación. La conexión real deberá enviar el cambio a Mercado Libre.</p></section></div>}
    </div>
  );
}

function ChannelEmptyState({ channelName, onChooseMercadoLibre }: { channelName: string; onChooseMercadoLibre: () => void }) {
  return <section className="channel-empty"><span className="empty-channel-icon">↗</span><h2>{channelName} aún no está conectado</h2><p>La demo solo tiene datos de Mercado Libre. Cuando conectemos este canal, aquí aparecerán sus ventas, despachos y clientes.</p><button className="outline-button" onClick={onChooseMercadoLibre}>Volver a Mercado Libre</button></section>;
}

function CustomersModule({ channel, onChooseMercadoLibre }: { channel: Channel; onChooseMercadoLibre: () => void }) {
  const hasData = channel === "mercadolibre" || channel === "all";
  const repeatCustomers = demoCustomers.filter((customer) => customer.dates.length > 1);
  const averageInterval = Math.round(repeatCustomers.flatMap((customer) => {
    const frequency = customerFrequency(customer.dates);
    return frequency === null ? [] : [frequency];
  }).reduce((sum, days) => sum + days, 0) / repeatCustomers.length);
  const sortedCustomers = [...demoCustomers].sort((a, b) => b.dates.length - a.dates.length || b.dates.at(-1)!.localeCompare(a.dates.at(-1)!));

  return <>
    <section className="page-heading"><div><p className="eyebrow">RELACIÓN CON CLIENTES</p><h1>Clientes frecuentes</h1><p className="page-subtitle">Identifica recompras y oportunidades para reconocer su preferencia.</p></div><span className="small-tag">NOV 2025 — OCT 2026</span></section>
    {!hasData ? <ChannelEmptyState channelName={channelOptions.find((item) => item.id === channel)?.title ?? "Este canal"} onChooseMercadoLibre={onChooseMercadoLibre} /> : <>
      {channel === "all" && <div className="channel-notice">Los perfiles de esta demo provienen solo de Mercado Libre; aún no hay datos de Amazon ni TikTok Shop.</div>}
      <section className="metrics-row customer-metrics" aria-label="Resumen de clientes"><Metric label="Clientes con compra" value={String(demoCustomers.length)} note="Durante los últimos 12 meses" icon="♙" tone="lime" /><Metric label="Clientes recurrentes" value={String(repeatCustomers.length)} note="Compraron más de una vez" icon="↻" tone="blue" /><Metric label="Tasa de recompra" value={`${Math.round(repeatCustomers.length / demoCustomers.length * 100)}%`} note="Clientes que volvieron" icon="↗" tone="orange" /><Metric label="Frecuencia promedio" value={`${averageInterval} días`} note="Entre compras repetidas" icon="◷" tone="lime" /></section>
      <section className="customer-layout"><div className="panel customer-table-panel"><div className="panel-header"><div><h2>Quiénes están volviendo</h2><p>Recompras y frecuencia promedio entre pedidos</p></div><span className="chart-legend"><i /> Datos de ejemplo</span></div><div className="customer-table-wrap"><table className="customer-table"><thead><tr><th>Cliente</th><th>Compras</th><th>Frecuencia</th><th>Última compra</th><th>Segmento</th></tr></thead><tbody>{sortedCustomers.map((customer) => { const benefit = customerBenefit(customer); const frequency = customerFrequency(customer.dates); return <tr key={customer.id}><td><b>{customer.name}</b><small>{customer.id} · {customer.favorite}</small></td><td><strong>{customer.dates.length}</strong></td><td>{frequency === null ? "Primera compra" : `Cada ${frequency} días`}</td><td>{formatShortDate(customer.dates.at(-1)!)}</td><td><span className={`customer-segment ${benefit.tone}`}>{benefit.segment}</span></td></tr>; })}</tbody></table></div><div className="table-note">La frecuencia se estima con los días entre compras registradas.</div></div>
        <aside className="panel benefit-panel"><div className="benefit-top"><span className="benefit-spark">✳</span><span className="small-tag">IDEAS PARA REVISAR</span></div><h2>Reconoce a tus clientes</h2><p>Beneficios sugeridos para que evalúes según tu margen y estrategia.</p><div className="benefit-card"><span className="benefit-kicker">CLIENTES FRECUENTES</span><b>Acceso anticipado o beneficio VIP</b><small>Para quienes tienen 4 o más compras.</small></div><div className="benefit-card"><span className="benefit-kicker">CLIENTES RECURRENTES</span><b>Envío gratis en próxima compra</b><small>Un incentivo sencillo para motivar que vuelvan.</small></div><div className="benefit-card"><span className="benefit-kicker">POR REACTIVAR</span><b>Cupón de regreso</b><small>Revisar clientes sin compra reciente.</small></div><div className="no-send-note">Las sugerencias no se envían ni aplican descuentos automáticamente.</div></aside></section>
      <p className="data-note"><span>ⓘ</span> Datos ficticios de demostración. La integración podrá calcular estos indicadores desde las órdenes históricas de cada canal.</p>
    </>}
  </>;
}

function ProfileModule({ profile, setProfile, message, onSave, showValidationInfo, setShowValidationInfo }: { profile: AdminProfile; setProfile: React.Dispatch<React.SetStateAction<AdminProfile>>; message: string; onSave: () => void; showValidationInfo: boolean; setShowValidationInfo: React.Dispatch<React.SetStateAction<boolean>> }) {
  return <>
    <section className="page-heading"><div><p className="eyebrow">CUENTA Y PREFERENCIAS</p><h1>Perfil de administradora</h1><p className="page-subtitle">Edita tus preferencias y revisa cómo vincularemos tu identidad con Mercado Libre.</p></div></section>
    <section className="profile-settings-layout"><form className="panel profile-form" onSubmit={(event) => { event.preventDefault(); onSave(); }}><div className="panel-header"><div><h2>Información del perfil</h2><p>Estos cambios de demostración se guardan en este navegador.</p></div></div><label className="form-field"><span>Nombre para mostrar</span><input value={profile.displayName} onChange={(event) => setProfile({ ...profile, displayName: event.target.value })} required /></label><label className="form-field"><span>Teléfono (opcional)</span><input type="tel" value={profile.phone} placeholder="Agregar teléfono" onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></label><label className="form-field"><span>Zona horaria</span><select value={profile.timeZone} onChange={(event) => setProfile({ ...profile, timeZone: event.target.value })}><option value="America/Mexico_City">Ciudad de México</option><option value="America/Santiago">Santiago de Chile</option><option value="America/Bogota">Bogotá</option></select></label><div className="form-divider" /><label className="check-field"><span><b>Avisos de despacho</b><small>Notificar pedidos que se acercan a su fecha límite.</small></span><input type="checkbox" checked={profile.notifyDispatch} onChange={(event) => setProfile({ ...profile, notifyDispatch: event.target.checked })} /></label><label className="check-field"><span><b>Resumen semanal</b><small>Recibir un resumen de ventas y preparación.</small></span><input type="checkbox" checked={profile.notifyWeekly} onChange={(event) => setProfile({ ...profile, notifyWeekly: event.target.checked })} /></label><div className="profile-form-footer">{message && <span className="save-message">✓ {message}</span>}<button className="primary-button" type="submit">Guardar cambios</button></div></form>
      <aside className="panel verification-panel"><div className="panel-header"><div><h2>Validación de identidad</h2><p>Cuenta principal del negocio</p></div><span className="verification-status"><i /> Pendiente</span></div><div className="identity-logo"><span className="store-avatar">ML</span><span><b>Mercado Libre México</b><small>Proveedor de identidad previsto</small></span></div><div className="identity-row"><span>Correo de Mercado Libre</span><b className="identity-pending">Se obtendrá al conectar la cuenta</b></div><div className="identity-row"><span>Rol en camiml</span><b>Administradora</b></div><button type="button" className="outline-button verification-button" onClick={() => setShowValidationInfo(!showValidationInfo)}>{showValidationInfo ? "Ocultar flujo" : "Ver cómo se validará"}</button>{showValidationInfo && <div className="oauth-info"><b>Flujo previsto</b><ol><li>Camiml te redirige a Mercado Libre para iniciar sesión y autorizar la aplicación.</li><li><code>GET /users/me</code> identifica la cuenta autorizante; con el token se consultan los datos privados, incluido el correo asociado.</li><li>Camiml conserva el ID de Mercado Libre como identificador de la cuenta; el correo se muestra como dato verificado de solo lectura.</li></ol><p>No necesitas entregar tu contraseña de Mercado Libre a camiml ni conectar Google para comprobar esa cuenta.</p></div>}<div className="identity-caution"><span>ⓘ</span>La conexión OAuth real aún no está activa en esta demo.</div></aside></section>
  </>;
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
