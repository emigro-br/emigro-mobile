import React from 'react';

import { fireEvent, render, waitFor } from 'test-utils';

import { OperationKind } from '@/services/emigro/anchors';
import { FiatCurrency } from '@/types/assets';

import { Deposit, OperationHome, Withdraw } from '..';

jest.mock('@/services/emigro/anchors', () => ({
  ...jest.requireActual('@/services/emigro/anchors'),
  listTransactions: jest.fn(() => Promise.resolve([])),
}));

describe('Deposit', () => {
  it('should render correctly', () => {
    const currency = FiatCurrency.USD;
    const { getByText } = render(<Deposit currency={currency} />);
    expect(getByText('Deposit in US Dollar')).toBeOnTheScreen();
  });
});

describe('Withdraw', () => {
  it('should render correctly', () => {
    const currency = FiatCurrency.USD;
    const { getByText } = render(<Withdraw currency={currency} />);
    expect(getByText('Withdraw in US Dollar')).toBeOnTheScreen();
  });
});

describe('OperationHome', () => {
  it('should render correctly', () => {
    const currency = FiatCurrency.USD;
    const { getByText } = render(<OperationHome title="Deposit" kind={OperationKind.DEPOSIT} currency={currency} />);
    expect(getByText('Deposit in US Dollar')).toBeOnTheScreen();
    expect(getByText('Balance: $ 0.00')).toBeOnTheScreen();
    expect(getByText('New transaction')).toBeOnTheScreen();
  });

  it('should open url when press new transaction button', async () => {
    const currency = FiatCurrency.USD;
    const { getByText, getByTestId } = render(
      <OperationHome title="Deposit" kind={OperationKind.DEPOSIT} currency={currency} />,
    );
    const newTransactionButton = getByText('New transaction');
    expect(newTransactionButton).toBeOnTheScreen();

    fireEvent.press(newTransactionButton);

    await waitFor(() => expect(getByTestId('open-url-modal')).toBeOnTheScreen());

    // const button = getByText('Continue');
    // fireEvent.press(button);
  });
});
