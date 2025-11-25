import { useEffect, useState } from "react";
import type React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Tabs,
  Tab,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { useSales, getCurrentMonthRange } from "../../hooks/useSales";
import SaleCuotasDialog from "./SaleCuotasDialog";
import SaleCreateDialog from "./SaleCreateDialog";
import type { Sale } from "../../services/salesService";

type TabValue = "current" | "custom";

interface SalesDashboardProps {
  mode?: "admin" | "cliente"; // admin = tablero general, cliente = mis compras/mis ventas
}

const SalesDashboard = ({ mode = "admin" }: SalesDashboardProps) => {
  const [tab, setTab] = useState<TabValue>("current");

  const {
    ventas,
    resumen,
    movimientos,
    range,
    setRange,
    loadingVentas,
    loadingMovimientos,
    loadingResumen,
    errorVentas,
    errorMovimientos,
    errorResumen,
  } = useSales({
    autoLoad: true,
    scope: mode === "cliente" ? "mine" : "all", 
  });

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [cuotasOpen, setCuotasOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const isLoading = loadingVentas || loadingMovimientos || loadingResumen;
  const mergedError = errorVentas || errorResumen || errorMovimientos;

  const handleTabChange = (_: React.SyntheticEvent, newValue: TabValue) => {
    setTab(newValue);
  };

  useEffect(() => {
    if (tab === "current") {
      const monthRange = getCurrentMonthRange();
      setRange(monthRange);
    }
  }, [tab, setRange]);

  const handleChangeRange =
    (field: "desde" | "hasta") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newRange = {
        ...range,
        [field]: event.target.value,
      };
      setRange(newRange);
    };

  const formatCurrency = (value?: number | null) => {
    if (!value) return "-";
    return value.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("es-AR");
  };

  const getEstadoColor = (estado?: string) => {
    switch (estado) {
      case "APROBADA":
        return "success";
      case "PENDIENTE":
        return "warning";
      case "RECHAZADA":
        return "error";
      default:
        return "default";
    }
  };

  const getMovimientoColor = (tipo?: string) => {
    switch (tipo) {
      case "ENTRADA":
        return "success";
      case "CUOTA":
        return "info";
      case "OTRO":
        return "default";
      default:
        return "default";
    }
  };

  const handleOpenCuotas = (venta: Sale) => {
    if (!venta.id_plan) return; 
    setSelectedSale(venta);
    setCuotasOpen(true);
  };

  const handleCloseCuotas = () => {
    setCuotasOpen(false);
    setSelectedSale(null);
  };

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h5">
          {mode === "cliente" ? "Mis ventas y movimientos" : "Dashboard de Ventas"}
        </Typography>

        <Button
          variant="contained"
          size="small"
          onClick={() => setCreateOpen(true)}
        >
          Nueva venta
        </Button>
      </Stack>

      <Tabs
        value={tab}
        onChange={handleTabChange}
        sx={{ mb: 2 }}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Mes actual" value="current" />
        <Tab label="Rango personalizado" value="custom" />
      </Tabs>

      {tab === "custom" && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
          <TextField
            type="date"
            label="Desde"
            value={range.desde}
            onChange={handleChangeRange("desde")}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="Hasta"
            value={range.hasta}
            onChange={handleChangeRange("hasta")}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      )}

      {tab === "current" && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          Mostrando ventas del mes actual: {range.desde} a {range.hasta}
        </Typography>
      )}

      {isLoading && (
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <CircularProgress size={24} />
          <Typography>Cargando datos...</Typography>
        </Stack>
      )}

      {mergedError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {mergedError}
        </Alert>
      )}

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Cantidad de ventas</Typography>
            <Typography variant="h6">
              {resumen?.cantidad_ventas ?? 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Monto total</Typography>
            <Typography variant="h6">
              {formatCurrency(resumen?.monto_total ?? 0)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Aprobadas</Typography>
            <Typography variant="h6">
              {formatCurrency(resumen?.monto_aprobadas ?? 0)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Pendientes</Typography>
            <Typography variant="h6">
              {formatCurrency(resumen?.monto_pendientes ?? 0)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* DETALLE DE VENTAS */}
      <Typography variant="h6" mb={1}>
        Detalle de ventas
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        {ventas.length === 0 && !isLoading ? (
          <Box p={2}>
            <Typography variant="body2" color="text.secondary">
              No hay ventas en este rango de fechas.
            </Typography>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Vehículo</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Monto</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ventas.map((venta) => {
                const tienePlan = !!venta.id_plan;

                return (
                  <TableRow key={venta.id_venta_auto} hover>
                    <TableCell>{formatDate(venta.fecha)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {venta.nombre_cliente}
                      </Typography>
                      {venta.email && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {venta.email}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {venta.marca} {venta.modelo}
                      </Typography>
                      {venta.anio && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Año {venta.anio}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {tienePlan ? (
                        <Typography variant="body2">
                          {venta.cuotas ?? "-"} cuotas
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Sin plan
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={venta.estado_venta}
                        color={getEstadoColor(venta.estado_venta) as any}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(venta.total_pagado)}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenCuotas(venta)}
                        disabled={!tienePlan}
                      >
                        {tienePlan ? "Ver cuotas" : "Sin cuotas"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Typography variant="h6" mb={1}>
        Detalle de movimientos
      </Typography>

      <TableContainer component={Paper}>
        {movimientos.length === 0 && !isLoading ? (
          <Box p={2}>
            <Typography variant="body2" color="text.secondary">
              No hay movimientos en este rango de fechas.
            </Typography>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Método</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Venta</TableCell>
                <TableCell>Vehículo vendido</TableCell>
                <TableCell>Vehículo entregado</TableCell>
                <TableCell align="right">Monto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movimientos.map((mov) => (
                <TableRow key={mov.id_movimiento} hover>
                  <TableCell>{formatDate(mov.fecha)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={mov.tipo_movimiento}
                      color={getMovimientoColor(mov.tipo_movimiento) as any}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{mov.metodo}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {mov.nombre_cliente}
                    </Typography>
                    {mov.email && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {mov.email}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      #{mov.id_venta_auto}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {formatDate(mov.fecha_venta)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {mov.estado_venta}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {mov.marca_vehiculo_vendido} {mov.modelo_vehiculo_vendido}
                    </Typography>
                    {mov.anio_vehiculo_vendido && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Año {mov.anio_vehiculo_vendido}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {mov.id_vehiculo_entregado ? (
                      <>
                        <Typography variant="body2">
                          {mov.marca_vehiculo_usado}{" "}
                          {mov.modelo_vehiculo_usado}
                        </Typography>
                        {mov.anio_vehiculo_usado && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Año {mov.anio_vehiculo_usado}
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sin entrega
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(mov.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <SaleCuotasDialog
        open={cuotasOpen}
        onClose={handleCloseCuotas}
        sale={selectedSale}
      />
      <SaleCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </Box>
  );
};

export default SalesDashboard;
