import {
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Typography,
  CardActionArea,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { Vehicle } from "../../types/vehicle";

interface Props {
  vehicle: Vehicle;
  onClick?: () => void;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const VehicleCard: React.FC<Props> = ({
  vehicle,
  onClick,
  showActions = false,
  onEdit,
  onDelete,
}) => {
  const {
    marca,
    modelo,
    anio,
    precio,
    combustible,
    imagen,
    es_usado,
    origen,
    km,
    color,
    tipo_vehiculo,
    transmision,
  } = vehicle as any;

  const parsedPrecio =
    typeof precio === "string" ? Number(precio) : (precio as number | undefined);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit && onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete && onDelete();
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: (theme) => theme.shadows[1],
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          "&:hover .vehicle-image": {
            transform: "scale(1.05)",
          },
        }}
      >
        {imagen && (
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            <CardMedia
              component="img"
              image={imagen}
              alt={`${marca} ${modelo}`}
              className="vehicle-image"
              sx={{
                width: "100%",
                height: { xs: 180, sm: 200 },
                objectFit: "cover",
                borderRadius: 2,
                transition: "transform 0.3s ease",
              }}
            />
          </Box>
        )}

        <CardContent
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            px: 2.25,
            py: 2,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ textTransform: "uppercase", fontSize: 12 }}
              >
                {marca}
              </Typography>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {modelo}
              </Typography>
              {anio && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.25 }}
                >
                  Año {anio}
                </Typography>
              )}
            </Box>

            {parsedPrecio && !Number.isNaN(parsedPrecio) && (
              <Box
                sx={{
                  pl: 1.5, 
                  ml: 0.5,
                  minWidth: 0,
                  maxWidth: "45%",
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="subtitle1"
                  color="primary"
                  sx={{
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textAlign: "right",
                    fontSize: { xs: "0.95rem", sm: "1.05rem" },
                  }}
                  title={`$${parsedPrecio.toLocaleString("es-AR")}`}
                >
                  ${parsedPrecio.toLocaleString("es-AR")}
                </Typography>
              </Box>
            )}
          </Stack>

          <Stack
            direction="row"
            spacing={0.75}
            mt={1}
            flexWrap="wrap"
            rowGap={0.75}
          >
            {typeof es_usado !== "undefined" && (
              <Chip
                size="small"
                label={es_usado ? "Usado" : "0 km"}
                color={es_usado ? "default" : "primary"}
                sx={{ borderRadius: 999 }}
              />
            )}
            {combustible && (
              <Chip
                size="small"
                label={combustible}
                sx={{ borderRadius: 999 }}
              />
            )}
            {origen && (
              <Chip
                size="small"
                variant="outlined"
                label={origen}
                sx={{ borderRadius: 999 }}
              />
            )}
            {typeof km === "number" && (
              <Chip
                size="small"
                variant="outlined"
                label={`${km.toLocaleString("es-AR")} km`}
                sx={{ borderRadius: 999 }}
              />
            )}
            {color && (
              <Chip
                size="small"
                variant="outlined"
                label={color}
                sx={{ borderRadius: 999 }}
              />
            )}
            {tipo_vehiculo && (
              <Chip
                size="small"
                variant="outlined"
                label={tipo_vehiculo}
                sx={{ borderRadius: 999 }}
              />
            )}
            {transmision && (
              <Chip
                size="small"
                variant="outlined"
                label={transmision}
                sx={{ borderRadius: 999 }}
              />
            )}
          </Stack>
        </CardContent>
      </CardActionArea>

      {showActions && (
        <Box
          sx={{
            p: 1.5,
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          {onEdit && (
            <Tooltip title="Editar">
              <IconButton
                size="small"
                onClick={handleEditClick}
                sx={{
                  bgcolor: "background.paper",
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Eliminar">
              <IconButton
                size="small"
                onClick={handleDeleteClick}
                sx={{
                  bgcolor: "background.paper",
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Card>
  );
};

export default VehicleCard;
