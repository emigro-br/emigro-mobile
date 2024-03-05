import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import { withTheme } from '@/__utils__/helpers';

import { Transfers } from '../Transfers';

const navigationMock: any = {
  navigate: jest.fn(),
  push: jest.fn(),
};

describe('Transfers component', () => {
  test('Should render the component correctly', () => {
    const { getByText } = render(withTheme(<Transfers navigation={navigationMock} />));

    expect(getByText('Send money')).toBeOnTheScreen();
    expect(getByText('XLM')).toBeOnTheScreen();
    expect(getByText('Stellar Lumens')).toBeOnTheScreen();
  });

  test('Should navigate to SendAsset screen when an asset is pressed', () => {
    const { getByText } = render(withTheme(<Transfers navigation={navigationMock} />));
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
