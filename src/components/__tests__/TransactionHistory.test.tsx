import React from 'react';

import { render } from 'test-utils';

import { transactions } from '@/mocks/api/transactions.json';
import { CryptoAsset } from '@/types/assets';

import { TransactionHistory } from '../TransactionHistory';

describe('TransactionHistory', () => {
  const asset = CryptoAsset.BRL;
  it('should render the transaction history', () => {
    const { getByText, getAllByText, getByTestId, getAllByTestId } = render(
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

    expect(getByTestId('icon-pending')).toBeOnTheScreen();
    expect(getByTestId('icon-complete')).toBeOnTheScreen();
  });

  it('should not render anything when there are no transactions', () => {
    const { queryByText } = render(<TransactionHistory asset={asset} transactions={[]} />);

    // Assert that the container is empty
    expect(queryByText('History')).toBeNull();
  });
});
