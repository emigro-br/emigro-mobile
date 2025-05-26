import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Load translations
import en from './locales/en.json';
import pt from './locales/pt.json';
import es from './locales/es.json';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
    lng: Localization.locale.split('-')[0], // Get device language like 'en'
    resources: {
      en: { translation: en },
      pt: { translation: pt },
      es: { translation: es },
    },
    interpolation: {
      escapeValue: false, // Not needed for React
    },
  });

export default i18n;
