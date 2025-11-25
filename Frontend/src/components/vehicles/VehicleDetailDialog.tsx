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
import {
  vehicleService,
  type VehicleDetail,
} from "../../services/vehicleService";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

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

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleBuyClick = () => {
    if (vehicleId == null) return;

    if (!user) {
      navigate("/login", {
        state: { from: location.pathname },
        replace: true,
      });
      return;
    }

    if (onBuy) {
      onBuy(vehicleId);
    }
  };

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
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: "grey.100",
                  minHeight: 260,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {images.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Sin imágenes
                  </Typography>
                ) : (
                  <>
                    <Box
                      component="img"
                      src={images[currentIndex].url_imagen}
                      alt={`${vehicle.marca} ${vehicle.modelo}`}
                      sx={{
                        width: "100%",
                        height: 260,
                        objectFit: "cover",
                      }}
                    />

                    {images.length > 1 && (
                      <>
                        <IconButton
                          onClick={handlePrev}
                          sx={{
                            position: "absolute",
                            left: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            bgcolor: "rgba(255,255,255,0.7)",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                          }}
                        >
                          <ChevronLeftIcon />
                        </IconButton>
                        <IconButton
                          onClick={handleNext}
                          sx={{
                            position: "absolute",
                            right: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            bgcolor: "rgba(255,255,255,0.7)",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                          }}
                        >
                          <ChevronRightIcon />
                        </IconButton>
                      </>
                    )}
                  </>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                {parsedPrecio && !Number.isNaN(parsedPrecio) && (
                  <Typography variant="h5" color="primary">
                    ${parsedPrecio.toLocaleString("es-AR")}
                  </Typography>
                )}

                <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
                  <Chip
                    label={vehicle.es_usado ? "Usado" : "0 km"}
                    color={vehicle.es_usado ? "default" : "primary"}
                    size="small"
                  />
                  {vehicle.estado && (
                    <Chip
                      label={vehicle.estado}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {vehicle.origen && (
                    <Chip
                      label={vehicle.origen}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {vehicle.combustible && (
                    <Chip label={vehicle.combustible} size="small" />
                  )}
                  {vehicle.color && (
                    <Chip
                      label={vehicle.color}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {vehicle.tipo_vehiculo && (
                    <Chip
                      label={vehicle.tipo_vehiculo}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {vehicle.transmision && (
                    <Chip
                      label={vehicle.transmision}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {vehicle.traccion && (
                    <Chip
                      label={vehicle.traccion}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {vehicle.direccion && (
                    <Chip
                      label={vehicle.direccion}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>

                {vehicleId != null && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={handleBuyClick}
                    >
                      Comprar
                    </Button>
                  </Box>
                )}

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Detalles técnicos
                  </Typography>
                  <Stack spacing={0.5} mt={0.5}>
                    {vehicle.km !== undefined && (
                      <Typography variant="body2">
                        <strong>KM:</strong>{" "}
                        {vehicle.km.toLocaleString("es-AR")} km
                      </Typography>
                    )}
                    {vehicle.puertas !== undefined && (
                      <Typography variant="body2">
                        <strong>Puertas:</strong> {vehicle.puertas}
                      </Typography>
                    )}
                    {vehicle.anio && (
                      <Typography variant="body2">
                        <strong>Año:</strong> {vehicle.anio}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      <strong>Marca:</strong> {vehicle.marca}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Modelo:</strong> {vehicle.modelo}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailDialog;
