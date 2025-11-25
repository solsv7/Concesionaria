import { useEffect, useState, useRef } from "react";
import { Vehicle } from "../types/vehicle";
import {
  vehicleService,
  type VehicleSearchParams,
  type VehicleSearchResponse,
  type VehicleEstado,
  type CreateVehiclePayload,
  type AddImagePayload,
  type UpdateVehiclePayload,
} from "../services/vehicleService";

interface UseVehiclesOptions {
  initialFilters?: Omit<VehicleSearchParams, "page" | "pageSize">;
  initialPage?: number;
  initialPageSize?: number;
}

interface UseVehiclesResult {
  vehicles: Vehicle[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  filters: Omit<VehicleSearchParams, "page" | "pageSize">;
  setFilters: (filters: Omit<VehicleSearchParams, "page" | "pageSize">) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  refresh: () => void;

  createVehicle: (payload: CreateVehiclePayload) => Promise<any>;
  updateEstado: (id: number | string, estado: VehicleEstado) => Promise<any>;
  inactivateVehicle: (id: number | string) => Promise<any>;
  deleteVehicle: (id: number | string) => Promise<any>;
  updateVehicle: (
    idVehiculo: number | string,
    payload: UpdateVehiclePayload
  ) => Promise<any>;

  addImage: (
    idVehiculo: number | string,
    payload: AddImagePayload
  ) => Promise<any>;
  setProfileImage: (
    idVehiculo: number | string,
    idImagen: number
  ) => Promise<any>;
  reorderImage: (
    idVehiculo: number | string,
    idImagen: number,
    nuevoOrden: number
  ) => Promise<any>;
}

export function useVehicles(
  options: UseVehiclesOptions = {}
): UseVehiclesResult {
  const [filters, setFiltersState] = useState<
    Omit<VehicleSearchParams, "page" | "pageSize">
  >(options.initialFilters ?? {});

  const [page, setPageState] = useState<number>(options.initialPage ?? 1);
  const [pageSize, setPageSizeState] = useState<number>(
    options.initialPageSize ?? 12
  );

  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters]);

  // Carga de vehículos
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const params: VehicleSearchParams = {
          ...debouncedFilters,
          page,
          pageSize,
        };

        const data: VehicleSearchResponse = await vehicleService.search(params);

        if (!cancelled) {
          setVehicles(data.results);
          setTotal(data.total);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Error al cargar vehículos");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [debouncedFilters, page, pageSize, refreshKey]);

  const setFilters = (
    nextFilters: Omit<VehicleSearchParams, "page" | "pageSize">
  ) => {
    setFiltersState(nextFilters);
    setPageState(1);
  };

  const setPage = (nextPage: number) => {
    setPageState(nextPage);
  };

  const setPageSize = (nextPageSize: number) => {
    setPageSizeState(nextPageSize);
    setPageState(1);
  };

  const refresh = () => setRefreshKey((prev) => prev + 1);


  const createVehicle = async (payload: CreateVehiclePayload) => {
    const res = await vehicleService.create(payload);
    refresh();
    return res;
  };

  const updateEstado = async (id: number | string, estado: VehicleEstado) => {
    const res = await vehicleService.updateEstado(id, estado);
    refresh();
    return res;
  };

  const inactivateVehicle = async (id: number | string) => {
    const res = await vehicleService.inactivate(id);
    refresh();
    return res;
  };

  const deleteVehicle = async (id: number | string) => {
    const res = await vehicleService.delete(id);
    refresh();
    return res;
  };

  const updateVehicle = async (
    idVehiculo: number | string,
    payload: UpdateVehiclePayload
  ) => {
    const res = await vehicleService.updateVehicle(idVehiculo, payload);
    refresh();
    return res;
  };

  const addImage = async (
    idVehiculo: number | string,
    payload: AddImagePayload
  ) => {
    const res = await vehicleService.addImage(idVehiculo, payload);
    refresh();
    return res;
  };

  const setProfileImage = async (
    idVehiculo: number | string,
    idImagen: number
  ) => {
    const res = await vehicleService.setProfileImage(idVehiculo, idImagen);
    refresh();
    return res;
  };

  const reorderImage = async (
    idVehiculo: number | string,
    idImagen: number,
    nuevoOrden: number
  ) => {
    const res = await vehicleService.reorderImage(
      idVehiculo,
      idImagen,
      nuevoOrden
    );
    refresh();
    return res;
  };

  return {
    vehicles,
    total,
    page,
    pageSize,
    loading,
    error,
    filters,
    setFilters,
    setPage,
    setPageSize,
    refresh,
    createVehicle,
    updateEstado,
    inactivateVehicle,
    deleteVehicle,
    updateVehicle,
    addImage,
    setProfileImage,
    reorderImage,
  };
}
