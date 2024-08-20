import { CryptoAsset, FiatCurrency } from '@/types/assets';

import { fiatByCode, fiatsFromCryptoCodes, iconFor, labelFor, symbolFor } from '../assets';

describe('labelFor', () => {
  it('should return the label for a crypto asset', () => {
    const label = labelFor(CryptoAsset.USDC);
    expect(label).toBe('USD Coin');
  });

  it('should return the label for a fiat currency', () => {
    const label = labelFor(FiatCurrency.USD);
    expect(label).toBe('US Dollar');
  });

  it('should return the asset string for an unknown asset', () => {
    const label = labelFor('XYZ' as CryptoAsset);
    expect(label).toBe('XYZ');
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

describe('symbolFor', () => {
  it('should return the symbol for a crypto asset with default value', () => {
    const symbol = symbolFor(CryptoAsset.USDC);
    expect(symbol).toBe('$ 0.00');
  });

  it('should return the symbol for a crypto asset with custom value', () => {
    const symbol = symbolFor(CryptoAsset.USDC, 10);
    expect(symbol).toBe('$ 10.00');
  });

  it('should return the symbol for a fiat currency with default value', () => {
    const symbol = symbolFor(FiatCurrency.BRL);
    expect(symbol).toBe('R$ 0.00');
  });

  it('should return the symbol for a fiat currency with custom value', () => {
    const symbol = symbolFor(FiatCurrency.BRL, 20);
    expect(symbol).toBe('R$ 20.00');
  });

  describe('fiatsFromCryptoCodes', () => {
    it('should return an array of fiat assets for a list of crypto assets', () => {
      const cryptos = [CryptoAsset.USDC, CryptoAsset.ARS];
      const fiats = fiatsFromCryptoCodes(cryptos);
      expect(fiats).toEqual([fiatByCode[FiatCurrency.USD], fiatByCode[FiatCurrency.ARS]]);
    });

    it('should filter out undefined assets (ie XLM)', () => {
      const cryptos = [CryptoAsset.XLM, CryptoAsset.EURC];
      const fiats = fiatsFromCryptoCodes(cryptos);
      expect(fiats).toEqual([fiatByCode[FiatCurrency.EUR]]);
    });
  });
});
