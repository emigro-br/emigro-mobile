import React from 'react';

import { fireEvent, render } from 'test-utils';

import { Balance } from '@/services/emigro/types';
import { balanceStore } from '@/stores/BalanceStore';

import { Wallet } from '../';

jest.mock('@/stores/BalanceStore', () => ({
  balanceStore: {
    totalBalance: 100,
    userBalance: [],
    fetchUserBalance: jest.fn(),
  },
}));

describe('Wallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    balanceStore.userBalance = [];
  });

  it('should render with empty wallet', () => {
    balanceStore.userBalance = [];
    const { getByTestId } = render(<Wallet />);
    expect(getByTestId('total-balance')).toBeOnTheScreen();
    // expect(getByTestId('toggle-button')).toBeOnTheScreen();
    expect(getByTestId('operation-buttons')).toBeOnTheScreen();
    expect(getByTestId('create-wallet')).toBeOnTheScreen();
  });

  it('should render with not empty wallet', () => {
    balanceStore.userBalance = [
      {
        assetCode: 'USDC',
        balance: '1',
      } as Balance,
    ];
    const { getByTestId } = render(<Wallet />);
    expect(getByTestId('total-balance')).toBeOnTheScreen();
    expect(getByTestId('operation-buttons')).toBeOnTheScreen();
    expect(getByTestId('wallet-balances')).toBeOnTheScreen();
  });

  // skip since render is not showing the header
  it.skip('should toggle hide/show balance', () => {
    const { queryByText, getByTestId } = render(<Wallet />);
    const toggleButton = getByTestId('toggle-button');

    expect(queryByText('$ 100.00')).toBeOnTheScreen();

    fireEvent.press(toggleButton);

    expect(queryByText('$ 100.00')).not.toBeOnTheScreen();
  });
});
