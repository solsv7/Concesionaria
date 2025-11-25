import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Stack,
  TextField,
  Typography,
  IconButton,
  Divider,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  salesService,
  type CreatePagoPayload,
} from "../../services/salesService";
import { usePaymentFilters } from "../../hooks/usePaymentFilters";
import { vehicleService } from "../../services/vehicleService";
import type { Vehicle } from "../../types/vehicle";

import { useUsers } from "../../hooks/useUsers";
import { useVehicleFilters } from "../../hooks/useVehicleFilters";
import { useAuth } from "../../hooks/useAuth";

interface SaleCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;          
  defaultVehicleId?: number | null;
  defaultUserId?: number | null;   
}

interface LocalPago {
  id_metodo: string;
  monto: string;
  es_vehiculo_entregado: boolean;
  id_marca: string;
  modelo: string;
  anio: string;
  id_color: string;
  id_tipo_vehiculo: string;
  id_transmision: string;
  id_traccion: string;
  km: string;
  puertas: string;
  id_direccion: string;
  id_combustible: string;
}

const emptyPago: LocalPago = {
  id_metodo: "",
  monto: "",
  es_vehiculo_entregado: false,
  id_marca: "",
  modelo: "",
  anio: "",
  id_color: "",
  id_tipo_vehiculo: "",
  id_transmision: "",
  id_traccion: "",
  km: "",
  puertas: "",
  id_direccion: "",
  id_combustible: "",
};

const SaleCreateDialog = ({
  open,
  onClose,
  onCreated,
  defaultVehicleId,
  defaultUserId,
}: SaleCreateDialogProps) => {
  const { user } = useAuth();

  const isAdminOrVendedor =
    user?.id_rol === 1 || user?.id_rol === 2;
  const isConsulta = user?.id_rol === 3;

  const [idVehiculo, setIdVehiculo] = useState<string>("");
  const [idUsuario, setIdUsuario] = useState<string>("");
  const [idPlan, setIdPlan] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");

  const [pagos, setPagos] = useState<LocalPago[]>([{ ...emptyPago }]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    users,
    loading: loadingUsers,
    error: errorUsers,
  } = useUsers();

  const {
    metodosPago,
    planesPago,
    loading: loadingFilters,
    error: errorFilters,
  } = usePaymentFilters();

  const {
    combustibles,
    marcas,
    anios,
    colores,
    tiposVehiculo,
    transmisiones,
    tracciones,
    direcciones,
    loading: loadingVehicleFilters,
    error: errorVehicleFilters,
  } = useVehicleFilters();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [errorVehicles, setErrorVehicles] = useState<string | null>(null);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoadingVehicles(true);
        setErrorVehicles(null);
        const res = await vehicleService.fetchVehicles({
          page: 1,
          pageSize: 100,
        });
        const enStock = res.results.filter(
          (v) => v.estado === "EN_STOCK"
        );
        setVehicles(enStock);
      } catch (err: any) {
        console.error("Error cargando vehículos para venta:", err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Error cargando vehículos";
        setErrorVehicles(msg);
      } finally {
        setLoadingVehicles(false);
      }
    };

    if (open) {
      loadVehicles();
      setError(null);
      setSuccess(null);
      setLoading(false);

      setIdVehiculo(defaultVehicleId ? String(defaultVehicleId) : "");

      if (isAdminOrVendedor) {
        const initialUserId =
          defaultUserId ?? user?.id_usuario ?? null;
        setIdUsuario(initialUserId ? String(initialUserId) : "");
      } else {
        setIdUsuario("");
      }

      setIdPlan("");
      setFecha("");
      setPagos([{ ...emptyPago }]);
    }
  }, [
    open,
    defaultVehicleId,
    defaultUserId,
    isAdminOrVendedor,
    user?.id_usuario,
  ]);

  const handleAddPago = () => {
    setPagos((prev) => [...prev, { ...emptyPago }]);
  };

  const handleRemovePago = (index: number) => {
    setPagos((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePagoFieldChange = (
    index: number,
    field: keyof LocalPago,
    value: string | boolean
  ) => {
    setPagos((prev) =>
      prev.map((pago, i) =>
        i === index ? { ...pago, [field]: value } : pago
      )
    );
  };

  const handleToggleVehiculoEntregado = (index: number) => {
    setPagos((prev) =>
      prev.map((pago, i) =>
        i === index
          ? {
              ...pago,
              es_vehiculo_entregado: !pago.es_vehiculo_entregado,
            }
          : pago
      )
    );
  };

  const resetForm = () => {
    setIdVehiculo("");
    setIdUsuario("");
    setIdPlan("");
    setFecha("");
    setPagos([{ ...emptyPago }]);
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (!idVehiculo || Number(idVehiculo) <= 0) {
        setError("Debes indicar un vehículo válido.");
        setLoading(false);
        return;
      }

      let finalUserId: number | null = null;

      if (isConsulta) {
        finalUserId = user?.id_usuario ?? null;
      } else {
        if (idUsuario) {
          finalUserId = Number(idUsuario);
        } else if (defaultUserId) {
          finalUserId = defaultUserId;
        } else if (user?.id_usuario) {
          finalUserId = user.id_usuario;
        }
      }

      if (!finalUserId || finalUserId <= 0) {
        setError("Debes indicar un usuario válido.");
        setLoading(false);
        return;
      }

      const pagosValidos = pagos.filter(
        (p) =>
          String(p.id_metodo ?? "").trim() !== "" &&
          String(p.monto ?? "").trim() !== ""
      );

      if (pagosValidos.length === 0) {
        setError("Debes indicar al menos un pago con método y monto.");
        setLoading(false);
        return;
      }

      const pagosPayload: CreatePagoPayload[] = pagosValidos.map((p) => {
        const base: CreatePagoPayload = {
          id_metodo: Number(p.id_metodo),
          monto: Number(p.monto),
        };

        if (p.es_vehiculo_entregado) {
          base.es_vehiculo_entregado = true;
          if (p.id_marca) base.id_marca = Number(p.id_marca);
          if (p.modelo) base.modelo = p.modelo;
          if (p.anio) base.anio = Number(p.anio);
          if (p.id_color) base.id_color = Number(p.id_color);
          if (p.id_tipo_vehiculo)
            base.id_tipo_vehiculo = Number(p.id_tipo_vehiculo);
          if (p.id_transmision)
            base.id_transmision = Number(p.id_transmision);
          if (p.id_traccion) base.id_traccion = Number(p.id_traccion);
          if (p.km) base.km = Number(p.km);
          if (p.puertas) base.puertas = Number(p.puertas);
          if (p.id_direccion)
            base.id_direccion = Number(p.id_direccion);
          if (p.id_combustible)
            base.id_combustible = Number(p.id_combustible);
        }

        return base;
      });

      const payload = {
        id_vehiculo: Number(idVehiculo),
        id_usuario: finalUserId, 
        id_plan: idPlan ? Number(idPlan) : null,
        fecha: fecha || undefined,
        pagos: pagosPayload,
      };

      const result = await salesService.createVenta(payload);

      setSuccess(result.message || "Venta creada correctamente.");
      resetForm();

      if (onCreated) {
        onCreated();
      }
    } catch (err: any) {
      console.error("Error creando venta:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al crear la venta";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Nueva venta</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Creá una venta indicando el vehículo, el cliente, un plan (si
          corresponde) y una o varias formas de pago. Si uno de los pagos
          corresponde a la entrega de un vehículo usado, marcá "Vehículo
          entregado" y completá sus datos.
        </Typography>

        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} sm={6}>
            {loadingVehicles ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} />
                <Typography variant="body2">
                  Cargando vehículos...
                </Typography>
              </Stack>
            ) : (
              <TextField
                select
                label="Vehículo a vender"
                fullWidth
                size="small"
                value={idVehiculo}
                onChange={(e) => setIdVehiculo(e.target.value)}
                helperText="Solo se listan vehículos en stock"
                error={!!errorVehicles}
              >
                {vehicles.map((v) => (
                  <MenuItem
                    key={v.id_vehiculo}
                    value={String(v.id_vehiculo)}
                  >
                    {v.marca} {v.modelo}
                    {v.anio ? ` (${v.anio})` : ""} - $
                    {v.precio.toLocaleString("es-AR")}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {errorVehicles && (
              <Typography
                variant="caption"
                color="error"
                display="block"
              >
                {errorVehicles}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            {isConsulta ? (
              <Box>
                <Typography variant="subtitle2">
                  Usuario (quien compra)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user
                    ? `${user.nombre ?? "Usuario actual"}${
                        user.email ? ` - ${user.email}` : ""
                      }`
                    : "Usuario actual"}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  La compra se registrará a tu nombre.
                </Typography>
              </Box>
            ) : loadingUsers ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} />
                <Typography variant="body2">
                  Cargando usuarios...
                </Typography>
              </Stack>
            ) : (
              <>
                <TextField
                  select
                  label="Usuario (quien compra)"
                  fullWidth
                  size="small"
                  value={idUsuario}
                  onChange={(e) => setIdUsuario(e.target.value)}
                  helperText="Seleccioná a nombre de quién quedará la compra"
                  error={!!errorUsers}
                >
                  {users.map((u) => (
                    <MenuItem
                      key={u.id_usuario}
                      value={String(u.id_usuario)}
                    >
                      {u.nombre}
                      {u.rol ? ` (${u.rol})` : ""}{" "}
                      {u.email ? ` - ${u.email}` : ""}
                    </MenuItem>
                  ))}
                </TextField>
                {errorUsers && (
                  <Typography
                    variant="caption"
                    color="error"
                    display="block"
                  >
                    {errorUsers}
                  </Typography>
                )}
              </>
            )}
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              select
              label="Plan de pago"
              fullWidth
              size="small"
              value={idPlan}
              onChange={(e) => setIdPlan(e.target.value)}
              helperText="Vacío = contado"
            >
              <MenuItem value="">Sin plan (contado)</MenuItem>
              {planesPago.map((plan) => (
                <MenuItem
                  key={plan.id_plan}
                  value={String(plan.id_plan)}
                >
                  Plan #{plan.id_plan} - {plan.cuotas} cuotas -{" "}
                  {plan.interes}% interés - Min {plan.min_entrega}%
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Fecha"
              type="date"
              fullWidth
              size="small"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="Si se deja vacío, se usa la fecha actual"
            />
          </Grid>
        </Grid>

        {errorFilters && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorFilters}
          </Alert>
        )}

        {errorVehicleFilters && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {errorVehicleFilters}
          </Alert>
        )}

        <Divider sx={{ mb: 2 }} />

        <Stack
          direction="row"
          justifyContent="space-between"
          mb={1}
          alignItems="center"
        >
          <Typography variant="subtitle1">Pagos</Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={handleAddPago}
          >
            Agregar pago
          </Button>
        </Stack>

        {pagos.map((pago, index) => (
          <Box
            key={index}
            sx={{
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 2,
              p: 2,
              mb: 2,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={1}
            >
              <Typography variant="subtitle2">
                Pago #{index + 1}
              </Typography>
              {pagos.length > 1 && (
                <IconButton
                  size="small"
                  onClick={() => handleRemovePago(index)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Método de pago"
                  fullWidth
                  size="small"
                  value={pago.id_metodo}
                  onChange={(e) =>
                    handlePagoFieldChange(
                      index,
                      "id_metodo",
                      e.target.value
                    )
                  }
                  helperText={
                    loadingFilters
                      ? "Cargando métodos..."
                      : "Seleccioná el método"
                  }
                >
                  {metodosPago.map((m) => (
                    <MenuItem
                      key={m.id_metodo}
                      value={String(m.id_metodo)}
                    >
                      {m.metodo}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Monto"
                  type="number"
                  fullWidth
                  size="small"
                  value={pago.monto}
                  onChange={(e) =>
                    handlePagoFieldChange(
                      index,
                      "monto",
                      e.target.value
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  size="small"
                  variant={
                    pago.es_vehiculo_entregado ? "contained" : "outlined"
                  }
                  onClick={() => handleToggleVehiculoEntregado(index)}
                >
                  {pago.es_vehiculo_entregado
                    ? "Pago con vehículo entregado"
                    : "Marcar como vehículo entregado"}
                </Button>
              </Grid>
            </Grid>

            {pago.es_vehiculo_entregado && (
              <Box mt={2}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  mb={1}
                >
                  Datos del vehículo entregado (se creará como
                  USADO_CLIENTE / EN_EVALUACION)
                </Typography>

                {loadingVehicleFilters && (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mb={1}
                  >
                    <CircularProgress size={16} />
                    <Typography variant="caption">
                      Cargando filtros de vehículo...
                    </Typography>
                  </Stack>
                )}

                <Grid container spacing={2}>
                  {/* Marca */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      label="Marca"
                      fullWidth
                      size="small"
                      value={pago.id_marca}
                      onChange={(e) =>
                        handlePagoFieldChange(
                          index,
                          "id_marca",
                          e.target.value
                        )
                      }
                    >
                      {marcas.map((m) => (
                        <MenuItem
                          key={m.id_marca}
                          value={String(m.id_marca)}
                        >
                          {m.marca}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Modelo */}
                  <Grid item xs={12} sm={8}>
                    <TextField
                      label="Modelo"
                      fullWidth
                      size="small"
                      value={pago.modelo}
                      onChange={(e) =>
                        handlePagoFieldChange(
                          index,
                          "modelo",
                          e.target.value
                        )
                      }
                    />
                  </Grid>

                  {/* Año */}
                  <Grid item xs={12} sm={3}>
                    <TextField
                    label="Año"
                    fullWidth
                    size="small"
                    value={pago.anio}
                    onChange={(e) =>
                      handlePagoFieldChange(index, "anio", e.target.value)
                    }
                    placeholder="Ej: 2012"
                  />

                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <TextField
                      select
                      label="Color"
                      fullWidth
                      size="small"
                      value={pago.id_color}
                      onChange={(e) =>
                        handlePagoFieldChange(
                          index,
                          "id_color",
                          e.target.value
                        )
                      }
                    >
                      {colores.map((c) => (
                        <MenuItem
                          key={c.id_color}
                          value={String(c.id_color)}
                        >
                          {c.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <TextField
                      select
                      label="Tipo vehículo"
                      fullWidth
                      size="small"
                      value={pago.id_tipo_vehiculo}
                      onChange={(e) =>
                        handlePagoFieldChange(
                          index,
                          "id_tipo_vehiculo",
                          e.target.value
                        )
                      }
                    >
                      {tiposVehiculo.map((t) => (
                        <MenuItem
                          key={t.id_tipo_vehiculo}
                          value={String(t.id_tipo_vehiculo)}
                        >
                          {t.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <TextField
                      select
                      label="Transmisión"
                      fullWidth
                      size="small"
                      value={pago.id_transmision}
                      onChange={(e) =>
                        handlePagoFieldChange(
                          index,
                          "id_transmision",
                          e.target.value
                        )
                      }
                    >
                      {transmisiones.map((t) => (
                        <MenuItem
                          key={t.id_transmision}
                          value={String(t.id_transmision)}
                        >
                          {t.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <TextField
                      select
                      label="Tracción"
                      fullWidth
                      size="small"
                      value={pago.id_traccion}
                      onChange={(e) =>
                        handlePagoFieldChange(
                          index,
                          "id_traccion",
                          e.target.value
                        )
                      }
                    >
                      {tracciones.map((t) => (
                        <MenuItem
                          key={t.id_traccion}
                          value={String(t.id_traccion)}
                        >
                          {t.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="KM"
                      type="number"
                      fullWidth
                      size="small"
                      value={pago.km}
                      onChange={(e) =>
                        handlePagoFieldChange(
                          index,
                          "km",
                          e.target.value
                        )
                      }
                    />
                  </Grid>

                  {/* Puertas */}
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Puertas"
                      type="number"
                      fullWidth
                      size="small"
                      value={pago.puertas}
                      onChange={(e) =>
                        handlePagoFieldChange(
                          index,
                          "puertas",
                          e.target.value
                        )
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <TextField
                      select
                      label="Dirección"
                      fullWidth
                      size="small"
                      value={pago.id_direccion}
                      onChange={(e) =>
                        handlePagoFieldChange(
                          index,
                          "id_direccion",
                          e.target.value
                        )
                      }
                    >
                      {direcciones.map((d) => (
                        <MenuItem
                          key={d.id_direccion}
                          value={String(d.id_direccion)}
                        >
                          {d.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <TextField
                      select
                      label="Combustible"
                      fullWidth
                      size="small"
                      value={pago.id_combustible}
                      onChange={(e) =>
                        handlePagoFieldChange(
                          index,
                          "id_combustible",
                          e.target.value
                        )
                      }
                    >
                      {combustibles.map((c) => (
                        <MenuItem
                          key={c.id_combustible}
                          value={String(c.id_combustible)}
                        >
                          {c.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        ))}

        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 1 }}>
            {success}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cerrar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? "Creando..." : "Crear venta"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaleCreateDialog;
