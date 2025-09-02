import React, { useState } from 'react';
import { SecurityThemeProvider } from '../../theme';
import { AuthProvider, useAuth, LoginForm, ProtectedRoute, WithPermission } from '../../auth';
import { Permission, UserRole } from '../../auth/types';
import { useSecurityTheme } from '../../theme/ThemeProvider';

// Demo Dashboard Component
const DemoDashboard: React.FC = () => {
  const theme = useSecurityTheme();
  const { authState, logout, hasPermission, hasRole } = useAuth();

  const cardStyle: React.CSSProperties = {
    backgroundColor: theme.colors.background.surface,
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  };

  const buttonStyle: React.CSSProperties = {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.primary.contrast,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  };

  return (
    <div style={{
      padding: theme.spacing.xl,
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        ...cardStyle,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
      }}>
        <div>
          <h1 style={{
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            margin: 0,
          }}>
            Security System Dashboard
          </h1>
          <p style={{
            fontSize: theme.typography.fontSize.md,
            color: theme.colors.text.secondary,
            margin: `${theme.spacing.sm} 0 0 0`,
          }}>
            Welcome, {authState.user?.firstName} {authState.user?.lastName}
          </p>
        </div>
        <button
          onClick={logout}
          style={{
            ...buttonStyle,
            backgroundColor: theme.colors.status.critical,
          }}
        >
          Logout
        </button>
      </div>

      {/* User Info Card */}
      <div style={cardStyle}>
        <h2 style={{
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.md,
        }}>
          User Information
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: theme.spacing.md,
        }}>
          <div>
            <strong>Username:</strong> {authState.user?.username}
          </div>
          <div>
            <strong>Role:</strong> {authState.user?.role.replace('_', ' ').toUpperCase()}
          </div>
          <div>
            <strong>Email:</strong> {authState.user?.email}
          </div>
          <div>
            <strong>Status:</strong> 
            <span style={{
              color: authState.user?.isActive ? theme.colors.status.normal : theme.colors.status.offline,
              marginLeft: theme.spacing.sm,
            }}>
              {authState.user?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Permissions Demo */}
      <div style={cardStyle}>
        <h2 style={{
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.md,
        }}>
          Permission-Based Features
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: theme.spacing.md,
        }}>
          {/* Camera Controls */}
          <WithPermission permission={Permission.VIEW_CAMERAS}>
            <div style={{
              padding: theme.spacing.md,
              backgroundColor: theme.colors.background.elevated,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.status.normal}`,
            }}>
              <h3 style={{ color: theme.colors.status.normal, margin: `0 0 ${theme.spacing.sm} 0` }}>
                📹 Camera Access
              </h3>
              <p style={{ fontSize: theme.typography.fontSize.sm, margin: 0 }}>
                You can view camera feeds
              </p>
            </div>
          </WithPermission>

          {/* Facial Recognition */}
          <WithPermission permission={Permission.ACCESS_FACIAL_RECOGNITION}>
            <div style={{
              padding: theme.spacing.md,
              backgroundColor: theme.colors.background.elevated,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.status.active}`,
            }}>
              <h3 style={{ color: theme.colors.status.active, margin: `0 0 ${theme.spacing.sm} 0` }}>
                👤 Facial Recognition
              </h3>
              <p style={{ fontSize: theme.typography.fontSize.sm, margin: 0 }}>
                You can access facial recognition features
              </p>
            </div>
          </WithPermission>

          {/* AI Decisions */}
          <WithPermission permission={Permission.VIEW_AI_DECISIONS}>
            <div style={{
              padding: theme.spacing.md,
              backgroundColor: theme.colors.background.elevated,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.primary.main}`,
            }}>
              <h3 style={{ color: theme.colors.primary.main, margin: `0 0 ${theme.spacing.sm} 0` }}>
                🤖 AI Decisions
              </h3>
              <p style={{ fontSize: theme.typography.fontSize.sm, margin: 0 }}>
                You can view autonomous AI decisions
              </p>
            </div>
          </WithPermission>

          {/* Admin Features */}
          <WithPermission role={UserRole.ADMINISTRATOR}>
            <div style={{
              padding: theme.spacing.md,
              backgroundColor: theme.colors.background.elevated,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.status.warning}`,
            }}>
              <h3 style={{ color: theme.colors.status.warning, margin: `0 0 ${theme.spacing.sm} 0` }}>
                ⚙️ Admin Panel
              </h3>
              <p style={{ fontSize: theme.typography.fontSize.sm, margin: 0 }}>
                You have administrator access
              </p>
            </div>
          </WithPermission>

          {/* System Configuration */}
          <WithPermission permission={Permission.CONFIGURE_SYSTEM}>
            <div style={{
              padding: theme.spacing.md,
              backgroundColor: theme.colors.background.elevated,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.status.critical}`,
            }}>
              <h3 style={{ color: theme.colors.status.critical, margin: `0 0 ${theme.spacing.sm} 0` }}>
                🔧 System Config
              </h3>
              <p style={{ fontSize: theme.typography.fontSize.sm, margin: 0 }}>
                You can configure system settings
              </p>
            </div>
          </WithPermission>

          {/* Evidence Access */}
          <WithPermission permission={Permission.ACCESS_EVIDENCE}>
            <div style={{
              padding: theme.spacing.md,
              backgroundColor: theme.colors.background.elevated,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.text.secondary}`,
            }}>
              <h3 style={{ color: theme.colors.text.secondary, margin: `0 0 ${theme.spacing.sm} 0` }}>
                📁 Evidence Access
              </h3>
              <p style={{ fontSize: theme.typography.fontSize.sm, margin: 0 }}>
                You can access evidence files
              </p>
            </div>
          </WithPermission>
        </div>
      </div>

      {/* Theme Demo */}
      <div style={cardStyle}>
        <h2 style={{
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.md,
        }}>
          Theme System Demo
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.lg,
        }}>
          {/* Status Colors */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: theme.colors.status.normal,
              borderRadius: '50%',
              margin: `0 auto ${theme.spacing.sm} auto`,
            }} />
            <p style={{ fontSize: theme.typography.fontSize.sm, margin: 0 }}>Normal</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: theme.colors.status.warning,
              borderRadius: '50%',
              margin: `0 auto ${theme.spacing.sm} auto`,
            }} />
            <p style={{ fontSize: theme.typography.fontSize.sm, margin: 0 }}>Warning</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: theme.colors.status.critical,
              borderRadius: '50%',
              margin: `0 auto ${theme.spacing.sm} auto`,
            }} />
            <p style={{ fontSize: theme.typography.fontSize.sm, margin: 0 }}>Critical</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: theme.colors.status.active,
              borderRadius: '50%',
              margin: `0 auto ${theme.spacing.sm} auto`,
            }} />
            <p style={{ fontSize: theme.typography.fontSize.sm, margin: 0 }}>Active</p>
          </div>
        </div>

        {/* Button Examples */}
        <div style={{
          display: 'flex',
          gap: theme.spacing.md,
          flexWrap: 'wrap',
        }}>
          <button style={buttonStyle}>Primary Button</button>
          <button style={{
            ...buttonStyle,
            backgroundColor: theme.colors.background.elevated,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.primary}`,
          }}>
            Secondary Button
          </button>
          <button style={{
            ...buttonStyle,
            backgroundColor: theme.colors.status.critical,
          }}>
            Danger Button
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Demo Component
export const ThemeAndAuthDemo: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <SecurityThemeProvider>
      <AuthProvider>
        <ProtectedRoute fallback={<LoginForm onLoginSuccess={() => setShowLogin(false)} />}>
          <DemoDashboard />
        </ProtectedRoute>
      </AuthProvider>
    </SecurityThemeProvider>
  );
};