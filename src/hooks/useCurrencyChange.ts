import { useState } from 'react';

import { IFilteredBalance } from '@/types/IFilteredBalance';

const initialSelectedBalance: IFilteredBalance = {
  balance: '',
  label: '',
  value: '',
};

const useCurrencyChange = (items: IFilteredBalance[]) => {
  const [currency, setCurrency] = useState<string>('');
  const [selectedBalance, setSelectedBalance] = useState<IFilteredBalance>(initialSelectedBalance);

  const handleCurrencyChange = (value: string | null) => {
    if (value !== null) {
      setCurrency(value);
      const balance = items.find((bal) => bal.value === value);
      if (balance !== undefined) {
        setSelectedBalance(balance);
      }
    }
  };
  return { currency, selectedBalance, setCurrency, handleCurrencyChange };
};

export default useCurrencyChange;
