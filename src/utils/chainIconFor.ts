// src/utils/chainIconFor.ts
import { useChainStore } from '@/stores/ChainStore';

export const chainIconFor = (chainId?: string): any => {
  if (!chainId) return undefined;
  const chain = useChainStore.getState().getChainById(chainId);
  if (!chain?.iconUrl) return undefined;

  try {
    return require(`@/assets/images/chains/${chain.iconUrl}`);
  } catch (err) {
    console.warn(`[chainIconFor] Icon not found for ${chain.iconUrl}`);
    return undefined;
  }
};
