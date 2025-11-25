import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Typography,
  Button,         
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { vehicleService, type VehicleDetail } from "../../services/vehicleService";

interface Props {
  open: boolean;
  vehicleId: number | null;
  onClose: () => void;
  onBuy?: (vehicleId: number) => void;   
}

const VehicleDetailDialog: React.FC<Props> = ({
  open,
  vehicleId,
  onClose,
  onBuy,
}) => {
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!open || vehicleId == null) return;

    const fetchVehicle = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await vehicleService.getById(vehicleId);
        setVehicle(data);
        setCurrentIndex(0);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la información del vehículo.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [open, vehicleId]);

  const images = useMemo(() => {
    if (!vehicle) return [];
    if (vehicle.imagenes && vehicle.imagenes.length > 0) {
      return vehicle.imagenes.sort((a, b) => a.orden - b.orden);
    }
    if (vehicle.imagen_perfil) {
      return [
        {
          id_imagen: 0,
          url_imagen: vehicle.imagen_perfil,
          orden: 1,
          img_perfil: 1 as 1,
        },
      ];
    }
    return [];
  }, [vehicle]);

  const handlePrev = () => {
    if (!images.length) return;
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!images.length) return;
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const parsedPrecio =
    vehicle && typeof vehicle.precio === "string"
      ? Number(vehicle.precio)
      : vehicle?.precio;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="body"
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(4px)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 2,
        }}
      >
        <Box>
          <Typography variant="h6">
            {vehicle ? `${vehicle.marca} ${vehicle.modelo}` : "Vehículo"}
          </Typography>
          {vehicle?.anio && (
            <Typography variant="subtitle2" color="text.secondary">
              Año {vehicle.anio}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {error && !loading && <Alert severity="error">{error}</Alert>}

        {!loading && !error && vehicle && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                {parsedPrecio && !Number.isNaN(parsedPrecio) && (
                  <Typography variant="h5" color="primary">
                    ${parsedPrecio.toLocaleString("es-AR")}
                  </Typography>
                )}


                {onBuy && vehicleId != null && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={() => onBuy(vehicleId)}
                    >
                      Comprar
                    </Button>
                  </Box>
                )}
              </Stack>
            </Grid>
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailDialog;
