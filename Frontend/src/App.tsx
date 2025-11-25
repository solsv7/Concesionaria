import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { Box, CircularProgress } from "@mui/material";

import LoginPage from "./pages/LoginPage/LoginPage";
import AdminPage from "./pages/AdminPage/AdminPage";
import VendedorPage from "./pages/VendedorPage/VendedorPage";
import ConsultaPage from "./pages/ConsultaPage/ConsultaPage";
import SalesPage from "./pages/SalesPage";
import MySalesPage from "./pages/MySalesPage";
import PublicVehiclesPage from "./pages/PublicVehiclesPage/PublicVehiclesPage";
import { ROLES } from "./utils/roles";

function FullScreenLoader() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );
}

interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RoleRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.id_rol) {
    case ROLES.ADMIN:
      return <Navigate to="/admin" replace />;
    case ROLES.VENDEDOR:
      return <Navigate to="/vendedor" replace />;
    case ROLES.CONSULTA:
      return <Navigate to="/consulta" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

interface RoleProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles: (number | string)[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.id_rol)) {
    return <Navigate to="/panel" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<PublicVehiclesPage />} />

      <Route path="/panel" element={<RoleRedirect />} />

      <Route
        path="/admin"
        element={
          <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/vendedor"
        element={
          <RoleProtectedRoute
            allowedRoles={[ROLES.ADMIN, ROLES.VENDEDOR]}
          >
            <VendedorPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/consulta"
        element={
          <PrivateRoute>
            <ConsultaPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/sales"
        element={
          <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.VENDEDOR]}>
            <SalesPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/mis-compras"
        element={
          <PrivateRoute>
            <MySalesPage />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
