import * as SecureStore from 'expo-secure-store';
import { Appearance } from 'react-native';
import { action, flow, makeAutoObservable, observable } from 'mobx';

import { refresh as refreshSession, signIn } from '@/services/emigro/auth';
import { AuthSession, User, UserProfile } from '@/services/emigro/types';
import { checkKycStatus, getUser, getUserProfile, saveUserPreferences } from '@/services/emigro/users';
import { UserPreferences } from '@/types/UserPreferences';
import { InvalidSessionError } from '@/types/errors';

import { securityStore } from './SecurityStore';

export class SessionStore {
  justLoggedIn = false;
  session: AuthSession | null = null;
  user: User | null = null;
  profile: UserProfile | null = null;
  preferences: UserPreferences | null = {
    themePreference: 'dark', // ✅ default
  };

  evmWallet: { publicAddress: string } | null = null;

  isUserInitialized = false;

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
      session: observable,
      user: observable,
      profile: observable,
      preferences: observable,
      justLoggedIn: observable,
      evmWallet: observable,

      setSession: action,
      setUser: action,
      setProfile: action,
      setPreferences: action,
      setJustLoggedIn: action,
      fetchProfile: flow,
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

  get effectiveTheme(): 'dark' | 'light' {
    const pref = this.preferences?.themePreference;
    if (pref === 'dark' || pref === 'light') return pref;
    const system = Appearance?.getColorScheme?.();
    return system === 'light' ? 'light' : 'dark';
  }

  async updateThemePreference(theme: 'dark' | 'light' | 'system') {
    await this.updatePreferences({ themePreference: theme });
  }

  setSession(session: AuthSession | null) {
    this.session = session;
  }

  setUser(user: User | null) {
    //console.log('[SessionStore] setUser called with:', user);
    this.user = user;
    if ((user as any)?.evmWallet !== undefined) {
      this.evmWallet = (user as any).evmWallet;
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

  setEvmWallet(wallet: { publicAddress: string } | null) {
    //console.log('[SessionStore] Set EVM wallet:', wallet);
    this.evmWallet = wallet;
  }

  async fetchUser() {
    //console.debug('Fetching user...');
    const user = await getUser();
    if (user) {
      this.setUser(user);
      this.setPreferences(user.preferences);
      await this.saveUser(user);
    }
    return user;
  }

  async *fetchProfile() {
    if (this.session) {
      const profile = await getUserProfile(this.session);
      if (profile) {
        this.setProfile(profile);
        await this.saveProfile(profile);
      }
      return profile;
    }
  }

  async checkKycStatus(): Promise<{ kycVerified: boolean }> {
    if (!this.user?.id) throw new Error('User ID is not available');
    return await checkKycStatus(this.user.id);
  }

  async updateStartupMode(mode: 'wallet' | 'payment') {
    await this.updatePreferences({ startupMode: mode });
  }
  
  get isTokenExpired(): boolean {
    return !this.session || this.session.tokenExpirationDate < new Date();
  }

  async save(session: AuthSession) {
    this.setSession(session);
    await Promise.all(
      Object.entries(session)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => SecureStore.setItemAsync(`auth.${key}`, JSON.stringify(value)))
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

    this.evmWallet = (user as any)?.evmWallet ?? null;
  }

  async saveProfile(profile: UserProfile) {
    await SecureStore.setItemAsync(this.profileKey, JSON.stringify(profile));
  }

  async updatePreferences(preferences: UserPreferences) {
    const merged = { ...this.preferences, ...preferences };
    saveUserPreferences(merged); // async background
    await SecureStore.setItemAsync(this.preferencesKey, JSON.stringify(merged));
    this.setPreferences(merged);
  }

  async load(): Promise<AuthSession | null> {
    const session = await this.loadSession();
    this.setSession(session as AuthSession);
    if (session) {
      await this.loadUser();
      await this.loadProfile();
      await this.loadPreferences();
      await this.loadEvmWallet();
    }
    return session;
  }

  async loadEvmWallet(): Promise<void> {
    const evmWallet = await SecureStore.getItemAsync('user.evmWallet');
    this.setEvmWallet(evmWallet ? JSON.parse(evmWallet) : null);
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
      })
    );

    if (!session.accessToken) return null;
    if (!session.refreshToken || !session.idToken || !session.tokenExpirationDate) {
      throw new InvalidSessionError();
    }

    return session as AuthSession;
  }

  async loadUser(): Promise<User | null> {
    const user = await SecureStore.getItemAsync(this.userKey);
    if (user) {
      const parsed = JSON.parse(user);
      this.setUser(parsed);
      if (parsed.evmWallet) this.setEvmWallet(parsed.evmWallet);
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

  async loadPreferences(): Promise<UserPreferences> {
    const stored = await SecureStore.getItemAsync(this.preferencesKey);
    let prefs: UserPreferences = { themePreference: 'dark' };
    if (stored) {
      try {
        prefs = { ...prefs, ...JSON.parse(stored) };
      } catch (e) {
        console.warn('[SessionStore] Failed to parse preferences:', e);
      }
    }
    this.setPreferences(prefs);
    return prefs;
  }

  async clear() {
    await Promise.all(this.authKeys.map((key) => SecureStore.deleteItemAsync(key)));
    await SecureStore.deleteItemAsync(this.userKey);
    await SecureStore.deleteItemAsync(this.profileKey);
    await SecureStore.deleteItemAsync(this.preferencesKey);

    this.setSession(null);
    this.setUser(null);
    this.setProfile(null);
    this.setPreferences({ themePreference: 'dark' });
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

    this.setEvmWallet(user.evmWallet ?? null);
    if (user.evmWallet) {
      await SecureStore.setItemAsync('user.evmWallet', JSON.stringify(user.evmWallet));
    }

    this.fetchProfile();
  };

  refresh = async () => {
    if (!this.session) {
      await this.load();
      if (!this.session) throw new InvalidSessionError();
    }

    const newSession = await refreshSession(this.session);
    if (newSession) {
      await this.save(newSession);
      return this.session;
    }
  };
}

export const sessionStore = new SessionStore();
