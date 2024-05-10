import React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import mockConsole from 'jest-mock-console';

import * as users from '@/services/emigro/users';
import { balanceStore } from '@/stores/BalanceStore';
import { sessionStore } from '@/stores/SessionStore';

import { CreateWallet } from '../CreateWallet';

jest.mock('@/services/emigro/users');
jest.mock('@/stores/BalanceStore');
jest.mock('@/stores/SessionStore', () => ({
  sessionStore: {
    fetchUser: jest.fn().mockResolvedValue({}),
  },
}));

describe('CreateWallet', () => {
  const restoreConsole = mockConsole();
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    restoreConsole();
  });

  it('should render the component correctly', () => {
    const { getByText } = render(<CreateWallet />);
    expect(getByText('Welcome to Emigro')).toBeOnTheScreen();
    // expect(getByText("Now, let's create a wallet to use the app")).toBeOnTheScreen();
    expect(getByText('Create your wallet')).toBeOnTheScreen();
  });

  it('should call createWallet function and update session and balance on successful wallet creation', async () => {
    const usdcBalance = {
      assetType: 'any',
      assetCode: 'USDC',
      balance: '100',
    };
    const mockWallet = {
      publicKey: 'publicKey',
      balances: [usdcBalance],
    };

    const createWalletSpy = jest.spyOn(users, 'createWallet').mockResolvedValueOnce(mockWallet);
    jest.spyOn(balanceStore, 'find').mockReturnValueOnce(usdcBalance);

    const { getByText } = render(<CreateWallet />);
    const createWalletButton = getByText('Create your wallet');

    fireEvent.press(createWalletButton);

    expect(createWalletSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(balanceStore.setUserBalance).toHaveBeenCalledWith(mockWallet.balances);
      expect(sessionStore.fetchUser).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(balanceStore.fetchUserBalance).toHaveBeenCalledWith({ force: true });
      expect(balanceStore.fetchUserBalance).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle errors during wallet creation', async () => {
    const mockError = new Error('Failed to create wallet');
    const createWalletSpy = jest.spyOn(users, 'createWallet').mockRejectedValue(mockError);

    const { getByText } = render(<CreateWallet />);
    const createWalletButton = getByText('Create your wallet');

    fireEvent.press(createWalletButton);

    expect(createWalletSpy).toHaveBeenCalledTimes(1);
    expect(balanceStore.setUserBalance).not.toHaveBeenCalled();
  });
});
