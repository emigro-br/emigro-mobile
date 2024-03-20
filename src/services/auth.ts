import { IAuthSession } from '@/types/IAuthSession';
import { IConfirmUser } from '@/types/IConfirmUser';
import { IRegisterResponse } from '@/types/IRegisterResponse';
import { IRegisterUser } from '@/types/IRegisterUser';

import { Role } from '@constants/constants';
import { REFRESH_SESSION_ERROR } from '@constants/errorMessages';

import { CustomError } from '../types/errors';
import { fetchWithTokenCheck } from './utils';

const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

export const signIn = async (email: string, password: string): Promise<IAuthSession> => {
  const signInUrl = `${backendUrl}/auth/login`;
  const res = await fetch(signInUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      role: Role.CUSTOMER,
    }),
  });

  const json = await res.json();
  if (json.error) {
    throw CustomError.fromJSON(json.error);
  }

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const { accessToken, refreshToken, idToken, tokenExpirationDate } = json;
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
  const registerUrl = `${backendUrl}/auth/register`;
  const res = await fetch(registerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(registerUser),
  });

  const json = await res.json();
  if (json.error) {
    throw CustomError.fromJSON(json.error);
  }

  if (!res.ok) {
    throw new Error(res.statusText);
  }
  return json;
};

export const confirmAccount = async (confirmUser: IConfirmUser): Promise<IRegisterResponse | undefined> => {
  const confirmUrl = `${backendUrl}/auth/confirm`;
  const res = await fetch(confirmUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(confirmUser),
  });

  const json = await res.json();
  if (json.error) {
    throw CustomError.fromJSON(json.error);
  }

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  return json;
};

export const refresh = async (authSession: IAuthSession): Promise<IAuthSession> => {
  const url = `${backendUrl}/auth/refresh`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authSession),
    });
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error?.message ?? res.statusText);
    }

    const { accessToken, refreshToken, idToken, tokenExpirationDate } = json;

    const session: IAuthSession = {
      accessToken,
      refreshToken,
      idToken,
      tokenExpirationDate,
      email: authSession.email,
    };

    return session;
  } catch (error) {
    console.error(error);
    throw new Error(REFRESH_SESSION_ERROR);
  }
};

export const deleteAccount = async (): Promise<void> => {
  const url = `${backendUrl}/auth`;
  try {
    const res = await fetchWithTokenCheck(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error?.message ?? res.statusText);
    }

    return json;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
