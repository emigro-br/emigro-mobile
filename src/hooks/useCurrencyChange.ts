import { useState } from 'react';

import { Balance } from '@/types/balance.type';

const useCurrencyChange = (items: Balance[]) => {
  const [currency, setCurrency] = useState('');
  const [selectedBalance, setSelectedBalance] = useState<Balance | null>(null);

  const handleCurrencyChange = (value: any) => {
    setCurrency(value);
    const balance = items.find((bal: any) => bal.value === value);
    setSelectedBalance(balance as any);
  };

  return { currency, selectedBalance, setCurrency, handleCurrencyChange };
};

export default useCurrencyChange;
