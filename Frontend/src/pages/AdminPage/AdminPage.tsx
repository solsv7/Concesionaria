import { Typography, Box } from "@mui/material";
import AppLayout from "../../components/Layout/AppLayout";
import VehicleList from "../../components/vehicles/VehicleList";
import { useAuth } from "../../hooks/useAuth";
import { userCanManageVehicles } from "../../utils/roles"; 

export default function AdminPage() {
  const { user, loading } = useAuth();

  const canManage = userCanManageVehicles(user);

  if (loading) {
    return (
      <AppLayout>
        <Box mt={4}>
          <Typography>Cargando sesión…</Typography>
        </Box>
      </AppLayout>
    );
  }

  if (!canManage) {
    return (
      <AppLayout>
        <Box mt={4}>
          <Typography>
            No tenés permisos para gestionar los vehículos.
          </Typography>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <VehicleList canManage />
    </AppLayout>
  );
}
