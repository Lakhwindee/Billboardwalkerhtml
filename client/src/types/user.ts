// User types for role-based access control
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'campaign_manager';
}

export interface AuthUser extends User {
  isAuthenticated: boolean;
}

export type UserRole = 'user' | 'admin' | 'campaign_manager';