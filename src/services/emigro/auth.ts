import { api } from './api';
import { AuthSession, ConfirmUserRequest, RegisterUserRequest, Role, User, UserCredential } from './types';

type SuccessResponse = {
  success: boolean;
};

export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  const res = await api().post('/auth/login', {
    email,
    password,
    role: Role.CUSTOMER, // FIXME: hardcoded role
  });

  return res.data;
};

export const signUp = async (registerUser: RegisterUserRequest): Promise<User> => {
  const res = await api().post('/auth/register', registerUser);
  return res.data;
};

export const confirmAccount = async (confirmUser: ConfirmUserRequest): Promise<User | undefined> => {
  const timeout = 30 * 1000; // it is also creating wallets on stellar network
  const res = await api({ timeout }).post('/auth/confirm', confirmUser);
  return res.data;
};

export const resendConfirmationCode = async (
  email: string,
  externalId?: string
): Promise<{ success: boolean; status?: number; data?: any }> => {
  const payload: any = { email };
  if (externalId) payload.externalId = externalId;

  console.log('[auth.ts][resendConfirmationCode] ➡️ POST /auth/resend-confirmation payload:', payload);
  const res = await api().post('/auth/resend-confirmation', payload);
  console.log('[auth.ts][resendConfirmationCode] ⬅️ response:', { status: res?.status, data: res?.data });

  const status = res?.status ?? 0;
  const is2xx = status >= 200 && status < 300;
  const success = is2xx || res?.data?.success === true;

  return { success, status, data: res?.data };
};



export const refresh = async (authSession: AuthSession): Promise<AuthSession> => {
  const res = await api().post('/auth/refresh', authSession);
  return res.data;
};

export const deleteAccount = async (): Promise<void> => {
  await api().delete('/auth');
};

export const resetPassword = async (email: string): Promise<SuccessResponse> => {
  const res = await api().post('/auth/reset-password', { email });
  return res.data;
};

export const confirmResetPassword = async (
  email: string,
  code: string,
  newPassword: string,
): Promise<SuccessResponse> => {
  const res = await api().post('/auth/confirm-reset-password', { email, code, newPassword });
  return res.data;
};
