import { useEffect, useState } from "react";
import {
  filtersService,
  type UsuarioOption,
} from "../services/filtersService";

interface UseUsersResult {
  users: UsuarioOption[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export const useUsers = (): UseUsersResult => {
  const [users, setUsers] = useState<UsuarioOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await filtersService.getUsuarios();
      setUsers(data);
    } catch (err: any) {
      console.error("Error obteniendo usuarios:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error cargando usuarios";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return {
    users,
    loading,
    error,
    reload: load,
  };
};
