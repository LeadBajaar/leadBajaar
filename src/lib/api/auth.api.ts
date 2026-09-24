import axios, { AxiosError } from 'axios';
import { setSession, clearSession, getSession } from '../auth';
import { logger } from '@/utils/logger';
import api from './client';
import { AuthResponse, MessageResponse, TesterRequestDto, User } from './types/auth.types';

interface LoginError {
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

interface ErrorResponse {
  message?: string;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post('/login', { email, password });
    // Store the actual token from the response
    const token = response.data.token || response.data.access_token;
    if (!token) {
      throw new Error('No token received from server');
    }
    setSession(token);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<LoginError>;
      // Don't log the error to console for expected errors like invalid credentials
      if (axiosError.response?.status === 422) {
        throw new Error(axiosError.response.data.message || 'Invalid credentials');
      }
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
    }
    // Only log unexpected errors
    logger.error('Login Failed', error);
    throw error;
  }
};

export const register = async (name: string, email: string, password: string, password_confirmation: string, phone: string): Promise<AuthResponse> => {
  try {
    const response = await api.post('/register', {
      name,
      email,
      password,
      password_confirmation,
      phone
    });
    setSession('your_auth_token');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (email: string): Promise<MessageResponse> => {
  try {
    const response = await api.post('/forgot-password', { email });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to send reset link';
    throw new Error(message);
  }
};

export const resetPassword = async (token: string, email: string, password: string, password_confirmation: string): Promise<MessageResponse> => {
  try {
    const response = await api.post('/reset-password', {
      token,
      email,
      password,
      password_confirmation
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to reset password';
    throw new Error(message);
  }
};

export const logout = async (): Promise<boolean> => {
  try {
    const session = await getSession();
    if (!session?.token) {
      clearSession();
      return true;
    }

    await api.post('/logout', {}, {
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    });
    clearSession();
    return true;
  } catch (error) {
    clearSession(); // Clear session even if logout fails
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
    }
    throw new Error('Logout failed');
  }
};

export const getUser = async (): Promise<User> => {
  const response = await api.get('/user');
  return response.data;
};

export const submitTesterRequest = async (data: TesterRequestDto): Promise<unknown> => {
  const response = await api.post('/tester-requests', data);
  return response.data;
};

export const loginWithGoogle = async (token: string): Promise<AuthResponse> => {
  const response = await api.post('/login/google', { token });
  setSession(token);
  return response.data;
};

export const me = async (): Promise<User> => {
  const response = await api.get('/user', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};
