import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { action, makeAutoObservable, observable } from 'mobx';

export class SecurityStore {
  pin: string | null = null;
  private algotithm = Crypto.CryptoDigestAlgorithm.SHA256;

  constructor() {
    makeAutoObservable(this, {
      pin: observable,
      setPin: action,
    });
  }

  setPin = (pin: string | null) => {
    this.pin = pin;
  };

  async savePin(pin: string) {
    // Hash the PIN before saving it
    const hashedPin = await Crypto.digestStringAsync(this.algotithm, pin);
    await SecureStore.setItemAsync('pin', hashedPin);
    this.setPin(hashedPin);
  }

  async loadPin(): Promise<string | null> {
    const hashedPin = await SecureStore.getItemAsync('pin');
    if (hashedPin) {
      this.setPin(hashedPin);
    }
    return hashedPin;
  }

  async clearPin() {
    await SecureStore.deleteItemAsync('pin');
    this.setPin(null);
  }

//  verifyPin = async (pin: string): Promise<boolean> => {
//    const hashedPin = this.pin ?? (await this.loadPin());
//    if (!hashedPin) {
//      throw new Error('PIN not set');
//    }

    // Hash the input PIN and compare it with the stored hashed PIN
//    const inputHashedPin = await Crypto.digestStringAsync(this.algotithm, pin);
//    return hashedPin === inputHashedPin;
//  };

// Temporarily disable PIN verification
	verifyPin = async (pin: string): Promise<boolean> => {
	  return true;
	};
}

export const securityStore = new SecurityStore();
