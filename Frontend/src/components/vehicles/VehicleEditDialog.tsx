import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  FormControlLabel,
  RadioGroup,
  Radio,
  useMediaQuery,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Stack,
  Alert,
  Chip,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { useVehicleFilters } from "../../hooks/useVehicleFilters";
import {
  vehicleService,
  type VehicleDetail,
  type UpdateVehiclePayload,
  type VehicleImage,
} from "../../services/vehicleService";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { VehicleImageUploader } from "./VehicleImageUploader";

interface VehicleEditDialogProps {
  open: boolean;
  vehicleId: number | null;
  onClose: () => void;
  onSaved?: () => void;
}

type StepType = 1 | 2 | 3;

export const VehicleEditDialog: React.FC<VehicleEditDialogProps> = ({
  open,
  vehicleId,
  onClose,
  onSaved,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    marcas,
    combustibles,
    colores,
    tiposVehiculo,
    transmisiones,
    tracciones,
    direcciones,
  } = useVehicleFilters();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [form, setForm] = useState<UpdateVehiclePayload>({});
  const [showConfirmSave, setShowConfirmSave] = useState(false);

  const [step, setStep] = useState<StepType>(1);
  const [imgError, setImgError] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [profileChanged, setProfileChanged] = useState(false);
  const [extraCount, setExtraCount] = useState(0);

  const refreshVehicle = async (id: number) => {
    const data = await vehicleService.getById(id);
    setVehicle(data);
  };

  const findProfileImage = (imagenes?: VehicleImage[]) =>
    imagenes?.find((img) => img.img_perfil === 1) ?? null;

  useEffect(() => {
    if (!open || vehicleId == null) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setImgError(null);
        setStep(1);
        setProfileChanged(false);
        setExtraCount(0);

        const data = await vehicleService.getById(vehicleId);
        setVehicle(data);
        setForm({
          id_marca: data.id_marca,
          modelo: data.modelo,
          precio: Number(data.precio),
          id_combustible: data.id_combustible,
          origen: data.origen as any,
          es_usado: data.es_usado as 0 | 1,
          anio: data.anio ?? undefined,
          km: data.km ?? undefined,
          puertas: data.puertas ?? undefined,
          id_color: data.id_color ?? undefined,
          id_tipo_vehiculo: data.id_tipo_vehiculo ?? undefined,
          id_transmision: data.id_transmision ?? undefined,
          id_traccion: data.id_traccion ?? undefined,
          id_direccion: data.id_direccion ?? undefined,
        });
      } catch (err: any) {
        console.error("Error cargando vehículo:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [open, vehicleId]);

  const handleText =
    (field: keyof UpdateVehiclePayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((prev) => ({
        ...prev,
        [field]:
          field === "modelo" || field === "origen"
            ? (value as any)
            : value === ""
            ? undefined
            : Number(value),
      }));
    };

  const handleSelectNumber =
    (field: keyof UpdateVehiclePayload) => (e: SelectChangeEvent) => {
      const value = e.target.value;
      setForm((prev) => ({
        ...prev,
        [field]: value === "" ? undefined : Number(value),
      }));
    };

  const handleSelectString =
    (field: keyof UpdateVehiclePayload) => (e: SelectChangeEvent) => {
      const value = e.target.value;
      setForm((prev) => ({
        ...prev,
        [field]: value === "" ? undefined : (value as any),
      }));
    };

  const handleEsUsadoChange = (
    _e: React.ChangeEvent<HTMLInputElement>,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      es_usado: value === "" ? undefined : (Number(value) as 0 | 1),
    }));
  };

  const doSave = async () => {
    if (!vehicleId) return;
    try {
      setSaving(true);
      await vehicleService.updateVehicle(vehicleId, form);
      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      console.error("Error guardando vehículo:", err);
    } finally {
      setSaving(false);
      setShowConfirmSave(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleSetProfile = async (idImagen: number) => {
    if (!vehicleId) return;
    try {
      setImgLoading(true);
      setImgError(null);
      await vehicleService.setProfileImage(vehicleId, idImagen);
      await refreshVehicle(vehicleId);
      setProfileChanged(true);
      onSaved?.(); 
    } catch (err: any) {
      console.error("Error cambiando foto de perfil:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error cambiando foto de perfil";
      setImgError(msg);
    } finally {
      setImgLoading(false);
    }
  };

  const renderStep1 = () => {
    if (loading || !vehicle) {
      return (
        <Box py={4} textAlign="center">
          <CircularProgress size={24} />
        </Box>
      );
    }

    return (
      <Box sx={{ mt: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Marca</InputLabel>
              <Select
                label="Marca"
                value={form.id_marca?.toString() ?? ""}
                onChange={handleSelectNumber("id_marca")}
              >
                <MenuItem value="">
                  <em>Seleccionar</em>
                </MenuItem>
                {marcas.map((m) => (
                  <MenuItem key={m.id_marca} value={m.id_marca.toString()}>
                    {m.marca}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Modelo"
              fullWidth
              size="small"
              value={form.modelo ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, modelo: e.target.value }))
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Precio"
              type="number"
              fullWidth
              size="small"
              value={form.precio ?? ""}
              onChange={handleText("precio")}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Combustible</InputLabel>
              <Select
                label="Combustible"
                value={form.id_combustible?.toString() ?? ""}
                onChange={handleSelectNumber("id_combustible")}
              >
                <MenuItem value="">
                  <em>Seleccionar</em>
                </MenuItem>
                {combustibles.map((c) => (
                  <MenuItem
                    key={c.id_combustible}
                    value={c.id_combustible.toString()}
                  >
                    {c.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Origen</InputLabel>
              <Select
                label="Origen"
                value={form.origen ?? ""}
                onChange={handleSelectString("origen")}
              >
                <MenuItem value="">
                  <em>Seleccionar</em>
                </MenuItem>
                <MenuItem value="AGENCIA">Agencia</MenuItem>
                <MenuItem value="USADO_CLIENTE">Usado cliente</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <RadioGroup
              row
              value={form.es_usado?.toString() ?? ""}
              onChange={handleEsUsadoChange}
            >
              <FormControlLabel
                value="0"
                control={<Radio size="small" />}
                label="0 km"
              />
              <FormControlLabel
                value="1"
                control={<Radio size="small" />}
                label="Usado"
              />
            </RadioGroup>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Año"
              type="number"
              fullWidth
              size="small"
              value={form.anio ?? ""}
              onChange={handleText("anio")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="KM"
              type="number"
              fullWidth
              size="small"
              value={form.km ?? ""}
              onChange={handleText("km")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Puertas"
              type="number"
              fullWidth
              size="small"
              value={form.puertas ?? ""}
              onChange={handleText("puertas")}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Color</InputLabel>
              <Select
                label="Color"
                value={form.id_color?.toString() ?? ""}
                onChange={handleSelectNumber("id_color")}
              >
                <MenuItem value="">
                  <em>Sin especificar</em>
                </MenuItem>
                {colores.map((c) => (
                  <MenuItem key={c.id_color} value={c.id_color.toString()}>
                    {c.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo vehículo</InputLabel>
              <Select
                label="Tipo vehículo"
                value={form.id_tipo_vehiculo?.toString() ?? ""}
                onChange={handleSelectNumber("id_tipo_vehiculo")}
              >
                <MenuItem value="">
                  <em>Sin especificar</em>
                </MenuItem>
                {tiposVehiculo.map((t) => (
                  <MenuItem
                    key={t.id_tipo_vehiculo}
                    value={t.id_tipo_vehiculo.toString()}
                  >
                    {t.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Transmisión</InputLabel>
              <Select
                label="Transmisión"
                value={form.id_transmision?.toString() ?? ""}
                onChange={handleSelectNumber("id_transmision")}
              >
                <MenuItem value="">
                  <em>Sin especificar</em>
                </MenuItem>
                {transmisiones.map((t) => (
                  <MenuItem
                    key={t.id_transmision}
                    value={t.id_transmision.toString()}
                  >
                    {t.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Tracción</InputLabel>
              <Select
                label="Tracción"
                value={form.id_traccion?.toString() ?? ""}
                onChange={handleSelectNumber("id_traccion")}
              >
                <MenuItem value="">
                  <em>Sin especificar</em>
                </MenuItem>
                {tracciones.map((t) => (
                  <MenuItem
                    key={t.id_traccion}
                    value={t.id_traccion.toString()}
                  >
                    {t.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Dirección</InputLabel>
              <Select
                label="Dirección"
                value={form.id_direccion?.toString() ?? ""}
                onChange={handleSelectNumber("id_direccion")}
              >
                <MenuItem value="">
                  <em>Sin especificar</em>
                </MenuItem>
                {direcciones.map((d) => (
                  <MenuItem
                    key={d.id_direccion}
                    value={d.id_direccion.toString()}
                  >
                    {d.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderStep2 = () => {
    if (!vehicleId || !vehicle) {
      return (
        <Box py={4} textAlign="center">
          Cargando...
        </Box>
      );
    }

    const imagenes = vehicle.imagenes ?? [];
    const perfil = findProfileImage(imagenes);

    return (
      <Stack spacing={2}>
        {imgError && <Alert severity="error">{imgError}</Alert>}

        <Typography variant="subtitle1" fontWeight={600}>
          Foto de perfil del vehículo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Elegí una imagen principal. Podés seleccionar una existente o subir
          una nueva como foto de perfil.
        </Typography>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Actual
          </Typography>
          {perfil ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                component="img"
                src={perfil.url_imagen}
                alt="Foto de perfil"
                sx={{
                  width: 140,
                  height: 90,
                  objectFit: "cover",
                  borderRadius: 2,
                  border: "1px solid rgba(0,0,0,0.12)",
                }}
              />
              <Chip
                label="Foto de perfil"
                color="primary"
                size="small"
              />
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No hay foto de perfil definida.
            </Typography>
          )}
        </Box>

        {imagenes.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Otras imágenes
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {imagenes.map((img) => (
                <Chip
                  key={img.id_imagen}
                  avatar={
                    <Avatar
                      src={img.url_imagen}
                      variant="rounded"
                      sx={{ width: 32, height: 32 }}
                    />
                  }
                  label={
                    img.img_perfil
                      ? "Perfil"
                      : `Img #${img.orden ?? img.id_imagen}`
                  }
                  variant={img.img_perfil ? "filled" : "outlined"}
                  color={img.img_perfil ? "primary" : "default"}
                  onClick={() => handleSetProfile(img.id_imagen)}
                  disabled={imgLoading}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Box>
        )}

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Subir nueva foto de perfil
          </Typography>
          <VehicleImageUploader
            vehicleId={vehicleId}
            isProfile
            onUploaded={async () => {
              if (vehicleId) {
                await refreshVehicle(vehicleId);
                setProfileChanged(true);
                onSaved?.(); 
              }
            }}
          />
        </Box>

        {profileChanged && (
          <Alert severity="success">
            Foto de perfil actualizada correctamente.
          </Alert>
        )}
      </Stack>
    );
  };

  const renderStep3 = () => {
    if (!vehicleId || !vehicle) {
      return (
        <Box py={4} textAlign="center">
          Cargando...
        </Box>
      );
    }

    const imagenes = vehicle.imagenes ?? [];

    return (
      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight={600}>
          Otras imágenes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Podés subir fotos adicionales (interior, detalles, etc.). Cada vez que
          elijas una imagen se va a subir y se va a asociar automáticamente al
          vehículo.
        </Typography>

        {imagenes.length > 0 && (
          <Grid container spacing={1}>
            {imagenes.map((img) => (
              <Grid item key={img.id_imagen} xs={6} sm={4} md={3}>
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: 2,
                    overflow: "hidden",
                    border: img.img_perfil
                      ? "2px solid #1976d2"
                      : "1px solid rgba(0,0,0,0.12)",
                  }}
                >
                  <Box
                    component="img"
                    src={img.url_imagen}
                    alt={`Imagen ${img.id_imagen}`}
                    sx={{
                      width: "100%",
                      height: 100,
                      objectFit: "cover",
                    }}
                  />
                  {img.img_perfil === 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 4,
                        left: 4,
                        bgcolor: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        px: 0.5,
                        borderRadius: 1,
                        fontSize: "0.7rem",
                      }}
                    >
                      Perfil
                    </Box>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Agregar nuevas imágenes
          </Typography>
          <VehicleImageUploader
            vehicleId={vehicleId}
            isProfile={false}
            onUploaded={async () => {
              setExtraCount((c) => c + 1);
              if (vehicleId) {
                await refreshVehicle(vehicleId);
                onSaved?.(); 
              }
            }}
          />
        </Box>

        {extraCount > 0 && (
          <Typography variant="body2" color="text.secondary">
            Imágenes adicionales subidas: {extraCount}
          </Typography>
        )}
      </Stack>
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        fullScreen={fullScreen}
      >
        <DialogTitle>
          Editar vehículo{" "}
          {vehicle ? `· ${vehicle.marca} ${vehicle.modelo}` : ""}
        </DialogTitle>
        <DialogContent dividers>
          {/* Stepper */}
          <Box sx={{ mb: 3 }}>
            <Stepper
              activeStep={step === 1 ? 0 : step === 2 ? 1 : 2}
              alternativeLabel
            >
              <Step>
                <StepLabel>Datos</StepLabel>
              </Step>
              <Step>
                <StepLabel>Foto de perfil</StepLabel>
              </Step>
              <Step>
                <StepLabel>Otras fotos</StepLabel>
              </Step>
            </Stepper>
          </Box>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cerrar</Button>

          {step === 1 && (
            <>
              <Button
                variant="outlined"
                onClick={() => setStep(2)}
                disabled={loading || !vehicle}
              >
                Imágenes
              </Button>
              <Button
                variant="contained"
                onClick={() => setShowConfirmSave(true)}
                disabled={saving || !vehicleId}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Button
                variant="outlined"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Volver a datos
              </Button>
              <Button
                variant="contained"
                onClick={() => setStep(3)}
                disabled={loading}
              >
                Otras fotos
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              <Button
                variant="outlined"
                onClick={() => setStep(2)}
                disabled={loading}
              >
                Volver a perfil
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  onSaved?.();
                  handleClose();
                }}
                disabled={loading}
              >
                Finalizar
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={showConfirmSave}
        onClose={() => setShowConfirmSave(false)}
        onConfirm={doSave}
        title="Confirmar cambios"
        description="¿Confirmás que querés guardar los cambios de este vehículo?"
        confirmLabel="Sí, guardar"
      />
    </>
  );
};
