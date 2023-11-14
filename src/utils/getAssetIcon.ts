import arsIcon from '@assets/images/ars.png';
import brlIcon from '@assets/images/br.png';
import eurIcon from '@assets/images/eur.png';
import usdIcon from '@assets/images/usd.png';

const assetIcons: Record<string, string> = {
  EUR: eurIcon,
  EURC: eurIcon,
  USD: usdIcon,
  USDC: usdIcon,
  BRL: brlIcon,
  ARS: arsIcon,
};

type AssetCode = keyof typeof assetIcons;

export const getAssetIcon = (asset: AssetCode) => {
  return assetIcons[asset] || eurIcon;
};
