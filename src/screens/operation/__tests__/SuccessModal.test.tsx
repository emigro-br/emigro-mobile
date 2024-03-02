import React from 'react';
import { Linking } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';

import { SuccessModal } from '../modals/SuccessModal';

describe.skip('SuccessModal', () => {
  it('renders correctly', () => {
    const { getByText, getByTestId } = render(
      <SuccessModal title="Transaction success!" isOpen onClose={jest.fn()} publicKey="publicKey" />,
    );
    expect(getByTestId('success-modal')).toBeTruthy();
    expect(getByText('Transaction successful!')).toBeTruthy();
  });

  it('calls onClose when the Close button is pressed', () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <SuccessModal title="Transaction success!" isOpen onClose={onClose} publicKey="publicKey" />,
    );
    fireEvent.press(getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('opens the Stellar explorer when the link is pressed', () => {
    const { getByText } = render(
      <SuccessModal title="Transaction success!" isOpen onClose={jest.fn()} publicKey="publicKey" />,
    );
    fireEvent.press(getByText('Stellar explorer'));
    // Here you should check that Linking.openURL has been called with the correct URL.
    expect(Linking.openURL).toHaveBeenCalledWith('https://stellar.expert/explorer/public/account/publicKey');
  });
});
