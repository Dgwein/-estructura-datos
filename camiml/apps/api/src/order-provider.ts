export type OrderStatus = "to_prepare" | "preparing" | "ready";
export type StockSync = "not_sent" | "simulated";

export interface DispatchOrder {
  id: string;
  buyer: string;
  product: string;
  size: string;
  dispatchDate: string;
  status: OrderStatus;
  stockSync: StockSync;
}

const demoOrders: DispatchOrder[] = [
  { id: "MLC-8042", buyer: "Valentina R.", product: "Traje de ceremonia · Marfil", size: "3-6 Meses", dispatchDate: "2026-11-08", status: "ready", stockSync: "simulated" },
  { id: "MLC-8043", buyer: "Nicolás P.", product: "Traje clásico · Azul marino", size: "2A", dispatchDate: "2026-11-08", status: "preparing", stockSync: "not_sent" },
  { id: "MLC-8044", buyer: "Camila M.", product: "Traje de bautizo · Blanco", size: "0-3 Meses", dispatchDate: "2026-11-04", status: "to_prepare", stockSync: "not_sent" },
  { id: "MLC-8045", buyer: "Andrés G.", product: "Traje slim · Grafito", size: "4A", dispatchDate: "2026-11-05", status: "to_prepare", stockSync: "not_sent" },
  { id: "MLC-8046", buyer: "Josefina T.", product: "Traje de ceremonia · Rosa", size: "6-9 Meses", dispatchDate: "2026-11-06", status: "preparing", stockSync: "not_sent" },
  { id: "MLC-8047", buyer: "Diego C.", product: "Traje clásico · Negro", size: "3A", dispatchDate: "2026-11-09", status: "to_prepare", stockSync: "not_sent" },
  { id: "MLC-8048", buyer: "Fernanda S.", product: "Traje de bautizo · Marfil", size: "9-12 Meses", dispatchDate: "2026-11-11", status: "to_prepare", stockSync: "not_sent" },
  { id: "MLC-8049", buyer: "Tomás V.", product: "Traje slim · Azul marino", size: "5A", dispatchDate: "2026-11-12", status: "to_prepare", stockSync: "not_sent" },
  { id: "MLC-8050", buyer: "María J.", product: "Traje clásico · Grafito", size: "12-18 Meses", dispatchDate: "2026-11-13", status: "to_prepare", stockSync: "not_sent" },
  { id: "MLC-8051", buyer: "Pablo L.", product: "Traje de ceremonia · Azul", size: "5A", dispatchDate: "2026-11-16", status: "to_prepare", stockSync: "not_sent" },
  { id: "MLC-8052", buyer: "Antonia F.", product: "Traje clásico · Verde", size: "2A", dispatchDate: "2026-11-18", status: "to_prepare", stockSync: "not_sent" },
  { id: "MLC-8053", buyer: "Sebastián B.", product: "Traje slim · Negro", size: "3-6 Meses", dispatchDate: "2026-11-20", status: "preparing", stockSync: "not_sent" },
  { id: "MLC-8054", buyer: "Isidora N.", product: "Traje de bautizo · Blanco", size: "4A", dispatchDate: "2026-11-23", status: "to_prepare", stockSync: "not_sent" },
  { id: "MLC-8055", buyer: "Matías D.", product: "Traje clásico · Azul marino", size: "6-9 Meses", dispatchDate: "2026-11-25", status: "to_prepare", stockSync: "not_sent" },
  { id: "MLC-8056", buyer: "Emilia O.", product: "Traje slim · Grafito", size: "5A", dispatchDate: "2026-11-27", status: "to_prepare", stockSync: "not_sent" },
];

/** Reemplazable por una implementación que lea y actualice órdenes vía Mercado Libre. */
class MockMercadoLibreProvider {
  private orders = demoOrders.map((order) => ({ ...order }));

  async listOrders() {
    return this.orders.map((order) => ({ ...order }));
  }

  async updateOrderStatus(id: string, nextStatus: OrderStatus) {
    const order = this.orders.find((item) => item.id === id);
    if (!order) return null;

    const validTransition = (order.status === "to_prepare" && nextStatus === "preparing")
      || (order.status === "preparing" && nextStatus === "ready");
    if (!validTransition) return "invalid-transition" as const;

    order.status = nextStatus;
    if (nextStatus === "ready") order.stockSync = "simulated";
    return { ...order };
  }
}

export const orderProvider = new MockMercadoLibreProvider();
