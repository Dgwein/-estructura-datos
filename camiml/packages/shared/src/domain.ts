export type SaleStatus = "paid" | "preparing" | "ready_to_ship" | "shipped" | "cancelled";

export interface SaleItem {
  externalItemId: string;
  title: string;
  suitType?: string;
  size?: string;
  quantity: number;
}

export interface Sale {
  id: string;
  source: "mercadolibre";
  externalOrderId: string;
  purchasedAt: string;
  dispatchDueAt?: string;
  status: SaleStatus;
  items: SaleItem[];
}

export interface PreparationProjection {
  periodStart: string;
  periodEnd: string;
  suitType: string;
  size: string;
  expectedUnits: number;
  confidence?: number;
}
