import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { SecurityStore } from '@/stores/SecurityStore';

jest.mock('expo-secure-store');

describe('SecurityStore', () => {
  let securityStore: SecurityStore;
  const algotithm = Crypto.CryptoDigestAlgorithm.SHA256;

  beforeEach(() => {
    jest.clearAllMocks();
    SecureStore.clear(); // eslint-disable-line import/namespace
    securityStore = new SecurityStore();
  });

  it('should set the PIN', () => {
    const pin = '1234';
    securityStore.setPin(pin);
    expect(securityStore.pin).toBe(pin);
  });

  it('should save the PIN', async () => {
    const pin = '1234';
    const hashedPin = 'hashedPin';

    jest.spyOn(Crypto, 'digestStringAsync').mockResolvedValueOnce(hashedPin);

    await securityStore.savePin(pin);

    expect(Crypto.digestStringAsync).toHaveBeenCalledWith(algotithm, pin);
    expect(securityStore.pin).toBe(hashedPin);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('pin', hashedPin);
  });

  it('should load the PIN', async () => {
    const hashedPin = 'hashedPin';

    jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValueOnce(hashedPin);

    const loadedPin = await securityStore.loadPin();

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('pin');
    expect(loadedPin).toBe(hashedPin);
    expect(securityStore.pin).toBe(hashedPin);
  });

  it('should return null if there is no PIN', async () => {
    const loadedPin = await securityStore.loadPin();
    expect(loadedPin).toBeUndefined();
  });

  it('should clear the PIN', async () => {
    await securityStore.savePin('1234');
    await securityStore.clearPin();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('pin');
    expect(securityStore.pin).toBeNull();
  });

  it('should verify the PIN (memory)', async () => {
    const pin = '1234';
    const hashedPin = 'hashedPin';

    securityStore.setPin(hashedPin);

    jest.spyOn(securityStore, 'loadPin').mockResolvedValueOnce(hashedPin);
    jest.spyOn(Crypto, 'digestStringAsync').mockResolvedValueOnce(hashedPin);

    const result = await securityStore.verifyPin(pin);

    expect(result).toBe(true);
    expect(securityStore.loadPin).not.toHaveBeenCalled();
    expect(Crypto.digestStringAsync).toHaveBeenCalledWith(algotithm, pin);
  });

  it('should verify the PIN (loaded)', async () => {
    const pin = '1234';
    const hashedPin = 'hashedPin';

    securityStore.setPin(null);

    jest.spyOn(securityStore, 'loadPin').mockResolvedValueOnce(hashedPin);
    jest.spyOn(Crypto, 'digestStringAsync').mockResolvedValueOnce(hashedPin);

    const result = await securityStore.verifyPin(pin);

    expect(result).toBe(true);
    expect(securityStore.loadPin).toHaveBeenCalled();
    expect(Crypto.digestStringAsync).toHaveBeenCalledWith(algotithm, pin);
  });

  it('should return false if the PIN is incorrect', async () => {
    const pin = '1234';
    const hashedPin = 'hashedPin';
    const incorrectHashedPin = 'incorrectHashedPin';

    securityStore.setPin(hashedPin);

    jest.spyOn(Crypto, 'digestStringAsync').mockResolvedValueOnce(incorrectHashedPin);

    const result = await securityStore.verifyPin(pin);

    expect(result).toBe(false);
  });

  it('should throw an error if the PIN is not set', async () => {
    await expect(securityStore.verifyPin('1234')).rejects.toThrow('PIN not set');
  });

  it('should return false if the PIN is incorrect', async () => {
    const pin = '1234';
    const hashedPin = 'hashedPin';

    jest.spyOn(securityStore, 'loadPin').mockResolvedValue(hashedPin);
    jest.spyOn(Crypto, 'digestStringAsync').mockResolvedValue('incorrectHashedPin');

    const result = await securityStore.verifyPin(pin);

    expect(securityStore.loadPin).toHaveBeenCalled();
    expect(Crypto.digestStringAsync).toHaveBeenCalledWith(algotithm, pin);
    expect(result).toBe(false);
  });
});
