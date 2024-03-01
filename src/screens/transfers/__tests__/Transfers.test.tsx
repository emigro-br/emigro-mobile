import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import { Provider } from '@components/Provider';

import { Transfers } from '../Transfers';

const navigationMock: any = {
  navigate: jest.fn(),
  push: jest.fn(),
};

const routeMock: any = {};

describe('Transfers component', () => {
  test('Should render the component correctly', () => {
    const { getByText } = render(
      <Provider>
        <Transfers navigation={navigationMock} route={routeMock} />
      </Provider>,
    );

    expect(getByText('Send money')).toBeOnTheScreen();
    expect(getByText('XLM')).toBeOnTheScreen();
    expect(getByText('Stellar Lumens')).toBeOnTheScreen();
  });

  test('Should navigate to SendAsset screen when an asset is pressed', () => {
    const { getByText } = render(
      <Provider>
        <Transfers navigation={navigationMock} route={routeMock} />
      </Provider>,
    );
    const assetButton = getByText('XLM');

    fireEvent.press(assetButton);

    expect(navigationMock.push).toHaveBeenCalledWith('SendAsset', {
      asset: 'XLM',
    });
  });
});
