import { useState } from 'react';

import { Balance } from '@/types/balance.types';

const useCurrencyChange = (items: Balance[]) => {
  const [currency, setCurrency] = useState('');
  const [selectedBalance, setSelectedBalance] = useState<Balance | null>(null);
  const [amountType, setAmountType] = useState('');

  const handleCurrencyChange = (value: any) => {
    setCurrency(value);
    const balance = items.find((bal: any) => bal.value === value);
    setSelectedBalance(balance as any);
    if (value === 'BRL') {
      setAmountType('R$:');
    } else if (value === 'USDC') {
      setAmountType('$US:');
    } else {
      setAmountType('');
    }
  };

  return { currency, selectedBalance, amountType, setCurrency, handleCurrencyChange };
};

export default useCurrencyChange;
