import { Box, Typography, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import VehicleList from "../../components/vehicles/VehicleList";
import AppLayout from "../../components/Layout/AppLayout";

export default function PublicVehiclesPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <Box
        sx={{
          px: 0,
          py: 0,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Vehículos disponibles
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Podés ver todos los autos sin iniciar sesión. Si querés comprar,
              te vamos a pedir que inicies sesión.
            </Typography>
          </Box>
        </Stack>

        <VehicleList />
      </Box>
    </AppLayout>
  );
}
