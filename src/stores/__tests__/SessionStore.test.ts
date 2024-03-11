import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { IAuthSession } from '@/types/IAuthSession';
import { IUserProfile } from '@/types/IUserProfile';

import { refresh as refreshSession } from '@services/auth';
import { getUserPublicKey } from '@services/emigro';

import { SessionStore } from '../SessionStore';

jest.mock('expo-secure-store');

jest.mock('@services/auth', () => ({
  refresh: jest.fn(),
}));

jest.mock('@services/emigro', () => ({
  getUserPublicKey: jest.fn(),
}));

describe('SessionStore', () => {
  let sessionStore: SessionStore;

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
    const session: IAuthSession = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      tokenExpirationDate: new Date(),
      email: 'test@example.com',
      publicKey: 'public_key',
    };

    sessionStore.save(session);
    const loadedSession = await sessionStore.load();

    expect(loadedSession).toEqual(session);
    expect(sessionStore.session).toEqual(session);
  });

  it('should save and load profile', async () => {
    const profile = {
      given_name: 'test',
      email: 'email@examle.com',
    } as IUserProfile;

    sessionStore.saveProfile(profile);
    const loadedProfile = await sessionStore.loadProfile();
    expect(loadedProfile).toEqual(profile);
    expect(sessionStore.profile).toEqual(profile);
  });

  it('should clear session and profile', async () => {
    const session = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      tokenExpirationDate: new Date(),
      email: 'test@example.com',
      publicKey: 'public_key',
    };

    const profile = {
      given_name: 'test',
      email: 'teste@example.com',
    } as IUserProfile;

    await sessionStore.save(session);
    await sessionStore.saveProfile(profile);
    await sessionStore.clear();
    const loadedSession = await sessionStore.load();

    expect(loadedSession).toBeNull();
    expect(sessionStore.session).toBeNull();
    expect(sessionStore.profile).toBeNull();
  });

  it('should get access token', () => {
    const session = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      tokenExpirationDate: new Date(),
      email: 'test@example.com',
      publicKey: 'public_key',
    };

    sessionStore.save(session);
    expect(sessionStore.accessToken).toBe(session.accessToken);
  });

  it('should get public key', () => {
    const session = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      tokenExpirationDate: new Date(),
      email: 'test@example.com',
      publicKey: 'public_key',
    };

    sessionStore.save(session);
    expect(sessionStore.publicKey).toBe(session.publicKey);
  });

  it('should refresh session', async () => {
    // set a previous session
    const mockSession: IAuthSession = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      email: 'email',
      tokenExpirationDate: new Date(),
    };
    sessionStore.save(mockSession);

    // mock refresh session
    const mockNewSession: IAuthSession = {
      accessToken: 'new_access_token',
      refreshToken: 'new_refresh_token',
      idToken: 'new_id_token',
      email: 'new_email',
      tokenExpirationDate: new Date(),
    };
    (refreshSession as jest.Mock).mockResolvedValue(mockNewSession);

    // refresh session
    await sessionStore.refresh();
    const loadedSession = await sessionStore.load();

    expect(loadedSession).toEqual(mockNewSession);
  });

  it('should return true if token is expired', async () => {
    const expiredSession: IAuthSession = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      tokenExpirationDate: new Date('2021-01-01'), // Expired date in the past
      email: 'test@example.com',
      publicKey: 'public_key',
    };

    await sessionStore.save(expiredSession);
    expect(sessionStore.isTokenExpired).toBe(true);
  });

  it('should return false if token is not expired', async () => {
    const validSession: IAuthSession = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      tokenExpirationDate: new Date('2050-01-01'), // Valid date in the future
      email: 'test@example.com',
      publicKey: 'public_key',
    };

    await sessionStore.save(validSession);
    expect(sessionStore.isTokenExpired).toBe(false);
  });

  it('should fetch user public key and update session', async () => {
    const mockPublicKey = 'mock_public_key';
    const mockSession: IAuthSession = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      tokenExpirationDate: new Date(),
      email: 'test@example.com',
      publicKey: null,
    };

    (getUserPublicKey as jest.Mock).mockResolvedValue(mockPublicKey);

    await sessionStore.save(mockSession);
    await sessionStore.fetchPublicKey();

    const updatedSession = await sessionStore.load();

    expect(updatedSession?.publicKey).toBe(mockPublicKey);
  });

  describe('PIN', () => {
    it('should save PIN', async () => {
      const pin = '1234';
      const hashedPin = 'hashed_1234';

      jest.spyOn(Crypto, 'digestStringAsync').mockResolvedValue(hashedPin);

      await sessionStore.savePin(pin);

      expect(Crypto.digestStringAsync).toHaveBeenCalledWith(Crypto.CryptoDigestAlgorithm.SHA256, pin);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('pin', hashedPin);
    });

    it('should load PIN', async () => {
      const pin = '1234';
      const hashedPin = 'hashed_1234';
      jest.spyOn(Crypto, 'digestStringAsync').mockResolvedValue(hashedPin);

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

    // test verifyPin
    it('should return true if the PIN is correct', async () => {
      const pin = '1234';
      const hashedPin = 'hashed_1234';
      jest.spyOn(Crypto, 'digestStringAsync').mockResolvedValue(hashedPin);

      await sessionStore.savePin(pin);
      const result = await sessionStore.verifyPin(pin);

      expect(result).toBe(true);
    });
  });
});
