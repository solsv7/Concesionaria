import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import {
  salesService,
  type CuotaVenta,
  type Sale,
} from "../../services/salesService";
import { usePaymentFilters } from "../../hooks/usePaymentFilters";

interface SaleCuotasDialogProps {
  open: boolean;
  onClose: () => void;
  sale: Sale | null;
}

const SaleCuotasDialog = ({ open, onClose, sale }: SaleCuotasDialogProps) => {
  const [cuotas, setCuotas] = useState<CuotaVenta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [payingCuota, setPayingCuota] = useState<CuotaVenta | null>(null);
  const [idMetodo, setIdMetodo] = useState<string>("");
  const [monto, setMonto] = useState<string>("");

  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paySuccess, setPaySuccess] = useState<string | null>(null);

  const idVenta = sale?.id_venta_auto ?? null;

  const {
    metodosPago,
    loading: loadingMetodos,
    error: errorMetodos,
  } = usePaymentFilters();

  const paySectionRef = useRef<HTMLDivElement | null>(null);

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("es-AR");
  };

  const formatCurrency = (value?: number | null) => {
    if (!value && value !== 0) return "-";
    return value.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });
  };

  const loadCuotas = async () => {
    if (!idVenta) return;
    try {
      setLoading(true);
      setError(null);
      const data = await salesService.getCuotasByVenta(idVenta);
      setCuotas(data);
    } catch (err: any) {
      console.error("Error cargando cuotas:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error cargando cuotas de la venta";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && idVenta) {
      setPayingCuota(null);
      setIdMetodo("");
      setMonto("");
      setPayError(null);
      setPaySuccess(null);
      loadCuotas();
    }
  }, [open, idVenta]);

  const handleClose = () => {
    setPayingCuota(null);
    setIdMetodo("");
    setMonto("");
    setPayError(null);
    setPaySuccess(null);
    onClose();
  };

  const handleStartPay = (cuota: CuotaVenta) => {
    setPayingCuota(cuota);
    setIdMetodo("");
    setMonto("");
    setPayError(null);
    setPaySuccess(null);
  };

  const handleCancelPay = () => {
    setPayingCuota(null);
    setIdMetodo("");
    setMonto("");
    setPayError(null);
    setPaySuccess(null);
  };

  const handleConfirmPay = async () => {
    if (!sale || !payingCuota) return;

    if (!idMetodo) {
      setPayError("Debes seleccionar un método de pago.");
      return;
    }

    const montoNumber = monto ? Number(monto) : undefined;

    if (montoNumber !== undefined && (Number.isNaN(montoNumber) || montoNumber <= 0)) {
      setPayError("El monto debe ser un número mayor a 0.");
      return;
    }

    try {
      setPayLoading(true);
      setPayError(null);
      setPaySuccess(null);

      await salesService.payCuota(sale.id_venta_auto, payingCuota.id_cuota, {
        id_metodo: Number(idMetodo),
        monto: montoNumber,
      });

      setPaySuccess("Cuota pagada correctamente.");
      await loadCuotas();

      setPayingCuota(null);
      setIdMetodo("");
      setMonto("");
    } catch (err: any) {
      console.error("Error pagando cuota:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error al pagar la cuota";
      setPayError(message);
    } finally {
      setPayLoading(false);
    }
  };

  useEffect(() => {
    if (payingCuota && paySectionRef.current) {
      paySectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [payingCuota]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        Cuotas de la venta {sale ? `#${sale.id_venta_auto}` : ""}
      </DialogTitle>
      <DialogContent dividers>
        {sale && (
          <Box mb={2}>
            <Typography variant="subtitle2">
              Cliente: {sale.nombre_cliente}
            </Typography>
            <Typography variant="subtitle2">
              Vehículo: {sale.marca} {sale.modelo}
              {sale.anio ? ` (${sale.anio})` : ""}
            </Typography>
            <Typography variant="subtitle2">
              Total venta: {formatCurrency(sale.total_pagado)}
            </Typography>
          </Box>
        )}

        {loading ? (
          <Box
            sx={{
              py: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <CircularProgress size={24} />
            <Typography>Cargando cuotas...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : cuotas.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No hay cuotas registradas para esta venta.
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>N° cuota</TableCell>
                  <TableCell>Vencimiento</TableCell>
                  <TableCell>Monto</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cuotas.map((cuota) => (
                  <TableRow key={cuota.id_cuota} hover>
                    <TableCell>{cuota.nro_cuota}</TableCell>
                    <TableCell>{formatDate(cuota.fecha_vencimiento)}</TableCell>
                    <TableCell>{formatCurrency(cuota.monto)}</TableCell>
                    <TableCell>
                      {cuota.pagada ? (
                        <Chip
                          size="small"
                          label="Pagada"
                          color="success"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          size="small"
                          label="Pendiente"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {!cuota.pagada && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleStartPay(cuota)}
                        >
                          Pagar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {errorMetodos && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {errorMetodos}
          </Alert>
        )}

        {payingCuota && (
          <Box mt={2} ref={paySectionRef}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Registrar pago de cuota #{payingCuota.nro_cuota}
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={1}>
              Monto de la cuota: {formatCurrency(payingCuota.monto)}.{" "}
              Si dejás el campo "Monto" vacío, se usará el monto completo de la cuota.
            </Typography>

            <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
              <TextField
                select
                label="Método de pago"
                value={idMetodo}
                onChange={(e) => setIdMetodo(e.target.value)}
                size="small"
                fullWidth
                disabled={loadingMetodos || !metodosPago?.length}
                helperText={
                  loadingMetodos
                    ? "Cargando métodos..."
                    : !metodosPago?.length
                    ? "No hay métodos de pago configurados"
                    : "Seleccioná el método de pago"
                }
              >
                <MenuItem value="">
                  <em>Seleccionar...</em>
                </MenuItem>
                {metodosPago?.map((m) => (
                  <MenuItem key={m.id_metodo} value={String(m.id_metodo)}>
                    {m.metodo}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Monto (opcional)"
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                size="small"
                fullWidth
              />
            </Stack>

            {payError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {payError}
              </Alert>
            )}

            {paySuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {paySuccess}
              </Alert>
            )}

            <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
              <Button onClick={handleCancelPay} disabled={payLoading}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirmPay}
                disabled={payLoading || loadingMetodos || !metodosPago?.length}
              >
                {payLoading ? "Procesando..." : "Confirmar pago"}
              </Button>
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaleCuotasDialog;
