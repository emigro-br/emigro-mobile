import { CryptoAsset, FiatCurrency } from '@/types/assets';

import { fiatByCode, fiatsFromCryptoCodes, iconFor, labelFor, symbolFor, truncateToTwoDecimals } from '../assets';

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

  it('should return the truncated value for 2 decimals', () => {
    const symbol = symbolFor(FiatCurrency.BRL, 10.019);
    expect(symbol).toBe('R$ 10.01');
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

  describe('truncateToTwoDecimals', () => {
    it('should truncate a positive number to two decimal places', () => {
      const value = 3.14159;
      const truncatedValue = truncateToTwoDecimals(value);
      expect(truncatedValue).toBe('3.14');
    });

    it('should truncate a negative number to two decimal places', () => {
      const value = -2.71828;
      const truncatedValue = truncateToTwoDecimals(value);
      expect(truncatedValue).toBe('-2.71');
    });

    it('should truncate a number with more than two decimal places to two decimal places', () => {
      const value = 1.23456789;
      const truncatedValue = truncateToTwoDecimals(value);
      expect(truncatedValue).toBe('1.23');
    });

    it('should truncate a number with exactly two decimal places', () => {
      const value = 4.2;
      const truncatedValue = truncateToTwoDecimals(value);
      expect(truncatedValue).toBe('4.20');
    });

    it('should truncate zero to two decimal places', () => {
      const value = 0;
      const truncatedValue = truncateToTwoDecimals(value);
      expect(truncatedValue).toBe('0.00');
    });
  });
});
