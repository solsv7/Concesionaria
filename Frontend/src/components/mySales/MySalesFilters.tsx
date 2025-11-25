import { Stack, TextField, Button } from "@mui/material";
import type { SalesDateRange } from "../../services/salesService";

interface MySalesFiltersProps {
  range: SalesDateRange;
  onChangeField: (field: "desde" | "hasta", value: string) => void;
  onApply: () => void;
  disabled?: boolean;
}

const MySalesFilters = ({
  range,
  onChangeField,
  onApply,
  disabled,
}: MySalesFiltersProps) => {
  return (
    <Stack direction="row" spacing={2}>
      <TextField
        label="Desde"
        type="date"
        size="small"
        value={range.desde}
        onChange={(e) => onChangeField("desde", e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Hasta"
        type="date"
        size="small"
        value={range.hasta}
        onChange={(e) => onChangeField("hasta", e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <Button
        variant="outlined"
        size="small"
        onClick={onApply}
        disabled={disabled}
      >
        Aplicar
      </Button>
    </Stack>
  );
};

export default MySalesFilters;
