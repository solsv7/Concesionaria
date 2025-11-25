import { api } from "./api";
import type { Vehicle } from "../types/vehicle";

export type VehicleEstado =
  | "EN_EVALUACION"
  | "EN_STOCK"
  | "VENDIDO"
  | "RECHAZADO"
  | "INACTIVO";

export type VehicleOrigen = "AGENCIA" | "USADO_CLIENTE";

export interface VehicleSearchParams {
  marca?: number;
  precioMin?: number;
  precioMax?: number;
  combustible?: number;
  esUsado?: 0 | 1;
  anioMin?: number;
  anioMax?: number;
  origen?: VehicleOrigen;

  color?: number;
  tipoVehiculo?: number;
  transmision?: number;
  traccion?: number;
  kmMin?: number;
  kmMax?: number;
  puertas?: number;
  direccion?: number;

  page?: number;
  pageSize?: number;
}

export interface VehicleSearchResponse {
  total: number;
  page: number;
  pageSize: number;
  results: Vehicle[];
}

export interface CreateVehiclePayload {
  id_marca: number;
  modelo: string;
  precio: number;
  id_combustible: number;
  origen: VehicleOrigen;
  es_usado: 0 | 1;

  anio?: number;
  km?: number;
  puertas?: number;
  id_color?: number;
  id_tipo_vehiculo?: number;
  id_transmision?: number;
  id_traccion?: number;
  id_direccion?: number;
}

export interface AddImagePayload {
  url_imagen: string;
  img_perfil?: boolean;
}

export interface UpdateVehiclePayload extends Partial<CreateVehiclePayload> {}

export interface VehicleImage {
  id_imagen: number;
  url_imagen: string;
  orden: number;
  img_perfil: 0 | 1;
}

export interface VehicleDetail extends Vehicle {
  id_marca: number;
  id_combustible: number;
  id_color?: number | null;
  id_tipo_vehiculo?: number | null;
  id_transmision?: number | null;
  id_traccion?: number | null;
  id_direccion?: number | null;

  anio?: number | null;
  km?: number | null;
  puertas?: number | null;
  color?: string | null;
  tipo_vehiculo?: string | null;
  transmision?: string | null;
  traccion?: string | null;
  direccion?: string | null;
  imagen_perfil?: string | null;
  imagenes?: VehicleImage[];
}

const buildSearchQuery = (params: VehicleSearchParams = {}) => {
  const query: Record<string, string | number> = {};

  if (params.marca !== undefined) query.marca = params.marca;
  if (params.precioMin !== undefined) query.precio_min = params.precioMin;
  if (params.precioMax !== undefined) query.precio_max = params.precioMax;
  if (params.combustible !== undefined) query.combustible = params.combustible;
  if (params.esUsado !== undefined) query.es_usado = params.esUsado;
  if (params.anioMin !== undefined) query.anio_min = params.anioMin;
  if (params.anioMax !== undefined) query.anio_max = params.anioMax;
  if (params.origen !== undefined) query.origen = params.origen;

  if (params.color !== undefined) query.color = params.color;
  if (params.tipoVehiculo !== undefined)
    query.tipo_vehiculo = params.tipoVehiculo;
  if (params.transmision !== undefined) query.transmision = params.transmision;
  if (params.traccion !== undefined) query.traccion = params.traccion;
  if (params.direccion !== undefined) query.direccion = params.direccion;

  if (params.kmMin !== undefined) query.km_min = params.kmMin;
  if (params.kmMax !== undefined) query.km_max = params.kmMax;

  if (params.puertas !== undefined) {
    query.puertas_min = params.puertas;
    query.puertas_max = params.puertas;
  }

  if (params.page !== undefined) query.page = params.page;
  if (params.pageSize !== undefined) query.pageSize = params.pageSize;

  return query;
};

export const vehicleService = {
  async search(
    params: VehicleSearchParams = {}
  ): Promise<VehicleSearchResponse> {
    const response = await api.get<VehicleSearchResponse>("/api/vehicles", {
      params: buildSearchQuery(params),
    });
    return response.data;
  },

  async fetchVehicles(params: VehicleSearchParams = {}) {
    return this.search(params);
  },

  async getById(id: number | string): Promise<VehicleDetail> {
    const response = await api.get<VehicleDetail>(`/api/vehicles/${id}`);
    return response.data;
  },

  async create(payload: CreateVehiclePayload) {
    const response = await api.post("/api/vehicles", payload);
    return response.data;
  },

  async updateEstado(id: number | string, estado: VehicleEstado) {
    const response = await api.patch(`/api/vehicles/${id}/estado`, { estado });
    return response.data;
  },

  async inactivate(id: number | string) {
    return this.updateEstado(id, "INACTIVO");
  },

  async delete(id: number | string) {
    const response = await api.delete(`/api/vehicles/${id}`);
    return response.data;
  },

  async addImage(idVehiculo: number | string, payload: AddImagePayload) {
    const response = await api.post(`/api/vehicles/${idVehiculo}/images`, {
      url_imagen: payload.url_imagen,
      img_perfil: payload.img_perfil ? 1 : 0,
    });
    return response.data;
  },

  async setProfileImage(idVehiculo: number | string, idImagen: number) {
    const response = await api.put(
      `/api/vehicles/${idVehiculo}/imagen-perfil`,
      {
        id_imagen: idImagen,
      }
    );
    return response.data;
  },

  async updateVehicle(
    id: number | string,
    payload: UpdateVehiclePayload
  ) {
    const response = await api.put(`/api/vehicles/${id}`, payload);
    return response.data;
  },

  async deleteVehicle(id: number | string) {
    const response = await api.delete(`/api/vehicles/${id}`);
    return response.data;
  },

  async reorderImage(
    idVehiculo: number | string,
    idImagen: number,
    nuevoOrden: number
  ) {
    const response = await api.put(
      `/api/vehicles/${idVehiculo}/imagenes/orden`,
      {
        id_imagen: idImagen,
        nuevo_orden: nuevoOrden,
      }
    );
    return response.data;
  },
};

export const fetchVehicles = vehicleService.fetchVehicles.bind(vehicleService);
