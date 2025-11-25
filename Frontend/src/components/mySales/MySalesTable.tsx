import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
} from "@mui/material";
import type { Sale } from "../../services/salesService";

interface MySalesTableProps {
  ventas: Sale[];
  loading: boolean;
  error: string | null;
  onVerCuotas: (sale: Sale) => void;
}

const MySalesTable = ({
  ventas,
  loading,
  error,
  onVerCuotas,
}: MySalesTableProps) => {
  if (error) {
    return (
      <Paper
        elevation={0}
        sx={{ p: 2.5, borderRadius: 2, border: "1px solid rgba(0,0,0,0.06)" }}
      >
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{ p: 2.5, borderRadius: 2, border: "1px solid rgba(0,0,0,0.06)" }}
      >
        <Box
          sx={{
            py: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={24} />
        </Box>
      </Paper>
    );
  }

  if (!loading && ventas.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{ p: 2.5, borderRadius: 2, border: "1px solid rgba(0,0,0,0.06)" }}
      >
        <Typography variant="body2" color="text.secondary">
          Todavía no registramos compras a tu nombre en el rango seleccionado.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, borderRadius: 2, border: "1px solid rgba(0,0,0,0.06)" }}
    >
      <Typography variant="subtitle1" fontWeight={600} mb={2}>
        Mis compras
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Vehículo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Monto</TableCell>
              <TableCell align="right">Cuotas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ventas.map((venta) => {
              const labelEstado =
                venta.estado_venta === "APROBADA"
                  ? "Aprobada"
                  : venta.estado_venta === "PENDIENTE"
                  ? "Pendiente"
                  : "Rechazada";

              return (
                <TableRow key={venta.id_venta_auto}>
                  <TableCell>
                    {new Date(venta.fecha).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {venta.marca} {venta.modelo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {venta.anio ?? "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={labelEstado}
                      color={
                        venta.estado_venta === "APROBADA"
                          ? "success"
                          : venta.estado_venta === "PENDIENTE"
                          ? "warning"
                          : "default"
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    {venta.total_pagado.toLocaleString("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    })}
                  </TableCell>
                  <TableCell align="right">
                    {venta.id_plan ? (
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => onVerCuotas(venta)}
                      >
                        Ver cuotas
                      </Button>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default MySalesTable;
