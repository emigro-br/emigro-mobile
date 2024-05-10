import React from 'react';

import { fireEvent } from '@testing-library/react-native';

import { render } from 'test-utils';

import { CryptoAsset } from '@/types/assets';

import { balanceStore } from '@stores/BalanceStore';

import { Transfers } from '..';

jest.mock('@stores/BalanceStore', () => ({
  balanceStore: {
    currentAssets: jest.fn(),
  },
}));

const navigationMock: any = {
  navigate: jest.fn(),
  push: jest.fn(),
};

describe('Transfers component', () => {
  beforeEach(() => {
    (balanceStore.currentAssets as jest.Mock).mockReturnValue([CryptoAsset.XLM]);
  });

  test('Should render the component correctly', () => {
    const { getByText } = render(<Transfers navigation={navigationMock} />);

    expect(getByText('Send money')).toBeOnTheScreen();
    expect(getByText('XLM')).toBeOnTheScreen();
    expect(getByText('Stellar Lumens')).toBeOnTheScreen();
  });

  test('Should navigate to SendAsset screen when an asset is pressed', () => {
    const { getByText } = render(<Transfers navigation={navigationMock} />);
    const assetButton = getByText('XLM');

    fireEvent.press(assetButton);

    expect(navigationMock.push).toHaveBeenCalledWith('TransfersRoot', {
      screen: 'SendAsset',
      params: {
        asset: 'XLM',
      },
    });
  });
});
