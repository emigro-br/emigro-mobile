import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { PinOnboarding } from '../pin';

describe('PinOnboarding', () => {
  it('should render correctly', () => {
    const { getByText, getByTestId } = render(<PinOnboarding />);

    expect(getByTestId('lock-icon')).toBeOnTheScreen();
    expect(getByText('Set up your mobile PIN')).toBeOnTheScreen();
    expect(
      getByText(
        'Protect your account with a PIN code. Your PIN is a 4-digit code that you will use to access your account and confirm your transactions.',
      ),
    ).toBeOnTheScreen();
    expect(getByText('Set up my PIN')).toBeOnTheScreen();
  });

  it('should navigate to ProfileTab with ConfigurePIN screen when "Set up my PIN" button is pressed', () => {
    const router = useRouter();
    const { getByText } = render(<PinOnboarding />);
    const button = getByText('Set up my PIN');

    fireEvent.press(button);

    expect(router.navigate).toHaveBeenCalledWith({
      pathname: '/settings/configure-pin',
      params: { backTo: '/' },
    });
  });
});
