// Role-Based Access Control Types for Security System

export enum UserRole {
  SECURITY_OPERATOR = 'security_operator',
  ADMINISTRATOR = 'administrator',
  MANAGER = 'manager',
  VIEWER = 'viewer'
}

export enum Permission {
  // Camera and Video Permissions
  VIEW_CAMERAS = 'view_cameras',
  CONTROL_CAMERAS = 'control_cameras',
  CONFIGURE_CAMERAS = 'configure_cameras',
  
  // Person Tracking Permissions
  VIEW_PERSON_TRACKING = 'view_person_tracking',
  ACCESS_FACIAL_RECOGNITION = 'access_facial_recognition',
  MANAGE_PERSON_DATABASE = 'manage_person_database',
  
  // Autonomous AI Permissions
  VIEW_AI_DECISIONS = 'view_ai_decisions',
  OVERRIDE_AI_DECISIONS = 'override_ai_decisions',
  CONFIGURE_AI_THRESHOLDS = 'configure_ai_thresholds',
  
  // Alert and Incident Permissions
  VIEW_ALERTS = 'view_alerts',
  MANAGE_INCIDENTS = 'manage_incidents',
  ACCESS_EVIDENCE = 'access_evidence',
  
  // System Administration
  MANAGE_USERS = 'manage_users',
  CONFIGURE_SYSTEM = 'configure_system',
  VIEW_SYSTEM_LOGS = 'view_system_logs',
  
  // Analytics and Reporting
  VIEW_ANALYTICS = 'view_analytics',
  GENERATE_REPORTS = 'generate_reports',
  EXPORT_DATA = 'export_data'
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
}

// Role Permission Mappings
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SECURITY_OPERATOR]: [
    Permission.VIEW_CAMERAS,
    Permission.VIEW_PERSON_TRACKING,
    Permission.ACCESS_FACIAL_RECOGNITION,
    Permission.VIEW_AI_DECISIONS,
    Permission.VIEW_ALERTS,
    Permission.MANAGE_INCIDENTS,
    Permission.ACCESS_EVIDENCE,
    Permission.VIEW_ANALYTICS,
  ],
  [UserRole.ADMINISTRATOR]: [
    Permission.VIEW_CAMERAS,
    Permission.CONTROL_CAMERAS,
    Permission.CONFIGURE_CAMERAS,
    Permission.VIEW_PERSON_TRACKING,
    Permission.ACCESS_FACIAL_RECOGNITION,
    Permission.MANAGE_PERSON_DATABASE,
    Permission.VIEW_AI_DECISIONS,
    Permission.OVERRIDE_AI_DECISIONS,
    Permission.CONFIGURE_AI_THRESHOLDS,
    Permission.VIEW_ALERTS,
    Permission.MANAGE_INCIDENTS,
    Permission.ACCESS_EVIDENCE,
    Permission.MANAGE_USERS,
    Permission.CONFIGURE_SYSTEM,
    Permission.VIEW_SYSTEM_LOGS,
    Permission.VIEW_ANALYTICS,
    Permission.GENERATE_REPORTS,
    Permission.EXPORT_DATA,
  ],
  [UserRole.MANAGER]: [
    Permission.VIEW_CAMERAS,
    Permission.VIEW_PERSON_TRACKING,
    Permission.ACCESS_FACIAL_RECOGNITION,
    Permission.VIEW_AI_DECISIONS,
    Permission.VIEW_ALERTS,
    Permission.MANAGE_INCIDENTS,
    Permission.ACCESS_EVIDENCE,
    Permission.VIEW_ANALYTICS,
    Permission.GENERATE_REPORTS,
    Permission.EXPORT_DATA,
  ],
  [UserRole.VIEWER]: [
    Permission.VIEW_CAMERAS,
    Permission.VIEW_PERSON_TRACKING,
    Permission.VIEW_AI_DECISIONS,
    Permission.VIEW_ALERTS,
    Permission.VIEW_ANALYTICS,
  ],
};