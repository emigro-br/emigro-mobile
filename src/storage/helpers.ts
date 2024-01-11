import * as SecureStore from 'expo-secure-store';

type ISession = {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  email: string;
}

export const getAccessToken = async (): Promise<string | null> => {
  const accessToken = await SecureStore.getItemAsync('accessToken');
  return accessToken;
};

export const saveSession = async (session: ISession): Promise<void> => {
  await SecureStore.setItemAsync('accessToken', session.accessToken);
  await SecureStore.setItemAsync('refreshToken', session.refreshToken);
  await SecureStore.setItemAsync('idToken', session.idToken);
  await SecureStore.setItemAsync('email', session.email);
}

export const getSession = async (): Promise<ISession> => {
  const accessToken = await SecureStore.getItemAsync('accessToken');
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  const idToken = await SecureStore.getItemAsync('idToken');
  const email = await SecureStore.getItemAsync('email');

  if (!accessToken || !refreshToken || !idToken || !email) {
    throw new Error('Invalid session');
  }

  return {
    accessToken,
    refreshToken,
    idToken,
    email,
  }
}

export const clearSession = async (): Promise<void> => {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
  await SecureStore.deleteItemAsync('idToken');
  await SecureStore.deleteItemAsync('email');
}
