import React from 'react';
import { Linking } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import mockConsole from 'jest-mock-console';

import { Provider } from '@components/Provider';

import { getInteractiveUrl } from '@services/anchor';

import Deposit from '../Deposit';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));
jest.mock('@stores/SessionStore', () => ({
  sessionStore: {
    accessToken: 'accessToken',
    publicKey: 'publicKey',
    fetchPublicKey: jest.fn(),
  },
}));
jest.mock('@services/anchor', () => ({
  getInteractiveUrl: jest.fn(() => ({
    url: 'https://anchor.url',
    id: 'transaction-id',
  })),
  CallbackType: {},
}));

describe('Deposit screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('Should display available assets', () => {
    const { getByText } = render(<Deposit />);
    const asset1 = getByText('ARS');
    const asset2 = getByText('BRL');
    const asset3 = getByText('EURC');

    expect(asset1).toBeOnTheScreen();
    expect(asset2).toBeOnTheScreen();
    expect(asset3).toBeOnTheScreen();
  });

  test('Should show loading modal when asset is chosen', async () => {
    const { getByText, getByTestId } = render(
      <Provider>
        <Deposit />
      </Provider>,
    );
    const asset = getByText('ARS');
    fireEvent.press(asset);

    await waitFor(() => {
      const loadingModal = getByTestId('loading-modal');
      expect(loadingModal).toBeOnTheScreen();
    });
  });

  test.skip('Should open URL and navigate back when modal is pressed', async () => {
    (useNavigation as jest.Mock).mockReturnValue({
      goBack: jest.fn(),
    });

    const { getByText, getByTestId } = render(<Deposit />);
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
    expect(useNavigation().goBack).toHaveBeenCalled();
  });

  test('Should display default error message when an error occurs', async () => {
    const restoreConsole = mockConsole();
    // // mock getInteractiveUrl to throw an error
    const error = new Error('An error occurred');
    (getInteractiveUrl as jest.Mock).mockImplementation(() => {
      throw error;
    });

    const { getByText } = render(
      <Provider>
        <Deposit />
      </Provider>,
    );
    const asset = getByText('ARS');
    fireEvent.press(asset);

    await waitFor(() => {
      const errorMessage = getByText('Something went wrong. Please try again');
      expect(errorMessage).toBeOnTheScreen();
      expect(console.warn).toHaveBeenCalledWith(error);
    });
    restoreConsole();
  });
});
