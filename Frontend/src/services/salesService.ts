// src/services/salesService.ts
import { api } from "./api";

export interface SalesDateRange {
  desde: string;
  hasta: string;
}

export type EstadoVenta = "PENDIENTE" | "APROBADA" | "RECHAZADA";

export interface Sale {
  id_venta_auto: number;
  fecha: string; // date
  total_pagado: number;
  estado_venta: EstadoVenta;
  id_plan: number | null;
  cuotas: number | null;
  interes: number | null;

  id_cliente: number;
  nombre_cliente: string;
  telefono: string | null;
  email: string | null;

  id_vehiculo: number;
  marca: string;
  modelo: string;
  anio: number | null;
  precio_publicado: number;
}

export interface SalesSummary {
  cantidad_ventas: number;
  monto_total: number;
  monto_promedio: number;
  monto_aprobadas: number;
  monto_pendientes: number;
  monto_rechazadas: number;
}

export type TipoMovimiento = "ENTRADA" | "CUOTA" | "OTRO";

export interface Movimiento {
  id_movimiento: number;
  fecha: string; // datetime
  tipo_movimiento: TipoMovimiento;
  total: number;

  id_metodo: number;
  metodo: string;

  id_venta_auto: number;
  fecha_venta: string;
  estado_venta: EstadoVenta;

  id_cliente: number;
  nombre_cliente: string;
  telefono: string | null;
  email: string | null;

  id_vehiculo_vendido: number;
  marca_vehiculo_vendido: string;
  modelo_vehiculo_vendido: string;
  anio_vehiculo_vendido: number | null;

  id_vehiculo_entregado: number | null;
  id_vehiculo_usado: number | null;
  marca_vehiculo_usado: string | null;
  modelo_vehiculo_usado: string | null;
  anio_vehiculo_usado: number | null;
}

export interface CuotaVenta {
  id_cuota: number;
  id_venta_auto: number;
  nro_cuota: number;
  monto: number;
  fecha_vencimiento: string; // date
  pagada: 0 | 1;
}

export interface PayCuotaPayload {
  id_metodo: number;
  monto?: number; // opcional, si no mandás, paga el total de la cuota
}

export interface CreatePagoPayload {
  id_metodo: number;
  monto: number;
  es_vehiculo_entregado?: boolean;

  // Datos del vehículo usado (si aplica)
  id_marca?: number;
  modelo?: string;
  anio?: number;
  id_color?: number;
  id_tipo_vehiculo?: number;
  id_transmision?: number;
  id_traccion?: number;
  km?: number;
  puertas?: number;
  id_direccion?: number;
  id_combustible?: number;
}

export interface CreateVentaPayload {
  id_vehiculo: number;
  id_usuario: number;
  id_plan?: number | null;
  fecha?: string; // YYYY-MM-DD
  pagos: CreatePagoPayload[];
}

export interface CreateVentaResponse {
  message: string;
  venta?: {
    id_venta_auto: number;
  };
}

// Helper para query string de rango
const buildRangeQuery = (range: SalesDateRange) => ({
  params: {
    desde: range.desde,
    hasta: range.hasta,
  },
});

// 🔥 ESTE ES EL OBJETO QUE IMPORTAN TODOS TUS COMPONENTES
export const salesService = {
  // =========================
  // Ventas (concesionaria)
  // =========================
  async getVentas(
    range: SalesDateRange,
    scope: "all" | "mine" = "all"
  ): Promise<Sale[]> {
    const url =
      scope === "mine" ? "/api/sales/ventas/mias" : "/api/sales/ventas";

    const { data } = await api.get<Sale[]>(url, buildRangeQuery(range));
    return data;
  },

  async getVentasResumen(
    range: SalesDateRange
  ): Promise<SalesSummary> {
    const { data } = await api.get<SalesSummary>(
      "/api/sales/ventas/resumen",
      buildRangeQuery(range)
    );
    return data;
  },

  async getMovimientos(
    range: SalesDateRange,
    scope: "all" | "mine" = "all"
  ): Promise<Movimiento[]> {
    const url =
      scope === "mine"
        ? "/api/sales/movimientos/mios"
        : "/api/sales/movimientos";

    const { data } = await api.get<Movimiento[]>(url, buildRangeQuery(range));
    return data;
  },

  // =========================
  // Aliases específicos para "mis compras"
  // (por si los usás desde useMySales)
  // =========================
  async getMySales(range: SalesDateRange): Promise<Sale[]> {
    const { data } = await api.get<Sale[]>(
      "/api/sales/ventas/mias",
      buildRangeQuery(range)
    );
    return data;
  },

  async getMyMovements(range: SalesDateRange): Promise<Movimiento[]> {
    const { data } = await api.get<Movimiento[]>(
      "/api/sales/movimientos/mios",
      buildRangeQuery(range)
    );
    return data;
  },

  // =========================
  // Cuotas
  // =========================
  async getCuotasByVenta(idVenta: number): Promise<CuotaVenta[]> {
    const { data } = await api.get<CuotaVenta[]>(
      `/api/sales/ventas/${idVenta}/cuotas`
    );
    return data;
  },

  async payCuota(
    idVenta: number,
    idCuota: number,
    payload: PayCuotaPayload
  ): Promise<void> {
    await api.post(
      `/api/sales/ventas/${idVenta}/cuotas/${idCuota}/pago`,
      payload
    );
  },

  // =========================
  // Crear venta
  // =========================
  async createVenta(
    payload: CreateVentaPayload
  ): Promise<CreateVentaResponse> {
    const { data } = await api.post<CreateVentaResponse>(
      "/api/sales/ventas",
      payload
    );
    return data;
  },
};
