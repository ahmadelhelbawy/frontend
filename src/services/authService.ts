import axios, { AxiosResponse } from 'axios';
import { AuthResponse, APIResponse } from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Legacy interfaces for backward compatibility
interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  tenantId: string;
}

class AuthService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.apiClient.post('/auth/login', {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  }

  async validateToken(token: string): Promise<User> {
    try {
      const response = await this.apiClient.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Token validation error:', error);
      throw new Error('Token validation failed');
    }
  }

  async refreshToken(token: string): Promise<string> {
    try {
      const response = await this.apiClient.post('/auth/refresh', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.token;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Token refresh failed');
    }
  }

  async logout(token: string): Promise<void> {
    try {
      await this.apiClient.post('/auth/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error for logout - just log it
    }
  }
}

export const authService = new AuthService();