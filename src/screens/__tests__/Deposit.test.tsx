import React from 'react';
import { Linking } from 'react-native';

import { fireEvent, waitFor } from '@testing-library/react-native';
import mockConsole from 'jest-mock-console';

import { render } from 'test-utils';

import { depositUrl } from '@services/emigro/anchors';

import { sessionStore } from '@stores/SessionStore';

import Deposit from '../Deposit';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
}));

jest.mock('@stores/SessionStore', () => ({
  sessionStore: {
    get accessToken() {
      return 'accessToken';
    },
    get publicKey() {
      return 'publicKey';
    },
    fetchPublicKey: jest.fn(),
  },
}));

jest.mock('@services/emigro/anchors', () => ({
  depositUrl: jest.fn(() => ({
    url: 'https://anchor.url',
    id: 'transaction-id',
  })),
  CallbackType: {},
}));

const mockNavigattion: any = {
  navigate: jest.fn(),
  push: jest.fn(),
  goBack: jest.fn(),
  popToTop: jest.fn(),
};

describe('Deposit screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('Should show loading screen when session is not ready', () => {
    // session not ready
    jest.spyOn(sessionStore, 'accessToken', 'get').mockReturnValueOnce(undefined);

    const { getByTestId } = render(<Deposit navigation={mockNavigattion} />);
    const loadingSpinner = getByTestId('loading-spinner');

    expect(loadingSpinner).toBeOnTheScreen();
  });

  test('Should display available assets', () => {
    const { getByText, queryByText } = render(<Deposit navigation={mockNavigattion} />);

    expect(getByText('ARS')).toBeOnTheScreen();
    expect(getByText('BRL')).toBeOnTheScreen();
    expect(getByText('EURC')).toBeOnTheScreen();
    expect(getByText('USDC')).toBeOnTheScreen();
    expect(queryByText('XML')).not.toBeOnTheScreen();
  });

  test('Should show loading modal when asset is chosen', async () => {
    const { getByText, getByTestId } = render(<Deposit navigation={mockNavigattion} />);
    const asset = getByText('ARS');
    fireEvent.press(asset);

    await waitFor(() => {
      const loadingModal = getByTestId('loading-modal');
      expect(loadingModal).toBeOnTheScreen();
    });
  });

  test.skip('Should open URL and navigate back when modal is pressed', async () => {
    const { getByText, getByTestId } = render(<Deposit navigation={mockNavigattion} />);
    const asset = getByText('ARS');
    fireEvent.press(asset);

    await waitFor(() => {
      const modal = getByTestId('open-url-modal');
      expect(modal).toBeOnTheScreen();
    });

    let button: any;
    await waitFor(() => {
      button = getByText('Continue to Anchor');
      expect(button).toBeOnTheScreen();
    });

    fireEvent.press(button);

    // Assert that Linking.openURL is called with the correct URL
    expect(Linking.openURL).toHaveBeenCalledWith('https://anchor.url');

    // Assert that navigation.goBack is called
    expect(mockNavigattion.popToTop).toHaveBeenCalled();
  });

  test.skip('Should display default error message when an error occurs', async () => {
    const restoreConsole = mockConsole();
    // // mock getInteractiveUrl to throw an error
    const error = new Error('An error occurred');
    (depositUrl as jest.Mock).mockRejectedValueOnce(error);

    const { getByText, getByTestId } = render(<Deposit navigation={mockNavigattion} />);
    const asset = getByText('ARS');
    fireEvent.press(asset);

    await waitFor(() => {
      const modal = getByTestId('open-url-modal');
      expect(modal).toBeOnTheScreen();
    });

    let button: any;
    await waitFor(() => {
      button = getByText('Continue to Anchor');
      expect(button).toBeOnTheScreen();
    });

    await waitFor(() => {
      const errorMessage = getByText('Something went wrong. Please try again');
      expect(errorMessage).toBeOnTheScreen();
      // expect(console.warn).toHaveBeenCalledWith(error);
    });
    restoreConsole();
  });
});
