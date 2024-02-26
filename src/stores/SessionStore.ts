import * as SecureStore from 'expo-secure-store';
import { makeAutoObservable } from 'mobx';

import { refresh as refreshSession } from '@services/auth';

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
    this.session = session; // FIXME: we can not replace when is only a partial update
    await Promise.all(
      Object.entries(session)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => SecureStore.setItemAsync(key, JSON.stringify(value))),
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
  }

  async refresh() {
    if (!this.session) {
      return null;
    }

    const newSession = await refreshSession(this.session);
    if (newSession) {
      await this.save(newSession);
      return this.session;
    }
  }
}

export const sessionStore = new SessionStore();
