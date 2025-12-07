"use client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[];
}

/**
 * ProtectedRoute - Simple wrapper component
 * Authentication and role-based access control is handled by middleware.ts
 * This component only serves as a placeholder for potential future client-side checks
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Middleware already handles all authentication and authorization checks
  // No need for client-side loading state or checks
  return <>{children}</>;
}

