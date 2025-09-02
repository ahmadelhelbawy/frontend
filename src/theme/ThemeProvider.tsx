import React, { createContext, useContext, ReactNode } from 'react';
import { SecurityTheme, securityDarkTheme } from './SecurityTheme';

// Theme Context
const ThemeContext = createContext<SecurityTheme | undefined>(undefined);

// Theme Provider Props
interface ThemeProviderProps {
  children: ReactNode;
  theme?: SecurityTheme;
}

// Professional Theme Provider for Security Interface
export const SecurityThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  theme = securityDarkTheme 
}) => {
  return (
    <ThemeContext.Provider value={theme}>
      <div 
        style={{
          backgroundColor: theme.colors.background.primary,
          color: theme.colors.text.primary,
          fontFamily: theme.typography.fontFamily,
          minHeight: '100vh',
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Hook to use theme in components
export const useSecurityTheme = (): SecurityTheme => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useSecurityTheme must be used within a SecurityThemeProvider');
  }
  return theme;
};

// CSS Variables Generator for Global Styling
export const generateCSSVariables = (theme: SecurityTheme): string => {
  return `
    :root {
      /* Primary Colors */
      --security-primary-main: ${theme.colors.primary.main};
      --security-primary-dark: ${theme.colors.primary.dark};
      --security-primary-light: ${theme.colors.primary.light};
      --security-primary-contrast: ${theme.colors.primary.contrast};
      
      /* Status Colors */
      --security-status-normal: ${theme.colors.status.normal};
      --security-status-warning: ${theme.colors.status.warning};
      --security-status-critical: ${theme.colors.status.critical};
      --security-status-offline: ${theme.colors.status.offline};
      --security-status-active: ${theme.colors.status.active};
      
      /* Background Colors */
      --security-bg-primary: ${theme.colors.background.primary};
      --security-bg-secondary: ${theme.colors.background.secondary};
      --security-bg-surface: ${theme.colors.background.surface};
      --security-bg-elevated: ${theme.colors.background.elevated};
      
      /* Text Colors */
      --security-text-primary: ${theme.colors.text.primary};
      --security-text-secondary: ${theme.colors.text.secondary};
      --security-text-disabled: ${theme.colors.text.disabled};
      --security-text-inverse: ${theme.colors.text.inverse};
      
      /* Border Colors */
      --security-border-primary: ${theme.colors.border.primary};
      --security-border-secondary: ${theme.colors.border.secondary};
      --security-border-focus: ${theme.colors.border.focus};
      
      /* Typography */
      --security-font-family: ${theme.typography.fontFamily};
      --security-font-size-xs: ${theme.typography.fontSize.xs};
      --security-font-size-sm: ${theme.typography.fontSize.sm};
      --security-font-size-md: ${theme.typography.fontSize.md};
      --security-font-size-lg: ${theme.typography.fontSize.lg};
      --security-font-size-xl: ${theme.typography.fontSize.xl};
      
      /* Spacing */
      --security-spacing-xs: ${theme.spacing.xs};
      --security-spacing-sm: ${theme.spacing.sm};
      --security-spacing-md: ${theme.spacing.md};
      --security-spacing-lg: ${theme.spacing.lg};
      --security-spacing-xl: ${theme.spacing.xl};
      
      /* Border Radius */
      --security-radius-sm: ${theme.borderRadius.sm};
      --security-radius-md: ${theme.borderRadius.md};
      --security-radius-lg: ${theme.borderRadius.lg};
      
      /* Shadows */
      --security-shadow-sm: ${theme.shadows.sm};
      --security-shadow-md: ${theme.shadows.md};
      --security-shadow-lg: ${theme.shadows.lg};
    }
  `;
};