import { useEffect, useState } from "react";
import { api } from "../services/api";

export interface MetodoPago {
  id_metodo: number;
  metodo: string;
}

export interface PlanPago {
  id_plan: number;
  cuotas: number;
  interes: number;
  min_entrega: number;
}

interface UsePaymentFiltersResult {
  metodosPago: MetodoPago[];
  planesPago: PlanPago[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export const usePaymentFilters = (): UsePaymentFiltersResult => {
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [planesPago, setPlanesPago] = useState<PlanPago[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const [metodosRes, planesRes] = await Promise.all([
        api.get<MetodoPago[]>("/api/filters/metodos-pago"),
        api.get<PlanPago[]>("/api/filters/planes-pago"),
      ]);

      setMetodosPago(metodosRes.data || []);
      setPlanesPago(planesRes.data || []);
    } catch (err: any) {
      console.error("Error cargando filtros de pago:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error cargando métodos y planes de pago";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return {
    metodosPago,
    planesPago,
    loading,
    error,
    reload: load,
  };
};
