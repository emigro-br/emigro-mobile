import { IAuthSession } from '@/types/IAuthSession';
import { IConfirmUser } from '@/types/IConfirmUser';
import { IRegisterResponse } from '@/types/IRegisterResponse';
import { IRegisterUser } from '@/types/IRegisterUser';

import { Role } from '@constants/constants';
import {
  CONFIRM_ACCOUNT_ERROR,
  REFRESH_SESSION_ERROR,
  SIGNIN_ERROR_MESSAGE,
  SIGNUP_ERROR_MESSAGE,
} from '@constants/errorMessages';

const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

export const signIn = async (email: string, password: string): Promise<IAuthSession> => {
  const signInUrl = `${backendUrl}/auth/login`;
  try {
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
    if (!res.ok) {
      throw new Error(json?.error?.message ?? res.statusText);
    }

    const { accessToken, refreshToken, idToken, tokenExpirationDate } = json;
    const session: IAuthSession = {
      accessToken,
      refreshToken,
      idToken,
      tokenExpirationDate,
    };
    return session;
  } catch (error) {
    console.error(SIGNIN_ERROR_MESSAGE, error);
    throw error;
  }
};

export const signUp = async (registerUser: IRegisterUser): Promise<IRegisterResponse> => {
  const registerUrl = `${backendUrl}/auth/register`;
  try {
    const res = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerUser),
    });
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error?.message ?? res.statusText);
    }
    return json;
  } catch (error) {
    console.error(error);
    throw new Error(SIGNUP_ERROR_MESSAGE);
  }
};

export const confirmAccount = async (confirmUser: IConfirmUser): Promise<IRegisterResponse | undefined> => {
  const confirmUrl = `${backendUrl}/auth/confirm`;
  try {
    const response = await fetch(confirmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(confirmUser),
    });
    return await response.json();
  } catch (error) {
    console.error(error);
    throw new Error(CONFIRM_ACCOUNT_ERROR);
  }
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
    };

    return session;
  } catch (error) {
    console.error(error);
    throw new Error(REFRESH_SESSION_ERROR);
  }
};

export const deleteAccount = async (authSession: IAuthSession): Promise<void> => {
  const url = `${backendUrl}/auth`;
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authSession),
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
