import React from 'react';

import { fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { render } from 'test-utils';

import TransferSuccess from '../success';

describe('PaymentSuccess', () => {
  it('should render the success message correctly', () => {
    const { getByText } = render(<TransferSuccess />);
    const title = getByText('Transaction Successful');
    expect(title).toBeOnTheScreen();
    const doneButton = getByText('Done');
    expect(doneButton).toBeOnTheScreen();
  });

  it('should call the onContinue function when the done button is pressed', () => {
    const router = useRouter();
    const { getByText } = render(<TransferSuccess />);
    const doneButton = getByText('Done');
    fireEvent.press(doneButton);
    expect(router.dismissAll).toHaveBeenCalled();
  });
});
