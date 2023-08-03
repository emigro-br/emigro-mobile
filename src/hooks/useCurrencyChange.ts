import { useState } from 'react';

import { IBalance } from '@/types/IBalance';

const useCurrencyChange = (items: IBalance[]) => {
  const [currency, setCurrency] = useState('');
  const [selectedBalance, setSelectedBalance] = useState<IBalance | null>(null);

  const handleCurrencyChange = (value: any) => {
    setCurrency(value);
    const balance = items.find((bal: any) => bal.value === value);
    setSelectedBalance(balance as any);
  };

  return { currency, selectedBalance, setCurrency, handleCurrencyChange };
};

export default useCurrencyChange;
