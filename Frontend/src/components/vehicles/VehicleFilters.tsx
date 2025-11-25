import React from "react";
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Typography,
  Button,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SelectMUI, { SelectChangeEvent } from "@mui/material/Select";
import { useVehicleFilters } from "../../hooks/useVehicleFilters";
import type { VehicleSearchParams } from "../../services/vehicleService";

type FilterValues = Omit<VehicleSearchParams, "page" | "pageSize">;

interface VehicleFiltersProps {
  filters: FilterValues;
  onChangeFilters: (next: FilterValues) => void;
}

const VehicleFilters: React.FC<VehicleFiltersProps> = ({
  filters,
  onChangeFilters,
}) => {
  const {
    marcas,
    combustibles,
    anios,
    colores,
    tiposVehiculo,
    transmisiones,
    tracciones,
    direcciones,
  } = useVehicleFilters();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSelectNumber =
    (field: keyof FilterValues) => (event: SelectChangeEvent) => {
      const value = event.target.value;
      onChangeFilters({
        ...filters,
        [field]: value === "" ? undefined : Number(value),
      });
    };

  const handleSelectString =
    (field: keyof FilterValues) => (event: SelectChangeEvent) => {
      const value = event.target.value;
      onChangeFilters({
        ...filters,
        [field]: value === "" ? undefined : (value as any),
      });
    };

  const handleNumericChange =
    (field: keyof FilterValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      const num = raw === "" ? undefined : Number(raw);
      onChangeFilters({
        ...filters,
        [field]: Number.isNaN(num) ? undefined : num,
      });
    };

  const handleRadioNumber =
    (field: keyof FilterValues) =>
    (_event: React.ChangeEvent<HTMLInputElement>, value: string) => {
      onChangeFilters({
        ...filters,
        [field]: value === "" ? undefined : Number(value),
      });
    };

  const handleRadioString =
    (field: keyof FilterValues) =>
    (_event: React.ChangeEvent<HTMLInputElement>, value: string) => {
      onChangeFilters({
        ...filters,
        [field]: value === "" ? undefined : (value as any),
      });
    };

  const handleClear = () => onChangeFilters({});

  const mobileFilters = (
    <Box mb={3} p={2} borderRadius={2} bgcolor="background.paper" boxShadow={1}>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Marca</InputLabel>
            <SelectMUI
              label="Marca"
              value={filters.marca?.toString() ?? ""}
              onChange={handleSelectNumber("marca")}
            >
              <MenuItem value="">
                <em>Todas</em>
              </MenuItem>
              {marcas.map((m) => (
                <MenuItem key={m.id_marca} value={m.id_marca.toString()}>
                  {m.marca}
                </MenuItem>
              ))}
            </SelectMUI>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Combustible</InputLabel>
            <SelectMUI
              label="Combustible"
              value={filters.combustible?.toString() ?? ""}
              onChange={handleSelectNumber("combustible")}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {combustibles.map((c) => (
                <MenuItem
                  key={c.id_combustible}
                  value={c.id_combustible.toString()}
                >
                  {c.nombre}
                </MenuItem>
              ))}
            </SelectMUI>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Tipo</InputLabel>
            <SelectMUI
              label="Tipo"
              value={filters.esUsado?.toString() ?? ""}
              onChange={handleSelectNumber("esUsado")}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              <MenuItem value="0">0 km</MenuItem>
              <MenuItem value="1">Usado</MenuItem>
            </SelectMUI>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Origen</InputLabel>
            <SelectMUI
              label="Origen"
              value={filters.origen ?? ""}
              onChange={handleSelectString("origen")}
            >
              <MenuItem value="">
                <em>Todas</em>
              </MenuItem>
              <MenuItem value="AGENCIA">Agencia</MenuItem>
              <MenuItem value="USADO_CLIENTE">Usado cliente</MenuItem>
            </SelectMUI>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Color</InputLabel>
            <SelectMUI
              label="Color"
              value={filters.color?.toString() ?? ""}
              onChange={handleSelectNumber("color")}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {colores.map((c) => (
                <MenuItem key={c.id_color} value={c.id_color.toString()}>
                  {c.nombre}
                </MenuItem>
              ))}
            </SelectMUI>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Tipo vehículo</InputLabel>
            <SelectMUI
              label="Tipo vehículo"
              value={filters.tipoVehiculo?.toString() ?? ""}
              onChange={handleSelectNumber("tipoVehiculo")}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {tiposVehiculo.map((t) => (
                <MenuItem
                  key={t.id_tipo_vehiculo}
                  value={t.id_tipo_vehiculo.toString()}
                >
                  {t.nombre}
                </MenuItem>
              ))}
            </SelectMUI>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Transmisión</InputLabel>
            <SelectMUI
              label="Transmisión"
              value={filters.transmision?.toString() ?? ""}
              onChange={handleSelectNumber("transmision")}
            >
              <MenuItem value="">
                <em>Todas</em>
              </MenuItem>
              {transmisiones.map((t) => (
                <MenuItem
                  key={t.id_transmision}
                  value={t.id_transmision.toString()}
                >
                  {t.nombre}
                </MenuItem>
              ))}
            </SelectMUI>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Tracción</InputLabel>
            <SelectMUI
              label="Tracción"
              value={filters.traccion?.toString() ?? ""}
              onChange={handleSelectNumber("traccion")}
            >
              <MenuItem value="">
                <em>Todas</em>
              </MenuItem>
              {tracciones.map((t) => (
                <MenuItem
                  key={t.id_traccion}
                  value={t.id_traccion.toString()}
                >
                  {t.nombre}
                </MenuItem>
              ))}
            </SelectMUI>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="KM mín."
            type="number"
            size="small"
            fullWidth
            value={filters.kmMin ?? ""}
            onChange={handleNumericChange("kmMin")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="KM máx."
            type="number"
            size="small"
            fullWidth
            value={filters.kmMax ?? ""}
            onChange={handleNumericChange("kmMax")}
          />
        </Grid>

        {/* Puertas */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Puertas"
            type="number"
            size="small"
            fullWidth
            value={filters.puertas ?? ""}
            onChange={handleNumericChange("puertas")}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Dirección</InputLabel>
            <SelectMUI
              label="Dirección"
              value={filters.direccion?.toString() ?? ""}
              onChange={handleSelectNumber("direccion")}
            >
              <MenuItem value="">
                <em>Todas</em>
              </MenuItem>
              {direcciones.map((d) => (
                <MenuItem
                  key={d.id_direccion}
                  value={d.id_direccion.toString()}
                >
                  {d.nombre}
                </MenuItem>
              ))}
            </SelectMUI>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Precio mín."
            type="number"
            size="small"
            fullWidth
            value={filters.precioMin ?? ""}
            onChange={handleNumericChange("precioMin")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Precio máx."
            type="number"
            size="small"
            fullWidth
            value={filters.precioMax ?? ""}
            onChange={handleNumericChange("precioMax")}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Año mín."
            type="number"
            size="small"
            fullWidth
            value={filters.anioMin ?? ""}
            onChange={handleNumericChange("anioMin")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Año máx."
            type="number"
            size="small"
            fullWidth
            value={filters.anioMax ?? ""}
            onChange={handleNumericChange("anioMax")}
          />
        </Grid>

        <Grid item xs={12} mt={1}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Ajustá los filtros para refinar la búsqueda.
            </Typography>
            <Button variant="text" onClick={handleClear}>
              Limpiar filtros
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  const desktopFilters = (
    <Box
      mb={3}
      p={2.5}
      borderRadius={2}
      bgcolor="background.paper"
      boxShadow={1}
    >
      <Typography variant="h6" mb={2}>
        Filtros
      </Typography>

      {/* Marca */}
      <Box mb={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Marca</InputLabel>
          <SelectMUI
            label="Marca"
            value={filters.marca?.toString() ?? ""}
            onChange={handleSelectNumber("marca")}
          >
            <MenuItem value="">
              <em>Todas</em>
            </MenuItem>
            {marcas.map((m) => (
              <MenuItem key={m.id_marca} value={m.id_marca.toString()}>
                {m.marca}
              </MenuItem>
            ))}
          </SelectMUI>
        </FormControl>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Tipo 0km / usado */}
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel>Tipo</FormLabel>
        <RadioGroup
          value={filters.esUsado?.toString() ?? ""}
          onChange={handleRadioNumber("esUsado")}
        >
          <FormControlLabel
            value=""
            control={<Radio size="small" />}
            label="Todos"
          />
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
      </FormControl>

      {/* Origen */}
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel>Origen</FormLabel>
        <RadioGroup
          value={filters.origen ?? ""}
          onChange={handleRadioString("origen")}
        >
          <FormControlLabel
            value=""
            control={<Radio size="small" />}
            label="Todos"
          />
          <FormControlLabel
            value="AGENCIA"
            control={<Radio size="small" />}
            label="Agencia"
          />
          <FormControlLabel
            value="USADO_CLIENTE"
            control={<Radio size="small" />}
            label="Usado cliente"
          />
        </RadioGroup>
      </FormControl>

      <Divider sx={{ my: 1.5 }} />

      {/* Combustible */}
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel>Combustible</FormLabel>
        <RadioGroup
          value={filters.combustible?.toString() ?? ""}
          onChange={handleRadioNumber("combustible")}
        >
          <FormControlLabel
            value=""
            control={<Radio size="small" />}
            label="Todos"
          />
          {combustibles.map((c) => (
            <FormControlLabel
              key={c.id_combustible}
              value={c.id_combustible.toString()}
              control={<Radio size="small" />}
              label={c.nombre}
            />
          ))}
        </RadioGroup>
      </FormControl>

      {/* Transmisión */}
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel>Transmisión</FormLabel>
        <RadioGroup
          value={filters.transmision?.toString() ?? ""}
          onChange={handleRadioNumber("transmision")}
        >
          <FormControlLabel
            value=""
            control={<Radio size="small" />}
            label="Todas"
          />
          {transmisiones.map((t) => (
            <FormControlLabel
              key={t.id_transmision}
              value={t.id_transmision.toString()}
              control={<Radio size="small" />}
              label={t.nombre}
            />
          ))}
        </RadioGroup>
      </FormControl>

      {/* Tracción */}
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel>Tracción</FormLabel>
        <RadioGroup
          value={filters.traccion?.toString() ?? ""}
          onChange={handleRadioNumber("traccion")}
        >
          <FormControlLabel
            value=""
            control={<Radio size="small" />}
            label="Todas"
          />
          {tracciones.map((t) => (
            <FormControlLabel
              key={t.id_traccion}
              value={t.id_traccion.toString()}
              control={<Radio size="small" />}
              label={t.nombre}
            />
          ))}
        </RadioGroup>
      </FormControl>

      <Divider sx={{ my: 1.5 }} />

      {/* Color */}
      <Box mb={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Color</InputLabel>
          <SelectMUI
            label="Color"
            value={filters.color?.toString() ?? ""}
            onChange={handleSelectNumber("color")}
          >
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            {colores.map((c) => (
              <MenuItem key={c.id_color} value={c.id_color.toString()}>
                {c.nombre}
              </MenuItem>
            ))}
          </SelectMUI>
        </FormControl>
      </Box>

      {/* Tipo vehículo */}
      <Box mb={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Tipo vehículo</InputLabel>
          <SelectMUI
            label="Tipo vehículo"
            value={filters.tipoVehiculo?.toString() ?? ""}
            onChange={handleSelectNumber("tipoVehiculo")}
          >
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            {tiposVehiculo.map((t) => (
              <MenuItem
                key={t.id_tipo_vehiculo}
                value={t.id_tipo_vehiculo.toString()}
              >
                {t.nombre}
              </MenuItem>
            ))}
          </SelectMUI>
        </FormControl>
      </Box>

      {/* Dirección */}
      <Box mb={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Dirección</InputLabel>
          <SelectMUI
            label="Dirección"
            value={filters.direccion?.toString() ?? ""}
            onChange={handleSelectNumber("direccion")}
          >
            <MenuItem value="">
              <em>Todas</em>
            </MenuItem>
            {direcciones.map((d) => (
              <MenuItem
                key={d.id_direccion}
                value={d.id_direccion.toString()}
              >
                {d.nombre}
              </MenuItem>
            ))}
          </SelectMUI>
        </FormControl>
      </Box>

      {/* RANGOS: Km, Precio, Año, Puertas */}
      <Box mb={2}>
        <FormLabel>Kilometraje</FormLabel>
        <Box display="flex" gap={1} mt={1}>
          <TextField
            placeholder="Mínimo"
            type="number"
            size="small"
            fullWidth
            value={filters.kmMin ?? ""}
            onChange={handleNumericChange("kmMin")}
          />
          <TextField
            placeholder="Máximo"
            type="number"
            size="small"
            fullWidth
            value={filters.kmMax ?? ""}
            onChange={handleNumericChange("kmMax")}
          />
        </Box>
      </Box>

      <Box mb={2}>
        <FormLabel>Precio</FormLabel>
        <Box display="flex" gap={1} mt={1}>
          <TextField
            placeholder="Mínimo"
            type="number"
            size="small"
            fullWidth
            value={filters.precioMin ?? ""}
            onChange={handleNumericChange("precioMin")}
          />
          <TextField
            placeholder="Máximo"
            type="number"
            size="small"
            fullWidth
            value={filters.precioMax ?? ""}
            onChange={handleNumericChange("precioMax")}
          />
        </Box>
      </Box>

      <Box mb={2}>
        <FormLabel>Año</FormLabel>
        <Box display="flex" gap={1} mt={1}>
          <TextField
            placeholder="Mínimo"
            type="number"
            size="small"
            fullWidth
            value={filters.anioMin ?? ""}
            onChange={handleNumericChange("anioMin")}
          />
          <TextField
            placeholder="Máximo"
            type="number"
            size="small"
            fullWidth
            value={filters.anioMax ?? ""}
            onChange={handleNumericChange("anioMax")}
          />
        </Box>
      </Box>

      <Box mb={2}>
        <FormLabel>Puertas</FormLabel>
        <TextField
          placeholder="Cantidad"
          type="number"
          size="small"
          fullWidth
          value={filters.puertas ?? ""}
          onChange={handleNumericChange("puertas")}
          sx={{ mt: 1 }}
        />
      </Box>

      <Box display="flex" justifyContent="space-between" mt={2}>
        <Typography variant="body2" color="text.secondary">
          Ajustá los filtros para refinar la búsqueda.
        </Typography>
        <Button variant="text" onClick={handleClear}>
          Limpiar filtros
        </Button>
      </Box>
    </Box>
  );

  return isMobile ? mobileFilters : desktopFilters;
};

export default VehicleFilters;
