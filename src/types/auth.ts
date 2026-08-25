import { z } from 'zod';
import { normalizeBDPhone, isValidBDPhone, formatBDPhoneE164 } from '../utils/phone';

/**
 * Authoritative Customer Model
 */
export interface Customer {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  avatar?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  fullName?: string;
  defaultAddress?: any;
}

// ==========================================
// ZOD VALIDATION SCHEMAS
// ==========================================

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required').refine(
    (val) => isValidBDPhone(val),
    'Please enter a valid Bangladesh mobile number (e.g. 01700000000)'
  ),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine((val) => val === true, 'You must agree to the Terms of Service & Privacy Policy'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const mobileLoginRequestSchema = z.object({
  phone: z.string().min(1, 'Phone number is required').refine(
    (val) => isValidBDPhone(val),
    'Please enter a valid Bangladesh mobile number'
  ),
});

export const mobileLoginVerifySchema = z.object({
  phone: z.string().min(1, 'Phone number is required').refine(
    (val) => isValidBDPhone(val),
    'Please enter a valid Bangladesh mobile number'
  ),
  code: z.string().length(6, 'Verification code must be exactly 6 digits').regex(/^\d+$/, 'Code must contain digits only'),
});

export const mobileRegisterRequestSchema = z.object({
  phone: z.string().min(1, 'Phone number is required').refine(
    (val) => isValidBDPhone(val),
    'Please enter a valid Bangladesh mobile number'
  ),
});

export const mobileRegisterVerifySchema = z.object({
  phone: z.string().min(1, 'Phone number is required').refine(
    (val) => isValidBDPhone(val),
    'Please enter a valid Bangladesh mobile number'
  ),
  code: z.string().length(6, 'Verification code must be exactly 6 digits').regex(/^\d+$/, 'Code must contain digits only'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ==========================================
// FORM DATA TYPES
// ==========================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type MobileLoginRequestFormData = z.infer<typeof mobileLoginRequestSchema>;
export type MobileLoginVerifyFormData = z.infer<typeof mobileLoginVerifySchema>;
export type MobileRegisterRequestFormData = z.infer<typeof mobileRegisterRequestSchema>;
export type MobileRegisterVerifyFormData = z.infer<typeof mobileRegisterVerifySchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ==========================================
// API REQUEST & RESPONSE INTERFACES
// ==========================================

export interface RegisterRequestPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface LoginRequestPayload {
  email: string;
  password: string;
}

export interface RegisterMobileRequestPayload {
  phone: string;
}

export interface VerifyMobileRegisterPayload {
  phone: string;
  code: string;
  firstName: string;
  lastName: string;
  password?: string;
}

export interface LoginMobileRequestPayload {
  phone: string;
}

export interface VerifyMobileLoginPayload {
  phone: string;
  code: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface AuthSuccessData {
  customer: Customer;
  accessToken: string;
  refreshToken?: string;
}

export interface MobileRegisterData {
  phone: string;
  expiresIn?: number;
}

export interface MobileLoginData {
  message?: string;
}

export interface AuthResponse {
  customer: Customer;
  user: Customer;
  token: string;
  accessToken: string;
  refreshToken?: string;
}

export interface RegisterResponse {
  message: string;
  customer?: Customer;
  user?: Customer;
  accessToken?: string;
  refreshToken?: string;
  token?: string;
}
