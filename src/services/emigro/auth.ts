import { api } from './api';
import { IAuthSession, IConfirmUser, IRegisterResponse, IRegisterUser, Role } from './types';

type SuccessResponse = {
  success: boolean;
};

export const signIn = async (email: string, password: string): Promise<IAuthSession> => {
  const res = await api().post('/auth/login', {
    email,
    password,
    role: Role.CUSTOMER,
  });

  const { accessToken, refreshToken, idToken, tokenExpirationDate } = res.data;
  const session: IAuthSession = {
    accessToken,
    refreshToken,
    idToken,
    tokenExpirationDate,
    email,
  };
  return session;
};

export const signUp = async (registerUser: IRegisterUser): Promise<IRegisterResponse> => {
  const res = await api().post('/auth/register', registerUser);
  return res.data;
};

export const confirmAccount = async (confirmUser: IConfirmUser): Promise<IRegisterResponse | undefined> => {
  const timeout = 30 * 1000; // it is also creating wallets on stellar network
  const res = await api({ timeout }).post('/auth/confirm', confirmUser);
  return res.data;
};

export const refresh = async (authSession: IAuthSession): Promise<IAuthSession> => {
  const res = await api().post('/auth/refresh', authSession);

  const { accessToken, refreshToken, idToken, tokenExpirationDate } = res.data;
  const session: IAuthSession = {
    accessToken,
    refreshToken,
    idToken,
    tokenExpirationDate,
    email: authSession.email,
  };

  return session;
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
