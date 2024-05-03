import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { UserPreferences } from '@/types/UserPreferences';
import { FiatCurrency } from '@/types/assets';

import * as authService from '@services/emigro/auth';
import { AuthSession, Role, User, UserCredential, UserProfile } from '@services/emigro/types';
import * as usersService from '@services/emigro/users';

import { SessionStore } from '../SessionStore';

jest.mock('expo-secure-store');

jest.mock('@services/emigro/auth', () => ({
  signIn: jest.fn(),
  refresh: jest.fn(),
}));

jest.mock('@services/emigro/users', () => ({
  getUser: jest.fn(),
  getUserProfile: jest.fn(),
  saveUserPreferences: jest.fn(),
}));

describe('SessionStore', () => {
  let sessionStore: SessionStore;
  const userMock: User = {
    id: 1,
    username: 'test-username',
    publicKey: 'test-public_key',
    secretKey: 'test-secret_key',
    role: Role.CUSTOMER,
    status: 'active',
    createdAt: '2021-01-01',
    updatedAt: '2021-01-01',
    preferences: {},
  };

  beforeEach(() => {
    jest.resetAllMocks();
    sessionStore = new SessionStore();
    const inMemoryStorage: Record<string, string> = {};

    (SecureStore.setItemAsync as jest.Mock).mockImplementation(async (key, value) => {
      // Save the value in memory
      inMemoryStorage[key] = value;
    });

    (SecureStore.getItemAsync as jest.Mock).mockImplementation(async (key) => {
      // Retrieve the value from memory
      return inMemoryStorage[key];
    });

    (SecureStore.deleteItemAsync as jest.Mock).mockImplementation(async (key) => {
      // delete the value from memory
      delete inMemoryStorage[key];
    });
  });

  it('should save and load session', async () => {
    const session: AuthSession = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      tokenExpirationDate: new Date(),
    };

    sessionStore.save(session);
    const loadedSession = await sessionStore.loadSession();

    expect(loadedSession).toEqual(session);
    expect(sessionStore.session).toEqual(session);
  });

  it('should save and load user', async () => {
    sessionStore.saveUser(userMock);
    const loadedUser = await sessionStore.loadUser();
    expect(loadedUser).toEqual(userMock);
    expect(sessionStore.user).toEqual(userMock);
  });

  it('should save and load profile', async () => {
    const profile = {
      given_name: 'test',
      email: 'email@examle.com',
    } as UserProfile;

    sessionStore.saveProfile(profile);
    const loadedProfile = await sessionStore.loadProfile();
    expect(loadedProfile).toEqual(profile);
    expect(sessionStore.profile).toEqual(profile);
  });

  it('should save and load preferences', async () => {
    const preferences: UserPreferences = {
      fiatsWithBank: [FiatCurrency.USD],
    };

    sessionStore.updatePreferences(preferences);
    const loadedPreferences = await sessionStore.loadPreferences();
    expect(loadedPreferences).toEqual(preferences);
    expect(sessionStore.preferences).toEqual(preferences);
  });

  it('should clear session and profile', async () => {
    const session: AuthSession = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      tokenExpirationDate: new Date(),
    };

    const profile = {
      given_name: 'test',
      email: 'teste@example.com',
    } as UserProfile;

    const preferences: UserPreferences = {
      fiatsWithBank: [FiatCurrency.USD],
    };

    await sessionStore.save(session);
    await sessionStore.saveProfile(profile);
    await sessionStore.updatePreferences(preferences);

    // clear everything
    await sessionStore.clear();
    const loadedSession = await sessionStore.load();

    expect(loadedSession).toBeNull();
    expect(sessionStore.session).toBeNull();
    expect(sessionStore.profile).toBeNull();
    expect(sessionStore.preferences).toBeNull();
    expect(sessionStore.justLoggedIn).toBe(false);
    expect(sessionStore.publicKey).toBeUndefined();
    expect(sessionStore.accessToken).toBeUndefined();
    expect(sessionStore.loadPin()).resolves.toBeUndefined();
  });

  it('should get access token', () => {
    const session = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      tokenExpirationDate: new Date(),
    };

    sessionStore.save(session);
    expect(sessionStore.accessToken).toBe(session.accessToken);
  });

  it('should get public key', () => {
    sessionStore.setUser(userMock);
    expect(sessionStore.publicKey).toBe(userMock.publicKey);
  });

  it('should fetch user when try to get public key', () => {
    const fetchUserSpy = jest.spyOn(sessionStore, 'fetchUser');
    const mockSession: AuthSession = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      tokenExpirationDate: new Date(),
    };
    // set session without user
    sessionStore.setSession(mockSession);
    sessionStore.setUser(null);

    expect(sessionStore.publicKey).toBeUndefined();
    expect(fetchUserSpy).toHaveBeenCalled();
  });

  it('should refresh session', async () => {
    // set a previous session
    const mockSession: AuthSession = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      tokenExpirationDate: new Date(),
    };
    sessionStore.save(mockSession);

    // mock refresh session
    const mockNewSession: AuthSession = {
      accessToken: 'new_access_token',
      refreshToken: 'new_refresh_token',
      idToken: 'new_id_token',
      tokenExpirationDate: new Date(),
    };
    jest.spyOn(authService, 'refresh').mockResolvedValueOnce(mockNewSession);

    // refresh session
    await sessionStore.refresh();
    const loadedSession = await sessionStore.load();

    expect(loadedSession).toEqual(mockNewSession);
  });

  it('should return true if token is expired', async () => {
    const expiredSession: AuthSession = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      tokenExpirationDate: new Date('2021-01-01'), // Expired date in the past
    };

    await sessionStore.save(expiredSession);
    expect(sessionStore.isTokenExpired).toBe(true);
  });

  it('should return false if token is not expired', async () => {
    const validSession: AuthSession = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      tokenExpirationDate: new Date('2050-01-01'), // Valid date in the future
    };

    await sessionStore.save(validSession);
    expect(sessionStore.isTokenExpired).toBe(false);
  });

  it('should fetch user and update ', async () => {
    const getUserSpy = jest.spyOn(usersService, 'getUser').mockResolvedValueOnce(userMock);
    const saveUserSpy = jest.spyOn(sessionStore, 'saveUser');

    await sessionStore.fetchUser();
    expect(sessionStore.user).toEqual(userMock);
    expect(sessionStore.preferences).toEqual(userMock.preferences);
    expect(getUserSpy).toHaveBeenCalled();
    expect(saveUserSpy).toHaveBeenCalledWith(userMock);
  });

  it('should sign in correctly', async () => {
    const fetchProfileSpy = jest.spyOn(sessionStore, 'fetchProfile');
    const saveSpy = jest.spyOn(sessionStore, 'save');

    const session: AuthSession = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      tokenExpirationDate: new Date(),
    };

    const mockUserCredential: UserCredential = {
      session,
      user: userMock,
    };
    jest.spyOn(authService, 'signIn').mockResolvedValueOnce(mockUserCredential);

    const email = 'test@example.com';
    const password = 'password';
    await sessionStore.signIn(email, password);

    expect(sessionStore.session).toEqual(session);
    expect(sessionStore.user).toEqual(userMock);
    expect(sessionStore.preferences).toEqual(userMock.preferences);

    // should set just logged in flag to true
    const justLoggedIn = sessionStore.justLoggedIn;
    expect(justLoggedIn).toBe(true);

    // should fetch public  and profile
    expect(authService.signIn).toHaveBeenCalled();
    expect(saveSpy).toHaveBeenCalledWith(session);
    expect(fetchProfileSpy).toHaveBeenCalled();
  });

  it('should sign out correctly', async () => {
    jest.spyOn(sessionStore, 'clear').mockResolvedValueOnce(undefined as never);

    await sessionStore.signOut();

    expect(sessionStore.clear).toHaveBeenCalledTimes(1);
  });

  describe('PIN', () => {
    it('should save PIN', async () => {
      const pin = '1234';
      const hashedPin = 'hashed_1234';

      jest.spyOn(Crypto, 'digestStringAsync').mockResolvedValueOnce(hashedPin);

      await sessionStore.savePin(pin);

      expect(Crypto.digestStringAsync).toHaveBeenCalledWith(Crypto.CryptoDigestAlgorithm.SHA256, pin);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('pin', hashedPin);
    });

    it('should load PIN', async () => {
      const pin = '1234';
      const hashedPin = 'hashed_1234';
      jest.spyOn(Crypto, 'digestStringAsync').mockResolvedValueOnce(hashedPin);

      await sessionStore.savePin(pin);
      const loadedPin = await sessionStore.loadPin();

      expect(loadedPin).toBe(hashedPin);
    });

    it('should return null if there is no PIN', async () => {
      const loadedPin = await sessionStore.loadPin();

      expect(loadedPin).toBeUndefined();
    });

    it('should clear PIN', async () => {
      await sessionStore.savePin('1234');
      await sessionStore.clearPin();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('pin');
    });

    it('should return true if the PIN is correct', async () => {
      const pin = '1234';
      const hashedPin = 'hashed_1234';
      jest.spyOn(Crypto, 'digestStringAsync').mockResolvedValue(hashedPin);

      await sessionStore.savePin(pin);
      const result = await sessionStore.verifyPin(pin);

      expect(result).toBe(true);
    });

    it('should return false if the PIN is incorrect', async () => {
      const pin = '1234';
      jest.spyOn(Crypto, 'digestStringAsync').mockResolvedValueOnce('hashed_1234');

      await sessionStore.savePin(pin);

      jest.spyOn(Crypto, 'digestStringAsync').mockResolvedValueOnce('hashed_4321');
      const result = await sessionStore.verifyPin('4321');

      expect(result).toBe(false);
    });

    it('should throw an error if there is no PIN', async () => {
      await expect(sessionStore.verifyPin('1234')).rejects.toThrow('PIN not set');
    });
  });
});
