import { FiatCurrency } from './assets';

export type UserPreferences = {
  theme?: 'system' | 'light' | 'dark';
  // language: 'en' | 'es';
  // currency: FiatCurrency;
  fiatsWithBank?: FiatCurrency[];
  themePreference?: 'dark' | 'light' | 'system';
};
