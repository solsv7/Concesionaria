import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../../utils/roles";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const canSeeSales =
    !!user &&
    (user.id_rol === ROLES.ADMIN || user.id_rol === ROLES.VENDEDOR);

  const handleGoHome = () => {
    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    switch (user.id_rol) {
      case ROLES.ADMIN:
        navigate("/admin");
        break;
      case ROLES.VENDEDOR:
        navigate("/vendedor");
        break;
      default:
        navigate("/consulta");
        break;
    }
  };

  const handleLoginClick = () => {
    navigate("/login", { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          borderBottom: "1px solid rgba(0,0,0,0.1)",
          bgcolor: "primary.main",
        }}
      >
        <Toolbar
          sx={{
            width: "100%",
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 1.2, sm: 1.5 },
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: { xs: 1, sm: 0 },
          }}
        >
          <Typography
            variant="h6"
            onClick={handleGoHome}
            sx={{
              fontWeight: 600,
              fontSize: { xs: "1rem", sm: "1.15rem" },
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              userSelect: "none",
              "&:hover": {
                opacity: 0.85,
              },
            }}
          >
            Concesionaria
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              width: { xs: "100%", sm: "auto" },
              justifyContent: { xs: "space-between", sm: "flex-end" },
              alignItems: "center",
            }}
          >
            {/* Botón Ventas: solo Admin y Vendedor */}
            {canSeeSales && (
              <Button
                color="inherit"
                variant="contained"
                onClick={() => navigate("/sales")}
                sx={{
                  textTransform: "none",
                  fontSize: "0.8rem",
                  px: 2,
                  py: 0.4,
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.16)",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.25)",
                    boxShadow: "none",
                  },
                }}
              >
                Ventas
              </Button>
            )}

            {/* ⭐ NUEVO: Mis compras (visible para cualquier usuario logueado) */}
            {user && (
              <Button
                color="inherit"
                variant="contained"
                onClick={() => navigate("/mis-compras")}
                sx={{
                  textTransform: "none",
                  fontSize: "0.8rem",
                  px: 2,
                  py: 0.4,
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.16)",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.25)",
                    boxShadow: "none",
                  },
                }}
              >
                Mis compras
              </Button>
            )}

            {user && (
              <Typography
                noWrap
                sx={{
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  color: "primary.contrastText",
                  maxWidth: 160,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={user.nombre}
              >
                {user.nombre}
              </Typography>
            )}

            {user ? (
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleLogout}
                sx={{
                  textTransform: "none",
                  fontSize: "0.8rem",
                  px: 2,
                  py: 0.4,
                  borderRadius: 2,
                  borderColor: "rgba(255,255,255,0.7)",
                  "&:hover": {
                    borderColor: "#fff",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Logout
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleLoginClick}
                sx={{
                  textTransform: "none",
                  fontSize: "0.8rem",
                  px: 2,
                  py: 0.4,
                  borderRadius: 2,
                  borderColor: "rgba(255,255,255,0.7)",
                  "&:hover": {
                    borderColor: "#fff",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Login
              </Button>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: 1300,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
