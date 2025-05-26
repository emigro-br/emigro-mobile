import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { balanceStore } from '@/stores/BalanceStore';

export const useWalletBalances = (walletId: string) => {
  const [loading, setLoading] = useState(true);

  // Initial fetch on mount
  useEffect(() => {
    if (!walletId) return;
    const fetch = async () => {
      setLoading(true);
      await balanceStore.fetchWalletBalance(walletId);
      setLoading(false);
    };
    fetch();
  }, [walletId]);

  // Auto-refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      if (!walletId) return;
      const refreshOnFocus = async () => {
        await balanceStore.fetchWalletBalance(walletId, { force: true });
      };
      refreshOnFocus();
    }, [walletId])
  );

  return {
    balances: balanceStore.walletBalances[walletId] ?? [],
    loading,
    refresh: async () => {
      setLoading(true);
      await balanceStore.fetchWalletBalance(walletId, { force: true });
      setLoading(false);
    },
  };
};
