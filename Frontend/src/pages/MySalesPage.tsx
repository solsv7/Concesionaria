import { useState } from "react";
import { Box, Grid, Stack, Typography } from "@mui/material";

import AppLayout from "../components/Layout/AppLayout";
import { useMySales } from "../hooks/useMySales";

import MySalesFilters from "../components/mySales/MySalesFilters";
import MySalesTable from "../components/mySales/MySalesTable";
import MyMovementsTable from "../components/mySales/MyMovementsTable";
import SaleCuotasDialog from "../components/sales/SaleCuotasDialog";

import type { Sale } from "../services/salesService";

const MySalesPage = () => {
  const {
    ventas,
    movimientos,
    loadingVentas,
    loadingMovimientos,
    errorVentas,
    errorMovimientos,
    range,
    setRangeField,
    reloadAll,
  } = useMySales({ autoLoad: true });

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [cuotasOpen, setCuotasOpen] = useState(false);

  const handleVerCuotas = (sale: Sale) => {
    setSelectedSale(sale);
    setCuotasOpen(true);
  };

  const handleCloseCuotas = () => {
    setCuotasOpen(false);
    setSelectedSale(null);
  };

  const anyLoading = loadingVentas || loadingMovimientos;

  return (
    <AppLayout>
      <Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          mb={3}
        >
          <Box>
            <Typography variant="h5" mb={0.5}>
              Mis compras
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aquí ves únicamente las compras y movimientos asociados a tu usuario.
            </Typography>
          </Box>

          <MySalesFilters
            range={range}
            onChangeField={setRangeField}
            onApply={reloadAll}
            disabled={anyLoading}
          />
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <MySalesTable
              ventas={ventas}
              loading={loadingVentas}
              error={errorVentas}
              onVerCuotas={handleVerCuotas}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <MyMovementsTable
              movimientos={movimientos}
              loading={loadingMovimientos}
              error={errorMovimientos}
            />
          </Grid>
        </Grid>

        <SaleCuotasDialog
          open={cuotasOpen}
          onClose={handleCloseCuotas}
          sale={selectedSale}
        />
      </Box>
    </AppLayout>
  );
};

export default MySalesPage;
