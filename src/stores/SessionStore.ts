import { Platform } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as SecureStore from 'expo-secure-store';
import { makeAutoObservable } from 'mobx';

import { IAuthSession } from '../types/IAuthSession';

export class SessionStore {
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

  async save(session: IAuthSession) {
    this.session = session;
    await Promise.all(
      Object.entries(session).map(([key, value]) => SecureStore.setItemAsync(key, JSON.stringify(value))),
    );
  }

  async load(): Promise<IAuthSession | null> {
    const keys = ['accessToken', 'refreshToken', 'idToken', 'tokenExpirationDate', 'email', 'publicKey'];
    const session: Partial<IAuthSession> = {};
    await Promise.all(
      keys.map(async (key) => {
        const value = await SecureStore.getItemAsync(key);
        if (value) {
          session[key as keyof IAuthSession] = JSON.parse(value);
          if (key === 'tokenExpirationDate') {
            session.tokenExpirationDate = new Date(session.tokenExpirationDate!);
          }
        }
      }),
    );

    if (!session.accessToken) {
      return null;
    }
    if (!session.refreshToken || !session.idToken || !session.tokenExpirationDate) {
      throw new Error('Invalid session');
    }
    this.session = session as IAuthSession;
    return this.session;
  }

  async clear() {
    const keys = ['accessToken', 'refreshToken', 'idToken', 'tokenExpirationDate', 'email', 'publicKey'];
    await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));
    this.session = null;

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
}

export const sessionStore = new SessionStore();
