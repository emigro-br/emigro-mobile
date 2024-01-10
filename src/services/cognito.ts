import AsyncStorage from '@react-native-async-storage/async-storage';

import { IConfirmUser } from '@/types/IConfirmUser';
import { IRegisterResponse } from '@/types/IRegisterResponse';

import { Role } from '@constants/constants';
import { CONFIRM_ACCOUNT_ERROR, SIGNIN_ERROR_MESSAGE, SIGNUP_ERROR_MESSAGE } from '@constants/errorMessages';

const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

export const signIn = async (email: string, password: string): Promise<void> => {
  const signInUrl = `${backendUrl}/auth/login`;
  try {
    const response = await fetch(signInUrl, {
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
    const { accessToken, refreshToken, idToken, message } = await response.json();
    if (message) {
      throw new Error(message);
    }

    const session = {
      accessToken,
      refreshToken,
      idToken,
      email,
    };
    await AsyncStorage.setItem('session', JSON.stringify(session));
  } catch (error) {
    console.error(SIGNIN_ERROR_MESSAGE, error);
    throw error;
  }
};

export const signUp = async (registerUser: IRegisterUser): Promise<IRegisterResponse> => {
  const registerUrl = `${backendUrl}/auth/register`;
  try {
    const response = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerUser),
    });
    return await response.json();
  } catch (error) {
    console.error(SIGNUP_ERROR_MESSAGE, error);
    throw new Error();
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
    console.error(CONFIRM_ACCOUNT_ERROR, error);
  }
};
