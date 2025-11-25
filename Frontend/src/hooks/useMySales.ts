import { useCallback, useEffect, useState } from "react";
import {
  salesService,
  type Sale,
  type Movimiento,
  type SalesDateRange,
} from "../services/salesService";
import { getCurrentMonthRange } from "./useSales";
import { useAuth } from "./useAuth";

export interface UseMySalesOptions {
  initialRange?: SalesDateRange;
  autoLoad?: boolean;
}

export interface UseMySalesResult {
  ventas: Sale[];
  movimientos: Movimiento[];

  loadingVentas: boolean;
  loadingMovimientos: boolean;

  errorVentas: string | null;
  errorMovimientos: string | null;

  range: SalesDateRange;
  setRange: (range: SalesDateRange) => void;
  setRangeField: (field: "desde" | "hasta", value: string) => void;

  reloadVentas: () => Promise<void>;
  reloadMovimientos: () => Promise<void>;
  reloadAll: () => Promise<void>;
}

export function useMySales(
  options: UseMySalesOptions = {}
): UseMySalesResult {
  const { user } = useAuth();
  // 👇 id del usuario logueado (viene del token / localStorage)
  const userId = user?.id_usuario ? Number(user.id_usuario) : null;

  const [range, setRange] = useState<SalesDateRange>(
    options.initialRange ?? getCurrentMonthRange()
  );

  const [ventas, setVentas] = useState<Sale[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);

  const [loadingVentas, setLoadingVentas] = useState(false);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);

  const [errorVentas, setErrorVentas] = useState<string | null>(null);
  const [errorMovimientos, setErrorMovimientos] = useState<string | null>(null);

  const setRangeField = (field: "desde" | "hasta", value: string) => {
    setRange((prev) => ({ ...prev, [field]: value }));
  };

  const loadVentas = useCallback(async () => {
    // Si todavía no sabemos quién es el usuario, no hacemos nada
    if (!userId) return;

    try {
      setLoadingVentas(true);
      setErrorVentas(null);

      // Traemos todas las ventas del periodo (como el dashboard)
      const allSales = await salesService.getVentas(range);

      // 👇 Filtramos SOLO las del usuario logueado
      const mySales = allSales.filter(
        (venta) => Number(venta.id_cliente) === userId
      );

      setVentas(mySales);
    } catch (err: any) {
      console.error("Error cargando mis ventas:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error cargando tus compras";
      setErrorVentas(message);
    } finally {
      setLoadingVentas(false);
    }
  }, [range, userId]);

  const loadMovimientos = useCallback(async () => {
    if (!userId) return;

    try {
      setLoadingMovimientos(true);
      setErrorMovimientos(null);

      // Traemos todos los movimientos del periodo
      const allMovs = await salesService.getMovimientos(range);

      // 👇 Filtramos solo los del usuario logueado
      const myMovs = allMovs.filter(
        (mov) => Number(mov.id_cliente) === userId
      );

      setMovimientos(myMovs);
    } catch (err: any) {
      console.error("Error cargando mis movimientos:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error cargando tus movimientos";
      setErrorMovimientos(message);
    } finally {
      setLoadingMovimientos(false);
    }
  }, [range, userId]);

  const reloadAll = useCallback(async () => {
    await Promise.all([loadVentas(), loadMovimientos()]);
  }, [loadVentas, loadMovimientos]);

  useEffect(() => {
    // Cuando cambia el rango o el usuario, recargamos
    if (options.autoLoad ?? true) {
      void reloadAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.desde, range.hasta, userId]);

  return {
    ventas,
    movimientos,
    loadingVentas,
    loadingMovimientos,
    errorVentas,
    errorMovimientos,
    range,
    setRange,
    setRangeField,
    reloadVentas: loadVentas,
    reloadMovimientos: loadMovimientos,
    reloadAll,
  };
}
