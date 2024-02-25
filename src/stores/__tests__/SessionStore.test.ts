import AsyncStorage from '@react-native-async-storage/async-storage';

import * as SecureStore from 'expo-secure-store';

import { SessionStore } from '../SessionStore';

jest.mock('expo-secure-store');

jest.mock('@react-native-async-storage/async-storage', () => ({
  multiSet: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
  clear: jest.fn(),
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

    const session = {
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
    (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);

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
});
