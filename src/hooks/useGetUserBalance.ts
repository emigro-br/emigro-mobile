import { useEffect, useState } from 'react';

import { getUserBalance } from '@/services/emigro';
import { IBalance } from '@/types/IBalance';

import { AssetCode } from '@constants/assetCode';

interface Asset {
  assetCode: AssetCode;
  balance: number;
}

const useGetUserBalance = () => {
  const [items, setItems] = useState<IBalance[]>([]);

  const handleGetUserBalance = async () => {
    try {
      const user = await getUserBalance();
      const balances = user.balances.map((bal: Asset) => ({
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
