// src/components/auth/RoleGuard.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/Auth";
import { Permission, canAccessPage, hasPermission, PagePermission, type Role } from "@/constants/permissions";
import { useEffect } from "react";

interface PermissionGuardProps {
  children: JSX.Element;
  requiredPermission?: Permission;
  requiredPageAccess?: PagePermission;
  fallbackRoute?: string;
}

export default function PermissionGuard({ 
  children, 
  requiredPermission,
  requiredPageAccess,
  fallbackRoute = "/" 
}: PermissionGuardProps) {
  const { isAuthenticated, user, isLoading, checkTokenValidity } = useAuth();
  const location = useLocation();

  // Check token validity on every page access
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      checkTokenValidity();
    }
  }, [location.pathname, isLoading, isAuthenticated, checkTokenValidity]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate 
      to="/loginforad" 
      replace 
      state={{ from: location.pathname + location.search }} 
    />;
  }

  // If no user data, redirect to login
  if (!user) {
    return <Navigate 
      to="/loginforad" 
      replace 
      state={{ from: location.pathname + location.search }} 
    />;
  }

  const userPermissions = user.permissions;

  // Check permission-based access
  if (requiredPermission) {
    if (!hasPermission(userPermissions, requiredPermission)) {
      // Redirect to user's default route based on their highest permission
      const redirectRoute = getDefaultRouteForUser(user);
      return <Navigate to={redirectRoute} replace />;
    }
  }

  // Check page-based access
  if (requiredPageAccess) {
    if (!canAccessPage(userPermissions, requiredPageAccess)) {
      // Redirect to user's default route based on their highest permission
      const redirectRoute = getDefaultRouteForUser(user);
      return <Navigate to={redirectRoute} replace />;
    }
  }

  return children;
}

// Helper function to get default route for a user
function getDefaultRouteForUser(user: any): string {
  const permissions = user.permissions || [];
  
  if (permissions.includes('Admin')) {
    return '/admin/dashboard';
  } else if (permissions.includes('Content Manager')) {
    return '/content/dashboard';
  } else if (permissions.includes('Consultant')) {
    return '/consultant';
  } else if (permissions.includes('Admission Official')) {
    return '/admission/students';
  } else {
    return '/profile';
  }
}

// Convenience components for specific permissions
export function AdminGuard({ children, fallbackRoute }: { children: JSX.Element; fallbackRoute?: string }) {
  return (
    <PermissionGuard requiredPermission="Admin" fallbackRoute={fallbackRoute}>
      {children}
    </PermissionGuard>
  );
}

export function ContentManagerGuard({ children, fallbackRoute }: { children: JSX.Element; fallbackRoute?: string }) {
  return (
    <PermissionGuard requiredPermission="Content Manager" fallbackRoute={fallbackRoute}>
      {children}
    </PermissionGuard>
  );
}

export function ConsultantGuard({ children, fallbackRoute }: { children: JSX.Element; fallbackRoute?: string }) {
  return (
    <PermissionGuard requiredPermission="Consultant" fallbackRoute={fallbackRoute}>
      {children}
    </PermissionGuard>
  );
}

export function AdmissionOfficerGuard({ children, fallbackRoute }: { children: JSX.Element; fallbackRoute?: string }) {
  return (
    <PermissionGuard requiredPermission="Admission Official" fallbackRoute={fallbackRoute}>
      {children}
    </PermissionGuard>
  );
}

// NOTE: StudentGuard kept functional but Student is not available for sidebar role switching
export function StudentGuard({ children, fallbackRoute }: { children: JSX.Element; fallbackRoute?: string }) {
  return (
    <PermissionGuard requiredPermission="Student" fallbackRoute={fallbackRoute}>
      {children}
    </PermissionGuard>
  );
}

// Legacy RoleGuard for backward compatibility
interface RoleGuardProps {
  children: JSX.Element;
  allowedRoles?: Role[];
  fallbackRoute?: string;
}

export function RoleGuard({ children, allowedRoles, fallbackRoute = "/" }: RoleGuardProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate 
      to="/loginforad" 
      replace 
      state={{ from: location.pathname + location.search }} 
    />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      const redirectRoute = getDefaultRouteForUser(user);
      return <Navigate to={redirectRoute} replace />;
    }
  }

  return children;
}

// Legacy convenience components that still work with roles but use permissions internally
export function StaffGuard({ children, fallbackRoute }: { children: JSX.Element; fallbackRoute?: string }) {
  const { user, isLoading } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const userPermissions = user?.permissions || [];
  
  // Staff = anyone who has any staff permissions (Admin, Content Manager, Admission Official, Consultant)
  const isStaff = userPermissions.some(p => 
    p === 'Admin' || p === 'Content Manager' || p === 'Admission Official' || p === 'Consultant'
  );
  
  if (!isStaff) {
    return <Navigate to="/profile" replace />;
  }
  
  return children;
}