// src/hooks/useUserRewardPoints.ts
import { useEffect, useState } from 'react';
import { api } from '@/services/emigro/api';
import { sessionStore } from '@/stores/SessionStore';

export const useUserRewardPoints = () => {
  const [points, setPoints] = useState<number>(sessionStore.cachedRewardPoints ?? 0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoints = async () => {
      const userId = sessionStore.user?.id;
      console.log('[useUserRewardPoints] Fetching for user:', userId);

      try {
        const response = await api().get('/rewards/me');
        console.log('[useUserRewardPoints] API response:', response?.data);

        const value = response?.data?.points ?? 0;
        const parsed = Number(value);
        console.log(`[useUserRewardPoints] Parsed points: ${parsed}`);

        sessionStore.setCachedRewardPoints(parsed);
        setPoints(parsed);
      } catch (error) {
        console.error('[useUserRewardPoints] Failed to fetch points:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, []);

  return { points, loading };
};
