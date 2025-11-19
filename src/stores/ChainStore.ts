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

  isActive?: boolean;
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

  // ✅ new backend flag
  isDefaultChain?: boolean;
  
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
      const rawChains: any[] = await res.json();

      console.log('[ChainStore] 🔍 Raw chains from backend:', rawChains);

      // Determine if we are in "production" mode based on PROD env:
      // - PROD missing OR PROD === 'YES'  -> production
      // - PROD === 'NO'                   -> non-production (dev)
      const prodFlag = process.env.PROD;
      const isProdEnv = !prodFlag || prodFlag === 'YES';

      // Keep only real, enabled mainnets
      // In production: exclude dev-only chains
      // In dev (PROD=NO): include dev-only chains as well
      const filtered = rawChains.filter((c) => {
        const mainnet = c?.mainnet === true;
        const isActive =
          c?.isActive === true || c?.is_active === true; // tolerate legacy key

        const notDevOnly = isProdEnv ? c?.devOnly !== true : true;

        return mainnet && isActive && notDevOnly;
      });

      const processedChains: Chain[] = filtered.map((chain) => {
        const iconKey = chain.iconUrl;
        const resolvedIcon = iconKey ? chainIconMap[iconKey] : undefined;

        return {
          ...chain,
          icon: resolvedIcon,
        };
      });

      console.log(
        '[ChainStore] ✅ Processed (mainnet+active) chains (isProdEnv=',
        isProdEnv,
        '):',
        processedChains,
      );
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
  
  getDefaultChain: () => {
    const def = get().chains.find((c) => c.isDefaultChain === true);
    console.log('[ChainStore] ⭐ getDefaultChain:', def);
    return def;
  },
  
}));
