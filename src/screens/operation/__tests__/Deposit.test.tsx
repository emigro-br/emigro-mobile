import React from 'react';
import { Linking } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import mockConsole from 'jest-mock-console';

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
    const { getByText, getByTestId } = render(<Deposit />);
    const asset = getByText('ARS');
    fireEvent.press(asset);

    await waitFor(() => {
      const loadingModal = getByTestId('loading-modal');
      expect(loadingModal).toBeOnTheScreen();
    });
  });

  test('Should open URL and navigate back when modal is pressed', async () => {
    // mock useNavigation().goBack
    (useNavigation as jest.Mock).mockReturnValue({
      goBack: jest.fn(),
    });

    const { getByText, getByTestId } = render(<Deposit />);
    const asset = getByText('ARS');
    fireEvent.press(asset);

    let button: any;
    await waitFor(() => {
      const modal = getByTestId('open-url-modal');
      expect(modal).toBeOnTheScreen();
      button = getByText('Continue');
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
    // mock getInteractiveUrl to throw an error
    const error = new Error('An error occurred');
    (getInteractiveUrl as jest.Mock).mockImplementation(() => {
      throw error;
    });

    const { getByText } = render(<Deposit />);
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
