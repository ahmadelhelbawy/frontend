// Professional Security Industry Theme System
export interface SecurityTheme {
  colors: {
    // Primary Security Colors
    primary: {
      main: string;
      dark: string;
      light: string;
      contrast: string;
    };
    // Status Colors for Security Operations
    status: {
      normal: string;
      warning: string;
      critical: string;
      offline: string;
      active: string;
    };
    // Background Colors for CCTV Interface
    background: {
      primary: string;
      secondary: string;
      surface: string;
      elevated: string;
    };
    // Text Colors for Professional Display
    text: {
      primary: string;
      secondary: string;
      disabled: string;
      inverse: string;
    };
    // Border Colors for Professional Styling
    border: {
      primary: string;
      secondary: string;
      focus: string;
    };
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

// Professional Dark Theme for Security Operations
export const securityDarkTheme: SecurityTheme = {
  colors: {
    primary: {
      main: '#00A8FF',      // Professional blue for primary actions
      dark: '#0078D4',      // Darker blue for hover states
      light: '#40C4FF',     // Light blue for accents
      contrast: '#FFFFFF',  // White text on primary
    },
    status: {
      normal: '#4CAF50',    // Green for normal operations
      warning: '#FF9800',   // Orange for warnings
      critical: '#F44336',  // Red for critical alerts
      offline: '#757575',   // Gray for offline status
      active: '#2196F3',    // Blue for active monitoring
    },
    background: {
      primary: '#121212',   // Dark primary background
      secondary: '#1E1E1E', // Slightly lighter secondary
      surface: '#2D2D2D',   // Surface elements
      elevated: '#383838',  // Elevated components
    },
    text: {
      primary: '#FFFFFF',   // Primary white text
      secondary: '#B3B3B3', // Secondary gray text
      disabled: '#666666',  // Disabled text
      inverse: '#121212',   // Dark text on light backgrounds
    },
    border: {
      primary: '#404040',   // Primary border color
      secondary: '#2D2D2D', // Secondary border
      focus: '#00A8FF',     // Focus indicator
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      md: '1rem',      // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700,
    },
  },
  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.3)',
  },
};