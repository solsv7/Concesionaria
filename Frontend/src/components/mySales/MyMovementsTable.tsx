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
} from "@mui/material";
import type { Movimiento } from "../../services/salesService";

interface MyMovementsTableProps {
  movimientos: Movimiento[];
  loading: boolean;
  error: string | null;
}

const MyMovementsTable = ({
  movimientos,
  loading,
  error,
}: MyMovementsTableProps) => {
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

  if (!loading && movimientos.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{ p: 2.5, borderRadius: 2, border: "1px solid rgba(0,0,0,0.06)" }}
      >
        <Typography variant="body2" color="text.secondary">
          No hay movimientos registrados a tu nombre en el rango seleccionado.
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
        Mis movimientos
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Método</TableCell>
              <TableCell align="right">Monto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movimientos.map((mov) => (
              <TableRow key={mov.id_movimiento}>
                <TableCell>
                  {new Date(mov.fecha).toLocaleString("es-AR")}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={mov.tipo_movimiento} />
                </TableCell>
                <TableCell>{mov.metodo}</TableCell>
                <TableCell align="right">
                  {mov.total.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default MyMovementsTable;
