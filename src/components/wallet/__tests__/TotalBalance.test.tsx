import React from 'react';

import { render } from 'test-utils';

import { FiatCurrency } from '@/types/assets';

import { TotalBalance } from '../TotalBalance';

describe('TotalBalance', () => {
  const total = 1000;
  const cryptoOrFiat = FiatCurrency.USD;

  it('should render the total balance correctly', () => {
    const { getByTestId, getByText } = render(<TotalBalance total={total} cryptoOrFiat={cryptoOrFiat} />);

    expect(getByTestId('total-balance')).toBeOnTheScreen();
    expect(getByText('Total Balance')).toBeOnTheScreen();
    expect(getByText('$ 1000.00')).toBeOnTheScreen();
  });

  it('should hide the total balance when hide prop is true', () => {
    const { getByTestId, queryByText } = render(<TotalBalance total={total} cryptoOrFiat={cryptoOrFiat} hide />);

    expect(getByTestId('total-balance')).toBeOnTheScreen();
    expect(queryByText('Total Balance')).toBeOnTheScreen();
    expect(queryByText('$ 1000.00')).not.toBeOnTheScreen();
    expect(queryByText('****')).toBeOnTheScreen();
  });
});
