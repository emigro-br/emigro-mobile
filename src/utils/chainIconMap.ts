// src/utils/chainIconMap.ts

// All icons must be statically imported
import ethereumIcon from '@/assets/images/chains/ethereum.png';
import baseIcon from '@/assets/images/chains/base.png';
import stellarIcon from '@/assets/images/chains/stellar.png';

export const chainIconMap: Record<string, any> = {
  'ethereum.png': ethereumIcon,
  'base.png': baseIcon,
  'stellar.png': stellarIcon,
  // Add more static imports as needed
};
