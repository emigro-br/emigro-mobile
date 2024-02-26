import * as SecureStore from 'expo-secure-store';

import { IAuthSession } from '@/types/IAuthSession';

import { refresh as refreshSession } from '@services/auth';

import { SessionStore } from '../SessionStore';

jest.mock('expo-secure-store');

jest.mock('@services/auth', () => ({
  refresh: jest.fn(),
}));

describe('SessionStore', () => {
  let sessionStore: SessionStore;

  beforeEach(() => {
    jest.resetAllMocks();
    sessionStore = new SessionStore();
  });

  it('should save and load session', async () => {
    const inMemoryStorage: Record<string, string> = {};

    (SecureStore.setItemAsync as jest.Mock).mockImplementation(async (key, value) => {
      // Save the value in memory
      inMemoryStorage[key] = value;
    });

    (SecureStore.getItemAsync as jest.Mock).mockImplementation(async (key) => {
      // Retrieve the value from memory
      return inMemoryStorage[key];
    });

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

    sessionStore.save(session);
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
    const accessToken = sessionStore.getAccessToken();

    expect(accessToken).toBe(session.accessToken);
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
    const publicKey = sessionStore.getPublicKey();

    expect(publicKey).toBe(session.publicKey);
  });

  it('should refresh session', async () => {
    const inMemoryStorage: Record<string, string> = {};
    (SecureStore.setItemAsync as jest.Mock).mockImplementation(async (key, value) => {
      inMemoryStorage[key] = value;
    });
    (SecureStore.getItemAsync as jest.Mock).mockImplementation(async (key) => inMemoryStorage[key]);

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
});
