import React from 'react';

import { fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { render } from 'test-utils';

import PaymentWaiting from '@/app/(auth)/(tabs)/payments/confirm/waiting';

describe('PaymentWaiting', () => {
  it('should render the component correctly', () => {
    const { getByText } = render(<PaymentWaiting />);
    expect(getByText('Processing Transaction')).toBeTruthy();
    expect(getByText('Understood')).toBeTruthy();
  });

  it('should call router.dismissAll() when the "Understood" button is clicked', () => {
    const router = useRouter();
    const { getByText } = render(<PaymentWaiting />);
    const button = getByText('Understood');
    fireEvent.press(button);
    expect(router.dismissAll).toHaveBeenCalled();
  });
});
