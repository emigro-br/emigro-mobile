import React from 'react';

import { usePathname, useRouter } from 'expo-router';

import { fireEvent, render } from 'test-utils';

import { transactions } from '@/mocks/api/transactions.json';
import { CryptoAsset } from '@/types/assets';

import { TransactionHistory } from '../TransactionHistory';

describe('TransactionHistory', () => {
  const asset = CryptoAsset.BRL;
  it('should render the transaction history', () => {
    const { getByText, getAllByText, getAllByTestId } = render(
      <TransactionHistory asset={asset} transactions={transactions} />,
    );

    // Assert that the transaction history is rendered
    const historyHeading = getByText('History');
    expect(historyHeading).toBeOnTheScreen();

    const items = getAllByTestId('transaction-item');
    expect(items).toHaveLength(5);

    // Assert that the transaction item is rendered
    // FIXME: within is not working (https://testing-library.com/docs/dom-testing-library/api-within/)
    expect(getAllByText('Brazilian Real')).toHaveLength(5);
  });

  it('should render the transaction history with the correct status', () => {
    const { getByText, getByTestId, getAllByTestId } = render(
      <TransactionHistory asset={asset} transactions={transactions} />,
    );

    // pending user and anchor
    expect(getAllByTestId('icon-pending')).toHaveLength(2);
    expect(getByText('Pending the anchor')).toBeOnTheScreen();
    expect(getByText('Anchor waiting your transfer')).toBeOnTheScreen();

    // completed
    expect(getByTestId('icon-complete')).toBeOnTheScreen();
    expect(getByText('Completed')).toBeOnTheScreen();

    // incomplete and error
    expect(getAllByTestId('icon-incomplete')).toHaveLength(2);
    expect(getByText('Error')).toBeOnTheScreen();
    expect(getByText('Canceled - Transaction abandoned')).toBeOnTheScreen();
  });

  // test the payment button
  it('should press the payment button', () => {
    const router = useRouter();
    (usePathname as jest.Mock).mockReturnValueOnce('/path');
    const pendingPayment = transactions.find((transaction) => transaction.status === 'pending_user_transfer_start');
    expect(pendingPayment).toBeDefined();
    if (!pendingPayment) {
      throw new Error('Pending payment not found');
    }
    const { getByText } = render(<TransactionHistory asset={asset} transactions={[pendingPayment]} />);

    // check the payment button
    const button = getByText('Confirm payment');
    expect(button).toBeOnTheScreen();

    fireEvent.press(button);

    // check if the router was called
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/path/confirm',
      params: {
        asset,
        id: pendingPayment.id,
      },
    });
  });

  it('should not render anything when there are no transactions', () => {
    const { queryByText } = render(<TransactionHistory asset={asset} transactions={[]} />);

    // Assert that the container is empty
    expect(queryByText('History')).toBeNull();
  });
});
