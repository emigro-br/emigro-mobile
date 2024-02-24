import { Platform } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as SecureStore from 'expo-secure-store';
import { makeAutoObservable } from 'mobx';

import { IAuthSession } from '../types/IAuthSession';

// export const getAccessToken = async (): Promise<string | null> => {
//   const accessToken = await SecureStore.getItemAsync('accessToken');
//   return accessToken;
// };

class SessionStore {
  // Observable state
  session: IAuthSession | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  getAccessToken() {
    return this.session?.accessToken;
  }

  getPublicKey() {
    return this.session?.publicKey;
  }

  save(session: IAuthSession) {
    const { accessToken, refreshToken, idToken, tokenExpirationDate, email, publicKey } = session;
    SecureStore.setItem('accessToken', accessToken);
    SecureStore.setItem('refreshToken', refreshToken);
    SecureStore.setItem('idToken', idToken);
    if (tokenExpirationDate) {
      SecureStore.setItem('tokenExpirationDate', tokenExpirationDate.toString());
    }
    if (email) {
      SecureStore.setItem('email', email);
    }
    if (publicKey) {
      SecureStore.setItem('publicKey', publicKey);
    }
    this.session = session;
  }

  async load(): Promise<IAuthSession | null> {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    if (!accessToken) {
      return null;
    }

    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    const idToken = await SecureStore.getItemAsync('idToken');
    const tokenExpirationDate = await SecureStore.getItemAsync('tokenExpirationDate');
    const email = await SecureStore.getItemAsync('email');
    const publicKey = await SecureStore.getItemAsync('publicKey');

    if (!refreshToken || !idToken || !tokenExpirationDate) {
      throw new Error('Invalid session');
    }

    const authSession: IAuthSession = {
      accessToken,
      refreshToken,
      idToken,
      tokenExpirationDate: new Date(tokenExpirationDate),
      email,
      publicKey,
    };
    this.session = authSession;
    return authSession;
  }

  async clear() {
    const keys = ['accessToken', 'refreshToken', 'idToken', 'tokenExpirationDate', 'email', 'publicKey'];
    const deletePromises = keys.map((key) => SecureStore.deleteItemAsync(key));

    Promise.all(deletePromises)
      .then(() => {
        console.log('All items deleted');
      })
      .catch((error) => {
        console.error('Error deleting items', error);
      });

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
    this.session = null;
  }
}

export const sessionStore = new SessionStore();
