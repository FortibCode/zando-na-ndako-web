"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";

/**
 * Vérifie qu'un permission string donné est présent chez l'admin connecté (super_admin => accès
 * total via le wildcard "*", cohérent avec User::getPermissions() côté Laravel).
 */
export function usePermission(permission: string): boolean {
  const { user } = useAuth();
  const perms = user?.administrateur?.permissions ?? [];
  return perms.includes("*") || perms.includes(permission);
}

export function useHasRole(role: string): boolean {
  const { user } = useAuth();
  if (!user) return false;
  if (user.administrateur?.role_admin === "super_admin") return true;
  return user.roles?.includes(role) ?? false;
}

export function useIsSuperAdmin(): boolean {
  return useHasRole("super_admin");
}

/**
 * Masque son contenu si l'admin connecté n'a pas la permission (ou le rôle) requis. Purement
 * cosmétique côté front — la vraie garde reste le middleware `permission:`/`role:` Laravel.
 */
export function RequirePermission({
  permission,
  role,
  fallback = null,
  children,
}: {
  permission?: string;
  role?: string;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const hasPermission = usePermission(permission ?? "");
  const hasRole = useHasRole(role ?? "");
  const allowed = permission ? hasPermission : role ? hasRole : true;
  return allowed ? children : fallback;
}
