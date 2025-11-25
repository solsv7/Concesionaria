
export const ROLES = {
  ADMIN: 1,
  VENDEDOR: 2,
  CONSULTA: 3,
} as const;

export type RoleId = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<RoleId, string> = {
  [ROLES.ADMIN]: "Administrador",
  [ROLES.VENDEDOR]: "Vendedor",
  [ROLES.CONSULTA]: "Consulta",
};

type UserWithRole = {
  id_rol?: number | string | null;
};

export function userCanManageVehicles(user?: UserWithRole): boolean {
  if (!user?.id_rol && user?.id_rol !== 0) return false;
  const role = Number(user.id_rol);
  return role === ROLES.ADMIN || role === ROLES.VENDEDOR;
}

export function isAdmin(user?: UserWithRole): boolean {
  if (!user?.id_rol && user?.id_rol !== 0) return false;
  return Number(user.id_rol) === ROLES.ADMIN;
}

export function isVendedor(user?: UserWithRole): boolean {
  if (!user?.id_rol && user?.id_rol !== 0) return false;
  return Number(user.id_rol) === ROLES.VENDEDOR;
}

export function isConsulta(user?: UserWithRole): boolean {
  if (!user?.id_rol && user?.id_rol !== 0) return false;
  return Number(user.id_rol) === ROLES.CONSULTA;
}
