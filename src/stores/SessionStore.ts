import * as SecureStore from 'expo-secure-store';
import { action, flow, makeAutoObservable, observable } from 'mobx';

import { refresh as refreshSession, signIn } from '@/services/emigro/auth';
import { AuthSession, User, UserProfile } from '@/services/emigro/types';
import { checkKycStatus, getUser, getUserProfile, saveUserPreferences } from '@/services/emigro/users';
import { UserPreferences } from '@/types/UserPreferences';
import { InvalidSessionError } from '@/types/errors';

import { securityStore } from './SecurityStore';

export class SessionStore {
  // Observable states
  justLoggedIn = false;
  session: AuthSession | null = null;
  user: User | null = null;
  profile: UserProfile | null = null;
  preferences: UserPreferences | null = null;

  evmWallet: { publicAddress: string } | null = null;

isUserInitialized = false;

setEvmWallet(wallet: { publicAddress: string } | null) {
  console.log('[SessionStore] Set EVM wallet:', wallet);
  this.evmWallet = wallet;
}

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

      // evmWallet
      evmWallet: observable, // ✅ added
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
  console.log('[SessionStore] setUser called with:', user);

  this.user = user;

  if ((user as any)?.evmWallet !== undefined) {
    console.log('[SessionStore] Updating evmWallet from user:', user.evmWallet);
    this.evmWallet = (user as any).evmWallet;
  } else {
    console.log('[SessionStore] Preserving existing evmWallet (no override)');
  }
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
    console.log('[fetchUser] API returned user:', user);
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

  /**
   * Checks the KYC status of the current user.
   * @returns An object containing the KYC status.
   */
  async checkKycStatus(): Promise<{ kycVerified: boolean }> {
    if (!this.user?.id) {
      throw new Error('User ID is not available');
    }
    return await checkKycStatus(this.user.id);
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
const userToStore = {
  ...user,
  evmWallet: this.evmWallet,
};

await Promise.all([
  SecureStore.setItemAsync(this.userKey, JSON.stringify(userToStore)),
  SecureStore.setItemAsync(this.preferencesKey, JSON.stringify(user.preferences ?? {})),
]);
    this.evmWallet = (user as any)?.evmWallet ?? null; // ✅ added
  }

  async saveProfile(profile: UserProfile) {
    // this.setProfile(profile);
    await SecureStore.setItemAsync(this.profileKey, JSON.stringify(profile));
  }

  async updatePreferences(preferences: UserPreferences) {
    // merge prefences
    const merged = { ...this.preferences, ...preferences };
    saveUserPreferences(merged); // save remotely in background (no need to wait for it)

    await SecureStore.setItemAsync(this.preferencesKey, JSON.stringify(merged));
    this.setPreferences(merged);
  }

load = async (): Promise<AuthSession | null> => {
  const session = await this.loadSession();
  this.setSession(session as AuthSession);
  if (session) {
    await this.loadUser();         // 🔄 MUST be awaited
    await this.loadProfile();      // optional, but cleaner
    await this.loadPreferences();  // optional
    await this.loadEvmWallet();    // ✅ this now runs last for real
  }
  return session;
};

async loadEvmWallet(): Promise<void> {
  const evmWallet = await SecureStore.getItemAsync('user.evmWallet');
  if (evmWallet) {
    console.log('[SessionStore] Loaded EVM wallet from storage:', evmWallet);
    this.setEvmWallet(JSON.parse(evmWallet));
  } else {
    console.log('[SessionStore] No EVM wallet found in storage');
    this.setEvmWallet(null);
  }
}

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
    const parsedUser = JSON.parse(user);
    this.setUser(parsedUser);

    // 🟢 Restore wallet if it was stored with user (future-proof)
    if (parsedUser.evmWallet) {
      this.setEvmWallet(parsedUser.evmWallet);
    }
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

    this.setJustLoggedIn(false);

    // Temporarily disable clearing PIN
    // securityStore.clearPin();
  }

signIn = async (email: string, password: string) => {
  const { session, user } = await signIn(email, password);
  console.log('[signIn] user returned from API:', user);

  this.setUser(user);
  this.setPreferences(user.preferences);
  this.saveUser(user);

  this.setSession(session);
  this.save(session);
  this.setJustLoggedIn(true);

  // 🟢 SET EVM WALLET HERE
  this.setEvmWallet(user.evmWallet ?? null);
  if (user.evmWallet) {
    await SecureStore.setItemAsync('user.evmWallet', JSON.stringify(user.evmWallet));
  }

  // Fetch the user data in background
  this.fetchProfile();
};

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
}

export const sessionStore = new SessionStore();
