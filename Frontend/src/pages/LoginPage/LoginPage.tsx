import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../utils/roles";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Ingresá tu email y contraseña.");
      return;
    }

    try {
      setSubmitting(true);

      const user = await login(email, password);

      if (!user?.id_rol) {
        navigate("/", { replace: true });
        return;
      }

      switch (user.id_rol) {
        case ROLES.ADMIN:
          navigate("/admin", { replace: true });
          break;

        case ROLES.VENDEDOR:
          navigate("/vendedor", { replace: true });
          break;

        case ROLES.CONSULTA:
          navigate("/consulta", { replace: true });
          break;

        default:
          navigate("/", { replace: true });
      }
    } catch (err: any) {
      const backendMessage =
        err?.response?.data?.message || "No se pudo iniciar sesión.";
      setError(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        background:
          "linear-gradient(135deg, rgba(33,150,243,0.15), rgba(0,0,0,0.2))",
      }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: "100%",
          borderRadius: 4,
          boxShadow: 6,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{ mb: 1, fontWeight: 700, textAlign: "center" }}
          >
            Iniciar sesión
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, textAlign: "center" }}
          >
            Accedé al panel de la concesionaria con tu usuario y contraseña.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, py: 1.2, fontWeight: 600 }}
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={22} /> : "Ingresar"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
