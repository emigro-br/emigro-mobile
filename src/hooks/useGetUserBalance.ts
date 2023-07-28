import { useEffect, useState } from 'react';

import { getUserBalance } from '@/services/emigro';
import { IBalance } from '@/types/IBalance';

const useGetUserBalance = () => {
  const [items, setItems] = useState<IBalance[]>([]);

  const handleGetUserBalance = async () => {
    try {
      const user = await getUserBalance();
      const balances = user.balances.map((bal: any) => ({
        label: bal.assetCode === 'USDC' ? 'USD' : bal.assetCode,
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
