import React from 'react';

import { fireEvent } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';

import { render } from 'test-utils';

import { RequestWithQRCode } from '../RequestWithQRCode';

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
  setString: jest.fn(),
}));

jest.mock('@gluestack-ui/themed', () => ({
  ...jest.requireActual('@gluestack-ui/themed'),
  useToast: jest.fn().mockReturnValue({ show: jest.fn() }),
}));

jest.mock('@stores/SessionStore', () => ({
  sessionStore: {
    profile: {
      given_name: 'John',
      family_name: 'Doe',
      address: '123 Main St',
    },
  },
}));

describe('RequestWithQRCode component', () => {
  const mockNavigation: any = {
    popToTop: jest.fn(),
  };

  const mockRoute: any = {
    params: {
      asset: 'USDC',
      value: 10,
    },
  };

  it('renders the component correctly', () => {
    const { getByText, getByTestId } = render(<RequestWithQRCode navigation={mockNavigation} route={mockRoute} />);

    expect(getByText('Request with QR Code')).toBeOnTheScreen();
    expect(getByText('Show this QR code or copy and share with who will make this payment')).toBeOnTheScreen();
    expect(getByTestId('qr-code')).toBeTruthy();
    expect(getByText('Requested value')).toBeOnTheScreen();
    expect(getByText('$ 10.00')).toBeOnTheScreen();
    expect(getByText('For John Doe')).toBeOnTheScreen();
    // expect(getByText('Copy the code')).toBeOnTheScreen();
  });

  it.skip('calls the copyToClipboard function when the "Copy the code" button is pressed', () => {
    const { getByText } = render(<RequestWithQRCode navigation={mockNavigation} route={mockRoute} />);
    const copyButton = getByText('Copy the code');

    fireEvent.press(copyButton);

    expect(Clipboard.setStringAsync).toHaveBeenCalled();
  });

  it('calls the navigation.popToTop function when the close button is pressed', () => {
    const { getByTestId } = render(<RequestWithQRCode navigation={mockNavigation} route={mockRoute} />);
    const closeButton = getByTestId('close-button');

    fireEvent.press(closeButton);

    expect(mockNavigation.popToTop).toHaveBeenCalled();
  });
});
