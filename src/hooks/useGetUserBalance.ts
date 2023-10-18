import { useEffect, useState } from 'react';

import { getUserBalance } from '@/services/emigro';
import { IFilteredBalance } from '@/types/IFilteredBalance';

import { AssetCode } from '@constants/assetCode';

const useGetUserBalance = () => {
  const [items, setItems] = useState<IFilteredBalance[]>([]);

  const handleGetUserBalance = async () => {
    try {
      const userBalance = await getUserBalance();
      const balances = userBalance.map((bal) => ({
        label: bal.assetCode === AssetCode.USDC ? AssetCode.USD : bal.assetCode,
        value: bal.assetCode,
        balance: bal.balance,
      }));
      setItems(balances);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleGetUserBalance();
  }, []);

  return { items, setItems };
};

export default useGetUserBalance;
