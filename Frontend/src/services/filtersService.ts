import { api } from "./api";

export interface Combustible {
  id_combustible: number;
  nombre: string;
}

export interface Marca {
  id_marca: number;
  marca: string;
}

export interface AnioDisponible {
  anio: number;
}

export interface Color {
  id_color: number;
  nombre: string;
}

export interface TipoVehiculo {
  id_tipo_vehiculo: number;
  nombre: string;
}

export interface Transmision {
  id_transmision: number;
  nombre: string;
}

export interface Traccion {
  id_traccion: number;
  nombre: string;
}

export interface Direccion {
  id_direccion: number;
  nombre: string;
}
export interface UsuarioOption {
  id_usuario: number;
  nombre: string;
  telefono: string | null;
  email: string | null;
  id_rol: number | null;
  rol: string | null;
}

export const filtersService = {
  async getCombustibles(): Promise<Combustible[]> {
    const res = await api.get<Combustible[]>("/api/filters/combustibles");
    return res.data;
  },

  async getMarcas(): Promise<Marca[]> {
    const res = await api.get<Marca[]>("/api/filters/marcas");
    return res.data;
  },

  async getAnios(): Promise<AnioDisponible[]> {
    const res = await api.get<AnioDisponible[]>("/api/filters/anios");
    return res.data;
  },

  async getColores(): Promise<Color[]> {
    const res = await api.get<Color[]>("/api/filters/colores");
    return res.data;
  },

  async getTiposVehiculo(): Promise<TipoVehiculo[]> {
    const res = await api.get<TipoVehiculo[]>("/api/filters/tipos-vehiculo");
    return res.data;
  },

  async getTransmisiones(): Promise<Transmision[]> {
    const res = await api.get<Transmision[]>("/api/filters/transmisiones");
    return res.data;
  },

  async getTracciones(): Promise<Traccion[]> {
    const res = await api.get<Traccion[]>("/api/filters/tracciones");
    return res.data;
  },

  async getDirecciones(): Promise<Direccion[]> {
    const res = await api.get<Direccion[]>("/api/filters/direcciones");
    return res.data;
  },
   async getUsuarios(): Promise<UsuarioOption[]> {
    const { data } = await api.get<UsuarioOption[]>("/api/filters/usuarios");
    return data || [];
  },
};
