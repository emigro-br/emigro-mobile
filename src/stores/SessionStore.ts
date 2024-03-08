import * as SecureStore from 'expo-secure-store';
import { action, flow, makeAutoObservable, observable } from 'mobx';

import { IUserProfile } from '@/types/IUserProfile';

import { refresh as refreshSession } from '@services/auth';
import { getUserProfile, getUserPublicKey } from '@services/emigro';

import { IAuthSession } from '../types/IAuthSession';

export class SessionStore {
  // Observable state
  session: IAuthSession | null = null;
  profile: IUserProfile | null = null;

  constructor() {
    makeAutoObservable(this, {
      // session
      session: observable,
      setSession: action,
      setPublicKey: action,
      fetchPublicKey: flow,
      // profile
      profile: observable,
      setProfile: action,
      fetchProfile: flow,
    });
  }

  get accessToken() {
    return this.session?.accessToken;
  }

  get publicKey() {
    if (this.session && !this.session.publicKey) {
      this.fetchPublicKey();
    }
    return this.session?.publicKey;
  }

  setSession(session: IAuthSession | null) {
    this.session = session;
  }

  setPublicKey(publicKey: string) {
    if (this.session) {
      this.session.publicKey = publicKey;
    }
  }

  setProfile(profile: IUserProfile | null) {
    this.profile = profile;
  }

  async *fetchPublicKey() {
    console.debug('Fetching user public key...');
    const publicKey = await getUserPublicKey();
    if (this.session && publicKey) {
      this.setPublicKey(publicKey); // action will be called
      await this.save(this.session);
    }
    return publicKey;
  }

  async *fetchProfile() {
    if (this.session) {
      console.debug('Fetching user profile...');
      const profile = await getUserProfile(this.session);
      if (profile) {
        this.setProfile(profile); // action will be called
      }
    }
  }

  get isTokenExpired(): boolean {
    return !this.session ? true : this.session?.tokenExpirationDate < new Date();
  }

  async save(session: IAuthSession) {
    this.setSession(session); // FIXME: we can not replace when is only a partial update
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
    this.setSession(session as IAuthSession);
    return this.session;
  }

  async clear() {
    const keys = ['accessToken', 'refreshToken', 'idToken', 'tokenExpirationDate', 'email', 'publicKey'];
    await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));
    this.setSession(null);
  }

  async refresh() {
    if (!this.session) {
      return null;
    }

    const newSession = await refreshSession(this.session);
    if (newSession) {
      newSession.publicKey = this.session.publicKey; // FIXME: workaround to avoid losing the public key on save
      await this.save(newSession);
      return this.session;
    }
  }
}

export const sessionStore = new SessionStore();
