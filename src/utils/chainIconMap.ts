// src/utils/chainIconMap.ts

// All icons must be statically imported
import ethereumIcon from '@/assets/images/chains/ethereum.png';
import baseIcon from '@/assets/images/chains/base.png';
import stellarIcon from '@/assets/images/chains/stellar.png';
import polygonIcon from '@/assets/images/chains/polygon.png';
import avaxIcon from '@/assets/images/chains/avax.png';

export const chainIconMap: Record<string, any> = {
  'ethereum.png': ethereumIcon,
  'base.png': baseIcon,
  'stellar.png': stellarIcon,
  'polygon.png': polygonIcon,
  'avax.png': avaxIcon,
};
