import { useCallback, useEffect, useState } from "react";
import {
  salesService,
  type Sale,
  type SalesSummary,
  type Movimiento,
  type SalesDateRange,
} from "../services/salesService";

export function getCurrentMonthRange(): SalesDateRange {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); 

  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const toISODate = (d: Date) => d.toISOString().slice(0, 10);

  return {
    desde: toISODate(first),
    hasta: toISODate(last),
  };
}

export interface UseSalesOptions {
  initialRange?: SalesDateRange;
  autoLoad?: boolean; 
}

export interface UseSalesResult {
  ventas: Sale[];
  resumen: SalesSummary | null;
  movimientos: Movimiento[];

  loadingVentas: boolean;
  loadingMovimientos: boolean;
  loadingResumen: boolean;

  errorVentas: string | null;
  errorMovimientos: string | null;
  errorResumen: string | null;

  range: SalesDateRange;
  setRange: (range: SalesDateRange) => void;

  reloadVentas: () => void;
  reloadMovimientos: () => void;
  reloadResumen: () => void;
  reloadAll: () => void;

  reload: () => void;
}

export const useSales = (
  options: UseSalesOptions = {}
): UseSalesResult => {
  const [range, setRange] = useState<SalesDateRange>(
    options.initialRange ?? getCurrentMonthRange()
  );

  const [ventas, setVentas] = useState<Sale[]>([]);
  const [resumen, setResumen] = useState<SalesSummary | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);

  const [loadingVentas, setLoadingVentas] = useState(false);
  const [loadingResumen, setLoadingResumen] = useState(false);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);

  const [errorVentas, setErrorVentas] = useState<string | null>(null);
  const [errorResumen, setErrorResumen] = useState<string | null>(null);
  const [errorMovimientos, setErrorMovimientos] =
    useState<string | null>(null);

  const loadVentas = useCallback(async () => {
    try {
      setLoadingVentas(true);
      setErrorVentas(null);
      const data = await salesService.getVentas(range);
      setVentas(data);
    } catch (err: any) {
      console.error("Error cargando ventas:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error cargando ventas";
      setErrorVentas(message);
    } finally {
      setLoadingVentas(false);
    }
  }, [range]);

  const loadResumen = useCallback(async () => {
    try {
      setLoadingResumen(true);
      setErrorResumen(null);
      const data = await salesService.getVentasResumen(range);
      setResumen(data);
    } catch (err: any) {
      console.error("Error cargando resumen de ventas:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error cargando resumen de ventas";
      setErrorResumen(message);
    } finally {
      setLoadingResumen(false);
    }
  }, [range]);

  const loadMovimientos = useCallback(async () => {
    try {
      setLoadingMovimientos(true);
      setErrorMovimientos(null);
      const data = await salesService.getMovimientos(range);
      setMovimientos(data);
    } catch (err: any) {
      console.error("Error cargando movimientos:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error cargando movimientos";
      setErrorMovimientos(message);
    } finally {
      setLoadingMovimientos(false);
    }
  }, [range]);

  const reloadAll = useCallback(() => {
    loadVentas();
    loadResumen();
    loadMovimientos();
  }, [loadVentas, loadResumen, loadMovimientos]);

  useEffect(() => {
    if (options.autoLoad === false) return;
    reloadAll();
  }, [range, options.autoLoad, reloadAll]);

  return {
    ventas,
    resumen,
    movimientos,
    loadingVentas,
    loadingMovimientos,
    loadingResumen,
    errorVentas,
    errorMovimientos,
    errorResumen,
    range,
    setRange,
    reloadVentas: loadVentas,
    reloadMovimientos: loadMovimientos,
    reloadResumen: loadResumen,
    reloadAll,
    reload: reloadAll, 
  };
};
