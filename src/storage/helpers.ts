import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IAuthSession } from '../types/IAuthSession';

export const getAccessToken = async (): Promise<string | null> => {
  const accessToken = await SecureStore.getItemAsync('accessToken');
  return accessToken;
};

export const saveSession = async (session: IAuthSession): Promise<void> => {
  await SecureStore.setItemAsync('accessToken', session.accessToken);
  await SecureStore.setItemAsync('refreshToken', session.refreshToken);
  await SecureStore.setItemAsync('idToken', session.idToken);
  if (session.tokenExpirationDate) {
    await SecureStore.setItemAsync('tokenExpirationDate', session.tokenExpirationDate.toString());
  }
  if (session.email) {
    await SecureStore.setItemAsync('email', session.email);
  }
}

export const getSession = async (): Promise<IAuthSession | null> => {
  const accessToken = await SecureStore.getItemAsync('accessToken');
  if (!accessToken) {
    return null;
  }

  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  const idToken = await SecureStore.getItemAsync('idToken');
  const tokenExpirationDate = await SecureStore.getItemAsync('tokenExpirationDate');
  const email = await SecureStore.getItemAsync('email');

  if (!refreshToken || !idToken || !tokenExpirationDate) {
    throw new Error('Invalid session');
  }

  const authSession: IAuthSession = {
    accessToken,
    refreshToken,
    idToken,
    tokenExpirationDate: new Date(tokenExpirationDate),
    email,
  }
  return authSession;
}

export const clearSession = async (): Promise<void> => {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
  await SecureStore.deleteItemAsync('idToken');
  await SecureStore.deleteItemAsync('tokenExpirationDate');
  await SecureStore.deleteItemAsync('email');

  // https://stackoverflow.com/questions/46736268/react-native-asyncstorage-clear-is-failing-on-ios
  const asyncStorageKeys = await AsyncStorage.getAllKeys();
  if (asyncStorageKeys.length > 0) {
    if (Platform.OS === 'android') {
      await AsyncStorage.clear();
    }
    if (Platform.OS === 'ios') {
      await AsyncStorage.multiRemove(asyncStorageKeys);
    }
  }
}
