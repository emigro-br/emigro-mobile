// src/hooks/useUserRank.ts
import { useEffect, useState } from 'react';
import { sessionStore } from '@/stores/SessionStore';
import { getUserRank } from '@/services/emigro/rewards';
import { UserRankResponse } from '@/services/emigro/types';

export function useUserRank() {
  const [rank, setRank] = useState<UserRankResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const userId = sessionStore.user?.id;
        if (!userId) {
          throw new Error('No userId available');
        }
        const res = await getUserRank(userId);
        if (mounted) setRank(res);
      } catch (e) {
        if (mounted) setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { rank, loading, error };
}
