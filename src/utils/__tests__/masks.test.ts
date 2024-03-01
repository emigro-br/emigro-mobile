import { maskWallet } from '../masks';

describe('maskWallet', () => {
  it('should mask the wallet address', () => {
    const address = 'GABCD1234567890GABCD1234567890GABCD1234567890GABCD1234567890';
    const maskedAddress = maskWallet(address);
    expect(maskedAddress).toBe('GABCD...67890');
  });

  it('should return empty string for empty address', () => {
    const address = '';
    const maskedAddress = maskWallet(address);
    expect(maskedAddress).toBe('');
  });

  it('should return the same address if it has less than 11 characters', () => {
    const address = 'GGABCD1234';
    const maskedAddress = maskWallet(address);
    expect(maskedAddress).toBe(address);
  });
});
