import { useEffect, useState } from 'react';

import { IFilteredBalance } from '@/types/IFilteredBalance';

import { getUserBalance } from '@services/emigro';

import { formatAssetCode } from '@utils/formatAssetCode';

const useGetUserBalance = () => {
  const [userBalance, setUserBalance] = useState<IFilteredBalance[]>([]);

  const handleGetUserBalance = async () => {
    try {
      const userBalance = await getUserBalance();
      const balances = userBalance.map((bal) => {
        const label = formatAssetCode(bal.assetCode);

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
