import React from 'react';

import { fireEvent, waitFor } from '@testing-library/react-native';

import { render } from 'test-utils';

import * as quotesService from '@/services/emigro/quotes';
import { balanceStore } from '@/stores/BalanceStore';
import { paymentStore } from '@/stores/PaymentStore';
import { CryptoAsset } from '@/types/assets';

import { Swap } from '..';

jest.mock('@/services/emigro/quotes', () => ({
  handleQuote: jest.fn(),
}));

const mockNavigation: any = {
  navigate: jest.fn(),
  push: jest.fn(),
};

describe('Swap component', () => {
  const fromAsset = CryptoAsset.USDC;
  const toAsset = CryptoAsset.BRL;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  test('Should render Swap component correctly', async () => {
    jest
      .spyOn(quotesService, 'handleQuote')
      .mockResolvedValueOnce({ destination_amount: 1.0829 } as quotesService.IQuoteResponse);
    const { getByText, getByTestId } = render(<Swap navigation={mockNavigation} />);

    // check title
    const sellText = getByText(`Sell ${fromAsset}`);
    expect(sellText).toBeDefined();

    // check arrow icon
    const arrowIcon = getByTestId('arrowIcon');
    expect(arrowIcon).toBeDefined();

    await waitFor(() => {
      // check rate
      const buyText = getByText(`1 ${toAsset} ≈ 0.923446 ${fromAsset}`);
      expect(buyText).toBeDefined();
      expect(quotesService.handleQuote).toHaveBeenCalledTimes(1);
      expect(quotesService.handleQuote).toHaveBeenCalledWith({
        from: fromAsset,
        to: toAsset,
        amount: '1.00',
        type: 'strict_send',
      });
    });
  });

  test('Should update sellValue and buyValue when onChangeValue is called', async () => {
    jest
      .spyOn(quotesService, 'handleQuote')
      .mockResolvedValueOnce({ destination_amount: 1.0829 } as quotesService.IQuoteResponse);
    jest
      .spyOn(quotesService, 'handleQuote')
      .mockResolvedValueOnce({ destination_amount: 10.829 } as quotesService.IQuoteResponse);
    const { findAllByPlaceholderText } = render(<Swap navigation={mockNavigation} />);

    const [sellInput, buyInput] = await findAllByPlaceholderText('0');

    fireEvent.changeText(sellInput, '10');

    await waitFor(() => {
      expect(sellInput.props.value).toBe('10');
    });

    await waitFor(() => {
      expect(buyInput.props.value).toBe('10.83');
    });

    // calend twice to check if the rate is being called twice
    expect(quotesService.handleQuote).toHaveBeenCalledTimes(2); // 1 for 1.00 and 1 for 10.00
    expect(quotesService.handleQuote).toHaveBeenCalledWith({
      from: fromAsset,
      to: toAsset,
      amount: '1.00',
      type: 'strict_send',
    });
    expect(quotesService.handleQuote).toHaveBeenCalledWith({
      from: fromAsset,
      to: toAsset,
      amount: '10.00',
      type: 'strict_send',
    });
  });

  test('Should update bloc and navigate to DetailsSwap when button is pressed', async () => {
    jest
      .spyOn(quotesService, 'handleQuote')
      .mockResolvedValueOnce({ destination_amount: 1.0829 } as quotesService.IQuoteResponse);
    jest
      .spyOn(quotesService, 'handleQuote')
      .mockResolvedValueOnce({ destination_amount: 10.829 } as quotesService.IQuoteResponse);

    const spy = jest.spyOn(paymentStore, 'setSwap');
    jest.spyOn(balanceStore, 'get').mockReturnValue(100); // enough balance

    const { getByText, findAllByPlaceholderText } = render(<Swap navigation={mockNavigation} />);

    const [sellInput, buyInput] = await findAllByPlaceholderText('0');
    fireEvent.changeText(sellInput, '10');

    await waitFor(() => {
      expect(buyInput.props.value).toBe('10.83');
    });

    const button = getByText('Review order');
    fireEvent.press(button);

    const transaction = {
      from: fromAsset,
      fromValue: 10,
      to: toAsset,
      toValue: 10.829,
      rate: 10 / 10.829, // normalized rate
      fees: 0,
    };

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(transaction);
      expect(mockNavigation.push).toHaveBeenCalled();
    });
  });
});
