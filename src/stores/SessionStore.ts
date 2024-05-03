import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { action, flow, makeAutoObservable, observable } from 'mobx';

import { UserPreferences } from '@/types/UserPreferences';
import { InvalidSessionError } from '@/types/errors';

import { refresh as refreshSession, signIn } from '@services/emigro/auth';
import { AuthSession, User, UserProfile } from '@services/emigro/types';
import { getUser, getUserProfile } from '@services/emigro/users';

export class SessionStore {
  // Observable states
  justLoggedIn = false;
  session: AuthSession | null = null;
  user: User | null = null;
  profile: UserProfile | null = null;
  preferences: UserPreferences | null = null;

  private authKeys: string[] = [
    'auth.accessToken',
    'auth.refreshToken',
    'auth.idToken',
    'auth.tokenExpirationDate',
    'auth.email',
    'auth.publicKey',
  ];

  private userKey = 'user.account';
  private profileKey = 'user.profile';
  private preferencesKey = 'user.preferences';

  constructor() {
    makeAutoObservable(this, {
      // session
      session: observable,
      setSession: action,

      // user
      user: observable,
      setUser: action,
      // fetchUser: flow,

      // profile
      profile: observable,
      setProfile: action,
      fetchProfile: flow,

      // preferences
      preferences: observable,
      setPreferences: action,

      // loggedIn
      justLoggedIn: observable,
      setJustLoggedIn: action,
    });
  }

  get accessToken() {
    return this.session?.accessToken;
  }

  get publicKey() {
    if (this.session && !this.user) {
      this.fetchUser();
    }
    return this.user?.publicKey;
  }

  setSession(session: AuthSession | null) {
    this.session = session;
  }

  setUser(user: User | null) {
    this.user = user;
  }

  setProfile(profile: UserProfile | null) {
    this.profile = profile;
  }

  setPreferences(preferences: UserPreferences | null) {
    this.preferences = preferences;
  }

  setJustLoggedIn(justLoggedIn: boolean) {
    this.justLoggedIn = justLoggedIn;
  }

  async fetchUser() {
    console.debug('Fetching user...');
    const user = await getUser();
    if (user) {
      // update user and preferences in memory to keep the app in sync
      this.setUser(user);
      this.setPreferences(user.preferences);
      await this.saveUser(user);
    }
    return user;
  }

  async *fetchProfile() {
    if (this.session) {
      console.debug('Fetching profile...');
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

  async save(session: AuthSession) {
    this.setSession(session); // FIXME: we can not replace when is only a partial update
    await Promise.all(
      Object.entries(session)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => SecureStore.setItemAsync(`auth.${key}`, JSON.stringify(value))),
    );
  }

  async saveUser(user: User) {
    await Promise.all([
      SecureStore.setItemAsync(this.userKey, JSON.stringify(user)),
      // SecureStore has value limit, so we prefer to save preferences separately
      SecureStore.setItemAsync(this.preferencesKey, JSON.stringify(user.preferences ?? {})),
    ]);
  }

  async saveProfile(profile: UserProfile) {
    // this.setProfile(profile);
    await SecureStore.setItemAsync(this.profileKey, JSON.stringify(profile));
  }

  async savePreferences(preferences: UserPreferences) {
    // TODO: merge prefences??
    await SecureStore.setItemAsync(this.preferencesKey, JSON.stringify(preferences));
    this.setPreferences(preferences);
  }

  load = async (): Promise<AuthSession | null> => {
    const session = await this.loadSession();
    this.setSession(session as AuthSession);
    if (session) {
      this.loadUser(); // load user in background
      this.loadProfile(); // load profile in background
      this.loadPreferences(); // load preferences in background
    }
    return session;
  };

  async loadSession(): Promise<AuthSession | null> {
    const session: Partial<AuthSession> = {};
    await Promise.all(
      this.authKeys.map(async (key) => {
        const value = await SecureStore.getItemAsync(key);
        if (value) {
          const [, attr] = key.split('.');
          session[attr as keyof AuthSession] = JSON.parse(value);
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
    return session as AuthSession;
  }

  async loadUser(): Promise<User | null> {
    const user = await SecureStore.getItemAsync(this.userKey);
    if (user) {
      this.setUser(JSON.parse(user));
    }
    return this.user;
  }

  async loadProfile(): Promise<UserProfile | null> {
    const profile = await SecureStore.getItemAsync(this.profileKey);
    if (profile) {
      this.setProfile(JSON.parse(profile));
    }
    return this.profile;
  }

  async loadPreferences(): Promise<UserPreferences | null> {
    const preferences = await SecureStore.getItemAsync(this.preferencesKey);
    if (preferences) {
      this.setPreferences(JSON.parse(preferences));
    }
    return this.preferences;
  }

  async clear() {
    await Promise.all(this.authKeys.map((key) => SecureStore.deleteItemAsync(key)));
    this.setSession(null);

    await SecureStore.deleteItemAsync(this.userKey);
    this.setUser(null);

    await SecureStore.deleteItemAsync(this.profileKey);
    this.setProfile(null);

    await SecureStore.deleteItemAsync(this.preferencesKey);
    this.setPreferences(null);

    await this.clearPin();
    this.setJustLoggedIn(false);
  }

  signIn = async (email: string, password: string) => {
    const { session, user } = await signIn(email, password);
    this.setUser(user);
    this.setPreferences(user.preferences);
    this.saveUser(user);

    this.setSession(session);
    this.save(session);
    this.setJustLoggedIn(true);

    // Fetch the user data in background
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
