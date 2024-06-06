import React from 'react';

import { waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { render } from 'test-utils';

import * as anchors from '@/services/emigro/anchors';
import { Sep24Transaction } from '@/services/emigro/types';
import { CryptoAsset } from '@/types/assets';

import { Sep24TransactionHistoryContainer, watcher } from '../Sep24TransactionHistoryContainer';

jest.mock('@/services/emigro/anchors', () => ({
  ...jest.requireActual('@/services/emigro/anchors'),
  listTransactions: jest.fn(),
}));

describe('Sep24TransactionHistoryContainer', () => {
  const router = useRouter();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and display transactions', async () => {
    const mockTransactions = [
      {
        id: '1',
        kind: 'withdrawal',
        status: 'pending_user_transfer_start',
      },
      {
        id: '2',
        kind: 'deposit',
        status: 'completed',
      },
    ];

    (anchors.listTransactions as jest.Mock).mockResolvedValue(mockTransactions);

    const { getAllByTestId } = render(
      <Sep24TransactionHistoryContainer
        asset={CryptoAsset.SRT}
        kind={anchors.OperationKind.WITHDRAW}
        refreshedAt={new Date()}
      />,
    );

    await waitFor(() => {
      expect(anchors.listTransactions).toHaveBeenCalledWith('SRT', 'withdraw');
      expect(getAllByTestId('transaction-item')).toHaveLength(2);
    });
  });

  it('should start watching latest transaction and navigate to confirm page when is withdrawal transaction is pending', async () => {
    const mockTransactions = [
      {
        id: '1',
        kind: 'withdrawal',
        status: 'pending_user_transfer_start',
      },
    ];

    (anchors.listTransactions as jest.Mock).mockResolvedValue(mockTransactions);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ latest: '1' });

    jest.spyOn(watcher, 'watchOneTransaction').mockImplementation(({ onMessage }) => {
      onMessage(mockTransactions[0] as Sep24Transaction);
      return {
        stop: jest.fn(),
      };
    });

    const { getByTestId } = render(
      <Sep24TransactionHistoryContainer
        asset={CryptoAsset.SRT}
        kind={anchors.OperationKind.WITHDRAW}
        refreshedAt={new Date()}
      />,
    );

    await waitFor(() => {
      expect(anchors.listTransactions).toHaveBeenCalledWith('SRT', 'withdraw');
      expect(getByTestId('transaction-item')).toBeOnTheScreen();
    });
    expect(watcher.watchOneTransaction).toHaveBeenCalled();

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/<path>/confirm',
        params: { asset: 'SRT', id: '1' },
      });
    });
  });
});
