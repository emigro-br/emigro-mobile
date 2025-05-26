// src/stores/ChainStore.ts

import { create } from 'zustand';
import { chainIconMap } from '@/utils/chainIconMap';

type Chain = {
  id: string;
  chainId: number;
  name: string;
  slug: string;
  iconUrl?: string;
  icon?: any;

  is_active?: boolean;
  supports_paymaster?: boolean;
  gasFeeSponsored?: boolean | number;
  nativeSymbol?: string;

  circleEnabled?: boolean;
  circleSlug?: string;
  defaultWallet?: boolean;
  explorerUrl?: string;
  rpcUrl?: string;
  isEvm?: boolean;
  mainnet?: boolean;
  
  devOnly?: boolean;
};

interface ChainStoreState {
  chains: Chain[];
  fetchChains: () => Promise<void>;
  getChainById: (id: string | number) => Chain | undefined;
}

export const useChainStore = create<ChainStoreState>((set, get) => ({
  chains: [],

  fetchChains: async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/chains`);
      const rawChains: Chain[] = await res.json();

      console.log('[ChainStore] 🔍 Raw chains from backend:', rawChains);

      const processedChains = rawChains.map((chain) => {
        const iconKey = chain.iconUrl;
        const resolvedIcon = iconKey ? chainIconMap[iconKey] : undefined;

        return {
          ...chain,
          icon: resolvedIcon,
        };
      });

      set({ chains: processedChains });
    } catch (error) {
      console.error('[ChainStore] ❌ Failed to fetch chains:', error);
    }
  },

  getChainById: (id: string | number) => {
    const idStr = id.toString();
    const match = get().chains.find(
      (chain) =>
        chain.id === idStr || chain.chainId?.toString() === idStr
    );
    console.log('[ChainStore] 🔎 getChainById called for:', id, '| Found:', match);
    return match;
  },
}));
