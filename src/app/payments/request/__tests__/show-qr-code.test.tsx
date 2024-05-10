import React from 'react';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

import { fireEvent } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import * as pixUtils from 'pix-utils';

import { render } from 'test-utils';

import { UserProfile } from '@services/emigro/types';

import { sessionStore } from '@stores/SessionStore';

import { RequestWithQRCode } from '../show-qr-code';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

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
    goBack: jest.fn(),
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
    expect(getByTestId('qr-code')).toBeOnTheScreen();
    expect(getByText('Requested value')).toBeOnTheScreen();
    expect(getByText('$ 10.00')).toBeOnTheScreen();
    expect(getByText('For John Doe')).toBeOnTheScreen();
    // expect(getByText('Copy the code')).toBeOnTheScreen();
  });

  it('should not fail when the merchant name is large', () => {
    sessionStore.profile = {
      given_name: 'John',
      family_name: 'Doe'.repeat(100),
      address: '123 Main St',
    } as UserProfile;

    const { getByText, getByTestId } = render(<RequestWithQRCode navigation={mockNavigation} route={mockRoute} />);

    expect(getByText('Request with QR Code')).toBeOnTheScreen();
    expect(getByText('Show this QR code or copy and share with who will make this payment')).toBeOnTheScreen();
    expect(getByTestId('qr-code')).toBeOnTheScreen();
    expect(getByText('Requested value')).toBeOnTheScreen();
    expect(getByText('$ 10.00')).toBeOnTheScreen();
    expect(getByText(`For John ${'Doe'.repeat(100)}`)).toBeOnTheScreen();
  });

  it('shoud go back when encoding the QR code fails', () => {
    jest.spyOn(pixUtils, 'createStaticPix').mockImplementationOnce(() => {
      throw new Error('Failed to generate QR code');
    });

    render(<RequestWithQRCode navigation={mockNavigation} route={mockRoute} />);

    expect(mockNavigation.goBack).toHaveBeenCalled();
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
