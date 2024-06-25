import React from 'react';

import { fireEvent, waitFor, waitForElementToBeRemoved } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { render } from 'test-utils';

import * as quotesService from '@/services/emigro/quotes';
import { balanceStore } from '@/stores/BalanceStore';
import { SwapTransaction, swapStore } from '@/stores/SwapStore';
import { CryptoAsset } from '@/types/assets';

import { Swap } from '..';

jest.mock('@/services/emigro/quotes', () => ({
  handleQuote: jest.fn(),
}));

jest.mock('@/stores/BalanceStore', () => ({
  balanceStore: {
    currentAssets: jest.fn(),
    get: jest.fn(),
  },
}));

describe('Swap component', () => {
  const fromAsset = CryptoAsset.USDC;
  const toAsset = CryptoAsset.BRL;
  let router: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(balanceStore, 'currentAssets').mockReturnValue([fromAsset, toAsset]);
    router = useRouter();
  });

  test('Should render Swap component correctly', async () => {
    jest
      .spyOn(quotesService, 'handleQuote')
      .mockResolvedValueOnce({ destination_amount: 1 } as quotesService.IQuoteResponse);

    const { getByText, getByTestId } = render(<Swap />);

    // check title
    const sellText = getByText(`Sell ${fromAsset}`);
    expect(sellText).toBeOnTheScreen();

    const sellBox = getByTestId('buy-box');
    expect(sellBox).toBeOnTheScreen();

    // check arrow icon
    const arrowIcon = getByTestId('arrowIcon');
    expect(arrowIcon).toBeOnTheScreen();

    const buyBox = getByTestId('buy-box');
    expect(buyBox).toBeOnTheScreen();
  });

  test('Should update sellValue and buyValue when onChangeValue is called', async () => {
    jest
      .spyOn(quotesService, 'handleQuote')
      .mockResolvedValueOnce({ destination_amount: 10.829 } as quotesService.IQuoteResponse);

    const { getByText, getByLabelText, findByTestId, getByTestId } = render(<Swap />);

    const buyBox = await findByTestId('buy-box');
    fireEvent(buyBox, 'onChangeAsset', toAsset, 'buy');

    const sellInput = getByLabelText('sell-input');
    const buyInput = getByLabelText('buy-input');

    expect(sellInput).toBeOnTheScreen();
    expect(buyInput).toBeOnTheScreen();

    fireEvent.changeText(sellInput, '10');
    await waitForElementToBeRemoved(() => getByTestId('fetching'));

    await waitFor(() => {
      expect(sellInput).toHaveAccessibilityValue('10');
    });

    await waitFor(() => {
      expect(buyInput).toHaveAccessibilityValue('10.83');
    });

    // check rate
    await waitFor(() => {
      const rateText = getByText(`1 ${toAsset} ≈ 10.000000 ${fromAsset}`); // initial state
      expect(rateText).toBeOnTheScreen();
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
      .mockResolvedValueOnce({ destination_amount: 10.829 } as quotesService.IQuoteResponse);

    const spy = jest.spyOn(swapStore, 'setSwap');
    jest.spyOn(balanceStore, 'get').mockReturnValue(100); // enough balance

    const { getByText, getByLabelText, findByTestId } = render(<Swap />);

    const buyBox = await findByTestId('buy-box');
    fireEvent(buyBox, 'onChangeAsset', toAsset, 'buy');

    const sellInput = getByLabelText('sell-input');
    fireEvent.changeText(sellInput, '10');

    await waitFor(() => {
      expect(sellInput).toHaveAccessibilityValue('10');
    });

    const button = getByText('Review order');
    fireEvent.press(button);

    const transaction: SwapTransaction = {
      fromAsset,
      fromValue: 10,
      toAsset,
      toValue: 10.829,
      rate: 10 / 10.829, // normalized rate
    };

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(transaction);
      expect(router.push).toHaveBeenCalledWith('/wallet/swap/review');
    });
  });
});
