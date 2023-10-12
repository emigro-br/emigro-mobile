import AsyncStorage from '@react-native-async-storage/async-storage';

import { Role } from '@constants/constants';
import { SIGNIN_ERROR_MESSAGE, SIGNUP_ERROR_MESSAGE } from '@constants/errorMessages';

const BACKEND_URL = process.env.BACKEND_URL;

export const signIn = async (email: string, password: string) => {
  const signInUrl = `${BACKEND_URL}/auth/login`;
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
    const signInResponse = await response.json();
    const { accessToken, refreshToken, idToken } = signInResponse;

    const session = {
      accessToken,
      refreshToken,
      idToken,
      email,
    };

    await AsyncStorage.setItem('session', JSON.stringify(session));
  } catch (error) {
    console.error(SIGNIN_ERROR_MESSAGE, error);
  }
};

export const signUp = async (registerUser: IRegisterUser) => {
  const registerUrl = `${BACKEND_URL}/auth/register`;
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
  }
};
