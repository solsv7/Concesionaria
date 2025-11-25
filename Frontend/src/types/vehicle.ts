export interface Vehicle {
  id_vehiculo: number;
  marca: string;
  modelo: string;
  anio?: number;

  precio: number;

  combustible: string;
  estado: string;
  origen: string;
  es_usado: 0 | 1;

  km?: number;
  color?: string;
  tipo_vehiculo?: string;
  transmision?: string;
  traccion?: string;
  puertas?: number;
  direccion?: string;

  imagen?: string | null;
}
