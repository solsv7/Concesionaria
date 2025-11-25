import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Pagination,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useState } from "react";
import { useVehicles } from "../../hooks/useVehicles";
import VehicleCard from "./VehicleCard";
import VehicleFilters from "./VehicleFilters";
import VehicleDetailDialog from "./VehicleDetailDialog";
import { VehicleEditDialog } from "./VehicleEditDialog";
import { ConfirmDialog } from "../common/ConfirmDialog";
import type { VehicleSearchParams } from "../../services/vehicleService";
import { useAuth } from "../../hooks/useAuth";
import SaleCreateDialog from "../sales/SaleCreateDialog";
import { useNavigate, useLocation } from "react-router-dom";

interface VehicleListProps {
  canManage?: boolean;
}

const VehicleList: React.FC<VehicleListProps> = ({ canManage = false }) => {
  const {
    vehicles,
    loading,
    error,
    total,
    page,
    pageSize,
    setPage,
    setPageSize,
    filters,
    setFilters,
    refresh,
    deleteVehicle,
  } = useVehicles({
    initialPage: 1,
    initialPageSize: 12,
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null
  );
  const [detailOpen, setDetailOpen] = useState(false);

  const [editVehicleId, setEditVehicleId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const [deleteVehicleId, setDeleteVehicleId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [saleVehicleId, setSaleVehicleId] = useState<number | null>(null);
  const [saleOpen, setSaleOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<string>) => {
    const newSize = Number(event.target.value);
    setPageSize(newSize);
  };

  const handleOpenDetail = (id: number) => {
    setSelectedVehicleId(id);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedVehicleId(null);
  };

  const handleEditClick = (id: number) => {
    setEditVehicleId(id);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditVehicleId(null);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteVehicleId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteVehicleId == null) return;
    await deleteVehicle(deleteVehicleId);
    setDeleteConfirmOpen(false);
    setDeleteVehicleId(null);
  };

  const handleOpenSale = (vehicleId: number) => {
    if (!user) {
      navigate("/login", {
        state: { from: location.pathname },
        replace: true,
      });
      return;
    }

    setSaleVehicleId(vehicleId);
    setSaleOpen(true);
  };

  const handleCloseSale = () => {
    setSaleOpen(false);
    setSaleVehicleId(null);
  };

  const handleSaleCreated = () => {
    setSaleOpen(false);
    setSaleVehicleId(null);
    refresh();
  };

  const handleFiltersChange = (
    newFilters: Omit<VehicleSearchParams, "page" | "pageSize">
  ) => {
    setFilters(newFilters);
  };

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <>
      <Box
        sx={{
          width: "100%",
          mt: 2,
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            {isMobile ? (
              <Box mb={2}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => setShowMobileFilters((prev) => !prev)}
                  fullWidth
                >
                  {showMobileFilters ? "Ocultar filtros" : "Mostrar filtros"}
                </Button>
                {showMobileFilters && (
                  <Box mt={2}>
                    <VehicleFilters
                      filters={filters}
                      onChangeFilters={handleFiltersChange}
                    />
                  </Box>
                )}
              </Box>
            ) : (
              <VehicleFilters filters={filters} onChangeFilters={handleFiltersChange} />
            )}
          </Grid>

          {/* LISTA DE VEHÍCULOS */}
          <Grid item xs={12} md={9}>
            <Stack spacing={2}>
              {error && (
                <Alert severity="error">
                  {error || "No se pudieron cargar los vehículos."}
                </Alert>
              )}

              {loading && !vehicles.length ? (
                <Box
                  sx={{
                    py: 6,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : vehicles.length === 0 ? (
                <Typography variant="body1">
                  No se encontraron vehículos con los filtros seleccionados.
                </Typography>
              ) : (
                <>
                  <Grid
                    container
                    spacing={{ xs: 2, sm: 3 }}
                    sx={{
                      width: "100%",
                      "& > .MuiGrid-item": {
                        px: { xs: 0, sm: 1.5 },
                      },
                    }}
                  >
                    {vehicles.map((v) => (
                      <Grid
                        item
                        key={v.id_vehiculo}
                        xs={12}
                        sm={6}
                        md={6}
                        lg={4}
                      >
                        <VehicleCard
                          vehicle={v}
                          onClick={() => handleOpenDetail(v.id_vehiculo)}
                          showActions={canManage}
                          onEdit={
                            canManage
                              ? () => handleEditClick(v.id_vehiculo)
                              : undefined
                          }
                          onDelete={
                            canManage
                              ? () => handleDeleteClick(v.id_vehiculo)
                              : undefined
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>

                  {/* Paginación y selector de cantidad */}
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap="wrap"
                    gap={2}
                  >
                    <Typography variant="body2">
                      Mostrando {start}–{end} de {total} vehículos
                    </Typography>

                    <Box display="flex" alignItems="center" gap={2}>
                      <FormControl size="small">
                        <InputLabel id="page-size-label">Por página</InputLabel>
                        <Select
                          labelId="page-size-label"
                          value={String(pageSize)}
                          label="Por página"
                          onChange={handlePageSizeChange}
                          sx={{ minWidth: 90 }}
                        >
                          <MenuItem value="6">6</MenuItem>
                          <MenuItem value="12">12</MenuItem>
                          <MenuItem value="24">24</MenuItem>
                        </Select>
                      </FormControl>

                      <Pagination
                        count={Math.max(1, Math.ceil(total / pageSize))}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        shape="rounded"
                      />
                    </Box>
                  </Box>
                </>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Detalle en modal (para todos) */}
      <VehicleDetailDialog
        open={detailOpen}
        vehicleId={selectedVehicleId}
        onClose={handleCloseDetail}
        onBuy={handleOpenSale}
      />

      {/* Dialog de compra (solo si hay user logueado) */}
      {user && (
        <SaleCreateDialog
          open={saleOpen}
          onClose={handleCloseSale}
          onCreated={handleSaleCreated}
          defaultVehicleId={saleVehicleId}
          defaultUserId={user.id_usuario}
        />
      )}

      {/* Edición y eliminación solo si puede gestionar */}
      {canManage && (
        <>
          <VehicleEditDialog
            open={editOpen}
            vehicleId={editVehicleId}
            onClose={handleEditClose}
            onSaved={refresh}
          />

          <ConfirmDialog
            open={deleteConfirmOpen}
            onClose={() => setDeleteConfirmOpen(false)}
            onConfirm={handleConfirmDelete}
            title="Eliminar vehículo"
            description="¿Confirmás que querés eliminar este vehículo? Esta acción no se puede deshacer."
            confirmLabel="Sí, eliminar"
          />
        </>
      )}
    </>
  );
};

export default VehicleList;
