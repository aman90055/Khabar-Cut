import { z } from 'zod';
import { 
  loginSchema, 
  registerSchema, 
  otpSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  changePasswordSchema 
} from './schemas';
import type { UserWithRole } from '../users/types';

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export interface AuthState {
  user: UserWithRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
