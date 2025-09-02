import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useSecurityTheme } from '../../theme/ThemeProvider';
import { LoginCredentials } from '../../auth/types';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const theme = useSecurityTheme();
  const { authState, login } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
      onLoginSuccess?.();
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleInputChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.colors.background.surface,
    color: theme.colors.text.primary,
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: theme.borderRadius.md,
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium,
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.primary.contrast,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: authState.isLoading ? 'not-allowed' : 'pointer',
    opacity: authState.isLoading ? 0.7 : 1,
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: theme.colors.background.primary,
      fontFamily: theme.typography.fontFamily,
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background.surface,
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.border.primary}`,
        boxShadow: theme.shadows.lg,
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: theme.spacing.xl,
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: theme.spacing.md,
          }}>
            🔒
          </div>
          <h1 style={{
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            margin: `0 0 ${theme.spacing.sm} 0`,
          }}>
            Security System Login
          </h1>
          <p style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
            margin: 0,
          }}>
            Access the autonomous AI security dashboard
          </p>
        </div>

        {/* Error Message */}
        {authState.error && (
          <div style={{
            padding: theme.spacing.md,
            marginBottom: theme.spacing.md,
            backgroundColor: theme.colors.status.critical + '20',
            border: `1px solid ${theme.colors.status.critical}`,
            borderRadius: theme.borderRadius.md,
            color: theme.colors.status.critical,
            fontSize: theme.typography.fontSize.sm,
          }}>
            {authState.error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: theme.spacing.md }}>
            <label style={{
              display: 'block',
              marginBottom: theme.spacing.sm,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
            }}>
              Username
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={handleInputChange('username')}
              style={inputStyle}
              placeholder="Enter your username"
              required
              disabled={authState.isLoading}
              onFocus={(e) => {
                e.target.style.borderColor = theme.colors.border.focus;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.colors.border.primary;
              }}
            />
          </div>

          <div style={{ marginBottom: theme.spacing.lg }}>
            <label style={{
              display: 'block',
              marginBottom: theme.spacing.sm,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
            }}>
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={handleInputChange('password')}
              style={inputStyle}
              placeholder="Enter your password"
              required
              disabled={authState.isLoading}
              onFocus={(e) => {
                e.target.style.borderColor = theme.colors.border.focus;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.colors.border.primary;
              }}
            />
          </div>

          <button
            type="submit"
            style={buttonStyle}
            disabled={authState.isLoading}
            onMouseEnter={(e) => {
              if (!authState.isLoading) {
                e.currentTarget.style.backgroundColor = theme.colors.primary.dark;
              }
            }}
            onMouseLeave={(e) => {
              if (!authState.isLoading) {
                e.currentTarget.style.backgroundColor = theme.colors.primary.main;
              }
            }}
          >
            {authState.isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div style={{
          marginTop: theme.spacing.lg,
          padding: theme.spacing.md,
          backgroundColor: theme.colors.background.elevated,
          borderRadius: theme.borderRadius.md,
          border: `1px solid ${theme.colors.border.secondary}`,
        }}>
          <h3 style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.primary,
            margin: `0 0 ${theme.spacing.sm} 0`,
          }}>
            Demo Credentials:
          </h3>
          <div style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.text.secondary,
            lineHeight: 1.4,
          }}>
            <div><strong>Operator:</strong> operator / password</div>
            <div><strong>Admin:</strong> admin / password</div>
          </div>
        </div>
      </div>
    </div>
  );
};