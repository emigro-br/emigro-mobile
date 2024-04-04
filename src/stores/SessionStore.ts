import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { action, flow, makeAutoObservable, observable } from 'mobx';

import { IUserProfile } from '@/types/IUserProfile';
import { InvalidSessionError } from '@/types/errors';

import { refresh as refreshSession } from '@services/auth';
import { getUserProfile, getUserPublicKey } from '@services/emigro';

import { IAuthSession } from '../types/IAuthSession';

export class SessionStore {
  // Observable states
  justLoggedIn = false;
  session: IAuthSession | null = null;
  profile: IUserProfile | null = null;

  private authKeys: string[] = [
    'auth.accessToken',
    'auth.refreshToken',
    'auth.idToken',
    'auth.tokenExpirationDate',
    'auth.email',
    'auth.publicKey',
  ];
  private profileKey = 'user.profile';

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
      // loggedIn
      justLoggedIn: observable,
      setJustLoggedIn: action,
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

  setJustLoggedIn(justLoggedIn: boolean) {
    this.justLoggedIn = justLoggedIn;
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
        await this.saveProfile(profile);
      }
      return profile;
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
        .map(([key, value]) => SecureStore.setItemAsync(`auth.${key}`, JSON.stringify(value))),
    );
  }

  async saveProfile(profile: IUserProfile) {
    // this.setProfile(profile);
    await SecureStore.setItemAsync(this.profileKey, JSON.stringify(profile));
  }

  load = async (): Promise<IAuthSession | null> => {
    const session: Partial<IAuthSession> = {};
    await Promise.all(
      this.authKeys.map(async (key) => {
        const value = await SecureStore.getItemAsync(key);
        if (value) {
          const [, attr] = key.split('.');
          session[attr as keyof IAuthSession] = JSON.parse(value);
          if (attr === 'tokenExpirationDate') {
            session.tokenExpirationDate = new Date(session.tokenExpirationDate!);
          }
        }
      }),
    );

    if (!session.accessToken) {
      return null;
    }
    if (!session.refreshToken || !session.idToken || !session.tokenExpirationDate) {
      throw new InvalidSessionError();
    }

    this.setSession(session as IAuthSession);
    this.loadProfile(); // load profile in background
    return this.session;
  };

  async loadProfile(): Promise<IUserProfile | null> {
    const profile = await SecureStore.getItemAsync(this.profileKey);
    if (profile) {
      this.setProfile(JSON.parse(profile));
    }
    return this.profile;
  }

  async clear() {
    await Promise.all(this.authKeys.map((key) => SecureStore.deleteItemAsync(key)));
    this.setSession(null);

    await SecureStore.deleteItemAsync(this.profileKey);
    this.setProfile(null);

    await this.clearPin();
    this.setJustLoggedIn(false);
  }

  signIn = async (session: IAuthSession) => {
    this.setSession(session);
    this.save(session);
    this.setJustLoggedIn(true);

    // Fetch the user data in background
    this.fetchPublicKey();
    this.fetchProfile();
  };

  async signOut() {
    await this.clear();
  }

  refresh = async () => {
    if (!this.session) {
      await this.load(); // workaround for InvalidSession when refreshing
      if (!this.session) {
        throw new InvalidSessionError();
      }
    }

    const newSession = await refreshSession(this.session);
    if (newSession) {
      newSession.publicKey = this.session.publicKey; // FIXME: workaround to avoid losing the public key on save
      await this.save(newSession);
      return this.session;
    }
  };

  async savePin(pin: string) {
    // Hash the PIN before saving it
    const hashedPin = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
    await SecureStore.setItemAsync('pin', hashedPin);
  }

  async loadPin(): Promise<string | null> {
    return await SecureStore.getItemAsync('pin');
  }

  async clearPin() {
    await SecureStore.deleteItemAsync('pin');
  }

  verifyPin = async (pin: string): Promise<boolean> => {
    const hashedPin = await this.loadPin();
    if (!hashedPin) {
      throw new Error('PIN not set');
    }

    // Hash the input PIN and compare it with the stored hashed PIN
    const inputHashedPin = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
    return hashedPin === inputHashedPin;
  };
}

export const sessionStore = new SessionStore();
