import { sessionStore } from '@/stores/SessionStore';

type FeatureFlags = {
  [key: string]: {
    allowUsers: string[];
  };
};

// FIXME: fetch those values from backend API
const featureFlags: FeatureFlags = {
  'pix-payment': {
    allowUsers: [
      // development
      '543594d9-8774-43e5-a6cb-b1401e3b5b88',

      // production
      '5a645773-a829-4900-a66d-d771ddfd1fb4', // tupy
      'ed83c908-3a9a-4caf-b41d-0ec66305638e', // blake
    ],
  },
};

export const useFeatureFlag = (featureKey: string): boolean => {
  if (process.env.NODE_ENV === 'test') return true;

  const userId = sessionStore.profile?.sub;
  if (!userId) return false;

  if (featureKey in featureFlags) {
    const { allowUsers } = featureFlags[featureKey];
    return allowUsers.includes(userId);
  }
  return false;
};
