import * as SecureStore from 'expo-secure-store';
import { Appearance } from 'react-native';
import { action, flow, makeAutoObservable, observable } from 'mobx';

import { refresh as refreshSession, signIn } from '@/services/emigro/auth';
import { AuthSession, User, UserProfile } from '@/services/emigro/types';
import { checkKycStatus, getUser, getUserProfile, saveUserPreferences } from '@/services/emigro/users';
import { UserPreferences } from '@/types/UserPreferences';

export class SessionStore {
  justLoggedIn = false;
  session: AuthSession | null = null;
  user: User | null = null;
  profile: UserProfile | null = null;
  preferences: UserPreferences | null = {
    themePreference: 'dark',
  };
  isLoaded = false;
  evmWallet: { publicAddress: string } | null = null;
  @observable cachedRewardPoints: number | null = null;

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

  setSession(session: Partial<AuthSession> | null) {
    if (!session) {
      this.session = null;
      return;
    }

    this.session = {
      accessToken: session.accessToken ?? '',
      refreshToken: session.refreshToken ?? '',
      idToken: session.idToken ?? '',
      tokenExpirationDate: session.tokenExpirationDate ?? new Date(Date.now() + 3600 * 1000),
    };
  }

  setUser(user: User | null) {
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

  @action setCachedRewardPoints(points: number) {
    this.cachedRewardPoints = points;
    SecureStore.setItemAsync('user.cachedRewardPoints', String(points));
  }

  setEvmWallet(wallet: { publicAddress: string } | null) {
    this.evmWallet = wallet;
  }

  async fetchUser() {
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
    const merged = { ...(this.preferences ?? {}), ...preferences };
    saveUserPreferences(merged); // fire-and-forget
    await SecureStore.setItemAsync(this.preferencesKey, JSON.stringify(merged));
    this.setPreferences(merged);
  }

  /**
   * Bullet-proof load:
   * - Clears local session on ANY failure (partial tokens, corrupt JSON, etc.)
   * - Always flips isLoaded = true so the UI can proceed to login.
   */
  async load(): Promise<AuthSession | null> {
    try {
      const session = await this.loadSession();
      this.setSession(session as AuthSession);

      if (session) {
        await this.loadUser();
        await this.loadProfile();
        await this.loadPreferences();
        await this.loadCachedRewardPoints();
        await this.loadEvmWallet();
      }
      return session;
    } catch {
      // Clear on ANY error; proceed as signed out
      try {
        await this.clear();
      } catch {}
      return null;
    } finally {
      this.isLoaded = true;
    }
  }

  async loadEvmWallet(): Promise<void> {
    const evmWallet = await SecureStore.getItemAsync('user.evmWallet');
    this.setEvmWallet(evmWallet ? JSON.parse(evmWallet) : null);
  }

  /**
   * Robust session loader:
   * - Tolerates bad JSON
   * - Self-heals partial sessions by nuking keys and returning null
   * - Never throws; caller treats null as "signed out"
   */
  async loadSession(): Promise<AuthSession | null> {
    const session: Partial<AuthSession> = {};

    await Promise.all(
      this.authKeys.map(async (key) => {
        const value = await SecureStore.getItemAsync(key);
        if (!value) return;

        const [, attr] = key.split('.');
        try {
          const parsed = JSON.parse(value);
          if (attr === 'tokenExpirationDate' && parsed) {
            session.tokenExpirationDate = new Date(parsed);
          } else {
            (session as any)[attr] = parsed;
          }
        } catch {
          // corrupted JSON for this key; ignore it
        }
      })
    );

    if (!session.accessToken) return null;

    const missing =
      !session.refreshToken || !session.idToken || !session.tokenExpirationDate;

    if (missing) {
      // self-heal: nuke all auth keys so next boot is clean
      await Promise.all(this.authKeys.map((k) => SecureStore.deleteItemAsync(k)));
      return null;
    }

    return session as AuthSession;
  }

  async loadUser(): Promise<User | null> {
    const user = await SecureStore.getItemAsync(this.userKey);
    if (user) {
      try {
        const parsed = JSON.parse(user);
        this.setUser(parsed);
        if (parsed.evmWallet) this.setEvmWallet(parsed.evmWallet);
      } catch {
        // corrupt user blob → drop it
        await SecureStore.deleteItemAsync(this.userKey);
        this.setUser(null);
      }
    }
    return this.user;
  }

  async loadProfile(): Promise<UserProfile | null> {
    const profile = await SecureStore.getItemAsync(this.profileKey);
    if (profile) {
      try {
        this.setProfile(JSON.parse(profile));
      } catch {
        await SecureStore.deleteItemAsync(this.profileKey);
        this.setProfile(null);
      }
    }
    return this.profile;
  }

  async loadPreferences(): Promise<UserPreferences> {
    const stored = await SecureStore.getItemAsync(this.preferencesKey);
    let prefs: UserPreferences = { themePreference: 'dark' };
    if (stored) {
      try {
        prefs = { ...prefs, ...JSON.parse(stored) };
      } catch {
        await SecureStore.deleteItemAsync(this.preferencesKey);
      }
    }
    this.setPreferences(prefs);
    return prefs;
  }

  async loadCachedRewardPoints() {
    const value = await SecureStore.getItemAsync('user.cachedRewardPoints');
    if (value) {
      const parsed = Number(value);
      if (!isNaN(parsed)) {
        this.cachedRewardPoints = parsed;
      } else {
        await SecureStore.deleteItemAsync('user.cachedRewardPoints');
      }
    }
  }

  async oauthLoginFromTokens(idToken: string, accessToken: string) {
    const session = { idToken, accessToken } as Partial<AuthSession>;
    this.setSession(session);
    await this.save(session as AuthSession);
  }

  async clear() {
    await Promise.all(this.authKeys.map((key) => SecureStore.deleteItemAsync(key)));
    await SecureStore.deleteItemAsync(this.userKey);
    await SecureStore.deleteItemAsync(this.profileKey);
    await SecureStore.deleteItemAsync(this.preferencesKey);
    await SecureStore.deleteItemAsync('user.cachedRewardPoints');
    this.cachedRewardPoints = null;
    this.setSession(null);
    this.setUser(null);
    this.setProfile(null);
    this.setPreferences({ themePreference: 'dark' });
    this.setJustLoggedIn(false);
  }

  signIn = async (email: string, password: string) => {
    const { session, user } = await signIn(email, password);

    const isUnconfirmed =
      user?.status === 'UNCONFIRMED' ||
      user?.emailVerified === false ||
      user?.confirmed === false ||
      user?.isConfirmed === false;

    if (isUnconfirmed) {
      const err: any = new Error('User is not confirmed');
      err.response = {
        status: 409,
        data: {
          code: 'USER_NOT_CONFIRMED',
          pendingConfirmation: true,
          externalId: user?.externalId ?? user?.id ?? '',
        },
      };
      throw err;
    }

    this.setUser(user);
    this.setPreferences(user.preferences);
    await this.saveUser(user);

    this.setSession(session);
    await this.save(session);

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
      if (!this.session) throw new Error('No session');
    }

    const newSession = await refreshSession(this.session as AuthSession);
    if (newSession) {
      await this.save(newSession);
      return this.session;
    }
  };
}

export const sessionStore = new SessionStore();
