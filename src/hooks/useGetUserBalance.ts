import { useEffect, useState } from 'react';

import { IFilteredBalance } from '@/types/IFilteredBalance';
import { CryptoAsset } from '@/types/assets';

import { getUserBalance } from '@services/emigro';

import { AssetToCurrency } from '@utils/assets';

const useGetUserBalance = () => {
  const [userBalance, setUserBalance] = useState<IFilteredBalance[]>([]);

  const handleGetUserBalance = async () => {
    try {
      const userBalance = await getUserBalance();
      const balances = userBalance.map((bal) => {
        const label = AssetToCurrency[bal.assetCode as CryptoAsset];

        return {
          label,
          value: bal.assetCode,
          balance: bal.balance,
        };
      });
      setUserBalance(balances);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleGetUserBalance();
  }, []);

  return { userBalance, setUserBalance };
};

export default useGetUserBalance;
