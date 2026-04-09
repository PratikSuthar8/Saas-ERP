export const ROLE_HIERARCHY = {
  ADMIN: 3,
  MANAGER: 2,
  EMPLOYEE: 1,
};

export const hasMinimumRole = (
  userRoles: string[],
  requiredRole: string
) => {
  const highestUserRole = Math.max(
    ...userRoles.map(role => ROLE_HIERARCHY[role] || 0)
  );

  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;

  return highestUserRole >= requiredLevel;
};
