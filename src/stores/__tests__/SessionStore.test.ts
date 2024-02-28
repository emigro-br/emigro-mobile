import * as SecureStore from 'expo-secure-store';

import { IAuthSession } from '@/types/IAuthSession';

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
  });

  it('should clear session', async () => {
    const session = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      tokenExpirationDate: new Date(),
      email: 'test@example.com',
      publicKey: 'public_key',
    };

    await sessionStore.save(session);
    await sessionStore.clear();
    const loadedSession = await sessionStore.load();

    expect(loadedSession).toBeNull();
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
    console.debug('U', updatedSession);

    expect(updatedSession?.publicKey).toBe(mockPublicKey);
  });
});
