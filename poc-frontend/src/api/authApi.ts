import api from './axiosConfig';
import { AuthResponse, RegisterRequest, UpdateProfileRequest, UserProfile } from '../types';

export const register = (data: RegisterRequest) =>
  api.post<AuthResponse>('/auth/register', data).then(r => r.data);

export const forgotPassword = (email: string) =>
  api.post<{ message: string }>('/auth/forgot-password', { email }).then(r => r.data);

export const resetPassword = (token: string, newPassword: string, confirmPassword: string) =>
  api.post<{ message: string }>('/auth/reset-password', { token, newPassword, confirmPassword }).then(r => r.data);

export const getMe = () =>
  api.get<UserProfile>('/auth/me').then(r => r.data);

export const updateProfile = (data: UpdateProfileRequest) =>
  api.put<UserProfile>('/auth/profile', data).then(r => r.data);
