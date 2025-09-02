import React, { ReactNode } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Permission, UserRole } from '../../auth/types';
import { useSecurityTheme } from '../../theme/ThemeProvider';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: Permission;
  requiredRole?: UserRole;
  requiredPermissions?: Permission[];
  fallback?: ReactNode;
}

// Access Denied Component
const AccessDenied: React.FC = () => {
  const theme = useSecurityTheme();
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: theme.colors.background.primary,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily,
    }}>
      <div style={{
        backgroundColor: theme.colors.background.surface,
        padding: theme.spacing.xl,
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.border.primary}`,
        textAlign: 'center',
        maxWidth: '400px',
      }}>
        <div style={{
          fontSize: '48px',
          color: theme.colors.status.critical,
          marginBottom: theme.spacing.md,
        }}>
          🚫
        </div>
        <h2 style={{
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          margin: `0 0 ${theme.spacing.md} 0`,
          color: theme.colors.text.primary,
        }}>
          Access Denied
        </h2>
        <p style={{
          fontSize: theme.typography.fontSize.md,
          color: theme.colors.text.secondary,
          margin: 0,
          lineHeight: 1.5,
        }}>
          You don't have the required permissions to access this area of the security system.
        </p>
      </div>
    </div>
  );
};

// Loading Component
const AuthLoading: React.FC = () => {
  const theme = useSecurityTheme();
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: theme.colors.background.primary,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily,
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: theme.spacing.md,
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `3px solid ${theme.colors.border.primary}`,
          borderTop: `3px solid ${theme.colors.primary.main}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{
          fontSize: theme.typography.fontSize.md,
          color: theme.colors.text.secondary,
          margin: 0,
        }}>
          Authenticating...
        </p>
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

// Protected Route Component
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  requiredPermissions,
  fallback = <AccessDenied />,
}) => {
  const { authState, hasPermission, hasRole, hasAnyPermission } = useAuth();

  // Show loading while authentication is being checked
  if (authState.isLoading) {
    return <AuthLoading />;
  }

  // Redirect to login if not authenticated
  if (!authState.isAuthenticated || !authState.user) {
    // In a real app, this would redirect to login page
    return (<div>Please log in to access the security system.</div>);
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  // Check single permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions requirement (user must have at least one)
  if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
    return <>{fallback}</>;
  }

  // All checks passed, render children
  return <>{children}</>;
};

// Higher-order component for permission-based rendering
interface WithPermissionProps {
  permission?: Permission;
  role?: UserRole;
  permissions?: Permission[];
  fallback?: ReactNode;
  children: ReactNode;
}

export const WithPermission: React.FC<WithPermissionProps> = ({
  permission,
  role,
  permissions,
  fallback = null,
  children,
}) => {
  const { hasPermission, hasRole, hasAnyPermission } = useAuth();

  // Check role requirement
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  // Check single permission requirement
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions requirement
  if (permissions && !hasAnyPermission(permissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};