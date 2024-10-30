import { useEffect, useState } from 'react';

import { FeatureFlags, getAllFlags } from '@/services/emigro/feature-flags';
import { sessionStore } from '@/stores/SessionStore';

export const useFeatureFlags = (): ((featureKey: string) => boolean) => {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({});

  useEffect(() => {
    const fetchFlags = async () => {
      const flags = await getAllFlags();
      setFeatureFlags(flags);
    };

    fetchFlags();
  }, []);

  const isFeatureEnabled = (featureKey: string): boolean => {
    const userId = sessionStore.profile?.sub;
    if (!userId) {
      return false;
    }
    if (featureKey in featureFlags) {
      const { allowUsers } = featureFlags[featureKey];
      return allowUsers.includes(userId);
    }
    return false;
  };

  return isFeatureEnabled;
};
