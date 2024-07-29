import React from 'react';

import { fireEvent } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as pixUtils from 'pix-utils';

import { render } from 'test-utils';

import { UserProfile } from '@/services/emigro/types';
import { sessionStore } from '@/stores/SessionStore';

import { RequestWithQRCode } from '../show-qr-code';

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
  setString: jest.fn(),
}));

jest.mock('@/stores/SessionStore', () => ({
  sessionStore: {
    profile: {
      given_name: 'John',
      family_name: 'Doe',
      address: '123 Main St',
    },
  },
}));

describe('RequestWithQRCode component', () => {
  let router: any;
  const params = {
    asset: 'USDC',
    value: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    router = useRouter();
    (useLocalSearchParams as jest.Mock).mockReturnValue(params);
  });

  it('renders the component correctly', () => {
    const { getByText, getByTestId } = render(<RequestWithQRCode />);

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

    const { getByText, getByTestId } = render(<RequestWithQRCode />);

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

    render(<RequestWithQRCode />);

    expect(router.back).toHaveBeenCalled();
  });

  it.skip('calls the copyToClipboard function when the "Copy the code" button is pressed', () => {
    const { getByText } = render(<RequestWithQRCode />);
    const copyButton = getByText('Copy the code');

    fireEvent.press(copyButton);

    expect(Clipboard.setStringAsync).toHaveBeenCalled();
  });

  it('should back when press close button is pressed', () => {
    const { getByTestId } = render(<RequestWithQRCode />);
    const closeButton = getByTestId('close-button');

    fireEvent.press(closeButton);

    // dismiss modal is: ../
    expect(router.dismiss).toHaveBeenCalled();
  });
});
