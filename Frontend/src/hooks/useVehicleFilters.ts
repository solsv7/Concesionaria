import { useEffect, useState } from "react";
import {
  filtersService,
  type Combustible,
  type Marca,
  type AnioDisponible,
  type Color,
  type TipoVehiculo,
  type Transmision,
  type Traccion,
  type Direccion,
} from "../services/filtersService";

interface UseVehicleFiltersResult {
  combustibles: Combustible[];
  marcas: Marca[];
  anios: number[];
  colores: Color[];
  tiposVehiculo: TipoVehiculo[];
  transmisiones: Transmision[];
  tracciones: Traccion[];
  direcciones: Direccion[];
  loading: boolean;
  error: string | null;
}

export function useVehicleFilters(): UseVehicleFiltersResult {
  const [combustibles, setCombustibles] = useState<Combustible[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [anios, setAnios] = useState<number[]>([]);
  const [colores, setColores] = useState<Color[]>([]);
  const [tiposVehiculo, setTiposVehiculo] = useState<TipoVehiculo[]>([]);
  const [transmisiones, setTransmisiones] = useState<Transmision[]>([]);
  const [tracciones, setTracciones] = useState<Traccion[]>([]);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          combustiblesRes,
          marcasRes,
          aniosRes,
          coloresRes,
          tiposVehiculoRes,
          transmisionesRes,
          traccionesRes,
          direccionesRes,
        ] = await Promise.all([
          filtersService.getCombustibles(),
          filtersService.getMarcas(),
          filtersService.getAnios(),
          filtersService.getColores(),
          filtersService.getTiposVehiculo(),
          filtersService.getTransmisiones(),
          filtersService.getTracciones(),
          filtersService.getDirecciones(),
        ]);

        setCombustibles(combustiblesRes);
        setMarcas(marcasRes);
        setAnios(aniosRes.map((a) => a.anio));
        setColores(coloresRes);
        setTiposVehiculo(tiposVehiculoRes);
        setTransmisiones(transmisionesRes);
        setTracciones(traccionesRes);
        setDirecciones(direccionesRes);
      } catch (e) {
        console.error("Error cargando filtros de vehículos", e);
        setError("No se pudieron cargar los filtros");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return {
    combustibles,
    marcas,
    anios,
    colores,
    tiposVehiculo,
    transmisiones,
    tracciones,
    direcciones,
    loading,
    error,
  };
}
