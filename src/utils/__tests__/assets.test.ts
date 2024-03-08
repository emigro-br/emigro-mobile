import { CryptoAsset, FiatCurrency } from '@/types/assets';

import { iconFor, labelFor } from '../assets';

describe('labelFor', () => {
  it('should return the label for a crypto asset', () => {
    const label = labelFor(CryptoAsset.USDC);
    expect(label).toBe('USD Coin');
  });

  it('should return the label for a fiat currency', () => {
    const label = labelFor(FiatCurrency.USD);
    expect(label).toBe('US Dollar');
  });

  it('should return undefined for an unknown asset', () => {
    const label = labelFor('XYZ' as CryptoAsset);
    expect(label).toBeUndefined();
  });
});

describe('iconFor', () => {
  it('should return the icon for a crypto asset', () => {
    const icon = iconFor(CryptoAsset.USDC);
    expect(icon).toBeDefined();
  });

  it('should return the icon for a fiat currency', () => {
    const icon = iconFor(FiatCurrency.USD);
    expect(icon).toBeDefined();
  });

  it('should return undefined for an unknown asset', () => {
    const icon = iconFor('XYZ' as CryptoAsset);
    expect(icon).toBeUndefined();
  });
});
