import { api} from "./api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id_usuario: number;
  nombre: string;
  email: string;
  id_rol: number;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("api/auth/login", payload);
    return data;
  },
};
